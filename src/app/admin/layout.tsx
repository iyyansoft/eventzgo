'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isLoginPage = pathname === '/admin/login';

    return (
        <div className="flex h-screen bg-gray-50">
            {!isLoginPage && <AdminSidebar />}
            <main className={`flex-1 overflow-y-auto ${isLoginPage ? 'w-full' : ''}`}>
                {children}
            </main>
        </div>
    );
}
