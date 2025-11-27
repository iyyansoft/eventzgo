import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Create payment record
 */
export const createPayment = mutation({
  args: {
    razorpayOrderId: v.string(),
    razorpayPaymentId: v.optional(v.string()),
    amount: v.number(),
    currency: v.string(),
    eventId: v.id("events"),
    userId: v.optional(v.id("users")),
    status: v.optional(
      v.union(
        v.literal("created"),
        v.literal("authorized"),
        v.literal("captured"),
        v.literal("failed"),
        v.literal("refunded")
      )
    ),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const paymentId = await ctx.db.insert("payments", {
      razorpayOrderId: args.razorpayOrderId,
      razorpayPaymentId: args.razorpayPaymentId,
      amount: args.amount,
      currency: args.currency,
      status: args.status || "created",
      eventId: args.eventId,
      userId: args.userId,
      metadata: args.metadata,
      createdAt: now,
      updatedAt: now,
    });

    return paymentId;
  },
});

/**
 * Get payment by ID
 */
export const getPaymentById = query({
  args: { paymentId: v.id("payments") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.paymentId);
  },
});

/**
 * Get payment by Razorpay order ID
 */
export const getPaymentByOrderId = query({
  args: { razorpayOrderId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("payments")
      .withIndex("by_razorpay_order_id", (q) =>
        q.eq("razorpayOrderId", args.razorpayOrderId)
      )
      .first();
  },
});

/**
 * Get payment by Razorpay payment ID
 */
export const getPaymentByPaymentId = query({
  args: { razorpayPaymentId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("payments")
      .withIndex("by_razorpay_payment_id", (q) =>
        q.eq("razorpayPaymentId", args.razorpayPaymentId)
      )
      .first();
  },
});

/**
 * Update payment after verification
 */
export const verifyPayment = mutation({
  args: {
    paymentId: v.id("payments"),
    razorpayPaymentId: v.string(),
    razorpaySignature: v.string(),
    method: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.paymentId, {
      razorpayPaymentId: args.razorpayPaymentId,
      razorpaySignature: args.razorpaySignature,
      method: args.method,
      status: "captured",
      updatedAt: Date.now(),
    });

    return args.paymentId;
  },
});

/**
 * Mark payment as failed
 */
export const failPayment = mutation({
  args: {
    paymentId: v.id("payments"),
    failureReason: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.paymentId, {
      status: "failed",
      failureReason: args.failureReason,
      updatedAt: Date.now(),
    });

    return args.paymentId;
  },
});

/**
 * Mark payment as refunded
 */
export const refundPayment = mutation({
  args: { paymentId: v.id("payments") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.paymentId, {
      status: "refunded",
      updatedAt: Date.now(),
    });

    return args.paymentId;
  },
});

/**
 * Get payments by user
 */
export const getPaymentsByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("payments")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

/**
 * Get payments by event
 */
export const getPaymentsByEvent = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("payments")
      .withIndex("by_event_id", (q) => q.eq("eventId", args.eventId!))
      .order("desc")
      .collect();
  },
});

/**
 * Get payment statistics
 */
export const getPaymentStats = query({
  args: {
    eventId: v.optional(v.id("events")),
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    let payments;

    if (args.eventId) {
      payments = await ctx.db
        .query("payments")
        .withIndex("by_event_id", (q) => q.eq("eventId", args.eventId!))
        .collect();
    } else if (args.userId) {
      payments = await ctx.db
        .query("payments")
        .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
        .collect();
    } else {
      payments = await ctx.db.query("payments").collect();
    }

    const totalPayments = payments.length;
    const successfulPayments = payments.filter((p) => p.status === "captured").length;
    const failedPayments = payments.filter((p) => p.status === "failed").length;
    const refundedPayments = payments.filter((p) => p.status === "refunded").length;
    const totalAmount = payments
      .filter((p) => p.status === "captured")
      .reduce((sum, p) => sum + p.amount, 0);
    const refundedAmount = payments
      .filter((p) => p.status === "refunded")
      .reduce((sum, p) => sum + p.amount, 0);

    return {
      totalPayments,
      successfulPayments,
      failedPayments,
      refundedPayments,
      totalAmount,
      refundedAmount,
      netAmount: totalAmount - refundedAmount,
    };
  },
});