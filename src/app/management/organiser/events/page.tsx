"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect } from "react";
import EventsTable from "@/components/organiser/EventsTable";
import { useRouter } from "next/navigation";

// Disable static generation for this page
export const dynamic = 'force-dynamic';

export default function OrganiserEventsPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | "active" | "draft" | "past">("all");
  const [userId, setUserId] = useState<string | null>(null);

  // Retrieve userId from local session
  useEffect(() => {
    const stored = localStorage.getItem("organiser_session");
    if (stored) {
      try {
        const user = JSON.parse(stored);
        if (user && user.id) {
          setUserId(user.id);
        }
      } catch (e) {
        // ignore
      }
    }
  }, []);

  const allEvents = useQuery(
    api.events.getOrganiserEvents,
    userId ? { organiserId: userId as any, limit: 100 } : "skip"
  );

  if (!allEvents) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-purple-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-purple-600 rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600 font-medium">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            My Events
          </h1>
          <p className="text-gray-600">
            Manage and track all your events
          </p>
        </div>
        <button
          onClick={() => router.push("/management/organiser/events/create")}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Event
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg font-medium transition ${filter === "all"
              ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
              : "text-gray-600 hover:bg-gray-100"
              }`}
          >
            All Events
          </button>
          <button
            onClick={() => setFilter("active")}
            className={`px-4 py-2 rounded-lg font-medium transition ${filter === "active"
              ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
              : "text-gray-600 hover:bg-gray-100"
              }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter("draft")}
            className={`px-4 py-2 rounded-lg font-medium transition ${filter === "draft"
              ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
              : "text-gray-600 hover:bg-gray-100"
              }`}
          >
            Draft
          </button>
          <button
            onClick={() => setFilter("past")}
            className={`px-4 py-2 rounded-lg font-medium transition ${filter === "past"
              ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
              : "text-gray-600 hover:bg-gray-100"
              }`}
          >
            Past
          </button>
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-white rounded-xl shadow-sm">
        {(() => {
          const events = (allEvents || []).filter((e: any) => {
            if (filter === "all") return true;
            if (filter === "active") return e.status === "published";
            if (filter === "draft") return e.status === "draft";
            if (filter === "past") return e.dateTime?.end < Date.now();
            return true;
          });

          if (events.length === 0) {
            return (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No events found</h3>
                <p className="text-gray-600 mb-6">Get started by creating your first event</p>
                <button
                  onClick={() => router.push("/management/organiser/events/create")}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all inline-flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Event
                </button>
              </div>
            );
          }

          return <EventsTable events={events} />;
        })()}

      </div>
    </div>
  );
}
