"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Organiser } from "@/types";
import { Id } from "@/convex/_generated/dataModel";
import { Building2, MapPin, FileText, CreditCard, CheckCircle, XCircle } from "lucide-react";

interface OrganiserApprovalProps {
  organiser: any;
}

export default function OrganiserApproval({ organiser }: OrganiserApprovalProps) {
  const { user } = useUser();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const approveOrganiser = useMutation(api.organisers.approveOrganiser);
  const rejectOrganiser = useMutation(api.organisers.rejectOrganiser);

  const handleApprove = async () => {
    if (!user) return;

    setIsProcessing(true);
    try {
      await approveOrganiser({
        organiserId: organiser._id,
        approvedBy: user.id as Id<"users">,
      });
    } catch (error) {
      console.error("Error approving organiser:", error);
      alert("Failed to approve organiser");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!user || !rejectionReason.trim()) return;

    setIsProcessing(true);
    try {
      await rejectOrganiser({
        organiserId: organiser._id,
        rejectionReason,
        approvedBy: user.id as Id<"users">,
      });
      setShowRejectModal(false);
    } catch (error) {
      console.error("Error rejecting organiser:", error);
      alert("Failed to reject organiser");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-yellow-500">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{organiser.institutionName}</h3>
              <p className="text-gray-600">Applied on {new Date(organiser.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Business Details */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 flex items-center">
              <Building2 className="w-5 h-5 mr-2 text-purple-600" />
              Business Information
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">GST Number:</span>
                <span className="font-mono text-gray-900">{organiser.gstNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">PAN Number:</span>
                <span className="font-mono text-gray-900">{organiser.panNumber}</span>
              </div>
              {organiser.tanNumber && (
                <div className="flex justify-between">
                  <span className="text-gray-600">TAN Number:</span>
                  <span className="font-mono text-gray-900">{organiser.tanNumber}</span>
                </div>
              )}
            </div>
          </div>

          {/* Address */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-purple-600" />
              Address
            </h4>
            <div className="text-sm text-gray-900">
              <p>{organiser.address.street}</p>
              <p>{organiser.address.city}, {organiser.address.state}</p>
              <p>PIN: {organiser.address.pincode}</p>
            </div>
          </div>

          {/* Bank Details */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-purple-600" />
              Bank Details
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Account Holder:</span>
                <span className="text-gray-900">{organiser.bankDetails.accountHolderName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Account Number:</span>
                <span className="font-mono text-gray-900">{organiser.bankDetails.accountNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">IFSC Code:</span>
                <span className="font-mono text-gray-900">{organiser.bankDetails.ifscCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Bank:</span>
                <span className="text-gray-900">{organiser.bankDetails.bankName}</span>
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-purple-600" />
              Documents
            </h4>
            <div className="space-y-2">
              {organiser.documents.gstCertificate && (
                <a
                  href={organiser.documents.gstCertificate}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-sm"
                >
                  <span className="text-gray-700">GST Certificate</span>
                  <span className="text-purple-600">View →</span>
                </a>
              )}
              {organiser.documents.panCard && (
                <a
                  href={organiser.documents.panCard}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-sm"
                >
                  <span className="text-gray-700">PAN Card</span>
                  <span className="text-purple-600">View →</span>
                </a>
              )}
              {organiser.documents.cancelledCheque && (
                <a
                  href={organiser.documents.cancelledCheque}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-sm"
                >
                  <span className="text-gray-700">Cancelled Cheque</span>
                  <span className="text-purple-600">View →</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <button
            onClick={handleApprove}
            disabled={isProcessing}
            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            <CheckCircle className="w-5 h-5" />
            <span>{isProcessing ? "Processing..." : "Approve"}</span>
          </button>
          <button
            onClick={() => setShowRejectModal(true)}
            disabled={isProcessing}
            className="flex-1 bg-gradient-to-r from-red-600 to-pink-600 text-white py-3 rounded-xl font-semibold hover:from-red-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            <XCircle className="w-5 h-5" />
            <span>Reject</span>
          </button>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Reject Application</h3>
            <p className="text-gray-600 mb-6">
              Please provide a reason for rejecting this organiser application.
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Reason for rejection..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-6"
              rows={4}
            />
            <div className="flex space-x-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectionReason.trim() || isProcessing}
                className="flex-1 bg-gradient-to-r from-red-600 to-pink-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-50"
              >
                {isProcessing ? "Rejecting..." : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}