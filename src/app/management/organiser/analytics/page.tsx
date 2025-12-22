"use client";

import { TrendingUp, Users, DollarSign, Calendar, ArrowUp, ArrowDown } from "lucide-react";

export default function OrganiserAnalyticsPage() {
    // Mock data - replace with real data from Convex
    const stats = [
        {
            label: "Total Revenue",
            value: "₹2,45,000",
            change: "+12.5%",
            trend: "up",
            icon: DollarSign,
        },
        {
            label: "Total Bookings",
            value: "1,234",
            change: "+8.2%",
            trend: "up",
            icon: Users,
        },
        {
            label: "Active Events",
            value: "12",
            change: "-2",
            trend: "down",
            icon: Calendar,
        },
        {
            label: "Conversion Rate",
            value: "3.2%",
            change: "+0.5%",
            trend: "up",
            icon: TrendingUp,
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
                <p className="text-gray-600 mt-2">
                    Track your performance and insights
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    const isPositive = stat.trend === "up";

                    return (
                        <div
                            key={stat.label}
                            className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div
                                    className={`w-12 h-12 rounded-xl ${isPositive ? "bg-green-100" : "bg-red-100"
                                        } flex items-center justify-center`}
                                >
                                    <Icon
                                        className={`w-6 h-6 ${isPositive ? "text-green-600" : "text-red-600"
                                            }`}
                                    />
                                </div>
                                <div
                                    className={`flex items-center gap-1 text-sm font-medium ${isPositive ? "text-green-600" : "text-red-600"
                                        }`}
                                >
                                    {isPositive ? (
                                        <ArrowUp className="w-4 h-4" />
                                    ) : (
                                        <ArrowDown className="w-4 h-4" />
                                    )}
                                    {stat.change}
                                </div>
                            </div>
                            <p className="text-sm text-gray-600">{stat.label}</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">
                                {stat.value}
                            </p>
                        </div>
                    );
                })}
            </div>

            {/* Charts Placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Chart */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Revenue Overview
                    </h3>
                    <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                        <p className="text-gray-500">Chart will be displayed here</p>
                    </div>
                </div>

                {/* Bookings Chart */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Bookings Trend
                    </h3>
                    <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                        <p className="text-gray-500">Chart will be displayed here</p>
                    </div>
                </div>
            </div>

            {/* Top Events */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Top Performing Events
                    </h2>
                </div>

                <div className="p-6">
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div
                                key={i}
                                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold">
                                        {i}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">
                                            Event Name {i}
                                        </h4>
                                        <p className="text-sm text-gray-600">
                                            {Math.floor(Math.random() * 500)} bookings
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-gray-900">
                                        ₹{(Math.random() * 100000).toFixed(0)}
                                    </p>
                                    <p className="text-sm text-green-600">+12.5%</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
