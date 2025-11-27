"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import DataTable from "@/components/management/DataTable";
import { useRouter } from "next/navigation";

export default function AdminEventsPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  
  const events = useQuery(api.events.getAllEvents, {
    status: filter === "all" ? undefined : (filter as any),
  });

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
    city: event.venue.city,
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
            Manage and approve platform events
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === "all"
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            All Events
          </button>
          <button
            onClick={() => setFilter("pending")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === "pending"
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter("approved")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === "approved"
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => setFilter("rejected")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === "rejected"
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Rejected
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
          <p className="text-sm text-gray-600 mb-1">Total Events</p>
          <p className="text-3xl font-bold text-gray-900">{events.length}</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200">
          <p className="text-sm text-gray-600 mb-1">Pending Approval</p>
          <p className="text-3xl font-bold text-gray-900">
            {events.filter((e) => e.status === "pending").length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
          <p className="text-sm text-gray-600 mb-1">Approved</p>
          <p className="text-3xl font-bold text-gray-900">
            {events.filter((e) => e.status === "approved").length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
          <p className="text-sm text-gray-600 mb-1">Active Events</p>
          <p className="text-3xl font-bold text-gray-900">
            {events.filter((e) => e.status === "approved" && e.dateTime.end > Date.now()).length}
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