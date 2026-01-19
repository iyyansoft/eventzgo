"use client";

import React, { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { MapPin, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useLocation } from "@/contexts/LocationContext";

export default function LocationBasedEvents() {
    const router = useRouter();
    const { state, city } = useLocation();

    // Fetch all approved events
    const allEvents = useQuery(api.events.getAllEvents, { status: "approved", limit: 20 }) || [];

    // Filter events by selected state
    const locationEvents = useMemo(() => {
        if (!state || !allEvents) return [];
        return allEvents.filter((event) => event.venue && typeof event.venue !== 'string' && event.venue.state === state).slice(0, 4);
    }, [state, allEvents]);

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const formatTime = (timestamp: number) => {
        return new Date(timestamp).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        });
    };

    // Only show if location is selected and there are events
    if (!state || !locationEvents || locationEvents.length === 0) return null;

    return (
        <section className="py-12 bg-gradient-to-b from-purple-50 to-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center">
                            <MapPin className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                                Events in {city || state}
                            </h2>
                            <p className="text-sm text-gray-600 mt-1">
                                Happening near you
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => router.push(`/state/${state}`)}
                        className="flex items-center space-x-2 text-pink-600 hover:text-pink-700 font-medium transition-colors"
                    >
                        <span>View More</span>
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {locationEvents.map((event) => (
                        <div
                            key={event._id}
                            onClick={() => router.push(`/events/${event._id}`)}
                            className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group"
                        >
                            <div className="relative h-48 overflow-hidden">
                                <Image
                                    src={event.bannerImage}
                                    alt={event.title}
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                                <div className="absolute top-3 left-3">
                                    <span className="px-3 py-1 bg-pink-600 text-white rounded-full text-xs font-semibold">
                                        In Your Area
                                    </span>
                                </div>
                                <div className="absolute top-3 right-3">
                                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-gray-700 capitalize">
                                        {event.category}
                                    </span>
                                </div>
                                <div className="absolute bottom-3 left-3 flex items-center space-x-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg">
                                    <span className="text-yellow-500">⭐</span>
                                    <span className="text-sm font-semibold text-gray-900">
                                        {(Math.random() * 1 + 4).toFixed(1)}
                                    </span>
                                </div>
                            </div>

                            <div className="p-4">
                                <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-1">
                                    {event.title}
                                </h3>

                                <div className="flex items-center text-sm text-gray-600 mb-2">
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span>{formatDate(event.dateTime.start)}</span>
                                    <span className="mx-2">•</span>
                                    <span>{formatTime(event.dateTime.start)}</span>
                                </div>

                                <div className="flex items-center text-sm text-gray-600 mb-3">
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span className="line-clamp-1">
                                        {typeof event.venue === 'string'
                                            ? event.venue
                                            : (event.venue ? `${event.venue.name}, ${event.venue.city}` : 'Venue TBA')}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                    <div>
                                        <p className="text-xs text-gray-500">Starting from</p>
                                        <p className="text-lg font-bold text-gray-900">
                                            ₹{event.ticketTypes[0]?.price.toLocaleString()}
                                        </p>
                                    </div>
                                    <button className="px-4 py-2 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-lg font-medium hover:from-pink-700 hover:to-rose-700 transition-all">
                                        Book Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
