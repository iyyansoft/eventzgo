// src/lib/auth.ts
// NextAuth.js configuration with security enhancements

import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { callConvexAction } from "./convexHttp";

// Use direct HTTP calls instead of ConvexHttpClient for server-side compatibility

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            id: "organiser-credentials",
            name: "Organiser Login",
            credentials: {
                username: {
                    label: "Username",
                    type: "text",
                    placeholder: "Enter your username",
                },
                password: {
                    label: "Password",
                    type: "password",
                    placeholder: "Enter your password",
                },
            },
            async authorize(credentials, req) {
                if (!credentials?.username || !credentials?.password) {
                    throw new Error("Please provide username and password");
                }

                try {
                    console.log("[NextAuth] Starting authentication for username:", credentials.username);

                    // Get IP address and user agent from request
                    const forwarded = req.headers?.["x-forwarded-for"];
                    const ipAddress = typeof forwarded === "string"
                        ? forwarded.split(",")[0]
                        : req.headers?.["x-real-ip"] || "unknown";

                    const userAgent = req.headers?.["user-agent"] || "unknown";

                    console.log("[NextAuth] Request info - IP:", ipAddress, "User-Agent:", userAgent?.substring(0, 50));

                    // Call secure sign-in action via direct HTTP
                    console.log("[NextAuth] Calling Convex action via HTTP: auth/authActions:signInAction");

                    const timeoutPromise = new Promise((_, reject) =>
                        setTimeout(() => {
                            console.error("[NextAuth] Convex action timed out after 15 seconds");
                            reject(new Error("Connection timeout - please check if Convex is running"));
                        }, 15000) // Increased to 15 seconds
                    );

                    const result = await Promise.race([
                        callConvexAction("auth/authActions:signInAction", {
                            username: credentials.username,
                            password: credentials.password,
                            ipAddress: ipAddress as string,
                            userAgent,
                        }),
                        timeoutPromise
                    ]) as any;

                    console.log("[NextAuth] Convex action completed, success:", result?.success);

                    if (result.success) {
                        console.log("[NextAuth] Login successful for user ID:", result.userId);
                        return {
                            id: result.userId,
                            name: result.companyName,
                            email: result.email || "",
                            username: result.username,
                            role: result.role,
                            accountStatus: result.accountStatus,
                            requirePasswordChange: result.requirePasswordChange,
                            sessionToken: result.sessionToken,
                        };
                    }

                    console.log("[NextAuth] Login failed - result.success was false");
                    return null;
                } catch (error: any) {
                    console.error("[NextAuth] Authentication error:", error);
                    console.error("[NextAuth] Error code:", error.code);
                    console.error("[NextAuth] Error message:", error.message);

                    // Provide more helpful error messages
                    if (error.message?.includes("timeout") || error.code === "ETIMEDOUT") {
                        throw new Error("Connection timeout. Please ensure Convex dev server is running and check your internet connection.");
                    }

                    throw new Error(error.message || "Authentication failed");
                }
            },
        }),
    ],

    session: {
        strategy: "jwt",
        maxAge: 24 * 60 * 60, // 24 hours
        updateAge: 30 * 60, // Update session every 30 minutes
    },

    jwt: {
        maxAge: 24 * 60 * 60, // 24 hours
    },

    pages: {
        signIn: "/management/sign-in",
        error: "/management/sign-in",
    },

    callbacks: {
        async jwt({ token, user, account }) {
            // Initial sign in
            if (user) {
                token.userId = user.id;
                token.username = user.username || "";
                token.role = user.role || "";
                token.accountStatus = user.accountStatus || "";
                token.requirePasswordChange = user.requirePasswordChange || false;
                token.sessionToken = user.sessionToken || "";
            }

            return token;
        },

        async session({ session, token }) {
            // Verify session is still valid in database
            try {
                const verification = await callConvexAction(
                    "auth/authActions:verifySessionAction",
                    {
                        sessionToken: token.sessionToken as string,
                    }
                );

                if (!verification.valid) {
                    // Session invalid - force logout
                    throw new Error("Session expired or invalid");
                }

                // Add user data to session
                session.user = {
                    ...session.user,
                    userId: token.userId as string,
                    username: token.username as string,
                    role: token.role as string,
                    accountStatus: token.accountStatus as string,
                    requirePasswordChange: token.requirePasswordChange as boolean,
                };

                return session;
            } catch (error) {
                console.error("Session verification error:", error);
                throw error;
            }
        },

        async redirect({ url, baseUrl }) {
            // Redirect to dashboard after login
            if (url.startsWith(baseUrl)) {
                return url;
            }
            // Default redirect
            return `${baseUrl}/management/organiser/dashboard`;
        },
    },

    events: {
        async signOut({ token }) {
            // Invalidate session in database
            if (token?.sessionToken) {
                try {
                    await callConvexAction("auth/authActions:logoutAction", {
                        sessionToken: token.sessionToken as string,
                    });
                } catch (error) {
                    console.error("Logout error:", error);
                }
            }
        },
    },

    // Security settings
    secret: process.env.NEXTAUTH_SECRET,

    debug: process.env.NODE_ENV === "development",
};
