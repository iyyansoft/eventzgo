import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Create event
 */
export const createEvent = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    category: v.string(),
    tags: v.array(v.string()),
    bannerImage: v.string(),
    galleryImages: v.optional(v.array(v.string())),
    venue: v.object({
      name: v.string(),
      address: v.string(),
      city: v.string(),
      state: v.string(),
      pincode: v.string(),
      coordinates: v.optional(
        v.object({
          lat: v.number(),
          lng: v.number(),
        })
      ),
    }),
    dateTime: v.object({
      start: v.number(),
      end: v.number(),
    }),
    ticketTypes: v.array(
      v.object({
        id: v.string(),
        name: v.string(),
        price: v.number(),
        quantity: v.number(),
        sold: v.number(),
        description: v.optional(v.string()),
      })
    ),
    status: v.optional(
      v.union(
        v.literal("draft"),
        v.literal("pending"),
        v.literal("approved"),
        v.literal("rejected"),
        v.literal("published"),
        v.literal("cancelled")
      )
    ),
    customFields: v.optional(v.array(v.any())), // Add custom fields support
    cancellationPolicy: v.optional(v.object({
      isCancellable: v.boolean(),
      refundPercentage: v.number(),
      deadlineHoursBeforeStart: v.number(),
      description: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    // TEMPORARY: Get organiser ID (bypassing auth for now)
    let organiserId;

    try {
      // Try to get authenticated user
      const identity = await ctx.auth.getUserIdentity();

      if (identity) {
        // Get user from database
        const user = await ctx.db
          .query("users")
          .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
          .first();

        if (user) {
          // Get organiser profile
          const organiser = await ctx.db
            .query("organisers")
            .withIndex("by_user_id", (q) => q.eq("userId", user._id))
            .first();

          if (organiser) {
            organiserId = organiser._id;
          }
        }
      }
    } catch (error) {
      console.log("Auth not available, using default organiser");
    }

    // If no authenticated organiser, use the first organiser in the database
    if (!organiserId) {
      const firstOrganiser = await ctx.db.query("organisers").first();
      if (!firstOrganiser) {
        throw new Error("No organiser found. Please create an organiser profile first.");
      }
      organiserId = firstOrganiser._id;
    }

    const now = Date.now();

    // Calculate total capacity
    const totalCapacity = args.ticketTypes.reduce(
      (sum, ticket) => sum + ticket.quantity,
      0
    );

    // Calculate pricing
    const basePrice = Math.min(...args.ticketTypes.map((t) => t.price));
    const platformFeePercentage = 5;
    const gstPercentage = 18;
    const platformFee = (basePrice * platformFeePercentage) / 100;
    const subtotal = basePrice + platformFee;
    const gst = (subtotal * gstPercentage) / 100;
    const totalPrice = subtotal + gst;

    const eventId = await ctx.db.insert("events", {
      organiserId, // Use the organiser ID we found
      title: args.title,
      description: args.description,
      category: args.category,
      tags: args.tags,
      bannerImage: args.bannerImage,
      galleryImages: args.galleryImages,
      venue: args.venue,
      dateTime: args.dateTime,
      ticketTypes: args.ticketTypes,
      totalCapacity,
      soldTickets: 0,
      pricing: {
        basePrice,
        gst,
        platformFee,
        totalPrice,
      },
      status: args.status || "published",
      isFeatured: false,
      isActive: true,
      createdAt: now,
      updatedAt: now,
      ...(args.customFields && { customFields: args.customFields }), // Add custom fields if provided
      ...(args.cancellationPolicy && { cancellationPolicy: args.cancellationPolicy }),
    });

    return eventId;
  },
});

/**
 * Get event by ID
 */
export const getEventById = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.eventId);
  },
});

/**
 * Get events by organiser
 */
export const getEventsByOrganiser = query({
  args: { organiserId: v.id("organisers") },
  handler: async (ctx, args) => {
    const events = await ctx.db
      .query("events")
      .withIndex("by_organiser_id", (q) => q.eq("organiserId", args.organiserId))
      .order("desc")
      .collect();
    
    // Add revenue calculation to each event
    return events.map(event => ({
      ...event,
      revenue: event.soldTickets * (event.pricing?.totalPrice || 0),
    }));
  },
});

/**
 * Get all events (with filters)
 */
export const getAllEvents = query({
  args: {
    category: v.optional(v.string()),
    state: v.optional(v.string()),
    city: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("draft"),
        v.literal("pending"),
        v.literal("approved"),
        v.literal("rejected"),
        v.literal("published"),
        v.literal("cancelled")
      )
    ),
    isFeatured: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Start with base query
    let events = await ctx.db.query("events").collect();

    // Apply filters
    if (args.category) {
      events = events.filter((e) => e.category === args.category);
    }

    if (args.state) {
      events = events.filter((e) => typeof e.venue === 'object' && e.venue.state === args.state);
    }

    if (args.city) {
      events = events.filter((e) => typeof e.venue === 'object' && e.venue.city === args.city);
    }

    if (args.status) {
      events = events.filter((e) => e.status === args.status);
    }

    if (args.isFeatured !== undefined) {
      events = events.filter((e) => e.isFeatured === args.isFeatured);
    }

    // Sort by creation date (most recent first)
    events = events.sort((a, b) => b.createdAt - a.createdAt);

    // Apply limit if specified
    if (args.limit) {
      events = events.slice(0, args.limit);
    }

    return events;
  },
});

/**
 * Search events
 */
export const searchEvents = query({
  args: { searchTerm: v.string() },
  handler: async (ctx, args) => {
    const allEvents = await ctx.db.query("events").collect();

    const searchLower = args.searchTerm.toLowerCase();

    return allEvents.filter(
      (event) =>
        event.title.toLowerCase().includes(searchLower) ||
        event.description.toLowerCase().includes(searchLower) ||
        event.category.toLowerCase().includes(searchLower) ||
        event.tags.some((tag) => tag.toLowerCase().includes(searchLower)) ||
        (typeof event.venue === 'object' && (
          event.venue.city.toLowerCase().includes(searchLower) ||
          event.venue.state.toLowerCase().includes(searchLower)
        ))
    );
  },
});

/**
 * Update event
 */
export const updateEvent = mutation({
  args: {
    eventId: v.id("events"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    bannerImage: v.optional(v.string()),
    galleryImages: v.optional(v.array(v.string())),
    customFields: v.optional(v.array(v.any())),
    cancellationPolicy: v.optional(v.object({
      isCancellable: v.boolean(),
      refundPercentage: v.number(),
      deadlineHoursBeforeStart: v.number(),
      description: v.optional(v.string()),
    })),
    venue: v.optional(
      v.object({
        name: v.string(),
        address: v.string(),
        city: v.string(),
        state: v.string(),
        pincode: v.string(),
        coordinates: v.optional(
          v.object({
            lat: v.number(),
            lng: v.number(),
          })
        ),
      })
    ),
    dateTime: v.optional(
      v.object({
        start: v.number(),
        end: v.number(),
      })
    ),
    ticketTypes: v.optional(
      v.array(
        v.object({
          id: v.string(),
          name: v.string(),
          price: v.number(),
          quantity: v.number(),
          sold: v.number(),
          description: v.optional(v.string()),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    const { eventId, ...updates } = args;

    // Recalculate capacity if ticket types changed
    if (updates.ticketTypes) {
      const totalCapacity = updates.ticketTypes.reduce(
        (sum, ticket) => sum + ticket.quantity,
        0
      );
      (updates as any).totalCapacity = totalCapacity;
    }

    await ctx.db.patch(eventId, {
      ...updates,
      updatedAt: Date.now(),
    });

    return eventId;
  },
});

/**
 * Approve event (Admin only)
 */
export const approveEvent = mutation({
  args: {
    eventId: v.id("events"),
    approvedBy: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    await ctx.db.patch(args.eventId, {
      status: "approved",
      ...(args.approvedBy && { approvedBy: args.approvedBy }),
      approvedAt: now,
      updatedAt: now,
    });

    return args.eventId;
  },
});

/**
 * Reject event (Admin only)
 */
export const rejectEvent = mutation({
  args: {
    eventId: v.id("events"),
    rejectionReason: v.string(),
    approvedBy: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.eventId, {
      status: "rejected",
      rejectionReason: args.rejectionReason,
      ...(args.approvedBy && { approvedBy: args.approvedBy }),
      approvedAt: Date.now(),
      updatedAt: Date.now(),
    });

    return args.eventId;
  },
});

/**
 * Toggle featured status
 */
export const toggleFeatured = mutation({
  args: {
    eventId: v.id("events"),
    isFeatured: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.eventId, {
      isFeatured: args.isFeatured,
      updatedAt: Date.now(),
    });

    return args.eventId;
  },
});

/**
 * Cancel event
 */
export const cancelEvent = mutation({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.eventId, {
      status: "cancelled",
      updatedAt: Date.now(),
    });

    return args.eventId;
  },
});

/**
 * Get pending events (Admin only)
 */
export const getPendingEvents = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("events")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .order("desc")
      .collect();
  },
});

/**
 * Get featured events
 */
export const getFeaturedEvents = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const events = await ctx.db
      .query("events")
      .withIndex("by_featured", (q) => q.eq("isFeatured", true))
      .filter((q) => q.eq(q.field("status"), "approved"))
      .order("desc")
      .collect();

    if (args.limit) {
      return events.slice(0, args.limit);
    }

    return events;
  },
});

/**
 * Get trending events (sorted by sold tickets)
 */
export const getTrendingEvents = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const events = await ctx.db
      .query("events")
      .filter((q) => q.eq(q.field("status"), "approved"))
      .order("desc")
      .collect();

    // Sort by soldTickets (trending)
    const sortedEvents = events.sort((a, b) => b.soldTickets - a.soldTickets);

    if (args.limit) {
      return sortedEvents.slice(0, args.limit);
    }

    return sortedEvents;
  },
});

/**
 * Get events by category
 */
export const getEventsByCategory = query({
  args: {
    category: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const events = await ctx.db
      .query("events")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .filter((q) => q.eq(q.field("status"), "approved"))
      .order("desc")
      .collect();

    if (args.limit) {
      return events.slice(0, args.limit);
    }

    return events;
  },
});

/**
 * Get events by state
 */
export const getEventsByState = query({
  args: {
    state: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const events = await ctx.db
      .query("events")
      .withIndex("by_state", (q) => q.eq("venue.state", args.state))
      .filter((q) => q.eq(q.field("status"), "approved"))
      .order("desc")
      .collect();

    if (args.limit) {
      return events.slice(0, args.limit);
    }

    return events;
  },
});

/**
 * Get events by city
 */
export const getEventsByCity = query({
  args: {
    city: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const events = await ctx.db
      .query("events")
      .withIndex("by_city", (q) => q.eq("venue.city", args.city))
      .filter((q) => q.eq(q.field("status"), "approved"))
      .order("desc")
      .collect();

    if (args.limit) {
      return events.slice(0, args.limit);
    }

    return events;
  },
});

/**
 * Get events for current organiser (for dashboard)
 */
export const getOrganiserEvents = query({
  args: {
    organiserId: v.id("organisers"),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    // Get events for this organiser
    const events = await ctx.db
      .query("events")
      .withIndex("by_organiser_id", (q) => q.eq("organiserId", args.organiserId))
      .order("desc")
      .collect();

    if (args.limit) {
      return events.slice(0, args.limit);
    }

    return events;
  },
});

/**
 * Get all events grouped by organiser (for admin panel)
 */
export const getAllEventsGroupedByOrganiser = query({
  handler: async (ctx) => {
    // Get all events
    const events = await ctx.db.query("events").collect();

    // Get all organisers
    const organisers = await ctx.db.query("organisers").collect();

    // Group events by organiser
    const groupedEvents = organisers.map(organiser => {
      const organiserEvents = events.filter(event =>
        event.organiserId === organiser._id
      );

      // Calculate total revenue for this organiser
      const totalRevenue = organiserEvents.reduce((sum, event) => {
        // Revenue = soldTickets * pricing.totalPrice
        const eventRevenue = event.soldTickets * (event.pricing?.totalPrice || 0);
        return sum + eventRevenue;
      }, 0);

      return {
        organiser: {
          _id: organiser._id,
          institutionName: organiser.institutionName,
          email: organiser.email,
          contactPerson: organiser.contactPerson,
        },
        events: organiserEvents.map(event => ({
          ...event,
          revenue: event.soldTickets * (event.pricing?.totalPrice || 0),
        })),
        totalEvents: organiserEvents.length,
        activeEvents: organiserEvents.filter(e => e.status === 'published').length,
        completedEvents: organiserEvents.filter(e => e.status === 'pending').length, // Using pending as completed for now
        draftEvents: organiserEvents.filter(e => e.status === 'draft').length,
        totalRevenue: totalRevenue,
      };
    }).filter(group => group.totalEvents > 0); // Only show organisers with events

    return groupedEvents;
  },
});
