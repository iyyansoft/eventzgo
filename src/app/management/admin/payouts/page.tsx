"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import PayoutManagement from "@/components/admin/PayoutManagement";
import { formatCurrency, formatCurrencyCompact } from "@/lib/currency-utils";

export default function AdminPayoutsPage() {
  const [filter, setFilter] = useState<"all" | "pending" | "processing" | "completed" | "failed">("all");
  
  const payouts = useQuery(api.payouts.getAllPayouts, {
    status: filter === "all" ? undefined : (filter as any),
  });

  const stats = useQuery(api.payouts.getPayoutStats, {});

  if (!payouts || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-purple-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-purple-600 rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600 font-medium">Loading payouts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
          Payout Management
        </h1>
        <p className="text-gray-600">
          Process and track organiser payouts
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === "all"
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            All Payouts
          </button>
          <button
            onClick={() => setFilter("pending")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === "pending"
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter("processing")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === "processing"
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Processing
          </button>
          <button
            onClick={() => setFilter("completed")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === "completed"
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setFilter("failed")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === "failed"
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Failed
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
          <p className="text-sm text-gray-600 mb-1">Total Payouts</p>
          <p className="text-3xl font-bold text-gray-900">{stats.totalPayouts}</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200">
          <p className="text-sm text-gray-600 mb-1">Pending</p>
          <p className="text-3xl font-bold text-gray-900">{stats.pendingPayouts}</p>
          <p className="text-sm text-gray-600 mt-1">{formatCurrencyCompact(stats.pendingAmount)}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
          <p className="text-sm text-gray-600 mb-1">Processing</p>
          <p className="text-3xl font-bold text-gray-900">{stats.processingPayouts}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
          <p className="text-sm text-gray-600 mb-1">Completed</p>
          <p className="text-3xl font-bold text-gray-900">{stats.completedPayouts}</p>
          <p className="text-sm text-gray-600 mt-1">{formatCurrencyCompact(stats.completedAmount)}</p>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-6 border border-red-200">
          <p className="text-sm text-gray-600 mb-1">Failed</p>
          <p className="text-3xl font-bold text-gray-900">{stats.failedPayouts}</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Total Amount</h3>
          <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {formatCurrency(stats.totalAmount)}
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Platform Fee</h3>
          <p className="text-3xl font-bold text-green-600">
            {formatCurrency(stats.totalPlatformFee)}
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Net Payouts</h3>
          <p className="text-3xl font-bold text-blue-600">
            {formatCurrency(stats.totalNetAmount)}
          </p>
        </div>
      </div>

      {/* Payouts Table */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Payout Requests</h2>
        </div>
        {payouts.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Payouts Found</h3>
            <p className="text-gray-600">There are no payout requests matching your filter</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {payouts.map((payout) => (
              <PayoutManagement key={payout._id} payout={payout} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}