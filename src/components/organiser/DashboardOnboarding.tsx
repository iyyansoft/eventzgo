"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
    Building, Phone, FileText, ArrowRight, CheckCircle, Upload,
    CreditCard, File, AlertCircle, Check, X, Loader2, Save
} from "lucide-react";
import { indianStates, citiesByState } from "@/data/indianStates";

interface Props {
    organiserId: Id<"organisers">;
    onComplete: () => void;
    onCancel?: () => void;
}

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

export default function DashboardOnboarding({ organiserId, onComplete, onCancel }: Props) {
    const existingOrganiser = useQuery(api.organisers.getOrganiserById, { organiserId });
    const updateOrganiser = useMutation(api.organisers.updateOrganiser);
    const submitForApproval = useMutation(api.organisers.submitForApproval);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [currentStep, setCurrentStep] = useState(1);
    const [gstVerifying, setGstVerifying] = useState(false);
    const [gstData, setGstData] = useState<GSTData | null>(null);
    const [uploadingDocs, setUploadingDocs] = useState<Record<string, boolean>>({});

    const [formData, setFormData] = useState({
        // Institution Details
        institutionName: "",
        contactPerson: "",
        email: "",
        phone: "",

        // Address
        street: "",
        city: "",
        state: "",
        pincode: "",

        // Tax Details
        gstNumber: "",
        panNumber: "",
        tanNumber: "",

        // Bank Details
        accountHolderName: "",
        accountNumber: "",
        ifscCode: "",
        bankName: "",
        branchName: "",

        // Documents (Cloudinary URLs)
        gstCertificate: "",
        panCardFront: "",
        panCardBack: "",
        cancelledCheque: "",
        bankStatement: "",
    });

    const [uploadedFiles, setUploadedFiles] = useState<Record<string, string>>({
        gstCertificate: "",
        panCardFront: "",
        panCardBack: "",
        cancelledCheque: "",
        bankStatement: "",
    });

    const [bankProofType, setBankProofType] = useState<"cheque" | "statement">("cheque");

    // Populate data from existing organiser
    useEffect(() => {
        if (existingOrganiser) {
            setFormData(prev => ({
                ...prev,
                institutionName: existingOrganiser.institutionName || prev.institutionName,
                contactPerson: existingOrganiser.contactPerson || prev.contactPerson,
                email: existingOrganiser.email || prev.email,
                phone: existingOrganiser.phone || prev.phone,

                street: existingOrganiser.address?.street || prev.street,
                city: existingOrganiser.address?.city || prev.city,
                state: existingOrganiser.address?.state || prev.state,
                pincode: existingOrganiser.address?.pincode || prev.pincode,

                gstNumber: existingOrganiser.gstNumber || prev.gstNumber,
                panNumber: existingOrganiser.panNumber || prev.panNumber,
                tanNumber: existingOrganiser.tanNumber || prev.tanNumber,

                accountHolderName: existingOrganiser.bankDetails?.accountHolderName || prev.accountHolderName,
                accountNumber: existingOrganiser.bankDetails?.accountNumber || prev.accountNumber,
                ifscCode: existingOrganiser.bankDetails?.ifscCode || prev.ifscCode,
                bankName: existingOrganiser.bankDetails?.bankName || prev.bankName,
                branchName: existingOrganiser.bankDetails?.branchName || prev.branchName,

                gstCertificate: existingOrganiser.documents?.gstCertificate || prev.gstCertificate,
                panCardFront: existingOrganiser.documents?.panCardFront || prev.panCardFront,
                panCardBack: existingOrganiser.documents?.panCardBack || prev.panCardBack,
                cancelledCheque: existingOrganiser.documents?.cancelledCheque || prev.cancelledCheque,
                bankStatement: existingOrganiser.documents?.bankStatement || prev.bankStatement,
            }));

            // Mark existing files
            const newUploadedFiles = { ...uploadedFiles };
            if (existingOrganiser.documents?.gstCertificate) newUploadedFiles.gstCertificate = "Existing Document Loaded";
            if (existingOrganiser.documents?.panCardFront) newUploadedFiles.panCardFront = "Existing Document Loaded";
            if (existingOrganiser.documents?.panCardBack) newUploadedFiles.panCardBack = "Existing Document Loaded";
            if (existingOrganiser.documents?.cancelledCheque) newUploadedFiles.cancelledCheque = "Existing Document Loaded";
            if (existingOrganiser.documents?.bankStatement) newUploadedFiles.bankStatement = "Existing Document Loaded";
            setUploadedFiles(newUploadedFiles);

            if (existingOrganiser.documents?.bankProofType && (existingOrganiser.documents.bankProofType === "cheque" || existingOrganiser.documents.bankProofType === "statement")) {
                setBankProofType(existingOrganiser.documents.bankProofType);
            }
        }
    }, [existingOrganiser]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, state: e.target.value, city: "" }));
    };

    const verifyGST = async () => {
        if (!formData.gstNumber || formData.gstNumber.length !== 15) {
            alert("Please enter a valid 15-character GST number");
            return;
        }

        setGstVerifying(true);
        try {
            const response = await fetch("/api/verify-gst", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ gstNumber: formData.gstNumber }),
            });
            const result = await response.json();

            if (result.success) {
                setGstData(result.data);
                setFormData(prev => ({
                    ...prev,
                    institutionName: result.data.legalName,
                    street: result.data.address.street,
                    city: result.data.address.city,
                    state: result.data.address.state,
                    pincode: result.data.address.pincode,
                    panNumber: result.data.panNumber,
                }));
                alert("✅ GST verified! Form auto-filled with GST data.");
            } else {
                alert("❌ Failed to verify GST number");
            }
        } catch (error) {
            console.error("GST verification error:", error);
            alert("❌ Error verifying GST number");
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
                setFormData(prev => ({ ...prev, bankName: result.data.bank, branchName: result.data.branch }));
                alert(`✅ Bank details fetched!\nBank: ${result.data.bank}\nBranch: ${result.data.branch}`);
            } else {
                alert("❌ Invalid IFSC code");
            }
        } catch (error) {
            console.error("IFSC verification error:", error);
            alert("❌ Error verifying IFSC code");
        } finally {
            setLoading(false);
        }
    };

    const uploadToCloudinary = async (file: File, fieldName: string) => {
        setUploadingDocs(prev => ({ ...prev, [fieldName]: true }));
        try {
            const fd = new FormData();
            fd.append("file", file);
            fd.append("folder", "eventzgo/documents");
            const response = await fetch("/api/upload-document", { method: "POST", body: fd });
            const result = await response.json();
            if (result.success) {
                setFormData(prev => ({ ...prev, [fieldName]: result.url }));
                return result.url;
            } else {
                throw new Error(result.error || "Upload failed");
            }
        } catch (error: any) {
            console.error("Upload error:", error);
            alert(`Failed to upload ${fieldName}: ${error.message}`);
            return null;
        } finally {
            setUploadingDocs(prev => ({ ...prev, [fieldName]: false }));
        }
    };

    const handleFileUpload = async (
        e: React.ChangeEvent<HTMLInputElement>,
        fieldName: string,
        allowedTypes: ("image" | "pdf")[] = ["image", "pdf"]
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            alert("File size must be less than 5MB");
            e.target.value = "";
            return;
        }

        const fileType = file.type;
        const isValid = allowedTypes.some(type =>
            type === "image" ? fileType.startsWith("image/") : fileType === "application/pdf"
        );

        if (!isValid) {
            alert("Invalid file type.");
            e.target.value = "";
            return;
        }

        const url = await uploadToCloudinary(file, fieldName);
        if (url) {
            setUploadedFiles(prev => ({ ...prev, [fieldName]: file.name }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            await updateOrganiser({
                organiserId,
                institutionName: formData.institutionName,
                contactPerson: formData.contactPerson,
                email: formData.email,
                phone: formData.phone,
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
                    gstCertificate: formData.gstCertificate,
                    panCardFront: formData.panCardFront,
                    panCardBack: formData.panCardBack,
                    cancelledCheque: formData.cancelledCheque || undefined,
                    bankStatement: formData.bankStatement || undefined,
                    bankProofType: bankProofType,
                },
            });

            // If account was already pending setup, move to pending_approval
            if (existingOrganiser?.accountStatus === "pending_setup") {
                await submitForApproval({ organiserId });
            }
            // If already pending_approval, we just updated values. 
            // We might want to re-trigger notification to admin? (Out of scope)

            onComplete();
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Failed to update details. Please try again.");
            window.scrollTo({ top: 0, behavior: "smooth" });
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        { number: 1, title: "Institution Info", icon: Building },
        { number: 2, title: "Tax Details", icon: FileText },
        { number: 3, title: "Bank Details", icon: CreditCard },
        { number: 4, title: "Documents", icon: File },
    ];

    const isStep1Valid = !!(formData.institutionName && formData.contactPerson && formData.email && formData.phone && formData.street && formData.city && formData.state && formData.pincode);
    const isStep2Valid = !!(formData.gstNumber && formData.panNumber && formData.tanNumber);
    const isStep3Valid = !!(formData.accountHolderName && formData.accountNumber && formData.ifscCode && formData.bankName && formData.branchName);
    const isStep4Valid = !!(
        formData.gstCertificate &&
        formData.panCardFront &&
        formData.panCardBack &&
        (formData.cancelledCheque || formData.bankStatement)
    );

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
        if (fieldMap[field]) return formData[field] === fieldMap[field];
        return null;
    };

    if (!existingOrganiser) return <div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-purple-600" /><p className="mt-2 text-gray-500">Loading profile...</p></div>;

    return (
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl mx-auto border border-gray-100">
            <div className="text-center mb-8 relative">
                {onCancel && (
                    <button
                        onClick={onCancel}
                        className="absolute left-0 top-0 px-4 py-2 text-gray-500 hover:text-gray-700 font-medium"
                    >
                        Cancel
                    </button>
                )}
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {existingOrganiser.accountStatus === "pending_setup" ? "Complete Your Profile" : "Update Profile Details"}
                </h1>
                <p className="text-gray-600">Provide your organization details for verification</p>
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
                                            ? "bg-green-500 text-white"
                                            : isActive
                                                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                                                : "bg-gray-200 text-gray-500"
                                            }`}
                                    >
                                        {isCompleted ? <CheckCircle className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                                    </div>
                                    <p className={`mt-2 text-xs font-medium ${isActive ? "text-purple-600" : "text-gray-500"}`}>
                                        {step.title}
                                    </p>
                                </div>
                                {index < steps.length - 1 && (
                                    <div className={`flex-1 h-1 mx-2 rounded-full ${isCompleted ? "bg-green-500" : "bg-gray-200"}`} />
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                {/* Step 1: Institution Info */}
                {currentStep === 1 && (
                    <div className="space-y-6">
                        {/* Fields... (Simplified copy from page.tsx) */}
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                            <p className="text-sm font-medium text-yellow-800">Unique Identification Required</p>
                            <p className="text-xs text-yellow-700 mt-1">Ensure details match GST certificate.</p>
                        </div>
                        {/* Institution Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Institution/Company Name *</label>
                            <input type="text" name="institutionName" value={formData.institutionName} onChange={handleInputChange} className="w-full px-4 py-3 border rounded-xl" required />
                        </div>
                        {/* Contact Person */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Contact Person Name *</label>
                            <input type="text" name="contactPerson" value={formData.contactPerson} onChange={handleInputChange} className="w-full px-4 py-3 border rounded-xl" required />
                        </div>
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                            <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-4 py-3 border rounded-xl" required />
                        </div>
                        {/* Phone */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                            <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-3 border rounded-xl" required />
                        </div>
                        {/* Address Step 1 part */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Street Address *</label>
                            <input type="text" name="street" value={formData.street} onChange={handleInputChange} className="w-full px-4 py-3 border rounded-xl" required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                                <select name="state" value={formData.state} onChange={handleStateChange} className="w-full px-4 py-3 border rounded-xl" required>
                                    <option value="">Select State</option>
                                    {indianStates.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                                <select name="city" value={formData.city} onChange={handleInputChange} className="w-full px-4 py-3 border rounded-xl" required disabled={!formData.state}>
                                    <option value="">Select City</option>
                                    {formData.state && citiesByState[formData.state]?.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Pincode *</label>
                            <input type="text" name="pincode" value={formData.pincode} onChange={handleInputChange} className="w-full px-4 py-3 border rounded-xl" maxLength={6} required />
                        </div>
                    </div>
                )}

                {/* Step 2: Tax Details */}
                {currentStep === 2 && (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">GST Number *</label>
                            <div className="flex gap-2">
                                <input type="text" name="gstNumber" value={formData.gstNumber} onChange={handleInputChange} className="flex-1 px-4 py-3 border rounded-xl uppercase" maxLength={15} required />
                                <button type="button" onClick={verifyGST} disabled={gstVerifying || formData.gstNumber.length !== 15} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold">Verify</button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">PAN Number *</label>
                            <input type="text" name="panNumber" value={formData.panNumber} onChange={handleInputChange} className="w-full px-4 py-3 border rounded-xl uppercase" maxLength={10} required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">TAN Number *</label>
                            <input type="text" name="tanNumber" value={formData.tanNumber} onChange={handleInputChange} className="w-full px-4 py-3 border rounded-xl uppercase" maxLength={10} required />
                        </div>
                    </div>
                )}

                {/* Step 3: Bank Details */}
                {currentStep === 3 && (
                    <div className="space-y-6">
                        <div><label className="block text-sm font-medium text-gray-700 mb-2">Account Holder Name *</label><input type="text" name="accountHolderName" value={formData.accountHolderName} onChange={handleInputChange} className="w-full px-4 py-3 border rounded-xl" required /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-2">Account Number *</label><input type="text" name="accountNumber" value={formData.accountNumber} onChange={handleInputChange} className="w-full px-4 py-3 border rounded-xl" required /></div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">IFSC Code *</label>
                            <div className="flex gap-2">
                                <input type="text" name="ifscCode" value={formData.ifscCode} onChange={handleInputChange} className="flex-1 px-4 py-3 border rounded-xl uppercase" maxLength={11} required />
                                <button type="button" onClick={() => verifyIFSC(formData.ifscCode)} disabled={loading || formData.ifscCode.length !== 11} className="px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold">Verify</button>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-sm font-medium text-gray-700 mb-2">Bank Name *</label><input type="text" name="bankName" value={formData.bankName} onChange={handleInputChange} className="w-full px-4 py-3 border rounded-xl" required /></div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-2">Branch Name *</label><input type="text" name="branchName" value={formData.branchName} onChange={handleInputChange} className="w-full px-4 py-3 border rounded-xl" required /></div>
                        </div>
                    </div>
                )}

                {/* Step 4: Documents */}
                {currentStep === 4 && (
                    <div className="space-y-6">
                        {/* GST Cert */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">GST Certificate *</label>
                            {/* ... Document Input Logic reused ... */}
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center">
                                <input type="file" onChange={(e) => handleFileUpload(e, "gstCertificate")} className="hidden" id="gstCert" accept=".pdf,.jpg,.png" disabled={uploadingDocs["gstCertificate"]} />
                                <label htmlFor="gstCert" className="cursor-pointer block">
                                    {uploadingDocs["gstCertificate"] ? "Uploading..." : formData.gstCertificate ? <span className="text-green-600">✓ {uploadedFiles.gstCertificate || "File Uploaded"}</span> : "Click to Upload"}
                                </label>
                            </div>
                        </div>
                        {/* PAN Front */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">PAN Front *</label>
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center">
                                <input type="file" onChange={(e) => handleFileUpload(e, "panCardFront", ["image"])} className="hidden" id="panFront" accept=".jpg,.png" disabled={uploadingDocs["panCardFront"]} />
                                <label htmlFor="panFront" className="cursor-pointer block">
                                    {uploadingDocs["panCardFront"] ? "Uploading..." : formData.panCardFront ? <span className="text-green-600">✓ {uploadedFiles.panCardFront || "File Uploaded"}</span> : "Click to Upload"}
                                </label>
                            </div>
                        </div>
                        {/* PAN Back */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">PAN Back *</label>
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center">
                                <input type="file" onChange={(e) => handleFileUpload(e, "panCardBack", ["image"])} className="hidden" id="panBack" accept=".jpg,.png" disabled={uploadingDocs["panCardBack"]} />
                                <label htmlFor="panBack" className="cursor-pointer block">
                                    {uploadingDocs["panCardBack"] ? "Uploading..." : formData.panCardBack ? <span className="text-green-600">✓ {uploadedFiles.panCardBack || "File Uploaded"}</span> : "Click to Upload"}
                                </label>
                            </div>
                        </div>
                        {/* Bank Proof */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Bank Proof *</label>
                            <div className="flex gap-4 mb-2">
                                <label className="flex items-center"><input type="radio" checked={bankProofType === "cheque"} onChange={() => setBankProofType("cheque")} className="mr-2" />Cheque</label>
                                <label className="flex items-center"><input type="radio" checked={bankProofType === "statement"} onChange={() => setBankProofType("statement")} className="mr-2" />Statement</label>
                            </div>
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center">
                                <input type="file" onChange={(e) => handleFileUpload(e, bankProofType === "cheque" ? "cancelledCheque" : "bankStatement", bankProofType === "cheque" ? ["image"] : ["pdf"])} className="hidden" id="bankProof" accept={bankProofType === "cheque" ? ".jpg,.png" : ".pdf"} disabled={uploadingDocs[bankProofType === "cheque" ? "cancelledCheque" : "bankStatement"]} />
                                <label htmlFor="bankProof" className="cursor-pointer block">
                                    {
                                        (bankProofType === "cheque" ? uploadingDocs["cancelledCheque"] : uploadingDocs["bankStatement"]) ? "Uploading..." :
                                            (bankProofType === "cheque" ? formData.cancelledCheque : formData.bankStatement) ? <span className="text-green-600">✓ {bankProofType === "cheque" ? uploadedFiles.cancelledCheque || "File Uploaded" : uploadedFiles.bankStatement || "File Uploaded"}</span> : "Click to Upload"
                                    }
                                </label>
                            </div>
                        </div>
                    </div>
                )}

                {error && <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-xl">{error}</div>}

                <div className="flex items-center justify-between mt-8">
                    {currentStep > 1 && (
                        <button type="button" onClick={() => setCurrentStep(currentStep - 1)} className="px-6 py-3 border border-gray-300 rounded-xl">Back</button>
                    )}
                    {currentStep < 4 ? (
                        <button
                            type="button"
                            onClick={() => setCurrentStep(currentStep + 1)}
                            disabled={(currentStep === 1 && !isStep1Valid) || (currentStep === 2 && !isStep2Valid) || (currentStep === 3 && !isStep3Valid)}
                            className="ml-auto bg-purple-600 text-white px-6 py-3 rounded-xl disabled:opacity-50"
                        >Next</button>
                    ) : (
                        <button
                            type="submit"
                            disabled={loading || !isStep4Valid}
                            className="ml-auto bg-purple-600 text-white px-6 py-3 rounded-xl disabled:opacity-50"
                        >
                            {loading ? "Submitting..." : "Update & Submit"}
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}
