import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

/**
 * Generate a random verification token
 */
function generateToken(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Create email verification token for organiser
 */
export const createVerificationToken = mutation({
    args: {
        organiserId: v.id("organisers"),
        email: v.string(),
    },
    handler: async (ctx, args) => {
        const token = generateToken();
        const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

        // Invalidate any existing tokens for this organiser
        const existingTokens = await ctx.db
            .query("emailVerifications")
            .withIndex("by_organiser_id", (q) => q.eq("organiserId", args.organiserId))
            .collect();

        for (const existingToken of existingTokens) {
            await ctx.db.delete(existingToken._id);
        }

        // Create new verification token
        const verificationId = await ctx.db.insert("emailVerifications", {
            organiserId: args.organiserId,
            email: args.email,
            token,
            expiresAt,
            verified: false,
            createdAt: Date.now(),
        });

        return { token, verificationId };
    },
});

/**
 * Verify email using token
 */
export const verifyEmail = mutation({
    args: {
        token: v.string(),
    },
    handler: async (ctx, args) => {
        // Find verification record
        const verification = await ctx.db
            .query("emailVerifications")
            .withIndex("by_token", (q) => q.eq("token", args.token))
            .first();

        if (!verification) {
            throw new Error("Invalid verification token");
        }

        // Check if already verified
        if (verification.verified) {
            throw new Error("Email already verified");
        }

        // Check if expired
        if (verification.expiresAt < Date.now()) {
            throw new Error("Verification token has expired");
        }

        // Mark as verified
        await ctx.db.patch(verification._id, {
            verified: true,
            verifiedAt: Date.now(),
        });

        // Update organiser status to pending_setup
        await ctx.db.patch(verification.organiserId, {
            accountStatus: "pending_setup",
            updatedAt: Date.now(),
        });

        // Get organiser details
        const organiser = await ctx.db.get(verification.organiserId);

        return {
            success: true,
            organiserId: verification.organiserId,
            email: verification.email,
            username: organiser?.username,
        };
    },
});

/**
 * Check if email is verified
 */
export const checkEmailVerification = query({
    args: {
        organiserId: v.id("organisers"),
    },
    handler: async (ctx, args) => {
        const verification = await ctx.db
            .query("emailVerifications")
            .withIndex("by_organiser_id", (q) => q.eq("organiserId", args.organiserId))
            .order("desc")
            .first();

        if (!verification) {
            return { verified: false, exists: false };
        }

        return {
            verified: verification.verified,
            exists: true,
            expired: verification.expiresAt < Date.now(),
            email: verification.email,
        };
    },
});

/**
 * Resend verification email (creates new token)
 */
export const resendVerificationEmail = mutation({
    args: {
        organiserId: v.id("organisers"),
    },
    handler: async (ctx, args) => {
        const organiser = await ctx.db.get(args.organiserId);

        if (!organiser) {
            throw new Error("Organiser not found");
        }

        if (organiser.accountStatus !== "pending_verification") {
            throw new Error("Email already verified or account not in pending verification state");
        }

        // Create new verification token directly
        const token = generateToken();
        const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

        // Invalidate any existing tokens
        const existingTokens = await ctx.db
            .query("emailVerifications")
            .withIndex("by_organiser_id", (q) => q.eq("organiserId", args.organiserId))
            .collect();

        for (const existingToken of existingTokens) {
            await ctx.db.delete(existingToken._id);
        }

        // Create new token
        const verificationId = await ctx.db.insert("emailVerifications", {
            organiserId: args.organiserId,
            email: organiser.email!,
            token,
            expiresAt,
            verified: false,
            createdAt: Date.now(),
        });

        return { token, verificationId };
    },
});

/**
 * Clean up expired verification tokens (run periodically)
 */
export const cleanupExpiredTokens = mutation({
    args: {},
    handler: async (ctx) => {
        const now = Date.now();
        const expiredTokens = await ctx.db
            .query("emailVerifications")
            .withIndex("by_expires_at")
            .filter((q) => q.lt(q.field("expiresAt"), now))
            .collect();

        for (const token of expiredTokens) {
            await ctx.db.delete(token._id);
        }

        return { cleaned: expiredTokens.length };
    },
});
