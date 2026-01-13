// convex/management.ts - Enhanced with existing organiser sync
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ============= ORGANISER REGISTRATION =============

export const registerOrganiser = mutation({
    args: {
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
        // Get user by clerkId, or create if doesn't exist
        let user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
            .first();

        // If user doesn't exist in Convex, create them
        if (!user) {
            const userId = await ctx.db.insert("users", {
                clerkId: args.clerkId,
                email: "", // Will be updated by Clerk webhook
                role: "organiser",
                isActive: true,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            });

            user = await ctx.db.get(userId);
            if (!user) {
                throw new Error("Failed to create user");
            }
        }

        // Check if organiser already exists
        const existingOrganiser = await ctx.db
            .query("organisers")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
            .first();

        if (existingOrganiser) {
            throw new Error("Organiser profile already exists");
        }

        // Create organiser profile
        const organiserId = await ctx.db.insert("organisers", {
            userId: user._id,
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
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });

        return { organiserId, status: "pending" };
    },
});

// ============= NEW: CHECK IF ORGANISER EXISTS BY EMAIL =============

export const checkOrganiserByEmail = query({
    args: {
        email: v.string(),
    },
    handler: async (ctx, args) => {
        // First find user by email
        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .first();

        if (!user) {
            return null;
        }

        // Then check if this user is an organiser
        const organiser = await ctx.db
            .query("organisers")
            .filter((q) => q.eq(q.field("userId"), user._id))
            .first();

        if (!organiser) {
            return null;
        }

        return {
            organiserId: organiser._id,
            userId: user._id,
            hasClerkId: !!organiser.clerkId,
            approvalStatus: organiser.approvalStatus,
            institutionName: organiser.institutionName,
        };
    },
});

// ============= NEW: SYNC EXISTING ORGANISER WITH CLERK =============

export const syncExistingOrganiserWithClerk = mutation({
    args: {
        email: v.string(),
        clerkId: v.string(),
    },
    handler: async (ctx, args) => {
        // Find user by email
        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .first();

        if (!user) {
            throw new Error("User not found");
        }

        // Update user with Clerk ID
        await ctx.db.patch(user._id, {
            clerkId: args.clerkId,
        });

        // Find organiser by userId
        const organiser = await ctx.db
            .query("organisers")
            .filter((q) => q.eq(q.field("userId"), user._id))
            .first();

        if (organiser) {
            // Update organiser with Clerk ID
            await ctx.db.patch(organiser._id, {
                clerkId: args.clerkId,
                updatedAt: Date.now(),
            });

            return {
                success: true,
                organiserId: organiser._id,
                approvalStatus: organiser.approvalStatus,
                message: "Existing organiser synced with Clerk account",
            };
        }

        return {
            success: false,
            message: "No organiser profile found for this user",
        };
    },
});

// ============= GET ORGANISER STATUS =============

export const getOrganiserStatus = query({
    args: {
        clerkId: v.string(),
    },
    handler: async (ctx, args) => {
        const organiser = await ctx.db
            .query("organisers")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
            .first();

        if (!organiser) {
            return null;
        }

        return {
            status: organiser.approvalStatus,
            rejectionReason: organiser.rejectionReason,
            approvedAt: organiser.approvedAt,
            documents: organiser.documents,
            rejectedAt: organiser.approvalStatus === 'rejected' ? organiser.updatedAt : undefined,
        };
    },
});

// ============= GET USER ROLE =============

export const getUserRole = query({
    args: {
        clerkId: v.string(),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
            .first();

        if (!user) {
            return null;
        }

        return {
            role: user.role,
            isActive: user.isActive,
        };
    },
});

// ============= ADMIN: GET PENDING ORGANISERS =============

export const getPendingOrganisers = query({
    args: {},
    handler: async (ctx) => {
        const organisers = await ctx.db
            .query("organisers")
            .withIndex("by_approval_status", (q) => q.eq("approvalStatus", "pending"))
            .collect();

        const organisersWithUsers = await Promise.all(
            organisers.map(async (organiser) => {
                const user = organiser.userId ? await ctx.db.get(organiser.userId) : null;
                return {
                    ...organiser,
                    user: user
                        ? {
                            email: user.email,
                            firstName: user.firstName,
                            lastName: user.lastName,
                            profileImage: user.profileImage,
                            phone: user.phone,
                        }
                        : null,
                };
            })
        );

        return organisersWithUsers;
    },
});

// ============= ADMIN: GET ALL ORGANISERS =============

export const getAllOrganisers = query({
    args: {},
    handler: async (ctx) => {
        const organisers = await ctx.db.query("organisers").collect();

        const organisersWithUsers = await Promise.all(
            organisers.map(async (organiser) => {
                const user = organiser.userId ? await ctx.db.get(organiser.userId) : null;

                // Count events for this organiser
                const events = await ctx.db
                    .query("events")
                    .withIndex("by_organiser_id", (q) => q.eq("organiserId", organiser._id))
                    .collect();

                return {
                    ...organiser,
                    totalEvents: events.length,
                    user: user
                        ? {
                            email: user.email,
                            firstName: user.firstName,
                            lastName: user.lastName,
                            profileImage: user.profileImage,
                            phone: user.phone,
                        }
                        : null,
                };
            })
        );

        return organisersWithUsers;
    },
});

// ============= ADMIN: APPROVE ORGANISER =============

export const approveOrganiser = mutation({
    args: {
        organiserId: v.id("organisers"),
        adminClerkId: v.string(),
    },
    handler: async (ctx, args) => {
        // Get admin user
        const admin = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.adminClerkId))
            .first();

        if (!admin || admin.role !== "admin") {
            throw new Error("Unauthorized: Admin access required");
        }

        // Get organiser
        const organiser = await ctx.db.get(args.organiserId);
        if (!organiser) {
            throw new Error("Organiser not found");
        }

        // Update organiser status
        await ctx.db.patch(args.organiserId, {
            approvalStatus: "approved",
            approvedBy: admin._id,
            approvedAt: Date.now(),
            updatedAt: Date.now(),
        });

        // Create notification
        await ctx.db.insert("notifications", {
            senderId: admin._id,
            recipientId: organiser.userId,
            recipientType: "user",
            subject: "Organiser Application Approved",
            message: "Congratulations! Your organiser application has been approved. You can now create and manage events.",
            priority: "high",
            isRead: false,
            createdAt: Date.now(),
        });

        return { success: true };
    },
});

// ============= ADMIN: REJECT ORGANISER =============

export const rejectOrganiser = mutation({
    args: {
        organiserId: v.id("organisers"),
        adminClerkId: v.string(),
        reason: v.string(),
    },
    handler: async (ctx, args) => {
        // Get admin user
        const admin = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.adminClerkId))
            .first();

        if (!admin || admin.role !== "admin") {
            throw new Error("Unauthorized: Admin access required");
        }

        // Get organiser
        const organiser = await ctx.db.get(args.organiserId);
        if (!organiser) {
            throw new Error("Organiser not found");
        }

        // Update organiser status
        await ctx.db.patch(args.organiserId, {
            approvalStatus: "rejected",
            rejectionReason: args.reason,
            updatedAt: Date.now(),
        });

        // Create notification
        await ctx.db.insert("notifications", {
            senderId: admin._id,
            recipientId: organiser.userId,
            recipientType: "user",
            subject: "Organiser Application Rejected",
            message: `Unfortunately, your organiser application has been rejected. Reason: ${args.reason}`,
            priority: "high",
            isRead: false,
            createdAt: Date.now(),
        });

        return { success: true };
    },
});

// ============= GET ORGANISER PROFILE =============

export const getOrganiserProfile = query({
    args: {
        clerkId: v.string(),
    },
    handler: async (ctx, args) => {
        const organiser = await ctx.db
            .query("organisers")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
            .first();

        if (!organiser) {
            return null;
        }

        const user = organiser.userId ? await ctx.db.get(organiser.userId) : null;

        // Count events
        const events = await ctx.db
            .query("events")
            .withIndex("by_organiser_id", (q) => q.eq("organiserId", organiser._id))
            .collect();

        // Count total bookings and revenue
        let totalBookings = 0;
        let totalRevenue = 0;

        for (const event of events) {
            const bookings = await ctx.db
                .query("bookings")
                .withIndex("by_event_id", (q) => q.eq("eventId", event._id))
                .filter((q) => q.eq(q.field("status"), "confirmed"))
                .collect();

            totalBookings += bookings.length;
            totalRevenue += bookings.reduce((sum, booking) => sum + booking.totalAmount, 0);
        }

        return {
            ...organiser,
            totalEvents: events.length,
            totalBookings,
            totalRevenue,
            user: user
                ? {
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    profileImage: user.profileImage,
                }
                : null,
        };
    },
});

// ============= CHECK IF ADMIN =============

export const isAdmin = query({
    args: {
        clerkId: v.string(),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
            .first();

        return user?.role === "admin";
    },
});

// ============= CHECK IF APPROVED ORGANISER =============

export const isApprovedOrganiser = query({
    args: {
        clerkId: v.string(),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
            .first();

        if (user?.role !== "organiser") {
            return false;
        }

        const organiser = await ctx.db
            .query("organisers")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
            .first();

        return organiser?.approvalStatus === "approved";
    },
});

// ============= NEW: GET ORGANISER BY CLERK ID (for dashboards) =============

export const getOrganiserByClerkId = query({
    args: {
        clerkId: v.string(),
    },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("organisers")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
            .first();
    },
});