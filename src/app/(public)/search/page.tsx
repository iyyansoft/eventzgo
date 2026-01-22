"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import EventCard from "@/components/events/EventCard";
import { Search, X, Loader2 } from "lucide-react";

// Disable static generation for this page
export const dynamic = 'force-dynamic';

export default function SearchPage() {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState("");

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const q = params.get("q") || "";
      setSearchQuery(q);
      setActiveSearch(q);
    } catch (e) {
      // ignore during SSR
    }
  }, []);

  // Fetch search results
  const events = useQuery(
    api.events.searchEvents,
    activeSearch ? { searchTerm: activeSearch } : "skip"
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setActiveSearch(searchQuery.trim());
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setActiveSearch("");
    router.push("/search");
  };

  if (events === undefined && activeSearch) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Searching events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-white border-b sticky top-16 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for events, venues, or categories..."
              className="w-full pl-12 pr-12 py-4 text-lg border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            )}
          </form>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!activeSearch ? (
          <div className="text-center py-20">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Search for Events
            </h2>
            <p className="text-gray-600">
              Try searching for events, venues, categories, or locations
            </p>
          </div>
        ) : events && events.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">ðŸ”</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No results found for "{activeSearch}"
            </h2>
            <p className="text-gray-600 mb-6">
              Try different keywords or browse all events
            </p>
            <button
              onClick={() => router.push("/")}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
            >
              Browse All Events
            </button>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <p className="text-gray-600">
                <span className="font-semibold text-gray-900">{events?.length || 0}</span> results for "{activeSearch}"
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events?.map((event) => (
                <EventCard key={event._id} event={event} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
