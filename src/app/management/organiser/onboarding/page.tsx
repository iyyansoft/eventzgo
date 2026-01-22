"use client";

import React, { useState, useEffect } from "react";
import DashboardOnboarding from "@/components/organiser/DashboardOnboarding";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// Disable static generation for this page
export const dynamic = 'force-dynamic';

const OnboardingPage = () => {
  const { data: nextAuthSession, status } = useSession();
  const router = useRouter();
  const [localSession, setLocalSession] = useState<any>(null);
  const [isLoadingLocal, setIsLoadingLocal] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("organiser_session");
    if (stored) {
      try { setLocalSession(JSON.parse(stored)); } catch (e) { }
    }
    setIsLoadingLocal(false);
  }, []);

  const session = nextAuthSession || (localSession ? { user: { ...localSession, userId: localSession.id } } : null);
  const userId = session?.user?.userId || session?.user?.id;

  if (status === "loading" || isLoadingLocal) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">Please sign in to view this page.</p>
        <button onClick={() => router.push('/management/sign-in')} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">Sign In</button>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Onboarding Information</h1>
        <p className="text-gray-600 mt-2">Manage your institution details, tax info, and documents.</p>
      </div>
      <DashboardOnboarding
        organiserId={userId as any}
        onComplete={() => {
          window.location.reload();
        }}
        onCancel={() => router.push('/management/organiser/dashboard')}
      />
    </div>
  );
};

export default OnboardingPage;
