"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
    ArrowLeft,
    Loader2,
    Shield,
    AlertTriangle,
    Mail,
    Lock,
    User,
    Building,
    Phone,
    CheckCircle,
    Sparkles,
    Eye,
    EyeOff
} from "lucide-react";

export default function SignUpPage() {
    const router = useRouter();
    const signUp = useAction(api.auth.authActions.signUpAction);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [isVerificationSent, setIsVerificationSent] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        companyName: "",
        phone: "",
    });

    const strength = {
        hasUpper: /[A-Z]/.test(formData.password),
        hasNumber: /[0-9]/.test(formData.password),
        hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
        isLength: formData.password.length >= 8
    };

    const isPasswordValid = Object.values(strength).every(Boolean);
    const passwordsMatch = formData.password === formData.confirmPassword && formData.password !== "";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        e.preventDefault();
        setError("");

        if (!isPasswordValid) {
            setError("Please ensure your password meets all strength requirements.");
            return;
        }

        if (!passwordsMatch) {
            setError("Passwords do not match.");
            return;
        }

        setIsLoading(true);

        try {
            const result = await signUp({
                username: formData.username,
                email: formData.email,
                password: formData.password,
                companyName: formData.companyName,
                phone: formData.phone || undefined,
            });

            if (result.success) {
                // Sign-up always requires email verification
                setIsVerificationSent(true);
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Failed to create account. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900 flex flex-col relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                <div className="absolute top-40 right-10 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            {/* Header */}
            <div className="relative z-10 w-full bg-white/10 backdrop-blur-md border-b border-white/20 py-4 px-6">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Image
                            src="/eventzgo_logo.png"
                            alt="EventzGo"
                            width={192}
                            height={40}
                            className="h-10 w-auto brightness-0 invert"
                            priority
                        />
                    </div>

                    <button
                        onClick={() => router.push("/management")}
                        className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors duration-200"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm font-medium">Back to Home</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex-1 flex items-center justify-center p-4 py-12">
                <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">

                    {/* Left Side - Branding */}
                    <div className="hidden md:block text-white space-y-8">
                        <div className="space-y-4">
                            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                                <Sparkles className="w-4 h-4 text-yellow-300" />
                                <span className="text-sm font-semibold">Enterprise-Grade Security</span>
                            </div>

                            <h1 className="text-5xl font-bold leading-tight">
                                Start Your Journey
                                <br />
                                <span className="bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
                                    With EventzGo
                                </span>
                            </h1>

                            <p className="text-xl text-white/80">
                                Join thousands of event organisers who trust EventzGo for their event management needs.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-start space-x-3">
                                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                                    <CheckCircle className="w-5 h-5 text-green-300" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">Secure & Compliant</h3>
                                    <p className="text-white/70 text-sm">Bank-grade encryption with complete audit trails</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                                    <Shield className="w-5 h-5 text-blue-300" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">Rate Limiting Protection</h3>
                                    <p className="text-white/70 text-sm">Advanced security against brute force attacks</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                                    <Sparkles className="w-5 h-5 text-purple-300" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">Real-time Analytics</h3>
                                    <p className="text-white/70 text-sm">Track bookings, revenue, and attendees in real-time</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Sign Up Form */}
                    <div className="w-full">
                        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden p-8">
                            {isVerificationSent ? (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle className="w-8 h-8 text-green-600" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h2>
                                    <p className="text-gray-600 mb-4">
                                        We've sent a verification link to:
                                    </p>

                                    {/* Email Display Box */}
                                    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
                                        <div className="flex items-center justify-center space-x-2">
                                            <Mail className="w-5 h-5 text-blue-600" />
                                            <p className="text-lg font-bold text-blue-900">
                                                {formData.email}
                                            </p>
                                        </div>
                                    </div>

                                    <p className="text-sm text-gray-500 mb-6">
                                        Please check your inbox (and spam folder) and click the verification link to continue.
                                    </p>

                                    <Link
                                        href="/management/sign-in"
                                        className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 px-8 rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition-all"
                                    >
                                        Proceed to Login
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="text-center">
                                        <div className="inline-flex items-center space-x-2 bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-full mb-4">
                                            <Shield className="w-4 h-4" />
                                            <span className="text-xs font-semibold">Join 1000+ Organisers</span>
                                        </div>
                                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                            Create Account
                                        </h2>
                                        <p className="text-gray-600">
                                            Start managing your events professionally
                                        </p>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        {/* Company Name */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                                Company / Institution
                                            </label>
                                            <div className="relative">
                                                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input
                                                    type="text"
                                                    required
                                                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all"
                                                    placeholder="Organization Name"
                                                    value={formData.companyName}
                                                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        {/* Username & Phone (Grid) */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                                    Username
                                                </label>
                                                <div className="relative">
                                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                    <input
                                                        type="text"
                                                        required
                                                        className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all"
                                                        placeholder="Username"
                                                        value={formData.username}
                                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                                    Phone
                                                </label>
                                                <div className="relative">
                                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                    <input
                                                        type="tel"
                                                        className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all"
                                                        placeholder="Optional"
                                                        value={formData.phone}
                                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Email */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                                Email Address
                                            </label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input
                                                    type="email"
                                                    required
                                                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all"
                                                    placeholder="you@company.com"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        {/* Password */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                                Password
                                            </label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    required
                                                    className={`w-full pl-11 pr-12 py-3 border-2 rounded-xl transition-all ${isPasswordValid ? 'border-green-200 focus:border-green-500 focus:ring-green-100' : 'border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100'}`}
                                                    placeholder="Min 8 chars"
                                                    value={formData.password}
                                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                                >
                                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                                </button>
                                            </div>

                                            {/* Password Strength Checklist */}
                                            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                                                <div className={`flex items-center space-x-1 ${strength.isLength ? 'text-green-600' : 'text-gray-400'}`}>
                                                    {strength.isLength ? <CheckCircle className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border border-gray-300"></div>}
                                                    <span>Min 8 characters</span>
                                                </div>
                                                <div className={`flex items-center space-x-1 ${strength.hasUpper ? 'text-green-600' : 'text-gray-400'}`}>
                                                    {strength.hasUpper ? <CheckCircle className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border border-gray-300"></div>}
                                                    <span>Uppercase letter</span>
                                                </div>
                                                <div className={`flex items-center space-x-1 ${strength.hasNumber ? 'text-green-600' : 'text-gray-400'}`}>
                                                    {strength.hasNumber ? <CheckCircle className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border border-gray-300"></div>}
                                                    <span>Number</span>
                                                </div>
                                                <div className={`flex items-center space-x-1 ${strength.hasSpecial ? 'text-green-600' : 'text-gray-400'}`}>
                                                    {strength.hasSpecial ? <CheckCircle className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border border-gray-300"></div>}
                                                    <span>Special character</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Confirm Password */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                                Confirm Password
                                            </label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    required
                                                    className={`w-full pl-11 pr-12 py-3 border-2 rounded-xl transition-all ${passwordsMatch ? 'border-green-200 focus:border-green-500 focus:ring-green-100' : 'border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100'}`}
                                                    placeholder="Re-enter password"
                                                    value={formData.confirmPassword}
                                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        {/* Error Message */}
                                        {error && (
                                            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                                                <div className="flex items-start space-x-3">
                                                    <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                                    <div className="flex-1">
                                                        <p className="text-sm font-semibold text-red-800 mb-1">Registration Failed</p>
                                                        <p className="text-sm text-red-700">{error}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Submit Button */}
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3.5 px-6 rounded-xl hover:shadow-xl transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    <span>Creating Account...</span>
                                                </>
                                            ) : (
                                                <span>Sign Up</span>
                                            )}
                                        </button>

                                        {/* Sign In Link */}
                                        <div className="mt-6 text-center pt-4 border-t border-gray-100">
                                            <p className="text-sm text-gray-600">
                                                Already have an account?{' '}
                                                <Link
                                                    href="/management/sign-in"
                                                    className="inline-block font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-80 transition-opacity"
                                                >
                                                    Sign In
                                                </Link>
                                            </p>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </div>

                        {/* Security Badge */}
                        <div className="mt-6 text-center">
                            <div className="inline-flex items-center space-x-2 text-white/80 text-sm">
                                <Shield className="w-4 h-4" />
                                <span>Protected by enterprise-grade security • Rate limiting active • Audit logging enabled</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="relative z-10 w-full bg-white/10 backdrop-blur-md border-t border-white/20 py-4 px-6">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-white/60 text-sm">
                    <p>© 2024 EventzGo. All rights reserved.</p>
                    <div className="flex items-center space-x-4 mt-2 sm:mt-0">
                        <button className="hover:text-white transition-colors">Privacy</button>
                        <button className="hover:text-white transition-colors">Terms</button>
                        <button className="hover:text-white transition-colors">Help</button>
                    </div>
                </div>
            </div>
            <style jsx>{`
            /* Animations (Same as before) */
            @keyframes blob { 0% { transform: translate(0px, 0px) scale(1); } 33% { transform: translate(30px, -50px) scale(1.1); } 66% { transform: translate(-20px, 20px) scale(0.9); } 100% { transform: translate(0px, 0px) scale(1); } }
            .animate-blob { animation: blob 7s infinite; }
            .animation-delay-2000 { animation-delay: 2s; }
            .animation-delay-4000 { animation-delay: 4s; }
            `}</style>
        </div>
    );
}