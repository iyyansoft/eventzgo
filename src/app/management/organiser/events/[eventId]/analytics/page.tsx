"use client";

import { use } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { formatCurrency, formatCurrencyCompact } from "@/lib/currency-utils";
import { APP_CONFIG } from "@/constants/config";
import StatsCard from "@/components/management/StatsCard";
import SalesChart from "@/components/organiser/SalesChart";
import { useRouter } from "next/navigation";

export default function EventAnalyticsPage({ params }: { params: Promise<{ eventId: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const event = useQuery(api.events.getEventById, { eventId: resolvedParams.eventId as Id<"events"> });
  const analytics = useQuery(api.analytics.getEventAnalytics, { eventId: resolvedParams.eventId as Id<"events"> });

  if (!event || !analytics) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-purple-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-purple-600 rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600 font-medium">Loading analytics...</p>
        </div>
      </div>
    );
  }

  // Derived metrics from analytics overview
  const totalRevenue = analytics.overview?.totalRevenue ?? 0;
  const ticketsSold = analytics.overview?.totalTicketsSold ?? 0;
  const totalTickets = analytics.overview?.capacity ?? 0;
  const conversionRate = analytics.overview && analytics.overview.totalBookings
    ? Math.round((analytics.overview.confirmedBookings / Math.max(1, analytics.overview.totalBookings)) * 100)
    : 0;
  const avgTicketPrice = analytics.overview && analytics.overview.totalTicketsSold
    ? Math.round((analytics.overview.totalRevenue || 0) / Math.max(1, analytics.overview.totalTicketsSold))
    : 0;
  const grossRevenue = totalRevenue;
  const platformFee = Math.round(grossRevenue * (APP_CONFIG.platformCommission / 100));
  const gst = Math.round(grossRevenue * (APP_CONFIG.gstPercentage / 100));
  const netRevenue = grossRevenue - platformFee - gst;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => router.back()}
          className="text-gray-600 hover:text-gray-900 flex items-center mb-4"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Events
        </button>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
          {event.title} - Analytics
        </h1>
        <p className="text-gray-600">
          Detailed insights and performance metrics
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Revenue"
          value={formatCurrencyCompact(totalRevenue)}
          icon="currency"
          gradient="from-purple-500 to-pink-500"
        />
        <StatsCard
          title="Tickets Sold"
          value={`${ticketsSold} / ${totalTickets}`}
          icon="ticket"
          gradient="from-blue-500 to-indigo-500"
        />
        <StatsCard
          title="Conversion Rate"
          value={`${conversionRate}%`}
          icon="chart"
          gradient="from-green-500 to-emerald-500"
        />
        <StatsCard
          title="Avg. Ticket Price"
          value={formatCurrency(avgTicketPrice)}
          icon="currency"
          gradient="from-orange-500 to-red-500"
        />
      </div>

      {/* Sales Chart */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Sales Timeline</h2>
          <SalesChart data={analytics.revenueTimeline} />
      </div>

      {/* Additional Metrics */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Ticket Categories</h3>
          <div className="space-y-3">
              {analytics.ticketTypes.map((category: any) => (
              <div key={category.name} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{category.name}</span>
                    <span className="text-sm text-gray-600">{category.sold} / {category.total}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full"
                      style={{ width: `${(category.sold / category.total) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Revenue Breakdown</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b">
              <span className="text-sm text-gray-600">Gross Revenue</span>
              <span className="text-sm font-semibold">{formatCurrency(grossRevenue)}</span>
            </div>
            <div className="flex items-center justify-between pb-3 border-b">
              <span className="text-sm text-gray-600">Platform Fee ({APP_CONFIG.platformCommission}%)</span>
                <span className="text-sm font-semibold text-red-600">-{formatCurrency(platformFee)}</span>
            </div>
            <div className="flex items-center justify-between pb-3 border-b">
              <span className="text-sm text-gray-600">GST ({APP_CONFIG.gstPercentage}%)</span>
                <span className="text-sm font-semibold text-red-600">-{formatCurrency(gst)}</span>
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="text-base font-bold text-gray-900">Net Revenue</span>
              <span className="text-base font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {formatCurrency(netRevenue)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}