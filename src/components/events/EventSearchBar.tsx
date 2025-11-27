"use client";

import { Search } from "lucide-react";

interface EventSearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
}

export default function EventSearchBar({
  searchTerm,
  onSearchChange,
  placeholder = "Search events by name, location, or category...",
}: EventSearchBarProps) {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-3">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-12 pr-4 py-4 text-gray-900 placeholder-gray-500 bg-transparent focus:outline-none"
        />
      </div>
    </div>
  );
}