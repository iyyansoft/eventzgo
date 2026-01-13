import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { anyApi } from "convex/server";
const internalAny = anyApi;

/**
 * Register new management user (after onboarding)
 */
export const registerManagementUser = mutation({
    args: {
        companyName: v.string(),
        contactPerson: v.string(),
        email: v.string(),
        phone: v.string(),
        role: v.union(
            v.literal("organiser"),
            v.literal("vendor"),
            v.literal("speaker"),
            v.literal("sponsor")
        ),
        onboardingData: v.any(), // All data from 4-step onboarding
    },
    handler: async (ctx, args) => {
        // Check if email already exists
        const existingUser = await ctx.db
            .query("managementUsers")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .first();

        if (existingUser) {
            throw new Error("An account with this email already exists");
        }

        // Use company name as username (sanitized)
        const username = args.companyName
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '')
            .substring(0, 20);

        // Check if username exists
        const existingUsername = await ctx.db
            .query("managementUsers")
            .withIndex("by_username", (q) => q.eq("username", username))
            .first();

        if (existingUsername) {
            // Add random suffix if username exists
            const randomSuffix = Array.from(crypto.getRandomValues(new Uint8Array(2)))
                .map(b => b.toString(16).padStart(2, '0'))
                .join('');
            const uniqueUsername = `${username}_${randomSuffix}`;

            // Create user with unique username
            return await createUser(ctx, { ...args, username: uniqueUsername });
        }

        return await createUser(ctx, { ...args, username });
    },
});

// Helper function to create user
async function createUser(ctx: any, args: any) {
    // Create placeholder password hash (will be set after approval)
    const bcrypt = require('bcryptjs');
    const placeholderHash = await bcrypt.hash('placeholder', 10);

    const userId = await ctx.db.insert("managementUsers", {
        username: args.username,
        email: args.email,
        passwordHash: placeholderHash,
        accountStatus: "pending_approval",
        requirePasswordChange: false,
        companyName: args.companyName,
        contactPerson: args.contactPerson,
        phone: args.phone,
        role: args.role,
        onboardingData: args.onboardingData,
        failedLoginAttempts: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
    });

    return {
        success: true,
        userId,
        message: "Registration successful! Your account is pending admin approval.",
    };
}

/**
 * Get pending management users (admin only)
 */
export const getPendingManagementUsers = query({
    args: {},
    handler: async (ctx) => {
        // TODO: Add admin authentication check

        const pendingUsers = await ctx.db
            .query("managementUsers")
            .withIndex("by_accountStatus", (q) => q.eq("accountStatus", "pending_approval"))
            .collect();

        return pendingUsers;
    },
});

/**
 * Approve management user and send credentials
 */
export const approveManagementUser = mutation({
    args: {
        userId: v.id("managementUsers"),
    },
    handler: async (ctx, args) => {
        // TODO: Add admin authentication check

        const user = await ctx.db.get(args.userId);
        if (!user) {
            throw new Error("User not found");
        }

        if (user.accountStatus !== "pending_approval") {
            throw new Error("User is not pending approval");
        }

        // Generate temporary password
        const tempPassword = Array.from(crypto.getRandomValues(new Uint8Array(12)))
            .map(b => b.toString(36))
            .join('')
            .substring(0, 12)
            .toUpperCase();

        // Hash temporary password
        const bcrypt = require('bcryptjs');
        const tempPasswordHash = await bcrypt.hash(tempPassword, 12);

        // Update user
        await ctx.db.patch(args.userId, {
            accountStatus: "pending_setup",
            tempPasswordHash,
            tempPasswordExpiry: Date.now() + 30 * 60 * 1000, // 30 minutes
            requirePasswordChange: true,
            updatedAt: Date.now(),
        });

        // Send email with credentials
        await ctx.scheduler.runAfter(0, internalAny.managementAuth.sendCredentialsEmail, {
            email: user.email,
            name: user.contactPerson,
            companyName: user.companyName,
            username: user.username,
            tempPassword,
            userId: args.userId,
        });

        return {
            success: true,
            username: user.username,
            message: "User approved! Credentials sent via email.",
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
        userId: v.id("managementUsers"),
    },
    handler: async (ctx, args) => {
        const passwordLink = `${process.env.NEXT_PUBLIC_APP_URL}/management/reveal-password?token=${encodeURIComponent(args.tempPassword)}&user=${args.userId}`;
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
                metadata: { username: args.username },
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
        // Find user by username
        const user = await ctx.db
            .query("managementUsers")
            .withIndex("by_username", (q) => q.eq("username", args.username))
            .first();

        if (!user) {
            throw new Error("Invalid username or password");
        }

        // Check if account is active or pending setup
        if (user.accountStatus === "pending_approval") {
            throw new Error("Your account is pending admin approval");
        }

        if (user.accountStatus === "suspended") {
            throw new Error("Your account has been suspended");
        }

        const bcrypt = require('bcryptjs');
        let isValidPassword = false;

        // Check temporary password first (if pending setup)
        if (user.accountStatus === "pending_setup" && user.tempPasswordHash) {
            // Check if temp password expired
            if (user.tempPasswordExpiry && user.tempPasswordExpiry < Date.now()) {
                throw new Error("Temporary password has expired. Please contact admin.");
            }

            isValidPassword = await bcrypt.compare(args.password, user.tempPasswordHash);
        } else {
            // Check regular password
            isValidPassword = await bcrypt.compare(args.password, user.passwordHash);
        }

        if (!isValidPassword) {
            // Increment failed attempts
            await ctx.db.patch(user._id, {
                failedLoginAttempts: user.failedLoginAttempts + 1,
                updatedAt: Date.now(),
            });

            if (user.failedLoginAttempts >= 4) {
                // Lock account after 5 failed attempts
                await ctx.db.patch(user._id, {
                    accountStatus: "suspended",
                    updatedAt: Date.now(),
                });
                throw new Error("Account locked due to too many failed attempts. Contact admin.");
            }

            throw new Error("Invalid username or password");
        }

        // Reset failed attempts on successful login
        await ctx.db.patch(user._id, {
            failedLoginAttempts: 0,
            lastLoginAt: Date.now(),
            updatedAt: Date.now(),
        });

        return {
            success: true,
            userId: user._id,
            username: user.username,
            email: user.email,
            companyName: user.companyName,
            role: user.role,
            requirePasswordChange: user.requirePasswordChange,
            accountStatus: user.accountStatus,
        };
    },
});

/**
 * Update password (after first login or password reset)
 */
export const updatePassword = mutation({
    args: {
        userId: v.id("managementUsers"),
        newPassword: v.string(),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db.get(args.userId);
        if (!user) {
            throw new Error("User not found");
        }

        // Validate password strength
        if (args.newPassword.length < 8) {
            throw new Error("Password must be at least 8 characters long");
        }

        const bcrypt = require('bcryptjs');
        const passwordHash = await bcrypt.hash(args.newPassword, 12);

        await ctx.db.patch(args.userId, {
            passwordHash,
            tempPasswordHash: undefined,
            tempPasswordExpiry: undefined,
            accountStatus: "active",
            requirePasswordChange: false,
            passwordChangedAt: Date.now(),
            updatedAt: Date.now(),
        });

        return {
            success: true,
            message: "Password updated successfully",
        };
    },
});

/**
 * Get user by ID (for session management)
 */
export const getUserById = query({
    args: {
        userId: v.id("managementUsers"),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db.get(args.userId);
        if (!user) {
            return null;
        }

        // Don't return sensitive data
        return {
            _id: user._id,
            username: user.username,
            email: user.email,
            companyName: user.companyName,
            contactPerson: user.contactPerson,
            phone: user.phone,
            role: user.role,
            accountStatus: user.accountStatus,
            requirePasswordChange: user.requirePasswordChange,
            onboardingData: user.onboardingData,
        };
    },
});
