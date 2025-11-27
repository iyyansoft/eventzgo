import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Create payout
 */
export const createPayout = mutation({
  args: {
    organiserId: v.id("organisers"),
    eventId: v.id("events"),
    amount: v.number(),
    platformFee: v.number(),
    netAmount: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const payoutId = await ctx.db.insert("payouts", {
      organiserId: args.organiserId,
      eventId: args.eventId,
      amount: args.amount,
      platformFee: args.platformFee,
      netAmount: args.netAmount,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    });

    return payoutId;
  },
});

/**
 * Get payout by ID
 */
export const getPayoutById = query({
  args: { payoutId: v.id("payouts") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.payoutId);
  },
});

/**
 * Get payouts by organiser
 */
export const getPayoutsByOrganiser = query({
  args: { organiserId: v.id("organisers") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("payouts")
      .withIndex("by_organiser_id", (q) => q.eq("organiserId", args.organiserId))
      .order("desc")
      .collect();
  },
});

/**
 * Get payouts by event
 */
export const getPayoutsByEvent = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("payouts")
      .withIndex("by_event_id", (q) => q.eq("eventId", args.eventId!))
      .order("desc")
      .collect();
  },
});

/**
 * Get all payouts with filters
 */
export const getAllPayouts = query({
  args: {
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("processing"),
        v.literal("completed"),
        v.literal("failed")
      )
    ),
  },
  handler: async (ctx, args) => {
    if (args.status) {
      return await ctx.db
        .query("payouts")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .collect();
    }

    return await ctx.db.query("payouts").order("desc").collect();
  },
});

/**
 * Start processing payout
 */
export const startProcessingPayout = mutation({
  args: {
    payoutId: v.id("payouts"),
    processedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.payoutId, {
      status: "processing",
      processedBy: args.processedBy,
      updatedAt: Date.now(),
    });

    return args.payoutId;
  },
});

/**
 * Complete payout
 */
export const completePayout = mutation({
  args: {
    payoutId: v.id("payouts"),
    transactionId: v.string(),
    processedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    await ctx.db.patch(args.payoutId, {
      status: "completed",
      transactionId: args.transactionId,
      processedBy: args.processedBy,
      processedAt: now,
      updatedAt: now,
    });

    return args.payoutId;
  },
});

/**
 * Fail payout
 */
export const failPayout = mutation({
  args: {
    payoutId: v.id("payouts"),
    failureReason: v.string(),
    processedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.payoutId, {
      status: "failed",
      failureReason: args.failureReason,
      processedBy: args.processedBy,
      updatedAt: Date.now(),
    });

    return args.payoutId;
  },
});

/**
 * Get payout statistics
 */
export const getPayoutStats = query({
  args: {
    organiserId: v.optional(v.id("organisers")),
  },
  handler: async (ctx, args) => {
    let payouts;

    if (args.organiserId) {
      payouts = await ctx.db
        .query("payouts")
        .withIndex("by_organiser_id", (q) => q.eq("organiserId", args.organiserId!))
        .collect();
    } else {
      payouts = await ctx.db.query("payouts").collect();
    }

    const totalPayouts = payouts.length;
    const pendingPayouts = payouts.filter((p) => p.status === "pending").length;
    const processingPayouts = payouts.filter((p) => p.status === "processing").length;
    const completedPayouts = payouts.filter((p) => p.status === "completed").length;
    const failedPayouts = payouts.filter((p) => p.status === "failed").length;

    const totalAmount = payouts.reduce((sum, p) => sum + p.amount, 0);
    const totalPlatformFee = payouts.reduce((sum, p) => sum + p.platformFee, 0);
    const totalNetAmount = payouts.reduce((sum, p) => sum + p.netAmount, 0);
    const completedAmount = payouts
      .filter((p) => p.status === "completed")
      .reduce((sum, p) => sum + p.netAmount, 0);
    const pendingAmount = payouts
      .filter((p) => p.status === "pending")
      .reduce((sum, p) => sum + p.netAmount, 0);

    return {
      totalPayouts,
      pendingPayouts,
      processingPayouts,
      completedPayouts,
      failedPayouts,
      totalAmount,
      totalPlatformFee,
      totalNetAmount,
      completedAmount,
      pendingAmount,
    };
  },
});

/**
 * Get payouts for current organiser (based on authenticated user)
 */
export const getOrganiserPayouts = query({
  handler: async (ctx) => {
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

    return await ctx.db
      .query("payouts")
      .withIndex("by_organiser_id", (q) => q.eq("organiserId", organiser._id))
      .order("desc")
      .collect();
  },
});