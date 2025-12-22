
"use client";

import { SignUp } from "@clerk/nextjs";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";

export default function ManagementSignUpPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const role = searchParams.get("role") || "organiser";

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex flex-col">
            {/* Simple Header - No end-user navigation */}
            <div className="w-full bg-white/80 backdrop-blur-md border-b border-gray-200 py-4 px-6">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
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

                    <button
                        onClick={() => router.push("/management")}
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
                    {/* Role Badge */}
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-full shadow-lg">
                            <span className="text-2xl">
                                {role === "organiser" ? "🏢" :
                                    role === "vendor" ? "🛠️" :
                                        role === "speaker" ? "🎤" :
                                            role === "sponsor" ? "💰" : "👤"}
                            </span>
                            <div className="text-left">
                                <p className="text-xs font-medium opacity-90">Signing up as</p>
                                <p className="text-sm font-bold">
                                    {role.charAt(0).toUpperCase() + role.slice(1)}
                                </p>
                            </div>
                        </div>
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
                        forceRedirectUrl="/management/onboarding"
                        signInUrl="/management/sign-in"
                        unsafeMetadata={{
                            role: role,
                            status: role === "admin" ? "approved" : "pending",
                            onboardingCompleted: false,
                        }}
                    />

                    {/* Help Text */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Already have an account?{" "}
                            <button
                                onClick={() => router.push("/management/sign-in")}
                                className="text-purple-600 hover:text-purple-700 font-semibold"
                            >
                                Sign in
                            </button>
                        </p>
                    </div>

                    {/* Info Box */}
                    <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <h4 className="font-semibold text-blue-900 mb-2 text-sm">
                            What happens next?
                        </h4>
                        <ul className="space-y-1 text-xs text-blue-800">
                            <li>✓ Complete your profile with business details</li>
                            <li>✓ Admin will review your application</li>
                            <li>✓ Get approved within 24-48 hours</li>
                            <li>✓ Start managing your events!</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Simple Footer - No end-user links */}
            <div className="w-full bg-gray-900 text-white py-6 px-6">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between">
                    <p className="text-sm text-gray-400 mb-2 sm:mb-0">
                        © 2024 EventzGo Management. All rights reserved.
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