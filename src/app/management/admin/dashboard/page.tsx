"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  Loader2,
  ArrowRight,
  UserCheck,
  ShoppingBag
} from "lucide-react";

export default function AdminDashboardPage() {
  const { user } = useUser();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  // Mock stats for demo
  const stats = {
    totalEvents: 124,
    totalUsers: 2847,
    totalRevenue: 4235000, // ₹42.35L
    activeBookings: 456,
    pendingEvents: 12,
    totalOrganisers: 34,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Welcome back, {user?.firstName}! Here's your platform overview.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Events */}
          <div className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-sm font-semibold text-green-600">
                +12%
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-1">Total Events</p>
            <p className="text-3xl font-bold text-gray-900">
              {stats.totalEvents}
            </p>
          </div>

          {/* Total Users */}
          <div className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-sm font-semibold text-green-600">
                +8%
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-1">Total Users</p>
            <p className="text-3xl font-bold text-gray-900">
              {stats.totalUsers.toLocaleString("en-IN")}
            </p>
          </div>

          {/* Total Revenue */}
          <div className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-sm font-semibold text-green-600">
                +15%
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
            <p className="text-3xl font-bold text-gray-900">
              ₹{(stats.totalRevenue / 100000).toFixed(1)}L
            </p>
          </div>

          {/* Active Bookings */}
          <div className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-pink-100 rounded-xl">
                <TrendingUp className="w-6 h-6 text-pink-600" />
              </div>
              <span className="text-sm font-semibold text-green-600">
                +5%
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-1">Active Bookings</p>
            <p className="text-3xl font-bold text-gray-900">
              {stats.activeBookings}
            </p>
          </div>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-yellow-100 rounded-xl">
                <ShoppingBag className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending Approvals</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.pendingEvents}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-indigo-100 rounded-xl">
                <UserCheck className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Organisers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalOrganisers}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Chart Placeholder */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Revenue Analytics
          </h2>
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-12 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Charts Coming Soon
            </h3>
            <p className="text-gray-600">
              Revenue charts and analytics will be available in the next update
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Quick Actions
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => router.push("/management/admin/events")}
            className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-all text-left group"
          >
            <Calendar className="w-8 h-8 text-purple-600 mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Manage Events
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Review and approve pending events
            </p>
            <div className="flex items-center text-purple-600 font-semibold group-hover:translate-x-2 transition-transform">
              <span>Go to Events</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </div>
          </button>

          <button
            onClick={() => router.push("/management/admin/users")}
            className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-all text-left group"
          >
            <Users className="w-8 h-8 text-blue-600 mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              User Management
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Manage users and permissions
            </p>
            <div className="flex items-center text-blue-600 font-semibold group-hover:translate-x-2 transition-transform">
              <span>Go to Users</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </div>
          </button>

          <button
            onClick={() => router.push("/management/admin/analytics")}
            className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-all text-left group"
          >
            <TrendingUp className="w-8 h-8 text-green-600 mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Analytics
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              View detailed platform analytics
            </p>
            <div className="flex items-center text-green-600 font-semibold group-hover:translate-x-2 transition-transform">
              <span>Go to Analytics</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}