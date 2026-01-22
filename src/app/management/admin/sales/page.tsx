"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import StatsCard from "@/components/management/StatsCard";
import { APP_CONFIG } from "@/constants/config";
import RevenueChart from "@/components/admin/RevenueChart";
import { formatCurrencyCompact, formatCurrency } from "@/lib/currency-utils";

// Disable static generation for this page
export const dynamic = 'force-dynamic';

export default function AdminSalesPage() {
  const [period, setPeriod] = useState<"7days" | "30days" | "90days">("30days");
  
  const stats = useQuery(api.admin.getDashboardStats);
  const revenueData = useQuery(api.admin.getRevenueBreakdown, {});
  const topEvents = useQuery(api.admin.getTopEventsByRevenue, { limit: 10 });

  if (!stats || !revenueData || !topEvents) {
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
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
          Platform Sales
        </h1>
        <p className="text-gray-600">
          Track overall platform revenue and performance
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Revenue"
          value={formatCurrencyCompact(stats.revenue.total)}
          icon="currency"
          gradient="from-purple-500 to-pink-500"
        />
        <StatsCard
          title="Platform Fee"
          value={formatCurrencyCompact(stats.revenue.platformFee)}
          icon="percentage"
          gradient="from-green-500 to-emerald-500"
        />
        <StatsCard
          title="Total Bookings"
          value={stats.bookings.total.toString()}
          subtitle={`${stats.bookings.confirmed} confirmed`}
          icon="ticket"
          gradient="from-blue-500 to-indigo-500"
        />
        <StatsCard
          title="Net Revenue"
          value={formatCurrencyCompact(stats.revenue.net)}
          icon="currency"
          gradient="from-orange-500 to-red-500"
        />
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-1">
            Revenue Trend
          </h2>
          <p className="text-sm text-gray-600">
            Platform revenue over time
          </p>
        </div>
        <RevenueChart data={revenueData} />
      </div>

      {/* Revenue Breakdown */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Top Events */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Top Revenue Events</h2>
          <div className="space-y-4">
            {topEvents.map((item: any, index: number) => (
              <div key={item.event._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{item.event.title}</h3>
                    <p className="text-sm text-gray-600">{item.event.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{formatCurrencyCompact(item.revenue)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Summary */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Revenue Summary</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
              <span className="text-gray-700">Gross Revenue</span>
              <span className="font-bold text-gray-900">{formatCurrency(stats.revenue.total)}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
              <span className="text-gray-700">Platform Fee ({APP_CONFIG.platformCommission}%)</span>
              <span className="font-bold text-green-700">{formatCurrency(stats.revenue.platformFee)}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gradient-to-br from-red-50 to-pink-50 rounded-xl border border-red-200">
              <span className="text-gray-700">Refunded</span>
              <span className="font-bold text-red-700">-{formatCurrency(stats.revenue.refunded)}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-300">
              <span className="text-gray-900 font-semibold">Net Revenue</span>
              <span className="font-bold text-blue-700 text-lg">{formatCurrency(stats.revenue.net)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
