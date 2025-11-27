// Utility functions to replace mockDatabase calls with Convex queries
// This maintains compatibility with existing frontend code

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

// Demo credentials for testing
export const DEMO_CREDENTIALS = {
    admin: {
        email: "admin@ticketshub.com",
        password: "demo123",
    },
    organizer: {
        email: "organizer@ticketshub.com",
        password: "demo123",
    },
    vendor: {
        email: "vendor@ticketshub.com",
        password: "demo123",
    },
    speaker: {
        email: "speaker@ticketshub.com",
        password: "demo123",
    },
    sponsor: {
        email: "sponsor@ticketshub.com",
        password: "demo123",
    },
};

// Notification type for compatibility
export interface Notification {
    id: string;
    userId: string;
    title: string;
    message: string;
    read: boolean;
    createdAt: string;
    type: "info" | "success" | "warning" | "error";
}

// Mock notifications - these would come from Convex in production
export const getNotificationsByUser = (userId: string): Notification[] => {
    // Return empty array for now - implement Convex notifications later
    return [];
};

// Event type for compatibility
export interface Event {
    id: string;
    title: string;
    description: string;
    date: string;
    venue: string;
    location: string;
    category: string;
    status: "draft" | "pending" | "published" | "cancelled";
    expectedAttendees: number;
    organizerId: string;
}

// Get events by organizer - use Convex query instead
export const getEventsByOrganizer = (organizerId: string): Event[] => {
    // This should be replaced with useQuery(api.events.getOrganiserEvents) in components
    return [];
};

// Connection type for compatibility
export interface Connection {
    id: string;
    userId: string;
    partnerType: "vendor" | "speaker" | "sponsor";
    status: "pending" | "accepted" | "rejected";
    createdAt: string;
}

// Get connections by user - use Convex query instead
export const getConnectionsByUser = (userId: string): Connection[] => {
    // This should be replaced with a Convex query in components
    return [];
};

// Helper to convert Convex user role to management role
export const convertToManagementRole = (
    role: string
): "admin" | "organiser" | "vendor" | "speaker" | "sponsor" => {
    const roleMap: Record<string, "admin" | "organiser" | "vendor" | "speaker" | "sponsor"> = {
        admin: "admin",
        organiser: "organiser",
        organizer: "organiser",
        vendor: "vendor",
        speaker: "speaker",
        sponsor: "sponsor",
    };
    return roleMap[role.toLowerCase()] || "organiser";
};
