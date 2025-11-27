"use client";

import React, { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";

interface FilterBarProps {
  sortBy: string;
  onSortChange: (sort: string) => void;
  totalResults: number;
}

const FilterBar: React.FC<FilterBarProps> = ({
  sortBy,
  onSortChange,
  totalResults,
}) => {
  const [showFilters, setShowFilters] = useState(false);

  const sortOptions = [
    { value: "date-asc", label: "Date: Earliest First" },
    { value: "date-desc", label: "Date: Latest First" },
    { value: "price-asc", label: "Price: Low to High" },
    { value: "price-desc", label: "Price: High to Low" },
    { value: "popular", label: "Most Popular" },
    { value: "rating", label: "Highest Rated" },
  ];

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Results Count */}
          <div className="flex items-center space-x-4">
            <p className="text-gray-700 font-medium">
              {totalResults} {totalResults === 1 ? "Event" : "Events"} Found
            </p>
          </div>

          {/* Desktop Filters */}
          <div className="hidden md:flex items-center space-x-4">
            <label className="text-sm text-gray-600 font-medium">
              Sort by:
            </label>
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Mobile Filter Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
          </button>
        </div>

        {/* Mobile Filter Dropdown */}
        {showFilters && (
          <div className="md:hidden mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm text-gray-700 font-medium">
                Sort by:
              </label>
              <button
                onClick={() => setShowFilters(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <select
              value={sortBy}
              onChange={(e) => {
                onSortChange(e.target.value);
                setShowFilters(false);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterBar;