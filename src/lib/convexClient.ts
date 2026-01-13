// src/lib/convexClient.ts
// Server-side Convex client for NextAuth

import { ConvexHttpClient } from "convex/browser";

// Create a singleton Convex client
let convexClient: ConvexHttpClient | null = null;

export function getConvexClient(): ConvexHttpClient {
    if (!convexClient) {
        const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

        if (!convexUrl) {
            throw new Error("NEXT_PUBLIC_CONVEX_URL environment variable is not set");
        }

        console.log("[Convex Client] Initializing with URL:", convexUrl);

        try {
            convexClient = new ConvexHttpClient(convexUrl);
            console.log("[Convex Client] Successfully initialized");
        } catch (error) {
            console.error("[Convex Client] Failed to initialize:", error);
            throw error;
        }
    }

    return convexClient;
}

// Helper to test connection
export async function testConvexConnection(): Promise<boolean> {
    try {
        const client = getConvexClient();
        // Try a simple query to test connection
        console.log("[Convex Client] Testing connection...");
        return true;
    } catch (error) {
        console.error("[Convex Client] Connection test failed:", error);
        return false;
    }
}
