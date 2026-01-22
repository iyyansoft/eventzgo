"use client";

import { useState, useEffect } from "react";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import Hero from "@/components/home/Hero";
import Categories from "@/components/home/Categories";
import TrendingEvents from "@/components/home/TrendingEvents";
import StateSelector from "@/components/home/StateSelector";
import EventzGoPreloaderBlackPurple from '@/components/shared/EventzGoPreloaderBlackPurple';
import RecommendedEvents from "@/components/home/RecommendedEvents";
import PopularEvents from "@/components/home/PopularEvents";
import BestLiveEvents from "@/components/home/BestLiveEvents";
import OutdoorEvents from "@/components/home/OutdoorEvents";
import LocationBasedEvents from "@/components/home/LocationBasedEvents";
import { useLocation } from "@/contexts/LocationContext";

// Disable static generation for this page
export const dynamic = 'force-dynamic';

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const { showSelector, openSelector } = useLocation();

  // Loading is handled by the preloader's onComplete callback

  // Show location selector on first visit if no location is selected
  useEffect(() => {
    if (!loading) {
      const hasSelectedLocation = localStorage.getItem("selectedCity");
      if (!hasSelectedLocation) {
        openSelector();
      }
    }
  }, [loading, openSelector]);

  if (loading) return <EventzGoPreloaderBlackPurple onComplete={() => setLoading(false)} duration={3000} />;

  return (
    <main className="min-h-screen bg-white">
      <Hero />
      <Categories />
      {/* <StateSelector /> */}
      {!showSelector && (
        <>
          <LocationBasedEvents />
          <TrendingEvents />
        </>
      )}
      <RecommendedEvents />
      <PopularEvents />
      <BestLiveEvents />
      <OutdoorEvents />

    </main>
  );
}
