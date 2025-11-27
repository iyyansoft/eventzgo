import { query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get organiser analytics
 */
export const getOrganiserAnalytics = query({
  args: { organiserId: v.id("organisers") },
  handler: async (ctx, args) => {
    // Get organiser events
    const events = await ctx.db
      .query("events")
      .withIndex("by_organiser_id", (q) => q.eq("organiserId", args.organiserId))
      .collect();

    const eventIds = events.map((e) => e._id);

    // Get all bookings for organiser events
    const allBookings = await ctx.db.query("bookings").collect();
    const bookings = allBookings.filter((b) => eventIds.includes(b.eventId));

    // Get all payments for organiser events
    const allPayments = await ctx.db.query("payments").collect();
    const payments = allPayments.filter((p) => eventIds.includes(p.eventId));

    // Calculate stats
    const totalEvents = events.length;
    const publishedEvents = events.filter((e) => e.status === "approved").length;
    const totalBookings = bookings.length;
    const confirmedBookings = bookings.filter((b) => b.status === "confirmed").length;

    const totalRevenue = payments
      .filter((p) => p.status === "captured")
      .reduce((sum, p) => sum + p.amount, 0);

    const platformFeePercentage = 5;
    const platformFee = (totalRevenue * platformFeePercentage) / 100;
    const netRevenue = totalRevenue - platformFee;

    const totalTicketsSold = bookings
      .filter((b) => b.status === "confirmed")
      .reduce((sum, b) => sum + b.tickets.reduce((s, t) => s + t.quantity, 0), 0);

    // Revenue by event
    const revenueByEvent = events.map((event) => {
      const eventBookings = bookings.filter((b) => b.eventId === event._id);
      const eventRevenue = eventBookings
        .filter((b) => b.status === "confirmed")
        .reduce((sum, b) => sum + b.totalAmount, 0);
      const ticketsSold = eventBookings
        .filter((b) => b.status === "confirmed")
        .reduce((sum, b) => sum + b.tickets.reduce((s, t) => s + t.quantity, 0), 0);

      return {
        eventId: event._id,
        eventName: event.title,
        revenue: eventRevenue,
        ticketsSold,
        capacity: event.totalCapacity,
        occupancy: (ticketsSold / event.totalCapacity) * 100,
      };
    });

    // Revenue over time
    const revenueByDate = payments
      .filter((p) => p.status === "captured")
      .reduce((acc, payment) => {
        const date = new Date(payment.createdAt).toISOString().split("T")[0];
        if (!acc[date]) {
          acc[date] = 0;
        }
        acc[date] += payment.amount;
        return acc;
      }, {} as Record<string, number>);

    const revenueTimeline = Object.entries(revenueByDate)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      overview: {
        totalEvents,
        publishedEvents,
        totalBookings,
        confirmedBookings,
        totalRevenue,
        platformFee,
        netRevenue,
        totalTicketsSold,
      },
      revenueByEvent: revenueByEvent.sort((a, b) => b.revenue - a.revenue),
      revenueTimeline,
    };
  },
});

/**
 * Get event analytics
 */
export const getEventAnalytics = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    // Get bookings
    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_event_id", (q) => q.eq("eventId", args.eventId!))
      .collect();

    // Get payments
    const payments = await ctx.db
      .query("payments")
      .withIndex("by_event_id", (q) => q.eq("eventId", args.eventId!))
      .collect();

    // Calculate stats
    const totalBookings = bookings.length;
    const confirmedBookings = bookings.filter((b) => b.status === "confirmed").length;
    const cancelledBookings = bookings.filter((b) => b.status === "cancelled").length;

    const totalRevenue = payments
      .filter((p) => p.status === "captured")
      .reduce((sum, p) => sum + p.amount, 0);

    const totalTicketsSold = bookings
      .filter((b) => b.status === "confirmed")
      .reduce((sum, b) => sum + b.tickets.reduce((s, t) => s + t.quantity, 0), 0);

    const occupancyRate = (totalTicketsSold / event.totalCapacity) * 100;

    // Ticket type breakdown
    const ticketTypeStats = event.ticketTypes.map((ticketType) => {
      const sold = ticketType.sold;
      const revenue = sold * ticketType.price;
      const available = ticketType.quantity - sold;

      return {
        name: ticketType.name,
        price: ticketType.price,
        total: ticketType.quantity,
        sold,
        available,
        revenue,
      };
    });

    // Booking timeline
    const bookingsByDate = bookings
      .filter((b) => b.status === "confirmed")
      .reduce((acc, booking) => {
        const date = new Date(booking.createdAt).toISOString().split("T")[0];
        if (!acc[date]) {
          acc[date] = 0;
        }
        acc[date]++;
        return acc;
      }, {} as Record<string, number>);

    const bookingTimeline = Object.entries(bookingsByDate)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Revenue timeline
    const revenueByDate = payments
      .filter((p) => p.status === "captured")
      .reduce((acc, payment) => {
        const date = new Date(payment.createdAt).toISOString().split("T")[0];
        if (!acc[date]) {
          acc[date] = 0;
        }
        acc[date] += payment.amount;
        return acc;
      }, {} as Record<string, number>);

    const revenueTimeline = Object.entries(revenueByDate)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      event,
      overview: {
        totalBookings,
        confirmedBookings,
        cancelledBookings,
        totalRevenue,
        totalTicketsSold,
        capacity: event.totalCapacity,
        occupancyRate,
      },
      ticketTypes: ticketTypeStats,
      bookingTimeline,
      revenueTimeline,
    };
  },
});

/**
 * Get platform analytics
 */
export const getPlatformAnalytics = query({
  args: {
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Get all data
    let bookings = await ctx.db.query("bookings").collect();
    let payments = await ctx.db.query("payments").collect();
    let events = await ctx.db.query("events").collect();

    // Filter by date range
    if (args.startDate) {
      bookings = bookings.filter((b) => b.createdAt >= args.startDate!);
      payments = payments.filter((p) => p.createdAt >= args.startDate!);
      events = events.filter((e) => e.createdAt >= args.startDate!);
    }
    if (args.endDate) {
      bookings = bookings.filter((b) => b.createdAt <= args.endDate!);
      payments = payments.filter((p) => p.createdAt <= args.endDate!);
      events = events.filter((e) => e.createdAt <= args.endDate!);
    }

    // Overview stats
    const totalBookings = bookings.length;
    const totalEvents = events.length;
    const totalRevenue = payments
      .filter((p) => p.status === "captured")
      .reduce((sum, p) => sum + p.amount, 0);

    // Category breakdown
    const categoryStats = events.reduce((acc, event) => {
      if (!acc[event.category]) {
        acc[event.category] = {
          count: 0,
          revenue: 0,
          bookings: 0,
        };
      }

      acc[event.category].count++;

      const eventBookings = bookings.filter((b) => b.eventId === event._id);
      const eventRevenue = eventBookings
        .filter((b) => b.status === "confirmed")
        .reduce((sum, b) => sum + b.totalAmount, 0);

      acc[event.category].revenue += eventRevenue;
      acc[event.category].bookings += eventBookings.filter(
        (b) => b.status === "confirmed"
      ).length;

      return acc;
    }, {} as Record<string, { count: number; revenue: number; bookings: number }>);

    // State breakdown
    const stateStats = events.reduce((acc, event) => {
      const state = event.venue.state;
      if (!acc[state]) {
        acc[state] = {
          events: 0,
          revenue: 0,
        };
      }

      acc[state].events++;

      const eventRevenue = bookings
        .filter((b) => b.eventId === event._id && b.status === "confirmed")
        .reduce((sum, b) => sum + b.totalAmount, 0);

      acc[state].revenue += eventRevenue;

      return acc;
    }, {} as Record<string, { events: number; revenue: number }>);

    return {
      overview: {
        totalBookings,
        totalEvents,
        totalRevenue,
      },
      categories: Object.entries(categoryStats).map(([category, stats]) => ({
        category,
        ...stats,
      })),
      states: Object.entries(stateStats).map(([state, stats]) => ({
        state,
        ...stats,
      })),
    };
  },
});

/**
 * Get organiser sales data for dashboard charts
 * Updated to accept userId parameter
 */
export const getOrganiserSalesData = query({
  args: {
    period: v.string(),
    userId: v.id("users")
  },
  handler: async (ctx, args) => {
    // Get user from database
    const user = await ctx.db.get(args.userId);
    if (!user) {
      return [];
    }

    // Get organiser profile
    const organiser = await ctx.db
      .query("organisers")
      .withIndex("by_user_id", (q) => q.eq("userId", user._id))
      .first();

    if (!organiser) {
      // Return empty data if not an organiser
      return [];
    }

    // Get all events by this organizer
    const events = await ctx.db
      .query("events")
      .withIndex("by_organiser_id", (q) => q.eq("organiserId", organiser._id))
      .collect();

    const eventIds = events.map((e) => e._id);

    // Get all bookings for these events
    const allBookings = await Promise.all(
      eventIds.map((eventId) =>
        ctx.db
          .query("bookings")
          .withIndex("by_event_id", (q) => q.eq("eventId", eventId as any))
          .collect()
      )
    );

    const bookings = allBookings.flat();

    // Calculate date range based on period
    const now = Date.now();
    let startDate = now;

    if (args.period === "7days") {
      startDate = now - 7 * 24 * 60 * 60 * 1000;
    } else if (args.period === "30days") {
      startDate = now - 30 * 24 * 60 * 60 * 1000;
    } else if (args.period === "90days") {
      startDate = now - 90 * 24 * 60 * 60 * 1000;
    }

    // Filter bookings by date range
    const filteredBookings = bookings.filter((b) => b.createdAt >= startDate);

    // Group by date
    const salesByDate = filteredBookings.reduce((acc, booking) => {
      const date = new Date(booking.createdAt).toISOString().split("T")[0];
      if (!acc[date]) {
        acc[date] = {
          date,
          sales: 0,
          bookings: 0,
        };
      }
      acc[date].sales += booking.totalAmount;
      acc[date].bookings += 1;
      return acc;
    }, {} as Record<string, { date: string; sales: number; bookings: number }>);

    // Convert to array and sort by date
    const salesData = Object.values(salesByDate).sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    return salesData;
  },
});