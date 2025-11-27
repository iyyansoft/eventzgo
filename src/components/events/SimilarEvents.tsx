"use client";

import React from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import EventCard from "./EventCard";
import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface SimilarEventsProps {
  category: string;
  currentEventId: string;
}

const SimilarEvents: React.FC<SimilarEventsProps> = ({
  category,
  currentEventId,
}) => {
  const router = useRouter();

  // Fetch events in the same category
  const similarEvents = useQuery(api.events.getEventsByCategory, {
    category,
    limit: 4,
  });

  // Filter out current event
  const filteredEvents = similarEvents?.filter(
    (event) => event._id !== currentEventId
  );

  if (!filteredEvents || filteredEvents.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Similar Events
            </h2>
            <p className="text-gray-600">
              More events you might be interested in
            </p>
          </div>

          <button
            onClick={() => router.push(`/category/${category.toLowerCase()}`)}
            className="hidden md:flex items-center space-x-2 text-purple-600 font-semibold hover:text-purple-700 transition-colors"
          >
            <span>View All {category}</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredEvents.slice(0, 4).map((event) => (
            <EventCard key={event._id} event={event} />
          ))}
        </div>

        {/* Mobile View All Button */}
        <div className="mt-8 text-center md:hidden">
          <button
            onClick={() => router.push(`/category/${category.toLowerCase()}`)}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
          >
            <span>View All {category} Events</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default SimilarEvents;