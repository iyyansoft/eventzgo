"use client";

import { INDIAN_STATES } from "@/types";

interface EventFiltersProps {
  selectedCategory?: string;
  onCategoryChange: (category: string | undefined) => void;
  selectedState?: string;
  onStateChange: (state: string | undefined) => void;
  selectedDateRange?: { start: Date; end: Date };
  onDateRangeChange?: (range: { start: Date; end: Date } | undefined) => void;
}

export default function EventFilters({
  selectedCategory,
  onCategoryChange,
  selectedState,
  onStateChange,
}: EventFiltersProps) {
  const categories = [
    "Concerts",
    "Sports",
    "Comedy",
    "Gaming",
    "Lifestyle",
    "Events",
  ];

  return (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Categories</h3>
        <div className="space-y-2">
          <button
            onClick={() => onCategoryChange(undefined)}
            className={`w-full text-left px-4 py-2 rounded-lg transition-colors duration-200 ${
              !selectedCategory
                ? "bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 font-semibold"
                : "hover:bg-gray-100 text-gray-700"
            }`}
          >
            All Categories
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => onCategoryChange(category.toLowerCase())}
              className={`w-full text-left px-4 py-2 rounded-lg transition-colors duration-200 ${
                selectedCategory === category.toLowerCase()
                  ? "bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 font-semibold"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* States */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Location</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          <button
            onClick={() => onStateChange(undefined)}
            className={`w-full text-left px-4 py-2 rounded-lg transition-colors duration-200 ${
              !selectedState
                ? "bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 font-semibold"
                : "hover:bg-gray-100 text-gray-700"
            }`}
          >
            All States
          </button>
          {INDIAN_STATES.map((state) => (
            <button
              key={state}
              onClick={() => onStateChange(state)}
              className={`w-full text-left px-4 py-2 rounded-lg transition-colors duration-200 ${
                selectedState === state
                  ? "bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 font-semibold"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              {state}
            </button>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      {(selectedCategory || selectedState) && (
        <button
          onClick={() => {
            onCategoryChange(undefined);
            onStateChange(undefined);
          }}
          className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors duration-200"
        >
          Clear All Filters
        </button>
      )}
    </div>
  );
}