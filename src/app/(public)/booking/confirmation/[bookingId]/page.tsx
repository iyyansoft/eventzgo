"use client";

import React, { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  CheckCircle,
  Calendar,
  MapPin,
  Clock,
  Download,
  Share2,
  Loader2,
  Home,
  Ticket,
  Building2,
} from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import Image from "next/image";
import QRCode from "react-qr-code";

interface ConfirmationPageProps {
  params: Promise<{
    bookingId: string;
  }>;
}

export default function ConfirmationPage(props: ConfirmationPageProps) {
  const router = useRouter();
  const params = use(props.params);
  const bookingId = params.bookingId as Id<"bookings">;

  const booking = useQuery(api.bookings.getBookingById, { bookingId });
  const event = useQuery(
    api.events.getEventById,
    booking?.eventId ? { eventId: booking.eventId } : "skip"
  );

  const organizer = useQuery(
    api.organisers.getOrganiserById,
    event?.organiserId ? { organiserId: event.organiserId } : "skip"
  );

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadTicket = async () => {
    try {
      setIsDownloading(true);
      const res = await fetch(`/api/tickets/download/${bookingId}`);
      if (!res.ok) {
        throw new Error(`Failed to download PDF (${res.status})`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ticket-${booking?.bookingNumber ?? bookingId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download error:", err);
      alert("Unable to download ticket. Please try again later.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Booking Confirmation - ${event?.title}`,
          text: `I'm attending ${event?.title}!`,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  if (!booking || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your booking...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white py-12 pt-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Booking Confirmed!
          </h1>
          <p className="text-lg text-gray-600">
            Your tickets have been booked successfully
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          <div className="relative h-48 md:h-64">
            <Image
              src={event.bannerImage}
              alt={event.title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                {event.title}
              </h2>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-purple-600 text-white text-sm font-semibold rounded-full">
                  {event.category}
                </span>
                <span className="px-3 py-1 bg-green-500 text-white text-sm font-semibold rounded-full">
                  CONFIRMED
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8">
            <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium mb-1">
                    Booking Number
                  </p>
                  <p className="text-2xl font-bold text-purple-900">
                    {booking.bookingNumber}
                  </p>
                </div>
                <Ticket className="w-12 h-12 text-purple-600" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900">
                  Event Details
                </h3>

                <div className="flex items-start space-x-3">
                  <Calendar className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="font-semibold text-gray-900">
                      {formatDate(event.dateTime.start)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Time</p>
                    <p className="font-semibold text-gray-900">
                      {formatTime(event.dateTime.start)} -{" "}
                      {formatTime(event.dateTime.end)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Venue</p>
                    <p className="font-semibold text-gray-900">
                      {event.venue.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {event.venue.address}, {event.venue.city}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center bg-gray-50 rounded-xl p-6">
                <p className="text-sm text-gray-600 mb-3 font-medium">
                  Your Entry Pass
                </p>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <QRCode
                    value={booking.bookingNumber}
                    size={160}
                    level="H"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-3 text-center">
                  Show this QR code at the venue
                </p>
              </div>
            </div>

            {organizer && (
              <div className="border-t border-gray-200 pt-6 mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Event Organizer
                </h3>
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start space-x-3">
                      <Building2 className="w-5 h-5 text-purple-600 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Organization</p>
                        <p className="font-semibold text-gray-900 text-lg">
                          {organizer.institutionName}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">GST Number</p>
                      <p className="font-mono text-sm text-gray-900">
                        {organizer.gstNumber}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Location</p>
                      <p className="text-sm text-gray-900">
                        {organizer.address.city}, {organizer.address.state}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Status</p>
                      <span className="inline-flex px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                        ✓ Verified Organizer
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="border-t border-gray-200 pt-6 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Ticket Details
              </h3>
              <div className="space-y-3">
                {booking.tickets.map((ticket, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">
                        {ticket.ticketTypeName}
                      </p>
                      <p className="text-sm text-gray-600">
                        Quantity: {ticket.quantity}
                      </p>
                    </div>
                    <p className="font-bold text-purple-600">
                      ₹{(ticket.price * ticket.quantity).toLocaleString("en-IN")}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {booking.customFieldResponses &&
              booking.customFieldResponses.length > 0 && (
                <div className="border-t border-gray-200 pt-6 mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Additional Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {booking.customFieldResponses.map((response, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">
                          {response.label}
                        </p>
                        <p className="font-semibold text-gray-900">
                          {response.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {booking.guestDetails && (
              <div className="border-t border-gray-200 pt-6 mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Name</p>
                    <p className="font-semibold text-gray-900">
                      {booking.guestDetails.name}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Email</p>
                    <p className="font-semibold text-gray-900">
                      {booking.guestDetails.email}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Phone</p>
                    <p className="font-semibold text-gray-900">
                      {booking.guestDetails.phone}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Payment Summary
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span>₹{booking.pricing.subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Platform Fee</span>
                  <span>
                    ₹{booking.pricing.platformFee.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>GST (18%)</span>
                  <span>₹{booking.pricing.gst.toLocaleString("en-IN")}</span>
                </div>
                <div className="border-t border-gray-300 pt-2 mt-2">
                  <div className="flex justify-between text-xl font-bold">
                    <span className="text-gray-900">Total Paid</span>
                    <span className="text-purple-600">
                      ₹{booking.pricing.total.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={handleDownloadTicket}
            disabled={isDownloading}
            className="flex items-center justify-center space-x-2 px-6 py-4 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl disabled:opacity-60"
          >
            {isDownloading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Download className="w-5 h-5" />
            )}
            <span>{isDownloading ? "Preparing PDF..." : "Download Ticket"}</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center justify-center space-x-2 px-6 py-4 bg-white border-2 border-purple-600 text-purple-600 rounded-xl hover:bg-purple-50 transition-all duration-200 font-semibold"
          >
            <Share2 className="w-5 h-5" />
            <span>Share</span>
          </button>

          <button
            onClick={() => router.push("/profile/bookings")}
            className="flex items-center justify-center space-x-2 px-6 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold"
          >
            <Ticket className="w-5 h-5" />
            <span>My Bookings</span>
          </button>
        </div>

        <div className="text-center">
          <button
            onClick={() => router.push("/")}
            className="inline-flex items-center space-x-2 text-purple-600 hover:text-purple-700 font-semibold"
          >
            <Home className="w-5 h-5" />
            <span>Back to Home</span>
          </button>
        </div>

        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <h3 className="font-bold text-yellow-900 mb-3">Important Notes:</h3>
          <ul className="space-y-2 text-sm text-yellow-800">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>
                Please carry a valid ID proof along with your ticket for entry
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>
                Show the QR code at the venue for quick entry verification
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>
                Arrive at least 30 minutes before the event start time
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>
                A confirmation email has been sent to {booking.guestDetails?.email}
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}