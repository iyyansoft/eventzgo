"use client";

import { use } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useRouter } from "next/navigation";

export default function EventDetailsPage({ params }: { params: Promise<{ eventId: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const event = useQuery(api.events.getEventById, { eventId: resolvedParams.eventId as Id<"events"> });

  if (!event) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-purple-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-purple-600 rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600 font-medium">Loading event...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <button
          onClick={() => router.back()}
          className="text-gray-600 hover:text-gray-900 flex items-center mb-4"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
          Event Details
        </h1>
        <p className="text-gray-600">
          View event information
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-6">
        <h2 className="text-2xl font-bold mb-4">{event.title}</h2>
        <div className="space-y-4">
          <div>
            <span className="font-semibold">Status:</span> {event.status}
          </div>
          <div>
            <span className="font-semibold">Category:</span> {event.category}
          </div>
          <div>
            <span className="font-semibold">Venue:</span> {typeof event.venue === 'string' ? event.venue : event.venue.name}
          </div>
        </div>
      </div>
    </div>
  );
}