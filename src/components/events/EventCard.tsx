"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Calendar, MapPin, Star, Clock } from "lucide-react";
import { Id } from "../../../convex/_generated/dataModel";

interface Event {
  _id: Id<"events">;
  title: string;
  category: string;
  bannerImage: string;
  venue: {
    name: string;
    city: string;
    state: string;
  };
  dateTime: {
    start: number;
    end: number;
  };
  pricing: {
    basePrice: number;
  };
  soldTickets: number;
  totalCapacity: number;
  isFeatured?: boolean;
}

interface EventCardProps {
  event: Event;
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/events/${event._id}`);
  };

  const handleBookNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/events/${event._id}`);
  };

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

  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString("en-IN")}`;
  };

  // Calculate rating based on sold tickets (simple logic)
  const calculateRating = () => {
    const soldPercentage = (event.soldTickets / event.totalCapacity) * 100;
    if (soldPercentage > 80) return 4.8;
    if (soldPercentage > 60) return 4.5;
    if (soldPercentage > 40) return 4.3;
    if (soldPercentage > 20) return 4.0;
    return 3.8;
  };

  return (
    <div
      className="group cursor-pointer bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
      onClick={handleCardClick}
    >
      {/* Image Container */}
      <div className="relative h-48 overflow-hidden">
        <Image
          src={event.bannerImage}
          alt={event.title}
          width={320}
          height={192}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        {/* Featured Badge */}
        {event.isFeatured && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
            Featured
          </div>
        )}

        {/* Category Badge */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-medium px-3 py-1 rounded-full">
          {event.category}
        </div>

        {/* Rating */}
        <div className="absolute bottom-3 right-3 flex items-center space-x-1 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
          <Star className="w-3 h-3 text-yellow-500 fill-current" />
          <span className="text-xs font-medium text-gray-800">
            {calculateRating()}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors duration-200">
          {event.title}
        </h3>

        <div className="space-y-2 mb-4">
          <div className="flex items-center space-x-2 text-gray-600">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">{formatDate(event.dateTime.start)}</span>
            <Clock className="w-4 h-4 ml-2" />
            <span className="text-sm">{formatTime(event.dateTime.start)}</span>
          </div>

          <div className="flex items-center space-x-2 text-gray-600">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">
              {event.venue.name}, {event.venue.city}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">Starting from</p>
            <p className="text-2xl font-bold text-purple-600">
              {formatPrice(event.pricing.basePrice)}
            </p>
          </div>

          <button
            onClick={handleBookNow}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-200"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventCard;