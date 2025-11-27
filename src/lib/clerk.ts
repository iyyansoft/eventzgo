import { auth } from "@clerk/nextjs/server";
import { UserRole } from "@/types";

/**
 * Get current user role from Clerk
 */
export async function getCurrentUserRole(): Promise<UserRole | null> {
  const { sessionClaims } = await auth();
  
  if (!sessionClaims) {
    return null;
  }
  
  // Clerk stores custom roles in public metadata
  const role = (sessionClaims as any).metadata?.role as UserRole | undefined;
  return role || "user";
}

/**
 * Check if user has specific role
 */
export async function hasRole(role: UserRole): Promise<boolean> {
  const userRole = await getCurrentUserRole();
  return userRole === role;
}

/**
 * Check if user is admin
 */
export async function isAdmin(): Promise<boolean> {
  return hasRole("admin");
}

/**
 * Check if user is organiser
 */
export async function isOrganiser(): Promise<boolean> {
  return hasRole("organiser");
}

/**
 * Get user ID from Clerk
 */
export async function getCurrentUserId(): Promise<string | null> {
  const { userId } = await auth();
  return userId;
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const { userId } = await auth();
  return !!userId;
}

/**
 * Require authentication (throws if not authenticated)
 */
export async function requireAuth(): Promise<string> {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Unauthorized: Authentication required");
  }
  
  return userId;
}

/**
 * Require specific role (throws if not authorized)
 */
export async function requireRole(role: UserRole): Promise<string> {
  const userId = await requireAuth();
  const userRole = await getCurrentUserRole();
  
  if (userRole !== role) {
    throw new Error(`Unauthorized: ${role} role required`);
  }
  
  return userId;
}

/**
 * Require admin role
 */
export async function requireAdmin(): Promise<string> {
  return requireRole("admin");
}

/**
 * Require organiser role
 */
export async function requireOrganiser(): Promise<string> {
  return requireRole("organiser");
}