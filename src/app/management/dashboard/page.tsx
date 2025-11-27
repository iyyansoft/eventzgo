"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useManagementAuth } from "@/contexts/ManagementAuthContext";

export default function ManagementDashboard() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading } = useManagementAuth();

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                router.push("/management");
            } else if (user) {
                // Redirect based on user role
                switch (user.role) {
                    case "admin":
                        router.push("/management/admin/dashboard");
                        break;
                    case "organiser":
                        router.push("/management/organiser/dashboard");
                        break;
                    case "vendor":
                        router.push("/management/vendor/dashboard");
                        break;
                    case "speaker":
                        router.push("/management/speaker/dashboard");
                        break;
                    case "sponsor":
                        router.push("/management/sponsor/dashboard");
                        break;
                    default:
                        router.push("/management");
                }
            }
        }
    }, [user, isAuthenticated, isLoading, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Redirecting to your dashboard...
                </h2>
            </div>
        </div>
    );
}
