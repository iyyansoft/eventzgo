// convex/http.ts - NEW FILE for Clerk webhook
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { anyApi } from "convex/server";
const internalAny = anyApi;
import { Webhook } from "svix";

const http = httpRouter();

// Clerk webhook handler
http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

    if (!webhookSecret) {
      return new Response("Missing CLERK_WEBHOOK_SECRET", { status: 500 });
    }

    const svix_id = request.headers.get("svix-id");
    const svix_timestamp = request.headers.get("svix-timestamp");
    const svix_signature = request.headers.get("svix-signature");

    if (!svix_id || !svix_timestamp || !svix_signature) {
      return new Response("Missing svix headers", { status: 400 });
    }

    const payload = await request.text();
    const body = JSON.parse(payload);

    const wh = new Webhook(webhookSecret);
    let evt: any;

    try {
      evt = wh.verify(payload, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      });
    } catch (err) {
      console.error("Error verifying webhook:", err);
      return new Response("Error verifying webhook", { status: 400 });
    }

    const eventType = evt.type;
    const { id, email_addresses, first_name, last_name, image_url, phone_numbers, public_metadata } = evt.data;

    // Handle user.created event
    if (eventType === "user.created") {
      await ctx.runMutation(internalAny.users.createUser, {
        clerkId: id,
        email: email_addresses[0]?.email_address || "",
        firstName: first_name || undefined,
        lastName: last_name || undefined,
        profileImage: image_url || undefined,
        phone: phone_numbers[0]?.phone_number || undefined,
        role: public_metadata?.role || "user",
        isActive: true,
      });
    }

    // Handle user.updated event
    if (eventType === "user.updated") {
      await ctx.runMutation(internalAny.users.updateUser, {
        clerkId: id,
        email: email_addresses[0]?.email_address || "",
        firstName: first_name || undefined,
        lastName: last_name || undefined,
        profileImage: image_url || undefined,
        phone: phone_numbers[0]?.phone_number || undefined,
        role: public_metadata?.role || "user",
      });
    }

    return new Response("Webhook processed", { status: 200 });
  }),
});

export default http;