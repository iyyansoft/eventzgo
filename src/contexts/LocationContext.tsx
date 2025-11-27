"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface LocationContextType {
  city: string | null;
  state: string | null;
  showSelector: boolean;
  setCity: (city: string, state?: string) => void;
  openSelector: () => void;
  closeSelector: () => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [city, setCity] = useState<string | null>(null);
  const [state, setState] = useState<string | null>(null);
  const [showSelector, setShowSelector] = useState(false);

  // Load saved location from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCity = localStorage.getItem("selectedCity");
      const savedState = localStorage.getItem("selectedState");
      
      if (savedCity) {
        setCity(savedCity);
      }
      if (savedState) {
        setState(savedState);
      }
    }
  }, []);

  const handleSetCity = (newCity: string, newState?: string) => {
    setCity(newCity);
    if (newState) {
      setState(newState);
    }
    
    // Save to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("selectedCity", newCity);
      if (newState) {
        localStorage.setItem("selectedState", newState);
      }
    }
    
    setShowSelector(false);
  };

  const openSelector = () => {
    setShowSelector(true);
  };

  const closeSelector = () => {
    setShowSelector(false);
  };

  return (
    <LocationContext.Provider
      value={{
        city,
        state,
        showSelector,
        setCity: handleSetCity,
        openSelector,
        closeSelector,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
}