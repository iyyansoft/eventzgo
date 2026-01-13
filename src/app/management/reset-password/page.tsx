"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const router = useRouter();
    const resetPassword = useAction(api.auth.authActions.resetPasswordAction);

    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
    const [errorMsg, setErrorMsg] = useState("");

    if (!token) {
        return (
            <div className="w-full max-w-md bg-white rounded-xl shadow p-8 text-center text-red-600">
                Invalid or missing reset token.
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirm) {
            setErrorMsg("Passwords do not match");
            return;
        }
        if (password.length < 8) {
            setErrorMsg("Password must be at least 8 characters");
            return;
        }

        setIsSubmitting(true);
        setErrorMsg("");

        try {
            await resetPassword({ token, newPassword: password });
            setStatus("success");
            setTimeout(() => router.push("/management/sign-in"), 3000);
        } catch (err: any) {
            console.error(err);
            setStatus("error");
            setErrorMsg(err.message || "Failed to reset password. Link might be expired.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (status === "success") {
        return (
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Password Reset!</h2>
                <p className="text-gray-600 mb-6">
                    Your password has been updated successfully. Redirecting to login...
                </p>
                <Link href="/management/sign-in" className="text-purple-600 font-medium hover:underline">
                    Click here if not redirected
                </Link>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
            <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">Reset Password</h1>
            <p className="text-center text-gray-600 mb-8">Enter your new password below</p>

            {errorMsg && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm border border-red-100">
                    {errorMsg}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                    <input
                        type="password"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 transition"
                        placeholder="••••••••"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        minLength={8}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                    <input
                        type="password"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 transition"
                        placeholder="••••••••"
                        value={confirm}
                        onChange={e => setConfirm(e.target.value)}
                        required
                        minLength={8}
                    />
                </div>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? "Resetting..." : "Set New Password"}
                </button>
            </form>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-4">
            <Suspense fallback={<div className="text-purple-600 font-medium">Loading...</div>}>
                <ResetPasswordForm />
            </Suspense>
        </div>
    );
}
