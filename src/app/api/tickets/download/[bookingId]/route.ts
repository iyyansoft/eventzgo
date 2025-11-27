import { NextRequest, NextResponse } from "next/server";
import { generateTicketPDF } from "@/lib/pdf-generator";
import { api } from "@/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import { Id } from "@/convex/_generated/dataModel";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const resolvedParams = await params;
    const bookingId = resolvedParams.bookingId as Id<"bookings">;

    // Fetch booking from Convex
    const booking = await fetchQuery(api.bookings.getBookingById, {
      bookingId,
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    // Fetch event details
    const event = await fetchQuery(api.events.getEventById, {
      eventId: booking.eventId,
    });

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    // Get customer details
    const customerName = booking.guestDetails?.name || "Guest User";
    const customerEmail = booking.guestDetails?.email || "";
    const customerPhone = booking.guestDetails?.phone || "";

    // Generate PDF
    const pdfBlob = await generateTicketPDF({
      bookingNumber: booking.bookingNumber,
      eventName: event.title,
      eventDate: event.dateTime.start,
      eventVenue: `${event.venue.name}, ${event.venue.address}, ${event.venue.city}`,
      customerName,
      customerEmail,
      customerPhone,
      // Map booking.tickets to the format expected by PDF generator
      tickets: booking.tickets.map(ticket => ({
        name: ticket.ticketTypeName,
        quantity: ticket.quantity,
        price: ticket.price,
      })),
      totalAmount: booking.totalAmount,
      qrCode: booking.qrCode || "",
    });

    // Convert blob to buffer
    const buffer = Buffer.from(await pdfBlob.arrayBuffer());

    // Return PDF
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="ticket-${booking.bookingNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate ticket PDF" },
      { status: 500 }
    );
  }
}