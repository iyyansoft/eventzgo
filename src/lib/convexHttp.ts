// src/lib/convexHttp.ts
// Direct HTTP client for calling Convex actions from server-side using ConvexHttpClient

import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";
import dns from 'node:dns';

// Force IPv4 for all lookups to avoid Windows/IPv6 connectivity issues with Node/Undici
const originalLookup = dns.lookup;
(dns as any).lookup = (hostname: string, options: any, callback: any) => {
    if (typeof options === 'function') {
        callback = options;
        options = {};
    }
    options = { ...options, family: 4 };
    return originalLookup(hostname, options, callback);
};

export async function callConvexAction<T = any>(
    actionPath: string,
    args: any
): Promise<T> {
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

    if (!convexUrl) {
        throw new Error("NEXT_PUBLIC_CONVEX_URL is not set");
    }

    // Initialize client
    const client = new ConvexHttpClient(convexUrl);

    // Resolve function reference from string path (e.g., "auth/authActions:signInAction")
    // format: path/to/file:functionName
    const [modulePath, funcName] = actionPath.split(':');
    if (!modulePath || !funcName) {
        throw new Error(`Invalid action path format: ${actionPath}`);
    }

    const pathParts = modulePath.split('/');

    // Traverse api object
    let apiNode: any = api;
    for (const part of pathParts) {
        apiNode = apiNode[part];
        if (!apiNode) {
            throw new Error(`API module not found: ${part} in ${actionPath}`);
        }
    }

    const apiFunction = apiNode[funcName];
    if (!apiFunction) {
        throw new Error(`API function not found: ${funcName} in ${actionPath}`);
    }

    console.log(`[Convex Client] Executing action: ${actionPath}`);

    try {
        // We use client.action() because auth functions are defined as actions
        return await client.action(apiFunction, args);
    } catch (error: any) {
        console.error("[Convex Client] Execution failed:", error);
        throw error;
    }
}
