"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAdminAuth } from "@/components/admin/AdminAuthProvider";
import {
    DollarSign,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    TrendingUp,
    Download,
    Search,
    Filter,
    Eye,
    Check,
    X,
    Send,
    FileText,
} from "lucide-react";

// Disable static generation for this page
export const dynamic = 'force-dynamic';

export default function AdminPayoutsPage() {
    const { sessionToken } = useAdminAuth();
    const [filterStatus, setFilterStatus] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedPayout, setSelectedPayout] = useState<any>(null);
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");
    const [utrNumber, setUtrNumber] = useState("");
    const [paymentProof, setPaymentProof] = useState("");

    // Queries
    const stats = useQuery(
        api.adminPayouts.getPayoutDashboardStats,
        sessionToken ? { sessionToken } : "skip"
    );

    const payouts = useQuery(
        api.adminPayouts.getAllPayoutRequests,
        sessionToken ? { sessionToken, status: filterStatus } : "skip"
    );

    const highValuePayouts = useQuery(
        api.adminPayouts.getHighValuePayouts,
        sessionToken ? { sessionToken } : "skip"
    );

    // Mutations
    const approvePayout = useMutation(api.adminPayouts.approvePayout);
    const rejectPayout = useMutation(api.adminPayouts.rejectPayout);
    const markProcessing = useMutation(api.adminPayouts.markPayoutProcessing);
    const markPaid = useMutation(api.adminPayouts.markPayoutPaid);

    const handleApprove = async () => {
        if (!selectedPayout || !sessionToken) return;
        try {
            await approvePayout({
                sessionToken,
                payoutId: selectedPayout._id,
            });
            setShowApprovalModal(false);
            setSelectedPayout(null);
            alert("Payout approved successfully!");
        } catch (error: any) {
            alert(`Error: ${error.message}`);
        }
    };

    const handleReject = async () => {
        if (!selectedPayout || !sessionToken || !rejectionReason) return;
        try {
            await rejectPayout({
                sessionToken,
                payoutId: selectedPayout._id,
                reason: rejectionReason,
            });
            setShowRejectModal(false);
            setSelectedPayout(null);
            setRejectionReason("");
            alert("Payout rejected.");
        } catch (error: any) {
            alert(`Error: ${error.message}`);
        }
    };

    const handleMarkPaid = async () => {
        if (!selectedPayout || !sessionToken || !utrNumber) return;
        try {
            await markPaid({
                sessionToken,
                payoutId: selectedPayout._id,
                utrNumber,
                paymentProof,
            });
            setShowPaymentModal(false);
            setSelectedPayout(null);
            setUtrNumber("");
            setPaymentProof("");
            alert("Payout marked as paid!");
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

    const filteredPayouts = payouts?.filter((p: any) =>
        searchQuery
            ? p.organiserName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.payoutId?.toLowerCase().includes(searchQuery.toLowerCase())
            : true
    );

    if (!stats) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Payout Management</h1>
                <p className="text-gray-600">Review and process organiser payout requests</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">Pending Review</span>
                        <AlertCircle className="w-5 h-5 text-yellow-600" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{stats.counts.underReview}</p>
                    <p className="text-sm text-gray-500 mt-1">
                        â‚¹{stats.amounts.underReview.toLocaleString()}
                    </p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">Approved</span>
                        <CheckCircle className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{stats.counts.approved}</p>
                    <p className="text-sm text-gray-500 mt-1">Ready to process</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">Paid Today</span>
                        <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                        â‚¹{stats.amounts.todayPaid.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                        {stats.counts.paid} total this month
                    </p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">Monthly Total</span>
                        <DollarSign className="w-5 h-5 text-purple-600" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                        â‚¹{stats.amounts.monthlyPaid.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">This month</p>
                </div>
            </div>

            {/* High Value Alerts */}
            {highValuePayouts && highValuePayouts.length > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                        <div className="flex-1">
                            <h3 className="font-semibold text-orange-800">
                                High-Value Payouts Pending
                            </h3>
                            <p className="text-sm text-orange-700 mt-1">
                                {highValuePayouts.length} payout request(s) over â‚¹50,000 require manual review
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Filters and Search */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by organiser or payout ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto">
                        {[
                            "all",
                            "pending",
                            "under_review",
                            "approved",
                            "processing",
                            "paid",
                            "rejected",
                        ].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap capitalize ${filterStatus === status
                                        ? "bg-purple-600 text-white"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                    }`}
                            >
                                {status.replace("_", " ")}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Payouts Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr className="text-sm text-gray-600">
                                <th className="text-left px-6 py-3 font-medium">Payout ID</th>
                                <th className="text-left px-6 py-3 font-medium">Organiser</th>
                                <th className="text-left px-6 py-3 font-medium">Event</th>
                                <th className="text-right px-6 py-3 font-medium">Amount</th>
                                <th className="text-left px-6 py-3 font-medium">Requested</th>
                                <th className="text-left px-6 py-3 font-medium">Status</th>
                                <th className="text-right px-6 py-3 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredPayouts?.map((payout: any) => (
                                <tr key={payout._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <span className="font-mono text-sm font-semibold text-gray-900">
                                            {payout.payoutId}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-medium text-gray-900">{payout.organiserName}</p>
                                        <p className="text-xs text-gray-500">{payout.organiserEmail}</p>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {payout.eventTitle}
                                    </td>
                                    <td className="px-6 py-4 text-right font-bold text-gray-900">
                                        â‚¹{payout.eligibleAmount.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {new Date(payout.requestedAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(
                                                payout.status
                                            )}`}
                                        >
                                            {payout.status.replace("_", " ")}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            {(payout.status === "pending" ||
                                                payout.status === "under_review") && (
                                                    <>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedPayout(payout);
                                                                setShowApprovalModal(true);
                                                            }}
                                                            className="text-green-600 hover:text-green-700 p-1"
                                                            title="Approve"
                                                        >
                                                            <Check className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedPayout(payout);
                                                                setShowRejectModal(true);
                                                            }}
                                                            className="text-red-600 hover:text-red-700 p-1"
                                                            title="Reject"
                                                        >
                                                            <X className="w-5 h-5" />
                                                        </button>
                                                    </>
                                                )}
                                            {payout.status === "approved" && (
                                                <button
                                                    onClick={() => {
                                                        setSelectedPayout(payout);
                                                        setShowPaymentModal(true);
                                                    }}
                                                    className="text-blue-600 hover:text-blue-700 p-1"
                                                    title="Mark as Paid"
                                                >
                                                    <Send className="w-5 h-5" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => setSelectedPayout(payout)}
                                                className="text-gray-600 hover:text-gray-700 p-1"
                                                title="View Details"
                                            >
                                                <Eye className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Approval Modal */}
            {showApprovalModal && selectedPayout && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Approve Payout</h2>
                        <p className="text-gray-600 mb-6">
                            Approve payout of <strong>â‚¹{selectedPayout.eligibleAmount.toLocaleString()}</strong> to{" "}
                            <strong>{selectedPayout.organiserName}</strong>?
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowApprovalModal(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleApprove}
                                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                            >
                                Approve
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && selectedPayout && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Reject Payout</h2>
                        <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Enter rejection reason..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 h-32"
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowRejectModal(false);
                                    setRejectionReason("");
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={!rejectionReason}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                            >
                                Reject
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Modal */}
            {showPaymentModal && selectedPayout && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Mark as Paid</h2>
                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    UTR Number *
                                </label>
                                <input
                                    type="text"
                                    value={utrNumber}
                                    onChange={(e) => setUtrNumber(e.target.value)}
                                    placeholder="Enter UTR/Reference number"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Payment Proof URL (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={paymentProof}
                                    onChange={(e) => setPaymentProof(e.target.value)}
                                    placeholder="URL to payment receipt"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowPaymentModal(false);
                                    setUtrNumber("");
                                    setPaymentProof("");
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleMarkPaid}
                                disabled={!utrNumber}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                Mark as Paid
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Details Modal */}
            {selectedPayout && !showApprovalModal && !showRejectModal && !showPaymentModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-start mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Payout Details</h2>
                            <button
                                onClick={() => setSelectedPayout(null)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">Payout ID</p>
                                    <p className="font-mono font-semibold">{selectedPayout.payoutId}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Status</p>
                                    <span
                                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(
                                            selectedPayout.status
                                        )}`}
                                    >
                                        {selectedPayout.status.replace("_", " ")}
                                    </span>
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <h3 className="font-semibold mb-3">Financial Breakdown</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Total Revenue:</span>
                                        <span className="font-medium">
                                            â‚¹{selectedPayout.breakdown.totalRevenue.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Platform Fee:</span>
                                        <span className="text-red-600">
                                            -â‚¹{selectedPayout.breakdown.platformFee.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">GST:</span>
                                        <span className="text-red-600">
                                            -â‚¹{selectedPayout.breakdown.gst.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Gateway Fees:</span>
                                        <span className="text-red-600">
                                            -â‚¹{selectedPayout.breakdown.gatewayFees.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between border-t pt-2 font-bold">
                                        <span>Net Payable:</span>
                                        <span className="text-green-600">
                                            â‚¹{selectedPayout.breakdown.netPayable.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <h3 className="font-semibold mb-3">Bank Details</h3>
                                <div className="space-y-2 text-sm">
                                    <div>
                                        <span className="text-gray-600">Account Holder:</span>
                                        <p className="font-medium">{selectedPayout.bankDetails.accountHolderName}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Account Number:</span>
                                        <p className="font-mono">{selectedPayout.bankDetails.accountNumber}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">IFSC Code:</span>
                                        <p className="font-mono">{selectedPayout.bankDetails.ifscCode}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Bank:</span>
                                        <p>{selectedPayout.bankDetails.bankName}, {selectedPayout.bankDetails.branchName}</p>
                                    </div>
                                </div>
                            </div>

                            {selectedPayout.utrNumber && (
                                <div className="border-t pt-4">
                                    <h3 className="font-semibold mb-3">Payment Details</h3>
                                    <div className="space-y-2 text-sm">
                                        <div>
                                            <span className="text-gray-600">UTR Number:</span>
                                            <p className="font-mono font-semibold">{selectedPayout.utrNumber}</p>
                                        </div>
                                        {selectedPayout.paymentProof && (
                                            <div>
                                                <span className="text-gray-600">Payment Proof:</span>
                                                <a
                                                    href={selectedPayout.paymentProof}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:underline block"
                                                >
                                                    View Receipt
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
