// convex/auth/authMutations.ts
// Mutation functions for authentication

import { mutation } from "../_generated/server";
import { v } from "convex/values";

/**
 * Register new organiser (Authentication)
 */
export const registerOrganiser = mutation({
    args: {
        userId: v.id("users"),
        clerkId: v.string(),
        username: v.string(),
        email: v.string(),
        passwordHash: v.string(),
        institutionName: v.string(),
        phone: v.optional(v.string()),
        accountStatus: v.optional(v.union(
            v.literal("pending_verification"),
            v.literal("pending_setup"),
            v.literal("pending_approval"),
            v.literal("active"),
            v.literal("suspended"),
            v.literal("blocked")
        )),
    },
    handler: async (ctx, args) => {
        const now = Date.now();

        // Insert with placeholder data for required fields
        const organiserId = await ctx.db.insert("organisers", {
            userId: args.userId,
            clerkId: args.clerkId || "custom_auth",

            // Auth details
            username: args.username,
            email: args.email,
            passwordHash: args.passwordHash,
            accountStatus: args.accountStatus || "pending_verification",

            // Profile details
            institutionName: args.institutionName,
            phone: args.phone,

            // Required placeholders (will be filled in onboarding)
            address: {
                street: "Pending",
                city: "Pending",
                state: "Pending",
                pincode: "000000"
            },
            gstNumber: "PENDING",
            panNumber: "PENDING",
            bankDetails: {
                accountHolderName: "Pending",
                accountNumber: "Pending",
                ifscCode: "PENDING",
                bankName: "Pending",
                branchName: "Pending"
            },
            documents: {},

            approvalStatus: "pending",
            isActive: true,
            createdAt: now,
            updatedAt: now,
        });

        return organiserId;
    },
});

/**
 * Update rate limit
 */
export const updateRateLimit = mutation({
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
            if (record) {
                await ctx.db.delete(record._id);
            }
            await ctx.db.insert("rateLimits", {
                identifier: args.identifier,
                action: args.action,
                attempts: 1,
                windowStart: Date.now(),
                lastAttempt: Date.now(),
            });
        } else {
            await ctx.db.patch(record._id, {
                attempts: record.attempts + 1,
                lastAttempt: Date.now(),
            });
        }
    },
});

/**
 * Log security event
 */
export const logSecurityEvent = mutation({
    args: {
        userId: v.optional(v.id("organisers")),
        eventType: v.string(),
        eventCategory: v.string(),
        description: v.string(),
        ipAddress: v.optional(v.string()),
        userAgent: v.optional(v.string()),
        severity: v.union(v.literal("info"), v.literal("warning"), v.literal("critical")),
        metadata: v.optional(v.any()),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("securityAuditLogs", {
            userId: args.userId,
            eventType: args.eventType,
            eventCategory: args.eventCategory,
            description: args.description,
            ipAddress: args.ipAddress,
            userAgent: args.userAgent,
            metadata: args.metadata,
            severity: args.severity,
            timestamp: Date.now(),
        });
    },
});

/**
 * Update organiser failed login attempts
 */
export const updateFailedAttempts = mutation({
    args: {
        organiserId: v.id("organisers"),
        failedAttempts: v.number(),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.organiserId, {
            failedLoginAttempts: args.failedAttempts,
            updatedAt: Date.now(),
        });
    },
});

/**
 * Suspend organiser account
 */
export const suspendAccount = mutation({
    args: {
        organiserId: v.id("organisers"),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.organiserId, {
            accountStatus: "suspended",
            updatedAt: Date.now(),
        });
    },
});

/**
 * Reset failed attempts and update last login
 */
export const successfulLogin = mutation({
    args: {
        organiserId: v.id("organisers"),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.organiserId, {
            failedLoginAttempts: 0,
            lastLoginAt: Date.now(),
            updatedAt: Date.now(),
        });
    },
});

/**
 * Create session
 */
export const createSession = mutation({
    args: {
        userId: v.id("organisers"),
        sessionToken: v.string(),
        ipAddress: v.optional(v.string()),
        userAgent: v.optional(v.string()),
        deviceFingerprint: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("sessions", {
            userId: args.userId,
            sessionToken: args.sessionToken,
            ipAddress: args.ipAddress,
            userAgent: args.userAgent,
            deviceFingerprint: args.deviceFingerprint,
            expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
            lastActivityAt: Date.now(),
            isActive: true,
            createdAt: Date.now(),
        });
    },
});

/**
 * Update session activity
 */
export const updateSessionActivity = mutation({
    args: {
        sessionToken: v.string(),
    },
    handler: async (ctx, args) => {
        const session = await ctx.db
            .query("sessions")
            .withIndex("by_session_token", (q) => q.eq("sessionToken", args.sessionToken))
            .first();

        if (session) {
            await ctx.db.patch(session._id, {
                lastActivityAt: Date.now(),
            });
        }
    },
});

/**
 * Invalidate session
 */
export const invalidateSession = mutation({
    args: {
        sessionToken: v.string(),
    },
    handler: async (ctx, args) => {
        const session = await ctx.db
            .query("sessions")
            .withIndex("by_session_token", (q) => q.eq("sessionToken", args.sessionToken))
            .first();

        if (session) {
            await ctx.db.patch(session._id, {
                isActive: false,
            });
        }
    },
});

/**
 * Store password reset token
 */
export const storeResetToken = mutation({
    args: {
        organiserId: v.id("organisers"),
        tokenHash: v.string(),
        expiresAt: v.number(),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("passwordResets", {
            organiserId: args.organiserId,
            tokenHash: args.tokenHash,
            expiresAt: args.expiresAt,
            used: false,
            createdAt: Date.now(),
        });
    },
});

/**
 * Complete password reset
 */
export const completePasswordReset = mutation({
    args: {
        tokenHash: v.string(),
        passwordHash: v.string(),
    },
    handler: async (ctx, args) => {
        const record = await ctx.db.query("passwordResets")
            .withIndex("by_token_hash", q => q.eq("tokenHash", args.tokenHash))
            .first();

        if (!record || record.used || record.expiresAt < Date.now()) {
            throw new Error("Invalid or expired token");
        }

        await ctx.db.patch(record._id, { used: true, usedAt: Date.now() });

        await ctx.db.patch(record.organiserId, {
            passwordHash: args.passwordHash,
            updatedAt: Date.now()
        });
    },
});

/**
 * Verify Email Address
 */
export const verifyEmail = mutation({
    args: { token: v.string() },
    handler: async (ctx, args) => {
        const user = await ctx.db.query("organisers")
            .withIndex("by_email_verification_token", q => q.eq("emailVerificationToken", args.token))
            .first();

        if (!user) throw new Error("Invalid or expired verification token");

        await ctx.db.patch(user._id, {
            accountStatus: "pending_setup",
            emailVerificationToken: undefined,
            updatedAt: Date.now()
        });

        return user._id;
    }
});
