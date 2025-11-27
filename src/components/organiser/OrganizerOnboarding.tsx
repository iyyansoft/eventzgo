"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Upload, Building, CreditCard, FileText, CheckCircle } from "lucide-react";

const OrganizerOnboarding = () => {
    const router = useRouter();
    const { user } = useUser();
    const createOrganiser = useMutation(api.organisers.createOrganiser);
    const userData = useQuery(
        api.users.getUserByClerkId,
        user ? { clerkId: user.id } : "skip"
    );

    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        institutionName: "",
        address: {
            street: "",
            city: "",
            state: "",
            pincode: "",
        },
        gstNumber: "",
        panNumber: "",
        tanNumber: "",
        bankDetails: {
            accountHolderName: "",
            accountNumber: "",
            ifscCode: "",
            bankName: "",
            branchName: "",
        },
        documents: {
            gstCertificate: "",
            panCard: "",
            cancelledCheque: "",
            bankStatement: "",
        },
    });

    const handleInputChange = (section: string, field: string, value: string) => {
        if (section === "root") {
            setFormData({ ...formData, [field]: value });
        } else {
            setFormData({
                ...formData,
                [section]: {
                    ...(formData[section as keyof typeof formData] as any),
                    [field]: value,
                },
            });
        }
    };

    const handleFileUpload = async (field: string, file: File) => {
        // TODO: Implement actual file upload to Cloudinary or your storage
        // For now, we'll use a placeholder URL
        const fakeUrl = `https://placeholder.com/${file.name}`;
        setFormData({
            ...formData,
            documents: {
                ...formData.documents,
                [field]: fakeUrl,
            },
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !userData) return;

        setIsSubmitting(true);
        try {
            await createOrganiser({
                userId: userData._id,
                clerkId: user.id,
                ...formData,
            });

            // Redirect to pending approval page
            router.push("/management/organizer/pending-approval");
        } catch (error) {
            console.error("Error creating organizer:", error);
            alert("Failed to submit application. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const steps = [
        { number: 1, title: "Institution Details", icon: Building },
        { number: 2, title: "Tax Information", icon: FileText },
        { number: 3, title: "Bank Details", icon: CreditCard },
        { number: 4, title: "Documents", icon: Upload },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        Organizer Registration
                    </h1>
                    <p className="text-gray-600">
                        Complete your profile to start creating events
                    </p>
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
                                    <div className="flex flex-col items-center">
                                        <div
                                            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${isCompleted
                                                ? "bg-green-500 text-white"
                                                : isActive
                                                    ? "bg-purple-600 text-white"
                                                    : "bg-gray-200 text-gray-500"
                                                }`}
                                        >
                                            {isCompleted ? (
                                                <CheckCircle className="w-6 h-6" />
                                            ) : (
                                                <Icon className="w-6 h-6" />
                                            )}
                                        </div>
                                        <span
                                            className={`text-xs mt-2 font-medium ${isActive ? "text-purple-600" : "text-gray-500"
                                                }`}
                                        >
                                            {step.title}
                                        </span>
                                    </div>
                                    {index < steps.length - 1 && (
                                        <div
                                            className={`flex-1 h-1 mx-4 rounded transition-all duration-300 ${currentStep > step.number
                                                ? "bg-green-500"
                                                : "bg-gray-200"
                                                }`}
                                        />
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div className="bg-white rounded-2xl shadow-xl p-8">
                        {/* Step 1: Institution Details */}
                        {currentStep === 1 && (
                            <div className="space-y-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                    Institution Details
                                </h2>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Institution Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.institutionName}
                                        onChange={(e) =>
                                            handleInputChange("root", "institutionName", e.target.value)
                                        }
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="Enter your institution name"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Street Address *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.address.street}
                                            onChange={(e) =>
                                                handleInputChange("address", "street", e.target.value)
                                            }
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            placeholder="Street address"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            City *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.address.city}
                                            onChange={(e) =>
                                                handleInputChange("address", "city", e.target.value)
                                            }
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            placeholder="City"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            State *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.address.state}
                                            onChange={(e) =>
                                                handleInputChange("address", "state", e.target.value)
                                            }
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            placeholder="State"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Pincode *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.address.pincode}
                                            onChange={(e) =>
                                                handleInputChange("address", "pincode", e.target.value)
                                            }
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            placeholder="Pincode"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Tax Information */}
                        {currentStep === 2 && (
                            <div className="space-y-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                    Tax Information
                                </h2>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        GST Number *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.gstNumber}
                                        onChange={(e) =>
                                            handleInputChange("root", "gstNumber", e.target.value)
                                        }
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="22AAAAA0000A1Z5"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        PAN Number *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.panNumber}
                                        onChange={(e) =>
                                            handleInputChange("root", "panNumber", e.target.value)
                                        }
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="ABCDE1234F"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        TAN Number (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.tanNumber}
                                        onChange={(e) =>
                                            handleInputChange("root", "tanNumber", e.target.value)
                                        }
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="ABCD12345E"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Step 3: Bank Details */}
                        {currentStep === 3 && (
                            <div className="space-y-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                    Bank Details
                                </h2>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Account Holder Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.bankDetails.accountHolderName}
                                        onChange={(e) =>
                                            handleInputChange(
                                                "bankDetails",
                                                "accountHolderName",
                                                e.target.value
                                            )
                                        }
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="Account holder name"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Account Number *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.bankDetails.accountNumber}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "bankDetails",
                                                    "accountNumber",
                                                    e.target.value
                                                )
                                            }
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            placeholder="Account number"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            IFSC Code *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.bankDetails.ifscCode}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "bankDetails",
                                                    "ifscCode",
                                                    e.target.value
                                                )
                                            }
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            placeholder="IFSC code"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Bank Name *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.bankDetails.bankName}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "bankDetails",
                                                    "bankName",
                                                    e.target.value
                                                )
                                            }
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            placeholder="Bank name"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Branch Name *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.bankDetails.branchName}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "bankDetails",
                                                    "branchName",
                                                    e.target.value
                                                )
                                            }
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            placeholder="Branch name"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Documents */}
                        {currentStep === 4 && (
                            <div className="space-y-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                    Upload Documents
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {[
                                        { key: "gstCertificate", label: "GST Certificate" },
                                        { key: "panCard", label: "PAN Card" },
                                        { key: "cancelledCheque", label: "Cancelled Cheque" },
                                        { key: "bankStatement", label: "Bank Statement" },
                                    ].map((doc) => (
                                        <div key={doc.key}>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                {doc.label}
                                            </label>
                                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-500 transition-colors">
                                                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                                <input
                                                    type="file"
                                                    accept=".pdf,.jpg,.jpeg,.png"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) handleFileUpload(doc.key, file);
                                                    }}
                                                    className="hidden"
                                                    id={doc.key}
                                                />
                                                <label
                                                    htmlFor={doc.key}
                                                    className="cursor-pointer text-sm text-purple-600 hover:text-purple-700"
                                                >
                                                    Click to upload
                                                </label>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    PDF, JPG, PNG (Max 5MB)
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                                disabled={currentStep === 1}
                                className={`px-6 py-3 rounded-lg font-medium transition-colors ${currentStep === 1
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                    }`}
                            >
                                Previous
                            </button>

                            {currentStep < 4 ? (
                                <button
                                    type="button"
                                    onClick={() => setCurrentStep(currentStep + 1)}
                                    className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
                                >
                                    Next
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? "Submitting..." : "Submit Application"}
                                </button>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default OrganizerOnboarding;
