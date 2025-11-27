import { NextRequest, NextResponse } from "next/server";
import { generateQRCode, generateBookingQRData } from "@/lib/qr-generator";
import { api } from "../../../../../../convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import { Id } from "../../../../../../convex/_generated/dataModel";

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

    // Generate QR data
    const qrData = generateBookingQRData(
      booking.bookingNumber,
      booking.eventId,
      booking.userId
    );

    // Generate QR code
    const qrCodeDataUrl = await generateQRCode(qrData);

    // Return QR code as data URL
    return NextResponse.json(
      {
        success: true,
        qrCode: qrCodeDataUrl,
        bookingNumber: booking.bookingNumber,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("QR generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate QR code" },
      { status: 500 }
    );
  }
}