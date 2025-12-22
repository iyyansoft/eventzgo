import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";

/**
 * Create organiser profile
 */
export const createOrganiser = mutation({
  args: {
    userId: v.id("users"),
    clerkId: v.string(),
    institutionName: v.string(),
    address: v.object({
      street: v.string(),
      city: v.string(),
      state: v.string(),
      pincode: v.string(),
    }),
    gstNumber: v.string(),
    panNumber: v.string(),
    tanNumber: v.optional(v.string()),
    bankDetails: v.object({
      accountHolderName: v.string(),
      accountNumber: v.string(),
      ifscCode: v.string(),
      bankName: v.string(),
      branchName: v.string(),
    }),
    documents: v.object({
      gstCertificate: v.optional(v.string()),
      panCard: v.optional(v.string()),
      cancelledCheque: v.optional(v.string()),
      bankStatement: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    // Check if organiser already exists
    const existing = await ctx.db
      .query("organisers")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .first();

    if (existing) {
      throw new Error("Organiser profile already exists");
    }

    const now = Date.now();

    const organiserId = await ctx.db.insert("organisers", {
      userId: args.userId,
      clerkId: args.clerkId,
      institutionName: args.institutionName,
      address: args.address,
      gstNumber: args.gstNumber,
      panNumber: args.panNumber,
      tanNumber: args.tanNumber,
      bankDetails: args.bankDetails,
      documents: args.documents,
      approvalStatus: "pending",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    return organiserId;
  },
});

/**
 * Get organiser by user ID
 */
export const getOrganiserByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("organisers")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .first();
  },
});

/**
 * Get organiser by Clerk ID
 */
export const getOrganiserByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("organisers")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();
  },
});

/**
 * Get organiser by ID
 */
export const getOrganiserById = query({
  args: { organiserId: v.id("organisers") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.organiserId);
  },
});

/**
 * Get all organisers (with optional approvalStatus filter)
 */
export const getAllOrganisers = query({
  args: { approvalStatus: v.optional(v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected"))) },
  handler: async (ctx, args) => {
    let organisers = await ctx.db.query("organisers").collect();

    if (args.approvalStatus) {
      organisers = organisers.filter((o) => o.approvalStatus === args.approvalStatus);
    }

    // Sort by creation date (most recent first)
    organisers = organisers.sort((a, b) => b.createdAt - a.createdAt);

    return organisers;
  },
});

/**
 * Get pending organisers (Admin view)
 */
export const getPendingOrganisers = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("organisers")
      .withIndex("by_approval_status", (q) => q.eq("approvalStatus", "pending"))
      .order("desc")
      .collect();
  },
});

/**
 * Get basic organiser stats for dashboard
 */
export const getOrganiserStats = query({
  handler: async (ctx) => {
    // Provide simple aggregated stats as a placeholder
    return {
      totalRevenue: 0,
      avgOrderValue: 0,
      conversionRate: 0,
      revenueChange: 0,
      totalBookings: 0,
      bookingsChange: 0,
      activeEvents: 0,
      pendingPayouts: 0,
      topEvents: [],
    };
  },
});

/**
 * Update organiser profile
 */
export const updateOrganiser = mutation({
  args: {
    organiserId: v.id("organisers"),
    institutionName: v.optional(v.string()),
    address: v.optional(
      v.object({
        street: v.string(),
        city: v.string(),
        state: v.string(),
        pincode: v.string(),
      })
    ),
    gstNumber: v.optional(v.string()),
    panNumber: v.optional(v.string()),
    tanNumber: v.optional(v.string()),
    bankDetails: v.optional(
      v.object({
        accountHolderName: v.string(),
        accountNumber: v.string(),
        ifscCode: v.string(),
        bankName: v.string(),
        branchName: v.string(),
      })
    ),
    documents: v.optional(
      v.object({
        gstCertificate: v.optional(v.string()),
        panCard: v.optional(v.string()),
        cancelledCheque: v.optional(v.string()),
        bankStatement: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const { organiserId, ...updates } = args;

    await ctx.db.patch(organiserId, {
      ...updates,
      updatedAt: Date.now(),
    });

    return organiserId;
  },
});

/**
 * Approve organiser (Admin only)
 */
export const approveOrganiser = mutation({
  args: {
    organiserId: v.id("organisers"),
    approvedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    await ctx.db.patch(args.organiserId, {
      approvalStatus: "approved",
      approvedBy: args.approvedBy,
      approvedAt: now,
      updatedAt: now,
    });

    // Update user role to organiser
    const organiser = await ctx.db.get(args.organiserId);
    if (organiser) {
      await ctx.db.patch(organiser.userId, {
        role: "organiser",
        updatedAt: now,
      });
    }

    return args.organiserId;
  },
});

/**
 * Reject organiser (Admin only)
 */
export const rejectOrganiser = mutation({
  args: {
    organiserId: v.id("organisers"),
    rejectionReason: v.string(),
    approvedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    await ctx.db.patch(args.organiserId, {
      approvalStatus: "rejected",
      rejectionReason: args.rejectionReason,
      approvedBy: args.approvedBy,
      approvedAt: now,
      updatedAt: now,
    });

    return args.organiserId;
  },
});

/**
 * Manual approve organiser by Clerk ID (for debugging)
 * This will approve the organiser in Convex and return their info
 * You'll need to manually update Clerk metadata separately
 */
export const manualApproveByClerkId = mutation({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    // Find organiser by Clerk ID
    const organiser = await ctx.db
      .query("organisers")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!organiser) {
      throw new Error(`No organiser found with Clerk ID: ${args.clerkId}`);
    }

    const now = Date.now();

    // Approve the organiser
    await ctx.db.patch(organiser._id, {
      approvalStatus: "approved",
      approvedAt: now,
      updatedAt: now,
    });

    // Update user role
    await ctx.db.patch(organiser.userId, {
      role: "organiser",
      updatedAt: now,
    });

    return {
      success: true,
      organiserId: organiser._id,
      userId: organiser.userId,
      clerkId: args.clerkId,
      message: "Organiser approved in Convex. Now update Clerk metadata with: role='organiser', status='approved', onboardingCompleted=true"
    };
  },
});