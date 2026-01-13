// convex/coupons.ts
// Coupon Management System - Discount codes and promotions

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

/**
 * Generate random coupon code
 */
function generateCouponCode(prefix?: string): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = prefix ? prefix.toUpperCase() : '';

    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return code;
}

/**
 * Create a new coupon
 */
export const createCoupon = mutation({
    args: {
        organiserId: v.id("organisers"),
        eventId: v.optional(v.id("events")),
        code: v.optional(v.string()), // If not provided, auto-generate
        name: v.string(),
        description: v.string(),
        discountType: v.union(
            v.literal("percentage"),
            v.literal("fixed"),
            v.literal("bogo")
        ),
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
        console.log("🎟️ Creating coupon...");

        // Verify organiser exists
        const organiser = await ctx.db.get(args.organiserId);
        if (!organiser) {
            throw new Error("Organiser not found");
        }

        // If eventId provided, verify it belongs to organiser
        if (args.eventId) {
            const event = await ctx.db.get(args.eventId);
            if (!event || event.organiserId !== args.organiserId) {
                throw new Error("Event not found or doesn't belong to this organiser");
            }
        }

        // Generate or validate code
        let code = args.code?.toUpperCase() || generateCouponCode();

        // Check if code already exists
        const existingCoupon = await ctx.db
            .query("coupons")
            .withIndex("by_code", (q) => q.eq("code", code))
            .first();

        if (existingCoupon) {
            // If user provided code, throw error
            if (args.code) {
                throw new Error("Coupon code already exists. Please choose a different code.");
            }
            // If auto-generated, try again
            code = generateCouponCode();
        }

        // Validate dates
        if (args.validFrom >= args.validUntil) {
            throw new Error("Valid from date must be before valid until date");
        }

        // Validate discount value
        if (args.discountType === "percentage" && (args.discountValue <= 0 || args.discountValue > 100)) {
            throw new Error("Percentage discount must be between 1 and 100");
        }

        if (args.discountType === "fixed" && args.discountValue <= 0) {
            throw new Error("Fixed discount must be greater than 0");
        }

        // Create coupon
        const couponId = await ctx.db.insert("coupons", {
            code,
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

        console.log("✅ Coupon created:", code);

        return {
            success: true,
            couponId,
            code,
            message: `Coupon ${code} created successfully!`,
        };
    },
});

/**
 * Validate and apply coupon
 */
export const validateCoupon = query({
    args: {
        code: v.string(),
        eventId: v.id("events"),
        userId: v.optional(v.id("users")),
        bookingAmount: v.number(),
        ticketTypes: v.array(v.string()),
    },
    handler: async (ctx, args) => {
        console.log("🔍 Validating coupon:", args.code);

        // Find coupon by code
        const coupon = await ctx.db
            .query("coupons")
            .withIndex("by_code", (q) => q.eq("code", args.code.toUpperCase()))
            .first();

        if (!coupon) {
            return {
                valid: false,
                reason: "Coupon code not found",
            };
        }

        // Check if active
        if (!coupon.isActive) {
            return {
                valid: false,
                reason: "This coupon is no longer active",
            };
        }

        // Check event applicability
        if (coupon.eventId && coupon.eventId !== args.eventId) {
            const event = await ctx.db.get(coupon.eventId);
            return {
                valid: false,
                reason: `This coupon is only valid for "${event?.title}"`,
            };
        }

        // Check validity period
        const now = Date.now();
        if (now < coupon.validFrom) {
            const startDate = new Date(coupon.validFrom).toLocaleDateString();
            return {
                valid: false,
                reason: `This coupon is valid from ${startDate}`,
            };
        }

        if (now > coupon.validUntil) {
            return {
                valid: false,
                reason: "This coupon has expired",
            };
        }

        // Check total usage limit
        if (coupon.maxUses && coupon.currentUses >= coupon.maxUses) {
            return {
                valid: false,
                reason: "This coupon has reached its usage limit",
            };
        }

        // Check per-user usage limit
        if (args.userId && coupon.maxUsesPerUser) {
            const userUsages = await ctx.db
                .query("couponUsages")
                .withIndex("by_coupon_id", (q) => q.eq("couponId", coupon._id))
                .filter((q) => q.eq(q.field("userId"), args.userId))
                .collect();

            if (userUsages.length >= coupon.maxUsesPerUser) {
                return {
                    valid: false,
                    reason: `You have already used this coupon ${coupon.maxUsesPerUser} time(s)`,
                };
            }
        }

        // Check minimum purchase amount
        if (coupon.minPurchaseAmount && args.bookingAmount < coupon.minPurchaseAmount) {
            return {
                valid: false,
                reason: `Minimum purchase amount is ₹${coupon.minPurchaseAmount}`,
            };
        }

        // Check ticket type applicability
        if (coupon.applicableTicketTypes && coupon.applicableTicketTypes.length > 0) {
            const hasApplicableTicket = args.ticketTypes.some(tt =>
                coupon.applicableTicketTypes?.includes(tt)
            );

            if (!hasApplicableTicket) {
                return {
                    valid: false,
                    reason: "This coupon is not applicable to your selected tickets",
                };
            }
        }

        // Check first-time user restriction
        if (coupon.firstTimeUserOnly && args.userId) {
            const previousBookings = await ctx.db
                .query("bookings")
                .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
                .filter((q) => q.eq(q.field("status"), "confirmed"))
                .collect();

            if (previousBookings.length > 0) {
                return {
                    valid: false,
                    reason: "This coupon is only for first-time users",
                };
            }
        }

        // Calculate discount
        let discountAmount = 0;

        switch (coupon.discountType) {
            case "percentage":
                discountAmount = (args.bookingAmount * coupon.discountValue) / 100;
                if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
                    discountAmount = coupon.maxDiscount;
                }
                break;

            case "fixed":
                discountAmount = coupon.discountValue;
                if (discountAmount > args.bookingAmount) {
                    discountAmount = args.bookingAmount; // Can't discount more than total
                }
                break;

            case "bogo":
                // Buy One Get One - 50% off total
                discountAmount = args.bookingAmount * 0.5;
                break;
        }

        console.log("✅ Coupon valid! Discount:", discountAmount);

        return {
            valid: true,
            coupon: {
                code: coupon.code,
                name: coupon.name,
                description: coupon.description,
                discountType: coupon.discountType,
                discountValue: coupon.discountValue,
            },
            discountAmount: Math.round(discountAmount),
            finalAmount: Math.round(args.bookingAmount - discountAmount),
        };
    },
});

/**
 * Apply coupon to booking (record usage)
 */
export const applyCoupon = mutation({
    args: {
        couponCode: v.string(),
        bookingId: v.id("bookings"),
        userId: v.optional(v.id("users")),
        eventId: v.id("events"),
        originalAmount: v.number(),
        discountApplied: v.number(),
    },
    handler: async (ctx, args) => {
        // Find coupon
        const coupon = await ctx.db
            .query("coupons")
            .withIndex("by_code", (q) => q.eq("code", args.couponCode.toUpperCase()))
            .first();

        if (!coupon) {
            throw new Error("Coupon not found");
        }

        // Record usage
        await ctx.db.insert("couponUsages", {
            couponId: coupon._id,
            bookingId: args.bookingId,
            userId: args.userId,
            eventId: args.eventId,
            couponCode: coupon.code,
            originalAmount: args.originalAmount,
            discountApplied: args.discountApplied,
            finalAmount: args.originalAmount - args.discountApplied,
            usedAt: Date.now(),
        });

        // Increment usage count
        await ctx.db.patch(coupon._id, {
            currentUses: coupon.currentUses + 1,
        });

        return {
            success: true,
            message: "Coupon applied successfully",
        };
    },
});

/**
 * Get all coupons for an organiser
 */
export const getCoupons = query({
    args: {
        organiserId: v.id("organisers"),
        eventId: v.optional(v.id("events")),
        includeInactive: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        let coupons;

        if (args.eventId) {
            // Get coupons for specific event + global coupons
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

        // Filter inactive if needed
        if (!args.includeInactive) {
            coupons = coupons.filter(c => c.isActive);
        }

        // Enrich with usage statistics
        const enrichedCoupons = await Promise.all(
            coupons.map(async (coupon) => {
                const usages = await ctx.db
                    .query("couponUsages")
                    .withIndex("by_coupon_id", (q) => q.eq("couponId", coupon._id))
                    .collect();

                const totalDiscount = usages.reduce((sum, u) => sum + u.discountApplied, 0);
                const totalRevenue = usages.reduce((sum, u) => sum + u.finalAmount, 0);

                // Get event name if applicable
                let eventName;
                if (coupon.eventId) {
                    const event = await ctx.db.get(coupon.eventId);
                    eventName = event?.title;
                }

                return {
                    ...coupon,
                    eventName,
                    stats: {
                        totalUsages: usages.length,
                        totalDiscount,
                        totalRevenue,
                        remainingUses: coupon.maxUses ? coupon.maxUses - coupon.currentUses : null,
                    },
                };
            })
        );

        return enrichedCoupons;
    },
});

/**
 * Update coupon
 */
export const updateCoupon = mutation({
    args: {
        couponId: v.id("coupons"),
        updates: v.object({
            name: v.optional(v.string()),
            description: v.optional(v.string()),
            validUntil: v.optional(v.number()),
            maxUses: v.optional(v.number()),
            isActive: v.optional(v.boolean()),
        }),
    },
    handler: async (ctx, args) => {
        const coupon = await ctx.db.get(args.couponId);
        if (!coupon) {
            throw new Error("Coupon not found");
        }

        await ctx.db.patch(args.couponId, {
            ...args.updates,
            updatedAt: Date.now(),
        });

        return {
            success: true,
            message: "Coupon updated successfully",
        };
    },
});

/**
 * Deactivate coupon
 */
export const deactivateCoupon = mutation({
    args: {
        couponId: v.id("coupons"),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.couponId, {
            isActive: false,
            updatedAt: Date.now(),
        });

        return {
            success: true,
            message: "Coupon deactivated",
        };
    },
});

/**
 * Get coupon usage details
 */
export const getCouponUsages = query({
    args: {
        couponId: v.id("coupons"),
    },
    handler: async (ctx, args) => {
        const usages = await ctx.db
            .query("couponUsages")
            .withIndex("by_coupon_id", (q) => q.eq("couponId", args.couponId))
            .collect();

        // Enrich with user and booking details
        const enrichedUsages = await Promise.all(
            usages.map(async (usage) => {
                const booking = await ctx.db.get(usage.bookingId);

                let userName = "Guest";
                if (usage.userId) {
                    const user = await ctx.db.get(usage.userId);
                    userName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim();
                } else if (booking?.guestDetails) {
                    userName = booking.guestDetails.name;
                }

                return {
                    ...usage,
                    userName,
                    bookingNumber: booking?.bookingNumber,
                };
            })
        );

        return enrichedUsages;
    },
});
