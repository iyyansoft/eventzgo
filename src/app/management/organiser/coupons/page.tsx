"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Ticket,
    Plus,
    TrendingUp,
    DollarSign,
    Percent,
    Tag,
    Calendar,
    ArrowRight
} from "lucide-react";

// Disable static generation for this page
export const dynamic = 'force-dynamic';

export default function AllCouponsPage() {
    const router = useRouter();
    const [organiserId, setOrganiserId] = useState<string | null>(null);

    useEffect(() => {
        const stored = localStorage.getItem("organiser_session");
        if (stored) {
            try {
                const sessionData = JSON.parse(stored);
                if (sessionData && sessionData.id) setOrganiserId(sessionData.id);
            } catch (e) { }
        }
    }, []);

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
                            <Ticket className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Coupon Management
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Create and manage discount codes for your events
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">Total Coupons</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">0</p>
                        </div>
                        <div className="p-3 bg-purple-100 rounded-lg">
                            <Tag className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">Active Coupons</p>
                            <p className="text-3xl font-bold text-green-600 mt-1">0</p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-lg">
                            <TrendingUp className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">Total Discount</p>
                            <p className="text-3xl font-bold text-orange-600 mt-1">â‚¹0</p>
                        </div>
                        <div className="p-3 bg-orange-100 rounded-lg">
                            <Percent className="w-6 h-6 text-orange-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">Total Revenue</p>
                            <p className="text-3xl font-bold text-blue-600 mt-1">â‚¹0</p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <DollarSign className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Info Card */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 mb-6 border border-purple-200">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-white rounded-xl shadow-md">
                        <Ticket className="w-8 h-8 text-purple-600" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            Manage Coupons by Event
                        </h3>
                        <p className="text-gray-700 mb-4">
                            Create and manage discount codes for specific events. Each event can have its own set of coupons with custom rules and usage limits.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm">
                                <Percent className="w-4 h-4 text-purple-600" />
                                <span className="text-sm font-medium text-gray-700">Percentage Discounts</span>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm">
                                <DollarSign className="w-4 h-4 text-green-600" />
                                <span className="text-sm font-medium text-gray-700">Fixed Amount</span>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm">
                                <Tag className="w-4 h-4 text-blue-600" />
                                <span className="text-sm font-medium text-gray-700">BOGO Offers</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Events List with Coupon Access */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Your Events</h2>
                    <button
                        onClick={() => router.push('/management/organiser/events/create')}
                        className="flex items-center gap-2 px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Create Event
                    </button>
                </div>

                <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Select an Event
                    </h3>
                    <p className="text-gray-600 mb-6">
                        Go to "My Events" and select an event to manage its coupons
                    </p>
                    <button
                        onClick={() => router.push('/management/organiser/events')}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all"
                    >
                        View My Events
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Quick Guide */}
            <div className="mt-6 bg-blue-50 rounded-xl p-6">
                <h3 className="font-semibold text-blue-900 mb-3">How to Create Coupons</h3>
                <ol className="space-y-2 text-sm text-blue-800">
                    <li className="flex items-start gap-2">
                        <span className="font-bold">1.</span>
                        <span>Go to "My Events" and select an event</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="font-bold">2.</span>
                        <span>Click the "Coupons" button on the event card</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="font-bold">3.</span>
                        <span>Click "Create Coupon" and fill in the details</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="font-bold">4.</span>
                        <span>Set discount type, usage limits, and validity period</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="font-bold">5.</span>
                        <span>Share the coupon code with your customers!</span>
                    </li>
                </ol>
            </div>
        </div>
    );
}
