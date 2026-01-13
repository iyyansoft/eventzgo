'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { AdminAuthProvider, useAdminAuth } from '@/components/admin/AdminAuthProvider';

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isLoginPage = pathname === '/admin/login';
    const { sessionToken } = useAdminAuth();

    // Hide sidebar if not logged in (or on login page)
    const showSidebar = !isLoginPage && !!sessionToken;

    return (
        <div className="flex h-screen bg-gray-50">
            {showSidebar && <AdminSidebar />}
            <main className={`flex-1 overflow-y-auto ${!showSidebar ? 'w-full' : ''}`}>
                {children}
            </main>
        </div>
    );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <AdminAuthProvider>
            <AdminLayoutContent>{children}</AdminLayoutContent>
        </AdminAuthProvider>
    );
}
