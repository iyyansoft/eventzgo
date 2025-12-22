// src/app/management/organiser/layout.tsx
'use client';

import React from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import OrganiserSidebar from '@/components/management/OrganiserSidebar';
import { isApprovedOrganiser } from '@/lib/management-auth';

export default function OrganiserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  // Check if user is approved organiser (TEMPORARILY DISABLED)
  /*
  React.useEffect(() => {
    if (isLoaded && user) {
      const publicMetadata = user.publicMetadata || {};

      if (!isApprovedOrganiser(publicMetadata)) {
        router.push('/management');
      }
    }
  }, [isLoaded, user, router]);
  */

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
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