// convex/verification.ts
// Ticket Verification System - QR Code Scanning & Entry Management

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Helper for SHA-256 hashing using Web Crypto API
async function sha256(message: string) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate unique scan ID
 */
function generateScanId(): string {
    const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `SCAN-${date}-${random}`;
}

/**
 * Generate QR code hash for validation
 */
async function generateQRHash(bookingId: string, eventId: string): Promise<string> {
    const data = `${bookingId}:${eventId}:${Date.now()}`;
    return await sha256(data);
}

/**
 * Verify QR code signature
 */
async function verifyQRSignature(qrData: string, signature: string): Promise<boolean> {
    // In production, use proper cryptographic signature verification
    // For now, we'll do basic validation
    const expectedHash = await sha256(qrData);
    return expectedHash.substring(0, 16) === signature.substring(0, 16);
}

/**
 * MAIN VERIFICATION FUNCTION
 * Scan and validate a ticket QR code
 */
export const verifyTicket = mutation({
    args: {
        qrData: v.string(),
        scannerId: v.id("verificationStaff"),
        scanLocation: v.optional(v.object({
            latitude: v.number(),
            longitude: v.number(),
        })),
        deviceInfo: v.optional(v.object({
            userAgent: v.string(),
            deviceId: v.string(),
        })),
    },
    handler: async (ctx, args) => {
        console.log("🎫 Starting ticket verification...");

        // 1. Verify scanner is active
        const scanner = await ctx.db.get(args.scannerId);
        if (!scanner || !scanner.isActive) {
            throw new Error("Scanner account is inactive or not found");
        }

        // 2. Parse QR data
        let qrPayload;
        try {
            qrPayload = JSON.parse(args.qrData);
        } catch (error) {
            // Invalid QR format
            const scanId = generateScanId();
            await ctx.db.insert("ticketScans", {
                scanId,
                bookingId: undefined, // Optional in schema
                eventId: undefined,   // Optional in schema
                scannerId: args.scannerId,
                scanResult: "invalid_qr",
                qrData: args.qrData,
                qrHash: "",
                scanLocation: args.scanLocation,
                deviceInfo: args.deviceInfo,
                wasOverridden: false,
                scannedAt: Date.now(),
            });

            return {
                success: false,
                result: "invalid_qr",
                message: "Invalid QR code format. Please ensure you're scanning a valid ticket.",
                scanId,
            };
        }

        const { bookingId, eventId, hash, signature, timestamp } = qrPayload;

        // 1.5 Verify scanner is assigned to this event
        if (scanner.eventId && scanner.eventId !== eventId) {
            const assignedEvent = await ctx.db.get(scanner.eventId);
            return {
                success: false,
                result: "wrong_event",
                message: `You are only authorized to scan for "${assignedEvent?.title}". This ticket is for a different event.`,
            };
        }

        // 3. Verify QR signature
        if (!await verifyQRSignature(args.qrData, signature)) {
            const scanId = generateScanId();
            await ctx.db.insert("ticketScans", {
                scanId,
                bookingId: bookingId as Id<"bookings">,
                eventId: eventId as Id<"events">,
                scannerId: args.scannerId,
                scanResult: "invalid_qr",
                qrData: args.qrData,
                qrHash: hash,
                scanLocation: args.scanLocation,
                deviceInfo: args.deviceInfo,
                wasOverridden: false,
                scannedAt: Date.now(),
            });

            return {
                success: false,
                result: "invalid_qr",
                message: "QR code signature invalid. Possible tampering detected.",
                scanId,
            };
        }

        // 4. Check if QR is too old (prevent replay attacks)
        const qrAge = Date.now() - timestamp;
        const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
        if (qrAge > maxAge) {
            const scanId = generateScanId();
            await ctx.db.insert("ticketScans", {
                scanId,
                bookingId: bookingId as Id<"bookings">,
                eventId: eventId as Id<"events">,
                scannerId: args.scannerId,
                scanResult: "expired",
                qrData: args.qrData,
                qrHash: hash,
                scanLocation: args.scanLocation,
                deviceInfo: args.deviceInfo,
                wasOverridden: false,
                scannedAt: Date.now(),
            });

            return {
                success: false,
                result: "expired",
                message: "This QR code has expired. Please contact support.",
                scanId,
            };
        }

        // 5. Get booking details
        const booking = await ctx.db.get(bookingId as Id<"bookings">);
        if (!booking) {
            const scanId = generateScanId();
            await ctx.db.insert("ticketScans", {
                scanId,
                bookingId: bookingId as Id<"bookings">,
                eventId: eventId as Id<"events">,
                scannerId: args.scannerId,
                scanResult: "invalid_qr",
                qrData: args.qrData,
                qrHash: hash,
                scanLocation: args.scanLocation,
                deviceInfo: args.deviceInfo,
                wasOverridden: false,
                scannedAt: Date.now(),
            });

            return {
                success: false,
                result: "invalid_qr",
                message: "Booking not found in system.",
                scanId,
            };
        }

        // 6. Verify event matches
        if (booking.eventId !== eventId) {
            const scanId = generateScanId();
            await ctx.db.insert("ticketScans", {
                scanId,
                bookingId: booking._id,
                eventId: booking.eventId,
                scannerId: args.scannerId,
                scanResult: "wrong_event",
                qrData: args.qrData,
                qrHash: hash,
                scanLocation: args.scanLocation,
                deviceInfo: args.deviceInfo,
                wasOverridden: false,
                scannedAt: Date.now(),
            });

            const event = await ctx.db.get(booking.eventId);
            return {
                success: false,
                result: "wrong_event",
                message: `This ticket is for "${event?.title || 'another event'}", not this event.`,
                scanId,
                correctEvent: event?.title,
            };
        }

        // 7. Check payment status
        const payment = await ctx.db.get(booking.paymentId);
        if (!payment || payment.status !== "captured") {
            const scanId = generateScanId();
            await ctx.db.insert("ticketScans", {
                scanId,
                bookingId: booking._id,
                eventId: booking.eventId,
                scannerId: args.scannerId,
                scanResult: "payment_pending",
                qrData: args.qrData,
                qrHash: hash,
                scanLocation: args.scanLocation,
                deviceInfo: args.deviceInfo,
                wasOverridden: false,
                scannedAt: Date.now(),
            });

            return {
                success: false,
                result: "payment_pending",
                message: "Payment not confirmed. Please complete payment first.",
                scanId,
            };
        }

        // 8. Check if booking is cancelled
        if (booking.status === "cancelled") {
            const scanId = generateScanId();
            await ctx.db.insert("ticketScans", {
                scanId,
                bookingId: booking._id,
                eventId: booking.eventId,
                scannerId: args.scannerId,
                scanResult: "cancelled",
                qrData: args.qrData,
                qrHash: hash,
                scanLocation: args.scanLocation,
                deviceInfo: args.deviceInfo,
                wasOverridden: false,
                scannedAt: Date.now(),
            });

            return {
                success: false,
                result: "cancelled",
                message: "This booking has been cancelled.",
                scanId,
            };
        }

        // 9. Check if booking is refunded
        if (booking.status === "refunded") {
            const scanId = generateScanId();
            await ctx.db.insert("ticketScans", {
                scanId,
                bookingId: booking._id,
                eventId: booking.eventId,
                scannerId: args.scannerId,
                scanResult: "refunded",
                qrData: args.qrData,
                qrHash: hash,
                scanLocation: args.scanLocation,
                deviceInfo: args.deviceInfo,
                wasOverridden: false,
                scannedAt: Date.now(),
            });

            return {
                success: false,
                result: "refunded",
                message: "This booking has been refunded.",
                scanId,
            };
        }

        // 10. Check if already used
        if (booking.isUsed) {
            const scanId = generateScanId();
            await ctx.db.insert("ticketScans", {
                scanId,
                bookingId: booking._id,
                eventId: booking.eventId,
                scannerId: args.scannerId,
                scanResult: "already_used",
                qrData: args.qrData,
                qrHash: hash,
                scanLocation: args.scanLocation,
                deviceInfo: args.deviceInfo,
                wasOverridden: false,
                scannedAt: Date.now(),
            });

            // Find when it was first used
            const firstScan = await ctx.db
                .query("ticketScans")
                .withIndex("by_booking_id", (q) => q.eq("bookingId", booking._id))
                .filter((q) => q.eq(q.field("scanResult"), "valid"))
                .first();

            return {
                success: false,
                result: "already_used",
                message: "This ticket has already been used for entry.",
                scanId,
                firstUsedAt: booking.usedAt,
                firstScanId: firstScan?.scanId,
            };
        }

        // 11. ALL CHECKS PASSED - GRANT ENTRY
        const scanId = generateScanId();

        // Mark booking as used
        await ctx.db.patch(booking._id, {
            isUsed: true,
            usedAt: Date.now(),
        });

        // Log successful scan
        await ctx.db.insert("ticketScans", {
            scanId,
            bookingId: booking._id,
            eventId: booking.eventId,
            scannerId: args.scannerId,
            scanResult: "valid",
            qrData: args.qrData,
            qrHash: hash,
            scanLocation: args.scanLocation,
            deviceInfo: args.deviceInfo,
            wasOverridden: false,
            scannedAt: Date.now(),
        });

        // Get attendee details
        let attendeeDetails;
        if (booking.userId) {
            const user = await ctx.db.get(booking.userId);
            attendeeDetails = {
                name: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
                email: user?.email,
                phone: user?.phone,
            };
        } else if (booking.guestDetails) {
            attendeeDetails = booking.guestDetails;
        }

        // Get event details
        const event = await ctx.db.get(booking.eventId);

        console.log("✅ Ticket verified successfully!");

        return {
            success: true,
            result: "valid",
            message: "Entry granted! Welcome to the event.",
            scanId,
            booking: {
                bookingNumber: booking.bookingNumber,
                tickets: booking.tickets,
                totalAmount: booking.totalAmount,
                customFieldResponses: booking.customFieldResponses,
            },
            attendee: attendeeDetails,
            event: {
                id: event?._id,
                title: event?.title,
                dateTime: event?.dateTime,
            },
            scannedAt: Date.now(),
        };
    },
});

/**
 * Override a scan result (for managers/admins)
 * Allows entry even if ticket was already used
 */
export const overrideScan = mutation({
    args: {
        scanId: v.string(),
        overrideReason: v.string(),
        overriddenBy: v.id("verificationStaff"),
    },
    handler: async (ctx, args) => {
        // Verify overrider has permission
        const staff = await ctx.db.get(args.overriddenBy);
        if (!staff || !staff.permissions.canOverrideScans) {
            throw new Error("You don't have permission to override scans");
        }

        // Find the scan
        const scan = await ctx.db
            .query("ticketScans")
            .filter((q) => q.eq(q.field("scanId"), args.scanId))
            .first();

        if (!scan) {
            throw new Error("Scan not found");
        }

        if (!scan.bookingId) {
            throw new Error("Cannot override a scan without a valid booking");
        }

        // Update scan to mark as overridden
        await ctx.db.patch(scan._id, {
            wasOverridden: true,
            overrideReason: args.overrideReason,
            overriddenBy: args.overriddenBy,
        });

        // Mark booking as used
        await ctx.db.patch(scan.bookingId, {
            isUsed: true,
            usedAt: Date.now(),
        });

        // Create new valid scan
        const newScanId = generateScanId();
        await ctx.db.insert("ticketScans", {
            scanId: newScanId,
            bookingId: scan.bookingId,
            eventId: scan.eventId,
            scannerId: args.overriddenBy,
            scanResult: "valid",
            qrData: scan.qrData,
            qrHash: scan.qrHash,
            wasOverridden: true,
            overrideReason: args.overrideReason,
            overriddenBy: args.overriddenBy,
            scannedAt: Date.now(),
        });

        return {
            success: true,
            message: "Entry granted via override",
            newScanId,
        };
    },
});

/**
 * Get scan history for an event
 */
export const getScanHistory = query({
    args: {
        eventId: v.id("events"),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const limit = args.limit || 50;

        const scans = await ctx.db
            .query("ticketScans")
            .withIndex("by_event_id", (q) => q.eq("eventId", args.eventId))
            .order("desc")
            .take(limit);

        // Enrich with booking and scanner details
        const enrichedScans = await Promise.all(
            scans.map(async (scan) => {
                const booking = scan.bookingId ? await ctx.db.get(scan.bookingId) : null;
                const scanner = await ctx.db.get(scan.scannerId);

                let attendeeName = "Unknown";
                if (booking?.userId) {
                    const user = await ctx.db.get(booking.userId);
                    attendeeName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim();
                } else if (booking?.guestDetails) {
                    attendeeName = booking.guestDetails.name;
                }

                return {
                    ...scan,
                    bookingNumber: booking?.bookingNumber,
                    attendeeName,
                    scannerName: scanner?.staffName,
                    ticketTypes: booking?.tickets.map(t => t.ticketTypeName).join(", "),
                };
            })
        );

        return enrichedScans;
    },
});

/**
 * Generate QR code data for a booking
 */
export const generateQRCodeData = mutation({
    args: {
        bookingId: v.id("bookings"),
    },
    handler: async (ctx, args) => {
        const booking = await ctx.db.get(args.bookingId);
        if (!booking) {
            throw new Error("Booking not found");
        }

        const hash = await generateQRHash(args.bookingId, booking.eventId);
        const timestamp = Date.now();
        const signatureHash = await sha256(`${args.bookingId}:${booking.eventId}:${timestamp}`);

        const qrData = {
            bookingId: args.bookingId,
            eventId: booking.eventId,
            hash,
            timestamp,
            signature: signatureHash.substring(0, 16),
        };

        const qrString = JSON.stringify(qrData);

        // Update booking with QR code
        await ctx.db.patch(args.bookingId, {
            qrCode: qrString,
        });

        return {
            qrData: qrString,
            qrHash: hash,
        };
    },
});
