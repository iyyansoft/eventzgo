// src/app/management/sign-in/[[...sign-in]]/page.tsx - Matching sign-up design
"use client";

import { SignIn } from '@clerk/nextjs';
import { useOrganiserSync } from '@/hooks/useOrganiserSync';
import { useUser } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

export default function ManagementSignInPage() {
    const { user, isLoaded } = useUser();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [showError, setShowError] = useState(false);

    // Get role from URL
    const role = searchParams.get("role") || "";

    // Check if organiser exists in Convex database
    const organiserData = useQuery(
        api.organisers.getOrganiserByClerkId,
        user?.id ? { clerkId: user.id } : "skip"
    );

    // This hook will automatically sync existing organisers
    useOrganiserSync();

    useEffect(() => {
        if (isLoaded && user) {
            const clerkRole = user.publicMetadata?.role as string;
            const clerkStatus = user.publicMetadata?.status as string;

            console.log('Sign-in check:', {
                clerkRole,
                clerkStatus,
                organiserData,
                userId: user.id
            });

            // Check if user is an end user (not a management role)
            if (clerkRole === 'user' || clerkRole === 'attendee' || !clerkRole) {
                console.log('End user detected, showing error');
                setShowError(true);
                setTimeout(() => {
                    router.push('/management');
                }, 3000);
                return;
            }

            // For organisers, check Convex database
            if (clerkRole === 'organiser' && organiserData !== undefined) {
                console.log('Organiser check:', { organiserData });

                if (organiserData === null) {
                    console.log('Organiser not in database, redirecting to onboarding');
                    router.push('/management/onboarding');
                } else {
                    // Check approval status from Convex
                    const approvalStatus = organiserData.approvalStatus;
                    console.log('Approval status:', approvalStatus);

                    if (approvalStatus === 'approved') {
                        console.log('Approved! Redirecting to dashboard');
                        router.push('/management/organiser/dashboard');
                    } else if (approvalStatus === 'pending') {
                        console.log('Pending approval');
                        router.push('/management/pending-approval');
                    } else if (approvalStatus === 'rejected') {
                        console.log('Rejected');
                        router.push('/management/pending-approval');
                    }
                }
            }

            // For admins
            if (clerkRole === 'admin') {
                console.log('Admin detected, redirecting to admin dashboard');
                router.push('/admin/dashboard');
            }
        }
    }, [isLoaded, user, organiserData, router]);

    // Show loading state while checking user status
    if (isLoaded && user) {
        const clerkRole = user.publicMetadata?.role as string;

        // If user is an organiser, wait for Convex data to load
        if (clerkRole === 'organiser' && organiserData === undefined) {
            return (
                <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex flex-col items-center justify-center p-4">
                    <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
                        <div className="text-center">
                            <div className="w-20 h-20 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-3">
                                Verifying Your Account
                            </h1>
                            <p className="text-gray-600">
                                Please wait while we check your organiser status...
                            </p>
                        </div>
                    </div>
                </div>
            );
        }
    }

    // Show error message if end user tries to sign in
    if (showError) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border-2 border-red-100 p-8">
                    <div className="text-center">
                        <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="w-12 h-12 text-red-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-3">
                            No Management Profile Found
                        </h1>
                        <p className="text-gray-600 mb-6">
                            You don't have a management profile. Please create one to access the management portal.
                        </p>
                        <div className="space-y-3">
                            <button
                                onClick={() => router.push('/management')}
                                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
                            >
                                Create Management Profile
                            </button>
                            <button
                                onClick={() => router.push('/')}
                                className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200"
                            >
                                Go to Main Site
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex flex-col">
            {/* Header - Matching sign-up */}
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

            {/* Sign-in Content */}
            <div className="flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    {/* Role Badge - Matching sign-up */}
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-full shadow-lg">
                            <span className="text-2xl">
                                {!role ? "👤" :
                                    role === "organiser" || role === "organizer" ? "🏢" :
                                        role === "vendor" ? "🛠️" :
                                            role === "speaker" ? "🎤" :
                                                role === "sponsor" ? "💰" : "👤"}
                            </span>
                            <div className="text-left">
                                <p className="text-xs font-medium opacity-90">
                                    {!role ? "Management Portal" : "Signing in as"}
                                </p>
                                <p className="text-sm font-bold">
                                    {!role ? "Sign In" : role.charAt(0).toUpperCase() + role.slice(1)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Clerk Sign In Component */}
                    <SignIn
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
                            }
                        }}
                        signUpUrl="/management/sign-up"
                    />

                    {/* Help Text */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Don't have an account?{' '}
                            <button
                                onClick={() => router.push('/management')}
                                className="text-purple-600 hover:text-purple-700 font-semibold"
                            >
                                Register now
                            </button>
                        </p>
                    </div>

                    {/* Info Box */}
                    <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <h4 className="font-semibold text-blue-900 mb-2 text-sm">
                            Management Portal Access
                        </h4>
                        <ul className="space-y-1 text-xs text-blue-800">
                            <li>✓ Access your organiser dashboard</li>
                            <li>✓ Manage events and bookings</li>
                            <li>✓ Track revenue and analytics</li>
                            <li>✓ Handle customer inquiries</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Footer - Matching sign-up */}
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
