// src/components/management/OrganiserSidebar.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
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
    Ticket,
    QrCode,
} from 'lucide-react';

export default function OrganiserSidebar() {
    const router = useRouter();
    const pathname = usePathname();
    const { data: session } = useSession();
    const [organiserId, setOrganiserId] = useState<string | null>(null);

    useEffect(() => {
        const stored = localStorage.getItem("organiser_session");
        if (stored) {
            try {
                const sessionData = JSON.parse(stored);
                if (sessionData && sessionData.id) setOrganiserId(sessionData.id);
            } catch (e) { }
        }
    }, []);

    const organiserData = useQuery(
        api.organisers.getOrganiserById,
        organiserId ? { organiserId: organiserId as any } : "skip"
    );

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
        {
            icon: Ticket,
            label: 'Coupons',
            path: '/management/organiser/coupons',
        },
        {
            icon: QrCode,
            label: 'Staff Management',
            path: '/management/organiser/staff',
        },
    ];

    const handleLogout = async () => {
        // Clear local storage session
        localStorage.removeItem("organiser_session");

        // Sign out from NextAuth and redirect to sign-in
        await signOut({ callbackUrl: '/management/sign-in' });
    };

    return (
        <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
            {/* Logo */}
            <div className="p-6 border-b border-gray-200 flex justify-center">
                <Image
                    src="/eventzgo_logo.png"
                    alt="EventzGo"
                    width={150}
                    height={40}
                    className="cursor-pointer"
                    onClick={() => router.push('/management/organiser/dashboard')}
                />
            </div>

            {/* User Info */}
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-600 w-12 h-12 rounded-xl flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                            {(organiserData?.institutionName || session?.user?.name || session?.user?.username || 'O').charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">
                            {organiserData?.institutionName || session?.user?.name || session?.user?.username || 'Organiser'}
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
                    const isDashboard = item.path === '/management/organiser/dashboard';

                    // Disable all items except Dashboard if not approved
                    const isDisabled = !isDashboard &&
                        (organiserData?.accountStatus === 'pending_setup' ||
                            organiserData?.accountStatus === 'pending_approval' ||
                            organiserData?.accountStatus === 'pending_verification');

                    return (
                        <button
                            key={item.path}
                            onClick={() => !isDisabled && router.push(item.path)}
                            disabled={isDisabled}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${isDisabled
                                ? 'opacity-40 cursor-not-allowed blur-[0.5px] pointer-events-none'
                                : isActive
                                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                                    : 'text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            <Icon
                                className={`w-5 h-5 ${isDisabled
                                    ? 'text-gray-400'
                                    : isActive
                                        ? 'text-white'
                                        : 'text-gray-500'
                                    }`}
                            />
                            <span className="font-medium">{item.label}</span>
                        </button>
                    );
                })}
            </nav>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-gray-200 space-y-2">
                {/* Check if organiser is approved */}
                {(() => {
                    const isNotApproved = organiserData?.accountStatus === 'pending_setup' ||
                        organiserData?.accountStatus === 'pending_approval' ||
                        organiserData?.accountStatus === 'pending_verification';

                    return (
                        <>
                            <button
                                onClick={() => !isNotApproved && router.push('/management/organiser/notifications')}
                                disabled={isNotApproved}
                                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${isNotApproved
                                    ? 'opacity-40 cursor-not-allowed blur-[0.5px] pointer-events-none text-gray-400'
                                    : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                <Bell className="w-5 h-5" />
                                <span className="font-medium">Notifications</span>
                            </button>

                            <button
                                onClick={() => !isNotApproved && router.push('/management/organiser/settings')}
                                disabled={isNotApproved}
                                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${isNotApproved
                                    ? 'opacity-40 cursor-not-allowed blur-[0.5px] pointer-events-none text-gray-400'
                                    : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                <Settings className="w-5 h-5" />
                                <span className="font-medium">Settings</span>
                            </button>

                            <button
                                onClick={() => !isNotApproved && router.push('/management/organiser/help')}
                                disabled={isNotApproved}
                                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${isNotApproved
                                    ? 'opacity-40 cursor-not-allowed blur-[0.5px] pointer-events-none text-gray-400'
                                    : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                <HelpCircle className="w-5 h-5" />
                                <span className="font-medium">Help & Support</span>
                            </button>

                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
                            >
                                <LogOut className="w-5 h-5" />
                                <span className="font-medium">Sign Out</span>
                            </button>
                        </>
                    );
                })()}
            </div>
        </div>
    );
}