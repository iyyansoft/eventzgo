"use client";

import React, { use } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import EventCard from "@/components/events/EventCard";
import { MapPin, ArrowLeft, Loader2 } from "lucide-react";

interface StatePageProps {
  params: Promise<{
    stateName: string;
  }>;
}

export default function StatePage(props: StatePageProps) {
  const router = useRouter();
  
  // Unwrap params using React.use() for Next.js 15
  const params = use(props.params);
  const stateName = decodeURIComponent(params.stateName);

  // Fetch events by state
  const events = useQuery(api.events.getEventsByState, {
    state: stateName,
  });

  // Loading state
  if (events === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-white/80 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>

          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
              <MapPin className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">{stateName}</h1>
              <p className="text-white/90 text-lg mt-2">
                {events.length} {events.length === 1 ? "event" : "events"} available
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Events Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {events.length > 0 ? (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                All Events in {stateName}
              </h2>
              <p className="text-gray-600">
                Discover amazing events happening across {stateName}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {events.map((event) => (
                <EventCard key={event._id} event={event} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
              <MapPin className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              No Events Found
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              There are currently no events available in {stateName}. Check back
              later for new events!
            </p>
            <button
              onClick={() => router.push("/")}
              className="inline-block px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
            >
              Browse All Events
            </button>
          </div>
        )}
      </div>
    </div>
  );
}