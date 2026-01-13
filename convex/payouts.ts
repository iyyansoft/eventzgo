import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

/**
 * PAYOUT SYSTEM - Backend Logic
 * Handles payout requests, approvals, and financial calculations
 */

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate unique payout ID
 */
function generatePayoutId(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const random = Math.floor(Math.random() * 100000).toString().padStart(5, "0");
  return `PAYOUT-${year}${month}${day}-${random}`;
}

/**
 * Calculate payout breakdown for an event or account
 */
async function calculatePayoutBreakdown(
  ctx: any,
  organiserId: Id<"organisers">,
  eventId?: Id<"events">
) {
  // Get all confirmed bookings
  let bookings;
  if (eventId) {
    bookings = await ctx.db
      .query("bookings")
      .withIndex("by_event_id", (q: any) => q.eq("eventId", eventId))
      .filter((q: any) => q.eq(q.field("status"), "confirmed"))
      .collect();
  } else {
    // Get all bookings for this organiser's events
    const events = await ctx.db
      .query("events")
      .withIndex("by_organiser_id", (q: any) => q.eq("organiserId", organiserId))
      .collect();

    const eventIds = events.map((e: any) => e._id);
    bookings = [];
    for (const evtId of eventIds) {
      const evtBookings = await ctx.db
        .query("bookings")
        .withIndex("by_event_id", (q: any) => q.eq("eventId", evtId))
        .filter((q: any) => q.eq(q.field("status"), "confirmed"))
        .collect();
      bookings.push(...evtBookings);
    }
  }

  // Calculate totals
  let totalRevenue = 0;
  let platformFee = 0;
  let gst = 0;
  let gatewayFees = 0;

  for (const booking of bookings) {
    const pricing = booking.pricing || {
      total: booking.totalAmount || 0,
      platformFee: 0,
      gst: 0,
      subtotal: booking.totalAmount || 0,
    };

    totalRevenue += pricing.total;
    platformFee += pricing.platformFee;
    gst += pricing.gst;
    gatewayFees += pricing.total * 0.02; // Assume 2% gateway fee
  }

  // Get previous payouts
  const previousPayouts = await ctx.db
    .query("payoutRequests")
    .withIndex("by_organiser_id", (q: any) => q.eq("organiserId", organiserId))
    .filter((q: any) =>
      eventId
        ? q.and(
          q.eq(q.field("eventId"), eventId),
          q.eq(q.field("status"), "paid")
        )
        : q.eq(q.field("status"), "paid")
    )
    .collect();

  const previousPayoutsTotal = previousPayouts.reduce(
    (sum: number, p: any) => sum + p.eligibleAmount,
    0
  );

  // Calculate refunds reserve (5% of revenue or actual pending refunds)
  const refundsReserve = totalRevenue * 0.05;

  // Get organiser details for TDS calculation
  const organiser = await ctx.db.get(organiserId);

  // Calculate TDS (Tax Deducted at Source)
  let tdsAmount = 0;
  let tdsPercentage = 0;

  // TDS applicable if revenue >= ₹30,000
  if (totalRevenue >= 30000 && organiser) {
    // Determine TDS rate based on organization type
    // Section 194C: Payments to contractors
    const orgType = organiser.organizationType || "individual";

    if (orgType === "company" || orgType === "llp") {
      tdsPercentage = 1; // 1% for companies
    } else if (orgType === "individual" || orgType === "proprietorship") {
      tdsPercentage = 2; // 2% for individuals
    }

    tdsAmount = (totalRevenue * tdsPercentage) / 100;
  }

  // Initialize deductions (can be set by admin later)
  const penalties = 0;
  const adjustments = 0;
  const otherDeductions = 0;

  // Calculate net payable with all deductions
  const netPayable = Math.max(
    0,
    totalRevenue
    - platformFee
    - gst
    - gatewayFees
    - previousPayoutsTotal
    - refundsReserve
    - tdsAmount
    - penalties
    - adjustments
    - otherDeductions
  );

  return {
    totalRevenue,
    platformFee,
    gst,
    gatewayFees,
    previousPayouts: previousPayoutsTotal,
    refundsReserve,
    tdsAmount,
    tdsPercentage,
    penalties,
    adjustments,
    otherDeductions,
    netPayable,
    gstNumber: organiser?.gstNumber,
    invoiceNumber: undefined, // Will be generated on approval
  };
}

/**
 * Check if organiser is eligible for payout
 */
async function checkPayoutEligibility(
  ctx: any,
  organiserId: Id<"organisers">,
  eventId?: Id<"events">
): Promise<{ eligible: boolean; reason?: string }> {
  const organiser = await ctx.db.get(organiserId);
  if (!organiser) {
    return { eligible: false, reason: "Organiser not found" };
  }

  // Check account status
  if (organiser.accountStatus !== "active") {
    return { eligible: false, reason: "Account is not active" };
  }

  // Check bank details
  if (!organiser.bankDetails || !organiser.bankDetails.accountNumber) {
    return { eligible: false, reason: "Bank details not verified" };
  }

  // If event-specific, check event status
  if (eventId) {
    const event = await ctx.db.get(eventId);
    if (!event) {
      return { eligible: false, reason: "Event not found" };
    }

    // Check if event is completed
    const now = Date.now();
    const eventEndTime = event.dateTime?.end || event.dateTime?.start;
    if (eventEndTime > now) {
      return { eligible: false, reason: "Event has not ended yet" };
    }

    // Check cooling period (7 days)
    const daysSinceEvent = (now - eventEndTime) / (1000 * 60 * 60 * 24);
    if (daysSinceEvent < 7) {
      return {
        eligible: false,
        reason: `Cooling period: ${Math.ceil(7 - daysSinceEvent)} days remaining`,
      };
    }
  }

  return { eligible: true };
}

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get payout balance for organiser
 */
export const getPayoutBalance = query({
  args: {
    organiserId: v.id("organisers"),
  },
  handler: async (ctx, args) => {
    const breakdown = await calculatePayoutBreakdown(ctx, args.organiserId);

    // Get pending payouts
    const pendingPayouts = await ctx.db
      .query("payoutRequests")
      .withIndex("by_organiser_id", (q) => q.eq("organiserId", args.organiserId))
      .filter((q) =>
        q.or(
          q.eq(q.field("status"), "pending"),
          q.eq(q.field("status"), "under_review"),
          q.eq(q.field("status"), "approved"),
          q.eq(q.field("status"), "processing")
        )
      )
      .collect();

    const pendingAmount = pendingPayouts.reduce(
      (sum, p) => sum + p.eligibleAmount,
      0
    );

    return {
      availableBalance: breakdown.netPayable,
      pendingBalance: pendingAmount,
      totalEarnings: breakdown.totalRevenue,
      breakdown,
    };
  },
});

/**
 * Get event-wise payout breakdown
 */
export const getEventPayoutBreakdown = query({
  args: {
    organiserId: v.id("organisers"),
  },
  handler: async (ctx, args) => {
    const events = await ctx.db
      .query("events")
      .withIndex("by_organiser_id", (q) => q.eq("organiserId", args.organiserId))
      .collect();

    const eventBreakdowns = await Promise.all(
      events.map(async (event) => {
        const breakdown = await calculatePayoutBreakdown(
          ctx,
          args.organiserId,
          event._id
        );

        // Get payouts for this event
        const payouts = await ctx.db
          .query("payoutRequests")
          .withIndex("by_event_id", (q) => q.eq("eventId", event._id))
          .filter((q) => q.eq(q.field("status"), "paid"))
          .collect();

        const paidOut = payouts.reduce((sum, p) => sum + p.eligibleAmount, 0);

        return {
          eventId: event._id,
          eventTitle: event.title,
          eventDate: event.dateTime?.start,
          revenue: breakdown.totalRevenue,
          paidOut,
          pending: breakdown.netPayable,
          breakdown,
        };
      })
    );

    return eventBreakdowns.sort((a, b) => b.eventDate - a.eventDate);
  },
});

/**
 * Get payout requests for organiser
 */
export const getPayoutRequests = query({
  args: {
    organiserId: v.id("organisers"),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let requests = await ctx.db
      .query("payoutRequests")
      .withIndex("by_organiser_id", (q) => q.eq("organiserId", args.organiserId))
      .order("desc")
      .collect();

    if (args.status && args.status !== "all") {
      requests = requests.filter((r) => r.status === args.status);
    }

    // Enrich with event details
    const enriched = await Promise.all(
      requests.map(async (req) => {
        let eventTitle = "Account-wide Payout";
        if (req.eventId) {
          const event = await ctx.db.get(req.eventId);
          if (event) eventTitle = event.title;
        }
        return { ...req, eventTitle };
      })
    );

    return enriched;
  },
});

/**
 * Get single payout request details
 */
export const getPayoutRequestDetails = query({
  args: {
    payoutId: v.id("payoutRequests"),
  },
  handler: async (ctx, args) => {
    const payout = await ctx.db.get(args.payoutId);
    if (!payout) return null;

    // Get event details if applicable
    let eventDetails = null;
    if (payout.eventId) {
      eventDetails = await ctx.db.get(payout.eventId);
    }

    // Get organiser details
    const organiser = await ctx.db.get(payout.organiserId);

    return {
      ...payout,
      eventDetails,
      organiserDetails: organiser,
    };
  },
});

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Create payout request
 */
export const createPayoutRequest = mutation({
  args: {
    organiserId: v.id("organisers"),
    scope: v.union(v.literal("event"), v.literal("account")),
    eventId: v.optional(v.id("events")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check eligibility
    const eligibility = await checkPayoutEligibility(
      ctx,
      args.organiserId,
      args.eventId
    );

    if (!eligibility.eligible) {
      throw new Error(`Not eligible for payout: ${eligibility.reason}`);
    }

    // Calculate breakdown
    const breakdown = await calculatePayoutBreakdown(
      ctx,
      args.organiserId,
      args.eventId
    );

    // Check minimum amount (₹1000)
    if (breakdown.netPayable < 1000) {
      throw new Error(
        `Minimum payout amount is ₹1,000. Available: ₹${breakdown.netPayable.toFixed(2)}`
      );
    }

    // Get organiser bank details
    const organiser = await ctx.db.get(args.organiserId);
    if (!organiser || !organiser.bankDetails) {
      throw new Error("Bank details not found");
    }

    const now = Date.now();
    const payoutId = generatePayoutId();

    // Determine initial status (auto-approve if < ₹50k)
    const initialStatus =
      breakdown.netPayable < 50000 ? "approved" : "under_review";

    const requestId = await ctx.db.insert("payoutRequests", {
      payoutId,
      organiserId: args.organiserId,
      scope: args.scope,
      eventId: args.eventId,
      requestedAmount: breakdown.netPayable,
      eligibleAmount: breakdown.netPayable,
      breakdown,
      bankDetails: organiser.bankDetails,
      status: initialStatus,
      requestedAt: now,
      requestedBy: args.organiserId,
      notes: args.notes,
      createdAt: now,
      updatedAt: now,
    });

    return { payoutId: requestId, status: initialStatus };
  },
});

/**
 * Update payout status (Admin action)
 */
export const updatePayoutStatus = mutation({
  args: {
    payoutId: v.id("payoutRequests"),
    status: v.union(
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("processing"),
      v.literal("paid"),
      v.literal("failed")
    ),
    reviewerId: v.union(v.id("organisers"), v.id("users")),
    notes: v.optional(v.string()),
    rejectionReason: v.optional(v.string()),
    utrNumber: v.optional(v.string()),
    paymentProof: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const payout = await ctx.db.get(args.payoutId);
    if (!payout) {
      throw new Error("Payout request not found");
    }

    const now = Date.now();
    const updates: any = {
      status: args.status,
      updatedAt: now,
    };

    // Handle approval
    if (args.status === "approved") {
      updates.reviewedBy = args.reviewerId;
      updates.reviewedAt = now;
      updates.approvalNotes = args.notes;
    }

    // Handle rejection
    if (args.status === "rejected") {
      updates.reviewedBy = args.reviewerId;
      updates.reviewedAt = now;
      updates.rejectionReason = args.rejectionReason;
    }

    // Handle payment completion
    if (args.status === "paid") {
      updates.processedBy = args.reviewerId;
      updates.processedAt = now;
      updates.utrNumber = args.utrNumber;
      updates.paymentProof = args.paymentProof;
    }

    await ctx.db.patch(args.payoutId, updates);

    return { success: true };
  },
});

/**
 * Cancel payout request (Organiser action)
 */
export const cancelPayoutRequest = mutation({
  args: {
    payoutId: v.id("payoutRequests"),
    organiserId: v.id("organisers"),
  },
  handler: async (ctx, args) => {
    const payout = await ctx.db.get(args.payoutId);
    if (!payout) {
      throw new Error("Payout request not found");
    }

    // Only allow cancellation if pending or under review
    if (!["pending", "under_review"].includes(payout.status)) {
      throw new Error(`Cannot cancel payout in status: ${payout.status}`);
    }

    // Verify ownership
    if (payout.organiserId !== args.organiserId) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.payoutId, {
      status: "rejected",
      rejectionReason: "Cancelled by organiser",
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Get all payouts (Admin)
 */
export const getAllPayouts = query({
  args: {
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let requests = await ctx.db
      .query("payoutRequests")
      .order("desc")
      .collect();

    if (args.status && args.status !== "all") {
      requests = requests.filter((r) => r.status === args.status);
    }

    // Enrich with event and organiser details
    const enriched = await Promise.all(
      requests.map(async (req) => {
        let eventTitle = "Account-wide Payout";
        if (req.eventId) {
          const event = await ctx.db.get(req.eventId);
          if (event) eventTitle = event.title;
        }

        const organiser = await ctx.db.get(req.organiserId);

        return {
          ...req,
          eventTitle,
          organiserName: organiser?.institutionName || "Unknown Organiser",
        };
      })
    );

    return enriched;
  },
});

/**
 * Get payout stats for admin dashboard
 */
export const getPayoutStats = query({
  handler: async (ctx) => {
    const allRequests = await ctx.db.query("payoutRequests").collect();

    const pendingRequests = allRequests.filter(
      (r) => r.status === "pending" || r.status === "under_review"
    ).length;

    const completedPayouts = allRequests.filter(
      (r) => r.status === "paid"
    ).length;

    const completedAmount = allRequests
      .filter((r) => r.status === "paid")
      .reduce((sum, r) => sum + r.eligibleAmount, 0);

    const failedPayouts = allRequests.filter(
      (r) => r.status === "failed" || r.status === "rejected"
    ).length;

    const pendingAmount = allRequests
      .filter((r) => r.status === "pending" || r.status === "under_review")
      .reduce((sum, r) => sum + r.eligibleAmount, 0);

    const totalAmount = allRequests.reduce((sum, r) => sum + (r.breakdown?.totalRevenue || 0), 0);
    const totalNetAmount = allRequests.reduce((sum, r) => sum + r.eligibleAmount, 0);

    const processingPayouts = allRequests.filter(
      (r) => r.status === "processing"
    ).length;

    const totalPlatformFee = allRequests.reduce((sum, r) => sum + (r.breakdown?.platformFee || 0), 0);
    const totalGST = allRequests.reduce((sum, r) => sum + (r.breakdown?.gst || 0), 0);
    const totalTDS = allRequests.reduce((sum, r) => sum + (r.breakdown?.tdsAmount || 0), 0);

    return {
      pendingPayouts: pendingRequests,
      completedAmount,
      pendingAmount,
      totalPayouts: allRequests.length,
      processingPayouts,
      completedPayouts,
      failedPayouts,
      totalAmount,
      totalNetAmount,
      totalPlatformFee,
      totalGST,
      totalTDS,
    };
  },
});