import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

/**
 * Clerk webhook handler
 * Syncs user data from Clerk to Convex
 */
http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const payload = await request.json();
      const eventType = payload.type;

      switch (eventType) {
        case "user.created":
        case "user.updated": {
          const user = payload.data;

          await ctx.runMutation(internal.users.syncUserInternal, {
            clerkId: user.id,
            email: user.email_addresses[0]?.email_address || "",
            firstName: user.first_name,
            lastName: user.last_name,
            phone: user.phone_numbers[0]?.phone_number,
            profileImage: user.image_url,
            role: user.public_metadata?.role || "user",
          });

          return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }

        case "user.deleted": {
          const userId = payload.data.id;

          // In production, you might want to soft-delete or anonymize
          console.log(`User deleted: ${userId}`);

          return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }

        default:
          return new Response(
            JSON.stringify({ error: "Unhandled event type" }),
            {
              status: 400,
              headers: { "Content-Type": "application/json" },
            }
          );
      }
    } catch (error) {
      console.error("Clerk webhook error:", error);
      return new Response(
        JSON.stringify({ error: "Internal server error" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  }),
});

/**
 * Health check endpoint
 */
http.route({
  path: "/health",
  method: "GET",
  handler: httpAction(async () => {
    return new Response(
      JSON.stringify({ status: "ok", timestamp: Date.now() }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  }),
});

export default http;