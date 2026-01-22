"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
    ArrowLeft,
    Eye,
    EyeOff,
    Loader2,
    Shield,
    AlertTriangle,
    Mail,
    Lock,
    User,
    Sparkles,
    CheckCircle
} from "lucide-react";

export default function OrganiserAuthPage() {
    const router = useRouter();
    const signInAction = useAction(api.auth.authActions.signInAction);

    // Sign In State
    const [signInData, setSignInData] = useState({
        username: "",
        password: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            console.log("Initiating sign in...");
            const result = await signInAction({
                username: signInData.username,
                password: signInData.password,
                ipAddress: "client-direct",
                userAgent: navigator.userAgent
            });
            console.log("Sign in result:", result);

            if (result.success) {
                const user = {
                    id: result.userId,
                    username: result.username,
                    companyName: result.companyName,
                    email: result.email,
                    role: result.role,
                    accountStatus: result.accountStatus,
                    sessionToken: result.sessionToken,
                };

                // Store session
                try {
                    localStorage.setItem("organiser_session", JSON.stringify(user));
                    console.log("Session stored locally");
                } catch (e) {
                    console.error("Storage error:", e);
                }

                // Redirect using window.location for robustness
                console.log("Redirecting to dashboard...");
                window.location.href = "/management/organiser/dashboard";
                return;
            } else {
                setError(result.message || "Login failed - Invalid credentials");
                setLoading(false);
            }
        } catch (err: any) {
            console.error("Sign-in error:", err);
            console.log("Error message:", err.message);
            console.log("Error organiserId:", err.organiserId);
            console.log("Error email:", err.email);

            // Check if error is about email verification
            if (err.message?.includes("verify your email")) {
                console.log("Email verification error detected, redirecting...");

                // Use username as email fallback (they might have entered email as username)
                const email = signInData.username;

                // Redirect to email-not-verified page
                router.push(`/management/email-not-verified?email=${encodeURIComponent(email)}`);
                return;
            }

            setError(err.message || "Failed to sign in");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900 flex flex-col relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                <div className="absolute top-40 right-10 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            {/* Header */}
            <div className="relative z-10 w-full bg-white/10 backdrop-blur-md border-b border-white/20 py-4 px-6">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Image
                            src="/eventzgo_logo.png"
                            alt="EventzGo"
                            width={192}
                            height={40}
                            className="h-10 w-auto brightness-0 invert"
                            priority
                        />
                    </div>

                    <button
                        onClick={() => router.push("/management")}
                        className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors duration-200"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm font-medium">Back to Home</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex-1 flex items-center justify-center p-4 py-12">
                <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">

                    {/* Left Side - Branding */}
                    <div className="hidden md:block text-white space-y-8">
                        <div className="space-y-4">
                            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                                <Sparkles className="w-4 h-4 text-yellow-300" />
                                <span className="text-sm font-semibold">Enterprise-Grade Security</span>
                            </div>

                            <h1 className="text-5xl font-bold leading-tight">
                                Manage Your Events
                                <br />
                                <span className="bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
                                    Like a Pro
                                </span>
                            </h1>

                            <p className="text-xl text-white/80">
                                Join thousands of event organisers who trust EventzGo for their event management needs.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-start space-x-3">
                                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                                    <CheckCircle className="w-5 h-5 text-green-300" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">Secure & Compliant</h3>
                                    <p className="text-white/70 text-sm">Bank-grade encryption with complete audit trails</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                                    <Shield className="w-5 h-5 text-blue-300" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">Rate Limiting Protection</h3>
                                    <p className="text-white/70 text-sm">Advanced security against brute force attacks</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                                    <Sparkles className="w-5 h-5 text-purple-300" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">Real-time Analytics</h3>
                                    <p className="text-white/70 text-sm">Track bookings, revenue, and attendees in real-time</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Sign In Logic Only */}
                    <div className="w-full">
                        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden p-8">
                            <div className="space-y-6">
                                <div className="text-center">
                                    <div className="inline-flex items-center space-x-2 bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-full mb-4">
                                        <Shield className="w-4 h-4" />
                                        <span className="text-xs font-semibold">Secured with NextAuth</span>
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                        Welcome Back
                                    </h2>
                                    <p className="text-gray-600">
                                        Sign in to access your organiser dashboard
                                    </p>
                                </div>

                                <form onSubmit={handleSignIn} className="space-y-5">
                                    {/* Username */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Username
                                        </label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="text"
                                                value={signInData.username}
                                                onChange={(e) => setSignInData({ ...signInData, username: e.target.value })}
                                                className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all"
                                                placeholder="Enter your username"
                                                required
                                                disabled={loading}
                                            />
                                        </div>
                                    </div>

                                    {/* Password */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Password
                                        </label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                value={signInData.password}
                                                onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                                                className="w-full pl-11 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all"
                                                placeholder="Enter your password"
                                                required
                                                disabled={loading}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                            >
                                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Forgot Password Link */}
                                    <div className="flex justify-end">
                                        <Link
                                            href="/management/forgot-password"
                                            className="text-sm font-medium text-purple-600 hover:text-purple-500 hover:underline"
                                        >
                                            Forgot password?
                                        </Link>
                                    </div>

                                    {/* Error Message */}
                                    {error && (
                                        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                                            <div className="flex items-start space-x-3">
                                                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                                <div className="flex-1">
                                                    <p className="text-sm font-semibold text-red-800 mb-1">
                                                        {error.includes("Too many") ? "Account Temporarily Locked" : "Sign In Failed"}
                                                    </p>
                                                    <p className="text-sm text-red-700">{error}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3.5 px-6 rounded-xl hover:shadow-xl transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                <span>Signing in...</span>
                                            </>
                                        ) : (
                                            <span>Sign In</span>
                                        )}
                                    </button>

                                    {/* Sign Up Link */}
                                    <div className="mt-6 text-center pt-4 border-t border-gray-100">
                                        <p className="text-sm text-gray-600">
                                            Don't have an account?{' '}
                                            <Link
                                                href="/management/sign-up?role=organiser"
                                                className="inline-block font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-80 transition-opacity"
                                            >
                                                Sign Up
                                            </Link>
                                        </p>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Security Badge */}
                        <div className="mt-6 text-center">
                            <div className="inline-flex items-center space-x-2 text-white/80 text-sm">
                                <Shield className="w-4 h-4" />
                                <span>Protected by enterprise-grade security • Rate limiting active • Audit logging enabled</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="relative z-10 w-full bg-white/10 backdrop-blur-md border-t border-white/20 py-4 px-6">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-white/60 text-sm">
                    <p>© 2026 EventzGo. All rights reserved.</p>
                    <div className="flex items-center space-x-4 mt-2 sm:mt-0">
                        <button className="hover:text-white transition-colors">Privacy</button>
                        <button className="hover:text-white transition-colors">Terms</button>
                        <button className="hover:text-white transition-colors">Help</button>
                    </div>
                </div>
            </div>
            <style jsx>{`
            /* Animations (Same as before) */
            @keyframes blob { 0% { transform: translate(0px, 0px) scale(1); } 33% { transform: translate(30px, -50px) scale(1.1); } 66% { transform: translate(-20px, 20px) scale(0.9); } 100% { transform: translate(0px, 0px) scale(1); } }
            .animate-blob { animation: blob 7s infinite; }
            .animation-delay-2000 { animation-delay: 2s; }
            .animation-delay-4000 { animation-delay: 4s; }
            `}</style>
        </div>
    );
}
