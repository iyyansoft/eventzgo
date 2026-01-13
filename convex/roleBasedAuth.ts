import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { anyApi } from "convex/server";
const internalAny = anyApi;
import * as bcrypt from "bcryptjs";

/**
 * Register new organiser (after onboarding)
 */
export const registerOrganiser = mutation({
    args: {
        companyName: v.string(),
        contactPerson: v.string(),
        email: v.string(),
        phone: v.string(),
        onboardingData: v.any(), // All data from 4-step onboarding
    },
    handler: async (ctx, args) => {
        // Check if email already exists with non-rejected status
        const existingOrganiser = await ctx.db
            .query("organisers")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .first();

        // Check if email is already in use (excluding rejected or deleted accounts)
        if (existingOrganiser &&
            existingOrganiser.approvalStatus !== "rejected" &&
            existingOrganiser.isDeleted !== true) {
            throw new Error("An account with this email already exists");
        }

        // If previous application was rejected or deleted, remove it to allow re-registration
        if (existingOrganiser &&
            (existingOrganiser.approvalStatus === "rejected" || existingOrganiser.isDeleted === true)) {
            await ctx.db.delete(existingOrganiser._id);
        }

        // Use company name as username (sanitized)
        const username = args.companyName
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '')
            .substring(0, 20);

        // Check if username exists
        const existingUsername = await ctx.db
            .query("organisers")
            .withIndex("by_username", (q) => q.eq("username", username))
            .first();

        let finalUsername = username;
        if (existingUsername) {
            // Add random suffix if username exists
            const randomSuffix = Math.random().toString(36).substring(2, 6);
            finalUsername = `${username}_${randomSuffix}`;
        }

        // Don't hash password yet - will be set during approval process
        // This avoids async issues with bcrypt in Convex mutations

        const organiserId = await ctx.db.insert("organisers", {
            // Auth fields
            username: finalUsername,
            email: args.email,
            // passwordHash will be set during approval
            accountStatus: "pending_approval",
            requirePasswordChange: false,
            failedLoginAttempts: 0,

            // Profile
            institutionName: args.companyName,
            contactPerson: args.contactPerson,
            phone: args.phone,

            // Onboarding data
            onboardingData: args.onboardingData,

            // Required fields (extract from flat onboardingData structure)
            address: {
                street: args.onboardingData.street || "",
                city: args.onboardingData.city || "",
                state: args.onboardingData.state || "",
                pincode: args.onboardingData.pincode || "",
            },
            gstNumber: args.onboardingData.gstNumber || "",
            panNumber: args.onboardingData.panNumber || "",
            bankDetails: {
                accountHolderName: args.onboardingData.accountHolderName || "",
                accountNumber: args.onboardingData.accountNumber || "",
                ifscCode: args.onboardingData.ifscCode || "",
                bankName: args.onboardingData.bankName || "",
                branchName: args.onboardingData.branchName || "",
            },
            documents: {
                gstCertificate: args.onboardingData.gstCertificate || "",
                panCardFront: args.onboardingData.panCardFront || "",
                panCardBack: args.onboardingData.panCardBack || "",
                cancelledCheque: args.onboardingData.cancelledCheque || "",
                bankStatement: args.onboardingData.bankStatement || "",
                bankProofType: args.onboardingData.bankProofType || "cheque",
            },

            approvalStatus: "pending",
            isActive: false,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });

        return {
            success: true,
            organiserId,
            message: "Registration successful! Your account is pending admin approval.",
        };
    },
});

/**
 * Get pending organisers (admin only)
 */
export const getPendingOrganisers = query({
    args: {},
    handler: async (ctx) => {
        // TODO: Add admin authentication check

        const pendingOrganisers = await ctx.db
            .query("organisers")
            .withIndex("by_account_status", (q) => q.eq("accountStatus", "pending_approval"))
            .collect();

        return pendingOrganisers;
    },
});

/**
 * Approve organiser and send credentials
 */
export const approveOrganiser = mutation({
    args: {
        organiserId: v.id("organisers"),
    },
    handler: async (ctx, args) => {
        // TODO: Add admin authentication check

        const organiser = await ctx.db.get(args.organiserId);
        if (!organiser) {
            throw new Error("Organiser not found");
        }

        if (organiser.accountStatus !== "pending_approval") {
            throw new Error("Organiser is not pending approval");
        }

        // Generate temporary password
        const tempPassword = Math.random().toString(36).substring(2, 14).toUpperCase();

        // Hash temporary password
        const tempPasswordHash = bcrypt.hashSync(tempPassword, 12);

        // Update organiser
        await ctx.db.patch(args.organiserId, {
            accountStatus: "pending_setup",
            tempPasswordHash,
            tempPasswordExpiry: Date.now() + 30 * 60 * 1000, // 30 minutes
            requirePasswordChange: true,
            approvalStatus: "approved",
            approvedAt: Date.now(),
            updatedAt: Date.now(),
        });

        // Send email with credentials
        await ctx.scheduler.runAfter(0, internalAny.roleBasedAuth.sendCredentialsEmail, {
            email: organiser.email!,
            name: organiser.contactPerson || organiser.institutionName,
            companyName: organiser.institutionName,
            username: organiser.username!,
            tempPassword,
            organiserId: args.organiserId,
            role: "organiser",
        });

        return {
            success: true,
            username: organiser.username,
            message: "Organiser approved! Credentials sent via email.",
        };
    },
});

/**
 * Send credentials email (internal)
 */
export const sendCredentialsEmail = internalMutation({
    args: {
        email: v.string(),
        name: v.string(),
        companyName: v.string(),
        username: v.string(),
        tempPassword: v.string(),
        organiserId: v.id("organisers"),
        role: v.string(),
    },
    handler: async (ctx, args) => {
        const passwordLink = `${process.env.NEXT_PUBLIC_APP_URL}/management/reveal-password?token=${encodeURIComponent(args.tempPassword)}&user=${args.organiserId}`;
        const loginLink = `${process.env.NEXT_PUBLIC_APP_URL}/management/sign-in`;

        const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .credentials { background: #fff; border: 2px solid #8b5cf6; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .button { display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 10px 0; }
            .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
            .code { font-family: monospace; background: #e5e7eb; padding: 8px 12px; border-radius: 4px; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Account Approved!</h1>
            </div>
            <div class="content">
              <p>Hi ${args.name},</p>
              
              <p>Great news! Your ${args.companyName} account has been approved by our admin team.</p>
              
              <div class="credentials">
                <h3 style="margin-top: 0;">Your Login Credentials</h3>
                <p><strong>Username:</strong> <span class="code">${args.username}</span></p>
                <p><strong>Password:</strong> Click the button below to reveal your temporary password</p>
                <center>
                  <a href="${passwordLink}" class="button">🔓 Reveal Password</a>
                </center>
              </div>
              
              <div class="warning">
                <strong>⚠️ IMPORTANT:</strong>
                <ul>
                  <li><strong>Password link expires in 30 minutes</strong></li>
                  <li>You MUST change your password after first login</li>
                  <li>Do NOT share these credentials</li>
                </ul>
              </div>
              
              <p><strong>Next Steps:</strong></p>
              <ol>
                <li>Click "Reveal Password" button above</li>
                <li>Copy your temporary password</li>
                <li>Go to <a href="${loginLink}">Sign In Page</a></li>
                <li>Enter your username and temporary password</li>
                <li>You'll be prompted to create a new password</li>
              </ol>
              
              <p>Best regards,<br>The EventzGo Team</p>
            </div>
          </div>
        </body>
      </html>
    `;

        // DEVELOPMENT: Log to console
        if (process.env.NODE_ENV === 'development' || !process.env.RESEND_API_KEY) {
            console.log('\n📧 ========== CREDENTIALS EMAIL ==========');
            console.log('To:', args.email);
            console.log('Name:', args.name);
            console.log('Company:', args.companyName);
            console.log('Role:', args.role);
            console.log('\n🔑 CREDENTIALS (30-minute expiry):');
            console.log('Username:', args.username);
            console.log('Password Link:', passwordLink);
            console.log('Temp Password:', args.tempPassword);
            console.log('\n🔗 LOGIN:');
            console.log(loginLink);
            console.log('==========================================\n');

            // Log to emailLogs
            await ctx.db.insert("emailLogs", {
                to: args.email,
                subject: "Account Approved - EventzGo Credentials",
                type: "credentials",
                status: "sent",
                provider: "console",
                metadata: { username: args.username, role: args.role },
                createdAt: Date.now(),
            });

            return { success: true, mode: 'development' };
        }

        // PRODUCTION: Send via Resend
        try {
            const response = await fetch("https://api.resend.com/emails", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
                },
                body: JSON.stringify({
                    from: "EventzGo <noreply@eventzgo.com>",
                    to: args.email,
                    subject: "Account Approved - EventzGo Credentials",
                    html: emailHtml,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to send email");
            }

            const result = await response.json();

            await ctx.db.insert("emailLogs", {
                to: args.email,
                subject: "Account Approved - EventzGo Credentials",
                type: "credentials",
                status: "sent",
                provider: "resend",
                providerId: result.id,
                createdAt: Date.now(),
            });

            return { success: true, mode: 'production' };
        } catch (error: any) {
            await ctx.db.insert("emailLogs", {
                to: args.email,
                subject: "Account Approved - EventzGo Credentials",
                type: "credentials",
                status: "failed",
                provider: "resend",
                error: error.message,
                createdAt: Date.now(),
            });

            throw error;
        }
    },
});

/**
 * Sign in with username and password
 */
export const signIn = mutation({
    args: {
        username: v.string(),
        password: v.string(),
    },
    handler: async (ctx, args) => {
        // Try to find in organisers table
        const organiser = await ctx.db
            .query("organisers")
            .withIndex("by_username", (q) => q.eq("username", args.username))
            .first();

        if (!organiser) {
            throw new Error("Invalid username or password");
        }

        // Check account status
        if (organiser.accountStatus === "pending_approval") {
            throw new Error("Your account is pending admin approval");
        }

        if (organiser.accountStatus === "suspended") {
            throw new Error("Your account has been suspended");
        }

        const bcrypt = require('bcryptjs');
        let isValidPassword = false;

        // Check temporary password first (if pending setup)
        if (organiser.accountStatus === "pending_setup" && organiser.tempPasswordHash) {
            // Check if temp password expired
            if (organiser.tempPasswordExpiry && organiser.tempPasswordExpiry < Date.now()) {
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

            if (failedAttempts >= 5) {
                // Lock account after 5 failed attempts
                await ctx.db.patch(organiser._id, {
                    accountStatus: "suspended",
                    updatedAt: Date.now(),
                });
                throw new Error("Account locked due to too many failed attempts. Contact admin.");
            }

            throw new Error("Invalid username or password");
        }

        // Reset failed attempts on successful login
        await ctx.db.patch(organiser._id, {
            failedLoginAttempts: 0,
            lastLoginAt: Date.now(),
            updatedAt: Date.now(),
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
        };
    },
});

/**
 * Update password (after first login or password reset)
 */
export const updatePassword = mutation({
    args: {
        userId: v.id("organisers"),
        newPassword: v.string(),
    },
    handler: async (ctx, args) => {
        const organiser = await ctx.db.get(args.userId);
        if (!organiser) {
            throw new Error("User not found");
        }

        // Validate password strength
        if (args.newPassword.length < 8) {
            throw new Error("Password must be at least 8 characters long");
        }

        const passwordHash = bcrypt.hashSync(args.newPassword, 12);

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

        return {
            success: true,
            message: "Password updated successfully",
        };
    },
});

/**
 * Get organiser by ID (for session management)
 */
export const getOrganiserById = query({
    args: {
        organiserId: v.id("organisers"),
    },
    handler: async (ctx, args) => {
        const organiser = await ctx.db.get(args.organiserId);
        if (!organiser) {
            return null;
        }

        // Don't return sensitive data
        return {
            _id: organiser._id,
            username: organiser.username,
            email: organiser.email,
            companyName: organiser.institutionName,
            contactPerson: organiser.contactPerson,
            phone: organiser.phone,
            accountStatus: organiser.accountStatus,
            requirePasswordChange: organiser.requirePasswordChange,
            onboardingData: organiser.onboardingData,
        };
    },
});
