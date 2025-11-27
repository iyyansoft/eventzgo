"use client";

import { Booking } from "@/types";
// QR code rendering library removed for build compatibility; using placeholder
import { Calendar, MapPin, User, Ticket, Download, Share2 } from "lucide-react";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/currency-utils";

interface TicketDetailsProps {
  booking: Booking;
  ticket: any;
}

export default function TicketDetails({ booking, ticket }: TicketDetailsProps) {
  const handleDownload = () => {
    // Download ticket as PDF logic
    console.log("Downloading ticket:", ticket.ticketNumber);
  };

  const handleShare = () => {
    if (navigator.share) {
      const title = (booking as any).eventTitle ?? (booking as any).event?.title;
      navigator.share({
        title,
        text: `Check out my ticket for ${title}!`,
        url: window.location.href,
      });
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Ticket Header */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 p-8 text-white">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h2 className="text-3xl font-bold mb-2">{(booking as any).eventTitle ?? (booking as any).event?.title}</h2>
            <p className="text-purple-100">Ticket #{ticket.ticketNumber}</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleDownload}
              className="p-3 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={handleShare}
              className="p-3 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3">
            <Calendar className="w-5 h-5" />
            <div>
              <p className="text-sm text-purple-100">Date & Time</p>
              <p className="font-semibold">{format(new Date((booking as any).eventDate ?? (booking as any).event?.dateTime?.start ?? Date.now()), "PPP 'at' p")}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <MapPin className="w-5 h-5" />
            <div>
              <p className="text-sm text-purple-100">Venue</p>
              <p className="font-semibold">{(booking as any).venue ?? (booking as any).event?.venue?.name}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Ticket Body */}
      <div className="p-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* QR Code */}
          <div className="flex flex-col items-center justify-center">
            <div className="bg-white p-6 rounded-2xl shadow-lg border-4 border-purple-200 flex items-center justify-center">
              <div className="text-center">
                <div className="text-sm text-gray-500 mb-2">Ticket</div>
                <div className="font-mono text-lg font-semibold">{ticket.ticketNumber}</div>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-4 text-center">
              Scan this QR code at the venue entrance
            </p>
          </div>

          {/* Ticket Details */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Ticket className="w-5 h-5 mr-2 text-purple-600" />
                Ticket Information
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Ticket Type</span>
                  <span className="font-semibold text-gray-900">{ticket.ticketType}</span>
                </div>

                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Ticket Number</span>
                  <span className="font-mono font-semibold text-gray-900">{ticket.ticketNumber}</span>
                </div>

                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Price</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(ticket.price)}</span>
                </div>

                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Status</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    ticket.isUsed
                      ? "bg-gray-100 text-gray-700"
                      : "bg-green-100 text-green-700"
                  }`}>
                    {ticket.isUsed ? "Used" : "Valid"}
                  </span>
                </div>

                {ticket.seatNumber && (
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Seat Number</span>
                    <span className="font-semibold text-gray-900">{ticket.seatNumber}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-purple-600" />
                Attendee Information
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Name</span>
                  <span className="font-semibold text-gray-900">{(booking as any).attendeeName ?? booking.guestDetails?.name}</span>
                </div>

                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Email</span>
                  <span className="font-semibold text-gray-900">{(booking as any).attendeeEmail ?? booking.guestDetails?.email}</span>
                </div>

                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Phone</span>
                  <span className="font-semibold text-gray-900">{(booking as any).attendeePhone ?? booking.guestDetails?.phone}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Important Notice */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <h4 className="font-semibold text-blue-900 mb-2">Important Information</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Please arrive at least 30 minutes before the event starts</li>
            <li>• Bring a valid ID proof along with this ticket</li>
            <li>• This ticket is non-transferable and valid for single entry only</li>
            <li>• Outside food and beverages are not allowed</li>
          </ul>
        </div>
      </div>
    </div>
  );
}