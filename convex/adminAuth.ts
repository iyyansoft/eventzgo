// convex/adminAuth.ts
// Admin authentication actions

import { action, query, mutation } from "./_generated/server";
import { v } from "convex/values";
import * as bcrypt from "bcryptjs";

/**
 * Admin Sign In Action
 */
export const adminSignIn = mutation({
    args: {
        username: v.string(),
        password: v.string(),
    },
    handler: async (ctx, args) => {
        // Try to find by username
        let admin = await ctx.db
            .query("admins")
            .filter((q) => q.eq(q.field("username"), args.username))
            .first();

        // If not found, try by email
        if (!admin) {
            admin = await ctx.db
                .query("admins")
                .filter((q) => q.eq(q.field("email"), args.username))
                .first();
        }

        if (!admin) {
            return { 
                success: false, 
                message: "Invalid credentials" 
            };
        }

        // Check if admin is active
        if (!admin.isActive) {
            return { 
                success: false, 
                message: "Account is disabled" 
            };
        }

        // Verify password
        const isValidPassword = bcrypt.compareSync(args.password, admin.password);

        if (!isValidPassword) {
            return { 
                success: false, 
                message: "Invalid credentials" 
            };
        }

        // Generate session token
        const sessionToken = crypto.randomUUID();

        return {
            success: true,
            sessionToken,
            role: admin.role,
            username: admin.username,
            email: admin.email,
        };
    },
});

/**
 * Find admin by username or email
 */
export const findAdminByUsername = query({
    args: {
        username: v.string(),
    },
    handler: async (ctx, args) => {
        // Try to find by username
        let admin = await ctx.db
            .query("admins")
            .filter((q) => q.eq(q.field("username"), args.username))
            .first();

        // If not found, try by email
        if (!admin) {
            admin = await ctx.db
                .query("admins")
                .filter((q) => q.eq(q.field("email"), args.username))
                .first();
        }

        return admin;
    },
});

/**
 * Get admin by ID
 */
export const getAdminById = query({
    args: {
        adminId: v.id("admins"),
    },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.adminId);
    },
});
