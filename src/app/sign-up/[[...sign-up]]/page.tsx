"use client";

import { SignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";

export default function SignUpPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex flex-col">
            {/* Header */}
            <div className="w-full bg-white/80 backdrop-blur-md border-b border-gray-200 py-4 px-6">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Image
                            src="/eventzgo_logo.png"
                            alt="EventzGo"
                            width={40}
                            height={40}
                            className="h-10 w-auto"
                        />
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">EventzGo</h1>
                            <p className="text-xs text-gray-600">Discover Amazing Events</p>
                        </div>
                    </div>

                    <button
                        onClick={() => router.push("/")}
                        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm font-medium">Back to Home</span>
                    </button>
                </div>
            </div>

            {/* Sign Up Content */}
            <div className="flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    {/* Welcome Message */}
                    <div className="text-center mb-8">
                        <div className="bg-gradient-to-r from-purple-600 to-pink-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <svg
                                className="w-8 h-8 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                                />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Join EventzGo
                        </h2>
                        <p className="text-gray-600">
                            Create an account to start booking amazing events
                        </p>
                    </div>

                    {/* Clerk Sign Up Component */}
                    <SignUp
                        appearance={{
                            elements: {
                                rootBox: "w-full",
                                card: "shadow-2xl border-0 rounded-2xl",
                                headerTitle: "hidden",
                                headerSubtitle: "hidden",
                                socialButtonsBlockButton:
                                    "bg-white border-2 border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition-all duration-200",
                                formButtonPrimary:
                                    "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 transition-all duration-200 hover:shadow-lg",
                                footerActionLink:
                                    "text-purple-600 hover:text-purple-700 font-semibold",
                                formFieldInput:
                                    "border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 rounded-lg transition-all duration-200",
                                formFieldLabel: "text-gray-700 font-medium",
                                dividerLine: "bg-gray-200",
                                dividerText: "text-gray-500",
                            },
                        }}
                        afterSignUpUrl="/"
                        redirectUrl="/"
                        signInUrl="/sign-in"
                        unsafeMetadata={{
                            role: "attendee",
                            status: "approved",
                            onboardingCompleted: true,
                        }}
                    />

                    {/* Help Text */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Already have an account?{" "}
                            <button
                                onClick={() => router.push("/sign-in")}
                                className="text-purple-600 hover:text-purple-700 font-semibold"
                            >
                                Sign in
                            </button>
                        </p>
                    </div>

                    {/* Benefits Box */}
                    <div className="mt-6 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-4">
                        <h4 className="font-semibold text-purple-900 mb-2 text-sm flex items-center">
                            <svg
                                className="w-4 h-4 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                                />
                            </svg>
                            What you'll get:
                        </h4>
                        <ul className="space-y-1 text-xs text-purple-800">
                            <li>✓ Easy event booking and ticket management</li>
                            <li>✓ Personalized event recommendations</li>
                            <li>✓ Exclusive early-bird access to events</li>
                            <li>✓ Digital tickets and QR codes</li>
                        </ul>
                    </div>

                    {/* Management Portal Link */}
                    <div className="mt-4 bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-indigo-200 rounded-xl p-4">
                        <h4 className="font-semibold text-indigo-900 mb-2 text-sm flex items-center">
                            <svg
                                className="w-4 h-4 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                />
                            </svg>
                            Want to organize events?
                        </h4>
                        <p className="text-xs text-indigo-800 mb-2">
                            Sign up as an organizer, vendor, speaker, or sponsor.
                        </p>
                        <button
                            onClick={() => router.push("/management")}
                            className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold underline"
                        >
                            Go to Management Portal →
                        </button>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="w-full bg-gray-900 text-white py-6 px-6">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between">
                    <p className="text-sm text-gray-400 mb-2 sm:mb-0">
                        © 2026 EventzGo. All rights reserved.
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <button className="hover:text-white transition-colors duration-200">
                            Privacy
                        </button>
                        <button className="hover:text-white transition-colors duration-200">
                            Terms
                        </button>
                        <button className="hover:text-white transition-colors duration-200">
                            Help
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
