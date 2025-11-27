"use client";

import { BookingWithEvent } from "@/types/booking";
import { formatCurrency } from "@/lib/currency-utils";
import { Calendar, MapPin, Ticket, Download, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

interface BookingCardProps {
  booking: BookingWithEvent;
}

export default function BookingCard({ booking }: BookingCardProps) {
  const router = useRouter();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-700 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-700 border-red-200";
      case "refunded":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  // Access event properties from the nested event object
  const eventDate = (booking.event as any)?.dateTime?.start || Date.now();
  const isUpcoming = eventDate > Date.now();
  const isPast = eventDate < Date.now();

  return (
    <div
      onClick={() => router.push(`/profile/bookings/${booking._id}`)}
      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer border border-gray-200 hover:border-purple-300"
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-xl font-bold text-gray-900">{(booking.event as any)?.title || "Event"}</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(booking.status)}`}>
                {booking.status}
              </span>
            </div>
            <p className="text-sm text-gray-600 font-mono mb-1">
              Booking #{booking.bookingNumber}
            </p>
          </div>

          {isUpcoming && booking.status === "confirmed" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                // Download ticket logic
              }}
              className="ml-4 p-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors"
            >
              <Download className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center space-x-3 text-gray-600">
            <Calendar className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">
              {format(new Date(eventDate), "PPP 'at' p")}
            </span>
          </div>

          <div className="flex items-center space-x-3 text-gray-600">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">{(booking.event as any)?.venue?.name || "Venue"}</span>
          </div>

          <div className="flex items-center space-x-3 text-gray-600">
            <Ticket className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">
              {booking.tickets.reduce((sum, t) => sum + t.quantity, 0)} Ticket(s)
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div>
            <p className="text-sm text-gray-600 mb-1">Total Paid</p>
            <p className="text-2xl font-bold text-purple-600">
              {formatCurrency(booking.totalAmount)}
            </p>
          </div>

          {isPast && booking.status === "confirmed" && (
            <div className="flex items-center space-x-2 text-gray-500 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>Event Completed</span>
            </div>
          )}

          {isUpcoming && booking.status === "confirmed" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/profile/bookings/${booking._id}`);
              }}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all"
            >
              View Tickets
            </button>
          )}
        </div>
      </div>
    </div>
  );
}