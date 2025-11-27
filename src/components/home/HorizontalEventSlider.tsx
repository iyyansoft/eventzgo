"use client";

import { useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Calendar, MapPin, Star, Clock, ArrowRight } from "lucide-react";
import { Event } from "@/types";
import { formatCurrency } from "@/lib/currency-utils";
import { format } from "date-fns";

interface HorizontalEventSliderProps {
  title: string;
  subtitle: string;
  events: Event[];
  icon?: React.ReactNode;
  onViewMore?: () => void;
}

export default function HorizontalEventSlider({
  title,
  subtitle,
  events,
  icon,
  onViewMore,
}: HorizontalEventSliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleEventClick = (eventId: string) => {
    router.push(`/events/${eventId}`);
  };

  const handleBookNow = (e: React.MouseEvent, eventId: string) => {
    e.stopPropagation();
    router.push(`/events/${eventId}`);
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4 group">
            {icon && <div className="flex-shrink-0">{icon}</div>}
            <div>
              <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
              <p className="text-gray-600 mt-1">{subtitle}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {onViewMore && (
              <button
                onClick={onViewMore}
                className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 font-medium transition-colors duration-200 group"
              >
                <span>View More</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
              </button>
            )}

            <div className="flex items-center space-x-2">
              <button
                onClick={() => scroll("left")}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={() => scroll("right")}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex space-x-6 overflow-x-auto scrollbar-hide pb-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {events.map((event) => {
            const minPrice = Math.min(...event.ticketTypes.map((t) => t.price));
            
            return (
              <div
                key={event._id}
                className="flex-shrink-0 w-80 group cursor-pointer"
                onClick={() => handleEventClick(event._id)}
              >
                <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={event.bannerImage}
                      alt={event.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    {event.isFeatured && (
                      <div className="absolute top-3 left-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                        Featured
                      </div>
                    )}

                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-medium px-3 py-1 rounded-full capitalize">
                      {event.category}
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors duration-200">
                      {event.title}
                    </h3>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">{format(new Date(event.dateTime.start), "MMM dd, yyyy")}</span>
                        <Clock className="w-4 h-4 ml-2" />
                        <span className="text-sm">{format(new Date(event.dateTime.start), "hh:mm a")}</span>
                      </div>

                      <div className="flex items-center space-x-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">{event.venue.name}, {event.venue.city}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Starting from</p>
                        <p className="text-xl font-bold text-purple-600">{formatCurrency(minPrice)}</p>
                      </div>

                      <button
                        onClick={(e) => handleBookNow(e, event._id)}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-200 text-sm"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {onViewMore && (
            <div className="flex-shrink-0 w-80 group cursor-pointer" onClick={onViewMore}>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl h-full flex items-center justify-center shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 border-dashed border-gray-300 hover:border-purple-400 relative overflow-hidden">
                <div className="text-center p-8">
                  <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 rounded-full mx-auto mb-4 w-20 h-20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 overflow-hidden">
                    <ArrowRight className="w-8 h-8 text-white transform transition-transform duration-500 ease-out group-hover:translate-x-8" />
                    <ArrowRight className="w-8 h-8 text-white absolute transform -translate-x-8 transition-transform duration-500 ease-out group-hover:translate-x-0" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">View More</h3>
                  <p className="text-gray-600">Discover more amazing events</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}