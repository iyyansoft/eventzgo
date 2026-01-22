"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Shield, Lock, User, AlertCircle, Loader2 } from "lucide-react";

// Disable static generation for this page
export const dynamic = 'force-dynamic';

export default function StaffLoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const staffLogin = useMutation(api.verificationStaff.staffLogin);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const result = await staffLogin({ username, password });

            // Check if login was successful
            if (result.success && result.staff) {
                // Store session
                const sessionData = {
                    staffId: result.staff.staffId,
                    staffName: result.staff.staffName,
                    role: result.staff.role,
                    permissions: result.staff.permissions,
                    eventId: result.staff.eventId,
                    organiserId: result.staff.organiserId,
                    organiserName: result.staff.organiserName,
                    loginTime: Date.now(),
                };

                if (rememberMe) {
                    localStorage.setItem('staffSession', JSON.stringify(sessionData));
                } else {
                    sessionStorage.setItem('staffSession', JSON.stringify(sessionData));
                }

                // Redirect to scanner
                router.push('/verify/scan');
            } else {
                // Show error message from response
                setError(result.error || "Login failed. Please check your credentials.");
            }
        } catch (err: any) {
            // Handle unexpected errors
            setError(err.message || "An unexpected error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Logo & Branding */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-4 shadow-lg">
                        <Shield className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        EventzGo Scanner
                    </h1>
                    <p className="text-gray-600">
                        Staff Login - Ticket Verification
                    </p>
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <form onSubmit={handleLogin} className="space-y-6">
                        {/* Error Message */}
                        {error && (
                            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-red-900">Login Failed</p>
                                    <p className="text-sm text-red-700 mt-1">{error}</p>
                                </div>
                            </div>
                        )}

                        {/* Username */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Username
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <User className="w-5 h-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder="Enter your username"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="w-5 h-5 text-gray-400" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder="Enter your password"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* Remember Me */}
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="rememberMe"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                disabled={loading}
                            />
                            <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-700">
                                Remember me on this device
                            </label>
                        </div>

                        {/* Login Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Logging in...
                                </>
                            ) : (
                                'Login to Scanner'
                            )}
                        </button>
                    </form>

                    {/* Help Text */}
                    <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                        <p className="text-sm text-blue-900">
                            <strong>Need help?</strong> Contact your event organizer for login credentials.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-6">
                    <p className="text-sm text-gray-600">
                        Powered by <span className="font-semibold text-gray-900">EventzGo</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
