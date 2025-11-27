"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { CheckCircle, XCircle, Eye, EyeOff, Lock, User as UserIcon } from "lucide-react";

// SECURE ADMIN CREDENTIALS
// In production, move these to environment variables
const ADMIN_CREDENTIALS = {
    username: "admin@eventzgo",
    password: "EventzGo@Admin#2025!Secure",
};

export default function AdminApprovalPanel() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loginError, setLoginError] = useState("");
    const [selectedOrganizer, setSelectedOrganizer] = useState<any>(null);
    const [rejectionReason, setRejectionReason] = useState("");

    const pendingOrganizers = useQuery(
        api.organisers.getPendingOrganisers,
        isAuthenticated ? {} : "skip"
    );

    const approveOrganiser = useMutation(api.organisers.approveOrganiser);
    const rejectOrganiser = useMutation(api.organisers.rejectOrganiser);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();

        if (
            username === ADMIN_CREDENTIALS.username &&
            password === ADMIN_CREDENTIALS.password
        ) {
            setIsAuthenticated(true);
            setLoginError("");
        } else {
            setLoginError("Invalid credentials. Please try again.");
            setPassword("");
        }
    };

    const handleApprove = async (organizerId: Id<"organisers">) => {
        try {
            // In a real app, get the actual admin user ID from Clerk
            const adminUserId = "admin-user-id" as Id<"users">;
            await approveOrganiser({
                organiserId: organizerId,
                approvedBy: adminUserId,
            });
            alert("Organizer approved successfully!");
        } catch (error) {
            console.error("Error approving organizer:", error);
            alert("Failed to approve organizer");
        }
    };

    const handleReject = async (organizerId: Id<"organisers">) => {
        if (!rejectionReason.trim()) {
            alert("Please provide a rejection reason");
            return;
        }

        try {
            const adminUserId = "admin-user-id" as Id<"users">;
            await rejectOrganiser({
                organiserId: organizerId,
                rejectionReason: rejectionReason,
                approvedBy: adminUserId,
            });
            alert("Organizer rejected");
            setSelectedOrganizer(null);
            setRejectionReason("");
        } catch (error) {
            console.error("Error rejecting organizer:", error);
            alert("Failed to reject organizer");
        }
    };

    // Login Screen
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
                <div className="max-w-md w-full">
                    <div className="bg-white rounded-3xl shadow-2xl p-8">
                        {/* Lock Icon */}
                        <div className="flex justify-center mb-6">
                            <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                                <Lock className="w-10 h-10 text-white" />
                            </div>
                        </div>

                        {/* Title */}
                        <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
                            Admin Panel
                        </h1>
                        <p className="text-center text-gray-600 mb-8">
                            Secure access required
                        </p>

                        {/* Login Form */}
                        <form onSubmit={handleLogin} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Username
                                </label>
                                <div className="relative">
                                    <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="Enter admin username"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="Enter admin password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {loginError && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                    {loginError}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105"
                            >
                                Sign In
                            </button>
                        </form>

                        {/* Credentials Info (Remove in production) */}
                        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-xs text-yellow-800 font-medium mb-2">
                                🔐 Demo Credentials:
                            </p>
                            <p className="text-xs text-yellow-700 font-mono">
                                Username: {ADMIN_CREDENTIALS.username}
                            </p>
                            <p className="text-xs text-yellow-700 font-mono">
                                Password: {ADMIN_CREDENTIALS.password}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Admin Dashboard
    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Organizer Approval Panel
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Review and approve organizer applications
                            </p>
                        </div>
                        <button
                            onClick={() => setIsAuthenticated(false)}
                            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>

                {/* Pending Organizers */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">
                        Pending Applications ({pendingOrganizers?.length || 0})
                    </h2>

                    {!pendingOrganizers || pendingOrganizers.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500">No pending applications</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {pendingOrganizers.map((org) => (
                                <div
                                    key={org._id}
                                    className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">
                                                {org.institutionName}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                Applied on{" "}
                                                {new Date(org.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                                            Pending
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <p className="text-sm text-gray-600">GST Number</p>
                                            <p className="font-medium">{org.gstNumber}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">PAN Number</p>
                                            <p className="font-medium">{org.panNumber}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Location</p>
                                            <p className="font-medium">
                                                {org.address.city}, {org.address.state}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Bank</p>
                                            <p className="font-medium">{org.bankDetails.bankName}</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleApprove(org._id)}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                        >
                                            <CheckCircle className="w-5 h-5" />
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => setSelectedOrganizer(org)}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                        >
                                            <XCircle className="w-5 h-5" />
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Rejection Modal */}
                {selectedOrganizer && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">
                                Reject Application
                            </h3>
                            <p className="text-gray-600 mb-4">
                                Please provide a reason for rejecting{" "}
                                <span className="font-semibold">
                                    {selectedOrganizer.institutionName}
                                </span>
                            </p>
                            <textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent mb-4"
                                rows={4}
                                placeholder="Enter rejection reason..."
                            />
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setSelectedOrganizer(null);
                                        setRejectionReason("");
                                    }}
                                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleReject(selectedOrganizer._id)}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    Confirm Reject
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
