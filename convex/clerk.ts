"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";

/**
 * Update Clerk user metadata
 * This action calls the Clerk API to update a user's public metadata
 */
export const updateUserMetadata = action({
    args: {
        clerkId: v.string(),
        metadata: v.object({
            role: v.optional(v.string()),
            status: v.optional(v.string()),
            onboardingCompleted: v.optional(v.boolean()),
        }),
    },
    handler: async (ctx, args) => {
        const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;

        if (!CLERK_SECRET_KEY) {
            throw new Error("CLERK_SECRET_KEY not found in environment variables");
        }

        try {
            const response = await fetch(
                `https://api.clerk.com/v1/users/${args.clerkId}/metadata`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${CLERK_SECRET_KEY}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        public_metadata: args.metadata,
                    }),
                }
            );

            if (!response.ok) {
                const error = await response.text();
                throw new Error(`Clerk API error: ${response.status} - ${error}`);
            }

            const data = await response.json();
            return {
                success: true,
                data,
            };
        } catch (error: any) {
            throw new Error(`Failed to update Clerk metadata: ${error.message}`);
        }
    },
});

/**
 * Sync organiser approval to Clerk
 * This approves the organiser in Convex AND updates Clerk metadata
 */
export const syncOrganiserApproval = action({
    args: {
        clerkId: v.string(),
    },
    handler: async (ctx, args): Promise<{
        success: boolean;
        convex: any;
        clerk: any;
        message: string;
    }> => {
        const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;

        if (!CLERK_SECRET_KEY) {
            throw new Error("CLERK_SECRET_KEY not found in environment variables");
        }

        // First, approve in Convex using the mutation
        const convexResult = await ctx.runMutation(
            api.organisers.manualApproveByClerkId,
            { clerkId: args.clerkId }
        );

        // Then, update Clerk metadata directly
        try {
            const response = await fetch(
                `https://api.clerk.com/v1/users/${args.clerkId}/metadata`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${CLERK_SECRET_KEY}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        public_metadata: {
                            role: "organiser",
                            status: "approved",
                            onboardingCompleted: true,
                        },
                    }),
                }
            );

            if (!response.ok) {
                const error = await response.text();
                throw new Error(`Clerk API error: ${response.status} - ${error}`);
            }

            const clerkData = await response.json();

            return {
                success: true,
                convex: convexResult,
                clerk: { success: true, data: clerkData },
                message: "Organiser approved in both Convex and Clerk!",
            };
        } catch (error: any) {
            // Convex was updated but Clerk failed
            return {
                success: false,
                convex: convexResult,
                clerk: { success: false, error: error.message },
                message: `Convex updated but Clerk sync failed: ${error.message}`,
            };
        }
    },
});
