// convex/admin/addOrganiserCredentials.ts
// Admin function to add username/password to existing organiser

import { v } from "convex/values";
import { mutation } from "../_generated/server";
import * as bcrypt from "bcryptjs";

/**
 * Add username and password to an existing organiser
 * This is for migrating existing organisers to the new auth system
 */
export const addCredentialsToExistingOrganiser = mutation({
    args: {
        organiserId: v.id("organisers"),
        username: v.string(),
        password: v.string(),
    },
    handler: async (ctx, args) => {
        // Get the organiser
        const organiser = await ctx.db.get(args.organiserId);

        if (!organiser) {
            throw new Error("Organiser not found");
        }

        // Check if username already exists
        const existingUsername = await ctx.db
            .query("organisers")
            .withIndex("by_username", (q) => q.eq("username", args.username))
            .first();

        if (existingUsername && existingUsername._id !== args.organiserId) {
            throw new Error("Username already exists");
        }

        // Hash the password
        const passwordHash = bcrypt.hashSync(args.password, 12);

        // Update the organiser with credentials
        await ctx.db.patch(args.organiserId, {
            username: args.username,
            passwordHash: passwordHash,
            accountStatus: "active", // Set to active
            requirePasswordChange: false, // No need to change password
            failedLoginAttempts: 0,
            isActive: true,
            updatedAt: Date.now(),
        });

        console.log(`✅ Credentials added for organiser: ${organiser.institutionName}`);
        console.log(`   Username: ${args.username}`);
        console.log(`   Password: ${args.password}`);

        return {
            success: true,
            message: `Credentials added successfully for ${organiser.institutionName}`,
            username: args.username,
            organiserId: args.organiserId,
        };
    },
});

/**
 * Helper function to generate username from institution name
 */
export const generateUsername = mutation({
    args: {
        institutionName: v.string(),
    },
    handler: async (ctx, args) => {
        // Convert to lowercase, remove spaces and special chars
        let baseUsername = args.institutionName
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "");

        // Ensure it's not too long
        if (baseUsername.length > 20) {
            baseUsername = baseUsername.substring(0, 20);
        }

        // Check if username exists
        let username = baseUsername;
        let counter = 1;

        while (true) {
            const existing = await ctx.db
                .query("organisers")
                .withIndex("by_username", (q) => q.eq("username", username))
                .first();

            if (!existing) {
                break;
            }

            username = `${baseUsername}${counter}`;
            counter++;
        }

        return {
            suggestedUsername: username,
        };
    },
});

/**
 * Get all organisers without credentials
 */
export const getOrganisersWithoutCredentials = mutation({
    args: {},
    handler: async (ctx) => {
        const allOrganisers = await ctx.db.query("organisers").collect();

        const withoutCredentials = allOrganisers.filter(
            (org) => !org.username || !org.passwordHash
        );

        return withoutCredentials.map((org) => ({
            _id: org._id,
            institutionName: org.institutionName,
            email: org.email,
            approvalStatus: org.approvalStatus,
            accountStatus: org.accountStatus,
        }));
    },
});
