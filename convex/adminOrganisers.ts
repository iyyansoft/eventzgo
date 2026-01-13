import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Helper to validate NextAuth session for Admin
async function validateAdminSession(ctx: any, sessionToken: string) {
    if (!sessionToken) throw new Error("Unauthorized: No session token provided");

    const session = await ctx.db
        .query("sessions")
        .withIndex("by_session_token", (q: any) => q.eq("sessionToken", sessionToken))
        .first();

    if (!session) throw new Error("Unauthorized: Invalid session");
    if (!session.isActive) throw new Error("Unauthorized: Inactive session");
    if (session.expiresAt < Date.now()) throw new Error("Unauthorized: Session expired");

    const user = await ctx.db.get(session.userId);
    if (!user) throw new Error("Unauthorized: User not found");

    // Check for admin role
    if (user.role !== "admin") {
        throw new Error("Unauthorized: Admin role required");
    }
    return user;
}

// Get all organisers with filtering
export const getAllOrganisers = query({
    args: {
        sessionToken: v.string(), // Authentication
        status: v.optional(v.string()), // "active", "pending_approval", "suspended", "all"
        search: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        await validateAdminSession(ctx, args.sessionToken);

        let organisers = await ctx.db.query("organisers").collect();

        // Filter by status if provided and not "all"
        if (args.status && args.status !== "all") {
            organisers = organisers.filter(org => {
                if (args.status === "pending_approval") return org.accountStatus === "pending_approval";
                if (args.status === "active") return org.accountStatus === "active";
                if (args.status === "suspended") return org.accountStatus === "suspended" || org.accountStatus === "blocked";
                return true;
            });
        }

        // Filter by search
        if (args.search) {
            const searchLower = args.search.toLowerCase();
            organisers = organisers.filter(org =>
                (org.institutionName && org.institutionName.toLowerCase().includes(searchLower)) ||
                (org.email && org.email.toLowerCase().includes(searchLower)) ||
                (org.contactPerson && org.contactPerson.toLowerCase().includes(searchLower))
            );
        }

        // Sort by created at desc
        return organisers.sort((a, b) => b.createdAt - a.createdAt);
    },
});

export const getOrganiserDetails = query({
    args: {
        sessionToken: v.string(),
        organiserId: v.id("organisers")
    },
    handler: async (ctx, args) => {
        await validateAdminSession(ctx, args.sessionToken);

        const organiser = await ctx.db.get(args.organiserId);
        if (!organiser) throw new Error("Organiser not found");
        return organiser;
    },
});

export const getOrganiserEvents = query({
    args: {
        sessionToken: v.string(),
        organiserId: v.id("organisers")
    },
    handler: async (ctx, args) => {
        await validateAdminSession(ctx, args.sessionToken);

        const events = await ctx.db
            .query("events")
            .withIndex("by_organiser_id", (q) => q.eq("organiserId", args.organiserId))
            .collect();
        return events;
    },
});

export const updatePlatformFee = mutation({
    args: {
        sessionToken: v.string(),
        organiserId: v.id("organisers"),
        percentage: v.number(),
        reason: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const adminUser = await validateAdminSession(ctx, args.sessionToken);

        const organiser = await ctx.db.get(args.organiserId);
        if (!organiser) throw new Error("Organiser not found");

        const oldFee = organiser.platformFeePercentage || 10;

        // Update organiser
        await ctx.db.patch(args.organiserId, {
            platformFeePercentage: args.percentage,
            customPlatformFee: true,
            platformFeeUpdatedAt: Date.now(),
            platformFeeUpdatedBy: adminUser._id,
        });

        // Record history
        await ctx.db.insert("platformFeeHistory", {
            organiserId: args.organiserId,
            oldFee,
            newFee: args.percentage,
            changedBy: adminUser._id,
            changedAt: Date.now(),
            reason: args.reason,
        });

        return { success: true };
    },
});

// Get platform fee history
export const getPlatformFeeHistory = query({
    args: {
        sessionToken: v.string(),
        organiserId: v.id("organisers")
    },
    handler: async (ctx, args) => {
        await validateAdminSession(ctx, args.sessionToken);

        const history = await ctx.db
            .query("platformFeeHistory")
            .withIndex("by_organiser_id", (q) => q.eq("organiserId", args.organiserId))
            .order("desc")
            .collect();
        return history;
    },
});

export const getOrganiserFinancialSummary = query({
    args: {
        sessionToken: v.string(),
        organiserId: v.id("organisers")
    },
    handler: async (ctx, args) => {
        await validateAdminSession(ctx, args.sessionToken);

        // 1. Get all events
        const events = await ctx.db
            .query("events")
            .withIndex("by_organiser_id", (q) => q.eq("organiserId", args.organiserId))
            .collect();

        let totalTicketsSold = 0;
        let totalRevenue = 0;
        let totalPlatformFee = 0;
        let totalGST = 0;

        const eventWiseData = [];

        // 2. Iterate events to sum bookings
        for (const event of events) {
            const bookings = await ctx.db
                .query("bookings")
                .withIndex("by_event_id", (q) => q.eq("eventId", event._id))
                .filter(q => q.eq(q.field("status"), "confirmed"))
                .collect();

            let eventRevenue = 0;
            let eventPlatformFee = 0;
            let eventGST = 0;
            let eventTickets = 0;

            for (const booking of bookings) {
                // Use pricing object if available, otherwise fallback or 0
                const pricing = booking.pricing || {
                    total: booking.totalAmount || 0,
                    platformFee: 0,
                    gst: 0,
                    subtotal: booking.totalAmount || 0
                };

                eventRevenue += pricing.total;
                eventPlatformFee += pricing.platformFee;
                eventGST += pricing.gst;

                const ticketsCount = booking.tickets.reduce((sum, t) => sum + t.quantity, 0);
                eventTickets += ticketsCount;
            }

            totalRevenue += eventRevenue;
            totalPlatformFee += eventPlatformFee;
            totalGST += eventGST;
            totalTicketsSold += eventTickets;

            eventWiseData.push({
                eventId: event._id,
                title: event.title,
                date: event.dateTime.start,
                status: event.status,
                ticketsSold: eventTickets,
                revenue: eventRevenue,
                platformFee: eventPlatformFee,
                gst: eventGST,
                net: eventRevenue - eventPlatformFee - eventGST
            });
        }

        return {
            lifetime: {
                totalTicketsSold,
                totalRevenue,
                totalPlatformFee,
                totalGST,
                netEarnings: totalRevenue - totalPlatformFee - totalGST
            },
            events: eventWiseData.sort((a, b) => b.date - a.date)
        };
    }
});

export const getPayoutRequests = query({
    args: {
        sessionToken: v.string(),
        organiserId: v.id("organisers")
    },
    handler: async (ctx, args) => {
        await validateAdminSession(ctx, args.sessionToken);

        const requests = await ctx.db
            .query("payoutRequests")
            .withIndex("by_organiser_id", (q) => q.eq("organiserId", args.organiserId))
            .order("desc")
            .collect();

        // Enrich with event titles if eventId is present
        const enrichedRequests = await Promise.all(
            requests.map(async (req) => {
                let eventTitle = "General (Account Level)";
                if (req.eventId) {
                    const event = await ctx.db.get(req.eventId);
                    if (event) eventTitle = event.title;
                }
                return { ...req, eventTitle };
            })
        );

        return enrichedRequests;
    }
});

export const approvePayout = mutation({
    args: {
        sessionToken: v.string(),
        payoutId: v.id("payoutRequests"),
        paymentProof: v.optional(v.string()),
        notes: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const adminUser = await validateAdminSession(ctx, args.sessionToken);

        const payout = await ctx.db.get(args.payoutId);
        if (!payout) throw new Error("Payout not found");

        await ctx.db.patch(args.payoutId, {
            status: "paid",
            processedAt: Date.now(),
            processedBy: adminUser._id, // Using adminUser (organiser table) ID
            paymentProof: args.paymentProof,
            notes: args.notes || payout.notes,
        });

        // Log transaction
        await ctx.db.insert("financialTransactions", {
            transactionId: `PAYOUT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
            organiserId: payout.organiserId,
            eventId: payout.eventId,
            bookingId: undefined,
            type: "payout",
            amount: payout.breakdown.netPayable,
            currency: "INR",
            breakdown: {
                ticketAmount: payout.breakdown.totalRevenue,
                platformFee: payout.breakdown.platformFee,
                gst: payout.breakdown.gst,
                paymentGatewayFee: payout.breakdown.gatewayFees,
                netToOrganiser: payout.breakdown.netPayable,
            },
            status: "completed",
            description: `Payout Approved (Ref: ${payout._id})`,
            createdAt: Date.now(),
            completedAt: Date.now(),
        });
    },
});

export const rejectPayout = mutation({
    args: {
        sessionToken: v.string(),
        payoutId: v.id("payoutRequests"),
        reason: v.string(),
    },
    handler: async (ctx, args) => {
        const adminUser = await validateAdminSession(ctx, args.sessionToken);

        await ctx.db.patch(args.payoutId, {
            status: "rejected",
            processedAt: Date.now(),
            processedBy: adminUser._id,
            rejectionReason: args.reason,
        });
    },
});

export const getDashboardStats = query({
    args: {
        sessionToken: v.string(),
    },
    handler: async (ctx, args) => {
        await validateAdminSession(ctx, args.sessionToken);

        const pendingOrganisers = await ctx.db
            .query("organisers")
            .filter((q) => q.eq(q.field("accountStatus"), "pending_approval"))
            .collect();

        const pendingPayouts = await ctx.db
            .query("payoutRequests")
            .withIndex("by_status", (q) => q.eq("status", "pending"))
            .collect();

        return {
            pendingOrganisersCount: pendingOrganisers.length,
            pendingPayoutsCount: pendingPayouts.length
        };
    }
});

export const getAllPayoutRequests = query({
    args: {
        sessionToken: v.string(),
    },
    handler: async (ctx, args) => {
        await validateAdminSession(ctx, args.sessionToken);

        const requests = await ctx.db
            .query("payoutRequests")
            .order("desc")
            .collect();

        // Enrich with organiser name
        const enriched = await Promise.all(requests.map(async (req) => {
            const organiser = await ctx.db.get(req.organiserId);
            const event = req.eventId ? await ctx.db.get(req.eventId) : null;
            return {
                ...req,
                organiserName: organiser?.institutionName || "Unknown",
                eventTitle: event?.title || "N/A",
            };
        }));

        return enriched;
    }
});

export const approveOrganiser = mutation({
    args: {
        sessionToken: v.string(),
        organiserId: v.id("organisers"),
    },
    handler: async (ctx, args) => {
        const adminUser = await validateAdminSession(ctx, args.sessionToken);

        await ctx.db.patch(args.organiserId, {
            approvalStatus: "approved",
            accountStatus: "active",
            approvedBy: adminUser._id as any,
            approvedAt: Date.now(),
            updatedAt: Date.now(),
        });
        return { success: true };
    }
});

export const rejectOrganiser = mutation({
    args: {
        sessionToken: v.string(),
        organiserId: v.id("organisers"),
        reason: v.string(),
    },
    handler: async (ctx, args) => {
        const adminUser = await validateAdminSession(ctx, args.sessionToken);

        await ctx.db.patch(args.organiserId, {
            approvalStatus: "rejected",
            // accountStatus: "suspended"? Or stay as pending approval but marked as rejected?
            // Usually we mark as blocked or suspended. Or keep custom status
            accountStatus: "pending_setup", // Reset to setup or similar?
            rejectionReason: args.reason,
            approvedBy: adminUser._id as any,
            approvedAt: Date.now(),
            updatedAt: Date.now(),
        });
        return { success: true };
    }
});
