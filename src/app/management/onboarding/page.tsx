// src/app/management/onboarding/page.tsx - COMPLETE VERSION
'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Building, Globe, MapPin, Phone, FileText, ArrowRight, CheckCircle, Upload, CreditCard, File } from 'lucide-react';
import Image from 'next/image';

export default function OnboardingPage() {
    const { user, isLoaded } = useUser();
    const router = useRouter();
    const registerOrganiser = useMutation(api.management.registerOrganiser);

    // Protect route - redirect if not authenticated or not organiser
    useEffect(() => {
        if (isLoaded && !user) {
            router.push('/management/sign-in');
        } else if (isLoaded && user) {
            const role = user.publicMetadata?.role as string;
            const onboardingCompleted = user.publicMetadata?.onboardingCompleted;
            const status = user.publicMetadata?.status;

            // Redirect if not organiser
            if (role && role !== 'organiser') {
                router.push('/management');
                return;
            }

            // Redirect if already completed onboarding
            if (onboardingCompleted) {
                if (status === 'approved') {
                    router.push('/management/organiser/dashboard');
                } else if (status === 'pending') {
                    router.push('/management/pending-approval');
                }
            }
        }
    }, [isLoaded, user, router]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [currentStep, setCurrentStep] = useState(1);

    const [formData, setFormData] = useState({
        // Institution Details
        institutionName: '',
        phone: user?.phoneNumbers[0]?.phoneNumber || '',

        // Address
        street: '',
        city: '',
        state: '',
        pincode: '',

        // Tax Details
        gstNumber: '',
        panNumber: '',
        tanNumber: '',

        // Bank Details
        accountHolderName: '',
        accountNumber: '',
        ifscCode: '',
        bankName: '',
        branchName: '',

        // Documents (will store URLs after upload)
        gstCertificate: '',
        panCard: '',
        cancelledCheque: '',
        bankStatement: '',
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // In production, upload to Convex storage or S3
        // For now, we'll create a placeholder URL
        const fileUrl = `uploaded/${file.name}`;

        setFormData(prev => ({
            ...prev,
            [fieldName]: fileUrl,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (!user?.id) {
                throw new Error('User not authenticated');
            }

            // Register organiser in Convex with complete data
            await registerOrganiser({
                clerkId: user.id,
                institutionName: formData.institutionName,
                address: {
                    street: formData.street,
                    city: formData.city,
                    state: formData.state,
                    pincode: formData.pincode,
                },
                gstNumber: formData.gstNumber,
                panNumber: formData.panNumber,
                tanNumber: formData.tanNumber || undefined,
                bankDetails: {
                    accountHolderName: formData.accountHolderName,
                    accountNumber: formData.accountNumber,
                    ifscCode: formData.ifscCode,
                    bankName: formData.bankName,
                    branchName: formData.branchName,
                },
                documents: {
                    gstCertificate: formData.gstCertificate || undefined,
                    panCard: formData.panCard || undefined,
                    cancelledCheque: formData.cancelledCheque || undefined,
                    bankStatement: formData.bankStatement || undefined,
                },
            });

            // Update Clerk metadata
            await user.update({
                unsafeMetadata: {
                    ...user.unsafeMetadata,
                    onboardingCompleted: true,
                },
            });

            // Redirect to pending approval page
            router.push('/management/pending-approval');
        } catch (err: any) {
            setError(err.message || 'Failed to complete onboarding');
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        { number: 1, title: 'Institution Info', icon: Building },
        { number: 2, title: 'Tax Details', icon: FileText },
        { number: 3, title: 'Bank Details', icon: CreditCard },
        { number: 4, title: 'Documents', icon: File },
    ];

    const isStep1Valid = formData.institutionName && formData.phone && formData.street && formData.city && formData.state && formData.pincode;
    const isStep2Valid = formData.gstNumber && formData.panNumber;
    const isStep3Valid = formData.accountHolderName && formData.accountNumber && formData.ifscCode && formData.bankName && formData.branchName;
    const isStep4Valid = formData.gstCertificate && formData.panCard && formData.cancelledCheque;

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <Image
                        src="/eventzgo_logo.png"
                        alt="EventzGo"
                        width={80}
                        height={80}
                        className="h-16 w-auto mx-auto mb-4"
                    />
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Profile</h1>
                    <p className="text-gray-600 mb-4">Provide your organization details to get started</p>

                    {/* Role Badge */}
                    <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-full shadow-lg">
                        <span className="text-2xl">
                            {user?.publicMetadata?.role === 'organiser' && '🏢'}
                            {user?.publicMetadata?.role === 'vendor' && '🛠️'}
                            {user?.publicMetadata?.role === 'speaker' && '🎤'}
                            {user?.publicMetadata?.role === 'sponsor' && '💰'}
                        </span>
                        <div className="text-left">
                            <p className="text-xs font-medium opacity-90">Signing up as</p>
                            <p className="text-sm font-bold">
                                {user?.publicMetadata?.role === 'organiser' && 'Event Organiser'}
                                {user?.publicMetadata?.role === 'vendor' && 'Service Vendor'}
                                {user?.publicMetadata?.role === 'speaker' && 'Professional Speaker'}
                                {user?.publicMetadata?.role === 'sponsor' && 'Event Sponsor'}
                            </p>
                        </div>
                    </div>

                    {/* User Info Card */}
                    {user && (
                        <div className="mt-6 bg-white rounded-xl shadow-md p-4 max-w-md mx-auto border border-purple-100">
                            <div className="flex items-center justify-center space-x-3">
                                {user.imageUrl && (
                                    <Image
                                        src={user.imageUrl}
                                        alt={user.fullName || 'User'}
                                        width={48}
                                        height={48}
                                        className="rounded-full"
                                    />
                                )}
                                <div className="text-left">
                                    <p className="text-sm font-semibold text-gray-900">
                                        {user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User'}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        ID: <span className="font-mono">{user.id}</span>
                                    </p>
                                    {user.primaryEmailAddress && (
                                        <p className="text-xs text-gray-500">
                                            {user.primaryEmailAddress.emailAddress}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Progress Steps */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        {steps.map((step, index) => {
                            const Icon = step.icon;
                            const isActive = currentStep === step.number;
                            const isCompleted = currentStep > step.number;

                            return (
                                <React.Fragment key={step.number}>
                                    <div className="flex flex-col items-center flex-1">
                                        <div
                                            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${isCompleted
                                                ? 'bg-green-500 text-white'
                                                : isActive
                                                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                                                    : 'bg-gray-200 text-gray-500'
                                                }`}
                                        >
                                            {isCompleted ? (
                                                <CheckCircle className="w-6 h-6" />
                                            ) : (
                                                <Icon className="w-6 h-6" />
                                            )}
                                        </div>
                                        <p className={`mt-2 text-xs font-medium ${isActive ? 'text-purple-600' : 'text-gray-500'}`}>
                                            {step.title}
                                        </p>
                                    </div>
                                    {index < steps.length - 1 && (
                                        <div className={`flex-1 h-1 mx-2 rounded-full ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`} />
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>

                {/* Form */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <form onSubmit={handleSubmit}>
                        {/* Step 1: Institution Info */}
                        {currentStep === 1 && (
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-4">Institution Information</h3>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Institution Name *
                                    </label>
                                    <div className="relative">
                                        <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            name="institutionName"
                                            value={formData.institutionName}
                                            onChange={handleInputChange}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            placeholder="Your Institution Name"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Phone Number *
                                    </label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            placeholder="+91 1234567890"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Street Address *
                                    </label>
                                    <input
                                        type="text"
                                        name="street"
                                        value={formData.street}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="Street Address"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            City *
                                        </label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            placeholder="City"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            State *
                                        </label>
                                        <input
                                            type="text"
                                            name="state"
                                            value={formData.state}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            placeholder="State"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Pincode *
                                    </label>
                                    <input
                                        type="text"
                                        name="pincode"
                                        value={formData.pincode}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="Pincode"
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        {/* Step 2: Tax Details */}
                        {currentStep === 2 && (
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-4">Tax Information</h3>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        GST Number *
                                    </label>
                                    <input
                                        type="text"
                                        name="gstNumber"
                                        value={formData.gstNumber}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="22AAAAA0000A1Z5"
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1">15-character GST Identification Number</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        PAN Number *
                                    </label>
                                    <input
                                        type="text"
                                        name="panNumber"
                                        value={formData.panNumber}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="ABCDE1234F"
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1">10-character PAN</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        TAN Number (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        name="tanNumber"
                                        value={formData.tanNumber}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="ABCD12345E"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Tax Deduction and Collection Account Number</p>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Bank Details */}
                        {currentStep === 3 && (
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-4">Bank Account Details</h3>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Account Holder Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="accountHolderName"
                                        value={formData.accountHolderName}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="As per bank account"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Account Number *
                                    </label>
                                    <input
                                        type="text"
                                        name="accountNumber"
                                        value={formData.accountNumber}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="Bank Account Number"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        IFSC Code *
                                    </label>
                                    <input
                                        type="text"
                                        name="ifscCode"
                                        value={formData.ifscCode}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="SBIN0001234"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Bank Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="bankName"
                                            value={formData.bankName}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            placeholder="Bank Name"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Branch Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="branchName"
                                            value={formData.branchName}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            placeholder="Branch Name"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Documents */}
                        {currentStep === 4 && (
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-4">Upload Documents</h3>

                                {[
                                    { name: 'gstCertificate', label: 'GST Certificate *', required: true },
                                    { name: 'panCard', label: 'PAN Card *', required: true },
                                    { name: 'cancelledCheque', label: 'Cancelled Cheque *', required: true },
                                    { name: 'bankStatement', label: 'Bank Statement (Optional)', required: false },
                                ].map((doc) => (
                                    <div key={doc.name}>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            {doc.label}
                                        </label>
                                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-purple-500 transition-colors duration-200">
                                            <input
                                                type="file"
                                                onChange={(e) => handleFileUpload(e, doc.name)}
                                                className="hidden"
                                                id={doc.name}
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                required={doc.required}
                                            />
                                            <label htmlFor={doc.name} className="cursor-pointer">
                                                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                                {formData[doc.name as keyof typeof formData] ? (
                                                    <p className="text-sm text-green-600 font-medium">
                                                        ✓ File uploaded
                                                    </p>
                                                ) : (
                                                    <>
                                                        <p className="text-sm text-gray-600">
                                                            Click to upload or drag and drop
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            PDF, JPG or PNG (max 10MB)
                                                        </p>
                                                    </>
                                                )}
                                            </label>
                                        </div>
                                    </div>
                                ))}

                                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                    <h4 className="font-medium text-blue-900 mb-2">What happens next?</h4>
                                    <ul className="space-y-1 text-sm text-blue-800">
                                        <li>• Your application will be reviewed by our admin team</li>
                                        <li>• You'll receive an email notification once approved</li>
                                        <li>• Approval typically takes 24-48 hours</li>
                                    </ul>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex items-center justify-between mt-8">
                            {currentStep > 1 && (
                                <button
                                    type="button"
                                    onClick={() => setCurrentStep(prev => prev - 1)}
                                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-gray-400 transition-all duration-200"
                                >
                                    Back
                                </button>
                            )}

                            {currentStep < 4 ? (
                                <button
                                    type="button"
                                    onClick={() => setCurrentStep(prev => prev + 1)}
                                    disabled={
                                        (currentStep === 1 && !isStep1Valid) ||
                                        (currentStep === 2 && !isStep2Valid) ||
                                        (currentStep === 3 && !isStep3Valid)
                                    }
                                    className="ml-auto flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span>Next Step</span>
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={loading || !isStep4Valid}
                                    className="ml-auto flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            <span>Submitting...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Submit Application</span>
                                            <CheckCircle className="w-5 h-5" />
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}