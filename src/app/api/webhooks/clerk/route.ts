import { Webhook } from "svix";
import { WebhookEvent } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error("Please add CLERK_WEBHOOK_SECRET to .env.local");
  }

  // Get the headers
  const svix_id = req.headers.get("svix-id");
  const svix_timestamp = req.headers.get("svix-timestamp");
  const svix_signature = req.headers.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: Missing svix headers", { status: 400 });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error: Verification failed", { status: 400 });
  }

  // Handle the webhook
  const eventType = evt.type;

  if (eventType === "user.created" || eventType === "user.updated") {
    const { id, email_addresses, first_name, last_name, image_url, phone_numbers, unsafe_metadata, public_metadata } = evt.data;
    const email = email_addresses[0]?.email_address || "";

    try {
      // STEP 1: Sync user to Convex (existing functionality)
      await convex.mutation(api.users.syncUser, {
        clerkId: id,
        email: email,
        firstName: first_name || undefined,
        lastName: last_name || undefined,
        profileImage: image_url || undefined,
        phone: phone_numbers[0]?.phone_number || undefined,
      });

      console.log(`User ${eventType}:`, id);

      // STEP 2: NEW - Check if this is an organiser sign-up
      const metadata = (unsafe_metadata || public_metadata) as any;

      if (eventType === "user.created" && metadata?.role === "organiser" && email) {
        // Check if an organiser with this email already exists in Convex
        const existingOrganiser = await convex.query(api.management.checkOrganiserByEmail, {
          email: email
        });

        if (existingOrganiser && !existingOrganiser.hasClerkId) {
          // EXISTING ORGANISER DETECTED - Sync Clerk ID
          console.log(`Found existing organiser for ${email}, syncing Clerk ID...`);

          const syncResult = await convex.mutation(api.management.syncExistingOrganiserWithClerk, {
            email: email,
            clerkId: id
          });

          if (syncResult.success) {
            console.log(`✅ Successfully synced existing organiser: ${email}`);
            console.log(`   Approval Status: ${syncResult.approvalStatus}`);
            console.log(`   Organiser ID: ${syncResult.organiserId}`);

            // Note: You'll need to update Clerk metadata separately using Clerk Admin API
            // This webhook doesn't have write access to Clerk, so you'd need to:
            // 1. Create a separate API endpoint that uses @clerk/clerk-sdk-node
            // 2. Call it here, or
            // 3. Handle it in your sign-in flow on the client side

            return new Response(JSON.stringify({
              success: true,
              message: "Existing organiser synced",
              data: syncResult
            }), {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            });
          }
        } else {
          console.log(`New organiser sign-up: ${email} - Will complete onboarding`);
        }
      }

    } catch (error) {
      console.error("Error syncing user to Convex:", error);
      return new Response("Error: Failed to sync user", { status: 500 });
    }
  }

  return new Response("Webhook received", { status: 200 });
}