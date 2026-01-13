import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Create booking
 */
export const createBooking = mutation({
  args: {
    bookingNumber: v.string(),
    eventId: v.id("events"),
    userId: v.optional(v.id("users")),
    guestDetails: v.optional(
      v.object({
        name: v.string(),
        email: v.string(),
        phone: v.string(),
      })
    ),
    tickets: v.array(
      v.object({
        ticketTypeId: v.string(),
        ticketTypeName: v.string(),
        quantity: v.number(),
        price: v.number(),
      })
    ),
    totalAmount: v.number(),
    pricing: v.object({
      subtotal: v.number(),
      gst: v.number(),
      platformFee: v.number(),
      total: v.number(),
      ticketGst: v.optional(v.number()),
      platformFeeGst: v.optional(v.number()),
    }),
    paymentId: v.id("payments"),
    qrCode: v.optional(v.string()),
    customFieldResponses: v.optional(
      v.array(
        v.object({
          fieldId: v.string(),
          label: v.string(),
          value: v.string(),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    for (const ticket of args.tickets) {
      const ticketType = event.ticketTypes.find((t) => t.id === ticket.ticketTypeId);
      if (!ticketType) {
        throw new Error(`Ticket type ${ticket.ticketTypeName} not found`);
      }

      const available = ticketType.quantity - ticketType.sold;
      if (available < ticket.quantity) {
        throw new Error(
          `Only ${available} tickets available for ${ticket.ticketTypeName}`
        );
      }
    }

    const bookingId = await ctx.db.insert("bookings", {
      bookingNumber: args.bookingNumber,
      eventId: args.eventId,
      userId: args.userId,
      guestDetails: args.guestDetails,
      tickets: args.tickets,
      totalAmount: args.totalAmount,
      pricing: args.pricing,
      paymentId: args.paymentId,
      status: "confirmed",
      qrCode: args.qrCode,
      customFieldResponses: args.customFieldResponses,
      isUsed: false,
      createdAt: now,
      updatedAt: now,
    });

    const updatedTicketTypes = event.ticketTypes.map((ticketType) => {
      const bookedTicket = args.tickets.find((t) => t.ticketTypeId === ticketType.id);
      if (bookedTicket) {
        return {
          ...ticketType,
          sold: ticketType.sold + bookedTicket.quantity,
        };
      }
      return ticketType;
    });

    const totalSold = args.tickets.reduce((sum, t) => sum + t.quantity, 0);

    await ctx.db.patch(args.eventId, {
      ticketTypes: updatedTicketTypes,
      soldTickets: event.soldTickets + totalSold,
      updatedAt: now,
    });

    return bookingId;
  },
});

export const getBookingById = query({
  args: { bookingId: v.id("bookings") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.bookingId);
  },
});

export const getBookingByNumber = query({
  args: { bookingNumber: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("bookings")
      .withIndex("by_booking_number", (q) => q.eq("bookingNumber", args.bookingNumber))
      .first();
  },
});

/**
 * Get all bookings (Admin)
 */
export const getAllBookings = query({
  handler: async (ctx) => {
    return await ctx.db.query("bookings").order("desc").collect();
  },
});

export const getBookingsByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("bookings")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

export const getBookingsByEvent = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("bookings")
      .withIndex("by_event_id", (q) => q.eq("eventId", args.eventId!))
      .order("desc")
      .collect();
  },
});

export const getBookingsWithEventDetails = query({
  args: { userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    let bookings;

    if (args.userId !== undefined) {
      bookings = await ctx.db
        .query("bookings")
        .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
        .order("desc")
        .collect();
    } else {
      bookings = await ctx.db.query("bookings").order("desc").collect();
    }

    const bookingsWithEvents = await Promise.all(
      bookings.map(async (booking) => {
        const event = await ctx.db.get(booking.eventId);
        return {
          ...booking,
          event,
        };
      })
    );

    return bookingsWithEvents;
  },
});

/**
 * Get MY bookings - includes user bookings + guest bookings with same email
 * Modified to accept userId as parameter instead of relying on ctx.auth
 */
export const getMyBookingsWithEvents = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);

    if (!user) {
      console.log("❌ No user found for userId:", args.userId);
      return [];
    }

    console.log("✅ User found:", { email: user.email, id: user._id });

    const allBookings = await ctx.db.query("bookings").collect();
    console.log("📊 Total bookings in DB:", allBookings.length);

    const myBookings = [];

    for (const booking of allBookings) {
      // Check by userId
      if (booking.userId && booking.userId === user._id) {
        console.log("✅ Matched by userId:", booking.bookingNumber);
        myBookings.push(booking);
        continue;
      }

      // Check by guest email
      if (booking.guestDetails) {
        const emailMatch = booking.guestDetails.email === user.email;
        console.log("🔍 Checking guest booking:", {
          bookingNumber: booking.bookingNumber,
          bookingEmail: booking.guestDetails.email,
          userEmail: user.email,
          match: emailMatch
        });

        if (emailMatch) {
          console.log("✅ Matched by email:", booking.bookingNumber);
          myBookings.push(booking);
        }
      }
    }

    console.log("📊 Final matched bookings:", myBookings.length);

    const bookingsWithEvents = await Promise.all(
      myBookings.map(async (booking) => {
        const event = await ctx.db.get(booking.eventId);
        return {
          ...booking,
          event,
        };
      })
    );

    return bookingsWithEvents.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const updateBookingStatus = mutation({
  args: {
    bookingId: v.id("bookings"),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("cancelled"),
      v.literal("refunded")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.bookingId, {
      status: args.status,
      updatedAt: Date.now(),
    });
    return args.bookingId;
  },
});

export const markBookingAsUsed = mutation({
  args: { bookingId: v.id("bookings") },
  handler: async (ctx, args) => {
    const now = Date.now();
    await ctx.db.patch(args.bookingId, {
      isUsed: true,
      usedAt: now,
      updatedAt: now,
    });
    return args.bookingId;
  },
});

export const cancelBooking = mutation({
  args: { bookingId: v.id("bookings") },
  handler: async (ctx, args) => {
    const booking = await ctx.db.get(args.bookingId);
    if (!booking) {
      throw new Error("Booking not found");
    }

    if (booking.status === "cancelled" || booking.status === "refunded") {
      throw new Error("Booking is already cancelled");
    }

    const event = await ctx.db.get(booking.eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    const now = Date.now();

    // Policy Checks
    if (event.cancellationPolicy) {
      if (!event.cancellationPolicy.isCancellable) {
        throw new Error("This event does not allow cancellations.");
      }

      const deadlineMs = event.cancellationPolicy.deadlineHoursBeforeStart * 60 * 60 * 1000;
      const deadlineTimestamp = event.dateTime.start - deadlineMs;

      if (now > deadlineTimestamp) {
        throw new Error(`Cancellation deadline passed. Must cancel ${event.cancellationPolicy.deadlineHoursBeforeStart} hours before event.`);
      }
    } else {
      // Default policy if none defined? Or allow freely? Or strictly disallow?
      // User requirement implies Organiser defines it. If undefined, maybe assume Non-Cancellable or Strict?
      // Let's assume Free Cancellation if not defined? No, safer to assume Non-Cancellable to protect revenue.
      // But for backward compatibility with existing events, maybe allow?
      // I'll assume: If policy is missing, it is NOT cancellable via this self-serve flow.
      throw new Error("No cancellation policy defined for this event. Please contact support.");
    }

    // Calculate Refund
    let refundAmount = 0;
    if (event.cancellationPolicy.refundPercentage > 0) {
      refundAmount = (booking.totalAmount * event.cancellationPolicy.refundPercentage) / 100;
    }

    // Update Booking Status
    await ctx.db.patch(args.bookingId, {
      status: "cancelled", // Or "refund_pending"? Keeping "cancelled" as per schema enum.
      updatedAt: now,
    });

    // Create Refund Record if amount > 0
    if (refundAmount > 0) {
      await ctx.db.insert("refunds", {
        bookingId: booking._id,
        paymentId: booking.paymentId,
        userId: booking.userId,
        amount: refundAmount,
        reason: "User requested cancellation",
        status: "approved", // Auto-approved by policy
        approvedAt: now, // approvedBy is optional
        createdAt: now,
        updatedAt: now,
      });
    }

    // Restore Inventory (Vacate Tickets)
    if (event) {
      const updatedTicketTypes = event.ticketTypes.map((ticketType) => {
        const cancelledTicket = booking.tickets.find(
          (t) => t.ticketTypeId === ticketType.id
        );
        if (cancelledTicket) {
          return {
            ...ticketType,
            sold: Math.max(0, ticketType.sold - cancelledTicket.quantity),
          };
        }
        return ticketType;
      });

      const totalCancelled = booking.tickets.reduce((sum, t) => sum + t.quantity, 0);

      await ctx.db.patch(booking.eventId, {
        ticketTypes: updatedTicketTypes,
        soldTickets: Math.max(0, event.soldTickets - totalCancelled),
        updatedAt: now,
      });
    }

    return args.bookingId;
  },
});

export const updateQRCode = mutation({
  args: {
    bookingId: v.id("bookings"),
    qrCode: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.bookingId, {
      qrCode: args.qrCode,
      updatedAt: Date.now(),
    });
    return args.bookingId;
  },
});

export const updatePDFUrl = mutation({
  args: {
    bookingId: v.id("bookings"),
    pdfUrl: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.bookingId, {
      pdfUrl: args.pdfUrl,
      updatedAt: Date.now(),
    });
    return args.bookingId;
  },
});

export const getBookingStats = query({
  args: {
    eventId: v.optional(v.id("events")),
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    let bookings;

    if (args.eventId !== undefined) {
      bookings = await ctx.db
        .query("bookings")
        .withIndex("by_event_id", (q) => q.eq("eventId", args.eventId!))
        .collect();
    } else if (args.userId !== undefined) {
      bookings = await ctx.db
        .query("bookings")
        .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
        .collect();
    } else {
      bookings = await ctx.db.query("bookings").collect();
    }

    const totalBookings = bookings.length;
    const confirmedBookings = bookings.filter((b) => b.status === "confirmed").length;
    const cancelledBookings = bookings.filter((b) => b.status === "cancelled").length;
    const totalRevenue = bookings
      .filter((b) => b.status === "confirmed")
      .reduce((sum, b) => sum + b.totalAmount, 0);
    const totalTickets = bookings
      .filter((b) => b.status === "confirmed")
      .reduce((sum, b) => sum + b.tickets.reduce((s, t) => s + t.quantity, 0), 0);

    return {
      totalBookings,
      confirmedBookings,
      cancelledBookings,
      totalRevenue,
      totalTickets,
    };
  },
});

export const getPendingBookings = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("bookings")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .order("desc")
      .collect();
  },
});

/**
 * Get all bookings for the authenticated organiser
 */
export const getOrganiserBookings = query({
  args: {
    organiserId: v.optional(v.id("organisers"))
  },
  handler: async (ctx, args) => {
    let organiserId = args.organiserId;

    if (!organiserId) {
      const identity = await ctx.auth.getUserIdentity();
      if (identity) {
        const user = await ctx.db
          .query("users")
          .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
          .first();

        if (user) {
          const organiser = await ctx.db
            .query("organisers")
            .withIndex("by_user_id", (q) => q.eq("userId", user._id))
            .first();

          if (organiser) {
            organiserId = organiser._id;
          }
        }
      }
    }

    if (!organiserId) {
      return [];
    }

    // Get all events for this organiser
    const events = await ctx.db
      .query("events")
      .withIndex("by_organiser_id", (q) => q.eq("organiserId", organiserId!))
      .collect();

    if (events.length === 0) {
      return [];
    }

    const eventIds = events.map(e => e._id);

    // Get bookings for these events
    // Ideally we would do this more efficiently but for now filtering all bookings is okay-ish for MVP
    // Better: use an index on bookings by eventId? (We have one!)
    // But we have multiple events. Convex doesn't support "in" array queries easily without Promise.all loop.

    // Using Promise.all is better than scanning table
    const bookingsPromises = eventIds.map(eventId =>
      ctx.db.query("bookings")
        .withIndex("by_event_id", (q) => q.eq("eventId", eventId))
        .collect()
    );

    const bookingsArrays = await Promise.all(bookingsPromises);
    const allBookings = bookingsArrays.flat();

    const organiserBookings = allBookings.map(b => {
      const event = events.find(e => e._id === b.eventId);
      return {
        ...b,
        eventName: event?.title || "Unknown Event",
        eventDate: event?.dateTime.start || 0,
      };
    });

    return organiserBookings.sort((a, b) => b.createdAt - a.createdAt);
  },
});