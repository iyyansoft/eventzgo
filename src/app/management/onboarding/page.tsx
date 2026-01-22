// src/app/management/onboarding/page.tsx - ENHANCED VERSION
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Building, Phone, FileText, ArrowRight, CheckCircle, Upload, CreditCard, File, AlertCircle, Check, X, Loader2, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import { indianStates, citiesByState } from '@/data/indianStates';

// Disable static generation for this page
export const dynamic = 'force-dynamic';

interface GSTData {
    legalName: string;
    tradeName: string;
    address: {
        street: string;
        city: string;
        state: string;
        pincode: string;
    };
    panNumber: string;
    verified: boolean;
}

function OnboardingContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const role = searchParams.get('role') || 'organiser';
    const registerOrganiser = useMutation(api.roleBasedAuth.registerOrganiser);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [currentStep, setCurrentStep] = useState(1);
    const [gstVerifying, setGstVerifying] = useState(false);
    const [gstData, setGstData] = useState<GSTData | null>(null);
    const [uploadingDocs, setUploadingDocs] = useState<Record<string, boolean>>({});

    const [formData, setFormData] = useState({
        // Institution Details
        institutionName: '',
        contactPerson: '',
        email: '',
        phone: '',

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

        // Documents (Cloudinary URLs)
        gstCertificate: '',
        panCardFront: '',
        panCardBack: '',
        cancelledCheque: '',
        bankStatement: '',
    });

    // Track uploaded filenames (for display)
    const [uploadedFiles, setUploadedFiles] = useState<Record<string, string>>({
        gstCertificate: '',
        panCardFront: '',
        panCardBack: '',
        cancelledCheque: '',
        bankStatement: '',
    });

    // Track bank proof type selection
    const [bankProofType, setBankProofType] = useState<'cheque' | 'statement'>('cheque');

    // Load saved form data on mount
    useEffect(() => {
        // Check for pre-filled data from sign-up form
        const prefilledData = localStorage.getItem('prefilledSignUpData');
        if (prefilledData) {
            const parsed = JSON.parse(prefilledData);
            setFormData(prev => ({
                ...prev,
                institutionName: parsed.institutionName || prev.institutionName,
                contactPerson: parsed.contactPerson || prev.contactPerson,
                email: parsed.email || prev.email,
                phone: parsed.phone || prev.phone,
            }));
            // Clear prefilled data after using it
            localStorage.removeItem('prefilledSignUpData');
        }

        // Load saved form data (for resuming)
        const savedFormData = localStorage.getItem('onboardingFormData');
        const savedUploadedFiles = localStorage.getItem('onboardingUploadedFiles');
        const savedBankProofType = localStorage.getItem('onboardingBankProofType');
        const savedCurrentStep = localStorage.getItem('onboardingCurrentStep');

        if (savedFormData) {
            setFormData(JSON.parse(savedFormData));
        }
        if (savedUploadedFiles) {
            setUploadedFiles(JSON.parse(savedUploadedFiles));
        }
        if (savedBankProofType) {
            setBankProofType(savedBankProofType as 'cheque' | 'statement');
        }
        if (savedCurrentStep) {
            setCurrentStep(parseInt(savedCurrentStep));
        }
    }, []);

    // Save form data to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('onboardingFormData', JSON.stringify(formData));
    }, [formData]);

    useEffect(() => {
        localStorage.setItem('onboardingUploadedFiles', JSON.stringify(uploadedFiles));
    }, [uploadedFiles]);

    useEffect(() => {
        localStorage.setItem('onboardingBankProofType', bankProofType);
    }, [bankProofType]);

    useEffect(() => {
        localStorage.setItem('onboardingCurrentStep', currentStep.toString());
    }, [currentStep]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFormData(prev => ({
            ...prev,
            state: e.target.value,
            city: '', // Reset city when state changes
        }));
    };

    const verifyGST = async () => {
        if (!formData.gstNumber || formData.gstNumber.length !== 15) {
            alert('Please enter a valid 15-character GST number');
            return;
        }

        setGstVerifying(true);
        try {
            const response = await fetch('/api/verify-gst', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ gstNumber: formData.gstNumber }),
            });

            const result = await response.json();

            if (result.success) {
                setGstData(result.data);

                // Auto-fill form with GST data
                setFormData(prev => ({
                    ...prev,
                    institutionName: result.data.legalName,
                    street: result.data.address.street,
                    city: result.data.address.city,
                    state: result.data.address.state,
                    pincode: result.data.address.pincode,
                    panNumber: result.data.panNumber,
                }));

                alert('âœ… GST verified! Form auto-filled with GST data.');
            } else {
                alert('âŒ Failed to verify GST number');
            }
        } catch (error) {
            console.error('GST verification error:', error);
            alert('âŒ Error verifying GST number');
        } finally {
            setGstVerifying(false);
        }
    };

    const verifyIFSC = async (ifscCode: string) => {
        if (!ifscCode || ifscCode.length !== 11) return;

        setLoading(true);
        try {
            const response = await fetch(`/api/verify-ifsc?ifsc=${ifscCode.toUpperCase()}`);
            const result = await response.json();

            if (result.success) {
                setFormData(prev => ({
                    ...prev,
                    bankName: result.data.bank,
                    branchName: result.data.branch,
                }));
                alert(`âœ… Bank details fetched!\nBank: ${result.data.bank}\nBranch: ${result.data.branch}`);
            } else {
                alert('âŒ Invalid IFSC code');
            }
        } catch (error) {
            console.error('IFSC verification error:', error);
            alert('âŒ Error verifying IFSC code');
        } finally {
            setLoading(false);
        }
    };

    const uploadToCloudinary = async (file: File, fieldName: string) => {
        setUploadingDocs(prev => ({ ...prev, [fieldName]: true }));

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('folder', 'eventzgo/documents');

            const response = await fetch('/api/upload-document', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (result.success) {
                setFormData(prev => ({
                    ...prev,
                    [fieldName]: result.url,
                }));
                return result.url;
            } else {
                throw new Error(result.error || 'Upload failed');
            }
        } catch (error: any) {
            console.error('Upload error:', error);
            alert(`Failed to upload ${fieldName}: ${error.message}`);
            return null;
        } finally {
            setUploadingDocs(prev => ({ ...prev, [fieldName]: false }));
        }
    };

    const handleFileUpload = async (
        e: React.ChangeEvent<HTMLInputElement>,
        fieldName: string,
        allowedTypes: ('image' | 'pdf')[] = ['image', 'pdf']
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('File size must be less than 5MB');
            e.target.value = ''; // Clear input
            return;
        }

        // Validate file type
        const fileType = file.type;
        const isValid = allowedTypes.some(type => {
            if (type === 'image') {
                return fileType.startsWith('image/');
            }
            if (type === 'pdf') {
                return fileType === 'application/pdf';
            }
            return false;
        });

        if (!isValid) {
            const formats = allowedTypes.map(t =>
                t === 'image' ? 'Image (JPG, PNG)' : 'PDF'
            ).join(' or ');
            alert(`Please upload ${formats} format only`);
            e.target.value = ''; // Clear input
            return;
        }

        // Upload to Cloudinary
        const url = await uploadToCloudinary(file, fieldName);

        if (url) {
            // Store filename for display (hide Cloudinary URL)
            setUploadedFiles(prev => ({
                ...prev,
                [fieldName]: file.name
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Register organiser in Convex
            await registerOrganiser({
                companyName: formData.institutionName,
                contactPerson: formData.contactPerson,
                email: formData.email,
                phone: formData.phone,
                onboardingData: {
                    ...formData,
                    bankProofType: bankProofType,
                    gstVerified: gstData?.verified || false,
                    gstData: gstData,
                },
            });

            // Show success message
            alert('âœ… Registration successful! Your account is pending admin approval. You will receive an email with your login credentials once approved.');

            // Clear saved form data from localStorage
            localStorage.removeItem('onboardingFormData');
            localStorage.removeItem('onboardingUploadedFiles');
            localStorage.removeItem('onboardingBankProofType');
            localStorage.removeItem('onboardingCurrentStep');

            // Redirect to home
            router.push('/management');
        } catch (err: any) {
            // Check if it's a duplicate email error
            if (err.message && err.message.includes('already exists')) {
                setError('âš ï¸ This email address is already registered. Please use a different email or contact support if you need help accessing your account.');
            } else {
                setError(err.message || 'Failed to complete registration. Please try again.');
            }

            // Scroll to top to show error message
            window.scrollTo({ top: 0, behavior: 'smooth' });
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

    const isStep1Valid = formData.institutionName && formData.contactPerson && formData.email && formData.phone && formData.street && formData.city && formData.state && formData.pincode;
    const isStep2Valid = formData.gstNumber && formData.panNumber;
    const isStep3Valid = formData.accountHolderName && formData.accountNumber && formData.ifscCode && formData.bankName && formData.branchName;
    const isStep4Valid =
        formData.gstCertificate &&
        formData.panCardFront &&
        formData.panCardBack &&
        (formData.cancelledCheque || formData.bankStatement);

    const getRoleEmoji = (role: string) => {
        const emojiMap: Record<string, string> = {
            organiser: "ðŸ¢",
            vendor: "ðŸ› ï¸",
            speaker: "ðŸŽ¤",
            sponsor: "ðŸ’°",
        };
        return emojiMap[role] || "ðŸ‘¤";
    };

    const getRoleTitle = (role: string) => {
        const titleMap: Record<string, string> = {
            organiser: "Event Organiser",
            vendor: "Service Vendor",
            speaker: "Professional Speaker",
            sponsor: "Event Sponsor",
        };
        return titleMap[role] || "Management";
    };

    const checkDataMatch = (field: keyof typeof formData) => {
        if (!gstData) return null;

        const fieldMap: Record<string, string> = {
            institutionName: gstData.legalName,
            street: gstData.address.street,
            city: gstData.address.city,
            state: gstData.address.state,
            pincode: gstData.address.pincode,
            panNumber: gstData.panNumber,
        };

        if (fieldMap[field]) {
            return formData[field] === fieldMap[field];
        }
        return null;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex flex-col">
            {/* Header with Back to Home Button */}
            <div className="w-full bg-white/80 backdrop-blur-md border-b border-gray-200 py-4 px-6">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Image
                            src="/eventzgo_logo.png"
                            alt="EventzGo"
                            width={192}
                            height={40}
                            className="h-10 w-auto"
                            priority
                        />
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">EventzGo</h1>
                            <p className="text-xs text-gray-600">Management Portal</p>
                        </div>
                    </div>

                    <button
                        onClick={() => router.push('/management')}
                        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm font-medium">Back to Home</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-8">

                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Profile</h1>
                        <p className="text-gray-600 mb-4">Provide your organization details to get started</p>

                        {/* Role Badge */}
                        <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-full shadow-lg">
                            <span className="text-2xl">{getRoleEmoji(role)}</span>
                            <div className="text-left">
                                <p className="text-xs font-medium opacity-90">Signing up as</p>
                                <p className="text-sm font-bold">{getRoleTitle(role)}</p>
                            </div>
                        </div>
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

                                    {/* GST Warning */}
                                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                                        <div className="flex">
                                            <AlertCircle className="w-5 h-5 text-yellow-400 mr-3" />
                                            <div>
                                                <p className="text-sm font-medium text-yellow-800">
                                                    Important: Use the same information as registered in your GST certificate
                                                </p>
                                                <p className="text-xs text-yellow-700 mt-1">
                                                    This ensures faster verification and approval
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Institution/Company Name *
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                name="institutionName"
                                                value={formData.institutionName}
                                                onChange={handleInputChange}
                                                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent ${checkDataMatch('institutionName') === false ? 'border-red-500' :
                                                    checkDataMatch('institutionName') === true ? 'border-green-500' : 'border-gray-300'
                                                    }`}
                                                placeholder="Your Institution Name"
                                                required
                                            />
                                            {checkDataMatch('institutionName') !== null && (
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                    {checkDataMatch('institutionName') ? (
                                                        <Check className="w-5 h-5 text-green-500" />
                                                    ) : (
                                                        <X className="w-5 h-5 text-red-500" />
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        {checkDataMatch('institutionName') === false && (
                                            <p className="text-xs text-red-600 mt-1">
                                                âš ï¸ Doesn't match GST data: {gstData?.legalName}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Contact Person Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="contactPerson"
                                            value={formData.contactPerson}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            placeholder="Your Full Name"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email Address *
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            placeholder="your@email.com"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Phone Number *
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            placeholder="+91 1234567890"
                                            required
                                        />
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
                                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent ${checkDataMatch('street') === false ? 'border-red-500' :
                                                checkDataMatch('street') === true ? 'border-green-500' : 'border-gray-300'
                                                }`}
                                            placeholder="Street Address"
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                State *
                                            </label>
                                            <select
                                                name="state"
                                                value={formData.state}
                                                onChange={handleStateChange}
                                                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent ${checkDataMatch('state') === false ? 'border-red-500' :
                                                    checkDataMatch('state') === true ? 'border-green-500' : 'border-gray-300'
                                                    }`}
                                                required
                                            >
                                                <option value="">Select State</option>
                                                {indianStates.map(state => (
                                                    <option key={state.value} value={state.value}>
                                                        {state.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                City *
                                            </label>
                                            <select
                                                name="city"
                                                value={formData.city}
                                                onChange={handleInputChange}
                                                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent ${checkDataMatch('city') === false ? 'border-red-500' :
                                                    checkDataMatch('city') === true ? 'border-green-500' : 'border-gray-300'
                                                    }`}
                                                required
                                                disabled={!formData.state}
                                            >
                                                <option value="">Select City</option>
                                                {formData.state && citiesByState[formData.state]?.map(city => (
                                                    <option key={city} value={city}>
                                                        {city}
                                                    </option>
                                                ))}
                                            </select>
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
                                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent ${checkDataMatch('pincode') === false ? 'border-red-500' :
                                                checkDataMatch('pincode') === true ? 'border-green-500' : 'border-gray-300'
                                                }`}
                                            placeholder="Pincode"
                                            maxLength={6}
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
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                name="gstNumber"
                                                value={formData.gstNumber}
                                                onChange={handleInputChange}
                                                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent uppercase"
                                                placeholder="22AAAAA0000A1Z5"
                                                maxLength={15}
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={verifyGST}
                                                disabled={gstVerifying || formData.gstNumber.length !== 15}
                                                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                            >
                                                {gstVerifying ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                        Verifying...
                                                    </>
                                                ) : (
                                                    'Verify GST'
                                                )}
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">15-character GST Identification Number</p>

                                        {gstData && (
                                            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                                <p className="text-sm font-medium text-green-800 flex items-center gap-2">
                                                    <Check className="w-4 h-4" />
                                                    GST Verified Successfully
                                                </p>
                                                <p className="text-xs text-green-700 mt-1">
                                                    Company: {gstData.legalName}
                                                </p>
                                            </div>
                                        )}
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
                                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent uppercase ${checkDataMatch('panNumber') === false ? 'border-red-500' :
                                                checkDataMatch('panNumber') === true ? 'border-green-500' : 'border-gray-300'
                                                }`}
                                            placeholder="ABCDE1234F"
                                            maxLength={10}
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
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent uppercase"
                                            placeholder="ABCD12345E"
                                            maxLength={10}
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
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                name="ifscCode"
                                                value={formData.ifscCode}
                                                onChange={handleInputChange}
                                                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent uppercase"
                                                placeholder="SBIN0001234"
                                                maxLength={11}
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => verifyIFSC(formData.ifscCode)}
                                                disabled={loading || !formData.ifscCode || formData.ifscCode.length !== 11}
                                                className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
                                            >
                                                {loading ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                        Verifying...
                                                    </>
                                                ) : (
                                                    <>
                                                        <CreditCard className="w-4 h-4" />
                                                        Verify IFSC
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Click verify to auto-fill bank name and branch
                                        </p>
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


                                    {/* GST Certificate */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            GST Certificate (PDF or Image) *
                                        </label>
                                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-purple-500 transition-colors duration-200">
                                            <input
                                                type="file"
                                                onChange={(e) => handleFileUpload(e, 'gstCertificate', ['image', 'pdf'])}
                                                className="hidden"
                                                id="gstCertificate"
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                required
                                                disabled={uploadingDocs['gstCertificate']}
                                            />
                                            <label htmlFor="gstCertificate" className="cursor-pointer">
                                                {uploadingDocs['gstCertificate'] ? (
                                                    <div className="flex flex-col items-center">
                                                        <Loader2 className="w-8 h-8 text-purple-600 animate-spin mb-2" />
                                                        <p className="text-sm text-purple-600 font-medium">Uploading...</p>
                                                    </div>
                                                ) : formData.gstCertificate ? (
                                                    <div className="flex flex-col items-center">
                                                        <Check className="w-8 h-8 text-green-500 mb-2" />
                                                        <p className="text-sm text-green-600 font-medium">âœ“ Uploaded</p>
                                                        <p className="text-xs text-gray-600 mt-1">{uploadedFiles.gstCertificate}</p>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                                        <p className="text-sm text-gray-600">Click to upload</p>
                                                        <p className="text-xs text-gray-500 mt-1">PDF, JPG or PNG (max 5MB)</p>
                                                    </>
                                                )}
                                            </label>
                                        </div>
                                    </div>

                                    {/* PAN Card Front */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            PAN Card - Front (Image only) *
                                        </label>
                                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-purple-500 transition-colors duration-200">
                                            <input
                                                type="file"
                                                onChange={(e) => handleFileUpload(e, 'panCardFront', ['image'])}
                                                className="hidden"
                                                id="panCardFront"
                                                accept=".jpg,.jpeg,.png"
                                                required
                                                disabled={uploadingDocs['panCardFront']}
                                            />
                                            <label htmlFor="panCardFront" className="cursor-pointer">
                                                {uploadingDocs['panCardFront'] ? (
                                                    <div className="flex flex-col items-center">
                                                        <Loader2 className="w-8 h-8 text-purple-600 animate-spin mb-2" />
                                                        <p className="text-sm text-purple-600 font-medium">Uploading...</p>
                                                    </div>
                                                ) : formData.panCardFront ? (
                                                    <div className="flex flex-col items-center">
                                                        <Check className="w-8 h-8 text-green-500 mb-2" />
                                                        <p className="text-sm text-green-600 font-medium">âœ“ Uploaded</p>
                                                        <p className="text-xs text-gray-600 mt-1">{uploadedFiles.panCardFront}</p>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                                        <p className="text-sm text-gray-600">Click to upload</p>
                                                        <p className="text-xs text-gray-500 mt-1">JPG or PNG only (max 5MB)</p>
                                                    </>
                                                )}
                                            </label>
                                        </div>
                                    </div>

                                    {/* PAN Card Back */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            PAN Card - Back (Image only) *
                                        </label>
                                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-purple-500 transition-colors duration-200">
                                            <input
                                                type="file"
                                                onChange={(e) => handleFileUpload(e, 'panCardBack', ['image'])}
                                                className="hidden"
                                                id="panCardBack"
                                                accept=".jpg,.jpeg,.png"
                                                required
                                                disabled={uploadingDocs['panCardBack']}
                                            />
                                            <label htmlFor="panCardBack" className="cursor-pointer">
                                                {uploadingDocs['panCardBack'] ? (
                                                    <div className="flex flex-col items-center">
                                                        <Loader2 className="w-8 h-8 text-purple-600 animate-spin mb-2" />
                                                        <p className="text-sm text-purple-600 font-medium">Uploading...</p>
                                                    </div>
                                                ) : formData.panCardBack ? (
                                                    <div className="flex flex-col items-center">
                                                        <Check className="w-8 h-8 text-green-500 mb-2" />
                                                        <p className="text-sm text-green-600 font-medium">âœ“ Uploaded</p>
                                                        <p className="text-xs text-gray-600 mt-1">{uploadedFiles.panCardBack}</p>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                                        <p className="text-sm text-gray-600">Click to upload</p>
                                                        <p className="text-xs text-gray-500 mt-1">JPG or PNG only (max 5MB)</p>
                                                    </>
                                                )}
                                            </label>
                                        </div>
                                    </div>

                                    {/* Bank Proof Selection */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-3">
                                            Bank Verification (Choose One) *
                                        </label>
                                        <div className="flex gap-6 mb-4">
                                            <label className="flex items-center cursor-pointer">
                                                <input type="radio" value="cheque" checked={bankProofType === 'cheque'} onChange={() => setBankProofType('cheque')} className="mr-2" />
                                                <span className="text-sm">Cancelled Cheque</span>
                                            </label>
                                            <label className="flex items-center cursor-pointer">
                                                <input type="radio" value="statement" checked={bankProofType === 'statement'} onChange={() => setBankProofType('statement')} className="mr-2" />
                                                <span className="text-sm">Bank Statement (6 months)</span>
                                            </label>
                                        </div>
                                        {bankProofType === 'cheque' ? (
                                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-purple-500 transition-colors duration-200">
                                                <input type="file" onChange={(e) => handleFileUpload(e, 'cancelledCheque', ['image'])} className="hidden" id="cancelledCheque" accept=".jpg,.jpeg,.png" required disabled={uploadingDocs['cancelledCheque']} />
                                                <label htmlFor="cancelledCheque" className="cursor-pointer">
                                                    {uploadingDocs['cancelledCheque'] ? (
                                                        <div className="flex flex-col items-center">
                                                            <Loader2 className="w-8 h-8 text-purple-600 animate-spin mb-2" />
                                                            <p className="text-sm text-purple-600 font-medium">Uploading...</p>
                                                        </div>
                                                    ) : formData.cancelledCheque ? (
                                                        <div className="flex flex-col items-center">
                                                            <Check className="w-8 h-8 text-green-500 mb-2" />
                                                            <p className="text-sm text-green-600 font-medium">âœ“ Uploaded</p>
                                                            <p className="text-xs text-gray-600 mt-1">{uploadedFiles.cancelledCheque}</p>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                                            <p className="text-sm text-gray-600">Click to upload</p>
                                                            <p className="text-xs text-gray-500 mt-1">JPG or PNG only (max 5MB)</p>
                                                        </>
                                                    )}
                                                </label>
                                            </div>
                                        ) : (
                                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-purple-500 transition-colors duration-200">
                                                <input type="file" onChange={(e) => handleFileUpload(e, 'bankStatement', ['pdf'])} className="hidden" id="bankStatement" accept=".pdf" required disabled={uploadingDocs['bankStatement']} />
                                                <label htmlFor="bankStatement" className="cursor-pointer">
                                                    {uploadingDocs['bankStatement'] ? (
                                                        <div className="flex flex-col items-center">
                                                            <Loader2 className="w-8 h-8 text-purple-600 animate-spin mb-2" />
                                                            <p className="text-sm text-purple-600 font-medium">Uploading...</p>
                                                        </div>
                                                    ) : formData.bankStatement ? (
                                                        <div className="flex flex-col items-center">
                                                            <Check className="w-8 h-8 text-green-500 mb-2" />
                                                            <p className="text-sm text-green-600 font-medium">âœ“ Uploaded</p>
                                                            <p className="text-xs text-gray-600 mt-1">{uploadedFiles.bankStatement}</p>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                                            <p className="text-sm text-gray-600">Click to upload</p>
                                                            <p className="text-xs text-gray-500 mt-1">PDF only - Last 6 months (max 5MB)</p>
                                                        </>
                                                    )}
                                                </label>
                                            </div>
                                        )}
                                    </div>


                                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                        <h4 className="font-medium text-blue-900 mb-2">What happens next?</h4>
                                        <ul className="space-y-1 text-sm text-blue-800">
                                            <li>â€¢ Your application will be reviewed by our admin team</li>
                                            <li>â€¢ Documents will be verified against GST data</li>
                                            <li>â€¢ You'll receive an email with your login credentials once approved</li>
                                            <li>â€¢ Approval typically takes 24-48 hours</li>
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
                                        disabled={loading || !isStep4Valid || Object.values(uploadingDocs).some(v => v)}
                                        className="ml-auto flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
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
        </div>
    );
}

export default function OnboardingPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
            </div>
        }>
            <OnboardingContent />
        </Suspense>
    );
}
