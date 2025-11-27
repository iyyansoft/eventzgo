"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import DataTable from "@/components/management/DataTable";
import PayoutCard from "@/components/organiser/PayoutCard";
import { formatCurrency } from "@/lib/currency-utils";

export default function OrganiserPayoutsPage() {
  const payouts = useQuery(api.payouts.getOrganiserPayouts);
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

  const columns = [
    { key: "payoutId", label: "Payout ID" },
    { key: "amount", label: "Amount" },
    { key: "status", label: "Status" },
    { key: "date", label: "Date" },
    { key: "method", label: "Method" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
          Payouts
        </h1>
        <p className="text-gray-600">
          Track and manage your payout history
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <PayoutCard
          title="Available Balance"
          amount={stats.totalNetAmount}
          subtitle="Ready for payout"
          status="available"
        />
        <PayoutCard
          title="Pending Payouts"
          amount={stats.pendingAmount}
          subtitle="Processing"
          status="pending"
        />
        <PayoutCard
          title="Total Paid Out"
          amount={stats.completedAmount}
          subtitle="All time"
          status="completed"
        />
      </div>

      {/* Payout History */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Payout History</h2>
        </div>
        <DataTable
          columns={columns}
          data={payouts}
          emptyMessage="No payouts yet"
        />
      </div>
    </div>
  );
}