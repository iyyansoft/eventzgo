// src/app/management/organiser/layout.tsx
'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import OrganiserSidebar from '@/components/management/OrganiserSidebar';

// Disable static generation for all organiser pages
export const dynamic = 'force-dynamic';

export default function OrganiserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: nextAuthSession, status } = useSession();
  const router = useRouter();
  const [localSession, setLocalSession] = React.useState<any>(null);
  const [isLoadingLocal, setIsLoadingLocal] = React.useState(true);

  // Check for local session on mount
  React.useEffect(() => {
    const stored = localStorage.getItem("organiser_session");
    if (stored) {
      try {
        setLocalSession(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse local session");
      }
    }
    setIsLoadingLocal(false);
  }, []);

  const session = nextAuthSession || (localSession ? { user: localSession } : null);

  // Redirect to sign-in if not authenticated AND no local session
  React.useEffect(() => {
    if (status === 'unauthenticated' && !localSession && !isLoadingLocal) {
      router.push('/management/sign-in');
    }
  }, [status, localSession, isLoadingLocal, router]);

  // Show loading state
  if ((status === 'loading' && !localSession) || isLoadingLocal) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Show error if not authenticated
  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Redirecting to sign in...</p>
        </div>
      </div>
    );
  }

  // Check if password change is required
  if (session.user.requirePasswordChange) {
    router.push('/management/change-password');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Password change required. Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <OrganiserSidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}