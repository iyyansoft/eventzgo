// convex/auth/authActions.ts
// Actions for NextAuth.js integration

import { action } from "../_generated/server";
import { v } from "convex/values";
import { anyApi } from "convex/server";
const apiAny = anyApi;
import * as bcrypt from "bcryptjs";

/**
 * Sign in action - can be called from NextAuth
 */
export const signInAction = action({
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
        const rateLimitCheck = await ctx.runQuery(apiAny.auth.authQueries.checkRateLimit, {
            identifier,
            action: "login",
        });

        if (!rateLimitCheck.allowed) {
            await ctx.runMutation(apiAny.auth.authMutations.logSecurityEvent, {
                eventType: "login_rate_limited",
                eventCategory: "authentication",
                description: `Login attempt blocked: ${args.username}`,
                ipAddress: args.ipAddress,
                userAgent: args.userAgent,
                severity: "warning",
                metadata: { username: args.username },
            });

            return { success: false, message: rateLimitCheck.message || "Too many login attempts" };
        }

        // Update rate limit
        await ctx.runMutation(apiAny.auth.authMutations.updateRateLimit, {
            identifier,
            action: "login",
        });

        // Find organiser
        const organiser = await ctx.runQuery(apiAny.auth.authQueries.findOrganiserByUsername, {
            username: args.username,
        });

        if (!organiser) {
            await ctx.runMutation(apiAny.auth.authMutations.logSecurityEvent, {
                eventType: "login_failure_user_not_found",
                eventCategory: "authentication",
                description: `Login attempt for non-existent user: ${args.username}`,
                ipAddress: args.ipAddress,
                userAgent: args.userAgent,
                severity: "warning",
                metadata: { username: args.username },
            });

            return { success: false, message: "Invalid username or password" };
        }

        // Check account status
        if (organiser.accountStatus === "pending_verification") {
            return { success: false, message: "Please verify your email address to login." };
        }

        if (organiser.accountStatus === "pending_approval") {
            await ctx.runMutation(apiAny.auth.authMutations.logSecurityEvent, {
                userId: organiser._id,
                eventType: "login_attempt_pending_approval",
                eventCategory: "authentication",
                description: "Login attempt on pending approval account",
                ipAddress: args.ipAddress,
                userAgent: args.userAgent,
                severity: "info",
            });

            return { success: false, message: "Your account is pending admin approval" };
        }

        if (organiser.accountStatus === "suspended" || organiser.accountStatus === "blocked") {
            await ctx.runMutation(apiAny.auth.authMutations.logSecurityEvent, {
                userId: organiser._id,
                eventType: "login_attempt_suspended_account",
                eventCategory: "authentication",
                description: "Login attempt on suspended/blocked account",
                ipAddress: args.ipAddress,
                userAgent: args.userAgent,
                severity: "critical",
            });

            return { success: false, message: "Your account has been suspended. Please contact support." };
        }

        // Verify password
        let isValidPassword = false;

        if (organiser.accountStatus === "pending_setup" && organiser.tempPasswordHash) {
            if (organiser.tempPasswordExpiry && organiser.tempPasswordExpiry < Date.now()) {
                await ctx.runMutation(apiAny.auth.authMutations.logSecurityEvent, {
                    userId: organiser._id,
                    eventType: "temp_password_expired",
                    eventCategory: "authentication",
                    description: "Temporary password has expired",
                    ipAddress: args.ipAddress,
                    severity: "warning",
                });

                return { success: false, message: "Temporary password has expired. Please contact admin." };
            }

            isValidPassword = bcrypt.compareSync(args.password, organiser.tempPasswordHash);
        } else if (organiser.passwordHash) {
            isValidPassword = bcrypt.compareSync(args.password, organiser.passwordHash);
        }

        if (!isValidPassword) {
            const failedAttempts = (organiser.failedLoginAttempts || 0) + 1;

            await ctx.runMutation(apiAny.auth.authMutations.updateFailedAttempts, {
                organiserId: organiser._id,
                failedAttempts,
            });

            await ctx.runMutation(apiAny.auth.authMutations.logSecurityEvent, {
                userId: organiser._id,
                eventType: "login_failure_invalid_password",
                eventCategory: "authentication",
                description: `Failed login attempt (${failedAttempts}/5)`,
                ipAddress: args.ipAddress,
                userAgent: args.userAgent,
                severity: failedAttempts >= 4 ? "warning" : "info",
                metadata: { failedAttempts },
            });

            if (failedAttempts >= 5) {
                await ctx.runMutation(apiAny.auth.authMutations.suspendAccount, {
                    organiserId: organiser._id,
                });

                await ctx.runMutation(apiAny.auth.authMutations.logSecurityEvent, {
                    userId: organiser._id,
                    eventType: "account_locked_failed_attempts",
                    eventCategory: "authentication",
                    description: "Account locked due to too many failed login attempts",
                    ipAddress: args.ipAddress,
                    userAgent: args.userAgent,
                    severity: "critical",
                    metadata: { failedAttempts },
                });

                return { success: false, message: "Account locked due to too many failed attempts. Please contact admin." };
            }

            return { success: false, message: "Invalid username or password" };
        }

        // Successful login
        await ctx.runMutation(apiAny.auth.authMutations.successfulLogin, {
            organiserId: organiser._id,
        });

        // Generate session token
        const sessionToken = crypto.randomUUID();

        // Create session
        await ctx.runMutation(apiAny.auth.authMutations.createSession, {
            userId: organiser._id,
            sessionToken,
            ipAddress: args.ipAddress,
            userAgent: args.userAgent,
            deviceFingerprint: args.deviceFingerprint,
        });

        // Log successful login
        await ctx.runMutation(apiAny.auth.authMutations.logSecurityEvent, {
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
            role: organiser.role || "organiser",
            requirePasswordChange: organiser.requirePasswordChange || false,
            accountStatus: organiser.accountStatus,
            sessionToken,
        };
    },
});

/**
 * Sign Up action - can be called from client
 */
export const signUpAction = action({
    args: {
        username: v.string(),
        email: v.string(),
        password: v.string(),
        companyName: v.string(),
        phone: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // Check rate limit (use "login" bucket for signups for now, or add "signup")
        const rateLimitCheck = await ctx.runQuery(apiAny.auth.authQueries.checkRateLimit, {
            identifier: args.username, // or ip?
            action: "login", // Reuse login limit or expand types
        });

        if (!rateLimitCheck.allowed) {
            throw new Error(rateLimitCheck.message || "Too many attempts");
        }

        // Check availability
        const existing = await ctx.runQuery(apiAny.auth.authQueries.findOrganiserByUsername, {
            username: args.username
        });
        if (existing) {
            throw new Error("Username already taken");
        }

        // Create User (users table)
        const fakeClerkId = "custom_" + crypto.randomUUID();
        const userId = await ctx.runMutation(apiAny.users.syncUser, {
            clerkId: fakeClerkId,
            email: args.email,
            firstName: args.username,
            role: "organiser",
            phone: args.phone
        });


        // Hash Password
        const passwordHash = bcrypt.hashSync(args.password, 10);

        // Create Organiser (organisers table) with pending_verification status
        const organiserId = await ctx.runMutation(apiAny.auth.authMutations.registerOrganiser, {
            userId,
            clerkId: fakeClerkId,
            username: args.username,
            email: args.email,
            passwordHash,
            institutionName: args.companyName,
            phone: args.phone,
            accountStatus: "pending_verification", // Set initial status
        });

        // Create email verification token using our new system
        const { token } = await ctx.runMutation(apiAny.emailVerifications.createVerificationToken, {
            organiserId,
            email: args.email,
        });

        // Send Verification Email
        const siteUrl = process.env.SITE_URL || 'http://localhost:3000';
        const verificationLink = `${siteUrl}/management/verify-email?token=${token}`;

        await ctx.runAction(apiAny.mail.sendEmail, {
            to: args.email,
            subject: "Verify your EventzGo Account",
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h1 style="color: #7c3aed;">Welcome to EventzGo!</h1>
                    <p>Thanks for signing up, <strong>${args.companyName}</strong>!</p>
                    <p>Please verify your email address to get started.</p>
                    <div style="margin: 30px 0; text-align: center;">
                        <a href="${verificationLink}" style="background-color: #7c3aed; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Verify Email Address</a>
                    </div>
                    <p style="color: #666; font-size: 14px;">Or copy this link:<br/><a href="${verificationLink}" style="color: #7c3aed;">${verificationLink}</a></p>
                    <p style="color: #999; font-size: 12px; margin-top: 30px;">This link expires in 24 hours.</p>
                </div>
            `
        });

        return {
            success: true,
            requiresVerification: true,
        };
    },
});

/**
 * Verify session action - can be called from NextAuth
 */
export const verifySessionAction = action({
    args: {
        sessionToken: v.string(),
    },
    handler: async (ctx, args) => {
        const sessionCheck = await ctx.runQuery(apiAny.auth.authQueries.verifySession, {
            sessionToken: args.sessionToken,
        });

        if (!sessionCheck.valid) {
            return { valid: false, error: sessionCheck.error };
        }

        const organiser = await ctx.runQuery(apiAny.auth.authQueries.getOrganiserById, {
            organiserId: sessionCheck.userId!,
        });

        if (!organiser) {
            return { valid: false, error: "User not found" };
        }

        // Update session activity
        await ctx.runMutation(apiAny.auth.authMutations.updateSessionActivity, {
            sessionToken: args.sessionToken,
        });

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
                role: organiser.role || "organiser",
            },
        };
    },
});

/**
 * Logout action - can be called from NextAuth
 */
export const logoutAction = action({
    args: {
        sessionToken: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.runMutation(apiAny.auth.authMutations.invalidateSession, {
            sessionToken: args.sessionToken,
        });

        return { success: true };
    },
});

/**
 * Request password reset
 */
export const requestPasswordReset = action({
    args: { email: v.string() },
    handler: async (ctx, args) => {
        const organiser = await ctx.runQuery(apiAny.auth.authQueries.getOrganiserByEmail, { email: args.email });

        // Security: Don't reveal if user exists
        if (!organiser) {
            return { success: true };
        }

        const token = crypto.randomUUID();

        await ctx.runMutation(apiAny.auth.authMutations.storeResetToken, {
            organiserId: organiser._id,
            tokenHash: token, // In prod, hash this
            expiresAt: Date.now() + 3600000 // 1 hour
        });

        // Send Reset Email
        const siteUrl = process.env.SITE_URL || 'http://localhost:3000';
        const resetLink = `${siteUrl}/management/reset-password?token=${token}`;

        await ctx.runAction(apiAny.mail.sendEmail, {
            to: args.email,
            subject: "Reset your EventzGo Password",
            html: `
                <div style="font-family: sans-serif; max-w-600px; margin: 0 auto;">
                    <h1 style="color: #7c3aed;">Password Reset</h1>
                    <p>You requested a password reset. Click the button below to choose a new password.</p>
                    <div style="margin: 30px 0;">
                        <a href="${resetLink}" style="background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Reset Password</a>
                    </div>
                    <p style="color: #666; font-size: 14px;">Or copy this link: <br/>${resetLink}</p>
                    <p style="color: #999; font-size: 12px; margin-top: 20px;">If you didn't request this, you can safely ignore this email.</p>
                </div>
            `
        });

        return { success: true };
    }
});

/**
 * Reset Password Action (Hashes password)
 */
export const resetPasswordAction = action({
    args: { token: v.string(), newPassword: v.string() },
    handler: async (ctx, args) => {
        const passwordHash = bcrypt.hashSync(args.newPassword, 10);

        await ctx.runMutation(apiAny.auth.authMutations.completePasswordReset, {
            tokenHash: args.token,
            passwordHash
        });

        return { success: true };
    }
});
