"use client";

import React from "react";
import { useRouter } from "next/navigation";

export default function OrganiserManagementError({ error, reset }: { error: Error; reset?: () => void }) {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
        <p className="text-sm text-gray-600 mb-6">An unexpected error occurred in the organiser management area.</p>
        <pre className="text-xs text-left bg-gray-100 p-3 rounded-md overflow-auto text-red-600 mb-4">{error?.message}</pre>
        <div className="flex justify-center gap-3">
          <button
            onClick={() => (reset ? reset() : router.refresh())}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Retry
          </button>
          <button
            onClick={() => router.push("/management")}
            className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200"
          >
            Back to Management
          </button>
        </div>
      </div>
    </div>
  );
}
