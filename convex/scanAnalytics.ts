// convex/scanAnalytics.ts
// Real-Time Scan Analytics - Entry tracking and statistics

import { v } from "convex/values";
import { query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

/**
 * Get real-time scan analytics for an event
 */
export const getEventScanAnalytics = query({
    args: {
        eventId: v.id("events"),
    },
    handler: async (ctx, args) => {
        // Get event details
        const event = await ctx.db.get(args.eventId);
        if (!event) {
            throw new Error("Event not found");
        }

        // Get all bookings for this event
        const bookings = await ctx.db
            .query("bookings")
            .withIndex("by_event_id", (q) => q.eq("eventId", args.eventId))
            .filter((q) => q.eq(q.field("status"), "confirmed"))
            .collect();

        // Calculate total tickets
        const totalTickets = bookings.reduce((sum, b) => {
            return sum + b.tickets.reduce((ticketSum, t) => ticketSum + t.quantity, 0);
        }, 0);

        // Count checked-in bookings
        const checkedInBookings = bookings.filter(b => b.isUsed);
        const checkedInCount = checkedInBookings.reduce((sum, b) => {
            return sum + b.tickets.reduce((ticketSum, t) => ticketSum + t.quantity, 0);
        }, 0);

        const pendingCount = totalTickets - checkedInCount;

        // Get all scans for this event
        const allScans = await ctx.db
            .query("ticketScans")
            .withIndex("by_event_id", (q) => q.eq("eventId", args.eventId))
            .collect();

        const validScans = allScans.filter(s => s.scanResult === "valid").length;
        const invalidScans = allScans.length - validScans;

        // Calculate entry rate (last hour)
        const oneHourAgo = Date.now() - (60 * 60 * 1000);
        const recentScans = allScans.filter(s =>
            s.scanResult === "valid" && s.scannedAt >= oneHourAgo
        );
        const entryRatePerHour = recentScans.length;

        // Breakdown by ticket type
        const ticketTypeBreakdown = event.ticketTypes.map(ticketType => {
            const typeBookings = bookings.filter(b =>
                b.tickets.some(t => t.ticketTypeId === ticketType.id)
            );

            const typeTotalTickets = typeBookings.reduce((sum, b) => {
                const typeTickets = b.tickets.find(t => t.ticketTypeId === ticketType.id);
                return sum + (typeTickets?.quantity || 0);
            }, 0);

            const typeCheckedIn = typeBookings.filter(b => b.isUsed).reduce((sum, b) => {
                const typeTickets = b.tickets.find(t => t.ticketTypeId === ticketType.id);
                return sum + (typeTickets?.quantity || 0);
            }, 0);

            return {
                ticketTypeId: ticketType.id,
                ticketTypeName: ticketType.name,
                total: typeTotalTickets,
                checkedIn: typeCheckedIn,
                pending: typeTotalTickets - typeCheckedIn,
                percentage: typeTotalTickets > 0 ? Math.round((typeCheckedIn / typeTotalTickets) * 100) : 0,
            };
        });

        // Scanner performance
        const scannerStats = await Promise.all(
            Array.from(new Set(allScans.map(s => s.scannerId))).map(async (scannerId) => {
                const scanner = await ctx.db.get(scannerId);
                const scannerScans = allScans.filter(s => s.scannerId === scannerId);
                const scannerValid = scannerScans.filter(s => s.scanResult === "valid").length;

                return {
                    scannerId,
                    scannerName: scanner?.staffName || "Unknown",
                    totalScans: scannerScans.length,
                    validScans: scannerValid,
                    invalidScans: scannerScans.length - scannerValid,
                    successRate: scannerScans.length > 0
                        ? Math.round((scannerValid / scannerScans.length) * 100)
                        : 0,
                };
            })
        );

        // Recent entries (last 10)
        const recentEntries = await Promise.all(
            allScans
                .filter(s => s.scanResult === "valid")
                .sort((a, b) => b.scannedAt - a.scannedAt)
                .slice(0, 10)
                .map(async (scan) => {
                    const booking = scan.bookingId ? await ctx.db.get(scan.bookingId) : null;
                    const scanner = scan.scannerId ? await ctx.db.get(scan.scannerId) : null;

                    let attendeeName = "Unknown";
                    if (booking?.userId) {
                        const user = await ctx.db.get(booking.userId);
                        attendeeName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim();
                    } else if (booking?.guestDetails) {
                        attendeeName = booking.guestDetails.name;
                    }

                    const ticketType = booking?.tickets[0]?.ticketTypeName || "Unknown";

                    return {
                        scanId: scan.scanId,
                        time: scan.scannedAt,
                        attendeeName,
                        ticketType,
                        scannerName: scanner?.staffName || "Unknown",
                        bookingNumber: booking?.bookingNumber,
                    };
                })
        );

        // Invalid scan breakdown
        const invalidScanReasons = {
            already_used: allScans.filter(s => s.scanResult === "already_used").length,
            wrong_event: allScans.filter(s => s.scanResult === "wrong_event").length,
            cancelled: allScans.filter(s => s.scanResult === "cancelled").length,
            refunded: allScans.filter(s => s.scanResult === "refunded").length,
            payment_pending: allScans.filter(s => s.scanResult === "payment_pending").length,
            invalid_qr: allScans.filter(s => s.scanResult === "invalid_qr").length,
            expired: allScans.filter(s => s.scanResult === "expired").length,
        };

        return {
            event: {
                eventId: event._id,
                title: event.title,
                dateTime: event.dateTime,
                venue: event.venue,
            },
            overview: {
                totalTickets,
                checkedIn: checkedInCount,
                pending: pendingCount,
                checkInPercentage: totalTickets > 0
                    ? Math.round((checkedInCount / totalTickets) * 100)
                    : 0,
            },
            scans: {
                total: allScans.length,
                valid: validScans,
                invalid: invalidScans,
                entryRatePerHour,
            },
            ticketTypeBreakdown,
            scannerStats,
            recentEntries,
            invalidScanReasons,
        };
    },
});

/**
 * Get scan timeline (hourly breakdown)
 */
export const getScanTimeline = query({
    args: {
        eventId: v.id("events"),
        hours: v.optional(v.number()), // Default 24 hours
    },
    handler: async (ctx, args) => {
        const hours = args.hours || 24;
        const now = Date.now();
        const startTime = now - (hours * 60 * 60 * 1000);

        // Get all valid scans in time range
        const scans = await ctx.db
            .query("ticketScans")
            .withIndex("by_event_id", (q) => q.eq("eventId", args.eventId))
            .filter((q) =>
                q.and(
                    q.eq(q.field("scanResult"), "valid"),
                    q.gte(q.field("scannedAt"), startTime)
                )
            )
            .collect();

        // Group by hour
        const hourlyData: { [key: string]: number } = {};

        for (let i = 0; i < hours; i++) {
            const hourStart = startTime + (i * 60 * 60 * 1000);
            const hourEnd = hourStart + (60 * 60 * 1000);
            const hourLabel = new Date(hourStart).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            });

            const hourScans = scans.filter(s =>
                s.scannedAt >= hourStart && s.scannedAt < hourEnd
            );

            hourlyData[hourLabel] = hourScans.length;
        }

        return {
            timeline: Object.entries(hourlyData).map(([hour, count]) => ({
                hour,
                count,
            })),
            totalScans: scans.length,
            peakHour: Object.entries(hourlyData).reduce((max, [hour, count]) =>
                count > (max.count || 0) ? { hour, count } : max
                , { hour: '', count: 0 }),
        };
    },
});

/**
 * Get scanner leaderboard
 */
export const getScannerLeaderboard = query({
    args: {
        eventId: v.id("events"),
    },
    handler: async (ctx, args) => {
        const scans = await ctx.db
            .query("ticketScans")
            .withIndex("by_event_id", (q) => q.eq("eventId", args.eventId))
            .collect();

        // Group by scanner
        const scannerMap = new Map();

        for (const scan of scans) {
            if (!scannerMap.has(scan.scannerId)) {
                const scanner = await ctx.db.get(scan.scannerId);
                scannerMap.set(scan.scannerId, {
                    scannerId: scan.scannerId,
                    scannerName: scanner?.staffName || "Unknown",
                    role: scanner?.role,
                    totalScans: 0,
                    validScans: 0,
                    invalidScans: 0,
                    avgScanTime: 0,
                });
            }

            const stats = scannerMap.get(scan.scannerId);
            stats.totalScans++;

            if (scan.scanResult === "valid") {
                stats.validScans++;
            } else {
                stats.invalidScans++;
            }
        }

        // Calculate success rates and sort
        const leaderboard = Array.from(scannerMap.values())
            .map(stats => ({
                ...stats,
                successRate: stats.totalScans > 0
                    ? Math.round((stats.validScans / stats.totalScans) * 100)
                    : 0,
            }))
            .sort((a, b) => b.validScans - a.validScans);

        return leaderboard;
    },
});

/**
 * Get fraud detection alerts
 */
export const getFraudAlerts = query({
    args: {
        eventId: v.id("events"),
    },
    handler: async (ctx, args) => {
        const alerts = [];

        // Get all scans
        const scans = await ctx.db
            .query("ticketScans")
            .withIndex("by_event_id", (q) => q.eq("eventId", args.eventId))
            .collect();

        // Check for duplicate scan attempts (same booking scanned multiple times)

        const bookingScans = new Map<Id<"bookings">, Doc<"ticketScans">[]>();
        for (const scan of scans) {
            if (scan.bookingId) {
                if (!bookingScans.has(scan.bookingId)) {
                    bookingScans.set(scan.bookingId, []);
                }
                bookingScans.get(scan.bookingId)!.push(scan);
            }
        }

        for (const [bookingId, bookingScansArray] of bookingScans.entries()) {
            const alreadyUsedScans = bookingScansArray.filter(s => s.scanResult === "already_used");

            if (alreadyUsedScans.length >= 3) {
                const booking = await ctx.db.get(bookingId) as Doc<"bookings"> | null;
                alerts.push({
                    type: "multiple_scan_attempts",
                    severity: "high",
                    message: `Booking ${booking?.bookingNumber} scanned ${alreadyUsedScans.length} times after first use`,
                    bookingId,
                    bookingNumber: booking?.bookingNumber,
                    attemptCount: alreadyUsedScans.length,
                });
            }
        }

        // Check for rapid scanning from same device (possible fraud)
        const deviceScans = new Map<string, Doc<"ticketScans">[]>();
        for (const scan of scans) {
            if (scan.deviceInfo?.deviceId) {
                if (!deviceScans.has(scan.deviceInfo.deviceId)) {
                    deviceScans.set(scan.deviceInfo.deviceId, []);
                }
                deviceScans.get(scan.deviceInfo.deviceId)!.push(scan);
            }
        }

        for (const [deviceId, deviceScansArray] of deviceScans.entries()) {
            // Check for > 10 scans in 1 minute
            const oneMinuteAgo = Date.now() - (60 * 1000);
            const recentScans = deviceScansArray.filter(s => s.scannedAt >= oneMinuteAgo);

            if (recentScans.length > 10) {
                const scanner = await ctx.db.get(recentScans[0].scannerId) as any;
                alerts.push({
                    type: "rapid_scanning",
                    severity: "medium",
                    message: `${scanner?.staffName} scanned ${recentScans.length} tickets in 1 minute`,
                    scannerId: recentScans[0].scannerId,
                    scannerName: scanner?.staffName,
                    scanCount: recentScans.length,
                });
            }
        }

        return alerts;
    },
});

/**
 * Export scan data for reporting
 */
export const exportScanData = query({
    args: {
        eventId: v.id("events"),
        format: v.optional(v.union(v.literal("json"), v.literal("csv"))),
    },
    handler: async (ctx, args) => {
        const scans = await ctx.db
            .query("ticketScans")
            .withIndex("by_event_id", (q) => q.eq("eventId", args.eventId))
            .collect();

        // Enrich scan data
        const enrichedScans = await Promise.all(
            scans.map(async (scan) => {
                const booking = scan.bookingId ? await ctx.db.get(scan.bookingId) : null;
                const scanner = scan.scannerId ? await ctx.db.get(scan.scannerId) : null;

                let attendeeName = "Unknown";
                let attendeeEmail = "";
                if (booking?.userId) {
                    const user = await ctx.db.get(booking.userId);
                    attendeeName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim();
                    attendeeEmail = user?.email || "";
                } else if (booking?.guestDetails) {
                    attendeeName = booking.guestDetails.name;
                    attendeeEmail = booking.guestDetails.email;
                }

                return {
                    scanId: scan.scanId,
                    scanTime: new Date(scan.scannedAt).toISOString(),
                    scanResult: scan.scanResult,
                    bookingNumber: booking?.bookingNumber,
                    attendeeName,
                    attendeeEmail,
                    ticketType: booking?.tickets[0]?.ticketTypeName,
                    scannerName: scanner?.staffName,
                    wasOverridden: scan.wasOverridden,
                    overrideReason: scan.overrideReason,
                };
            })
        );

        return {
            data: enrichedScans,
            totalRecords: enrichedScans.length,
            exportedAt: Date.now(),
        };
    },
});
