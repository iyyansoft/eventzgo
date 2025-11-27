import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Create refund request
 */
export const createRefund = mutation({
  args: {
    bookingId: v.id("bookings"),
    paymentId: v.id("payments"),
    userId: v.optional(v.id("users")),
    amount: v.number(),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if refund already exists
    const existing = await ctx.db
      .query("refunds")
      .withIndex("by_booking_id", (q) => q.eq("bookingId", args.bookingId))
      .first();

    if (existing) {
      throw new Error("Refund request already exists for this booking");
    }

    const now = Date.now();

    const refundId = await ctx.db.insert("refunds", {
      bookingId: args.bookingId,
      paymentId: args.paymentId,
      userId: args.userId,
      amount: args.amount,
      reason: args.reason,
      status: "requested",
      createdAt: now,
      updatedAt: now,
    });

    return refundId;
  },
});

/**
 * Get refund by ID
 */
export const getRefundById = query({
  args: { refundId: v.id("refunds") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.refundId);
  },
});

/**
 * Get refund by booking ID
 */
export const getRefundByBookingId = query({
  args: { bookingId: v.id("bookings") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("refunds")
      .withIndex("by_booking_id", (q) => q.eq("bookingId", args.bookingId))
      .first();
  },
});

/**
 * Get refunds by user
 */
export const getRefundsByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("refunds")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

/**
 * Get refunds for the organiser's events
 */
export const getOrganiserRefunds = query({
  args: {
    status: v.optional(
      v.union(
        v.literal("requested"),
        v.literal("approved"),
        v.literal("rejected"),
        v.literal("processed")
      )
    ),
  },
  handler: async (ctx, args) => {
    // Resolve organiser via Clerk identity -> user -> organiser
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) return [];

    const organiser = await ctx.db
      .query("organisers")
      .withIndex("by_user_id", (q) => q.eq("userId", user._id))
      .first();

    if (!organiser) return [];

    // Fetch events for this organiser
    const events = await ctx.db
      .query("events")
      .withIndex("by_organiser_id", (q) => q.eq("organiserId", organiser._id))
      .collect();

    const eventIds = new Set(events.map((e) => e._id));
    if (eventIds.size === 0) return [];

    // Fetch refunds optionally filtered by status
    const refunds = args.status
      ? await ctx.db
          .query("refunds")
          .withIndex("by_status", (q) => q.eq("status", args.status!))
          .order("desc")
          .collect()
      : await ctx.db.query("refunds").order("desc").collect();

    // Filter refunds to those whose booking belongs to an event owned by organiser
    const result: any[] = [];
    for (const r of refunds) {
      const booking = await ctx.db.get(r.bookingId);
      if (booking && eventIds.has(booking.eventId)) {
        result.push(r);
      }
    }

    return result;
  },
});

/**
 * Get all refunds with filters
 */
export const getAllRefunds = query({
  args: {
    status: v.optional(
      v.union(
        v.literal("requested"),
        v.literal("approved"),
        v.literal("rejected"),
        v.literal("processed")
      )
    ),
  },
  handler: async (ctx, args) => {
    if (args.status) {
      return await ctx.db
        .query("refunds")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .collect();
    }

    return await ctx.db.query("refunds").order("desc").collect();
  },
});

/**
 * Approve refund (Admin/Organiser)
 */
export const approveRefund = mutation({
  args: {
    refundId: v.id("refunds"),
    approvedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    await ctx.db.patch(args.refundId, {
      status: "approved",
      approvedBy: args.approvedBy,
      approvedAt: now,
      updatedAt: now,
    });

    return args.refundId;
  },
});

/**
 * Reject refund (Admin/Organiser)
 */
export const rejectRefund = mutation({
  args: {
    refundId: v.id("refunds"),
    rejectionReason: v.string(),
    approvedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.refundId, {
      status: "rejected",
      rejectionReason: args.rejectionReason,
      approvedBy: args.approvedBy,
      approvedAt: Date.now(),
      updatedAt: Date.now(),
    });

    return args.refundId;
  },
});

/**
 * Process refund (after Razorpay refund)
 */
export const processRefund = mutation({
  args: {
    refundId: v.id("refunds"),
    razorpayRefundId: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const refund = await ctx.db.get(args.refundId);
    if (!refund) {
      throw new Error("Refund not found");
    }

    // Update refund status
    await ctx.db.patch(args.refundId, {
      status: "processed",
      razorpayRefundId: args.razorpayRefundId,
      processedAt: now,
      updatedAt: now,
    });

    // Update payment status
    await ctx.db.patch(refund.paymentId, {
      status: "refunded",
      updatedAt: now,
    });

    // Update booking status
    await ctx.db.patch(refund.bookingId, {
      status: "refunded",
      updatedAt: now,
    });

    return args.refundId;
  },
});

/**
 * Get refund statistics
 */
export const getRefundStats = query({
  handler: async (ctx) => {
    const refunds = await ctx.db.query("refunds").collect();

    const totalRefunds = refunds.length;
    const requestedRefunds = refunds.filter((r) => r.status === "requested").length;
    const approvedRefunds = refunds.filter((r) => r.status === "approved").length;
    const rejectedRefunds = refunds.filter((r) => r.status === "rejected").length;
    const processedRefunds = refunds.filter((r) => r.status === "processed").length;
    const totalAmount = refunds
      .filter((r) => r.status === "processed")
      .reduce((sum, r) => sum + r.amount, 0);

    return {
      totalRefunds,
      requestedRefunds,
      approvedRefunds,
      rejectedRefunds,
      processedRefunds,
      totalAmount,
    };
  },
});