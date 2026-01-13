// convex/auth/authQueries.ts
// Query functions for authentication

import { query } from "../_generated/server";
import { v } from "convex/values";

/**
 * Check rate limit for an identifier
 */
export const checkRateLimit = query({
    args: {
        identifier: v.string(),
        action: v.union(v.literal("login"), v.literal("password_reset"), v.literal("api_call")),
    },
    handler: async (ctx, args) => {
        const limits = {
            login: { maxAttempts: 5, windowMs: 15 * 60 * 1000 },
            password_reset: { maxAttempts: 3, windowMs: 60 * 60 * 1000 },
            api_call: { maxAttempts: 100, windowMs: 60 * 1000 },
        };

        const limit = limits[args.action];
        const windowStart = Date.now() - limit.windowMs;

        const record = await ctx.db
            .query("rateLimits")
            .withIndex("by_identifier_action", (q) =>
                q.eq("identifier", args.identifier).eq("action", args.action)
            )
            .first();

        if (!record || record.windowStart < windowStart) {
            return { allowed: true };
        }

        if (record.attempts >= limit.maxAttempts) {
            const minutesLeft = Math.ceil((record.windowStart + limit.windowMs - Date.now()) / 60000);
            return {
                allowed: false,
                message: `Too many ${args.action} attempts. Please try again in ${minutesLeft} minute(s).`,
            };
        }

        return { allowed: true };
    },
});

/**
 * Find organiser by username
 */
export const findOrganiserByUsername = query({
    args: {
        username: v.string(),
    },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("organisers")
            .withIndex("by_username", (q) => q.eq("username", args.username))
            .first();
    },
});

/**
 * Verify session
 */
export const verifySession = query({
    args: {
        sessionToken: v.string(),
    },
    handler: async (ctx, args) => {
        const session = await ctx.db
            .query("sessions")
            .withIndex("by_session_token", (q) => q.eq("sessionToken", args.sessionToken))
            .first();

        if (!session) {
            return { valid: false, error: "Session not found" };
        }

        if (!session.isActive) {
            return { valid: false, error: "Session is inactive" };
        }

        if (session.expiresAt < Date.now()) {
            return { valid: false, error: "Session expired" };
        }

        const idleTimeout = 30 * 60 * 1000; // 30 minutes
        if (session.lastActivityAt + idleTimeout < Date.now()) {
            return { valid: false, error: "Session timed out due to inactivity" };
        }

        return { valid: true, userId: session.userId };
    },
});

/**
 * Get organiser by ID
 */
export const getOrganiserById = query({
    args: {
        organiserId: v.id("organisers"),
    },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.organiserId);
    },
});

/**
 * Get organiser by Email
 */
export const getOrganiserByEmail = query({
    args: {
        email: v.string(),
    },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("organisers")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .first();
    },
});
