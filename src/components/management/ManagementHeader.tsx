"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { APP_CONFIG } from "@/constants/config";
import { useRouter } from "next/navigation";
import { useUser, UserButton } from "@clerk/nextjs";
import { Search, MapPin, Bell, Menu, X } from "lucide-react";

export default function ManagementHeader() {
  const router = useRouter();
  const { user, isSignedIn } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isMenuOpen && !target.closest(".mobile-menu-container")) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isMenuOpen]);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out ${isScrolled
            ? "bg-transparent"
            : "bg-white/95 backdrop-blur-md border-b border-gray-100"
          }`}
      >
        <div
          className={`w-full transition-all duration-300 ease-out ${isScrolled
              ? "max-w-4xl mx-auto my-2 sm:my-3 rounded-full bg-white/95 backdrop-blur-xl shadow-xl border border-white/20"
              : "max-w-7xl mx-auto"
            } px-3 sm:px-4 lg:px-8`}
        >
          <div
            className={`flex items-center justify-between w-full transition-all duration-300 ${isScrolled ? "h-12 sm:h-14" : "h-14 sm:h-16"
              }`}
          >
            {/* Logo */}
            <div
              className="flex items-center flex-shrink-0 cursor-pointer min-w-0"
              onClick={() => {
                router.push("/management");
                setIsMenuOpen(false);
              }}
            >
              <Image
                src="/eventzgo_logo.png"
                alt={APP_CONFIG.name}
                width={48}
                height={48}
                className={`transition-all duration-300 ${isScrolled ? "h-5 sm:h-6" : "h-6 sm:h-8"
                  }`}
                style={{
                  height: isScrolled ? "1.5rem" : "2rem",
                  width: "auto",
                }}
              />
              {!isScrolled && (
                <span className="ml-2 font-bold text-gray-900 text-base">
                  Management
                </span>
              )}
            </div>

            {/* Desktop Navigation - Only show when not scrolled and on larger screens */}
            {!isScrolled && isSignedIn && (
              <nav className="hidden lg:flex items-center space-x-4 xl:space-x-6 flex-shrink-0">
                <button
                  onClick={() => router.push("/management/organiser")}
                  className="text-gray-700 hover:text-purple-600 transition-colors duration-200 font-medium text-sm xl:text-base whitespace-nowrap"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => router.push("/management/organiser/events")}
                  className="text-gray-700 hover:text-purple-600 transition-colors duration-200 font-medium text-sm xl:text-base whitespace-nowrap"
                >
                  My Events
                </button>
                <button
                  onClick={() => router.push("/management/organiser/analytics")}
                  className="text-gray-700 hover:text-purple-600 transition-colors duration-200 font-medium text-sm xl:text-base whitespace-nowrap"
                >
                  Analytics
                </button>
              </nav>
            )}

            {/* Right Side Actions */}
            <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0 min-w-0">
              {/* Search Bar - Hidden on mobile, adaptive on larger screens */}
              <div
                className={`relative transition-all duration-300 hidden md:block flex-shrink-0 ${isSearchFocused
                    ? "w-48 lg:w-56"
                    : isScrolled
                      ? "w-20 lg:w-24"
                      : "w-32 lg:w-40"
                  }`}
              >
                <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
                  <Search
                    className={`text-gray-400 ${isScrolled ? "h-3 w-3" : "h-4 w-4"
                      }`}
                  />
                </div>
                <input
                  type="text"
                  placeholder={isScrolled ? "Search..." : "Search events..."}
                  className={`block w-full border rounded-lg transition-all duration-200 ${isScrolled
                      ? "pl-6 sm:pl-7 pr-2 py-1 text-xs border-gray-200 focus:ring-1 focus:ring-purple-500 focus:border-transparent bg-white"
                      : "pl-7 sm:pl-8 pr-2 sm:pr-3 py-1.5 sm:py-2 text-xs sm:text-sm border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                    }`}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                />
              </div>

              {/* Location - Only show when not scrolled and on larger screens */}
              {!isScrolled && (
                <div className="hidden xl:flex items-center space-x-2 text-gray-700 hover:text-purple-600 cursor-pointer transition-colors duration-200 flex-shrink-0">
                  <MapPin className="w-4 h-4" />
                  <span className="font-medium text-sm whitespace-nowrap">
                    Mumbai
                  </span>
                </div>
              )}

              {/* Notifications - Only show when user is logged in */}
              {isSignedIn && (
                <button
                  className={`relative p-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 rounded-lg hover:bg-gray-100 ${isScrolled ? "p-1.5" : "p-2"
                    }`}
                >
                  <Bell className={`${isScrolled ? "w-4 h-4" : "w-5 h-5"}`} />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
              )}

              {/* User Profile Button or Auth Buttons */}
              {isSignedIn ? (
                <div className="flex items-center">
                  <UserButton afterSignOutUrl="/management" />
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => router.push("/sign-in")}
                    className={`flex items-center space-x-1 sm:space-x-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 flex-shrink-0 ${isScrolled
                        ? "px-2 py-1 sm:px-3 sm:py-1.5"
                        : "px-3 py-1.5 sm:px-4 sm:py-2"
                      }`}
                  >
                    {!isScrolled && (
                      <span className="font-medium hidden sm:block text-xs sm:text-sm whitespace-nowrap">
                        Sign In
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => router.push("/sign-up")}
                    className={`flex items-center space-x-1 sm:space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 hover:scale-105 flex-shrink-0 ${isScrolled
                        ? "px-2 py-1 sm:px-3 sm:py-1.5"
                        : "px-3 py-1.5 sm:px-4 sm:py-2"
                      }`}
                  >
                    {!isScrolled && (
                      <span className="font-medium hidden sm:block text-xs sm:text-sm whitespace-nowrap">
                        Sign Up
                      </span>
                    )}
                  </button>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                className={`lg:hidden p-1.5 sm:p-2 rounded-lg transition-colors duration-200 hover:bg-gray-100 text-gray-700 mobile-menu-container flex-shrink-0 ${isScrolled ? "ml-1" : "ml-2"
                  }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMenuOpen(!isMenuOpen);
                }}
              >
                {isMenuOpen ? (
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                ) : (
                  <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />

          {/* Menu Panel */}
          <div className="fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl mobile-menu-container overflow-hidden">
            <div className="flex flex-col h-full">
              {/* Menu Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
                <div className="flex items-center space-x-2">
                  <Image
                    src="/eventzgo_logo.png"
                    alt={APP_CONFIG.name}
                    width={24}
                    height={24}
                    className="h-6"
                    priority
                  />
                  <span className="font-bold text-gray-900">Management</span>
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 flex-shrink-0"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Menu Content */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                  {/* Mobile Search */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search events, users..."
                      className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-sm"
                    />
                  </div>

                  {/* Auth Buttons for Mobile - Only show when not authenticated */}
                  {!isSignedIn && (
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          router.push("/sign-in");
                          setIsMenuOpen(false);
                        }}
                        className="w-full bg-white border border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200"
                      >
                        Sign In
                      </button>
                      <button
                        onClick={() => {
                          router.push("/sign-up");
                          setIsMenuOpen(false);
                        }}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
                      >
                        Sign Up
                      </button>
                    </div>
                  )}

                  {/* Navigation Links */}
                  {isSignedIn && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">
                        Navigation
                      </h3>

                      <button
                        onClick={() => {
                          router.push("/management/organiser");
                          setIsMenuOpen(false);
                        }}
                        className="w-full flex items-center space-x-3 px-3 py-3 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all duration-200 font-medium text-left"
                      >
                        <span className="text-lg">📊</span>
                        <span>Dashboard</span>
                      </button>

                      <button
                        onClick={() => {
                          router.push("/management/organiser/events");
                          setIsMenuOpen(false);
                        }}
                        className="w-full flex items-center space-x-3 px-3 py-3 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all duration-200 font-medium text-left"
                      >
                        <span className="text-lg">📅</span>
                        <span>My Events</span>
                      </button>

                      <button
                        onClick={() => {
                          router.push("/management/organiser/analytics");
                          setIsMenuOpen(false);
                        }}
                        className="w-full flex items-center space-x-3 px-3 py-3 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all duration-200 font-medium text-left"
                      >
                        <span className="text-lg">📈</span>
                        <span>Analytics</span>
                      </button>

                      {/* Location */}
                      <div className="border-t border-gray-200 pt-4 mt-4">
                        <button className="w-full flex items-center space-x-3 px-3 py-3 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all duration-200 font-medium text-left">
                          <span className="text-lg">📍</span>
                          <span>Mumbai</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}