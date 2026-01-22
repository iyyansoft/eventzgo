// convex/seedAdmin.ts
// Mutation to create initial admin account

import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Create initial admin account
 * This is a one-time setup mutation
 */
export const createInitialAdmin = mutation({
  args: {
    username: v.string(),
    password: v.string(), // This should be the HASHED password
    email: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if admin already exists
    const existingAdmin = await ctx.db
      .query("admins")
      .filter((q) => q.eq(q.field("username"), args.username))
      .first();

    if (existingAdmin) {
      throw new Error("Admin already exists");
    }

    // Create admin
    const adminId = await ctx.db.insert("admins", {
      username: args.username,
      password: args.password,
      email: args.email,
      role: "admin",
      isActive: true,
      createdAt: Date.now(),
    });

    return {
      success: true,
      adminId,
      message: "Admin account created successfully",
    };
  },
});

/**
 * List all admins (for verification)
 */
export const listAdmins = mutation({
  handler: async (ctx) => {
    const admins = await ctx.db.query("admins").collect();
    
    // Return without passwords for security
    return admins.map(admin => ({
      _id: admin._id,
      username: admin.username,
      email: admin.email,
      role: admin.role,
      isActive: admin.isActive,
    }));
  },
});
