'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Shield, Lock, Key } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminSignInPage() {
    const router = useRouter();
    const [step, setStep] = useState<'credentials' | 'authCode'>('credentials');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [authCode, setAuthCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCredentialsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('/api/admin/verify-credentials', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                setStep('authCode');
            } else {
                setError(data.error || 'Invalid credentials');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleAuthCodeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('/api/admin/verify-auth-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, authCode }),
            });

            const data = await response.json();

            if (response.ok) {
                // Redirect to admin dashboard
                router.push('/admin/dashboard');
            } else {
                setError(data.error || 'Invalid authentication code');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

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
                        src="/eventzgo_logo.png"
                        alt="EventzGo Logo"
                        width={200}
                        height={60}
                        className="mx-auto mb-4"
                        priority
                    />
                    <h1 className="text-3xl font-bold text-white mb-2">Admin Portal</h1>
                    <p className="text-gray-400">Secure access for platform administrators</p>
                </div>

                {/* Sign In Form */}
                <div className="bg-white rounded-2xl shadow-2xl p-8">
                    {step === 'credentials' ? (
                        <form onSubmit={handleCredentialsSubmit} className="space-y-6">
                            <div>
                                <div className="flex items-center space-x-2 mb-6">
                                    <Lock className="w-5 h-5 text-red-600" />
                                    <h2 className="text-xl font-semibold text-gray-900">Sign In</h2>
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                                    Username
                                </label>
                                <input
                                    type="text"
                                    id="username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                                    placeholder="Enter admin username"
                                    required
                                    autoComplete="username"
                                />
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                                    placeholder="Enter password"
                                    required
                                    autoComplete="current-password"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-red-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-red-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Verifying...' : 'Continue'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleAuthCodeSubmit} className="space-y-6">
                            <div>
                                <div className="flex items-center space-x-2 mb-6">
                                    <Key className="w-5 h-5 text-red-600" />
                                    <h2 className="text-xl font-semibold text-gray-900">Authentication Code</h2>
                                </div>
                                <p className="text-sm text-gray-600 mb-4">
                                    Enter the 6-digit authentication code to complete sign-in.
                                </p>
                            </div>

                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label htmlFor="authCode" className="block text-sm font-medium text-gray-700 mb-2">
                                    Authentication Code
                                </label>
                                <input
                                    type="text"
                                    id="authCode"
                                    value={authCode}
                                    onChange={(e) => setAuthCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all text-center text-2xl tracking-widest font-mono"
                                    placeholder="000000"
                                    required
                                    maxLength={6}
                                    autoComplete="one-time-code"
                                />
                            </div>

                            <div className="flex space-x-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setStep('credentials');
                                        setAuthCode('');
                                        setError('');
                                    }}
                                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-all duration-200"
                                >
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading || authCode.length !== 6}
                                    className="flex-1 bg-gradient-to-r from-red-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-red-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Verifying...' : 'Sign In'}
                                </button>
                            </div>
                        </form>
                    )}
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
                    <p className="mt-1">© 2024 EventzGo. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
}
