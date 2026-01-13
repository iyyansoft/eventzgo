// convex/auth/authHelpers.ts
// Helper functions for authentication (can be called from mutations/queries/actions)

import * as bcrypt from "bcryptjs";
import { DatabaseReader, DatabaseWriter, MutationCtx, QueryCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";

/**
 * Password validation rules
 */
export function validatePassword(password: string, username?: string, email?: string): {
    valid: boolean;
    errors: string[];
} {
    const errors: string[] = [];

    if (password.length < 8) {
        errors.push("Password must be at least 8 characters long");
    }

    if (!/[A-Z]/.test(password)) {
        errors.push("Password must contain at least one uppercase letter");
    }

    if (!/[a-z]/.test(password)) {
        errors.push("Password must contain at least one lowercase letter");
    }

    if (!/[0-9]/.test(password)) {
        errors.push("Password must contain at least one number");
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push("Password must contain at least one special character");
    }

    const commonPasswords = [
        "password", "12345678", "qwerty", "abc123", "password123",
        "admin", "letmein", "welcome", "monkey", "dragon", "password1",
        "123456789", "111111", "123123", "1234567890"
    ];
    if (commonPasswords.includes(password.toLowerCase())) {
        errors.push("Password is too common");
    }

    if (username && password.toLowerCase().includes(username.toLowerCase())) {
        errors.push("Password should not contain your username");
    }

    if (email) {
        const emailPrefix = email.split('@')[0].toLowerCase();
        if (password.toLowerCase().includes(emailPrefix)) {
            errors.push("Password should not contain your email");
        }
    }

    return { valid: errors.length === 0, errors };
}

/**
 * Check rate limit
 */
export async function checkRateLimit(
    db: DatabaseReader,
    identifier: string,
    action: "login" | "password_reset" | "api_call"
): Promise<{ allowed: boolean; message?: string }> {
    const limits = {
        login: { maxAttempts: 5, windowMs: 15 * 60 * 1000 },
        password_reset: { maxAttempts: 3, windowMs: 60 * 60 * 1000 },
        api_call: { maxAttempts: 100, windowMs: 60 * 1000 },
    };

    const limit = limits[action];
    const windowStart = Date.now() - limit.windowMs;

    const record = await db
        .query("rateLimits")
        .withIndex("by_identifier_action", (q) =>
            q.eq("identifier", identifier).eq("action", action)
        )
        .first();

    if (!record) {
        return { allowed: true };
    }

    if (record.windowStart < windowStart) {
        return { allowed: true };
    }

    if (record.attempts >= limit.maxAttempts) {
        const minutesLeft = Math.ceil((record.windowStart + limit.windowMs - Date.now()) / 60000);
        return {
            allowed: false,
            message: `Too many ${action} attempts. Please try again in ${minutesLeft} minute(s).`,
        };
    }

    return { allowed: true };
}

/**
 * Update rate limit
 */
export async function updateRateLimit(
    db: DatabaseWriter,
    identifier: string,
    action: "login" | "password_reset" | "api_call"
): Promise<void> {
    const limits = {
        login: { maxAttempts: 5, windowMs: 15 * 60 * 1000 },
        password_reset: { maxAttempts: 3, windowMs: 60 * 60 * 1000 },
        api_call: { maxAttempts: 100, windowMs: 60 * 1000 },
    };

    const limit = limits[action];
    const windowStart = Date.now() - limit.windowMs;

    const record = await db
        .query("rateLimits")
        .withIndex("by_identifier_action", (q) =>
            q.eq("identifier", identifier).eq("action", action)
        )
        .first();

    if (!record || record.windowStart < windowStart) {
        if (record) {
            await db.delete(record._id);
        }
        await db.insert("rateLimits", {
            identifier,
            action,
            attempts: 1,
            windowStart: Date.now(),
            lastAttempt: Date.now(),
        });
    } else {
        await db.patch(record._id, {
            attempts: record.attempts + 1,
            lastAttempt: Date.now(),
        });
    }
}

/**
 * Log security event
 */
export async function logSecurityEvent(
    db: DatabaseWriter,
    event: {
        userId?: Id<"organisers">;
        eventType: string;
        eventCategory: string;
        description: string;
        ipAddress?: string;
        userAgent?: string;
        severity: "info" | "warning" | "critical";
        metadata?: any;
    }
): Promise<void> {
    await db.insert("securityAuditLogs", {
        userId: event.userId,
        eventType: event.eventType,
        eventCategory: event.eventCategory,
        description: event.description,
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
        metadata: event.metadata,
        severity: event.severity,
        timestamp: Date.now(),
    });
}

/**
 * Create session
 */
export async function createSession(
    db: DatabaseWriter,
    data: {
        userId: Id<"organisers">;
        sessionToken: string;
        ipAddress?: string;
        userAgent?: string;
        deviceFingerprint?: string;
    }
): Promise<void> {
    await db.insert("sessions", {
        userId: data.userId,
        sessionToken: data.sessionToken,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        deviceFingerprint: data.deviceFingerprint,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
        lastActivityAt: Date.now(),
        isActive: true,
        createdAt: Date.now(),
    });
}

/**
 * Verify session
 */
export async function verifySession(
    db: DatabaseReader,
    sessionToken: string
): Promise<{ valid: boolean; userId?: Id<"organisers">; error?: string }> {
    const session = await db
        .query("sessions")
        .withIndex("by_session_token", (q) => q.eq("sessionToken", sessionToken))
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
}

/**
 * Update session activity
 */
export async function updateSessionActivity(
    db: DatabaseWriter,
    sessionToken: string
): Promise<void> {
    const session = await db
        .query("sessions")
        .withIndex("by_session_token", (q) => q.eq("sessionToken", sessionToken))
        .first();

    if (session) {
        await db.patch(session._id, {
            lastActivityAt: Date.now(),
        });
    }
}

/**
 * Invalidate session
 */
export async function invalidateSession(
    db: DatabaseWriter,
    sessionToken: string
): Promise<void> {
    const session = await db
        .query("sessions")
        .withIndex("by_session_token", (q) => q.eq("sessionToken", sessionToken))
        .first();

    if (session) {
        await db.patch(session._id, {
            isActive: false,
        });
    }
}

/**
 * Invalidate all user sessions
 */
export async function invalidateAllUserSessions(
    db: DatabaseWriter,
    userId: Id<"organisers">
): Promise<void> {
    const sessions = await db
        .query("sessions")
        .withIndex("by_user_id", (q) => q.eq("userId", userId))
        .collect();

    for (const session of sessions) {
        if (session.isActive) {
            await db.patch(session._id, {
                isActive: false,
            });
        }
    }
}
