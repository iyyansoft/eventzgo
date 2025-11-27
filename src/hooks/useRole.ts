import { useAuth } from "./useAuth";
import { UserRole } from "@/types";

export function useRole() {
  const { role, isAdmin, isOrganiser, isUser } = useAuth();

  const hasRole = (requiredRole: UserRole): boolean => {
    if (requiredRole === "admin") {
      return isAdmin;
    }
    if (requiredRole === "organiser") {
      return isOrganiser;
    }
    return true; // Everyone has "user" role
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    return roles.some((r) => hasRole(r));
  };

  return {
    role,
    isAdmin,
    isOrganiser,
    isUser,
    hasRole,
    hasAnyRole,
  };
}