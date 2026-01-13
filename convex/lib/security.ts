// convex/lib/security.ts
// Security utilities for rate limiting, audit logging, and attack prevention

import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { Id } from "../_generated/dataModel";
import { anyApi } from "convex/server";
const internalAny = anyApi;

/**
 * Rate Limiting Configuration
 */
const RATE_LIMITS = {
    login: { maxAttempts: 5, windowMinutes: 15 },
    password_reset: { maxAttempts: 3, windowMinutes: 60 },
    api_call: { maxAttempts: 100, windowMinutes: 1 },
} as const;

/**
 * Check and enforce rate limiting
 */
export const checkRateLimit = mutation({
    args: {
        identifier: v.string(), // IP address or user ID
        action: v.union(
            v.literal("login"),
            v.literal("password_reset"),
            v.literal("api_call")
        ),
    },
    handler: async (ctx, args) => {
        const now = Date.now();
        const limit = RATE_LIMITS[args.action];
        const windowMs = limit.windowMinutes * 60 * 1000;

        // Get existing rate limit record
        const existing = await ctx.db
            .query("rateLimits")
            .withIndex("by_identifier_action", (q) =>
                q.eq("identifier", args.identifier).eq("action", args.action)
            )
            .first();

        // Check if window has expired
        if (existing && now - existing.windowStart > windowMs) {
            // Reset window
            await ctx.db.patch(existing._id, {
                attempts: 1,
                windowStart: now,
                lastAttempt: now,
            });
            return {
                allowed: true,
                remaining: limit.maxAttempts - 1,
                resetAt: now + windowMs,
            };
        }

        // Check if limit exceeded
        if (existing && existing.attempts >= limit.maxAttempts) {
            const resetAt = existing.windowStart + windowMs;
            const waitMinutes = Math.ceil((resetAt - now) / 60000);

            return {
                allowed: false,
                remaining: 0,
                resetAt,
                message: `Too many ${args.action} attempts. Please try again in ${waitMinutes} minute(s).`,
            };
        }

        // Increment or create
        if (existing) {
            await ctx.db.patch(existing._id, {
                attempts: existing.attempts + 1,
                lastAttempt: now,
            });
            return {
                allowed: true,
                remaining: limit.maxAttempts - existing.attempts - 1,
                resetAt: existing.windowStart + windowMs,
            };
        } else {
            await ctx.db.insert("rateLimits", {
                identifier: args.identifier,
                action: args.action,
                attempts: 1,
                windowStart: now,
                lastAttempt: now,
            });
            return {
                allowed: true,
                remaining: limit.maxAttempts - 1,
                resetAt: now + windowMs,
            };
        }
    },
});

/**
 * Log security events for audit trail
 */
export const logSecurityEvent = mutation({
    args: {
        userId: v.optional(v.id("organisers")),
        eventType: v.string(),
        eventCategory: v.string(),
        description: v.string(),
        ipAddress: v.optional(v.string()),
        userAgent: v.optional(v.string()),
        metadata: v.optional(v.any()),
        severity: v.union(
            v.literal("info"),
            v.literal("warning"),
            v.literal("critical")
        ),
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

        // Log to console for immediate visibility
        console.log(`[SECURITY ${args.severity.toUpperCase()}]`, {
            type: args.eventType,
            user: args.userId,
            ip: args.ipAddress,
            description: args.description,
        });

        // TODO: Alert admins on critical events
        if (args.severity === "critical") {
            console.error("🚨 CRITICAL SECURITY EVENT:", args.description);
        }
    },
});

/**
 * Create a new session
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
        const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

        const sessionId = await ctx.db.insert("sessions", {
            userId: args.userId,
            sessionToken: args.sessionToken,
            ipAddress: args.ipAddress,
            userAgent: args.userAgent,
            deviceFingerprint: args.deviceFingerprint,
            expiresAt,
            lastActivityAt: Date.now(),
            isActive: true,
            createdAt: Date.now(),
        });

        // Log session creation
        await ctx.runMutation(internalAny.lib.security.logSecurityEvent, {
            userId: args.userId,
            eventType: "session_created",
            eventCategory: "authentication",
            description: "New session created",
            ipAddress: args.ipAddress,
            userAgent: args.userAgent,
            severity: "info",
        });

        return { sessionId, expiresAt };
    },
});

/**
 * Verify and update session
 */
export const verifySession = query({
    args: {
        sessionToken: v.string(),
    },
    handler: async (ctx, args) => {
        const session = await ctx.db
            .query("sessions")
            .withIndex("by_session_token", (q) =>
                q.eq("sessionToken", args.sessionToken)
            )
            .first();

        if (!session) {
            return { valid: false, error: "Session not found" };
        }

        if (!session.isActive) {
            return { valid: false, error: "Session inactive" };
        }

        if (session.expiresAt < Date.now()) {
            return { valid: false, error: "Session expired" };
        }

        // Check for idle timeout (30 minutes)
        const idleTimeout = 30 * 60 * 1000;
        if (Date.now() - session.lastActivityAt > idleTimeout) {
            return { valid: false, error: "Session timed out due to inactivity" };
        }

        return {
            valid: true,
            userId: session.userId,
            expiresAt: session.expiresAt,
        };
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
            .withIndex("by_session_token", (q) =>
                q.eq("sessionToken", args.sessionToken)
            )
            .first();

        if (session && session.isActive) {
            await ctx.db.patch(session._id, {
                lastActivityAt: Date.now(),
            });
        }
    },
});

/**
 * Invalidate session (logout)
 */
export const invalidateSession = mutation({
    args: {
        sessionToken: v.string(),
    },
    handler: async (ctx, args) => {
        const session = await ctx.db
            .query("sessions")
            .withIndex("by_session_token", (q) =>
                q.eq("sessionToken", args.sessionToken)
            )
            .first();

        if (session) {
            await ctx.db.patch(session._id, {
                isActive: false,
            });

            // Log session termination
            await ctx.runMutation(internalAny.lib.security.logSecurityEvent, {
                userId: session.userId,
                eventType: "session_terminated",
                eventCategory: "authentication",
                description: "Session terminated (logout)",
                severity: "info",
            });
        }
    },
});

/**
 * Invalidate all sessions for a user
 */
export const invalidateAllUserSessions = mutation({
    args: {
        userId: v.id("organisers"),
    },
    handler: async (ctx, args) => {
        const sessions = await ctx.db
            .query("sessions")
            .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
            .filter((q) => q.eq(q.field("isActive"), true))
            .collect();

        for (const session of sessions) {
            await ctx.db.patch(session._id, {
                isActive: false,
            });
        }

        // Log mass session termination
        await ctx.runMutation(internalAny.lib.security.logSecurityEvent, {
            userId: args.userId,
            eventType: "all_sessions_terminated",
            eventCategory: "authentication",
            description: `Terminated ${sessions.length} active sessions`,
            severity: "warning",
            metadata: { sessionCount: sessions.length },
        });
    },
});

/**
 * Get active sessions for a user
 */
export const getUserActiveSessions = query({
    args: {
        userId: v.id("organisers"),
    },
    handler: async (ctx, args) => {
        const sessions = await ctx.db
            .query("sessions")
            .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
            .filter((q) => q.eq(q.field("isActive"), true))
            .collect();

        return sessions.map((session) => ({
            _id: session._id,
            ipAddress: session.ipAddress,
            userAgent: session.userAgent,
            createdAt: session.createdAt,
            lastActivityAt: session.lastActivityAt,
            expiresAt: session.expiresAt,
            isCurrent: false, // Will be set by client
        }));
    },
});

/**
 * Clean up expired sessions (run periodically)
 */
export const cleanupExpiredSessions = mutation({
    args: {},
    handler: async (ctx) => {
        const now = Date.now();
        const expiredSessions = await ctx.db
            .query("sessions")
            .withIndex("by_expires_at")
            .filter((q) => q.lt(q.field("expiresAt"), now))
            .collect();

        for (const session of expiredSessions) {
            await ctx.db.delete(session._id);
        }

        console.log(`Cleaned up ${expiredSessions.length} expired sessions`);
        return { cleaned: expiredSessions.length };
    },
});

/**
 * Clean up old rate limit records (run periodically)
 */
export const cleanupOldRateLimits = mutation({
    args: {},
    handler: async (ctx) => {
        const now = Date.now();
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours

        const oldRecords = await ctx.db
            .query("rateLimits")
            .withIndex("by_window_start")
            .filter((q) => q.lt(q.field("windowStart"), now - maxAge))
            .collect();

        for (const record of oldRecords) {
            await ctx.db.delete(record._id);
        }

        console.log(`Cleaned up ${oldRecords.length} old rate limit records`);
        return { cleaned: oldRecords.length };
    },
});
