'use client';

import { ManagementAuthProvider } from "@/contexts/ManagementAuthContext";
import SessionProvider from "@/components/providers/SessionProvider";

// Disable static generation for all management pages
export const dynamic = 'force-dynamic';

export default function ManagementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <ManagementAuthProvider>
        {children}
      </ManagementAuthProvider>
    </SessionProvider>
  );
}
