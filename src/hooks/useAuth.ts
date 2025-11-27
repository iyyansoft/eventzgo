"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useEffect, useRef } from "react";

export function useAuth() {
  const { user, isLoaded, isSignedIn } = useUser();
  const syncUser = useMutation(api.users.syncUser);
  const hasSynced = useRef(false);

  // Get user from Convex
  const convexUser = useQuery(
    api.users.getUserByClerkId,
    user?.id ? { clerkId: user.id } : "skip"
  );

  // Auto-sync user to Convex if signed in but not in database
  useEffect(() => {
    const autoSyncUser = async () => {
      // Only sync if:
      // 1. User is signed in
      // 2. Clerk user is loaded
      // 3. Convex user doesn't exist
      // 4. Haven't already attempted sync
      if (isSignedIn && isLoaded && user && !convexUser && !hasSynced.current) {
        hasSynced.current = true;

        try {
          console.log("🔄 Auto-syncing user to Convex...");

          await syncUser({
            clerkId: user.id,
            email: user.primaryEmailAddress?.emailAddress || "",
            firstName: user.firstName || undefined,
            lastName: user.lastName || undefined,
            profileImage: user.imageUrl || undefined,
            phone: user.primaryPhoneNumber?.phoneNumber || undefined,
          });

          console.log("✅ User auto-synced successfully!");
        } catch (error) {
          console.error("❌ Auto-sync failed:", error);
          hasSynced.current = false; // Allow retry
        }
      }
    };

    autoSyncUser();
  }, [isSignedIn, isLoaded, user, convexUser, syncUser]);

  const role = convexUser?.role || "user";

  return {
    // Clerk user data
    user,
    isLoaded,
    isSignedIn,
    isAuthenticated: isSignedIn,

    // Convex user data
    convexUser,

    // Role information
    role,
    isAdmin: role === "admin",
    isOrganiser: role === "organiser" || role === "admin",
    isUser: role === "user",

    // User details
    userId: user?.id,
    email: user?.emailAddresses[0]?.emailAddress,
    fullName: user?.fullName || "",
    firstName: user?.firstName,
    lastName: user?.lastName,
    imageUrl: user?.imageUrl,

    // Legacy compatibility
    name: user?.fullName || `${user?.firstName || ""} ${user?.lastName || ""}`.trim(),
    avatar: user?.imageUrl,
  };
}