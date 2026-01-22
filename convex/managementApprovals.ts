import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Query to get all pending management approvals
export const getPendingApprovals = query({
    args: {
        category: v.optional(v.string()), // "all", "organiser", "vendor", "speaker", "sponsor"
    },
    handler: async (ctx, args) => {
        // Parallel queries for better performance
        const [organisers, vendors, speakers, sponsors] = await Promise.all([
            // Fetch organisers with pending status (check both fields for compatibility)
            ctx.db
                .query("organisers")
                .filter((q) => q.or(
                    q.eq(q.field("accountStatus"), "pending_approval"),
                    q.eq(q.field("approvalStatus"), "pending")
                ))
                .collect(),
            // Fetch pending vendors
            ctx.db
                .query("vendors")
                .withIndex("by_approval_status", (q) => q.eq("approvalStatus", "pending"))
                .collect(),
            // Fetch pending speakers
            ctx.db
                .query("speakers")
                .withIndex("by_approval_status", (q) => q.eq("approvalStatus", "pending"))
                .collect(),
            // Fetch pending sponsors
            ctx.db
                .query("sponsors")
                .withIndex("by_approval_status", (q) => q.eq("approvalStatus", "pending"))
                .collect(),
        ]);

        // Get user details for each pending approval
        const organisersWithUsers = organisers.map((org) => {
            return {
                ...org,
                category: "organiser" as const,
                userName: org.contactPerson || org.institutionName || "Unknown",
                userEmail: org.email || "Unknown",
            };
        });

        const vendorsWithUsers = await Promise.all(
            vendors.map(async (vendor) => {
                const user = await ctx.db.get(vendor.userId);
                return {
                    ...vendor,
                    category: "vendor" as const,
                    userName: user ? `${user.firstName} ${user.lastName}` : "Unknown",
                    userEmail: user?.email || "Unknown",
                };
            })
        );

        const speakersWithUsers = await Promise.all(
            speakers.map(async (speaker) => {
                const user = await ctx.db.get(speaker.userId);
                return {
                    ...speaker,
                    category: "speaker" as const,
                    userName: user ? `${user.firstName} ${user.lastName}` : "Unknown",
                    userEmail: user?.email || "Unknown",
                };
            })
        );

        const sponsorsWithUsers = await Promise.all(
            sponsors.map(async (sponsor) => {
                const user = await ctx.db.get(sponsor.userId);
                return {
                    ...sponsor,
                    category: "sponsor" as const,
                    userName: user ? `${user.firstName} ${user.lastName}` : "Unknown",
                    userEmail: user?.email || "Unknown",
                };
            })
        );

        // Filter by category if specified
        if (args.category && args.category !== "all") {
            switch (args.category) {
                case "organiser":
                    return { organisers: organisersWithUsers, vendors: [], speakers: [], sponsors: [] };
                case "vendor":
                    return { organisers: [], vendors: vendorsWithUsers, speakers: [], sponsors: [] };
                case "speaker":
                    return { organisers: [], vendors: [], speakers: speakersWithUsers, sponsors: [] };
                case "sponsor":
                    return { organisers: [], vendors: [], speakers: [], sponsors: sponsorsWithUsers };
            }
        }

        return {
            organisers: organisersWithUsers,
            vendors: vendorsWithUsers,
            speakers: speakersWithUsers,
            sponsors: sponsorsWithUsers,
        };
    },
});

// Query to get approval statistics
export const getApprovalStats = query({
    args: {},
    handler: async (ctx) => {
        const [organisers, vendors, speakers, sponsors] = await Promise.all([
            ctx.db
                .query("organisers")
                .filter((q) => q.eq(q.field("accountStatus"), "pending_approval"))
                .collect(),
            ctx.db
                .query("vendors")
                .withIndex("by_approval_status", (q) => q.eq("approvalStatus", "pending"))
                .collect(),
            ctx.db
                .query("speakers")
                .withIndex("by_approval_status", (q) => q.eq("approvalStatus", "pending"))
                .collect(),
            ctx.db
                .query("sponsors")
                .withIndex("by_approval_status", (q) => q.eq("approvalStatus", "pending"))
                .collect(),
        ]);

        return {
            total: organisers.length + vendors.length + speakers.length + sponsors.length,
            organisers: organisers.length,
            vendors: vendors.length,
            speakers: speakers.length,
            sponsors: sponsors.length,
        };
    },
});

// Mutation to approve an organiser
export const approveOrganiser = mutation({
    args: {
        organiserId: v.id("organisers"),
    },
    handler: async (ctx, args) => {
        const organiser = await ctx.db.get(args.organiserId);
        if (!organiser) throw new Error("Organiser not found");

        // Update organiser status to active
        await ctx.db.patch(args.organiserId, {
            accountStatus: "active",
            approvalStatus: "approved",
            approvedAt: Date.now(),
            isActive: true,
        });

        // Update user role to organiser (only if userId exists - for Clerk users)
        if (organiser.userId) {
            await ctx.db.patch(organiser.userId, {
                role: "organiser",
            });
        }

        return { success: true };
    },
});

// Mutation to reject an organiser
export const rejectOrganiser = mutation({
    args: {
        organiserId: v.id("organisers"),
        reason: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.organiserId, {
            approvalStatus: "rejected",
            rejectionReason: args.reason,
        });

        return { success: true };
    },
});

// Mutation to approve a vendor
export const approveVendor = mutation({
    args: {
        vendorId: v.id("vendors"),
    },
    handler: async (ctx, args) => {
        const vendor = await ctx.db.get(args.vendorId);
        if (!vendor) throw new Error("Vendor not found");

        await ctx.db.patch(args.vendorId, {
            approvalStatus: "approved",
            approvedAt: Date.now(),
        });

        await ctx.db.patch(vendor.userId, {
            role: "vendor",
        });

        return { success: true };
    },
});

// Mutation to reject a vendor
export const rejectVendor = mutation({
    args: {
        vendorId: v.id("vendors"),
        reason: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.vendorId, {
            approvalStatus: "rejected",
            rejectionReason: args.reason,
        });

        return { success: true };
    },
});

// Mutation to approve a speaker
export const approveSpeaker = mutation({
    args: {
        speakerId: v.id("speakers"),
    },
    handler: async (ctx, args) => {
        const speaker = await ctx.db.get(args.speakerId);
        if (!speaker) throw new Error("Speaker not found");

        await ctx.db.patch(args.speakerId, {
            approvalStatus: "approved",
            approvedAt: Date.now(),
        });

        await ctx.db.patch(speaker.userId, {
            role: "speaker",
        });

        return { success: true };
    },
});

// Mutation to reject a speaker
export const rejectSpeaker = mutation({
    args: {
        speakerId: v.id("speakers"),
        reason: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.speakerId, {
            approvalStatus: "rejected",
            rejectionReason: args.reason,
        });

        return { success: true };
    },
});

// Mutation to approve a sponsor
export const approveSponsor = mutation({
    args: {
        sponsorId: v.id("sponsors"),
    },
    handler: async (ctx, args) => {
        const sponsor = await ctx.db.get(args.sponsorId);
        if (!sponsor) throw new Error("Sponsor not found");

        await ctx.db.patch(args.sponsorId, {
            approvalStatus: "approved",
            approvedAt: Date.now(),
        });

        await ctx.db.patch(sponsor.userId, {
            role: "sponsor",
        });

        return { success: true };
    },
});

// Mutation to reject a sponsor
export const rejectSponsor = mutation({
    args: {
        sponsorId: v.id("sponsors"),
        reason: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.sponsorId, {
            approvalStatus: "rejected",
            rejectionReason: args.reason,
        });

        return { success: true };
    },
});

// Soft delete organiser (marks as deleted, keeps data, blocks access)
export const deleteOrganiser = mutation({
    args: {
        organiserId: v.id("organisers"),
    },
    handler: async (ctx, args) => {
        // Soft delete: mark as deleted instead of removing from database
        await ctx.db.patch(args.organiserId, {
            isDeleted: true,
            deletedAt: Date.now(),
            isActive: false,
            accountStatus: "blocked", // Block access to organiser panel
        });

        return { success: true };
    },
});

// Get all active/approved organisers (excluding deleted)
export const getActiveOrganisers = query({
    handler: async (ctx) => {
        const organisers = await ctx.db
            .query("organisers")
            .filter((q) =>
                q.and(
                    q.eq(q.field("approvalStatus"), "approved"),
                    q.or(
                        q.eq(q.field("isDeleted"), false),
                        q.eq(q.field("isDeleted"), undefined)
                    )
                )
            )
            .order("desc")
            .collect();

        return organisers;
    },
});

// Get all deleted organisers
export const getDeletedOrganisers = query({
    handler: async (ctx) => {
        const organisers = await ctx.db
            .query("organisers")
            .filter((q) => q.eq(q.field("isDeleted"), true))
            .order("desc")
            .collect();

        return organisers;
    },
});
