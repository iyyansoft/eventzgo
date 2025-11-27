"use client";

import React, { use } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import EventDetails from "@/components/events/EventDetails";
import SimilarEvents from "@/components/events/SimilarEvents";
import { Loader2 } from "lucide-react";

interface EventPageProps {
  params: Promise<{
    eventId: string;
  }>;
}

export default function EventPage(props: EventPageProps) {
  // Unwrap params using React.use() for Next.js 15
  const params = use(props.params);
  const eventId = params.eventId as Id<"events">;

  // Fetch event data
  const event = useQuery(api.events.getEventById, { eventId });

  // Loading state
  if (event === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading event details...</p>
        </div>
      </div>
    );
  }

  // Event not found
  if (event === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center max-w-md px-4">
          <div className="text-6xl mb-4">🎫</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Event Not Found
          </h1>
          <p className="text-gray-600 mb-8">
            Sorry, we couldn't find the event you're looking for. It may have
            been removed or the link might be incorrect.
          </p>
          <a
            href="/"
            className="inline-block px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
          >
            Browse All Events
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      <EventDetails event={event} />
      <SimilarEvents category={event.category} currentEventId={event._id} />
    </>
  );
}
