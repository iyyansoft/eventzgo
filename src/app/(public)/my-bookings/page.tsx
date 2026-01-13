"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/useAuth";
import { Calendar, MapPin, Ticket, Loader2, ChevronRight } from "lucide-react";
import Image from "next/image";

export default function MyBookingsPage() {
  const router = useRouter();
  const { isSignedIn, convexUser, isLoaded } = useAuth();

  const bookings = useQuery(
    api.bookings.getBookingsWithEventDetails,
    convexUser?._id ? { userId: convexUser._id } : "skip"
  );

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Loading state
  if (!isLoaded || bookings === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  // Not signed in
  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center max-w-md px-4">
          <div className="text-6xl mb-4">🎫</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Sign In Required
          </h1>
          <p className="text-gray-600 mb-8">
            Please sign in to view your bookings
          </p>
          <button
            onClick={() => router.push("/sign-in")}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            My Bookings
          </h1>
          <p className="text-gray-600">
            View and manage your event bookings
          </p>
        </div>

        {bookings && bookings.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {bookings.map((booking) => (
              <div
                key={booking._id}
                className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden cursor-pointer"
                onClick={() =>
                  router.push(`/booking/confirmation/${booking._id}`)
                }
              >
                <div className="flex flex-col md:flex-row">
                  {/* Event Image */}
                  {booking.event && (
                    <div className="md:w-64 h-48 md:h-auto relative flex-shrink-0">
                      <Image
                        src={booking.event.bannerImage}
                        alt={booking.event.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-4 right-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                            booking.status
                          )}`}
                        >
                          {booking.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Booking Details */}
                  <div className="flex-1 p-6">
                    {booking.event && (
                      <>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">
                          {booking.event.title}
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="flex items-center space-x-3">
                            <Calendar className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-500">
                                Event Date
                              </p>
                              <p className="font-medium text-gray-900">
                                {formatDate(booking.event.dateTime.start)} •{" "}
                                {formatTime(booking.event.dateTime.start)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <MapPin className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-500">Venue</p>
                              <p className="font-medium text-gray-900">
                                {typeof booking.event.venue === 'string'
                                  ? booking.event.venue
                                  : booking.event.venue.name}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <Ticket className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-500">
                                Booking Number
                              </p>
                              <p className="font-medium text-gray-900">
                                {booking.bookingNumber}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <div className="w-5 h-5 flex items-center justify-center">
                              <span className="text-purple-600 font-bold">
                                ₹
                              </span>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">
                                Total Amount
                              </p>
                              <p className="font-bold text-purple-600">
                                ₹{booking.pricing.total.toLocaleString("en-IN")}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Tickets Summary */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {booking.tickets.map((ticket, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm font-medium"
                            >
                              {ticket.quantity}x {ticket.ticketTypeName}
                            </span>
                          ))}
                        </div>

                        {/* View Details Button */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                          <p className="text-sm text-gray-500">
                            Booked on {formatDate(booking.createdAt)}
                          </p>
                          <button className="flex items-center space-x-2 text-purple-600 font-semibold hover:text-purple-700">
                            <span>View Details</span>
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl shadow-md">
            <div className="text-6xl mb-6">🎫</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              No Bookings Yet
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              You haven't booked any events yet. Browse our amazing events and
              book your first ticket!
            </p>
            <button
              onClick={() => router.push("/")}
              className="inline-block px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
            >
              Browse Events
            </button>
          </div>
        )}
      </div>
    </div>
  );
}