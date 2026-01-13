'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';

export default function VerifyEmailPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');

    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
    const [message, setMessage] = useState('');
    const [username, setUsername] = useState('');

    const verifyEmail = useMutation(api.emailVerifications.verifyEmail);

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('No verification token provided');
            return;
        }

        handleVerification();
    }, [token]);

    const handleVerification = async () => {
        try {
            const result = await verifyEmail({ token: token! });

            setStatus('success');
            setMessage('Your email has been verified successfully!');
            setUsername(result.username || '');

            // Redirect to sign-in after 3 seconds
            setTimeout(() => {
                router.push('/management/sign-in');
            }, 3000);
        } catch (error: any) {
            setStatus('error');
            setMessage(error.message || 'Failed to verify email. The link may be invalid or expired.');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
                    {/* Icon */}
                    <div className="flex justify-center mb-6">
                        {status === 'verifying' && (
                            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                            </div>
                        )}
                        {status === 'success' && (
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-10 h-10 text-green-600" />
                            </div>
                        )}
                        {status === 'error' && (
                            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                                <XCircle className="w-10 h-10 text-red-600" />
                            </div>
                        )}
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl font-bold text-center mb-4 text-gray-900">
                        {status === 'verifying' && 'Verifying Email...'}
                        {status === 'success' && 'Email Verified!'}
                        {status === 'error' && 'Verification Failed'}
                    </h1>

                    {/* Message */}
                    <p className="text-center text-gray-600 mb-6">
                        {status === 'verifying' && 'Please wait while we verify your email address...'}
                        {status === 'success' && message}
                        {status === 'error' && message}
                    </p>

                    {/* Success Details */}
                    {status === 'success' && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                            <div className="flex items-start space-x-3">
                                <Mail className="w-5 h-5 text-green-600 mt-0.5" />
                                <div className="flex-1">
                                    <h3 className="font-semibold text-green-900 mb-1">What's Next?</h3>
                                    <p className="text-sm text-green-800 mb-2">
                                        You can now sign in to complete your onboarding.
                                    </p>
                                    {username && (
                                        <p className="text-sm text-green-700">
                                            <strong>Username:</strong> {username}
                                        </p>
                                    )}
                                    <p className="text-xs text-green-600 mt-2">
                                        Redirecting to sign-in page in 3 seconds...
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Error Actions */}
                    {status === 'error' && (
                        <div className="space-y-3">
                            <button
                                onClick={() => router.push('/management/sign-up')}
                                className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors"
                            >
                                Back to Sign Up
                            </button>
                            <button
                                onClick={() => router.push('/management/sign-in')}
                                className="w-full bg-white text-purple-600 border-2 border-purple-200 py-3 rounded-xl font-semibold hover:bg-purple-50 transition-colors"
                            >
                                Go to Sign In
                            </button>
                        </div>
                    )}

                    {/* Success Action */}
                    {status === 'success' && (
                        <button
                            onClick={() => router.push('/management/sign-in')}
                            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg"
                        >
                            Continue to Sign In
                        </button>
                    )}
                </div>

                {/* Footer */}
                <p className="text-center text-sm text-gray-500 mt-6">
                    Need help? <a href="/contact" className="text-purple-600 hover:underline">Contact Support</a>
                </p>
            </div>
        </div>
    );
}
