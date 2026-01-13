"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import DataTable from "@/components/management/DataTable";
import { useRouter } from "next/navigation";

export default function AdminEventsPage() {
  const router = useRouter();

  const events = useQuery(api.events.getAllEvents, {});

  if (!events) {
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

  const columns = [
    { key: "title", label: "Event Name" },
    { key: "category", label: "Category" },
    { key: "city", label: "City" },
    { key: "date", label: "Date" },
    { key: "status", label: "Status" },
    { key: "capacity", label: "Capacity" },
    { key: "actions", label: "Actions" },
  ];

  const tableData = events.map((event) => ({
    ...event,
    status: (event.dateTime.end < Date.now() && event.status !== 'cancelled' && event.status !== 'rejected')
      ? "completed"
      : event.status,
    city: typeof event.venue === 'string' ? event.venue : event.venue.city,
    date: new Date(event.dateTime.start).toLocaleDateString(),
    capacity: `${event.soldTickets}/${event.totalCapacity}`,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Events
          </h1>
          <p className="text-gray-600">
            Manage platform events
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
          <p className="text-sm text-gray-600 mb-1">Total Events</p>
          <p className="text-3xl font-bold text-gray-900">{events.length}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
          <p className="text-sm text-gray-600 mb-1">Active Events</p>
          <p className="text-3xl font-bold text-gray-900">
            {events.filter((e) => e.dateTime.end > Date.now()).length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
          <p className="text-sm text-gray-600 mb-1">Published Events</p>
          <p className="text-3xl font-bold text-gray-900">
            {events.filter((e) => e.status === "published").length}
          </p>
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <DataTable
          columns={columns}
          data={tableData}
          emptyMessage="No events found"
          onRowClick={(row) => router.push(`/management/admin/events/${row._id}`)}
        />
      </div>
    </div>
  );
}