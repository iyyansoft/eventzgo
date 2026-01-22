'use client';

import { SignIn } from '@clerk/nextjs';
import Image from 'next/image';
import { Shield } from 'lucide-react';

export default function AdminSignInPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo and Header */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center mb-6">
                        <div className="bg-red-600 p-4 rounded-2xl shadow-2xl">
                            <Shield className="w-12 h-12 text-white" />
                        </div>
                    </div>
                    <Image
                        src="/eventzgo-logo.svg"
                        alt="EventzGo Logo"
                        width={192}
                        height={40}
                        className="mx-auto mb-4"
                        priority
                    />
                    <h1 className="text-3xl font-bold text-white mb-2">Admin Portal</h1>
                    <p className="text-gray-400">Secure access for platform administrators</p>
                </div>

                {/* Clerk Sign In Component */}
                <div className="bg-white rounded-2xl shadow-2xl p-8">
                    <SignIn
                        appearance={{
                            elements: {
                                rootBox: 'w-full',
                                card: 'shadow-none',
                                headerTitle: 'hidden',
                                headerSubtitle: 'hidden',
                                socialButtonsBlockButton:
                                    'bg-white border-2 border-gray-200 hover:border-red-500 hover:bg-red-50 transition-all duration-200',
                                socialButtonsBlockButtonText: 'font-semibold text-gray-700',
                                formButtonPrimary:
                                    'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 transition-all duration-200',
                                footerActionLink: 'text-red-600 hover:text-red-700',
                                identityPreviewEditButton: 'text-red-600 hover:text-red-700',
                                formFieldInput:
                                    'border-gray-300 focus:border-red-500 focus:ring-red-500',
                                otpCodeFieldInput:
                                    'border-gray-300 focus:border-red-500 focus:ring-red-500',
                            },
                        }}
                        redirectUrl="/admin/dashboard"
                        signUpUrl="/admin/sign-up"
                        afterSignInUrl="/admin/dashboard"
                    />
                </div>

                {/* Security Notice */}
                <div className="mt-6 text-center">
                    <p className="text-gray-400 text-sm">
                        🔒 This is a secure admin area. All actions are logged and monitored.
                    </p>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center text-gray-500 text-xs">
                    <p>EventzGo Admin Portal v1.0</p>
                    <p className="mt-1">© 2026 EventzGo. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
}
