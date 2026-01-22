
"use client";

import React, { useState } from 'react';
import { Building, Briefcase, Award, DollarSign, ArrowRight, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { SignUp } from '@clerk/nextjs';

// Disable static generation for this page
export const dynamic = 'force-dynamic';

export default function BlockedPage() {
    const router = useRouter();
    const [showSignUp, setShowSignUp] = useState(false);
    const [selectedRole, setSelectedRole] = useState<'organiser' | 'vendor' | 'speaker' | 'sponsor' | null>(null);

    const roles = [
        {
            id: 'organiser' as const,
            icon: Building,
            emoji: 'ðŸ¢',
            title: 'Event Organizer',
            description: 'Create and manage professional events',
            features: ['Event Creation', 'Attendee Management', 'Analytics Dashboard', 'Partner Network'],
            gradient: 'from-blue-500 to-blue-600',
            hoverGradient: 'hover:from-blue-600 hover:to-blue-700'
        },
        {
            id: 'vendor' as const,
            icon: Briefcase,
            emoji: 'ðŸ› ï¸',
            title: 'Service Vendor',
            description: 'Offer services to event organizers',
            features: ['Service Listings', 'Quote Management', 'Booking System', 'Portfolio Showcase'],
            gradient: 'from-green-500 to-green-600',
            hoverGradient: 'hover:from-green-600 hover:to-green-700'
        },
        {
            id: 'speaker' as const,
            icon: Award,
            emoji: 'ðŸŽ¤',
            title: 'Professional Speaker',
            description: 'Share your expertise at events',
            features: ['Speaker Profile', 'Topic Management', 'Booking Calendar', 'Engagement Analytics'],
            gradient: 'from-purple-500 to-purple-600',
            hoverGradient: 'hover:from-purple-600 hover:to-purple-700'
        },
        {
            id: 'sponsor' as const,
            icon: DollarSign,
            emoji: 'ðŸ’°',
            title: 'Event Sponsor',
            description: 'Partner with events for brand visibility',
            features: ['Sponsorship Packages', 'Brand Exposure', 'ROI Analytics', 'Direct Connections'],
            gradient: 'from-amber-500 to-amber-600',
            hoverGradient: 'hover:from-amber-600 hover:to-amber-700'
        }
    ];

    const handleRoleSelect = (roleId: 'organiser' | 'vendor' | 'speaker' | 'sponsor') => {
        setSelectedRole(roleId);
        setShowSignUp(true);
    };

    const handleBackToRoles = () => {
        setShowSignUp(false);
        setSelectedRole(null);
    };

    const handleBackToMain = () => {
        router.push('/');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
            {/* Main Container */}
            <div className="w-full max-w-6xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl shadow-2xl mb-6">
                        <span className="text-4xl">ðŸš«</span>
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Management Portal Access Required
                    </h1>
                    <p className="text-xl text-gray-600 mb-2">
                        The EventzGo Management Portal is exclusively for event professionals
                    </p>
                    <p className="text-gray-500">
                        Register as an organizer, vendor, speaker, or sponsor to access this area
                    </p>
                </div>

                {/* Sign-up Modal Overlay */}
                {showSignUp && selectedRole && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto transform transition-all duration-300">
                            {/* Close Button */}
                            <div className="relative p-6 pb-0">
                                <button
                                    onClick={handleBackToRoles}
                                    className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>

                                {/* Role Badge */}
                                <div className="text-center mb-6">
                                    <div className={`bg-gradient-to-r ${roles.find(r => r.id === selectedRole)?.gradient} w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                                        <span className="text-4xl">{roles.find(r => r.id === selectedRole)?.emoji}</span>
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                        Join as {roles.find(r => r.id === selectedRole)?.title}
                                    </h2>
                                    <p className="text-gray-600">
                                        {roles.find(r => r.id === selectedRole)?.description}
                                    </p>
                                </div>
                            </div>

                            {/* Clerk Sign-up Component */}
                            <div className="px-6 pb-6">
                                <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-inner p-6">
                                    <SignUp
                                        appearance={{
                                            elements: {
                                                rootBox: "w-full",
                                                card: "shadow-none bg-transparent",
                                                headerTitle: "hidden",
                                                headerSubtitle: "hidden",
                                                socialButtonsBlockButton: "bg-white border-2 border-gray-200 hover:border-gray-300 rounded-xl py-3",
                                                formButtonPrimary: `bg-gradient-to-r ${roles.find(r => r.id === selectedRole)?.gradient} hover:opacity-90 rounded-xl py-3.5 font-bold shadow-xl`,
                                                formFieldInput: "border-2 border-gray-200 focus:border-gray-400 rounded-xl py-3",
                                                footerActionLink: "text-blue-600 hover:text-blue-700 font-semibold"
                                            }
                                        }}
                                        unsafeMetadata={{
                                            role: selectedRole,
                                            status: 'pending',
                                            onboardingCompleted: false
                                        }}
                                        redirectUrl="/management/onboarding"
                                        signInUrl="/management/sign-in"
                                    />
                                </div>

                                {/* What's Next Info */}
                                <div className="mt-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                                    <div className="flex items-start space-x-3">
                                        <div className={`w-10 h-10 bg-gradient-to-br ${roles.find(r => r.id === selectedRole)?.gradient} rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg`}>
                                            <span className="text-xl">âœ¨</span>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-gray-900 mb-2">What's Next?</h4>
                                            <ul className="space-y-1.5 text-sm text-gray-700">
                                                <li className="flex items-start">
                                                    <span className="text-blue-600 mr-2 mt-0.5">âœ“</span>
                                                    <span>Complete your professional profile</span>
                                                </li>
                                                <li className="flex items-start">
                                                    <span className="text-blue-600 mr-2 mt-0.5">âœ“</span>
                                                    <span>Admin verification (quick process)</span>
                                                </li>
                                                <li className="flex items-start">
                                                    <span className="text-blue-600 mr-2 mt-0.5">âœ“</span>
                                                    <span>Access your personalized dashboard</span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                {/* Back Button */}
                                <button
                                    onClick={handleBackToRoles}
                                    className="mt-4 w-full text-gray-600 hover:text-gray-900 font-medium py-2 rounded-xl hover:bg-gray-100 transition-all duration-200 flex items-center justify-center space-x-2"
                                >
                                    <span>â†</span>
                                    <span>Back to role selection</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Role Cards - Only show when sign-up is not active */}
                {!showSignUp && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            {roles.map((role) => {
                                const Icon = role.icon;
                                return (
                                    <div
                                        key={role.id}
                                        className="bg-white rounded-3xl shadow-xl border-2 border-gray-100 p-8 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer group"
                                        onClick={() => handleRoleSelect(role.id)}
                                    >
                                        {/* Icon & Title */}
                                        <div className="flex items-start space-x-4 mb-6">
                                            <div className={`w-16 h-16 bg-gradient-to-br ${role.gradient} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                                <span className="text-3xl">{role.emoji}</span>
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-2xl font-bold text-gray-900 mb-2">{role.title}</h3>
                                                <p className="text-gray-600">{role.description}</p>
                                            </div>
                                        </div>

                                        {/* Features */}
                                        <div className="space-y-3 mb-6">
                                            {role.features.map((feature, idx) => (
                                                <div key={idx} className="flex items-center space-x-3">
                                                    <div className={`w-2 h-2 bg-gradient-to-r ${role.gradient} rounded-full`}></div>
                                                    <span className="text-gray-700 text-sm">{feature}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Register Button */}
                                        <button
                                            className={`w-full bg-gradient-to-r ${role.gradient} ${role.hoverGradient} text-white py-4 rounded-xl font-bold shadow-lg group-hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2`}
                                        >
                                            <span>Register as {role.title}</span>
                                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Bottom Info Banner */}
                        <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="text-center md:text-left">
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                                        Looking for regular event tickets?
                                    </h3>
                                    <p className="text-gray-600">
                                        Browse and book tickets on our main platform
                                    </p>
                                </div>
                                <button
                                    onClick={handleBackToMain}
                                    className="bg-gradient-to-r from-gray-700 to-gray-900 text-white px-8 py-3 rounded-xl font-semibold hover:from-gray-800 hover:to-black transition-all duration-200 shadow-lg flex items-center space-x-2"
                                >
                                    <span>Visit Main Site</span>
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
