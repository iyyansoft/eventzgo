"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { TrendingUp, Users, DollarSign, Calendar, ArrowUp, ArrowDown, Ticket, Eye } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { RUPEE_SYMBOL } from "@/lib/currency";

// Disable static generation for this page
export const dynamic = 'force-dynamic';

export default function OrganiserAnalyticsPage() {
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        const stored = localStorage.getItem("organiser_session");
        if (stored) {
            try {
                const user = JSON.parse(stored);
                if (user && user.id) setUserId(user.id);
            } catch (e) { }
        }
    }, []);

    const events = (useQuery as any)(
        api.events.getOrganiserEvents,
        userId ? { organiserId: userId } : "skip"
    );
    const bookings = (useQuery as any)(
        api.bookings.getOrganiserBookings,
        userId ? { organiserId: userId } : "skip"
    );

    const analytics = useMemo(() => {
        if (!events || !bookings) return null;

        const totalRevenue = bookings
            .filter((b: any) => b.status === "confirmed")
            .reduce((sum: any, b: any) => sum + b.totalAmount, 0);

        const totalBookings = bookings.length;
        const confirmedBookings = bookings.filter(b => b.status === "confirmed").length;

        const activeEvents = events.filter(e =>
            e.dateTime.end > Date.now() && e.status === "published"
        ).length;

        const totalTicketsSold = events.reduce((sum, e) => sum + e.soldTickets, 0);
        const totalCapacity = events.reduce((sum, e) => sum + e.totalCapacity, 0);
        const occupancyRate = totalCapacity > 0 ? (totalTicketsSold / totalCapacity) * 100 : 0;

        // Calculate event performance
        const eventPerformance = events.map(event => {
            const eventBookings = bookings.filter(b => b.eventId === event._id);
            const eventRevenue = eventBookings
                .filter(b => b.status === "confirmed")
                .reduce((sum, b) => sum + b.totalAmount, 0);

            return {
                id: event._id,
                title: event.title,
                bookings: eventBookings.length,
                revenue: eventRevenue,
                soldTickets: event.soldTickets,
                capacity: event.totalCapacity,
                occupancy: event.totalCapacity > 0 ? (event.soldTickets / event.totalCapacity) * 100 : 0,
            };
        }).sort((a, b) => b.revenue - a.revenue);

        return {
            totalRevenue,
            totalBookings,
            confirmedBookings,
            activeEvents,
            occupancyRate,
            eventPerformance: eventPerformance.slice(0, 5),
        };
    }, [events, bookings]);

    if (!events || !bookings || !analytics) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="text-gray-500 mt-4">Loading analytics...</p>
                </div>
            </div>
        );
    }

    const stats = [
        {
            label: "Total Revenue",
            value: `${RUPEE_SYMBOL}${analytics.totalRevenue.toLocaleString()}`,
            subtext: `${analytics.confirmedBookings} confirmed bookings`,
            icon: DollarSign,
            color: "green",
        },
        {
            label: "Total Bookings",
            value: analytics.totalBookings.toString(),
            subtext: `${analytics.confirmedBookings} confirmed`,
            icon: Users,
            color: "blue",
        },
        {
            label: "Active Events",
            value: analytics.activeEvents.toString(),
            subtext: `${events.length} total events`,
            icon: Calendar,
            color: "purple",
        },
        {
            label: "Occupancy Rate",
            value: `${analytics.occupancyRate.toFixed(1)}%`,
            subtext: "Average across all events",
            icon: TrendingUp,
            color: "orange",
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Analytics
                </h1>
                <p className="text-gray-600 mt-2">
                    Track your performance and insights
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => {
                    const Icon = stat.icon;

                    return (
                        <div
                            key={stat.label}
                            className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div
                                    className={`w-12 h-12 rounded-xl bg-${stat.color}-100 flex items-center justify-center`}
                                >
                                    <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                                </div>
                            </div>
                            <p className="text-sm text-gray-600">{stat.label}</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">
                                {stat.value}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">{stat.subtext}</p>
                        </div>
                    );
                })}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                    <div className="flex items-center gap-3 mb-2">
                        <Ticket className="w-5 h-5 text-purple-600" />
                        <h3 className="font-semibold text-gray-900">Total Tickets Sold</h3>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                        {events.reduce((sum, e) => sum + e.soldTickets, 0).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                        of {events.reduce((sum, e) => sum + e.totalCapacity, 0).toLocaleString()} total capacity
                    </p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                    <div className="flex items-center gap-3 mb-2">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        <h3 className="font-semibold text-gray-900">Published Events</h3>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                        {events.filter(e => e.status === "published").length}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                        {events.filter(e => e.status === "draft").length} in draft
                    </p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                    <div className="flex items-center gap-3 mb-2">
                        <DollarSign className="w-5 h-5 text-green-600" />
                        <h3 className="font-semibold text-gray-900">Avg. Revenue per Event</h3>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                        {RUPEE_SYMBOL}{events.length > 0 ? Math.round(analytics.totalRevenue / events.length).toLocaleString() : 0}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                        Based on {events.length} events
                    </p>
                </div>
            </div>

            {/* Top Performing Events */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-purple-600" />
                        Top Performing Events
                    </h2>
                </div>

                <div className="p-6">
                    {analytics.eventPerformance.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            No events data available yet
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {analytics.eventPerformance.map((event, index) => (
                                <div
                                    key={event.id}
                                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900">
                                                {event.title}
                                            </h4>
                                            <p className="text-sm text-gray-600">
                                                {event.bookings} bookings • {event.soldTickets}/{event.capacity} tickets
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-gray-900">
                                            {RUPEE_SYMBOL}{event.revenue.toLocaleString()}
                                        </p>
                                        <p className="text-sm text-purple-600">
                                            {event.occupancy.toFixed(1)}% filled
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Event Status Breakdown */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Event Status Breakdown</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: "Published", count: events.filter(e => e.status === "published").length, color: "green" },
                        { label: "Draft", count: events.filter(e => e.status === "draft").length, color: "gray" },
                        { label: "Cancelled", count: events.filter(e => e.status === "cancelled").length, color: "red" },
                        { label: "Completed", count: events.filter(e => e.dateTime.end < Date.now()).length, color: "blue" },
                    ].map((status) => (
                        <div key={status.label} className="text-center p-4 bg-gray-50 rounded-lg">
                            <p className={`text-3xl font-bold text-${status.color}-600`}>{status.count}</p>
                            <p className="text-sm text-gray-600 mt-1">{status.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
