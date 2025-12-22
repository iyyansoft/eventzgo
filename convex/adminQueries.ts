import { v } from "convex/values";
import { query } from "./_generated/server";

// Query to get all users with detailed information
export const getAllUsers = query({
    args: {
        limit: v.optional(v.number()),
        offset: v.optional(v.number()),
        role: v.optional(v.string()),
        searchTerm: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        let users;

        // Filter by role if provided
        if (args.role && args.role !== "all") {
            users = await ctx.db
                .query("users")
                .withIndex("by_role", (q) => q.eq("role", args.role as any))
                .collect();
        } else {
            users = await ctx.db.query("users").collect();
        }

        // Filter by search term if provided
        if (args.searchTerm) {
            const searchLower = args.searchTerm.toLowerCase();
            users = users.filter(
                (user) =>
                    user.email.toLowerCase().includes(searchLower) ||
                    user.firstName?.toLowerCase().includes(searchLower) ||
                    user.lastName?.toLowerCase().includes(searchLower)
            );
        }

        // Sort by creation date (newest first)
        users.sort((a, b) => b.createdAt - a.createdAt);

        // Apply pagination
        const offset = args.offset || 0;
        const limit = args.limit || 50;
        const paginatedUsers = users.slice(offset, offset + limit);

        return {
            users: paginatedUsers,
            total: users.length,
            hasMore: offset + limit < users.length,
        };
    },
});

// Query to get user statistics
export const getUserStats = query({
    args: {},
    handler: async (ctx) => {
        const users = await ctx.db.query("users").collect();

        const stats = {
            total: users.length,
            active: users.filter((u) => u.isActive).length,
            byRole: {
                user: users.filter((u) => u.role === "user").length,
                organiser: users.filter((u) => u.role === "organiser").length,
                admin: users.filter((u) => u.role === "admin").length,
                vendor: users.filter((u) => u.role === "vendor").length,
                speaker: users.filter((u) => u.role === "speaker").length,
                sponsor: users.filter((u) => u.role === "sponsor").length,
            },
        };

        return stats;
    },
});

// Query to get all events with organizer details
export const getAllEvents = query({
    args: {
        limit: v.optional(v.number()),
        offset: v.optional(v.number()),
        status: v.optional(v.string()),
        searchTerm: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        let events;

        // Filter by status if provided
        if (args.status && args.status !== "all") {
            events = await ctx.db
                .query("events")
                .withIndex("by_status", (q) => q.eq("status", args.status as any))
                .collect();
        } else {
            events = await ctx.db.query("events").collect();
        }

        // Get organizer details for each event
        const eventsWithOrganizers = await Promise.all(
            events.map(async (event) => {
                const organiser = await ctx.db.get(event.organiserId);
                return {
                    ...event,
                    organiserName: organiser?.institutionName || "Unknown",
                };
            })
        );

        // Filter by search term if provided
        let filteredEvents = eventsWithOrganizers;
        if (args.searchTerm) {
            const searchLower = args.searchTerm.toLowerCase();
            filteredEvents = eventsWithOrganizers.filter(
                (event) =>
                    event.title.toLowerCase().includes(searchLower) ||
                    event.organiserName.toLowerCase().includes(searchLower) ||
                    event.category.toLowerCase().includes(searchLower)
            );
        }

        // Sort by creation date (newest first)
        filteredEvents.sort((a, b) => b.createdAt - a.createdAt);

        // Apply pagination
        const offset = args.offset || 0;
        const limit = args.limit || 50;
        const paginatedEvents = filteredEvents.slice(offset, offset + limit);

        return {
            events: paginatedEvents,
            total: filteredEvents.length,
            hasMore: offset + limit < filteredEvents.length,
        };
    },
});

// Query to get event statistics
export const getEventStats = query({
    args: {},
    handler: async (ctx) => {
        const events = await ctx.db.query("events").collect();

        const stats = {
            total: events.length,
            byStatus: {
                draft: events.filter((e) => e.status === "draft").length,
                pending: events.filter((e) => e.status === "pending").length,
                approved: events.filter((e) => e.status === "approved").length,
                published: events.filter((e) => e.status === "published").length,
                rejected: events.filter((e) => e.status === "rejected").length,
                cancelled: events.filter((e) => e.status === "cancelled").length,
            },
            totalTicketsSold: events.reduce((sum, e) => sum + e.soldTickets, 0),
            totalCapacity: events.reduce((sum, e) => sum + e.totalCapacity, 0),
        };

        return stats;
    },
});

// Query to get comprehensive analytics
export const getAnalytics = query({
    args: {
        startDate: v.optional(v.number()),
        endDate: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const users = await ctx.db.query("users").collect();
        const events = await ctx.db.query("events").collect();
        const bookings = await ctx.db.query("bookings").collect();
        const payments = await ctx.db.query("payments").collect();

        // Filter by date range if provided
        const filteredBookings = args.startDate && args.endDate
            ? bookings.filter(
                (b) => b.createdAt >= args.startDate! && b.createdAt <= args.endDate!
            )
            : bookings;

        // Calculate revenue
        const totalRevenue = filteredBookings.reduce(
            (sum, b) => sum + b.totalAmount,
            0
        );

        // User growth data (last 30 days)
        const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
        const userGrowth = users
            .filter((u) => u.createdAt >= thirtyDaysAgo)
            .reduce((acc, user) => {
                const date = new Date(user.createdAt).toLocaleDateString();
                acc[date] = (acc[date] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);

        // Event distribution by category
        const eventsByCategory = events.reduce((acc, event) => {
            acc[event.category] = (acc[event.category] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        // Booking trends (last 30 days)
        const bookingTrends = filteredBookings
            .filter((b) => b.createdAt >= thirtyDaysAgo)
            .reduce((acc, booking) => {
                const date = new Date(booking.createdAt).toLocaleDateString();
                acc[date] = (acc[date] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);

        // Revenue by event
        const revenueByEvent = await Promise.all(
            events.slice(0, 10).map(async (event) => {
                const eventBookings = bookings.filter((b) => b.eventId === event._id);
                const revenue = eventBookings.reduce((sum, b) => sum + b.totalAmount, 0);
                return {
                    eventTitle: event.title,
                    revenue,
                    bookings: eventBookings.length,
                };
            })
        );

        return {
            overview: {
                totalUsers: users.length,
                totalEvents: events.length,
                totalBookings: filteredBookings.length,
                totalRevenue,
                activeEvents: events.filter((e) => e.status === "published").length,
            },
            userGrowth: Object.entries(userGrowth).map(([date, count]) => ({
                date,
                count,
            })),
            eventsByCategory: Object.entries(eventsByCategory).map(
                ([category, count]) => ({ category, count })
            ),
            bookingTrends: Object.entries(bookingTrends).map(([date, count]) => ({
                date,
                count,
            })),
            revenueByEvent: revenueByEvent.sort((a, b) => b.revenue - a.revenue),
            usersByRole: {
                user: users.filter((u) => u.role === "user").length,
                organiser: users.filter((u) => u.role === "organiser").length,
                vendor: users.filter((u) => u.role === "vendor").length,
                speaker: users.filter((u) => u.role === "speaker").length,
                sponsor: users.filter((u) => u.role === "sponsor").length,
            },
        };
    },
});

// Query to get database statistics
export const getDatabaseStats = query({
    args: {},
    handler: async (ctx) => {
        const [
            users,
            organisers,
            vendors,
            speakers,
            sponsors,
            events,
            bookings,
            payments,
            refunds,
            payouts,
            notifications,
            emailLogs,
        ] = await Promise.all([
            ctx.db.query("users").collect(),
            ctx.db.query("organisers").collect(),
            ctx.db.query("vendors").collect(),
            ctx.db.query("speakers").collect(),
            ctx.db.query("sponsors").collect(),
            ctx.db.query("events").collect(),
            ctx.db.query("bookings").collect(),
            ctx.db.query("payments").collect(),
            ctx.db.query("refunds").collect(),
            ctx.db.query("payouts").collect(),
            ctx.db.query("notifications").collect(),
            ctx.db.query("emailLogs").collect(),
        ]);

        return {
            tables: [
                { name: "users", count: users.length, source: "Clerk (synced)" },
                { name: "organisers", count: organisers.length, source: "Convex" },
                { name: "vendors", count: vendors.length, source: "Convex" },
                { name: "speakers", count: speakers.length, source: "Convex" },
                { name: "sponsors", count: sponsors.length, source: "Convex" },
                { name: "events", count: events.length, source: "Convex" },
                { name: "bookings", count: bookings.length, source: "Convex" },
                { name: "payments", count: payments.length, source: "Convex" },
                { name: "refunds", count: refunds.length, source: "Convex" },
                { name: "payouts", count: payouts.length, source: "Convex" },
                { name: "notifications", count: notifications.length, source: "Convex" },
                { name: "emailLogs", count: emailLogs.length, source: "Convex" },
            ],
            totalRecords:
                users.length +
                organisers.length +
                vendors.length +
                speakers.length +
                sponsors.length +
                events.length +
                bookings.length +
                payments.length +
                refunds.length +
                payouts.length +
                notifications.length +
                emailLogs.length,
            dataHealth: {
                orphanedBookings: bookings.filter(
                    async (b) => !(await ctx.db.get(b.eventId))
                ).length,
                pendingOrganisers: organisers.filter((o) => o.approvalStatus === "pending")
                    .length,
                failedPayments: payments.filter((p) => p.status === "failed").length,
            },
        };
    },
});

// Query to get table data
export const getTableData = query({
    args: {
        tableName: v.string(),
        limit: v.optional(v.number()),
        offset: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const limit = args.limit || 50;
        const offset = args.offset || 0;

        let data: any[] = [];
        let total = 0;

        switch (args.tableName) {
            case "users":
                const allUsers = await ctx.db.query("users").collect();
                total = allUsers.length;
                data = allUsers.slice(offset, offset + limit);
                break;
            case "events":
                const allEvents = await ctx.db.query("events").collect();
                total = allEvents.length;
                data = allEvents.slice(offset, offset + limit);
                break;
            case "bookings":
                const allBookings = await ctx.db.query("bookings").collect();
                total = allBookings.length;
                data = allBookings.slice(offset, offset + limit);
                break;
            case "payments":
                const allPayments = await ctx.db.query("payments").collect();
                total = allPayments.length;
                data = allPayments.slice(offset, offset + limit);
                break;
            case "organisers":
                const allOrganisers = await ctx.db.query("organisers").collect();
                total = allOrganisers.length;
                data = allOrganisers.slice(offset, offset + limit);
                break;
            case "vendors":
                const allVendors = await ctx.db.query("vendors").collect();
                total = allVendors.length;
                data = allVendors.slice(offset, offset + limit);
                break;
            case "speakers":
                const allSpeakers = await ctx.db.query("speakers").collect();
                total = allSpeakers.length;
                data = allSpeakers.slice(offset, offset + limit);
                break;
            case "sponsors":
                const allSponsors = await ctx.db.query("sponsors").collect();
                total = allSponsors.length;
                data = allSponsors.slice(offset, offset + limit);
                break;
            default:
                throw new Error(`Unknown table: ${args.tableName}`);
        }

        return {
            data,
            total,
            hasMore: offset + limit < total,
        };
    },
});
