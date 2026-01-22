"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Ticket, Plus, Edit, Trash2, Calendar, Users, TrendingDown, Copy, Check } from "lucide-react";
import { formatCurrency, RUPEE_SYMBOL } from "@/lib/currency";
import CreateCouponModal from "@/components/organiser/CreateCouponModal";

export default function CouponsPage() {
  const [organiserId, setOrganiserId] = useState<Id<"organisers"> | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEventFilter, setSelectedEventFilter] = useState<string>("all");

  // Get organiser ID from session
  React.useEffect(() => {
    const session = sessionStorage.getItem("organiserSession") || localStorage.getItem("organiserSession");
    if (session) {
      const data = JSON.parse(session);
      setOrganiserId(data.organiserId);
    }
  }, []);

  const coupons = useQuery(
    api.coupons.getCoupons,
    organiserId ? { organiserId } : "skip"
  );

  const stats = useQuery(
    api.coupons.getCouponStats,
    organiserId ? { organiserId } : "skip"
  );

  const events = useQuery(
    api.events.getEventsByOrganiser,
    organiserId ? { organiserId } : "skip"
  );

  const deleteCoupon = useMutation(api.coupons.deleteCoupon);

  const handleDelete = async (couponId: Id<"coupons">) => {
    if (confirm("Are you sure you want to deactivate this coupon?")) {
      await deleteCoupon({ couponId });
    }
  };

  const filteredCoupons = coupons?.filter((c) => {
    if (selectedEventFilter === "all") return true;
    if (selectedEventFilter === "global") return !c.eventId;
    return c.eventId === selectedEventFilter;
  });

  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Ticket className="w-8 h-8 text-purple-600" />
                Coupon Management
              </h1>
              <p className="text-gray-600 mt-2">
                Create and manage discount codes for your events
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Coupon
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-600 text-sm">Total Coupons</p>
              <div className="bg-purple-100 p-2 rounded-lg">
                <Ticket className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats?.totalCoupons || 0}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-600 text-sm">Active Coupons</p>
              <div className="bg-green-100 p-2 rounded-lg">
                <TrendingDown className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats?.activeCoupons || 0}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-600 text-sm">Total Discount</p>
              <div className="bg-orange-100 p-2 rounded-lg">
                <span className="text-xl font-bold text-orange-600">{RUPEE_SYMBOL}</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {formatCurrency(stats?.totalDiscount || 0)}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-600 text-sm">Total Revenue</p>
              <div className="bg-blue-100 p-2 rounded-lg">
                <span className="text-xl font-bold text-blue-600">{RUPEE_SYMBOL}</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {formatCurrency(stats?.totalRevenue || 0)}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Filter by Event:</label>
            <select
              value={selectedEventFilter}
              onChange={(e) => setSelectedEventFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
            >
              <option value="all">All Events</option>
              <option value="global">Global Coupons</option>
              {events?.map((event) => (
                <option key={event._id} value={event._id}>
                  {event.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Coupons List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Discount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Usage
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Validity
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCoupons?.map((coupon) => (
                  <tr key={coupon._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <code className="bg-purple-100 text-purple-800 px-3 py-1 rounded-lg font-mono font-bold text-sm">
                          {coupon.code}
                        </code>
                        <button
                          onClick={() => copyCode(coupon.code)}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                          title="Copy code"
                        >
                          {copiedCode === coupon.code ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{coupon.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">{coupon.eventName}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-gray-900">
                        {coupon.discountType === "percentage"
                          ? `${coupon.discountValue}% OFF`
                          : `${RUPEE_SYMBOL}${coupon.discountValue} OFF`}
                      </div>
                      {coupon.maxDiscount && (
                        <p className="text-xs text-gray-500">
                          Max: {formatCurrency(coupon.maxDiscount)}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                            <span>{coupon.currentUses}</span>
                            <span>{coupon.maxUses || "∞"}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-purple-600 h-2 rounded-full transition-all"
                              style={{
                                width: `${coupon.usagePercentage}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                      {coupon.maxUsesPerUser && (
                        <p className="text-xs text-gray-500 mt-1">
                          {coupon.maxUsesPerUser} per user
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-gray-600">
                        <div className="flex items-center gap-1 mb-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(coupon.validFrom).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(coupon.validUntil).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          coupon.status === "active"
                            ? "bg-green-100 text-green-800"
                            : coupon.status === "scheduled"
                            ? "bg-blue-100 text-blue-800"
                            : coupon.status === "exhausted"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {coupon.status.charAt(0).toUpperCase() + coupon.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleDelete(coupon._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Deactivate"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {(!filteredCoupons || filteredCoupons.length === 0) && (
              <div className="text-center py-12">
                <Ticket className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No coupons found</p>
                <p className="text-gray-400 text-sm mt-2">
                  Create your first coupon to start offering discounts
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateCouponModal
          organiserId={organiserId!}
          events={events || []}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
}
