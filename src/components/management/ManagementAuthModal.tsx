"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { useSignIn, useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

interface ManagementAuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode: "signin" | "signup";
    selectedRole: "organizer" | "vendor" | "speaker" | "sponsor";
    onSuccess: () => void;
}

const ManagementAuthModal: React.FC<ManagementAuthModalProps> = ({
    isOpen,
    onClose,
    mode,
    selectedRole,
    onSuccess,
}) => {
    const router = useRouter();
    const { signIn, setActive: setActiveSignIn } = useSignIn();
    const { signUp, setActive: setActiveSignUp } = useSignUp();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");

    // Additional fields based on role
    const [companyName, setCompanyName] = useState("");
    const [location, setLocation] = useState("");
    const [description, setDescription] = useState("");
    const [website, setWebsite] = useState("");

    // Role-specific fields
    const [serviceType, setServiceType] = useState("");
    const [services, setServices] = useState("");
    const [priceRange, setPriceRange] = useState("");

    const [title, setTitle] = useState("");
    const [bio, setBio] = useState("");
    const [expertise, setExpertise] = useState("");
    const [topics, setTopics] = useState("");
    const [languages, setLanguages] = useState("");
    const [speakingFee, setSpeakingFee] = useState("");

    const [industry, setIndustry] = useState("");
    const [sponsorshipBudget, setSponsorshipBudget] = useState("");
    const [preferredEvents, setPreferredEvents] = useState("");

    const createVendor = useMutation(api.managementUsers.createOrUpdateVendor);
    const createSpeaker = useMutation(api.managementUsers.createOrUpdateSpeaker);
    const createSponsor = useMutation(api.managementUsers.createOrUpdateSponsor);

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!signIn) return;

        setLoading(true);
        setError("");

        try {
            const result = await signIn.create({
                identifier: email,
                password,
            });

            if (result.status === "complete") {
                await setActiveSignIn({ session: result.createdSessionId });
                onSuccess();
                onClose();
            }
        } catch (err: any) {
            setError(err.errors?.[0]?.message || "Invalid credentials");
        } finally {
            setLoading(false);
        }
    };

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!signUp) return;

        setLoading(true);
        setError("");

        try {
            // Create the Clerk user
            const result = await signUp.create({
                emailAddress: email,
                password,
                firstName: name.split(" ")[0],
                lastName: name.split(" ").slice(1).join(" ") || "",
                unsafeMetadata: {
                    role: selectedRole,
                    phone,
                },
            });

            // Send email verification
            await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

            // For demo purposes, we'll auto-verify
            // In production, user would enter the code from their email
            if (result.status === "missing_requirements") {
                // Show verification UI
                setError("Please check your email for verification code");
            } else if (result.status === "complete") {
                await setActiveSignUp({ session: result.createdSessionId });

                // Create role-specific profile in Convex
                const clerkId = result.createdUserId!;

                try {
                    if (selectedRole === "vendor") {
                        await createVendor({
                            clerkId,
                            companyName,
                            serviceType,
                            services: services.split(",").map(s => s.trim()),
                            priceRange,
                            location,
                            description,
                            website: website || undefined,
                        });
                    } else if (selectedRole === "speaker") {
                        await createSpeaker({
                            clerkId,
                            title,
                            bio,
                            expertise: expertise.split(",").map(s => s.trim()),
                            topics: topics.split(",").map(s => s.trim()),
                            languages: languages.split(",").map(s => s.trim()),
                            speakingFee,
                            location,
                            companyName: companyName || undefined,
                            website: website || undefined,
                        });
                    } else if (selectedRole === "sponsor") {
                        await createSponsor({
                            clerkId,
                            companyName,
                            industry,
                            description,
                            sponsorshipBudget,
                            preferredEvents: preferredEvents.split(",").map(s => s.trim()),
                            location,
                            website: website || undefined,
                        });
                    }

                    onSuccess();
                    onClose();
                    router.push("/management/dashboard");
                } catch (convexError: any) {
                    setError("Profile creation failed: " + convexError.message);
                }
            }
        } catch (err: any) {
            setError(err.errors?.[0]?.message || "Sign up failed");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="relative p-6 pb-0">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>

                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            {mode === "signin"
                                ? "Welcome Back!"
                                : `Join as ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}`}
                        </h2>
                        <p className="text-gray-600">
                            {mode === "signin"
                                ? "Sign in to access your dashboard"
                                : `Create your ${selectedRole} account`}
                        </p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={mode === "signin" ? handleSignIn : handleSignUp} className="p-6 pt-0">
                    <div className="space-y-4">
                        {/* Basic fields */}
                        {mode === "signup" && (
                            <input
                                type="text"
                                placeholder="Full Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                required
                            />
                        )}

                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            required
                        />

                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            required
                        />

                        {mode === "signup" && (
                            <>
                                <input
                                    type="tel"
                                    placeholder="Phone Number"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    required
                                />

                                <input
                                    type="text"
                                    placeholder={selectedRole === "speaker" ? "Current Position" : "Company Name"}
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    required
                                />

                                <input
                                    type="text"
                                    placeholder="Location"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    required
                                />

                                {/* Vendor-specific fields */}
                                {selectedRole === "vendor" && (
                                    <>
                                        <select
                                            value={serviceType}
                                            onChange={(e) => setServiceType(e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            required
                                        >
                                            <option value="">Select Service Type</option>
                                            <option value="Catering">Catering</option>
                                            <option value="Photography">Photography</option>
                                            <option value="AV Equipment">AV Equipment</option>
                                            <option value="Decoration">Decoration</option>
                                            <option value="Security">Security</option>
                                            <option value="Transportation">Transportation</option>
                                        </select>

                                        <input
                                            type="text"
                                            placeholder="Services Offered (comma separated)"
                                            value={services}
                                            onChange={(e) => setServices(e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            required
                                        />

                                        <input
                                            type="text"
                                            placeholder="Price Range (e.g., ₹500-2000)"
                                            value={priceRange}
                                            onChange={(e) => setPriceRange(e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            required
                                        />
                                    </>
                                )}

                                {/* Speaker-specific fields */}
                                {selectedRole === "speaker" && (
                                    <>
                                        <input
                                            type="text"
                                            placeholder="Professional Title"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            required
                                        />

                                        <input
                                            type="text"
                                            placeholder="Areas of Expertise (comma separated)"
                                            value={expertise}
                                            onChange={(e) => setExpertise(e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            required
                                        />

                                        <input
                                            type="text"
                                            placeholder="Speaking Topics (comma separated)"
                                            value={topics}
                                            onChange={(e) => setTopics(e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            required
                                        />

                                        <input
                                            type="text"
                                            placeholder="Languages (comma separated)"
                                            value={languages}
                                            onChange={(e) => setLanguages(e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            required
                                        />

                                        <input
                                            type="text"
                                            placeholder="Speaking Fee Range"
                                            value={speakingFee}
                                            onChange={(e) => setSpeakingFee(e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            required
                                        />

                                        <textarea
                                            placeholder="Professional Bio"
                                            value={bio}
                                            onChange={(e) => setBio(e.target.value)}
                                            rows={3}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                                            required
                                        />
                                    </>
                                )}

                                {/* Sponsor-specific fields */}
                                {selectedRole === "sponsor" && (
                                    <>
                                        <select
                                            value={industry}
                                            onChange={(e) => setIndustry(e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            required
                                        >
                                            <option value="">Select Industry</option>
                                            <option value="Technology">Technology</option>
                                            <option value="Finance">Finance</option>
                                            <option value="Healthcare">Healthcare</option>
                                            <option value="Education">Education</option>
                                            <option value="Retail">Retail</option>
                                            <option value="Manufacturing">Manufacturing</option>
                                        </select>

                                        <input
                                            type="text"
                                            placeholder="Sponsorship Budget Range"
                                            value={sponsorshipBudget}
                                            onChange={(e) => setSponsorshipBudget(e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            required
                                        />

                                        <input
                                            type="text"
                                            placeholder="Preferred Event Types (comma separated)"
                                            value={preferredEvents}
                                            onChange={(e) => setPreferredEvents(e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            required
                                        />

                                        <textarea
                                            placeholder="Company Description"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            rows={3}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                                            required
                                        />
                                    </>
                                )}

                                {/* Common optional field */}
                                <input
                                    type="url"
                                    placeholder="Website (optional)"
                                    value={website}
                                    onChange={(e) => setWebsite(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </>
                        )}
                    </div>

                    {error && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        {loading
                            ? "Please wait..."
                            : mode === "signin"
                                ? "Sign In"
                                : "Create Account"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ManagementAuthModal;
