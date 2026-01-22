"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { User, Mail, Phone, Calendar, Ticket, Loader2, Settings } from "lucide-react";
import Image from "next/image";

// Disable static generation for this page
export const dynamic = 'force-dynamic';

export default function ProfilePage() {
  const router = useRouter();
  const { isSignedIn, user, convexUser, isLoaded, role } = useAuth();

  const formatDate = (timestamp: number | undefined) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp).toLocaleDateString("en-IN", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  // Loading state
  if (!isLoaded || (isSignedIn && convexUser === undefined)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Not signed in
  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center max-w-md px-4">
          <div className="text-6xl mb-4">ðŸ‘¤</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Sign In Required
          </h1>
          <p className="text-gray-600 mb-8">
            Please sign in to view your profile
          </p>
          <button
            onClick={() => router.push("/sign-in")}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 pt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your account information</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-md p-6">
              <div className="text-center">
                {/* Profile Image */}
                <div className="inline-block relative mb-4">
                  {user?.imageUrl ? (
                    <Image
                      src={user.imageUrl}
                      alt={user.fullName || "User"}
                      width={128}
                      height={128}
                      className="w-32 h-32 rounded-full object-cover border-4 border-purple-100"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center border-4 border-purple-100">
                      <User className="w-16 h-16 text-white" />
                    </div>
                  )}
                </div>

                {/* User Info */}
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  {user?.fullName || "User"}
                </h2>
                <p className="text-purple-600 font-medium capitalize mb-4">
                  {role} Account
                </p>

                {/* Quick Stats */}
                <div className="space-y-3 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Account Status</span>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      Active
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Member Since</span>
                    <span className="text-gray-900 font-medium">
                      {formatDate(convexUser?.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 space-y-3">
                  <button
                    onClick={() => router.push("/profile/bookings")}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
                  >
                    <Ticket className="w-5 h-5" />
                    <span>My Bookings</span>
                  </button>
                  <button
                    onClick={() => router.push("/profile/settings")}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <Settings className="w-5 h-5" />
                    <span>Settings</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Account Information
              </h3>

              <div className="space-y-6">
                {/* Email */}
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <Mail className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-1">Email Address</p>
                    <p className="text-lg font-medium text-gray-900">
                      {user?.primaryEmailAddress?.emailAddress || "N/A"}
                    </p>
                    {user?.primaryEmailAddress?.verification?.status ===
                      "verified" && (
                        <span className="inline-block mt-1 px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                          Verified
                        </span>
                      )}
                  </div>
                </div>

                {/* Phone */}
                {user?.primaryPhoneNumber && (
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <Phone className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 mb-1">
                        Phone Number
                      </p>
                      <p className="text-lg font-medium text-gray-900">
                        {user.primaryPhoneNumber.phoneNumber || "N/A"}
                      </p>
                    </div>
                  </div>
                )}

                {/* Account Created */}
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <Calendar className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-1">
                      Account Created
                    </p>
                    <p className="text-lg font-medium text-gray-900">
                      {formatDate(convexUser?.createdAt)}
                    </p>
                  </div>
                </div>

                {/* User ID */}
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <User className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-1">User ID</p>
                    <p className="text-sm font-mono text-gray-900 bg-gray-50 px-3 py-2 rounded">
                      {convexUser?._id}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Role-based Dashboard Li nks */}

            {(role === "organiser" || role === "admin") && (
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-md p-6 text-white">
                <h3 className="text-xl font-bold mb-4">
                  {role === "admin" ? "Admin Access" : "Organiser Access"}
                </h3>
                <p className="text-white/90 mb-6">
                  You have access to additional management features
                </p>
                <div className="space-y-3">
                  {(role === "organiser" || role === "admin") && (
                    <button
                      onClick={() =>
                        router.push("/management/organiser/dashboard")
                      }
                      className="w-full flex items-center justify-between px-4 py-3 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-colors"
                    >
                      <span className="font-medium">Organiser Dashboard</span>
                      <span>â†’</span>
                    </button>
                  )}
                  {role === "admin" && (
                    <button
                      onClick={() => router.push("/management/admin/dashboard")}
                      className="w-full flex items-center justify-between px-4 py-3 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-colors"
                    >
                      <span className="font-medium">Admin Dashboard</span>
                      <span>â†’</span>
                    </button>
                  )}
                </div>
              </div>

            )}
          </div>
        </div>
      </div>
    </div>
  );
}
