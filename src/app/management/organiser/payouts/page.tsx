"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Plus,
  Eye,
  Calendar,
  CreditCard,
  FileText,
} from "lucide-react";

export default function OrganiserPayoutsPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedScope, setSelectedScope] = useState<"event" | "account">("account");
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    const stored = localStorage.getItem("organiser_session");
    if (stored) {
      try {
        const user = JSON.parse(stored);
        if (user && user.id) setUserId(user.id);
      } catch (e) { }
    }
  }, []);

  // Queries
  const balance = useQuery(
    api.payouts.getPayoutBalance,
    userId ? { organiserId: userId as any } : "skip"
  );

  const eventBreakdowns = useQuery(
    api.payouts.getEventPayoutBreakdown,
    userId ? { organiserId: userId as any } : "skip"
  );

  const payoutRequests = useQuery(
    api.payouts.getPayoutRequests,
    userId ? { organiserId: userId as any, status: filterStatus } : "skip"
  );

  // Mutations
  const createRequest = useMutation(api.payouts.createPayoutRequest);
  const cancelRequest = useMutation(api.payouts.cancelPayoutRequest);

  const handleCreateRequest = async () => {
    if (!userId) return;

    try {
      await createRequest({
        organiserId: userId as any,
        scope: selectedScope,
        eventId: selectedEventId ? (selectedEventId as any) : undefined,
      });
      setShowRequestModal(false);
      alert("Payout request created successfully!");
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "approved":
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "pending":
      case "under_review":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="w-4 h-4" />;
      case "approved":
      case "processing":
        return <Clock className="w-4 h-4" />;
      case "pending":
      case "under_review":
        return <AlertCircle className="w-4 h-4" />;
      case "rejected":
      case "failed":
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  if (!balance) {
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Payouts
          </h1>
          <p className="text-gray-600">Manage your earnings and withdrawal requests</p>
        </div>
        <button
          onClick={() => setShowRequestModal(true)}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Request Payout
        </button>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Available Balance</span>
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            ₹{balance.availableBalance.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">Ready to withdraw</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Pending Payouts</span>
            <Clock className="w-5 h-5 text-yellow-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            ₹{balance.pendingBalance.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">In processing</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Total Earnings</span>
            <TrendingUp className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            ₹{balance.totalEarnings.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">Lifetime revenue</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Platform Fee</span>
            <FileText className="w-5 h-5 text-gray-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            ₹{balance.breakdown.platformFee.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">+ GST ₹{balance.breakdown.gst.toLocaleString()}</p>
        </div>
      </div>

      {/* Event-wise Breakdown */}
      {eventBreakdowns && eventBreakdowns.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Event-wise Earnings</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 text-sm text-gray-600">
                  <th className="text-left pb-3 font-medium">Event</th>
                  <th className="text-right pb-3 font-medium">Revenue</th>
                  <th className="text-right pb-3 font-medium">Paid Out</th>
                  <th className="text-right pb-3 font-medium">Available</th>
                  <th className="text-right pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {eventBreakdowns.map((event: any) => (
                  <tr key={event.eventId} className="hover:bg-gray-50">
                    <td className="py-4">
                      <p className="font-medium text-gray-900">{event.eventTitle}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(event.eventDate).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="text-right font-medium text-gray-900">
                      ₹{event.revenue.toLocaleString()}
                    </td>
                    <td className="text-right text-green-600">
                      ₹{event.paidOut.toLocaleString()}
                    </td>
                    <td className="text-right font-bold text-purple-600">
                      ₹{event.pending.toLocaleString()}
                    </td>
                    <td className="text-right">
                      {event.pending > 1000 && (
                        <button
                          onClick={() => {
                            setSelectedScope("event");
                            setSelectedEventId(event.eventId);
                            setShowRequestModal(true);
                          }}
                          className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                        >
                          Request
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payout Requests */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Payout Requests</h2>
          <div className="flex gap-2">
            {["all", "pending", "approved", "paid", "rejected"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1 text-sm rounded-full capitalize ${filterStatus === status
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {!payoutRequests || payoutRequests.length === 0 ? (
          <div className="text-center py-12">
            <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No payout requests found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {payoutRequests.map((request: any) => (
              <div
                key={request._id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono text-sm font-bold text-gray-900">
                        {request.payoutId}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(
                          request.status
                        )}`}
                      >
                        {getStatusIcon(request.status)}
                        {request.status.replace("_", " ").toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{request.eventTitle}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Requested:</span>
                        <p className="font-medium">
                          {new Date(request.requestedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Amount:</span>
                        <p className="font-bold text-purple-600">
                          ₹{request.eligibleAmount.toLocaleString()}
                        </p>
                      </div>
                      {request.utrNumber && (
                        <div>
                          <span className="text-gray-500">UTR:</span>
                          <p className="font-mono text-xs">{request.utrNumber}</p>
                        </div>
                      )}
                      {request.rejectionReason && (
                        <div className="col-span-2">
                          <span className="text-red-600 text-xs">Reason:</span>
                          <p className="text-xs text-red-600">{request.rejectionReason}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {(request.status === "pending" || request.status === "under_review") && (
                      <button
                        onClick={() => {
                          if (confirm("Cancel this payout request?")) {
                            cancelRequest({
                              payoutId: request._id,
                              organiserId: userId as any,
                            });
                          }
                        }}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Request Payout</h2>

            <div className="space-y-6">
              {/* Scope Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payout Scope
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => {
                      setSelectedScope("account");
                      setSelectedEventId(null);
                    }}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${selectedScope === "account"
                        ? "border-purple-600 bg-purple-50"
                        : "border-gray-200 hover:border-gray-300"
                      }`}
                  >
                    <p className="font-semibold text-gray-900">Full Account</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Withdraw all available balance
                    </p>
                  </button>
                  <button
                    onClick={() => setSelectedScope("event")}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${selectedScope === "event"
                        ? "border-purple-600 bg-purple-50"
                        : "border-gray-200 hover:border-gray-300"
                      }`}
                  >
                    <p className="font-semibold text-gray-900">Single Event</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Withdraw from specific event
                    </p>
                  </button>
                </div>
              </div>

              {/* Event Selection */}
              {selectedScope === "event" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Event
                  </label>
                  <select
                    value={selectedEventId || ""}
                    onChange={(e) => setSelectedEventId(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Choose an event...</option>
                    {eventBreakdowns?.map((event: any) => (
                      <option key={event.eventId} value={event.eventId}>
                        {event.eventTitle} - ₹{event.pending.toLocaleString()} available
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Amount Preview */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">Withdrawal Amount</p>
                <p className="text-3xl font-bold text-purple-600">
                  ₹{balance.availableBalance.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Minimum withdrawal: ₹1,000 • Auto-approved if &lt; ₹50,000
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowRequestModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateRequest}
                  disabled={selectedScope === "event" && !selectedEventId}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}