import { NextRequest, NextResponse } from "next/server";
import { sendBookingConfirmation } from "@/lib/resend";
import { api } from "../../../../../convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import { Id } from "../../../../../convex/_generated/dataModel";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId } = body;

    // Validate input
    if (!bookingId) {
      return NextResponse.json(
        { error: "Missing booking ID" },
        { status: 400 }
      );
    }

    // Fetch booking
    const booking = await fetchQuery(api.bookings.getBookingById, {
      bookingId: bookingId as Id<"bookings">,
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    // Fetch event
    const event = await fetchQuery(api.events.getEventById, {
      eventId: booking.eventId,
    });

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    const customerEmail = booking.guestDetails?.email || "";
    const customerName = booking.guestDetails?.name || "Guest User";

    // Send booking confirmation email with ticket
    const result = await sendBookingConfirmation(customerEmail, {
      bookingNumber: booking.bookingNumber,
      customerName,
      eventName: event.title,
      eventDate: new Date(event.dateTime.start).toLocaleString(),
      eventVenue: typeof event.venue === 'string'
        ? event.venue
        : `${event.venue.name}, ${event.venue.address}, ${event.venue.city}`,
      tickets: booking.tickets.map((t) => ({
        name: t.ticketTypeName,
        quantity: t.quantity,
      })),
      totalAmount: booking.totalAmount,
      qrCode: booking.qrCode || "",
    });

    if (!result.success) {
      throw new Error(result.error);
    }

    return NextResponse.json(
      { success: true, message: "Ticket email sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Email sending error:", error);
    return NextResponse.json(
      { error: "Failed to send ticket email" },
      { status: 500 }
    );
  }
}