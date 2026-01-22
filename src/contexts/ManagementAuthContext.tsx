"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

interface User {
    id: string;
    name: string;
    email: string;
    role: "user" | "organiser" | "admin" | "vendor" | "speaker" | "sponsor";
    avatar?: string;
    roleData?: any;
}

interface ManagementAuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    logout: () => void;
}

const ManagementAuthContext = createContext<ManagementAuthContextType | undefined>(
    undefined
);

export const ManagementAuthProvider = ({ children }: { children: ReactNode }) => {
    const { user: clerkUser, isLoaded } = useUser();
    const { signOut } = useClerk();

    // Fetch user profile from Convex if Clerk user exists
    // Note: Management users (organisers, vendors, etc.) use custom auth, not Clerk
    // This context is for regular Clerk users only
    const userProfile = useQuery(
        api.users.getCurrentUser,
        clerkUser?.id ? {} : "skip"
    );

    const user: User | null = clerkUser && userProfile
        ? {
            id: userProfile._id,
            name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || clerkUser.emailAddresses[0]?.emailAddress || "User",
            email: clerkUser.emailAddresses[0]?.emailAddress || "",
            role: userProfile.role,
            avatar: clerkUser.imageUrl,
        }
        : null;

    const logout = async () => {
        await signOut();
    };

    return (
        <ManagementAuthContext.Provider
            value={{
                user,
                isAuthenticated: !!clerkUser,
                isLoading: !isLoaded,
                logout,
            }}
        >
            {children}
        </ManagementAuthContext.Provider>
    );
};

export const useManagementAuth = () => {
    const context = useContext(ManagementAuthContext);
    if (context === undefined) {
        throw new Error("useManagementAuth must be used within ManagementAuthProvider");
    }
    return context;
};
