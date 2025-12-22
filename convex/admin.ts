import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get dashboard overview statistics
 */
export const getDashboardStats = query({
  handler: async (ctx) => {
    // Get all data
    const users = await ctx.db.query("users").collect();
    const organisers = await ctx.db.query("organisers").collect();
    const events = await ctx.db.query("events").collect();
    const bookings = await ctx.db.query("bookings").collect();
    const payments = await ctx.db.query("payments").collect();
    const refunds = await ctx.db.query("refunds").collect();
    const payouts = await ctx.db.query("payouts").collect();

    // User stats
    const totalUsers = users.length;
    const activeUsers = users.filter((u) => u.isActive).length;
    const totalOrganisers = organisers.filter((o) => o.approvalStatus === "approved")
      .length;
    const pendingOrganisers = organisers.filter((o) => o.approvalStatus === "pending")
      .length;

    // Event stats
    const totalEvents = events.length;
    const approvedEvents = events.filter((e) => e.status === "approved").length;
    const pendingEvents = events.filter((e) => e.status === "pending").length;
    const activeEvents = events.filter(
      (e) => e.status === "approved" && e.dateTime.end > Date.now()
    ).length;

    // Booking stats
    const totalBookings = bookings.length;
    const confirmedBookings = bookings.filter((b) => b.status === "confirmed").length;
    const cancelledBookings = bookings.filter((b) => b.status === "cancelled").length;

    // Revenue stats
    const totalRevenue = payments
      .filter((p) => p.status === "captured")
      .reduce((sum, p) => sum + p.amount, 0);

    const platformFee = payouts.reduce((sum, p) => sum + p.platformFee, 0);

    const refundedAmount = refunds
      .filter((r) => r.status === "processed")
      .reduce((sum, r) => sum + r.amount, 0);

    const netRevenue = totalRevenue - refundedAmount;

    // Payout stats
    const totalPayouts = payouts.length;
    const pendingPayouts = payouts.filter((p) => p.status === "pending").length;
    const completedPayouts = payouts.filter((p) => p.status === "completed").length;
    const payoutAmount = payouts
      .filter((p) => p.status === "completed")
      .reduce((sum, p) => sum + p.netAmount, 0);

    // Refund stats
    const totalRefunds = refunds.length;
    const pendingRefunds = refunds.filter((r) => r.status === "requested").length;

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
        organisers: totalOrganisers,
        pendingOrganisers,
      },
      events: {
        total: totalEvents,
        approved: approvedEvents,
        pending: pendingEvents,
        active: activeEvents,
      },
      bookings: {
        total: totalBookings,
        confirmed: confirmedBookings,
        cancelled: cancelledBookings,
      },
      revenue: {
        total: totalRevenue,
        platformFee,
        refunded: refundedAmount,
        net: netRevenue,
      },
      payouts: {
        total: totalPayouts,
        pending: pendingPayouts,
        completed: completedPayouts,
        amount: payoutAmount,
      },
      refunds: {
        total: totalRefunds,
        pending: pendingRefunds,
        amount: refundedAmount,
      },
    };
  },
});

/**
 * Get recent activities
 */
export const getRecentActivities = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;

    // Get recent bookings
    const recentBookings = await ctx.db
      .query("bookings")
      .order("desc")
      .take(limit);

    // Get recent organisers
    const recentOrganisers = await ctx.db
      .query("organisers")
      .order("desc")
      .take(limit);

    // Get recent events
    const recentEvents = await ctx.db
      .query("events")
      .order("desc")
      .take(limit);

    // Get recent refunds
    const recentRefunds = await ctx.db
      .query("refunds")
      .order("desc")
      .take(limit);

    return {
      bookings: recentBookings,
      organisers: recentOrganisers,
      events: recentEvents,
      refunds: recentRefunds,
    };
  },
});

/**
 * Get pending approvals
 */
export const getPendingApprovals = query({
  handler: async (ctx) => {
    const pendingOrganisers = await ctx.db
      .query("organisers")
      .withIndex("by_approval_status", (q) => q.eq("approvalStatus", "pending"))
      .order("desc")
      .collect();

    const pendingEvents = await ctx.db
      .query("events")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .order("desc")
      .collect();

    const pendingRefunds = await ctx.db
      .query("refunds")
      .withIndex("by_status", (q) => q.eq("status", "requested"))
      .order("desc")
      .collect();

    return {
      organisers: pendingOrganisers,
      events: pendingEvents,
      refunds: pendingRefunds,
      total: pendingOrganisers.length + pendingEvents.length + pendingRefunds.length,
    };
  },
});

/**
 * Get revenue breakdown
 */
export const getRevenueBreakdown = query({
  args: {
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let payments = await ctx.db.query("payments").collect();

    // Filter by date range if provided
    if (args.startDate) {
      payments = payments.filter((p) => p.createdAt >= args.startDate!);
    }
    if (args.endDate) {
      payments = payments.filter((p) => p.createdAt <= args.endDate!);
    }

    const successfulPayments = payments.filter((p) => p.status === "captured");

    // Group by date
    const revenueByDate = successfulPayments.reduce((acc, payment) => {
      const date = new Date(payment.createdAt).toISOString().split("T")[0];
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += payment.amount;
      return acc;
    }, {} as Record<string, number>);

    // Convert to array
    const revenueData = Object.entries(revenueByDate).map(([date, amount]) => ({
      date,
      amount,
    }));

    return revenueData.sort((a, b) => a.date.localeCompare(b.date));
  },
});

/**
 * Get top events by revenue
 */
export const getTopEventsByRevenue = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;

    const bookings = await ctx.db.query("bookings").collect();
    const confirmedBookings = bookings.filter((b) => b.status === "confirmed");

    // Group by event
    const revenueByEvent = confirmedBookings.reduce((acc, booking) => {
      const eventId = booking.eventId;
      if (!acc[eventId]) {
        acc[eventId] = 0;
      }
      acc[eventId] += booking.totalAmount;
      return acc;
    }, {} as Record<string, number>);

    // Convert to array and sort
    const eventRevenue = Object.entries(revenueByEvent)
      .map(([eventId, revenue]) => ({
        eventId,
        revenue,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit);

    // Fetch event details
    const topEvents = await Promise.all(
      eventRevenue.map(async ({ eventId, revenue }) => {
        const event = await ctx.db.get(eventId as any);
        return {
          event,
          revenue,
        };
      })
    );

    return topEvents;
  },
});

/**
 * Get category distribution
 */
export const getCategoryDistribution = query({
  handler: async (ctx) => {
    const events = await ctx.db.query("events").collect();

    const distribution = events.reduce((acc, event) => {
      const category = event.category;
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category]++;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(distribution).map(([category, count]) => ({
      category,
      count,
    }));
  },
});

/**
 * Get all pending users for verification
 */
export const getPendingUsers = query({
  args: {},
  handler: async (ctx) => {
    const pendingOrganisers = await ctx.db
      .query('organisers')
      .filter((q) => q.eq(q.field('approvalStatus'), 'pending'))
      .collect();

    const usersWithDetails = await Promise.all(
      pendingOrganisers.map(async (organiser) => {
        const user = await ctx.db
          .query('users')
          .filter((q) => q.eq(q.field('clerkId'), organiser.clerkId))
          .first();

        return {
          id: organiser._id,
          clerkId: organiser.clerkId,
          name: organiser.institutionName,
          email: user?.email || '',
          role: 'organiser',
          status: organiser.approvalStatus,
          createdAt: organiser._creationTime,
          institutionName: organiser.institutionName,
          address: organiser.address,
          gstNumber: organiser.gstNumber,
          panNumber: organiser.panNumber,
          bankDetails: organiser.bankDetails,
          documents: organiser.documents,
        };
      })
    );

    return usersWithDetails;
  },
});

/**
 * Approve a pending user
 */
export const approveUser = mutation({
  args: {
    organiserId: v.id('organisers'),
    adminNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const organiser = await ctx.db.get(args.organiserId);

    if (!organiser) {
      throw new Error('Organiser not found');
    }

    // Update organiser status in database
    await ctx.db.patch(args.organiserId, {
      approvalStatus: 'approved',
      approvedAt: Date.now(),
    });

    // Note: Clerk metadata will be automatically synced by the useOrganiserSync hook
    // when the organiser signs in next time

    return { success: true, organiserId: args.organiserId, clerkId: organiser.clerkId };
  },
});

/**
 * Reject a pending user
 */
export const rejectUser = mutation({
  args: {
    organiserId: v.id('organisers'),
    reason: v.string(),
    adminNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const organiser = await ctx.db.get(args.organiserId);

    if (!organiser) {
      throw new Error('Organiser not found');
    }

    // Update organiser status in database
    await ctx.db.patch(args.organiserId, {
      approvalStatus: 'rejected',
      rejectionReason: args.reason,
    });

    // Note: Clerk metadata will be automatically synced by the useOrganiserSync hook

    return { success: true, organiserId: args.organiserId };
  },
});

/**
 * Get all users with pagination and filters
 */
export const getAllUsers = query({
  args: {
    limit: v.number(),
    offset: v.number(),
    role: v.optional(v.string()),
    searchTerm: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get all users
    let users = await ctx.db.query("users").collect();

    // Apply role filter
    if (args.role && args.role !== 'all') {
      users = users.filter(user => user.role === args.role);
    }

    // Apply search filter
    if (args.searchTerm) {
      const searchLower = args.searchTerm.toLowerCase();
      users = users.filter(user =>
        user.email?.toLowerCase().includes(searchLower) ||
        user.firstName?.toLowerCase().includes(searchLower) ||
        user.lastName?.toLowerCase().includes(searchLower)
      );
    }

    const total = users.length;

    // Apply pagination
    const paginatedUsers = users.slice(args.offset, args.offset + args.limit);

    return {
      users: paginatedUsers,
      total,
      hasMore: args.offset + args.limit < total,
    };
  },
});
