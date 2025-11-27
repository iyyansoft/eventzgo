"use client";

import { use } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useRouter } from "next/navigation";

export default function OrganiserDetailsPage({ params }: { params: Promise<{ organiserId: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const organiser = useQuery(api.organisers.getOrganiserById, {
    organiserId: resolvedParams.organiserId as Id<"organisers">
  });

  if (!organiser) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-purple-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-purple-600 rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600 font-medium">Loading organiser...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <button
          onClick={() => router.back()}
          className="text-gray-600 hover:text-gray-900 flex items-center mb-4"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
          Organiser Details
        </h1>
        <p className="text-gray-600">
          View organiser information
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-6">
        <h2 className="text-2xl font-bold mb-4">{organiser.institutionName}</h2>
        <div className="space-y-4">
          <div>
            <span className="font-semibold">Status:</span> {organiser.approvalStatus}
          </div>
          <div>
            <span className="font-semibold">GST Number:</span> {organiser.gstNumber}
          </div>
          <div>
            <span className="font-semibold">PAN Number:</span> {organiser.panNumber}
          </div>
          <div>
            <span className="font-semibold">Address:</span> {organiser.address.city}, {organiser.address.state}
          </div>
        </div>
      </div>
    </div>
  );
}