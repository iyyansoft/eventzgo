"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import StatsCard from "@/components/management/StatsCard";
import RevenueChart from "@/components/admin/RevenueChart";
import PlatformStats from "@/components/admin/PlatformStats";
import { APP_CONFIG } from "@/constants/config";
import { formatCurrency, formatCurrencyCompact } from "@/lib/currency-utils";

// Disable static generation for this page
export const dynamic = 'force-dynamic';

export default function AdminRevenuePage() {
  const [dateRange, setDateRange] = useState<"7days" | "30days" | "90days" | "1year">("30days");
  
  const stats = useQuery(api.admin.getDashboardStats);
  const revenueData = useQuery(api.admin.getRevenueBreakdown, {});
  const categoryDistribution = useQuery(api.admin.getCategoryDistribution);

  if (!stats || !revenueData || !categoryDistribution) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-purple-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-purple-600 rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600 font-medium">Loading revenue data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
          Platform Revenue
        </h1>
        <p className="text-gray-600">
          Comprehensive revenue analytics and insights
        </p>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Gross Revenue"
          value={formatCurrencyCompact(stats.revenue.total)}
          icon="currency"
          gradient="from-purple-500 to-pink-500"
        />
        <StatsCard
          title="Platform Fee"
          value={formatCurrencyCompact(stats.revenue.platformFee)}
          subtitle={`${APP_CONFIG.platformCommission}% Commission`}
          icon="percentage"
          gradient="from-green-500 to-emerald-500"
        />
        <StatsCard
          title="Refunded"
          value={formatCurrencyCompact(stats.revenue.refunded)}
          icon="refund"
          gradient="from-red-500 to-pink-500"
        />
        <StatsCard
          title="Net Revenue"
          value={formatCurrencyCompact(stats.revenue.net)}
          icon="currency"
          gradient="from-blue-500 to-indigo-500"
        />
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-1">
              Revenue Trend
            </h2>
            <p className="text-sm text-gray-600">
              Platform revenue over time
            </p>
          </div>

          {/* Date Range Selector */}
          <div className="bg-gray-100 rounded-xl p-1 flex space-x-1">
            {[
              { value: "7days", label: "7D" },
              { value: "30days", label: "30D" },
              { value: "90days", label: "90D" },
              { value: "1year", label: "1Y" },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setDateRange(option.value as any)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  dateRange === option.value
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                    : "text-gray-600 hover:bg-gray-200"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        <RevenueChart data={revenueData} />
      </div>

      {/* Revenue Breakdown */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Revenue Details */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Revenue Breakdown</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
              <div>
                <p className="text-sm text-gray-600">Gross Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.revenue.total)}</p>
              </div>
              <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <div className="flex items-center justify-between p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
              <div>
                <p className="text-sm text-gray-600">Platform Fee ({APP_CONFIG.platformCommission}%)</p>
                <p className="text-2xl font-bold text-green-700">+{formatCurrency(stats.revenue.platformFee)}</p>
              </div>
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>

            <div className="flex items-center justify-between p-4 bg-gradient-to-br from-red-50 to-pink-50 rounded-xl border border-red-200">
              <div>
                <p className="text-sm text-gray-600">Refunds</p>
                <p className="text-2xl font-bold text-red-700">-{formatCurrency(stats.revenue.refunded)}</p>
              </div>
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
            </div>

            <div className="flex items-center justify-between p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-300">
              <div>
                <p className="text-sm text-gray-600 font-semibold">Net Revenue</p>
                <p className="text-2xl font-bold text-blue-700">{formatCurrency(stats.revenue.net)}</p>
              </div>
              <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Category Revenue */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Revenue by Category</h2>
          <div className="space-y-4">
            {categoryDistribution.map((category: any) => {
              const colors = [
                "from-purple-500 to-pink-500",
                "from-blue-500 to-indigo-500",
                "from-green-500 to-emerald-500",
                "from-orange-500 to-red-500",
                "from-yellow-500 to-orange-500",
              ];
              const colorIndex = categoryDistribution.indexOf(category) % colors.length;
              
              return (
                <div key={category.category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {category.category}
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      {category.count} events
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`bg-gradient-to-r ${colors[colorIndex]} h-2 rounded-full`}
                      style={{
                        width: `${(category.count / categoryDistribution.reduce((sum: number, c: any) => sum + c.count, 0)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Platform Stats */}
      <PlatformStats stats={stats} />
    </div>
  );
}
