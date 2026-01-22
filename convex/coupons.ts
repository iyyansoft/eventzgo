// convex/coupons.ts - Coupon Management Functions
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

/**
 * Create a new coupon code
 * Only for active events
 */
export const createCoupon = mutation({
  args: {
    code: v.string(),
    name: v.string(),
    description: v.string(),
    organiserId: v.id("organisers"),
    eventId: v.optional(v.id("events")),
    discountType: v.union(v.literal("percentage"), v.literal("fixed"), v.literal("bogo")),
    discountValue: v.number(),
    maxDiscount: v.optional(v.number()),
    validFrom: v.number(),
    validUntil: v.number(),
    maxUses: v.optional(v.number()),
    maxUsesPerUser: v.optional(v.number()),
    minPurchaseAmount: v.optional(v.number()),
    applicableTicketTypes: v.optional(v.array(v.string())),
    firstTimeUserOnly: v.boolean(),
  },
  handler: async (ctx, args) => {
    // If eventId provided, verify event is active and belongs to organiser
    if (args.eventId) {
      const event = await ctx.db.get(args.eventId);
      if (!event) {
        throw new Error("Event not found");
      }
      if (event.organiserId !== args.organiserId) {
        throw new Error("Event does not belong to this organiser");
      }
      if (event.status !== "published") {
        throw new Error("Coupons can only be created for active/published events");
      }
    }

    // Check if coupon code already exists for this organiser
    const existing = await ctx.db
      .query("coupons")
      .withIndex("by_code", (q) => q.eq("code", args.code.toUpperCase()))
      .filter((q) => q.eq(q.field("organiserId"), args.organiserId))
      .first();

    if (existing) {
      throw new Error("Coupon code already exists");
    }

    // Create coupon
    const couponId = await ctx.db.insert("coupons", {
      code: args.code.toUpperCase(),
      name: args.name,
      description: args.description,
      organiserId: args.organiserId,
      eventId: args.eventId,
      discountType: args.discountType,
      discountValue: args.discountValue,
      maxDiscount: args.maxDiscount,
      validFrom: args.validFrom,
      validUntil: args.validUntil,
      maxUses: args.maxUses,
      maxUsesPerUser: args.maxUsesPerUser,
      currentUses: 0,
      minPurchaseAmount: args.minPurchaseAmount,
      applicableTicketTypes: args.applicableTicketTypes,
      firstTimeUserOnly: args.firstTimeUserOnly,
      isActive: true,
      createdAt: Date.now(),
      createdBy: args.organiserId,
      updatedAt: Date.now(),
    });

    return couponId;
  },
});

/**
 * Get all coupons for an organiser
 */
export const getCoupons = query({
  args: {
    organiserId: v.id("organisers"),
    eventId: v.optional(v.id("events")),
  },
  handler: async (ctx, args) => {
    let coupons;

    if (args.eventId) {
      // Get coupons for specific event
      coupons = await ctx.db
        .query("coupons")
        .withIndex("by_organiser_id", (q) => q.eq("organiserId", args.organiserId))
        .filter((q) =>
          q.or(
            q.eq(q.field("eventId"), args.eventId),
            q.eq(q.field("eventId"), undefined)
          )
        )
        .collect();
    } else {
      // Get all coupons for organiser
      coupons = await ctx.db
        .query("coupons")
        .withIndex("by_organiser_id", (q) => q.eq("organiserId", args.organiserId))
        .collect();
    }

    // Enrich with event details
    const enrichedCoupons = await Promise.all(
      coupons.map(async (coupon) => {
        let eventName = "All Events";
        if (coupon.eventId) {
          const event = await ctx.db.get(coupon.eventId);
          eventName = event?.title || "Unknown Event";
        }

        // Calculate status
        const now = Date.now();
        let status: "active" | "expired" | "exhausted" | "scheduled" = "active";
        
        if (now < coupon.validFrom) {
          status = "scheduled";
        } else if (now > coupon.validUntil) {
          status = "expired";
        } else if (coupon.maxUses && coupon.currentUses >= coupon.maxUses) {
          status = "exhausted";
        } else if (!coupon.isActive) {
          status = "expired";
        }

        return {
          ...coupon,
          eventName,
          status,
          usagePercentage: coupon.maxUses 
            ? Math.round((coupon.currentUses / coupon.maxUses) * 100)
            : 0,
        };
      })
    );

    return enrichedCoupons;
  },
});

/**
 * Validate coupon code
 */
export const validateCoupon = query({
  args: {
    code: v.string(),
    eventId: v.id("events"),
    userId: v.optional(v.id("users")),
    cartAmount: v.number(),
  },
  handler: async (ctx, args) => {
    // Find coupon
    const coupon = await ctx.db
      .query("coupons")
      .withIndex("by_code", (q) => q.eq("code", args.code.toUpperCase()))
      .first();

    if (!coupon) {
      return { valid: false, error: "Invalid coupon code" };
    }

    // Check if active
    if (!coupon.isActive) {
      return { valid: false, error: "This coupon is no longer active" };
    }

    // Check event applicability
    if (coupon.eventId && coupon.eventId !== args.eventId) {
      return { valid: false, error: "This coupon is not valid for this event" };
    }

    // Check date validity
    const now = Date.now();
    if (now < coupon.validFrom) {
      return { valid: false, error: "This coupon is not yet valid" };
    }
    if (now > coupon.validUntil) {
      return { valid: false, error: "This coupon has expired" };
    }

    // Check usage limit
    if (coupon.maxUses && coupon.currentUses >= coupon.maxUses) {
      return { valid: false, error: "This coupon has reached its usage limit" };
    }

    // Check per-user limit
    if (args.userId && coupon.maxUsesPerUser) {
      const userBookings = await ctx.db
        .query("bookings")
        .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
        .filter((q) => q.eq(q.field("couponId"), coupon._id))
        .collect();

      if (userBookings.length >= coupon.maxUsesPerUser) {
        return { 
          valid: false, 
          error: `You have already used this coupon ${coupon.maxUsesPerUser} time(s)` 
        };
      }
    }

    // Check minimum purchase amount
    if (coupon.minPurchaseAmount && args.cartAmount < coupon.minPurchaseAmount) {
      return { 
        valid: false, 
        error: `Minimum purchase amount of ₹${coupon.minPurchaseAmount} required` 
      };
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === "percentage") {
      discountAmount = (args.cartAmount * coupon.discountValue) / 100;
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else if (coupon.discountType === "fixed") {
      discountAmount = coupon.discountValue;
    }

    return {
      valid: true,
      coupon: {
        _id: coupon._id,
        code: coupon.code,
        name: coupon.name,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      },
      discountAmount: Math.min(discountAmount, args.cartAmount),
    };
  },
});

/**
 * Apply coupon to booking (increment usage)
 */
export const applyCoupon = mutation({
  args: {
    couponId: v.id("coupons"),
  },
  handler: async (ctx, args) => {
    const coupon = await ctx.db.get(args.couponId);
    if (!coupon) {
      throw new Error("Coupon not found");
    }

    // Increment usage count
    await ctx.db.patch(args.couponId, {
      currentUses: coupon.currentUses + 1,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Get coupon statistics
 */
export const getCouponStats = query({
  args: {
    organiserId: v.id("organisers"),
  },
  handler: async (ctx, args) => {
    const coupons = await ctx.db
      .query("coupons")
      .withIndex("by_organiser_id", (q) => q.eq("organiserId", args.organiserId))
      .collect();

    const now = Date.now();
    const activeCoupons = coupons.filter(
      (c) => c.isActive && c.validFrom <= now && c.validUntil >= now
    );

    // Calculate total discount given
    const bookings = await ctx.db.query("bookings").collect();
    const couponBookings = bookings.filter((b) => 
      b.couponId && coupons.some((c) => c._id === b.couponId)
    );

    const totalDiscount = couponBookings.reduce(
      (sum, b) => sum + (b.discountAmount || 0),
      0
    );

    const totalRevenue = couponBookings.reduce(
      (sum, b) => sum + b.totalAmount,
      0
    );

    return {
      totalCoupons: coupons.length,
      activeCoupons: activeCoupons.length,
      totalDiscount,
      totalRevenue,
      totalUses: coupons.reduce((sum, c) => sum + c.currentUses, 0),
    };
  },
});

/**
 * Update coupon
 */
export const updateCoupon = mutation({
  args: {
    couponId: v.id("coupons"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    validUntil: v.optional(v.number()),
    maxUses: v.optional(v.number()),
    maxUsesPerUser: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { couponId, ...updates } = args;

    await ctx.db.patch(couponId, {
      ...updates,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Delete coupon (soft delete by deactivating)
 */
export const deleteCoupon = mutation({
  args: {
    couponId: v.id("coupons"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.couponId, {
      isActive: false,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});
