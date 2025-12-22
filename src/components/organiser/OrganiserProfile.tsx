// Comprehensive Organiser Profile Component
import React from 'react';
import { Users, MapPin, FileText, CreditCard, CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface OrganiserProfileProps {
    organiserData: any;
}

export default function OrganiserProfile({ organiserData }: OrganiserProfileProps) {
    if (!organiserData) return null;

    return (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="w-20 h-20 bg-white rounded-xl flex items-center justify-center">
                            <Users className="w-10 h-10 text-purple-600" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold mb-1">{organiserData.institutionName}</h2>
                            <div className="flex items-center space-x-3 mt-2">
                                <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${organiserData.approvalStatus === 'approved'
                                        ? 'bg-green-500 text-white'
                                        : organiserData.approvalStatus === 'pending'
                                            ? 'bg-yellow-500 text-white'
                                            : 'bg-red-500 text-white'
                                    }`}>
                                    {organiserData.approvalStatus === 'approved' ? '✓ Verified Organiser' : organiserData.approvalStatus.toUpperCase()}
                                </span>
                                {organiserData.isActive && (
                                    <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium">
                                        Active
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Detailed Information Grid */}
            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Address Information */}
                <div className="bg-gray-50 rounded-xl p-5">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-purple-600" />
                        Address Details
                    </h3>
                    <div className="space-y-2 text-sm">
                        <p className="text-gray-700"><span className="font-medium">Street:</span> {organiserData.address.street}</p>
                        <p className="text-gray-700"><span className="font-medium">City:</span> {organiserData.address.city}</p>
                        <p className="text-gray-700"><span className="font-medium">State:</span> {organiserData.address.state}</p>
                        <p className="text-gray-700"><span className="font-medium">Pincode:</span> {organiserData.address.pincode}</p>
                    </div>
                </div>

                {/* Tax Information */}
                <div className="bg-gray-50 rounded-xl p-5">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-purple-600" />
                        Tax Information
                    </h3>
                    <div className="space-y-2 text-sm">
                        <p className="text-gray-700"><span className="font-medium">GST Number:</span> {organiserData.gstNumber}</p>
                        <p className="text-gray-700"><span className="font-medium">PAN Number:</span> {organiserData.panNumber}</p>
                        {organiserData.tanNumber && (
                            <p className="text-gray-700"><span className="font-medium">TAN Number:</span> {organiserData.tanNumber}</p>
                        )}
                    </div>
                </div>

                {/* Bank Details */}
                <div className="bg-gray-50 rounded-xl p-5">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-purple-600" />
                        Bank Account Details
                    </h3>
                    <div className="space-y-2 text-sm">
                        <p className="text-gray-700"><span className="font-medium">Account Holder:</span> {organiserData.bankDetails.accountHolderName}</p>
                        <p className="text-gray-700"><span className="font-medium">Account Number:</span> ****{organiserData.bankDetails.accountNumber.slice(-4)}</p>
                        <p className="text-gray-700"><span className="font-medium">IFSC Code:</span> {organiserData.bankDetails.ifscCode}</p>
                        <p className="text-gray-700"><span className="font-medium">Bank:</span> {organiserData.bankDetails.bankName}</p>
                        <p className="text-gray-700"><span className="font-medium">Branch:</span> {organiserData.bankDetails.branchName}</p>
                    </div>
                </div>

                {/* Documents */}
                <div className="bg-gray-50 rounded-xl p-5">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-purple-600" />
                        Uploaded Documents
                    </h3>
                    <div className="space-y-2 text-sm">
                        {organiserData.documents.gstCertificate && (
                            <div className="flex items-center justify-between p-2 bg-white rounded">
                                <span className="text-gray-700">GST Certificate</span>
                                <CheckCircle className="w-4 h-4 text-green-600" />
                            </div>
                        )}
                        {organiserData.documents.panCard && (
                            <div className="flex items-center justify-between p-2 bg-white rounded">
                                <span className="text-gray-700">PAN Card</span>
                                <CheckCircle className="w-4 h-4 text-green-600" />
                            </div>
                        )}
                        {organiserData.documents.cancelledCheque && (
                            <div className="flex items-center justify-between p-2 bg-white rounded">
                                <span className="text-gray-700">Cancelled Cheque</span>
                                <CheckCircle className="w-4 h-4 text-green-600" />
                            </div>
                        )}
                        {organiserData.documents.bankStatement && (
                            <div className="flex items-center justify-between p-2 bg-white rounded">
                                <span className="text-gray-700">Bank Statement</span>
                                <CheckCircle className="w-4 h-4 text-green-600" />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Approval Information */}
            {organiserData.approvedAt && (
                <div className="px-6 pb-6">
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-green-800">
                            <CheckCircle className="w-5 h-5" />
                            <span className="font-medium">
                                Approved on {new Date(organiserData.approvedAt).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                })}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Rejection Reason */}
            {organiserData.rejectionReason && (
                <div className="px-6 pb-6">
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                        <div className="flex items-start gap-2 text-red-800">
                            <AlertCircle className="w-5 h-5 mt-0.5" />
                            <div>
                                <p className="font-medium mb-1">Rejection Reason:</p>
                                <p className="text-sm">{organiserData.rejectionReason}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Timestamps */}
            <div className="px-6 pb-6">
                <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        <span>Created: {new Date(organiserData.createdAt).toLocaleDateString()}</span>
                    </div>
                    <span>Last Updated: {new Date(organiserData.updatedAt).toLocaleDateString()}</span>
                </div>
            </div>
        </div>
    );
}
