"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect } from "react";
import StatsCard from "@/components/management/StatsCard";
import SalesChart from "@/components/organiser/SalesChart";
import { formatCurrencyCompact } from "@/lib/currency-utils";

// Disable static generation for this page
export const dynamic = 'force-dynamic';

export default function OrganiserSalesPage() {
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

  const [period, setPeriod] = useState<"7days" | "30days" | "90days" | "1year">("30days");

  const salesData = useQuery(
    api.analytics.getOrganiserSalesData,
    userId ? { organiserId: userId as any, period } : "skip"
  );
  const stats = useQuery(api.organisers.getOrganiserStats);

  if (!salesData || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-purple-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-purple-600 rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600 font-medium">Loading sales data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Sales Overview
          </h1>
          <p className="text-gray-600">
            Track your revenue and sales performance
          </p>
        </div>

        {/* Period Selector */}
        <div className="bg-white rounded-xl shadow-sm p-1 flex space-x-1">
          {[
            { value: "7days", label: "7 Days" },
            { value: "30days", label: "30 Days" },
            { value: "90days", label: "90 Days" },
            { value: "1year", label: "1 Year" },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setPeriod(option.value as any)}
              className={`px-4 py-2 rounded-lg font-medium transition ${period === option.value
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
                }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Revenue"
          value={formatCurrencyCompact(stats.totalRevenue)}
          change={stats.revenueChange}
          changeType={stats.revenueChange >= 0 ? "increase" : "decrease"}
          icon="currency"
          gradient="from-purple-500 to-pink-500"
        />
        <StatsCard
          title="Total Bookings"
          value={stats.totalBookings.toString()}
          change={stats.bookingsChange}
          changeType={stats.bookingsChange >= 0 ? "increase" : "decrease"}
          icon="ticket"
          gradient="from-blue-500 to-indigo-500"
        />
        <StatsCard
          title="Avg. Order Value"
          value={formatCurrencyCompact(stats.avgOrderValue)}
          icon="chart"
          gradient="from-green-500 to-emerald-500"
        />
        <StatsCard
          title="Conversion Rate"
          value={`${stats.conversionRate}%`}
          icon="percentage"
          gradient="from-orange-500 to-red-500"
        />
      </div>

      {/* Sales Chart */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Revenue Trend</h2>
        <SalesChart data={salesData} />
      </div>

      {/* Top Events */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Top Performing Events</h2>
        <div className="space-y-4">
          {stats.topEvents.map((event: any, index: number) => (
            <div key={event.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                  {index + 1}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{event.name}</h3>
                  <p className="text-sm text-gray-600">{event.ticketsSold} tickets sold</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900">{formatCurrencyCompact(event.revenue)}</p>
                <p className="text-sm text-gray-600">{event.conversionRate}% conversion</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
