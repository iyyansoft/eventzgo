"use client";

import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/types";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Preloader from "./Preloader";

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  requiredRole: UserRole;
  fallbackUrl?: string;
}

export function RoleProtectedRoute({
  children,
  requiredRole,
  fallbackUrl = "/management",
}: RoleProtectedRouteProps) {
  const { isLoaded, isSignedIn, role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }

    // Check role
    if (requiredRole === "admin" && role !== "admin") {
      router.push(fallbackUrl);
      return;
    }

    if (requiredRole === "organiser" && role !== "organiser" && role !== "admin") {
      router.push(fallbackUrl);
      return;
    }
  }, [isLoaded, isSignedIn, role, requiredRole, router, fallbackUrl]);

  if (!isLoaded) {
    return <Preloader onComplete={() => {}} />;
  }

  if (!isSignedIn) {
    return <Preloader onComplete={() => {}} />;
  }

  // Check role before rendering
  if (requiredRole === "admin" && role !== "admin") {
    return <Preloader onComplete={() => {}} />;
  }

  if (requiredRole === "organiser" && role !== "organiser" && role !== "admin") {
    return <Preloader onComplete={() => {}} />;
  }

  return <>{children}</>;
}