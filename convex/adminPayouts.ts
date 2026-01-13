import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * ADMIN PAYOUT MANAGEMENT
 * Admin-specific queries and mutations for payout approval and processing
 */

// Helper to validate admin session (reuse from adminOrganisers.ts)
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

    if (user.role !== "admin") {
        throw new Error("Unauthorized: Admin role required");
    }
    return user;
}

// ============================================================================
// ADMIN QUERIES
// ============================================================================

/**
 * Get all payout requests (Admin view)
 */
export const getAllPayoutRequests = query({
    args: {
        sessionToken: v.string(),
        status: v.optional(v.string()),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        await validateAdminSession(ctx, args.sessionToken);

        let requests = await ctx.db
            .query("payoutRequests")
            .order("desc")
            .collect();

        // Filter by status
        if (args.status && args.status !== "all") {
            requests = requests.filter((r) => r.status === args.status);
        }

        // Apply limit
        if (args.limit) {
            requests = requests.slice(0, args.limit);
        }

        // Enrich with organiser and event details
        const enriched = await Promise.all(
            requests.map(async (req) => {
                const organiser = await ctx.db.get(req.organiserId);
                let eventTitle = "Account-wide";
                if (req.eventId) {
                    const event = await ctx.db.get(req.eventId);
                    if (event) eventTitle = event.title;
                }

                return {
                    ...req,
                    organiserName: organiser?.institutionName || "Unknown",
                    organiserEmail: organiser?.email,
                    eventTitle,
                };
            })
        );

        return enriched;
    },
});

/**
 * Get payout dashboard stats
 */
export const getPayoutDashboardStats = query({
    args: {
        sessionToken: v.string(),
    },
    handler: async (ctx, args) => {
        await validateAdminSession(ctx, args.sessionToken);

        const allRequests = await ctx.db.query("payoutRequests").collect();

        const pending = allRequests.filter((r) => r.status === "pending");
        const underReview = allRequests.filter((r) => r.status === "under_review");
        const approved = allRequests.filter((r) => r.status === "approved");
        const processing = allRequests.filter((r) => r.status === "processing");
        const paid = allRequests.filter((r) => r.status === "paid");
        const failed = allRequests.filter((r) => r.status === "failed");

        const pendingAmount = pending.reduce((sum, r) => sum + r.eligibleAmount, 0);
        const underReviewAmount = underReview.reduce((sum, r) => sum + r.eligibleAmount, 0);
        const todayPaid = paid.filter(
            (r) => r.processedAt && r.processedAt > Date.now() - 24 * 60 * 60 * 1000
        );
        const todayAmount = todayPaid.reduce((sum, r) => sum + r.eligibleAmount, 0);

        // Monthly stats
        const monthStart = new Date();
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);
        const monthlyPaid = paid.filter(
            (r) => r.processedAt && r.processedAt > monthStart.getTime()
        );
        const monthlyAmount = monthlyPaid.reduce((sum, r) => sum + r.eligibleAmount, 0);

        return {
            counts: {
                pending: pending.length,
                underReview: underReview.length,
                approved: approved.length,
                processing: processing.length,
                paid: paid.length,
                failed: failed.length,
            },
            amounts: {
                pending: pendingAmount,
                underReview: underReviewAmount,
                todayPaid: todayAmount,
                monthlyPaid: monthlyAmount,
            },
            recentRequests: allRequests
                .sort((a, b) => b.requestedAt - a.requestedAt)
                .slice(0, 10),
        };
    },
});

/**
 * Get high-value payout requests (> ₹50k)
 */
export const getHighValuePayouts = query({
    args: {
        sessionToken: v.string(),
    },
    handler: async (ctx, args) => {
        await validateAdminSession(ctx, args.sessionToken);

        const requests = await ctx.db
            .query("payoutRequests")
            .filter((q) =>
                q.and(
                    q.gte(q.field("eligibleAmount"), 50000),
                    q.or(
                        q.eq(q.field("status"), "pending"),
                        q.eq(q.field("status"), "under_review")
                    )
                )
            )
            .collect();

        // Enrich with organiser details
        const enriched = await Promise.all(
            requests.map(async (req) => {
                const organiser = await ctx.db.get(req.organiserId);
                return {
                    ...req,
                    organiserName: organiser?.institutionName || "Unknown",
                    organiserEmail: organiser?.email,
                };
            })
        );

        return enriched.sort((a, b) => b.eligibleAmount - a.eligibleAmount);
    },
});

// ============================================================================
// ADMIN MUTATIONS
// ============================================================================

/**
 * Approve payout request
 */
export const approvePayout = mutation({
    args: {
        sessionToken: v.string(),
        payoutId: v.id("payoutRequests"),
        notes: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const admin = await validateAdminSession(ctx, args.sessionToken);

        const payout = await ctx.db.get(args.payoutId);
        if (!payout) {
            throw new Error("Payout request not found");
        }

        if (payout.status !== "under_review" && payout.status !== "pending") {
            throw new Error(`Cannot approve payout in status: ${payout.status}`);
        }

        const now = Date.now();
        await ctx.db.patch(args.payoutId, {
            status: "approved",
            reviewedBy: admin._id as any,
            reviewedAt: now,
            approvalNotes: args.notes,
            updatedAt: now,
        });

        return { success: true };
    },
});

/**
 * Reject payout request
 */
export const rejectPayout = mutation({
    args: {
        sessionToken: v.string(),
        payoutId: v.id("payoutRequests"),
        reason: v.string(),
    },
    handler: async (ctx, args) => {
        const admin = await validateAdminSession(ctx, args.sessionToken);

        const payout = await ctx.db.get(args.payoutId);
        if (!payout) {
            throw new Error("Payout request not found");
        }

        if (payout.status !== "under_review" && payout.status !== "pending") {
            throw new Error(`Cannot reject payout in status: ${payout.status}`);
        }

        const now = Date.now();
        await ctx.db.patch(args.payoutId, {
            status: "rejected",
            reviewedBy: admin._id as any,
            reviewedAt: now,
            rejectionReason: args.reason,
            updatedAt: now,
        });

        return { success: true };
    },
});

/**
 * Mark payout as processing
 */
export const markPayoutProcessing = mutation({
    args: {
        sessionToken: v.string(),
        payoutId: v.id("payoutRequests"),
        paymentMethod: v.union(
            v.literal("NEFT"),
            v.literal("RTGS"),
            v.literal("IMPS"),
            v.literal("UPI")
        ),
    },
    handler: async (ctx, args) => {
        const admin = await validateAdminSession(ctx, args.sessionToken);

        const payout = await ctx.db.get(args.payoutId);
        if (!payout) {
            throw new Error("Payout request not found");
        }

        if (payout.status !== "approved") {
            throw new Error(`Cannot process payout in status: ${payout.status}`);
        }

        await ctx.db.patch(args.payoutId, {
            status: "processing",
            paymentMethod: args.paymentMethod,
            processedBy: admin._id as any,
            updatedAt: Date.now(),
        });

        return { success: true };
    },
});

/**
 * Mark payout as paid (with UTR)
 */
export const markPayoutPaid = mutation({
    args: {
        sessionToken: v.string(),
        payoutId: v.id("payoutRequests"),
        utrNumber: v.string(),
        paymentProof: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const admin = await validateAdminSession(ctx, args.sessionToken);

        const payout = await ctx.db.get(args.payoutId);
        if (!payout) {
            throw new Error("Payout request not found");
        }

        if (payout.status !== "processing" && payout.status !== "approved") {
            throw new Error(`Cannot mark as paid in status: ${payout.status}`);
        }

        const now = Date.now();
        await ctx.db.patch(args.payoutId, {
            status: "paid",
            utrNumber: args.utrNumber,
            paymentProof: args.paymentProof,
            processedBy: admin._id as any,
            processedAt: now,
            updatedAt: now,
        });

        // Create financial transaction record
        await ctx.db.insert("financialTransactions", {
            transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: "payout",
            eventId: payout.eventId || payout.organiserId as any, // Fallback if no event
            organiserId: payout.organiserId,
            amount: payout.eligibleAmount,
            currency: "INR",
            breakdown: {
                ticketAmount: payout.breakdown.totalRevenue,
                platformFee: payout.breakdown.platformFee,
                gst: payout.breakdown.gst,
                paymentGatewayFee: payout.breakdown.gatewayFees,
                netToOrganiser: payout.breakdown.netPayable,
            },
            status: "completed",
            createdAt: now,
            completedAt: now,
            description: `Payout to ${payout.bankDetails.accountHolderName} - ${args.utrNumber}`,
        });

        return { success: true };
    },
});

/**
 * Bulk approve payouts
 */
export const bulkApprovePayout = mutation({
    args: {
        sessionToken: v.string(),
        payoutIds: v.array(v.id("payoutRequests")),
        notes: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const admin = await validateAdminSession(ctx, args.sessionToken);

        const results = [];
        for (const payoutId of args.payoutIds) {
            try {
                const payout = await ctx.db.get(payoutId);
                if (!payout) continue;

                if (payout.status === "under_review" || payout.status === "pending") {
                    const now = Date.now();
                    await ctx.db.patch(payoutId, {
                        status: "approved",
                        reviewedBy: admin._id as any,
                        reviewedAt: now,
                        approvalNotes: args.notes,
                        updatedAt: now,
                    });
                    results.push({ payoutId, success: true });
                }
            } catch (error) {
                results.push({ payoutId, success: false, error: String(error) });
            }
        }

        return { results };
    },
});

/**
 * Apply deductions to payout (penalties, adjustments, etc.)
 */
export const applyDeductions = mutation({
    args: {
        sessionToken: v.string(),
        payoutId: v.id("payoutRequests"),
        deductions: v.object({
            penalties: v.optional(v.number()),
            adjustments: v.optional(v.number()),
            otherDeductions: v.optional(v.number()),
            reason: v.string(),
        }),
    },
    handler: async (ctx, args) => {
        const admin = await validateAdminSession(ctx, args.sessionToken);

        const payout = await ctx.db.get(args.payoutId);
        if (!payout) {
            throw new Error("Payout request not found");
        }

        if (payout.status !== "pending" && payout.status !== "under_review") {
            throw new Error(`Cannot apply deductions in status: ${payout.status}`);
        }

        // Calculate new net payable
        const penalties = args.deductions.penalties || 0;
        const adjustments = args.deductions.adjustments || 0;
        const otherDeductions = args.deductions.otherDeductions || 0;

        const newNetPayable = Math.max(
            0,
            payout.breakdown.netPayable - penalties - adjustments - otherDeductions
        );

        // Update payout with deductions
        await ctx.db.patch(args.payoutId, {
            breakdown: {
                ...payout.breakdown,
                penalties,
                adjustments,
                otherDeductions,
                netPayable: newNetPayable,
            },
            eligibleAmount: newNetPayable,
            notes: `Deductions applied by admin: ${args.deductions.reason}`,
            updatedAt: Date.now(),
        });

        return {
            success: true,
            newNetPayable,
            deductionsApplied: penalties + adjustments + otherDeductions
        };
    },
});
