"use client";

import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { CheckCircle, XCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

// Disable static generation for this page
export const dynamic = 'force-dynamic';

export default function ChangePasswordPage() {
    const router = useRouter();
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    const updatePassword = useMutation(api.roleBasedAuth.updatePassword);

    useEffect(() => {
        // Get userId from localStorage
        const storedUserId = localStorage.getItem("userId");
        if (!storedUserId) {
            router.push("/management/sign-in");
            return;
        }
        setUserId(storedUserId);
    }, [router]);

    // Password strength indicators
    const passwordChecks = {
        length: newPassword.length >= 8,
        uppercase: /[A-Z]/.test(newPassword),
        lowercase: /[a-z]/.test(newPassword),
        number: /[0-9]/.test(newPassword),
    };

    const allChecksPassed = Object.values(passwordChecks).every(Boolean);
    const passwordsMatch = newPassword === confirmPassword && newPassword.length > 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!userId) {
            setError("Session expired. Please sign in again.");
            return;
        }

        if (!allChecksPassed) {
            setError("Please meet all password requirements");
            return;
        }

        if (!passwordsMatch) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);

        try {
            await updatePassword({
                userId: userId as Id<"organisers">,
                newPassword,
            });

            alert("Password updated successfully!");

            // Get role from localStorage
            const role = localStorage.getItem("role") || "organiser";

            // Redirect to dashboard
            const dashboardMap: Record<string, string> = {
                organiser: "/management/organiser/dashboard",
                vendor: "/management/vendor/dashboard",
                speaker: "/management/speaker/dashboard",
                sponsor: "/management/sponsor/dashboard",
            };

            router.push(dashboardMap[role] || "/management/dashboard");
        } catch (err: any) {
            setError(err.message || "Failed to update password");
        } finally {
            setLoading(false);
        }
    };

    if (!userId) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex flex-col">
            {/* Header */}
            <div className="w-full bg-white/80 backdrop-blur-md border-b border-gray-200 py-4 px-6">
                <div className="max-w-7xl mx-auto flex items-center justify-center">
                    <div className="flex items-center space-x-3">
                        <Image
                            src="/eventzgo_logo.png"
                            alt="EventzGo"
                            width={192}
                            height={40}
                            className="h-10 w-auto"
                            priority
                        />
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">EventzGo</h1>
                            <p className="text-xs text-gray-600">Management Portal</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <div className="bg-white rounded-2xl shadow-2xl p-8">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <span className="text-3xl">ðŸ”</span>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                Change Your Password
                            </h2>
                            <p className="text-gray-600">
                                You must change your password to continue
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* New Password */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    New Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all pr-12"
                                        placeholder="Enter new password"
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

                            {/* Password Requirements */}
                            <div className="bg-gray-50 p-4 rounded-xl space-y-2">
                                <p className="text-sm font-semibold text-gray-700 mb-2">
                                    Password must contain:
                                </p>
                                {[
                                    { key: "length", label: "At least 8 characters" },
                                    { key: "uppercase", label: "Uppercase letter (A-Z)" },
                                    { key: "lowercase", label: "Lowercase letter (a-z)" },
                                    { key: "number", label: "Number (0-9)" },
                                ].map(({ key, label }) => (
                                    <div key={key} className="flex items-center space-x-2">
                                        {passwordChecks[key as keyof typeof passwordChecks] ? (
                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                        ) : (
                                            <XCircle className="w-4 h-4 text-gray-300" />
                                        )}
                                        <span
                                            className={`text-sm ${passwordChecks[key as keyof typeof passwordChecks]
                                                ? "text-green-700"
                                                : "text-gray-500"
                                                }`}
                                        >
                                            {label}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Confirm Password
                                </label>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all"
                                    placeholder="Confirm new password"
                                    required
                                    disabled={loading}
                                />
                                {confirmPassword && (
                                    <p
                                        className={`text-sm mt-2 ${passwordsMatch ? "text-green-600" : "text-red-600"
                                            }`}
                                    >
                                        {passwordsMatch ? "âœ“ Passwords match" : "âœ— Passwords do not match"}
                                    </p>
                                )}
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                                    <p className="text-sm text-red-800">{error}</p>
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={!allChecksPassed || !passwordsMatch || loading}
                                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3.5 px-6 rounded-xl hover:shadow-xl transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>Updating...</span>
                                    </>
                                ) : (
                                    <span>Update Password</span>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="w-full bg-gray-900 text-white py-6 px-6">
                <div className="max-w-7xl mx-auto text-center">
                    <p className="text-sm text-gray-400">
                        © 2026 EventzGo Management. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
}
