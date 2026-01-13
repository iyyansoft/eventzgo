"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
    QrCode,
    Users,
    Ticket,
    BarChart3,
    Calendar,
    Plus,
    ArrowRight,
    Shield,
    TrendingUp
} from "lucide-react";

export default function VerificationDashboardPage() {
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

    // Fetch organiser's events
    const events = useQuery(
        api.events.getOrganiserEvents,
        organiserId ? { organiserId: organiserId as any } : "skip"
    );

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                        <QrCode className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Ticket Verification System
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Manage staff, coupons, and analytics for your events
                        </p>
                    </div>
                </div>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Staff Management */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-blue-100 rounded-xl">
                            <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">
                            Staff Management
                        </h3>
                    </div>
                    <p className="text-gray-600 mb-4">
                        Create and manage verification staff for your events. Assign roles and track performance.
                    </p>
                    <ul className="space-y-2 mb-6">
                        <li className="flex items-center text-sm text-gray-700">
                            <Shield className="w-4 h-4 text-green-600 mr-2" />
                            Role-based permissions
                        </li>
                        <li className="flex items-center text-sm text-gray-700">
                            <Shield className="w-4 h-4 text-green-600 mr-2" />
                            Auto-generated credentials
                        </li>
                        <li className="flex items-center text-sm text-gray-700">
                            <Shield className="w-4 h-4 text-green-600 mr-2" />
                            Activity tracking
                        </li>
                    </ul>
                    <button
                        onClick={() => router.push('/management/organiser/verification/staff')}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                    >
                        Manage Staff
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>

                {/* Coupon Management */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-purple-100 rounded-xl">
                            <Ticket className="w-6 h-6 text-purple-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">
                            Coupon Management
                        </h3>
                    </div>
                    <p className="text-gray-600 mb-4">
                        Create discount codes for your events. Track usage and revenue impact.
                    </p>
                    <ul className="space-y-2 mb-6">
                        <li className="flex items-center text-sm text-gray-700">
                            <Shield className="w-4 h-4 text-green-600 mr-2" />
                            3 discount types
                        </li>
                        <li className="flex items-center text-sm text-gray-700">
                            <Shield className="w-4 h-4 text-green-600 mr-2" />
                            Usage limits & tracking
                        </li>
                        <li className="flex items-center text-sm text-gray-700">
                            <Shield className="w-4 h-4 text-green-600 mr-2" />
                            Event-specific codes
                        </li>
                    </ul>
                    <button
                        onClick={() => router.push('/management/organiser/verification/coupons')}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
                    >
                        Manage Coupons
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>

                {/* Analytics */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-green-100 rounded-xl">
                            <BarChart3 className="w-6 h-6 text-green-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">
                            Analytics & Reports
                        </h3>
                    </div>
                    <p className="text-gray-600 mb-4">
                        View real-time entry statistics, scanner performance, and fraud alerts.
                    </p>
                    <ul className="space-y-2 mb-6">
                        <li className="flex items-center text-sm text-gray-700">
                            <Shield className="w-4 h-4 text-green-600 mr-2" />
                            Real-time dashboard
                        </li>
                        <li className="flex items-center text-sm text-gray-700">
                            <Shield className="w-4 h-4 text-green-600 mr-2" />
                            Scanner leaderboard
                        </li>
                        <li className="flex items-center text-sm text-gray-700">
                            <Shield className="w-4 h-4 text-green-600 mr-2" />
                            Fraud detection
                        </li>
                    </ul>
                    <button
                        onClick={() => router.push('/management/organiser/verification/analytics')}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                    >
                        View Analytics
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Events List */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Your Events</h2>
                    <span className="text-sm text-gray-600">
                        Select an event to manage verification
                    </span>
                </div>

                {!events || events.length === 0 ? (
                    <div className="text-center py-12">
                        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No events yet
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Create your first event to start using ticket verification
                        </p>
                        <button
                            onClick={() => router.push('/management/organiser/events/create')}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all"
                        >
                            <Plus className="w-5 h-5" />
                            Create Event
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {events.map((event) => (
                            <div
                                key={event._id}
                                className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer"
                                onClick={() => router.push(`/management/organiser/events/${event._id}/staff`)}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <h3 className="font-semibold text-gray-900 line-clamp-2">
                                        {event.title}
                                    </h3>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${event.status === 'published' ? 'bg-green-100 text-green-700' :
                                        event.status === 'draft' ? 'bg-gray-100 text-gray-700' :
                                            'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {event.status}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 mb-3">
                                    {new Date(event.dateTime.start).toLocaleDateString()}
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            router.push(`/management/organiser/events/${event._id}/staff`);
                                        }}
                                        className="flex-1 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                    >
                                        Staff
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            router.push(`/management/organiser/events/${event._id}/coupons`);
                                        }}
                                        className="flex-1 px-3 py-2 text-sm bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors"
                                    >
                                        Coupons
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            router.push(`/management/organiser/events/${event._id}/analytics`);
                                        }}
                                        className="flex-1 px-3 py-2 text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                                    >
                                        Analytics
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between mb-2">
                        <Users className="w-8 h-8 opacity-80" />
                        <TrendingUp className="w-5 h-5 opacity-60" />
                    </div>
                    <p className="text-3xl font-bold mb-1">0</p>
                    <p className="text-blue-100 text-sm">Total Staff</p>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between mb-2">
                        <Ticket className="w-8 h-8 opacity-80" />
                        <TrendingUp className="w-5 h-5 opacity-60" />
                    </div>
                    <p className="text-3xl font-bold mb-1">0</p>
                    <p className="text-purple-100 text-sm">Active Coupons</p>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between mb-2">
                        <QrCode className="w-8 h-8 opacity-80" />
                        <TrendingUp className="w-5 h-5 opacity-60" />
                    </div>
                    <p className="text-3xl font-bold mb-1">0</p>
                    <p className="text-green-100 text-sm">Total Scans</p>
                </div>

                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between mb-2">
                        <BarChart3 className="w-8 h-8 opacity-80" />
                        <TrendingUp className="w-5 h-5 opacity-60" />
                    </div>
                    <p className="text-3xl font-bold mb-1">0</p>
                    <p className="text-orange-100 text-sm">Events Active</p>
                </div>
            </div>
        </div>
    );
}
