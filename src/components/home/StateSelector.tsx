"use client";

import React, { useRef, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { MapPin, ChevronRight, ChevronLeft, X } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useLocation } from "@/contexts/LocationContext";

const StateSelector = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { showSelector, closeSelector, setCity } = useLocation();

  // Fetch all approved events from Convex
  const allEvents = useQuery(api.events.getAllEvents, { status: "approved" });

  // Define states with their information
  const statesConfig = [
    {
      name: "Maharashtra",
      city: "Mumbai",
      image: "https://images.pexels.com/photos/1007426/pexels-photo-1007426.jpeg?auto=compress&cs=tinysrgb&w=800",
      gradient: "from-orange-500 to-red-500",
    },
    {
      name: "Karnataka",
      city: "Bangalore",
      image: "https://images.pexels.com/photos/1007426/pexels-photo-1007426.jpeg?auto=compress&cs=tinysrgb&w=800",
      gradient: "from-green-500 to-teal-500",
    },
    {
      name: "Delhi",
      city: "New Delhi",
      image: "https://images.pexels.com/photos/789750/pexels-photo-789750.jpeg?auto=compress&cs=tinysrgb&w=800",
      gradient: "from-blue-500 to-purple-500",
    },
    {
      name: "Tamil Nadu",
      city: "Chennai",
      image: "https://images.pexels.com/photos/3573382/pexels-photo-3573382.jpeg?auto=compress&cs=tinysrgb&w=800",
      gradient: "from-pink-500 to-rose-500",
    },
    {
      name: "West Bengal",
      city: "Kolkata",
      image: "https://images.pexels.com/photos/1007427/pexels-photo-1007427.jpeg?auto=compress&cs=tinysrgb&w=800",
      gradient: "from-yellow-500 to-orange-500",
    },
    {
      name: "Rajasthan",
      city: "Jaipur",
      image: "https://images.pexels.com/photos/3581368/pexels-photo-3581368.jpeg?auto=compress&cs=tinysrgb&w=800",
      gradient: "from-purple-500 to-indigo-500",
    },
    {
      name: "Gujarat",
      city: "Ahmedabad",
      image: "https://images.pexels.com/photos/3573382/pexels-photo-3573382.jpeg?auto=compress&cs=tinysrgb&w=800",
      gradient: "from-cyan-500 to-blue-500",
    },
    {
      name: "Uttar Pradesh",
      city: "Lucknow",
      image: "https://images.pexels.com/photos/789750/pexels-photo-789750.jpeg?auto=compress&cs=tinysrgb&w=800",
      gradient: "from-emerald-500 to-green-500",
    },
    {
      name: "Telangana",
      city: "Hyderabad",
      image: "https://images.pexels.com/photos/1007426/pexels-photo-1007426.jpeg?auto=compress&cs=tinysrgb&w=800",
      gradient: "from-violet-500 to-purple-500",
    },
    {
      name: "Goa",
      city: "Panaji",
      image: "https://images.pexels.com/photos/3573382/pexels-photo-3573382.jpeg?auto=compress&cs=tinysrgb&w=800",
      gradient: "from-teal-500 to-green-500",
    },
  ];

  // Calculate event count per state
  const states = useMemo(() => {
    if (!allEvents) return [];

    return statesConfig.map((state) => ({
      ...state,
      events: allEvents.filter(
        (event) => event.venue && typeof event.venue !== 'string' && event.venue.state === state.name
      ).length,
    }));
  }, [allEvents]);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleStateClick = (state: any) => {
    if (showSelector) {
      // If modal is open, set the location and close modal
      setCity(state.city, state.name);
    } else {
      // Otherwise navigate to state page
      router.push(`/state/${encodeURIComponent(state.name)}`);
    }
  };

  // Loading state
  if (!allEvents) {
    const loadingContent = (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading states...</p>
        </div>
      </div>
    );

    if (showSelector) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full h-screen max-w-4xl max-h-screen flex flex-col bg-white rounded-3xl">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Select Your Location</h2>
              <button
                onClick={closeSelector}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-8">
              {loadingContent}
            </div>
          </div>
        </div>
      );
    }

    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loadingContent}
        </div>
      </section>
    );
  }

  return (
    <>
      {showSelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full h-screen max-w-4xl max-h-screen flex flex-col bg-white rounded-3xl">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Select Your Location</h2>
                <p className="text-gray-600 mt-1">Choose a city to discover events near you</p>
              </div>
              <button
                onClick={closeSelector}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {states.map((state) => (
                  <div
                    key={state.name}
                    className="group cursor-pointer transform hover:scale-105 transition-all duration-300"
                    onClick={() => handleStateClick(state)}
                  >
                    <div className="relative h-48 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300">
                      <Image
                        src={state.image}
                        alt={state.name}
                        width={320}
                        height={256}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />

                      <div
                        className={`absolute inset-0 bg-gradient-to-t ${state.gradient} opacity-70 group-hover:opacity-80 transition-opacity duration-300`}
                      ></div>

                      <div className="absolute inset-0 flex flex-col justify-between p-4 text-white">
                        <div className="bg-white/20 backdrop-blur-sm rounded-full p-2 w-fit">
                          <MapPin className="w-5 h-5" />
                        </div>

                        <div>
                          <h3 className="text-xl font-bold mb-1">{state.name}</h3>
                          <p className="text-white/90 text-sm mb-2">{state.city}</p>
                          <p className="text-white/70 text-xs">{state.events} Events</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {!showSelector && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                  Explore Events by State
                </h2>
                <p className="text-lg text-gray-600">
                  Discover amazing events happening across India's vibrant cities
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => scroll("left")}
                  className="p-2 rounded-full bg-white hover:bg-gray-100 shadow-md transition-colors duration-200"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  onClick={() => scroll("right")}
                  className="p-2 rounded-full bg-white hover:bg-gray-100 shadow-md transition-colors duration-200"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            <div
              ref={scrollRef}
              className="flex space-x-6 overflow-x-auto scrollbar-hide pb-4"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {states.map((state) => (
                <div
                  key={state.name}
                  className="flex-shrink-0 w-80 group cursor-pointer transform hover:scale-105 transition-all duration-300"
                  onClick={() => handleStateClick(state)}
                >
                  <div className="relative h-64 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300">
                    <Image
                      src={state.image}
                      alt={state.name}
                      width={320}
                      height={256}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />

                    <div
                      className={`absolute inset-0 bg-gradient-to-t ${state.gradient} opacity-70 group-hover:opacity-80 transition-opacity duration-300`}
                    ></div>

                    <div className="absolute inset-0 flex flex-col justify-between p-6 text-white">
                      <div className="flex items-center justify-between">
                        <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                          <MapPin className="w-5 h-5" />
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                          <span className="text-sm font-medium">
                            {state.events} Events
                          </span>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-2xl font-bold mb-1">{state.name}</h3>
                        <p className="text-white/90 mb-4">{state.city}</p>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-white/80">
                            View all events
                          </span>
                          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* View More Card */}
              <div
                className="flex-shrink-0 w-80 group cursor-pointer"
                onClick={() => router.push("/events")}
              >
                <div className="relative h-64 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 shadow-lg hover:shadow-2xl transition-all duration-300 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      <ChevronRight className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">View All Events</h3>
                    <p className="text-white/80">Explore events across India</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default StateSelector;