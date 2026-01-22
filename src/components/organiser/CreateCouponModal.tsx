"use client";

import React, { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { X, Calendar, Users, Percent, IndianRupee } from "lucide-react";
import { RUPEE_SYMBOL } from "@/lib/currency";

interface CreateCouponModalProps {
  organiserId: Id<"organisers">;
  events: any[];
  onClose: () => void;
}

export default function CreateCouponModal({
  organiserId,
  events,
  onClose,
}: CreateCouponModalProps) {
  const createCoupon = useMutation(api.coupons.createCoupon);

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    eventId: "",
    discountType: "percentage" as "percentage" | "fixed" | "bogo",
    discountValue: "",
    maxDiscount: "",
    validFrom: "",
    validUntil: "",
    maxUses: "",
    maxUsesPerUser: "",
    minPurchaseAmount: "",
    firstTimeUserOnly: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Filter only active/published events
  const activeEvents = events.filter((e) => e.status === "published");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validation
      if (!formData.code || formData.code.length < 3) {
        throw new Error("Coupon code must be at least 3 characters");
      }

      if (!formData.discountValue || parseFloat(formData.discountValue) <= 0) {
        throw new Error("Discount value must be greater than 0");
      }

      if (formData.discountType === "percentage" && parseFloat(formData.discountValue) > 100) {
        throw new Error("Percentage discount cannot exceed 100%");
      }

      if (!formData.validFrom || !formData.validUntil) {
        throw new Error("Please select validity period");
      }

      const validFrom = new Date(formData.validFrom).getTime();
      const validUntil = new Date(formData.validUntil).getTime();

      if (validFrom >= validUntil) {
        throw new Error("End date must be after start date");
      }

      // Create coupon
      await createCoupon({
        code: formData.code.toUpperCase(),
        name: formData.name || formData.code,
        description: formData.description,
        organiserId,
        eventId: formData.eventId ? (formData.eventId as Id<"events">) : undefined,
        discountType: formData.discountType,
        discountValue: parseFloat(formData.discountValue),
        maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : undefined,
        validFrom,
        validUntil,
        maxUses: formData.maxUses ? parseInt(formData.maxUses) : undefined,
        maxUsesPerUser: formData.maxUsesPerUser ? parseInt(formData.maxUsesPerUser) : undefined,
        minPurchaseAmount: formData.minPurchaseAmount
          ? parseFloat(formData.minPurchaseAmount)
          : undefined,
        applicableTicketTypes: undefined,
        firstTimeUserOnly: formData.firstTimeUserOnly,
      });

      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to create coupon");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Create New Coupon</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Basic Information</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value.toUpperCase() })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent font-mono uppercase"
                  placeholder="SUMMER2026"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  placeholder="Summer Sale"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                rows={2}
                placeholder="Special summer discount for early birds"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Apply to Event
              </label>
              <select
                value={formData.eventId}
                onChange={(e) => setFormData({ ...formData, eventId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              >
                <option value="">All Events (Global)</option>
                {activeEvents.map((event) => (
                  <option key={event._id} value={event._id}>
                    {event.title}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {activeEvents.length === 0
                  ? "No active events available. Publish an event first."
                  : "Leave empty to apply to all your events"}
              </p>
            </div>
          </div>

          {/* Discount Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Discount Details</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount Type *
                </label>
                <select
                  value={formData.discountType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      discountType: e.target.value as "percentage" | "fixed" | "bogo",
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  required
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount ({RUPEE_SYMBOL})</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount Value *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.discountValue}
                    onChange={(e) =>
                      setFormData({ ...formData, discountValue: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    placeholder={formData.discountType === "percentage" ? "10" : "100"}
                    min="0"
                    step="0.01"
                    required
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {formData.discountType === "percentage" ? (
                      <Percent className="w-4 h-4" />
                    ) : (
                      <IndianRupee className="w-4 h-4" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {formData.discountType === "percentage" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Discount Cap (Optional)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.maxDiscount}
                    onChange={(e) =>
                      setFormData({ ...formData, maxDiscount: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    placeholder="500"
                    min="0"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <IndianRupee className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Maximum discount amount in rupees
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Purchase Amount (Optional)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.minPurchaseAmount}
                  onChange={(e) =>
                    setFormData({ ...formData, minPurchaseAmount: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  placeholder="1000"
                  min="0"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <IndianRupee className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>

          {/* Validity Period */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Validity Period</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valid From *
                </label>
                <input
                  type="datetime-local"
                  value={formData.validFrom}
                  onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valid Until *
                </label>
                <input
                  type="datetime-local"
                  value={formData.validUntil}
                  onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          {/* Usage Limits */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Usage Limits</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Usage Limit (Optional)
                </label>
                <input
                  type="number"
                  value={formData.maxUses}
                  onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  placeholder="100"
                  min="1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Maximum number of times this coupon can be used
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Per User Limit (Optional)
                </label>
                <input
                  type="number"
                  value={formData.maxUsesPerUser}
                  onChange={(e) =>
                    setFormData({ ...formData, maxUsesPerUser: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  placeholder="1"
                  min="1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Maximum times each user can use this coupon
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="firstTimeUserOnly"
                checked={formData.firstTimeUserOnly}
                onChange={(e) =>
                  setFormData({ ...formData, firstTimeUserOnly: e.target.checked })
                }
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-600"
              />
              <label htmlFor="firstTimeUserOnly" className="text-sm text-gray-700">
                First-time users only
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create Coupon"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
