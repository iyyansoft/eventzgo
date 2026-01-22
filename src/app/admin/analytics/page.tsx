'use client';

import React, { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import StatCard from '@/components/admin/StatCard';
import { Users, Calendar, DollarSign, TrendingUp, BarChart3, PieChart } from 'lucide-react';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart as RePieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

// Disable static generation for this page
export const dynamic = 'force-dynamic';

export default function AnalyticsPage() {
    const [dateRange, setDateRange] = useState<{ start?: number; end?: number }>({});

    // Fetch analytics data
    const analytics = useQuery(api.adminQueries.getAnalytics, {
        startDate: dateRange.start,
        endDate: dateRange.end,
    });

    const COLORS = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'];

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
                <p className="text-gray-600 mt-2">
                    Comprehensive platform analytics and insights
                </p>
            </div>

            {/* Overview Statistics */}
            {analytics && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatCard
                            title="Total Users"
                            value={analytics.overview.totalUsers.toLocaleString()}
                            icon={Users}
                            color="blue"
                            subtitle="Registered users"
                        />
                        <StatCard
                            title="Total Events"
                            value={analytics.overview.totalEvents.toLocaleString()}
                            icon={Calendar}
                            color="purple"
                            subtitle={`${analytics.overview.activeEvents} active`}
                        />
                        <StatCard
                            title="Total Bookings"
                            value={analytics.overview.totalBookings.toLocaleString()}
                            icon={TrendingUp}
                            color="green"
                            subtitle="All time"
                        />
                        <StatCard
                            title="Total Revenue"
                            value={`₹${analytics.overview.totalRevenue.toLocaleString()}`}
                            icon={DollarSign}
                            color="orange"
                            subtitle="Platform revenue"
                        />
                    </div>

                    {/* Charts Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        {/* User Growth Chart */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">User Growth</h3>
                                    <p className="text-sm text-gray-500">Last 30 days</p>
                                </div>
                                <BarChart3 className="w-5 h-5 text-gray-400" />
                            </div>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={analytics.userGrowth}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis
                                        dataKey="date"
                                        tick={{ fontSize: 12 }}
                                        stroke="#9CA3AF"
                                    />
                                    <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#fff',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '8px',
                                        }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="count"
                                        stroke="#EF4444"
                                        strokeWidth={2}
                                        dot={{ fill: '#EF4444' }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Events by Category */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Events by Category</h3>
                                    <p className="text-sm text-gray-500">Distribution</p>
                                </div>
                                <PieChart className="w-5 h-5 text-gray-400" />
                            </div>
                            <ResponsiveContainer width="100%" height={300}>
                                <RePieChart>
                                    <Pie
                                        data={analytics.eventsByCategory}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ category, percent }) =>
                                            `${category}: ${(percent * 100).toFixed(0)}%`
                                        }
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="count"
                                    >
                                        {analytics.eventsByCategory.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </RePieChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Booking Trends */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Booking Trends</h3>
                                    <p className="text-sm text-gray-500">Last 30 days</p>
                                </div>
                                <TrendingUp className="w-5 h-5 text-gray-400" />
                            </div>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={analytics.bookingTrends}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis
                                        dataKey="date"
                                        tick={{ fontSize: 12 }}
                                        stroke="#9CA3AF"
                                    />
                                    <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#fff',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '8px',
                                        }}
                                    />
                                    <Bar dataKey="count" fill="#10B981" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Users by Role */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Users by Role</h3>
                                    <p className="text-sm text-gray-500">Distribution</p>
                                </div>
                                <Users className="w-5 h-5 text-gray-400" />
                            </div>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart
                                    data={Object.entries(analytics.usersByRole).map(([role, count]) => ({
                                        role: role.charAt(0).toUpperCase() + role.slice(1),
                                        count,
                                    }))}
                                    layout="vertical"
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis type="number" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                                    <YAxis
                                        dataKey="role"
                                        type="category"
                                        tick={{ fontSize: 12 }}
                                        stroke="#9CA3AF"
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#fff',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '8px',
                                        }}
                                    />
                                    <Bar dataKey="count" fill="#8B5CF6" radius={[0, 8, 8, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Top Events by Revenue */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">Top Events by Revenue</h3>
                            <p className="text-sm text-gray-500">Best performing events</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                                            Event
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                                            Bookings
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                                            Revenue
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {analytics.revenueByEvent.map((event, index) => (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">{event.eventTitle}</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {event.bookings} bookings
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-semibold text-green-600">
                                                    â‚¹{event.revenue.toLocaleString()}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {analytics.revenueByEvent.length === 0 && (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                                                No revenue data available
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {!analytics && (
                <div className="flex justify-center items-center h-96">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
                        <p className="text-gray-500 mt-4">Loading analytics...</p>
                    </div>
                </div>
            )}
        </div>
    );
}
