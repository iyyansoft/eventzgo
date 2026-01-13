"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  MapPin,
  Clock,
  Tag,
  Share2,
  Heart,
  Users,
  Ticket,
} from "lucide-react";
import Image from "next/image";
import TicketSelector from "./TicketSelector";

interface Event {
  _id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  bannerImage: string;
  venue: string | {
    name: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  dateTime: {
    start: number;
    end: number;
  };
  ticketTypes: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    sold: number;
    description?: string;
  }>;
  totalCapacity: number;
  soldTickets: number;
  pricing: {
    basePrice: number;
    gst: number;
    platformFee: number;
    totalPrice: number;
  };
  status: string;
  isFeatured: boolean;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

interface EventDetailsProps {
  event: Event;
}

const EventDetails: React.FC<EventDetailsProps> = ({ event }) => {
  const router = useRouter();
  const [selectedTickets, setSelectedTickets] = useState<{
    [key: string]: number;
  }>({});
  const [isLiked, setIsLiked] = useState(false);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const totalSelectedTickets = Object.values(selectedTickets).reduce(
    (sum, qty) => sum + qty,
    0
  );

  const calculatePricing = () => {
    let subtotal = 0;

    Object.entries(selectedTickets).forEach(([ticketId, quantity]) => {
      const ticketType = event.ticketTypes.find((t) => t.id === ticketId);
      if (ticketType) {
        subtotal += ticketType.price * quantity;
      }
    });

    const platformFeePercentage = 5;
    const gstPercentage = 18;

    const platformFeeAmount = (subtotal * platformFeePercentage) / 100;

    // GST Calculation (18%)
    const ticketGst = (subtotal * gstPercentage) / 100;
    const platformFeeGst = (platformFeeAmount * gstPercentage) / 100;
    const totalGst = ticketGst + platformFeeGst;

    const grandTotal = subtotal + ticketGst + platformFeeAmount + platformFeeGst;

    return {
      subtotal,
      platformFeeAmount,
      ticketGst,
      platformFeeGst,
      gstAmount: totalGst,
      grandTotal,
    };
  };

  const handleProceedToCheckout = () => {
    if (totalSelectedTickets === 0) {
      alert("Please select at least one ticket");
      return;
    }

    const pricing = calculatePricing();

    // Store booking data in session storage
    const bookingData = {
      eventId: event._id,
      eventTitle: event.title,
      eventDate: event.dateTime.start,
      venue: event.venue,
      selectedTickets,
      ticketTypes: event.ticketTypes,
      pricing,
    };

    sessionStorage.setItem("bookingData", JSON.stringify(bookingData));

    // Navigate to checkout
    router.push(`/booking/${event._id}/checkout`);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: `Check out ${event.title}!`,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  const pricing = calculatePricing();
  const availableTickets = event.totalCapacity - event.soldTickets;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Banner */}
      <div className="relative h-96 md:h-[500px] bg-gray-900">
        <Image
          src={event.bannerImage}
          alt={event.title}
          fill
          className="object-cover opacity-70"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

        {/* Breadcrumb & Actions */}
        <div className="absolute top-0 left-0 right-0 p-4 md:p-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="text-white/90 hover:text-white flex items-center space-x-2 bg-black/30 backdrop-blur-sm px-4 py-2 rounded-lg"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <span>Back</span>
            </button>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsLiked(!isLiked)}
                className={`p-3 rounded-full backdrop-blur-sm transition-all ${isLiked
                  ? "bg-red-500 text-white"
                  : "bg-black/30 text-white hover:bg-black/50"
                  }`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
              </button>
              <button
                onClick={handleShare}
                className="p-3 rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 transition-all"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Event Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center space-x-2 mb-3">
              <span className="px-3 py-1 bg-purple-600 text-white text-sm font-semibold rounded-full">
                {event.category}
              </span>
              {event.isFeatured && (
                <span className="px-3 py-1 bg-yellow-500 text-white text-sm font-semibold rounded-full">
                  Featured
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
              {event.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-white/90">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>{formatDate(event.dateTime.start)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5" />
                <span>
                  {typeof event.venue === 'string' ? event.venue : `${event.venue.city}, ${event.venue.state}`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Event Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Event */}
            <div className="bg-white rounded-2xl p-6 shadow-md">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                About This Event
              </h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {event.description}
              </p>
            </div>

            {/* Event Details */}
            <div className="bg-white rounded-2xl p-6 shadow-md">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Event Details
              </h2>

              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <Calendar className="w-6 h-6 text-purple-600 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900">Date & Time</p>
                    <p className="text-gray-600">
                      {formatDate(event.dateTime.start)}
                    </p>
                    <p className="text-gray-600">
                      {formatTime(event.dateTime.start)} -{" "}
                      {formatTime(event.dateTime.end)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <MapPin className="w-6 h-6 text-purple-600 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900">Venue</p>
                    <p className="text-gray-600">{typeof event.venue === 'string' ? event.venue : event.venue.name}</p>
                    {typeof event.venue !== 'string' && (
                      <>
                        <p className="text-gray-600">
                          {event.venue.address}, {event.venue.city}
                        </p>
                        <p className="text-gray-600">
                          {event.venue.state} - {event.venue.pincode}
                        </p>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <Users className="w-6 h-6 text-purple-600 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900">Capacity</p>
                    <p className="text-gray-600">
                      {availableTickets} tickets available out of{" "}
                      {event.totalCapacity}
                    </p>
                  </div>
                </div>

                {event.tags.length > 0 && (
                  <div className="flex items-start space-x-4">
                    <Tag className="w-6 h-6 text-purple-600 mt-1" />
                    <div>
                      <p className="font-semibold text-gray-900 mb-2">Tags</p>
                      <div className="flex flex-wrap gap-2">
                        {event.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Ticket Selection */}
            <div className="bg-white rounded-2xl p-6 shadow-md">
              <TicketSelector
                ticketTypes={event.ticketTypes}
                selectedTickets={selectedTickets}
                onTicketChange={setSelectedTickets}
              />
            </div>
          </div>

          {/* Right Column - Booking Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-md sticky top-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Booking Summary
              </h3>

              {totalSelectedTickets > 0 ? (
                <>
                  <div className="space-y-3 mb-6">
                    {Object.entries(selectedTickets).map(
                      ([ticketId, quantity]) => {
                        const ticketType = event.ticketTypes.find(
                          (t) => t.id === ticketId
                        );
                        if (!ticketType) return null;

                        return (
                          <div
                            key={ticketId}
                            className="flex justify-between text-sm"
                          >
                            <span className="text-gray-600">
                              {ticketType.name} x {quantity}
                            </span>
                            <span className="font-medium text-gray-900">
                              ₹
                              {(ticketType.price * quantity).toLocaleString(
                                "en-IN"
                              )}
                            </span>
                          </div>
                        );
                      }
                    )}
                  </div>

                  <div className="border-t border-gray-200 pt-4 mb-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium text-gray-900">
                        ₹{pricing.subtotal.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ticket GST (18%)</span>
                      <span className="font-medium text-gray-900">
                        ₹{pricing.ticketGst.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Platform Fee (5%)</span>
                      <span className="font-medium text-gray-900">
                        ₹{pricing.platformFeeAmount.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Platform GST (18%)</span>
                      <span className="font-medium text-gray-900">
                        ₹{pricing.platformFeeGst.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">
                        Total
                      </span>
                      <span className="text-2xl font-bold text-purple-600">
                        ₹{pricing.grandTotal.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleProceedToCheckout}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-pink-700 transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Proceed to Checkout
                  </button>
                </>
              ) : (
                <div className="text-center py-8">
                  <Ticket className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    Select tickets to see pricing
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;