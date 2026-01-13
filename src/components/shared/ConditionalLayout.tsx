// src/components/shared/ConditionalLayout.tsx
"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";

export default function ConditionalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    // Check if current route is a management or admin route
    const isManagementRoute = pathname?.startsWith("/management");
    const isAdminRoute = pathname?.startsWith("/admin");
    const isVerifyRoute = pathname?.startsWith("/verify");

    return (
        <div className="flex min-h-screen flex-col">
            {/* Only show end-user Header on non-management and non-admin pages */}
            {!isManagementRoute && !isAdminRoute && !isVerifyRoute && <Header />}

            <main className="flex-1">{children}</main>

            {/* Only show end-user Footer on non-management and non-admin pages */}
            {!isManagementRoute && !isAdminRoute && !isVerifyRoute && <Footer />}
        </div>
    );
}
