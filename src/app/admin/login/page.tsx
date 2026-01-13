"use client";

import { useState } from "react";
import Image from "next/image";
import { Shield, Lock, Mail, ArrowRight, Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAdminAuth } from "@/components/admin/AdminAuthProvider";

export default function AdminLoginPage() {
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const signIn = useAction(api.auth.authActions.signInAction);
    const { login } = useAdminAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            // Direct Client-Side Login (Bypassing Server Fetch issues)
            const result = await signIn({
                username: identifier,
                password: password,
            });

            // result contains sessionToken, role, etc.
            if (result && result.sessionToken) {
                // Enforce Admin Role
                if (result.role !== "admin") {
                    setError("Access denied. Admin privileges required.");
                    setIsLoading(false);
                    return;
                }

                // Login successful
                login(result.sessionToken, result);
            } else {
                throw new Error("Invalid response from server");
            }
        } catch (err: any) {
            console.error("Login failed:", err);
            // Handle specific Convex errors
            if (err.message && (err.message.includes("Invalid credentials") || err.message.includes("Invalid username"))) {
                setError("Invalid credentials. Please try again.");
            } else {
                setError(err.message || "An unexpected error occurred. Please try again.");
            }
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-500/20 rounded-full blur-[128px]" />
                <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-500/20 rounded-full blur-[128px]" />
            </div>

            <div className="w-full max-w-md relative z-10">
                <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                    <div className="text-center mb-8">
                        <div className="mx-auto bg-gradient-to-tr from-white/10 to-transparent w-20 h-20 rounded-2xl flex items-center justify-center mb-6 border border-white/5 shadow-lg relative group">
                            <div className="absolute inset-0 bg-white/5 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                            <Shield className="w-10 h-10 text-white relative z-10" />
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-zinc-900 animate-pulse"></div>
                        </div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-white/80 to-white/50 mb-2">
                            Admin Sign In
                        </h1>
                        <p className="text-zinc-400 text-sm">
                            Enter your credentials to access the dashboard
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 animate-in slide-in-from-top-2">
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-zinc-500 ml-1 uppercase tracking-wider">
                                Username / Email
                            </label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-white transition-colors" />
                                <input
                                    type="text"
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-12 py-3.5 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20 transition-all hover:bg-black/70"
                                    placeholder="admin@eventzgo.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-zinc-500 ml-1 uppercase tracking-wider">
                                Password
                            </label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-white transition-colors" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-12 py-3.5 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20 transition-all hover:bg-black/70 pr-12"
                                    placeholder="••••••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 group shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Sign In
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 flex items-center justify-between text-xs text-zinc-600 px-2">
                        <span>Protected by EventzGo Secure</span>
                        <span>v2.4.0 (Admin Build)</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
