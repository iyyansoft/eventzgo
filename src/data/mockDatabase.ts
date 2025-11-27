// Mock database for demo credentials and notifications

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

export interface Notification {
    id: string;
    userId: string;
    title: string;
    message: string;
    read: boolean;
    createdAt: string;
    type: "info" | "success" | "warning" | "error";
}

const mockNotifications: Notification[] = [
    {
        id: "notif-1",
        userId: "admin-1",
        title: "New Event Submission",
        message: "Tech Conference 2024 is pending approval",
        read: false,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        type: "info",
    },
    {
        id: "notif-2",
        userId: "admin-1",
        title: "Payout Request",
        message: "₹50,000 payout requested by Event Organizer",
        read: false,
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        type: "warning",
    },
    {
        id: "notif-3",
        userId: "organizer-1",
        title: "Event Approved",
        message: "Your event 'Music Festival 2024' has been approved",
        read: false,
        createdAt: new Date(Date.now() - 1800000).toISOString(),
        type: "success",
    },
    {
        id: "notif-4",
        userId: "organizer-1",
        title: "New Ticket Sale",
        message: "5 tickets sold for your event",
        read: true,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        type: "success",
    },
    {
        id: "notif-5",
        userId: "vendor-1",
        title: "New Service Request",
        message: "Event organizer requested catering services",
        read: false,
        createdAt: new Date(Date.now() - 5400000).toISOString(),
        type: "info",
    },
    {
        id: "notif-6",
        userId: "speaker-1",
        title: "Speaking Invitation",
        message: "You've been invited to speak at Tech Summit 2024",
        read: false,
        createdAt: new Date(Date.now() - 10800000).toISOString(),
        type: "info",
    },
    {
        id: "notif-7",
        userId: "sponsor-1",
        title: "Sponsorship Opportunity",
        message: "New event matching your preferences: Business Expo 2024",
        read: false,
        createdAt: new Date(Date.now() - 14400000).toISOString(),
        type: "info",
    },
];

export const getNotificationsByUser = (userId: string): Notification[] => {
    return mockNotifications.filter((notif) => notif.userId === userId);
};

export const getAllNotifications = (): Notification[] => {
    return mockNotifications;
};
