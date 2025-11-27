"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Building, Briefcase, Mic, DollarSign, ArrowRight, CheckCircle } from "lucide-react";

export default function ManagementPage() {
    const router = useRouter();

    const roles = [
        {
            id: "organizer",
            title: "Event Organizer",
            description: "Create and manage events, connect with vendors, speakers, and sponsors",
            icon: Building,
            color: "from-blue-500 to-blue-600",
            bgColor: "bg-blue-50",
            features: ["Create Events", "Manage Attendees", "Connect with Partners", "Analytics Dashboard"],
        },
        {
            id: "vendor",
            title: "Service Vendor",
            description: "Offer your services like catering, photography, decoration, and more",
            icon: Briefcase,
            color: "from-green-500 to-green-600",
            bgColor: "bg-green-50",
            features: ["Service Listings", "Booking Management", "Client Communication", "Portfolio Showcase"],
        },
        {
            id: "speaker",
            title: "Professional Speaker",
            description: "Share your expertise at events and conferences worldwide",
            icon: Mic,
            color: "from-purple-500 to-purple-600",
            bgColor: "bg-purple-50",
            features: ["Speaking Opportunities", "Profile Management", "Event Invitations", "Earnings Tracking"],
        },
        {
            id: "sponsor",
            title: "Brand Sponsor",
            description: "Promote your brand through strategic event sponsorships",
            icon: DollarSign,
            color: "from-yellow-500 to-yellow-600",
            bgColor: "bg-yellow-50",
            features: ["Sponsorship Opportunities", "Brand Exposure", "ROI Analytics", "Partnership Management"],
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-6xl font-bold mb-6">
                            Welcome to TICKETSHUB Management
                        </h1>
                        <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
                            Empower your event business with our comprehensive management platform.
                            Join thousands of organizers, vendors, speakers, and sponsors.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={() => router.push("/management/dashboard")}
                                className="bg-white text-purple-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 shadow-lg"
                            >
                                Get Started
                            </button>
                            <button
                                onClick={() => router.push("/")}
                                className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-all duration-200"
                            >
                                Back to Home
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Choose Your Role
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Select the role that best describes your involvement in the event industry
                    </p>
                </div>

                {/* Role Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                    {roles.map((role) => {
                        const Icon = role.icon;
                        return (
                            <div
                                key={role.id}
                                className={`${role.bgColor} rounded-2xl p-8 cursor-pointer hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-transparent hover:border-gray-200 group`}
                                onClick={() => router.push("/management/dashboard")}
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <div className={`bg-gradient-to-r ${role.color} w-16 h-16 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                                        <Icon className="w-8 h-8 text-white" />
                                    </div>
                                    <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-300" />
                                </div>

                                <h3 className="text-2xl font-bold text-gray-900 mb-3">{role.title}</h3>
                                <p className="text-gray-600 mb-6 leading-relaxed">{role.description}</p>

                                <div className="space-y-3">
                                    <h4 className="font-semibold text-gray-800 text-sm">Key Features:</h4>
                                    <ul className="space-y-2">
                                        {role.features.map((feature, index) => (
                                            <li key={index} className="flex items-center space-x-3 text-sm text-gray-600">
                                                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="mt-6 pt-4 border-t border-gray-200">
                                    <div className={`bg-gradient-to-r ${role.color} text-white px-4 py-3 rounded-lg text-center font-semibold group-hover:shadow-lg transition-all duration-300`}>
                                        Get Started as {role.title}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Benefits Section */}
                <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                        Why Choose TICKETSHUB Management?
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-8 h-8 text-purple-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Easy to Use</h3>
                            <p className="text-gray-600">
                                Intuitive interface designed for professionals of all technical levels
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="bg-pink-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-8 h-8 text-pink-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Comprehensive Tools</h3>
                            <p className="text-gray-600">
                                Everything you need to manage events, services, and partnerships
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-8 h-8 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">24/7 Support</h3>
                            <p className="text-gray-600">
                                Dedicated support team ready to help you succeed
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
