"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { Resend } from "resend";

/**
 * Send an email using Resend
 */
export const sendEmail = action({
    args: {
        to: v.string(),
        subject: v.string(),
        html: v.string(),
    },
    handler: async (ctx, args) => {
        const apiKey = process.env.RESEND_API_KEY;

        if (!apiKey) {
            // In development, we might not have the key yet. 
            // Log it so we can still "see" it happened.
            console.warn("[MAIL] Mock Send (Missing Key):");
            console.warn(`To: ${args.to}`);
            console.warn(`Subject: ${args.subject}`);

            // Extract verification link if present
            const linkMatch = args.html.match(/href="([^"]*verify-email[^"]*)"/);
            if (linkMatch) {
                console.warn('\n🔗 VERIFICATION LINK (Copy this):');
                console.warn(linkMatch[1]);
                console.warn('');
            }

            return { success: false, error: "Missing RESEND_API_KEY" };
        }

        const resend = new Resend(apiKey);

        try {
            // 'onboarding@resend.dev' is the testing domain provided by Resend.
            // It only sends to the email address you registered with Resend (unless domain is verified).
            const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

            const { data, error } = await resend.emails.send({
                from: `EventzGo <${fromEmail}>`,
                to: [args.to],
                subject: args.subject,
                html: args.html,
            });

            if (error) {
                console.error("Resend API Error:", error);
                return { success: false, error: error.message };
            }

            console.log(`[MAIL] ✅ Sent '${args.subject}' to ${args.to} (ID: ${data?.id})`);

            // In development, also log the email content for easy testing
            if (process.env.NODE_ENV === 'development') {
                console.log('\n📧 ========== EMAIL SENT ==========');
                console.log(`To: ${args.to}`);
                console.log(`Subject: ${args.subject}`);
                console.log('Content:', args.html.substring(0, 500));

                // Extract verification link if present
                const linkMatch = args.html.match(/href="([^"]*verify-email[^"]*)"/);
                if (linkMatch) {
                    console.log('\n🔗 VERIFICATION LINK:');
                    console.log(linkMatch[1]);
                }
                console.log('===================================\n');
            }

            return { success: true, id: data?.id };

        } catch (err: any) {
            console.error("Email Sending Exception:", err);
            return { success: false, error: err.message };
        }
    }
});
