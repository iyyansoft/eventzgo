// convex/auth/secureAuth.ts
// Enhanced authentication with security measures

import { v } from "convex/values";
import { mutation, query, internalMutation } from "../_generated/server";
import { anyApi } from "convex/server";
const internalAny = anyApi;
import * as bcrypt from "bcryptjs";
import { Id } from "../_generated/dataModel";

/**
 * Password validation rules
 */
function validatePassword(password: string, username?: string, email?: string): {
    valid: boolean;
    errors: string[];
} {
    const errors: string[] = [];

    // Length check
    if (password.length < 8) {
        errors.push("Password must be at least 8 characters long");
    }

    // Uppercase check
    if (!/[A-Z]/.test(password)) {
        errors.push("Password must contain at least one uppercase letter");
    }

    // Lowercase check
    if (!/[a-z]/.test(password)) {
        errors.push("Password must contain at least one lowercase letter");
    }

    // Number check
    if (!/[0-9]/.test(password)) {
        errors.push("Password must contain at least one number");
    }

    // Special character check
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push("Password must contain at least one special character (!@#$%^&*...)");
    }

    // Common password check
    const commonPasswords = [
        "password", "12345678", "qwerty", "abc123", "password123",
        "admin", "letmein", "welcome", "monkey", "dragon", "password1",
        "123456789", "111111", "123123", "1234567890"
    ];
    if (commonPasswords.includes(password.toLowerCase())) {
        errors.push("Password is too common. Please choose a stronger password");
    }

    // Username/email similarity check
    if (username && password.toLowerCase().includes(username.toLowerCase())) {
        errors.push("Password should not contain your username");
    }
    if (email) {
        const emailPrefix = email.split('@')[0].toLowerCase();
        if (password.toLowerCase().includes(emailPrefix)) {
            errors.push("Password should not contain your email");
        }
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

/**
 * Secure sign-in with rate limiting and audit logging
 */
export const secureSignIn = mutation({
    args: {
        username: v.string(),
        password: v.string(),
        ipAddress: v.optional(v.string()),
        userAgent: v.optional(v.string()),
        deviceFingerprint: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identifier = args.ipAddress || args.username;

        // Check rate limit
        const rateLimit = await ctx.runMutation(internalAny.lib.security.checkRateLimit, {
            identifier,
            action: "login",
        });

        if (!rateLimit.allowed) {
            // Log failed attempt due to rate limit
            await ctx.runMutation(internalAny.lib.security.logSecurityEvent, {
                eventType: "login_rate_limited",
                eventCategory: "authentication",
                description: `Login attempt blocked due to rate limiting: ${args.username}`,
                ipAddress: args.ipAddress,
                userAgent: args.userAgent,
                severity: "warning",
                metadata: { username: args.username },
            });

            throw new Error(rateLimit.message || "Too many login attempts");
        }

        // Find organiser
        const organiser = await ctx.db
            .query("organisers")
            .withIndex("by_username", (q) => q.eq("username", args.username))
            .first();

        if (!organiser) {
            // Log failed login - user not found
            await ctx.runMutation(internalAny.lib.security.logSecurityEvent, {
                eventType: "login_failure_user_not_found",
                eventCategory: "authentication",
                description: `Login attempt for non-existent user: ${args.username}`,
                ipAddress: args.ipAddress,
                userAgent: args.userAgent,
                severity: "warning",
                metadata: { username: args.username },
            });

            throw new Error("Invalid username or password");
        }

        // Check account status
        if (organiser.accountStatus === "pending_approval") {
            await ctx.runMutation(internalAny.lib.security.logSecurityEvent, {
                userId: organiser._id,
                eventType: "login_attempt_pending_approval",
                eventCategory: "authentication",
                description: "Login attempt on pending approval account",
                ipAddress: args.ipAddress,
                userAgent: args.userAgent,
                severity: "info",
            });

            throw new Error("Your account is pending admin approval");
        }

        if (organiser.accountStatus === "suspended" || organiser.accountStatus === "blocked") {
            await ctx.runMutation(internalAny.lib.security.logSecurityEvent, {
                userId: organiser._id,
                eventType: "login_attempt_suspended_account",
                eventCategory: "authentication",
                description: "Login attempt on suspended/blocked account",
                ipAddress: args.ipAddress,
                userAgent: args.userAgent,
                severity: "critical",
            });

            throw new Error("Your account has been suspended. Please contact support.");
        }

        // Verify password
        let isValidPassword = false;

        // Check temporary password first (if pending setup)
        if (organiser.accountStatus === "pending_setup" && organiser.tempPasswordHash) {
            // Check if temp password expired
            if (organiser.tempPasswordExpiry && organiser.tempPasswordExpiry < Date.now()) {
                await ctx.runMutation(internalAny.lib.security.logSecurityEvent, {
                    userId: organiser._id,
                    eventType: "temp_password_expired",
                    eventCategory: "authentication",
                    description: "Temporary password has expired",
                    ipAddress: args.ipAddress,
                    severity: "warning",
                });

                throw new Error("Temporary password has expired. Please contact admin.");
            }

            isValidPassword = bcrypt.compareSync(args.password, organiser.tempPasswordHash);
        } else if (organiser.passwordHash) {
            // Check regular password
            isValidPassword = bcrypt.compareSync(args.password, organiser.passwordHash);
        }

        if (!isValidPassword) {
            // Increment failed attempts
            const failedAttempts = (organiser.failedLoginAttempts || 0) + 1;
            await ctx.db.patch(organiser._id, {
                failedLoginAttempts: failedAttempts,
                updatedAt: Date.now(),
            });

            // Log failed login
            await ctx.runMutation(internalAny.lib.security.logSecurityEvent, {
                userId: organiser._id,
                eventType: "login_failure_invalid_password",
                eventCategory: "authentication",
                description: `Failed login attempt (${failedAttempts}/5)`,
                ipAddress: args.ipAddress,
                userAgent: args.userAgent,
                severity: failedAttempts >= 4 ? "warning" : "info",
                metadata: { failedAttempts },
            });

            // Lock account after 5 failed attempts
            if (failedAttempts >= 5) {
                await ctx.db.patch(organiser._id, {
                    accountStatus: "suspended",
                    updatedAt: Date.now(),
                });

                await ctx.runMutation(internalAny.lib.security.logSecurityEvent, {
                    userId: organiser._id,
                    eventType: "account_locked_failed_attempts",
                    eventCategory: "authentication",
                    description: "Account locked due to too many failed login attempts",
                    ipAddress: args.ipAddress,
                    userAgent: args.userAgent,
                    severity: "critical",
                    metadata: { failedAttempts },
                });

                throw new Error("Account locked due to too many failed attempts. Please contact admin.");
            }

            throw new Error("Invalid username or password");
        }

        // Successful login - reset failed attempts
        await ctx.db.patch(organiser._id, {
            failedLoginAttempts: 0,
            lastLoginAt: Date.now(),
            updatedAt: Date.now(),
        });

        // Generate session token
        const sessionToken = crypto.randomUUID();

        // Create session
        await ctx.runMutation(internalAny.lib.security.createSession, {
            userId: organiser._id,
            sessionToken,
            ipAddress: args.ipAddress,
            userAgent: args.userAgent,
            deviceFingerprint: args.deviceFingerprint,
        });

        // Log successful login
        await ctx.runMutation(internalAny.lib.security.logSecurityEvent, {
            userId: organiser._id,
            eventType: "login_success",
            eventCategory: "authentication",
            description: "Successful login",
            ipAddress: args.ipAddress,
            userAgent: args.userAgent,
            severity: "info",
        });

        return {
            success: true,
            userId: organiser._id,
            username: organiser.username,
            email: organiser.email,
            companyName: organiser.institutionName,
            role: "organiser",
            requirePasswordChange: organiser.requirePasswordChange || false,
            accountStatus: organiser.accountStatus,
            sessionToken,
        };
    },
});

/**
 * Secure password update with validation
 */
export const secureUpdatePassword = mutation({
    args: {
        userId: v.id("organisers"),
        newPassword: v.string(),
        currentPassword: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const organiser = await ctx.db.get(args.userId);
        if (!organiser) {
            throw new Error("User not found");
        }

        // If not first-time setup, verify current password
        if (args.currentPassword && organiser.passwordHash) {
            const isValid = bcrypt.compareSync(args.currentPassword, organiser.passwordHash);
            if (!isValid) {
                await ctx.runMutation(internalAny.lib.security.logSecurityEvent, {
                    userId: args.userId,
                    eventType: "password_change_failed_verification",
                    eventCategory: "authentication",
                    description: "Password change failed - current password incorrect",
                    severity: "warning",
                });

                throw new Error("Current password is incorrect");
            }
        }

        // Validate new password
        const validation = validatePassword(
            args.newPassword,
            organiser.username,
            organiser.email
        );

        if (!validation.valid) {
            throw new Error(validation.errors.join(". "));
        }

        // Hash new password
        const passwordHash = bcrypt.hashSync(args.newPassword, 12);

        // Update password
        await ctx.db.patch(args.userId, {
            passwordHash,
            tempPasswordHash: undefined,
            tempPasswordExpiry: undefined,
            accountStatus: "active",
            requirePasswordChange: false,
            passwordChangedAt: Date.now(),
            isActive: true,
            updatedAt: Date.now(),
        });

        // Invalidate all existing sessions (force re-login)
        await ctx.runMutation(internalAny.lib.security.invalidateAllUserSessions, {
            userId: args.userId,
        });

        // Log password change
        await ctx.runMutation(internalAny.lib.security.logSecurityEvent, {
            userId: args.userId,
            eventType: "password_changed",
            eventCategory: "authentication",
            description: "Password successfully changed",
            severity: "info",
        });

        return {
            success: true,
            message: "Password updated successfully. Please log in again.",
        };
    },
});

/**
 * Logout - invalidate session
 */
export const secureLogout = mutation({
    args: {
        sessionToken: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.runMutation(internalAny.lib.security.invalidateSession, {
            sessionToken: args.sessionToken,
        });

        return { success: true };
    },
});

/**
 * Verify session and get user data
 */
export const verifySessionAndGetUser = query({
    args: {
        sessionToken: v.string(),
    },
    handler: async (ctx, args) => {
        const sessionCheck = await ctx.runQuery(internalAny.lib.security.verifySession, {
            sessionToken: args.sessionToken,
        });

        if (!sessionCheck.valid) {
            return { valid: false, error: sessionCheck.error };
        }

        const organiser: any = await ctx.db.get(sessionCheck.userId);
        if (!organiser) {
            return { valid: false, error: "User not found" };
        }

        // Update session activity
        // Update session activity - Cannot run mutation in query
        // await ctx.runMutation(internalAny.lib.security.updateSessionActivity, {
        //     sessionToken: args.sessionToken,
        // });

        return {
            valid: true,
            user: {
                _id: organiser._id,
                username: organiser.username,
                email: organiser.email,
                companyName: organiser.institutionName,
                contactPerson: organiser.contactPerson,
                phone: organiser.phone,
                accountStatus: organiser.accountStatus,
                requirePasswordChange: organiser.requirePasswordChange,
                role: "organiser",
            },
        };
    },
});
