// src/app/api/auth/organiser-login/route.ts
// Client-side compatible authentication API route

import { NextRequest, NextResponse } from "next/server";

// This runs on the edge/serverless, not in the main server
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { username, password } = body;

        console.log("[Login API] Attempting login for:", username);

        if (!username || !password) {
            return NextResponse.json(
                { error: "Username and password required" },
                { status: 400 }
            );
        }

        const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
        if (!convexUrl) {
            console.error("[Login API] NEXT_PUBLIC_CONVEX_URL missing");
            return NextResponse.json(
                { error: "Convex not configured" },
                { status: 500 }
            );
        }

        // Get IP and user agent
        const ipAddress = request.headers.get("x-forwarded-for") ||
            request.headers.get("x-real-ip") ||
            "unknown";
        const userAgent = request.headers.get("user-agent") || "unknown";

        // Construct Convex Action URL
        // Note: Using direct fetch to avoid client library issues in Edge runtime
        const actionPath = "auth/authActions:signInAction";
        const url = `${convexUrl}/api/action/${actionPath}`;

        console.log("[Login API] Calling Convex URL:", url);

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                args: {
                    username,
                    password,
                    ipAddress,
                    userAgent,
                }
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[Login API] Upstream error ${response.status}:`, errorText);
            return NextResponse.json(
                { error: `Convex error: ${response.status}` },
                { status: 500 }
            );
        }

        const data = await response.json();
        // Convex actions return { value: ... } or { status: "success", value: ... } depending on wrapper
        // Taking the value directly
        const result = data.value;

        if (result && result.success) {
            console.log("[Login API] Login successful for:", result.username);

            // Set httpOnly cookie for security (optional but good practice)
            const res = NextResponse.json({
                success: true,
                user: {
                    id: result.userId,
                    username: result.username,
                    companyName: result.companyName,
                    email: result.email,
                    role: result.role,
                    accountStatus: result.accountStatus,
                    sessionToken: result.sessionToken,
                },
            });

            // Set validation cookie
            res.cookies.set("organiser_token", result.sessionToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 86400 // 1 day
            });

            return res;
        } else {
            console.warn("[Login API] Login failed:", result?.error);
            return NextResponse.json(
                { error: result?.error || "Invalid credentials" },
                { status: 401 }
            );
        }
    } catch (error: any) {
        console.error("[Organiser Login API] Critical Error:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}

// Use edge runtime for better compatibility
export const runtime = "edge";
