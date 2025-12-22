// src/lib/constants.ts
export const USER_ROLES = {
    USER: 'user',
    ORGANISER: 'organiser',
    ADMIN: 'admin',
} as const;

export const USER_STATUS = {
    ACTIVE: 'active',
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    SUSPENDED: 'suspended',
} as const;

export const ORGANISER_STATUS = {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    SUSPENDED: 'suspended',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];
export type UserStatus = typeof USER_STATUS[keyof typeof USER_STATUS];
export type OrganiserStatus = typeof ORGANISER_STATUS[keyof typeof ORGANISER_STATUS];

export const ROUTES = {
    // Public
    HOME: '/',
    MANAGEMENT: '/management',

    // Auth
    SIGN_IN: '/sign-in',
    SIGN_UP: '/sign-up',

    // Management
    ONBOARDING: '/management/onboarding',
    PENDING_APPROVAL: '/management/pending-approval',

    // Organiser
    ORGANISER_DASHBOARD: '/management/organiser/dashboard',
    ORGANISER_EVENTS: '/management/organiser/events',
    ORGANISER_BOOKINGS: '/management/organiser/bookings',
    ORGANISER_ANALYTICS: '/management/organiser/analytics',
    ORGANISER_SETTINGS: '/management/organiser/settings',

    // Admin
    ADMIN_DASHBOARD: '/management/admin/dashboard',
    ADMIN_EVENTS: '/management/admin/events',
    ADMIN_USERS: '/management/admin/users',
    ADMIN_ORGANISERS: '/management/admin/organisers',
    ADMIN_ANALYTICS: '/management/admin/analytics',
    ADMIN_SETTINGS: '/management/admin/settings',
} as const;

export const PROTECTED_ROUTES = {
    ORGANISER: [
        ROUTES.ORGANISER_DASHBOARD,
        ROUTES.ORGANISER_EVENTS,
        ROUTES.ORGANISER_BOOKINGS,
        ROUTES.ORGANISER_ANALYTICS,
        ROUTES.ORGANISER_SETTINGS,
    ],
    ADMIN: [
        ROUTES.ADMIN_DASHBOARD,
        ROUTES.ADMIN_EVENTS,
        ROUTES.ADMIN_USERS,
        ROUTES.ADMIN_ORGANISERS,
        ROUTES.ADMIN_ANALYTICS,
        ROUTES.ADMIN_SETTINGS,
    ],
} as const;