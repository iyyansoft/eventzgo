"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect } from "react";
import BankDetailsForm from "@/components/organiser/BankDetailsForm";
import DocumentUpload from "@/components/organiser/DocumentUpload";

// Disable static generation for this page
export const dynamic = 'force-dynamic';

export default function OrganiserSettingsPage() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("organiser_session");
    if (stored) {
      try {
        const user = JSON.parse(stored);
        if (user && user.id) setUserId(user.id);
      } catch (e) { }
    }
  }, []);

  const [activeTab, setActiveTab] = useState<"profile" | "bank" | "documents">("profile");

  const organiser = useQuery(
    api.organisers.getOrganiserById,
    userId ? { organiserId: userId as any } : "skip"
  );

  const updateOrganiser = useMutation(api.organisers.updateOrganiser);

  if (!organiser) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-purple-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-purple-600 rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600 font-medium">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
          Settings
        </h1>
        <p className="text-gray-600">
          Manage your organiser profile and preferences
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm p-2 flex space-x-2">
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex-1 px-6 py-3 rounded-lg font-medium transition ${activeTab === "profile"
            ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
            : "text-gray-600 hover:bg-gray-100"
            }`}
        >
          Profile
        </button>
        <button
          onClick={() => setActiveTab("bank")}
          className={`flex-1 px-6 py-3 rounded-lg font-medium transition ${activeTab === "bank"
            ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
            : "text-gray-600 hover:bg-gray-100"
            }`}
        >
          Bank Details
        </button>
        <button
          onClick={() => setActiveTab("documents")}
          className={`flex-1 px-6 py-3 rounded-lg font-medium transition ${activeTab === "documents"
            ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
            : "text-gray-600 hover:bg-gray-100"
            }`}
        >
          Documents
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        {activeTab === "profile" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Business Profile</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Institution Name
                </label>
                <input
                  type="text"
                  defaultValue={organiser.institutionName}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  GST Number
                </label>
                <input
                  type="text"
                  defaultValue={organiser.gstNumber}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PAN Number
                </label>
                <input
                  type="text"
                  defaultValue={organiser.panNumber}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  TAN Number (Optional)
                </label>
                <input
                  type="text"
                  defaultValue={organiser.tanNumber}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Address</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Street Address"
                  defaultValue={organiser.address.street}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <div className="grid md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="City"
                    defaultValue={organiser.address.city}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    placeholder="State"
                    defaultValue={organiser.address.state}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    placeholder="Pincode"
                    defaultValue={organiser.address.pincode}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition">
              Save Changes
            </button>
          </div>
        )}

        {activeTab === "bank" && (
          <BankDetailsForm
            initialData={organiser.bankDetails}
            organiserId={organiser._id}
          />
        )}

        {activeTab === "documents" && (
          <DocumentUpload
            documents={organiser.documents}
            organiserId={organiser._id}
          />
        )}
      </div>
    </div>
  );
}
