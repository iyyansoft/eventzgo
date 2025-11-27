"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useManagementAuth } from "@/contexts/ManagementAuthContext";
import { DollarSign, TrendingUp, Users, Target } from "lucide-react";

export default function SponsorDashboard() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading } = useManagementAuth();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/management");
        }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
            </div>
        );
    }

    if (!user || user.role !== "sponsor") {
        return null;
    }

    return (
        <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Sponsor Dashboard
                    </h1>
                    <p className="text-gray-600">
                        Track your sponsorships and brand visibility
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <div className="bg-yellow-100 p-3 rounded-lg">
                                <DollarSign className="w-6 h-6 text-yellow-600" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">₹10L</h3>
                        <p className="text-gray-600 text-sm">Total Investment</p>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <div className="bg-blue-100 p-3 rounded-lg">
                                <Target className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">8</h3>
                        <p className="text-gray-600 text-sm">Active Sponsorships</p>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <div className="bg-green-100 p-3 rounded-lg">
                                <TrendingUp className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">50K+</h3>
                        <p className="text-gray-600 text-sm">Brand Impressions</p>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <div className="bg-purple-100 p-3 rounded-lg">
                                <Users className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">25K</h3>
                        <p className="text-gray-600 text-sm">Audience Reached</p>
                    </div>
                </div>

                {/* Coming Soon */}
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-12 text-center">
                    <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <DollarSign className="w-10 h-10 text-yellow-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        Sponsor Dashboard Coming Soon
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        We're developing a comprehensive dashboard for sponsors to track ROI,
                        manage partnerships, and maximize brand visibility. Stay tuned!
                    </p>
                </div>
            </div>
        </div>
    );
}
