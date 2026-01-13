// convex/setup/setupTicketsHub.ts
// One-time setup script to add credentials for TicketsHub organiser

import { mutation } from "../_generated/server";
import * as bcrypt from "bcryptjs";

/**
 * ONE-TIME SETUP: Add credentials for TicketsHub organiser
 * 
 * Run this once to set up login credentials for the existing TicketsHub organiser
 */
export const setupTicketsHubCredentials = mutation({
    args: {},
    handler: async (ctx) => {
        console.log("🔍 Searching for TicketsHub organiser...");

        // Find ticketshub organiser by institution name
        const organisers = await ctx.db.query("organisers").collect();

        const ticketshub = organisers.find(org =>
            org.institutionName?.toLowerCase().includes("ticketshub") ||
            org.institutionName?.toLowerCase().includes("tickets hub") ||
            org.institutionName?.toLowerCase().includes("ticket hub")
        );

        if (!ticketshub) {
            console.error("❌ TicketsHub organiser not found in database");
            console.log("Available organisers:", organisers.map(o => o.institutionName));
            throw new Error("TicketsHub organiser not found. Please check the institution name.");
        }

        console.log("✅ Found TicketsHub organiser:", ticketshub.institutionName);
        console.log("   Organiser ID:", ticketshub._id);
        console.log("   Email:", ticketshub.email);

        // Check if already has credentials
        if (ticketshub.username && ticketshub.passwordHash) {
            console.log("⚠️ TicketsHub already has credentials");
            console.log("   Existing username:", ticketshub.username);

            return {
                success: false,
                message: "TicketsHub already has login credentials",
                existingUsername: ticketshub.username,
                note: "If you need to reset the password, use the password recovery flow",
            };
        }

        // Generate credentials
        const username = "ticketshub";
        const password = "TicketsHub@2024"; // Strong password meeting all requirements

        console.log("🔐 Generating secure credentials...");
        const passwordHash = bcrypt.hashSync(password, 12);

        // Update organiser with credentials
        await ctx.db.patch(ticketshub._id, {
            username: username,
            passwordHash: passwordHash,
            accountStatus: "active", // Set account to active
            requirePasswordChange: false, // No password change required
            failedLoginAttempts: 0,
            isActive: true,
            approvalStatus: "approved", // Ensure approved
            updatedAt: Date.now(),
        });

        console.log("✅ Credentials created successfully!");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("📋 LOGIN CREDENTIALS FOR TICKETSHUB:");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("   Username: " + username);
        console.log("   Password: " + password);
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("");
        console.log("🔗 Login URL: http://localhost:3000/management/sign-in");
        console.log("");
        console.log("⚠️ IMPORTANT: Save these credentials securely!");

        return {
            success: true,
            message: "Credentials created successfully for TicketsHub",
            credentials: {
                username: username,
                password: password,
                institutionName: ticketshub.institutionName,
                organiserId: ticketshub._id,
                email: ticketshub.email,
            },
            loginUrl: "http://localhost:3000/management/sign-in",
            note: "Please save these credentials securely. You can change the password after first login.",
        };
    },
});

/**
 * List all organisers and their credential status
 */
export const listAllOrganisers = mutation({
    args: {},
    handler: async (ctx) => {
        const organisers = await ctx.db.query("organisers").collect();

        return organisers.map(org => ({
            _id: org._id,
            institutionName: org.institutionName,
            email: org.email,
            hasUsername: !!org.username,
            hasPassword: !!org.passwordHash,
            accountStatus: org.accountStatus,
            approvalStatus: org.approvalStatus,
            isActive: org.isActive,
        }));
    },
});
