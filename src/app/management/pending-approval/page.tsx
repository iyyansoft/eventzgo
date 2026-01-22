// src/app/management/pending-approval/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Clock, CheckCircle, XCircle, Mail, RefreshCw } from 'lucide-react';
import Image from 'next/image';

// Disable static generation for this page
export const dynamic = 'force-dynamic';

export default function PendingApprovalPage() {
    const { user } = useUser();
    const router = useRouter();
    const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

    // Query organiser status
    const organiserStatus = useQuery(
        api.management.getOrganiserStatus,
        user?.id ? { clerkId: user.id } : 'skip'
    );

    // Poll for status updates every 10 seconds
    useEffect(() => {
        if (!organiserStatus) return;

        const interval = setInterval(async () => {
            // Refresh user to get latest metadata
            await user?.reload();

            const publicMetadata = user?.publicMetadata || {};
            const status = publicMetadata.status;

            // If approved, redirect to dashboard
            if (status === 'approved') {
                router.push('/management/organiser/dashboard');
            }
        }, 10000); // Poll every 10 seconds

        setPollingInterval(interval);

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [organiserStatus, user, router]);

    // Check if approved on mount
    useEffect(() => {
        if (organiserStatus?.status === 'approved') {
            router.push('/management/organiser/dashboard');
        }
    }, [organiserStatus, router]);

    if (!organiserStatus) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    const isRejected = organiserStatus.status === 'rejected';

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Image
                        src="/eventzgo_logo.png"
                        alt="EventzGo"
                        width={80}
                        height={80}
                        className="h-16 w-auto mx-auto mb-4"
                    />
                </div>

                {/* Status Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
                    {/* Status Icon */}
                    <div className="flex justify-center mb-6">
                        {isRejected ? (
                            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                                <XCircle className="w-12 h-12 text-red-600" />
                            </div>
                        ) : (
                            <div className="relative">
                                <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center animate-pulse">
                                    <Clock className="w-12 h-12 text-yellow-600" />
                                </div>
                                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                    <RefreshCw className="w-4 h-4 text-white animate-spin" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Status Message */}
                    <div className="text-center mb-8">
                        {isRejected ? (
                            <>
                                <h1 className="text-3xl font-bold text-gray-900 mb-3">
                                    Application Not Approved
                                </h1>
                                <p className="text-gray-600 text-lg mb-6">
                                    Unfortunately, your organiser application has been rejected.
                                </p>
                                {organiserStatus.rejectionReason && (
                                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                                        <p className="font-semibold text-red-900 mb-2">Reason:</p>
                                        <p className="text-red-800">{organiserStatus.rejectionReason}</p>
                                    </div>
                                )}
                                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                    <p className="text-blue-900 text-sm">
                                        <strong>What you can do:</strong>
                                        <br />
                                        â€¢ Contact our support team for more information
                                        <br />
                                        â€¢ Reapply with updated information
                                        <br />â€¢ Email us at support@eventzgo.com
                                    </p>
                                </div>
                            </>
                        ) : (
                            <>
                                <h1 className="text-3xl font-bold text-gray-900 mb-3">
                                    Application Under Review
                                </h1>
                                <p className="text-gray-600 text-lg">
                                    Your organiser application is being reviewed by our admin team.
                                    We'll notify you once it's approved!
                                </p>
                            </>
                        )}
                    </div>

                    {!isRejected && (
                        <>
                            {/* Info Cards */}
                            <div className="grid md:grid-cols-2 gap-4 mb-8">
                                <div className="bg-purple-50 rounded-xl p-4">
                                    <div className="flex items-center space-x-3 mb-2">
                                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                            <Clock className="w-5 h-5 text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">Review Time</p>
                                            <p className="text-sm text-gray-600">24-48 hours</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-green-50 rounded-xl p-4">
                                    <div className="flex items-center space-x-3 mb-2">
                                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                            <Mail className="w-5 h-5 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">Email Notification</p>
                                            <p className="text-sm text-gray-600">Sent on approval</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Uploaded Documents */}
                            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                                <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
                                    <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Submitted Documents
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {organiserStatus.documents?.gstCertificate && (
                                        <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                            <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-blue-900">GST Certificate</p>
                                                <p className="text-xs text-blue-700 truncate">{organiserStatus.documents.gstCertificate}</p>
                                            </div>
                                            <CheckCircle className="w-5 h-5 text-blue-600" />
                                        </div>
                                    )}
                                    {organiserStatus.documents?.panCard && (
                                        <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                                            <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                                                </svg>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-green-900">PAN Card</p>
                                                <p className="text-xs text-green-700 truncate">{organiserStatus.documents.panCard}</p>
                                            </div>
                                            <CheckCircle className="w-5 h-5 text-green-600" />
                                        </div>
                                    )}
                                    {organiserStatus.documents?.cancelledCheque && (
                                        <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                                            <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                                </svg>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-purple-900">Cancelled Cheque</p>
                                                <p className="text-xs text-purple-700 truncate">{organiserStatus.documents.cancelledCheque}</p>
                                            </div>
                                            <CheckCircle className="w-5 h-5 text-purple-600" />
                                        </div>
                                    )}
                                    {organiserStatus.documents?.bankStatement && (
                                        <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                                            <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-orange-900">Bank Statement</p>
                                                <p className="text-xs text-orange-700 truncate">{organiserStatus.documents.bankStatement}</p>
                                            </div>
                                            <CheckCircle className="w-5 h-5 text-orange-600" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Timeline */}
                            <div className="bg-gray-50 rounded-xl p-6 mb-8">
                                <h3 className="font-semibold text-gray-900 mb-4">Application Timeline</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-3">
                                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                                        <div>
                                            <p className="font-medium text-gray-900">Application Submitted</p>
                                            <p className="text-sm text-gray-600">
                                                {organiserStatus.rejectedAt
                                                    ? new Date(organiserStatus.rejectedAt).toLocaleString()
                                                    : 'Just now'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <div className="w-5 h-5 border-2 border-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
                                            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">Under Review</p>
                                            <p className="text-sm text-gray-600">In progress...</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3 opacity-50">
                                        <div className="w-5 h-5 border-2 border-gray-300 rounded-full flex-shrink-0"></div>
                                        <div>
                                            <p className="font-medium text-gray-900">Approval</p>
                                            <p className="text-sm text-gray-600">Pending</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Auto-refresh notice */}
                            <div className="text-center">
                                <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-200 text-blue-800 px-4 py-2 rounded-lg text-sm">
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                    <span>Checking for updates every 10 seconds...</span>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Actions */}
                    <div className="flex justify-center space-x-4 mt-8">
                        <button
                            onClick={() => router.push('/management')}
                            className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-gray-400 transition-all duration-200"
                        >
                            Back to Home
                        </button>
                        {!isRejected && (
                            <button
                                onClick={() => {
                                    window.location.href = 'mailto:support@eventzgo.com?subject=Organiser Application Status';
                                }}
                                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
                            >
                                Contact Support
                            </button>
                        )}
                    </div>
                </div>

                {/* Help Text */}
                <div className="text-center mt-6">
                    <p className="text-gray-600 text-sm">
                        Have questions?{' '}
                        <a href="mailto:support@eventzgo.com" className="text-purple-600 hover:text-purple-700 font-medium">
                            Contact our support team
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
