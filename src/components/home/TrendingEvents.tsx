"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import EventCard from "@/components/events/EventCard";
import { TrendingUp, ChevronRight } from "lucide-react";


const TrendingEvents = () => {
  const router = useRouter();

  // Fetch approved events, sorted by soldTickets (trending)
  const trendingEvents = useQuery(api.events.getTrendingEvents, { limit: 8 });

  if (!trendingEvents || trendingEvents.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                <span className="bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent">
                  Trending Now
                </span>
              </h2>
            </div>
            <p className="text-lg text-gray-600">
              Most popular events everyone's booking
            </p>
          </div>

          <button
              onClick={() => router.push("/events?filter=trending")}
              className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 font-medium transition-colors"
          >
              <span>View More</span>
              <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {trendingEvents.map((event) => (
            <EventCard key={event._id} event={event} />
          ))}
        </div>

        {/* Mobile View All Button */}
        <div className="mt-12 text-center md:hidden">
          <button
            onClick={() => router.push("/events?filter=trending")}
            className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold rounded-xl hover:from-orange-700 hover:to-red-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
          >
            <span>View All Trending Events</span>
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
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default TrendingEvents;