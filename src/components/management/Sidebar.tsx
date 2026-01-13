"use client";

import React from "react";
import Image from "next/image";
import { APP_CONFIG } from "@/constants/config";
import { useRouter, usePathname } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";
import { signOut as nextAuthSignOut } from "next-auth/react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Settings,
  LogOut,
  BarChart3,
  UserCheck,
  Building,
  Award,
  DollarSign,
  Briefcase,
  Mic,
  Target,
  MessageSquare,
  Bell,
  HelpCircle,
} from "lucide-react";

const Sidebar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isSignedIn } = useUser();

  const userData = useQuery(
    api.users.getUserByClerkId,
    isSignedIn && user ? { clerkId: user.id } : "skip"
  );

  const organiserData = useQuery(
    api.organisers.getOrganiserByUserId,
    userData && userData.role === "organiser" ? { userId: userData._id } : "skip"
  );

  const { signOut } = useClerk();

  const handleLogout = async () => {
    try {
      // Clear all sessions
      localStorage.removeItem("organiser_session");

      // Attempt NextAuth signout (silently)
      await nextAuthSignOut({ redirect: false });

      // Clerk signout (handles redirect)
      await signOut({ redirectUrl: "/management/sign-in" });

      router.push("/management/sign-in");
    } catch (error) {
      console.error("Logout error:", error);
      router.push("/management/sign-in");
    }
  };

  const getRoleIcon = (role: string) => {
    const icons = {
      admin: UserCheck,
      organiser: Building,
      attendee: Users,
    };
    return icons[role as keyof typeof icons] || UserCheck;
  };

  const getRoleColor = (role: string) => {
    const colors = {
      admin: "from-red-500 to-red-600",
      organiser: "from-blue-500 to-blue-600",
      attendee: "from-green-500 to-green-600",
    };
    return colors[role as keyof typeof colors] || "from-gray-500 to-gray-600";
  };

  const getMenuItems = () => {
    const commonItems = [
      {
        icon: LayoutDashboard,
        label: "Dashboard",
        path: "/management/dashboard",
      },
      { icon: BarChart3, label: "Analytics", path: "/management/analytics" },
      { icon: MessageSquare, label: "Messages", path: "/management/messages" },
      { icon: Bell, label: "Notifications", path: "/management/notifications" },
    ];

    const roleSpecificItems = {
      admin: [
        { icon: Users, label: "User Management", path: "/management/users" },
        { icon: Calendar, label: "All Events", path: "/management/events" },
        { icon: Settings, label: "Platform Settings", path: "/management/platform-settings" },
      ],
      organiser: [
        { icon: Calendar, label: "My Events", path: "/management/events" },
        { icon: Users, label: "Connections", path: "/management/connections" },
        { icon: Target, label: "Find Partners", path: "/management/partners" },
        { icon: Building, label: "Onboarding Info", path: "/management/organiser/onboarding" },
      ],
    };

    return [
      ...commonItems,
      ...(roleSpecificItems[userData?.role as keyof typeof roleSpecificItems] || []),
    ];
  };

  const menuItems = getMenuItems();
  const RoleIcon = getRoleIcon(userData?.role || "attendee");

  if (!userData) {
    return null;
  }

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200 flex justify-center">
        <Image
          src="/eventzgo_logo.png"
          alt={APP_CONFIG.name}
          width={75}
          height={75}
        />
      </div>

      {/* User Info */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div
            className={`bg-gradient-to-r ${getRoleColor(
              userData.role
            )} w-12 h-12 rounded-xl flex items-center justify-center`}
          >
            {user?.imageUrl ? (
              <Image
                src={user.imageUrl}
                alt={`${userData.firstName || ''} ${userData.lastName || ''}`}
                width={48}
                height={48}
                className="w-12 h-12 rounded-xl object-cover"
              />
            ) : (
              <RoleIcon className="w-6 h-6 text-white" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">
              {userData.role === "organiser" && organiserData?.institutionName
                ? organiserData.institutionName
                : `${userData.firstName} ${userData.lastName}`}
            </h3>
            <p className="text-sm text-gray-500 capitalize">{userData.role}</p>
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
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
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
        <button
          onClick={() => router.push("/management/settings")}
          className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200"
        >
          <Settings className="w-5 h-5 text-gray-500" />
          <span className="font-medium">Settings</span>
        </button>

        <button
          onClick={() => router.push("/management/help")}
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
};

export default Sidebar;