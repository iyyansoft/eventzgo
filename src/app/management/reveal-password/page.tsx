"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, Suspense } from "react";
import Image from "next/image";
import { Copy, Check, Eye, EyeOff, Loader2 } from "lucide-react";

// Disable static generation for this page
export const dynamic = 'force-dynamic';

function RevealPasswordContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const password = searchParams.get("token");
    const [copied, setCopied] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleCopy = () => {
        if (password) {
            navigator.clipboard.writeText(password);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (!password) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-xl shadow-xl max-w-md text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Link</h1>
                    <p className="text-gray-600 mb-6">
                        This password reveal link is invalid or has expired.
                    </p>
                    <button
                        onClick={() => router.push("/management")}
                        className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700"
                    >
                        Go to Home
                    </button>
                </div>
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
                    <div className="bg-white p-8 rounded-2xl shadow-2xl">
                        <div className="text-center mb-8">
                            <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <span className="text-4xl">ðŸ”“</span>
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                Your Temporary Password
                            </h1>
                            <p className="text-gray-600">
                                Use this password to sign in to your account
                            </p>
                        </div>

                        {/* Password Display */}
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl mb-6 border-2 border-purple-200">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-semibold text-gray-700">Password:</p>
                                <button
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="text-purple-600 hover:text-purple-700 p-1"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            <div className="bg-white p-4 rounded-lg mb-4">
                                <p className="text-2xl font-mono text-center text-gray-900 select-all">
                                    {showPassword ? password : "â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"}
                                </p>
                            </div>
                            <button
                                onClick={handleCopy}
                                className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-all flex items-center justify-center space-x-2"
                            >
                                {copied ? (
                                    <>
                                        <Check size={20} />
                                        <span>Copied!</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy size={20} />
                                        <span>Copy Password</span>
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Warning */}
                        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
                            <p className="text-sm font-bold text-red-900 mb-2">
                                âš ï¸ IMPORTANT SECURITY NOTICE
                            </p>
                            <ul className="space-y-1 text-sm text-red-800">
                                <li>â€¢ This password expires in 30 minutes</li>
                                <li>â€¢ You MUST change it after first login</li>
                                <li>â€¢ Do NOT share this password with anyone</li>
                                <li>â€¢ Delete this page after copying</li>
                            </ul>
                        </div>

                        {/* Instructions */}
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                            <p className="text-sm font-semibold text-blue-900 mb-2">
                                Next Steps:
                            </p>
                            <ol className="space-y-1 text-sm text-blue-800 list-decimal list-inside">
                                <li>Copy your temporary password above</li>
                                <li>Click "Go to Sign In" button below</li>
                                <li>Enter your username and this password</li>
                                <li>Create a new secure password</li>
                            </ol>
                        </div>

                        {/* Action Button */}
                        <button
                            onClick={() => router.push("/management/sign-in")}
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3.5 px-6 rounded-xl hover:shadow-xl transform hover:scale-[1.02] transition-all"
                        >
                            Go to Sign In
                        </button>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="w-full bg-gray-900 text-white py-6 px-6">
                <div className="max-w-7xl mx-auto text-center">
                    <p className="text-sm text-gray-400">
                        Â© 2024 EventzGo Management. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function RevealPasswordPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
            </div>
        }>
            <RevealPasswordContent />
        </Suspense>
    );
}
