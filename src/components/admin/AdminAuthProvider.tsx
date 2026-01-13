"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

interface AdminAuthContextType {
    sessionToken: string | null;
    isLoading: boolean;
    login: (token: string, user: any) => void;
    logout: () => void;
    user: any | null;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
    const [sessionToken, setSessionToken] = useState<string | null>(null);
    const [user, setUser] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    // Load session from localStorage on mount
    useEffect(() => {
        const storedToken = localStorage.getItem("admin_session_token");
        const storedUser = localStorage.getItem("admin_user");

        if (storedToken) {
            setSessionToken(storedToken);
            if (storedUser) {
                try {
                    setUser(JSON.parse(storedUser));
                } catch (e) {
                    console.error("Failed to parse admin user", e);
                }
            }
        }
        setIsLoading(false);
    }, []);

    const login = (token: string, userData: any) => {
        setSessionToken(token);
        setUser(userData);
        localStorage.setItem("admin_session_token", token);
        localStorage.setItem("admin_user", JSON.stringify(userData));
        document.cookie = `admin_token=${token}; path=/; max-age=86400; SameSite=Strict`; // For middleware
        router.push("/admin/dashboard");
    };

    const logout = () => {
        setSessionToken(null);
        setUser(null);
        localStorage.removeItem("admin_session_token");
        localStorage.removeItem("admin_user");
        document.cookie = "admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        router.push("/admin/login");
    };

    // Protect Admin Routes
    useEffect(() => {
        if (!isLoading) {
            const isLoginPage = pathname === "/admin/login";
            if (!sessionToken && !isLoginPage) {
                router.push("/admin/login");
            } else if (sessionToken && isLoginPage) {
                router.push("/admin/dashboard");
            }
        }
    }, [sessionToken, isLoading, pathname, router]);

    return (
        <AdminAuthContext.Provider value={{ sessionToken, isLoading, login, logout, user }}>
            {children}
        </AdminAuthContext.Provider>
    );
}

export function useAdminAuth() {
    const context = useContext(AdminAuthContext);
    if (context === undefined) {
        throw new Error("useAdminAuth must be used within an AdminAuthProvider");
    }
    return context;
}
