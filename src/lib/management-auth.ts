// src/lib/management-auth.ts
import { USER_ROLES, USER_STATUS, type UserRole, type UserStatus } from './constants';

export interface UserMetadata {
    role: UserRole;
    status: UserStatus;
    onboardingCompleted?: boolean;
}

export const setUserMetadata = async (userId: string, metadata: UserMetadata) => {
    // This will be handled by Clerk's public metadata
    // Called after sign up to set initial role and status
    return metadata;
};

export const getUserRole = (publicMetadata: Record<string, any>): UserRole => {
    return (publicMetadata?.role as UserRole) || USER_ROLES.USER;
};

export const getUserStatus = (publicMetadata: Record<string, any>): UserStatus => {
    return (publicMetadata?.status as UserStatus) || USER_STATUS.ACTIVE;
};

export const isOnboardingCompleted = (publicMetadata: Record<string, any>): boolean => {
    return publicMetadata?.onboardingCompleted === true;
};

export const isOrganiser = (publicMetadata: Record<string, any>): boolean => {
    return getUserRole(publicMetadata) === USER_ROLES.ORGANISER;
};

export const isAdmin = (publicMetadata: Record<string, any>): boolean => {
    return getUserRole(publicMetadata) === USER_ROLES.ADMIN;
};

export const isApprovedOrganiser = (publicMetadata: Record<string, any>): boolean => {
    return (
        isOrganiser(publicMetadata) &&
        getUserStatus(publicMetadata) === USER_STATUS.APPROVED
    );
};

export const isPendingOrganiser = (publicMetadata: Record<string, any>): boolean => {
    return (
        isOrganiser(publicMetadata) &&
        getUserStatus(publicMetadata) === USER_STATUS.PENDING
    );
};

export const canAccessOrganiserRoutes = (publicMetadata: Record<string, any>): boolean => {
    return isApprovedOrganiser(publicMetadata);
};

export const canAccessAdminRoutes = (publicMetadata: Record<string, any>): boolean => {
    return isAdmin(publicMetadata);
};

export const needsOnboarding = (publicMetadata: Record<string, any>): boolean => {
    return isOrganiser(publicMetadata) && !isOnboardingCompleted(publicMetadata);
};

export const needsApproval = (publicMetadata: Record<string, any>): boolean => {
    return (
        isOrganiser(publicMetadata) &&
        isOnboardingCompleted(publicMetadata) &&
        isPendingOrganiser(publicMetadata)
    );
};

export const getRedirectPath = (publicMetadata: Record<string, any>): string => {
    // Determine where to redirect based on user state
    if (isAdmin(publicMetadata)) {
        return '/management/admin/dashboard';
    }

    if (isOrganiser(publicMetadata)) {
        if (!isOnboardingCompleted(publicMetadata)) {
            return '/management/onboarding';
        }

        if (isPendingOrganiser(publicMetadata)) {
            return '/management/pending-approval';
        }

        if (isApprovedOrganiser(publicMetadata)) {
            return '/management/organiser/dashboard';
        }
    }

    return '/management';
};