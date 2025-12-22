// src/components/management/OrganiserSidebar.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useUser, useClerk } from '@clerk/nextjs';
import {
    LayoutDashboard,
    Calendar,
    Users,
    BarChart3,
    Settings,
    LogOut,
    HelpCircle,
    Bell,
    CreditCard,
} from 'lucide-react';

export default function OrganiserSidebar() {
    const router = useRouter();
    const pathname = usePathname();
    const { user } = useUser();
    const { signOut } = useClerk();

    const menuItems = [
        {
            icon: LayoutDashboard,
            label: 'Dashboard',
            path: '/management/organiser/dashboard',
        },
        {
            icon: Calendar,
            label: 'My Events',
            path: '/management/organiser/events',
        },
        {
            icon: Users,
            label: 'Bookings',
            path: '/management/organiser/bookings',
        },
        {
            icon: BarChart3,
            label: 'Analytics',
            path: '/management/organiser/analytics',
        },
        {
            icon: CreditCard,
            label: 'Payouts',
            path: '/management/organiser/payouts',
        },
    ];

    const handleLogout = async () => {
        await signOut();
        router.push('/management');
    };

    return (
        <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
            {/* Logo */}
            <div className="p-6 border-b border-gray-200 flex justify-center">
                <Image
                    src="/eventzgo_logo.png"
                    alt="EventzGo"
                    width={60}
                    height={60}
                    className="h-12 w-auto cursor-pointer"
                    onClick={() => router.push('/management/organiser/dashboard')}
                />
            </div>

            {/* User Info */}
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 w-12 h-12 rounded-xl flex items-center justify-center">
                        {user?.imageUrl ? (
                            <Image
                                src={user.imageUrl}
                                alt={user.firstName || 'User'}
                                width={48}
                                height={48}
                                className="w-12 h-12 rounded-xl object-cover"
                            />
                        ) : (
                            <span className="text-white font-bold text-lg">
                                {user?.firstName?.charAt(0) || 'U'}
                            </span>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">
                            {user?.firstName} {user?.lastName}
                        </h3>
                        <p className="text-sm text-gray-500">Organiser</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.path;

                    return (
                        <button
                            key={item.path}
                            onClick={() => router.push(item.path)}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${isActive
                                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                                    : 'text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            <Icon
                                className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500'
                                    }`}
                            />
                            <span className="font-medium">{item.label}</span>
                        </button>
                    );
                })}
            </nav>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-gray-200 space-y-2">
                <button
                    onClick={() => router.push('/management/organiser/notifications')}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200"
                >
                    <Bell className="w-5 h-5 text-gray-500" />
                    <span className="font-medium">Notifications</span>
                </button>

                <button
                    onClick={() => router.push('/management/organiser/settings')}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200"
                >
                    <Settings className="w-5 h-5 text-gray-500" />
                    <span className="font-medium">Settings</span>
                </button>

                <button
                    onClick={() => router.push('/management/organiser/help')}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200"
                >
                    <HelpCircle className="w-5 h-5 text-gray-500" />
                    <span className="font-medium">Help & Support</span>
                </button>

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
}