"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  Music,
  Trophy,
  Calendar,
  Gamepad2,
  Mic,
  Heart,
  Sparkles,
} from "lucide-react";

const Categories = () => {
  const router = useRouter();

  // Fetch all events to count by category
  const allEvents = useQuery(api.events.getAllEvents, {});

  const categories = [
    {
      name: "Concerts",
      icon: Music,
      color: "from-purple-500 to-indigo-500",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
      description: "Live music events",
      hoverBg: "hover:bg-purple-100",
      shadowColor: "hover:shadow-purple-200/50",
      route: "/category/concerts",
      key: "concerts",
    },
    {
      name: "Sports",
      icon: Trophy,
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
      description: "Cricket, football & more",
      hoverBg: "hover:bg-green-100",
      shadowColor: "hover:shadow-green-200/50",
      route: "/category/sports",
      key: "sports",
    },
    {
      name: "Events",
      icon: Calendar,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
      description: "Workshops & meetups",
      hoverBg: "hover:bg-blue-100",
      shadowColor: "hover:shadow-blue-200/50",
      route: "/category/events",
      key: "events",
    },
    {
      name: "Gaming",
      icon: Gamepad2,
      color: "from-violet-500 to-purple-500",
      bgColor: "bg-violet-50",
      textColor: "text-violet-600",
      description: "Esports tournaments",
      hoverBg: "hover:bg-violet-100",
      shadowColor: "hover:shadow-violet-200/50",
      route: "/category/gaming",
      key: "gaming",
    },
    {
      name: "Comedy",
      icon: Mic,
      color: "from-pink-500 to-rose-500",
      bgColor: "bg-pink-50",
      textColor: "text-pink-600",
      description: "Stand-up shows",
      hoverBg: "hover:bg-pink-100",
      shadowColor: "hover:shadow-pink-200/50",
      route: "/category/comedy",
      key: "comedy",
    },
    {
      name: "Lifestyle",
      icon: Heart,
      color: "from-teal-500 to-green-500",
      bgColor: "bg-teal-50",
      textColor: "text-teal-600",
      description: "Food & wellness",
      hoverBg: "hover:bg-teal-100",
      shadowColor: "hover:shadow-teal-200/50",
      route: "/category/lifestyle",
      key: "lifestyle",
    },
  ];

  // Count events per category
  const getCategoryCount = (categoryKey: string) => {
    if (!allEvents) return 0;
    return allEvents.filter(
      (event) => event.category.toLowerCase() === categoryKey.toLowerCase()
    ).length;
  };

  const handleCategoryClick = (category: any) => {
    router.push(category.route);
  };

  const handleExploreAll = () => {
    router.push("/events-all");
  };

  return (
    <section
      id="categories-section"
      className="py-20 bg-gradient-to-b from-white to-gray-50/50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl mb-6 group">
            <Sparkles className="w-8 h-8 text-white group-hover:rotate-180 transition-transform duration-700 ease-in-out" />
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              Explore by Category
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover amazing experiences across all your favorite entertainment
            categories
          </p>
        </div>

        {/* Two Row Layout */}
        <div className="space-y-6">
          {/* First Row - 4 Categories */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {categories.slice(0, 4).map((category, index) => {
              const Icon = category.icon;
              const count = getCategoryCount(category.key);
              return (
                <div
                  key={category.name}
                  className="group cursor-pointer"
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => handleCategoryClick(category)}
                >
                  <div
                    className={`${category.bgColor} ${category.hoverBg} rounded-3xl p-6 text-center 
                    transition-all duration-500 ease-out hover:scale-110 hover:-translate-y-2 
                    shadow-lg ${category.shadowColor} hover:shadow-2xl
                    border border-white/50 backdrop-blur-sm
                    relative overflow-hidden`}
                  >
                    <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity duration-300">
                      <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-current transform translate-x-8 -translate-y-8"></div>
                      <div className="absolute bottom-0 left-0 w-16 h-16 rounded-full bg-current transform -translate-x-6 translate-y-6"></div>
                    </div>

                    <div
                      className={`relative w-14 h-14 mx-auto mb-4 bg-gradient-to-r ${category.color} 
                      rounded-2xl flex items-center justify-center 
                      group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 
                      shadow-lg group-hover:shadow-xl`}
                    >
                      <Icon className="w-7 h-7 text-white" />

                      <div
                        className={`absolute inset-0 bg-gradient-to-r ${category.color} rounded-2xl 
                        opacity-0 group-hover:opacity-30 blur-xl transition-all duration-500`}
                      ></div>
                    </div>

                    <div className="relative z-10">
                      <h3
                        className={`font-bold text-lg ${category.textColor} mb-2 
                        group-hover:scale-105 transition-transform duration-300`}
                      >
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-500 group-hover:text-gray-600 transition-colors duration-300">
                        {category.description}
                      </p>
                      {count > 0 && (
                        <p className="text-xs text-gray-400 mt-2">
                          {count} events
                        </p>
                      )}
                    </div>

                    <div
                      className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${category.color} 
                      transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 
                      origin-left rounded-full`}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Second Row - 4 Categories */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {categories.slice(4, 8).map((category, index) => {
              const Icon = category.icon;
              const count = getCategoryCount(category.key);
              return (
                <div
                  key={category.name}
                  className="group cursor-pointer"
                  style={{ animationDelay: `${(index + 4) * 100}ms` }}
                  onClick={() => handleCategoryClick(category)}
                >
                  <div
                    className={`${category.bgColor} ${category.hoverBg} rounded-3xl p-6 text-center 
                    transition-all duration-500 ease-out hover:scale-110 hover:-translate-y-2 
                    shadow-lg ${category.shadowColor} hover:shadow-2xl
                    border border-white/50 backdrop-blur-sm
                    relative overflow-hidden`}
                  >
                    <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity duration-300">
                      <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-current transform translate-x-8 -translate-y-8"></div>
                      <div className="absolute bottom-0 left-0 w-16 h-16 rounded-full bg-current transform -translate-x-6 translate-y-6"></div>
                    </div>

                    <div
                      className={`relative w-14 h-14 mx-auto mb-4 bg-gradient-to-r ${category.color} 
                      rounded-2xl flex items-center justify-center 
                      group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 
                      shadow-lg group-hover:shadow-xl`}
                    >
                      <Icon className="w-7 h-7 text-white" />

                      <div
                        className={`absolute inset-0 bg-gradient-to-r ${category.color} rounded-2xl 
                        opacity-0 group-hover:opacity-30 blur-xl transition-all duration-500`}
                      ></div>
                    </div>

                    <div className="relative z-10">
                      <h3
                        className={`font-bold text-lg ${category.textColor} mb-2 
                        group-hover:scale-105 transition-transform duration-300`}
                      >
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-500 group-hover:text-gray-600 transition-colors duration-300">
                        {category.description}
                      </p>
                      {count > 0 && (
                        <p className="text-xs text-gray-400 mt-2">
                          {count} events
                        </p>
                      )}
                    </div>

                    <div
                      className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${category.color} 
                      transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 
                      origin-left rounded-full`}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <button
            onClick={handleExploreAll}
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-2xl hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-200 shadow-xl hover:shadow-2xl group"
          >
            <span>Explore All Events</span>
            <svg
              className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default Categories;