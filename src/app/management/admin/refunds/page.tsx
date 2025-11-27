"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import RefundApproval from "@/components/admin/RefundApproval";

export default function AdminRefundsPage() {
  const [filter, setFilter] = useState<"all" | "requested" | "approved" | "rejected" | "processed">("all");
  
  const refunds = useQuery(api.refunds.getAllRefunds, {
    status: filter === "all" ? undefined : (filter as any),
  });

  const stats = useQuery(api.refunds.getRefundStats);

  if (!refunds || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-purple-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-purple-600 rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600 font-medium">Loading refunds...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
          Refund Management
        </h1>
        <p className="text-gray-600">
          Review and process refund requests
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
            All Refunds
          </button>
          <button
            onClick={() => setFilter("requested")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === "requested"
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Requested
          </button>
          <button
            onClick={() => setFilter("approved")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === "approved"
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => setFilter("rejected")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === "rejected"
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Rejected
          </button>
          <button
            onClick={() => setFilter("processed")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === "processed"
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Processed
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
          <p className="text-sm text-gray-600 mb-1">Total Refunds</p>
          <p className="text-3xl font-bold text-gray-900">{stats.totalRefunds}</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200">
          <p className="text-sm text-gray-600 mb-1">Requested</p>
          <p className="text-3xl font-bold text-gray-900">{stats.requestedRefunds}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
          <p className="text-sm text-gray-600 mb-1">Approved</p>
          <p className="text-3xl font-bold text-gray-900">{stats.approvedRefunds}</p>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-6 border border-red-200">
          <p className="text-sm text-gray-600 mb-1">Rejected</p>
          <p className="text-3xl font-bold text-gray-900">{stats.rejectedRefunds}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
          <p className="text-sm text-gray-600 mb-1">Processed</p>
          <p className="text-3xl font-bold text-gray-900">{stats.processedRefunds}</p>
        </div>
      </div>

      {/* Refund Requests */}
      <div className="space-y-4">
        {refunds.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Refunds Found</h3>
            <p className="text-gray-600">There are no refund requests matching your filter</p>
          </div>
        ) : (
          refunds.map((refund) => (
            <RefundApproval key={refund._id} refund={refund} />
          ))
        )}
      </div>
    </div>
  );
}