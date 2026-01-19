'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Mail, AlertCircle, Loader2, CheckCircle, Clock } from 'lucide-react';
import { Id } from '@/convex/_generated/dataModel';

function EmailNotVerifiedContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get('email');
    const organiserId = searchParams.get('organiserId');

    const [resending, setResending] = useState(false);
    const [resent, setResent] = useState(false);
    const [error, setError] = useState('');

    // Fetch organiser by username/email if organiserId not provided
    const organiserByUsername = useQuery(
        api.auth.authQueries.findOrganiserByUsername,
        email ? { username: email } : "skip"
    );

    const resendVerification = useMutation(api.emailVerifications.resendVerificationEmail);

    const handleResend = async () => {
        // Get organiserId from param or from query
        const targetOrganiserId = organiserId || organiserByUsername?._id;

        if (!targetOrganiserId) {
            setError('Could not find your account. Please try signing up again.');
            return;
        }

        setResending(true);
        setError('');

        try {
            await resendVerification({ organiserId: targetOrganiserId as Id<"organisers"> });
            setResent(true);

            // Reset after 5 seconds
            setTimeout(() => setResent(false), 5000);
        } catch (err: any) {
            setError(err.message || 'Failed to resend verification email');
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="bg-white rounded-2xl shadow-2xl p-8 border border-orange-100">
                    {/* Icon */}
                    <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center">
                            <Mail className="w-10 h-10 text-orange-600" />
                        </div>
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl font-bold text-center mb-4 text-gray-900">
                        Email Not Verified
                    </h1>

                    {/* Message */}
                    <p className="text-center text-gray-600 mb-6">
                        Please verify your email address before signing in.
                    </p>

                    {/* Email Display */}
                    {(organiserByUsername?.email || email) && (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                            <p className="text-sm text-gray-600 text-center">
                                Verification email sent to:
                            </p>
                            <p className="text-center font-semibold text-gray-900 mt-1">
                                {organiserByUsername?.email || email}
                            </p>
                        </div>
                    )}

                    {/* Instructions */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <div className="flex items-start space-x-3">
                            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                                <h3 className="font-semibold text-blue-900 mb-2">What to do next:</h3>
                                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                                    <li>Check your email inbox</li>
                                    <li>Click the verification link</li>
                                    <li>Return here to sign in</li>
                                </ol>
                            </div>
                        </div>
                    </div>

                    {/* Success Message */}
                    {resent && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                <p className="text-sm text-green-800 font-medium">
                                    Verification email sent! Check your inbox.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                            <div className="flex items-center space-x-2">
                                <AlertCircle className="w-5 h-5 text-red-600" />
                                <p className="text-sm text-red-800">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="space-y-3">
                        {/* Resend Button */}
                        <button
                            onClick={handleResend}
                            disabled={resending || resent}
                            className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 rounded-xl font-semibold hover:from-orange-700 hover:to-red-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                        >
                            {resending ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Sending...</span>
                                </>
                            ) : resent ? (
                                <>
                                    <CheckCircle className="w-5 h-5" />
                                    <span>Email Sent!</span>
                                </>
                            ) : (
                                <>
                                    <Mail className="w-5 h-5" />
                                    <span>Resend Verification Email</span>
                                </>
                            )}
                        </button>

                        {/* Back to Sign In */}
                        <button
                            onClick={() => router.push('/management/sign-in')}
                            className="w-full bg-white text-gray-700 border-2 border-gray-200 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                        >
                            Back to Sign In
                        </button>
                    </div>

                    {/* Help Text */}
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-start space-x-2">
                            <Clock className="w-4 h-4 text-gray-500 mt-0.5" />
                            <p className="text-xs text-gray-600">
                                <strong>Didn't receive the email?</strong> Check your spam folder or click "Resend" to get a new verification link.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-sm text-gray-500 mt-6">
                    Need help? <a href="/contact" className="text-orange-600 hover:underline">Contact Support</a>
                </p>
            </div>
        </div>
    );
}

export default function EmailNotVerifiedPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-orange-600 animate-spin" />
            </div>
        }>
            <EmailNotVerifiedContent />
        </Suspense>
    );
}
