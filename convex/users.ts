// convex/users.ts - User management with both internal and public mutations
import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";

export const createUser = internalMutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    profileImage: v.optional(v.string()),
    phone: v.optional(v.string()),
    role: v.union(
      v.literal("user"),
      v.literal("organiser"),
      v.literal("admin"),
      v.literal("vendor"),
      v.literal("speaker"),
      v.literal("sponsor")
    ),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existing) {
      return existing._id;
    }

    // Create new user
    const userId = await ctx.db.insert("users", {
      ...args,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return userId;
  },
});

export const updateUser = internalMutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    profileImage: v.optional(v.string()),
    phone: v.optional(v.string()),
    role: v.union(
      v.literal("user"),
      v.literal("organiser"),
      v.literal("admin"),
      v.literal("vendor"),
      v.literal("speaker"),
      v.literal("sponsor")
    ),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, {
      email: args.email,
      firstName: args.firstName,
      lastName: args.lastName,
      profileImage: args.profileImage,
      phone: args.phone,
      role: args.role,
      updatedAt: Date.now(),
    });

    return user._id;
  },
});

export const getUserByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();
  },
});

// Public mutation for syncing user data (used by useAuth and checkout)
export const syncUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    phone: v.optional(v.string()),
    profileImage: v.optional(v.string()),
    role: v.optional(v.union(
      v.literal("user"),
      v.literal("organiser"),
      v.literal("admin"),
      v.literal("vendor"),
      v.literal("speaker"),
      v.literal("sponsor")
    )),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    const now = Date.now();

    if (existingUser) {
      await ctx.db.patch(existingUser._id, {
        email: args.email,
        firstName: args.firstName,
        lastName: args.lastName,
        phone: args.phone,
        profileImage: args.profileImage,
        role: args.role || existingUser.role,
        updatedAt: now,
      });
      return existingUser._id;
    } else {
      const userId = await ctx.db.insert("users", {
        clerkId: args.clerkId,
        email: args.email,
        firstName: args.firstName,
        lastName: args.lastName,
        phone: args.phone,
        profileImage: args.profileImage,
        role: args.role || "user",
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });
      return userId;
    }
  },
});

// Query to get current authenticated user
export const getCurrentUser = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    return user;
  },
});


export const updateProfile = mutation({
  args: {
    clerkId: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    phone: v.string(),
    city: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Validate required fields
    if (!args.firstName || args.firstName.trim() === "") {
      throw new Error("First name is required");
    }
    if (!args.lastName || args.lastName.trim() === "") {
      throw new Error("Last name is required");
    }
    if (!args.phone || args.phone.trim() === "") {
      throw new Error("Phone number is required");
    }

    // Validate phone number format (Indian format: 10 digits starting with 6-9)
    const phoneRegex = /^[6-9]\d{9}$/;
    const cleanPhone = args.phone.replace(/\s+/g, '').replace(/^(\+91|91)/, '');
    if (!phoneRegex.test(cleanPhone)) {
      throw new Error("Invalid phone number. Please enter a valid 10-digit Indian mobile number");
    }

    await ctx.db.patch(user._id, {
      firstName: args.firstName.trim(),
      lastName: args.lastName.trim(),
      phone: cleanPhone,
      city: args.city?.trim(),
      updatedAt: Date.now(),
    });

    return user._id;
  },
});

// Query to get all Clerk users for admin management
export const getAllClerkUsers = query({
  handler: async (ctx) => {
    const users = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), "user"))
      .order("desc")
      .collect();
    
    return users;
  },
});
