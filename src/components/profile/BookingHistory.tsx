"use client";

import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import BookingCard from "./BookingCard";
import { Calendar, Loader2 } from "lucide-react";

export default function BookingHistory() {
  const { isLoaded, convexUser } = useAuth();

  const bookings = useQuery(
    api.bookings.getMyBookingsWithEvents,
    isLoaded && convexUser ? { userId: convexUser._id } : "skip"
  );

  if (!bookings) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Calendar className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">No Bookings Yet</h3>
        <p className="text-gray-600 mb-6">
          Start exploring events and book your first ticket!
        </p>
        <button
          onClick={() => window.location.href = '/events'}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
        >
          Browse Events
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">My Bookings</h2>
        <span className="text-sm text-gray-600">
          {bookings.length} {bookings.length === 1 ? 'booking' : 'bookings'}
        </span>
      </div>

      <div className="grid gap-6">
        {bookings.filter((b) => b.event).map((booking) => (
          <BookingCard key={booking._id} booking={booking as any} />
        ))}
      </div>
    </div>
  );
}