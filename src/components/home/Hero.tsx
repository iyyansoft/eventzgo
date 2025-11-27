"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  MapPin,
  Star,
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const router = useRouter();

  // Fetch featured events from Convex. Keep query result separate so we can
  // treat the returned value as an array and avoid undefined during initial
  // renders (prevents hooks/render mismatch caused by conditional paths).
  const queryResult = useQuery(api.events.getFeaturedEvents, { limit: 5 });
  const featuredEvents = queryResult ?? [];
  const isLoading = queryResult === undefined;

  // Auto-slide effect
  useEffect(() => {
    if (featuredEvents && featuredEvents.length > 0) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % featuredEvents.length);
      }, 4000);
      return () => clearInterval(timer);
    }
  }, [featuredEvents]);

  const nextSlide = () => {
    if (featuredEvents) {
      setCurrentSlide((prev) => (prev + 1) % featuredEvents.length);
    }
  };

  const prevSlide = () => {
    if (featuredEvents) {
      setCurrentSlide(
        (prev) => (prev - 1 + featuredEvents.length) % featuredEvents.length
      );
    }
  };

  const handleExploreEvents = () => {
    const categoriesSection = document.querySelector("#categories-section");
    if (categoriesSection) {
      categoriesSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleWatchTrailer = () => {
    if (featuredEvents && featuredEvents.length > 0) {
      const currentEvent = featuredEvents[currentSlide];
      router.push(`/events/${currentEvent._id}`);
    }
  };

  const handleBookNow = (eventId: string) => {
    router.push(`/events/${eventId}`);
  };

  const getCardPosition = (index: number) => {
    if (!featuredEvents) return "hidden";
    const diff = index - currentSlide;
    const totalCards = featuredEvents.length;

    if (diff === 0) return "center";
    if (diff === 1 || diff === -(totalCards - 1)) return "right";
    if (diff === -1 || diff === totalCards - 1) return "left";
    if (diff === 2 || diff === -(totalCards - 2)) return "far-right";
    if (diff === -2 || diff === totalCards - 2) return "far-left";
    return "hidden";
  };

  const getCardStyle = (position: string) => {
    const styles = {
      center: "translate-x-0 scale-110 z-30 opacity-100 rotate-0",
      left: "sm:-translate-x-48 md:-translate-x-64 scale-90 sm:scale-95 z-20 opacity-70 sm:opacity-80 -rotate-6 sm:-rotate-12",
      right:
        "sm:translate-x-48 md:translate-x-64 scale-90 sm:scale-95 z-20 opacity-70 sm:opacity-80 rotate-6 sm:rotate-12",
      "far-left":
        "sm:-translate-x-72 md:-translate-x-96 scale-75 z-10 opacity-30 sm:opacity-40 -rotate-12 sm:-rotate-24",
      "far-right":
        "sm:translate-x-72 md:translate-x-96 scale-75 z-10 opacity-30 sm:opacity-40 rotate-12 sm:rotate-24",
      hidden: "translate-x-0 scale-50 z-0 opacity-0",
    };
    return styles[position as keyof typeof styles] || styles.hidden;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString("en-IN")}`;
  };

  // Loading state
  if (isLoading) {
    return (
      <section className="relative min-h-screen w-full overflow-hidden">
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url('/concert-background.png')`,
              clipPath: "polygon(0 0, 75% 0, 100% 100%, 0 100%)",
            }}
          />
        </div>
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-xl">Loading Featured Events...</p>
          </div>
        </div>
      </section>
    );
  }

  // No featured events state (only when not loading)
  if (!isLoading && featuredEvents.length === 0) {
    return (
      <section className="relative min-h-screen w-full overflow-hidden">
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url('/concert-background.png')`,
              clipPath: "polygon(0 0, 75% 0, 100% 100%, 0 100%)",
            }}
          />
          <div
            className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30"
            style={{
              clipPath: "polygon(0 0, 75% 0, 100% 100%, 0 100%)",
            }}
          />
        </div>

        <div className="relative z-10 min-h-screen flex items-center px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20">
          <div className="max-w-7xl mx-auto w-full">
            <div className="text-left">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight drop-shadow-2xl">
                Discover Amazing
                <span className="block bg-gradient-to-r from-yellow-400 via-pink-400 to-blue-400 bg-clip-text text-transparent drop-shadow-lg">
                  Experiences
                </span>
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-white/95 mb-6 sm:mb-8 leading-relaxed drop-shadow-lg">
                Book tickets for concerts, sports & more
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button
                  onClick={handleExploreEvents}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-200 shadow-xl"
                >
                  Explore Events
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative min-h-screen w-full overflow-hidden">
      {/* Background Image with Diagonal Clip Path */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/concert-background.png')`,
            clipPath: "polygon(0 0, 75% 0, 100% 100%, 0 100%)",
          }}
        />

        <div
          className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30"
          style={{
            clipPath: "polygon(0 0, 75% 0, 100% 100%, 0 100%)",
          }}
        />

        <div
          className="absolute inset-0 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100"
          style={{
            clipPath: "polygon(75% 0, 100% 0, 100% 100%, 100% 100%)",
          }}
        />

        <div className="absolute top-20 right-10 w-48 sm:w-72 h-48 sm:h-72 bg-purple-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-64 sm:w-96 h-64 sm:h-96 bg-pink-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/4 transform -translate-y-1/2 w-[300px] sm:w-[500px] lg:w-[600px] h-[300px] sm:h-[500px] lg:h-[600px] bg-blue-200/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Side - Text Content */}
          <div className="text-left order-2 lg:order-1">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight drop-shadow-2xl">
              Discover Amazing
              <span className="block bg-gradient-to-r from-yellow-400 via-pink-400 to-blue-400 bg-clip-text text-transparent drop-shadow-lg">
                Experiences
              </span>
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-white/95 mb-6 sm:mb-8 leading-relaxed drop-shadow-lg">
              Book tickets for concerts, sports & more
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                onClick={handleExploreEvents}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-200 shadow-xl"
              >
                Explore Events
              </button>
              <button
                onClick={handleWatchTrailer}
                className="bg-white/20 backdrop-blur-sm text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg hover:bg-white/30 transition-all duration-200 border border-white/30 shadow-lg"
              >
                View Featured Event
              </button>
            </div>
          </div>

          {/* Right Side - 3D Card Carousel */}
          <div className="relative w-full h-72 sm:h-80 md:h-96 lg:h-[420px] perspective-1000 order-1 lg:order-2">
            {featuredEvents.map((event, index) => {
              const position = getCardPosition(index);
              const isCenter = position === "center";

              return (
                <div
                  key={event._id}
                  className={`absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 
                    w-48 sm:w-64 md:w-72 lg:w-80 h-64 sm:h-80 md:h-88 lg:h-96 transition-all duration-700 ease-out cursor-pointer
                    ${getCardStyle(position)}`}
                  onClick={() => setCurrentSlide(index)}
                >
                  <div
                    className={`relative w-full h-full rounded-xl sm:rounded-2xl overflow-hidden shadow-xl
                    ${isCenter ? "shadow-purple-300/50" : "shadow-gray-300/50"}
                    hover:shadow-2xl transition-all duration-300`}
                  >
                    <Image
                      src={event.bannerImage}
                      alt={event.title}
                      width={320}
                      height={256}
                      className="w-full h-full object-cover"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                    {event.isFeatured && (
                      <div className="absolute top-2 sm:top-4 left-2 sm:left-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-2 sm:px-3 py-1 rounded-full">
                        FEATURED
                      </div>
                    )}

                    <div className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-white/20 backdrop-blur-sm text-white text-xs font-medium px-2 sm:px-3 py-1 rounded-full border border-white/30">
                      {event.category}
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 md:p-6 text-white">
                      <h3 className="text-sm sm:text-base md:text-lg font-bold mb-1 sm:mb-2 line-clamp-2">
                        {event.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-white/80 mb-2 sm:mb-3 hidden sm:block line-clamp-2">
                        {event.description}
                      </p>

                      <div className="flex items-center justify-between mb-2 sm:mb-4">
                        <div className="flex items-center space-x-2 sm:space-x-3 text-xs">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span className="hidden sm:inline">
                              {formatDate(event.dateTime.start)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-3 h-3" />
                            <span>{event.venue.city}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-white/60 mb-1">From</p>
                          <p className="text-sm sm:text-lg md:text-xl font-bold text-purple-300">
                            {formatPrice(event.pricing.basePrice)}
                          </p>
                        </div>

                        {isCenter && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBookNow(event._id);
                            }}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
                          >
                            Book Now
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 sm:space-x-6">
          <button
            onClick={prevSlide}
            className="bg-white/20 backdrop-blur-sm text-white p-2 sm:p-3 rounded-full hover:bg-white/30 transition-all duration-200 border border-white/30 shadow-lg"
          >
            <ChevronLeft className="w-4 sm:w-6 h-4 sm:h-6" />
          </button>

          <div className="flex space-x-2">
            {featuredEvents.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 sm:w-3 h-2 sm:h-3 rounded-full transition-all duration-200 ${
                  index === currentSlide ? "bg-white" : "bg-white/40"
                }`}
              />
            ))}
          </div>

          <button
            onClick={nextSlide}
            className="bg-white/20 backdrop-blur-sm text-white p-2 sm:p-3 rounded-full hover:bg-white/30 transition-all duration-200 border border-white/30 shadow-lg"
          >
            <ChevronRight className="w-4 sm:w-6 h-4 sm:h-6" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;