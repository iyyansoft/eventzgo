'use client';

import React from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
    LayoutDashboard,
    Users,
    Calendar,
    Settings,
    LogOut,
    BarChart3,
    Shield,
    Activity,
    Database,
    Bell,
    HelpCircle,
    FileText,
    Lock,
    LucideIcon,
} from "lucide-react";

// Icon mapping from string to lucide-react component
const iconMap: Record<string, LucideIcon> = {
    LayoutDashboard,
    Users,
    Calendar,
    BarChart3,
    Activity,
    Database,
    FileText,
    Bell,
    Settings,
    HelpCircle,
    Shield,
    Lock,
};

const AdminSidebar = () => {
    const router = useRouter();
    const pathname = usePathname();

    // Fetch navigation items from Convex
    const navigationItems = useQuery(api.adminNavigation.getNavigationItems);

    const handleLogout = async () => {
        await fetch('/api/admin/logout', { method: 'POST' });
        router.push("/admin/login");
    };

    // Fallback menu items if Convex query fails or is loading
    const fallbackMenuItems = [
        {
            icon: "LayoutDashboard",
            label: "Dashboard",
            path: "/admin/dashboard",
            category: "main" as const,
        },
        {
            icon: "Users",
            label: "User Management",
            path: "/admin/users",
            category: "main" as const,
        },
        {
            icon: "Calendar",
            label: "Events",
            path: "/admin/events",
            category: "main" as const,
        },
        {
            icon: "BarChart3",
            label: "Analytics",
            path: "/admin/analytics",
            category: "main" as const,
        },
        {
            icon: "Activity",
            label: "System Monitor",
            path: "/admin/system",
            category: "main" as const,
        },
        {
            icon: "Database",
            label: "Database",
            path: "/admin/database",
            category: "main" as const,
        },
        {
            icon: "FileText",
            label: "Reports",
            path: "/admin/reports",
            category: "main" as const,
        },
        {
            icon: "Bell",
            label: "Notifications",
            path: "/admin/notifications",
            category: "main" as const,
        },
    ];

    // Define navigation item type
    type NavigationItem = {
        label: string;
        path: string;
        icon: string;
        category: "main" | "bottom";
    };

    // Use Convex data if available, otherwise use fallback
    const menuItems: NavigationItem[] = navigationItems?.filter((item: NavigationItem) => item.category === "main") || fallbackMenuItems;
    const bottomItems: NavigationItem[] = navigationItems?.filter((item: NavigationItem) => item.category === "bottom") || [];

    return (
        <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
            {/* Logo Only */}
            <div className="p-6 border-b border-gray-200 flex justify-center">
                <Image
                    src="/eventzgo_logo.png"
                    alt="EventzGo"
                    width={150}
                    height={40}
                />
            </div>

            {/* Admin Info */}
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                    <div className="bg-gradient-to-r from-red-500 to-red-600 w-12 h-12 rounded-xl flex items-center justify-center">
                        <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">
                            Administrator
                        </h3>
                        <p className="text-sm text-gray-500 capitalize">Admin Portal</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {menuItems.map((item: NavigationItem) => {
                    const Icon = iconMap[item.icon] || LayoutDashboard;
                    const isActive = pathname === item.path;

                    return (
                        <button
                            key={item.path}
                            onClick={() => router.push(item.path)}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${isActive
                                ? "bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-lg"
                                : "text-gray-700 hover:bg-gray-100"
                                }`}
                        >
                            <Icon
                                className={`w-5 h-5 ${isActive ? "text-white" : "text-gray-500"
                                    }`}
                            />
                            <span className="font-medium">{item.label}</span>
                        </button>
                    );
                })}
            </nav>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-gray-200 space-y-2">
                {bottomItems.map((item: NavigationItem) => {
                    const Icon = iconMap[item.icon] || Settings;
                    return (
                        <button
                            key={item.path}
                            onClick={() => router.push(item.path)}
                            className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200"
                        >
                            <Icon className="w-5 h-5 text-gray-500" />
                            <span className="font-medium">{item.label}</span>
                        </button>
                    );
                })}

                <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Sign Out</span>
                </button>
            </div>
        </div>
    );
};

export default AdminSidebar;
