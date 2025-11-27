import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create or update vendor profile
export const createOrUpdateVendor = mutation({
    args: {
        clerkId: v.string(),
        companyName: v.string(),
        serviceType: v.string(),
        services: v.array(v.string()),
        priceRange: v.string(),
        location: v.string(),
        description: v.string(),
        website: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // Get or create user
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
            .first();

        if (!user) {
            throw new Error("User not found");
        }

        // Check if vendor profile already exists
        const existingVendor = await ctx.db
            .query("vendors")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
            .first();

        const now = Date.now();

        if (existingVendor) {
            // Update existing vendor
            await ctx.db.patch(existingVendor._id, {
                companyName: args.companyName,
                serviceType: args.serviceType,
                services: args.services,
                priceRange: args.priceRange,
                location: args.location,
                description: args.description,
                website: args.website,
                updatedAt: now,
            });
            return existingVendor._id;
        } else {
            // Create new vendor
            const vendorId = await ctx.db.insert("vendors", {
                userId: user._id,
                clerkId: args.clerkId,
                companyName: args.companyName,
                serviceType: args.serviceType,
                services: args.services,
                priceRange: args.priceRange,
                location: args.location,
                description: args.description,
                website: args.website,
                approvalStatus: "pending",
                isActive: true,
                createdAt: now,
                updatedAt: now,
            });

            // Update user role
            await ctx.db.patch(user._id, {
                role: "vendor",
                updatedAt: now,
            });

            return vendorId;
        }
    },
});

// Create or update speaker profile
export const createOrUpdateSpeaker = mutation({
    args: {
        clerkId: v.string(),
        title: v.string(),
        bio: v.string(),
        expertise: v.array(v.string()),
        topics: v.array(v.string()),
        languages: v.array(v.string()),
        speakingFee: v.string(),
        location: v.string(),
        companyName: v.optional(v.string()),
        website: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
            .first();

        if (!user) {
            throw new Error("User not found");
        }

        const existingSpeaker = await ctx.db
            .query("speakers")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
            .first();

        const now = Date.now();

        if (existingSpeaker) {
            await ctx.db.patch(existingSpeaker._id, {
                title: args.title,
                bio: args.bio,
                expertise: args.expertise,
                topics: args.topics,
                languages: args.languages,
                speakingFee: args.speakingFee,
                location: args.location,
                companyName: args.companyName,
                website: args.website,
                updatedAt: now,
            });
            return existingSpeaker._id;
        } else {
            const speakerId = await ctx.db.insert("speakers", {
                userId: user._id,
                clerkId: args.clerkId,
                title: args.title,
                bio: args.bio,
                expertise: args.expertise,
                topics: args.topics,
                languages: args.languages,
                speakingFee: args.speakingFee,
                location: args.location,
                companyName: args.companyName,
                website: args.website,
                approvalStatus: "pending",
                isActive: true,
                createdAt: now,
                updatedAt: now,
            });

            await ctx.db.patch(user._id, {
                role: "speaker",
                updatedAt: now,
            });

            return speakerId;
        }
    },
});

// Create or update sponsor profile
export const createOrUpdateSponsor = mutation({
    args: {
        clerkId: v.string(),
        companyName: v.string(),
        industry: v.string(),
        description: v.string(),
        sponsorshipBudget: v.string(),
        preferredEvents: v.array(v.string()),
        location: v.string(),
        website: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
            .first();

        if (!user) {
            throw new Error("User not found");
        }

        const existingSponsor = await ctx.db
            .query("sponsors")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
            .first();

        const now = Date.now();

        if (existingSponsor) {
            await ctx.db.patch(existingSponsor._id, {
                companyName: args.companyName,
                industry: args.industry,
                description: args.description,
                sponsorshipBudget: args.sponsorshipBudget,
                preferredEvents: args.preferredEvents,
                location: args.location,
                website: args.website,
                updatedAt: now,
            });
            return existingSponsor._id;
        } else {
            const sponsorId = await ctx.db.insert("sponsors", {
                userId: user._id,
                clerkId: args.clerkId,
                companyName: args.companyName,
                industry: args.industry,
                description: args.description,
                sponsorshipBudget: args.sponsorshipBudget,
                preferredEvents: args.preferredEvents,
                location: args.location,
                website: args.website,
                approvalStatus: "pending",
                isActive: true,
                createdAt: now,
                updatedAt: now,
            });

            await ctx.db.patch(user._id, {
                role: "sponsor",
                updatedAt: now,
            });

            return sponsorId;
        }
    },
});

// Get user profile with role-specific data
export const getUserProfile = query({
    args: { clerkId: v.string() },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
            .first();

        if (!user) {
            return null;
        }

        let roleData = null;

        // Fetch role-specific data based on user role
        switch (user.role) {
            case "organiser":
                roleData = await ctx.db
                    .query("organisers")
                    .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
                    .first();
                break;
            case "vendor":
                roleData = await ctx.db
                    .query("vendors")
                    .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
                    .first();
                break;
            case "speaker":
                roleData = await ctx.db
                    .query("speakers")
                    .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
                    .first();
                break;
            case "sponsor":
                roleData = await ctx.db
                    .query("sponsors")
                    .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
                    .first();
                break;
        }

        return {
            ...user,
            roleData,
        };
    },
});

// Get all pending approvals (for admin)
export const getPendingApprovals = query({
    args: {},
    handler: async (ctx) => {
        const pendingVendors = await ctx.db
            .query("vendors")
            .withIndex("by_approval_status", (q) => q.eq("approvalStatus", "pending"))
            .collect();

        const pendingSpeakers = await ctx.db
            .query("speakers")
            .withIndex("by_approval_status", (q) => q.eq("approvalStatus", "pending"))
            .collect();

        const pendingSponsors = await ctx.db
            .query("sponsors")
            .withIndex("by_approval_status", (q) => q.eq("approvalStatus", "pending"))
            .collect();

        return {
            vendors: pendingVendors,
            speakers: pendingSpeakers,
            sponsors: pendingSponsors,
        };
    },
});

// Approve/Reject vendor
export const updateVendorApproval = mutation({
    args: {
        vendorId: v.id("vendors"),
        status: v.union(v.literal("approved"), v.literal("rejected")),
        adminClerkId: v.string(),
        rejectionReason: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const admin = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.adminClerkId))
            .first();

        if (!admin || admin.role !== "admin") {
            throw new Error("Unauthorized");
        }

        const now = Date.now();

        await ctx.db.patch(args.vendorId, {
            approvalStatus: args.status,
            approvedBy: admin._id,
            approvedAt: now,
            rejectionReason: args.rejectionReason,
            updatedAt: now,
        });

        return { success: true };
    },
});

// Approve/Reject speaker
export const updateSpeakerApproval = mutation({
    args: {
        speakerId: v.id("speakers"),
        status: v.union(v.literal("approved"), v.literal("rejected")),
        adminClerkId: v.string(),
        rejectionReason: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const admin = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.adminClerkId))
            .first();

        if (!admin || admin.role !== "admin") {
            throw new Error("Unauthorized");
        }

        const now = Date.now();

        await ctx.db.patch(args.speakerId, {
            approvalStatus: args.status,
            approvedBy: admin._id,
            approvedAt: now,
            rejectionReason: args.rejectionReason,
            updatedAt: now,
        });

        return { success: true };
    },
});

// Approve/Reject sponsor
export const updateSponsorApproval = mutation({
    args: {
        sponsorId: v.id("sponsors"),
        status: v.union(v.literal("approved"), v.literal("rejected")),
        adminClerkId: v.string(),
        rejectionReason: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const admin = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.adminClerkId))
            .first();

        if (!admin || admin.role !== "admin") {
            throw new Error("Unauthorized");
        }

        const now = Date.now();

        await ctx.db.patch(args.sponsorId, {
            approvalStatus: args.status,
            approvedBy: admin._id,
            approvedAt: now,
            rejectionReason: args.rejectionReason,
            updatedAt: now,
        });

        return { success: true };
    },
});
