import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Vendor Mutations
export const createOrUpdateVendor = mutation({
  args: {
    clerkId: v.string(),
    companyName: v.string(),
    serviceType: v.string(),
    services: v.array(v.string()), // services array of strings
    priceRange: v.string(),
    location: v.string(),
    description: v.string(),
    website: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get user by Clerk ID to link the userId
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      throw new Error("User not found. Please complete signup first.");
    }

    // Check if vendor profile exists
    const existingVendor = await ctx.db
      .query("vendors")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    const now = Date.now();

    if (existingVendor) {
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
    }

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

    // Update user role to vendor
    await ctx.db.patch(user._id, { role: "vendor" });

    return vendorId;
  },
});

// Speaker Mutations
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
      throw new Error("User not found. Please complete signup first.");
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
    }

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

    await ctx.db.patch(user._id, { role: "speaker" });

    return speakerId;
  },
});

// Sponsor Mutations
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
      throw new Error("User not found. Please complete signup first.");
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
    }

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

    await ctx.db.patch(user._id, { role: "sponsor" });

    return sponsorId;
  },
});
