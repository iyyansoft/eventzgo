"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Disable static generation for this page
export const dynamic = 'force-dynamic';

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    router.push("/management/admin/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="absolute inset-0 border-4 border-purple-200 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-purple-600 rounded-full animate-spin"></div>
        </div>
        <p className="text-gray-600 font-medium">Redirecting...</p>
      </div>
    </div>
  );
}
