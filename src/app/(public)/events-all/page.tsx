"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import EventCard from "@/components/events/EventCard";
import FilterBar from "@/components/shared/FilterBar";
import { Loader2, Search, X, MapPin, Tag } from "lucide-react";

// Disable static generation for this page
export const dynamic = 'force-dynamic';

export default function AllEventsPage() {
  const router = useRouter();

  // State
  const [sortBy, setSortBy] = useState("date-desc");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedState, setSelectedState] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Fetch all events
  const allEvents = useQuery(api.events.getAllEvents, {
    status: "approved",
  });

  // Get unique states and categories
  const { states, categories } = useMemo(() => {
    if (!allEvents) return { states: [], categories: [] };

    const uniqueStates = [...new Set(allEvents
      .filter((e) => typeof e.venue !== 'string')
      .map((e) => (e.venue as any).state))].sort();
    const uniqueCategories = [...new Set(allEvents.map((e) => e.category))].sort();

    return { states: uniqueStates, categories: uniqueCategories };
  }, [allEvents]);

  // Filter, search, and sort events
  const filteredEvents = useMemo(() => {
    if (!allEvents) return [];

    let filtered = [...allEvents];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(query) ||
          event.description.toLowerCase().includes(query) ||
          (typeof event.venue !== 'string' && event.venue.city.toLowerCase().includes(query)) ||
          (typeof event.venue !== 'string' && event.venue.state.toLowerCase().includes(query)) ||
          (typeof event.venue === 'string' && event.venue.toLowerCase().includes(query)) ||
          event.category.toLowerCase().includes(query) ||
          event.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // State filter
    if (selectedState !== "all") {
      filtered = filtered.filter((e) => typeof e.venue !== 'string' && e.venue.state === selectedState);
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter((e) => e.category === selectedCategory);
    }

    // Sort
    switch (sortBy) {
      case "date-asc":
        filtered.sort((a, b) => a.dateTime.start - b.dateTime.start);
        break;
      case "date-desc":
        filtered.sort((a, b) => b.dateTime.start - a.dateTime.start);
        break;
      case "price-asc":
        filtered.sort((a, b) => a.pricing.basePrice - b.pricing.basePrice);
        break;
      case "price-desc":
        filtered.sort((a, b) => b.pricing.basePrice - a.pricing.basePrice);
        break;
      case "popular":
        filtered.sort((a, b) => b.soldTickets - a.soldTickets);
        break;
      case "rating":
        filtered.sort((a, b) => {
          const ratingA = (a.soldTickets / a.totalCapacity) * 5;
          const ratingB = (b.soldTickets / b.totalCapacity) * 5;
          return ratingB - ratingA;
        });
        break;
      default:
        filtered.sort((a, b) => b.createdAt - a.createdAt);
    }

    return filtered;
  }, [allEvents, searchQuery, selectedState, selectedCategory, sortBy]);

  // Loading state
  if (allEvents === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading events...</p>
        </div>
      </div>
    );
  }

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedState !== "all" ||
    selectedCategory !== "all";

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedState("all");
    setSelectedCategory("all");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">All Events</h1>
          <p className="text-white/90 text-lg">
            Discover amazing events happening across India
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search events by name, city, category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Filter Chips */}
          <div className="flex flex-wrap gap-4">
            {/* Category Filter */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Tag className="w-4 h-4 inline mr-2" />
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Categories ({allEvents.length})</option>
                {categories.map((category) => {
                  const count = allEvents.filter((e) => e.category === category).length;
                  return (
                    <option key={category} value={category}>
                      {category} ({count})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* State Filter */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-2" />
                State
              </label>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All States ({allEvents.length})</option>
                {states.map((state) => {
                  const count = allEvents.filter((e) => typeof e.venue !== 'string' && e.venue.state === state).length;
                  return (
                    <option key={state} value={state}>
                      {state} ({count})
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Active Filters Badge */}
          {hasActiveFilters && (
            <div className="mt-4 flex items-center justify-between bg-purple-50 border border-purple-200 rounded-lg px-4 py-3">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-purple-900">
                  Active Filters:
                </span>
                {searchQuery && (
                  <span className="px-3 py-1 bg-purple-200 text-purple-800 text-xs font-medium rounded-full">
                    Search: "{searchQuery}"
                  </span>
                )}
                {selectedCategory !== "all" && (
                  <span className="px-3 py-1 bg-purple-200 text-purple-800 text-xs font-medium rounded-full">
                    {selectedCategory}
                  </span>
                )}
                {selectedState !== "all" && (
                  <span className="px-3 py-1 bg-purple-200 text-purple-800 text-xs font-medium rounded-full">
                    {selectedState}
                  </span>
                )}
              </div>
              <button
                onClick={clearFilters}
                className="text-purple-600 hover:text-purple-700 text-sm font-medium"
              >
                Clear All
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      {filteredEvents.length > 0 && (
        <FilterBar
          sortBy={sortBy}
          onSortChange={setSortBy}
          totalResults={filteredEvents.length}
        />
      )}

      {/* Events Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredEvents.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-6">ðŸ”</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              No Events Found
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {hasActiveFilters
                ? "No events match your current filters. Try adjusting your search criteria."
                : "There are currently no events available."}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="inline-block px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
