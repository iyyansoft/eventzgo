"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, User, Menu, X, LogOut, Settings } from "lucide-react";
import { SignInButton, SignOutButton, useClerk } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "@/contexts/LocationContext";
import LocationSelector from "./LocationSelector";
import Image from "next/image";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const { isSignedIn, isLoaded, role, fullName, imageUrl } = useAuth();
  const { city, openSelector } = useLocation();
  const { signOut } = useClerk();
  const router = useRouter();
  const lastScrollY = useRef<number>(0);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Search functionality with Convex
  const searchEventsQuery = useQuery(
    api.events.searchEvents,
    searchQuery.length >= 2 ? { searchTerm: searchQuery } : "skip"
  );

  useEffect(() => {
    if (searchEventsQuery) {
      setSearchResults(searchEventsQuery.slice(0, 5));
      setShowSearchResults(true);
    }
  }, [searchEventsQuery]);

  useEffect(() => {
    lastScrollY.current = typeof window !== "undefined" ? window.scrollY : 0;
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 50);
          lastScrollY.current = window.scrollY;
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isMenuOpen && !target.closest(".mobile-menu-container")) {
        setIsMenuOpen(false);
      }
      if (showUserMenu && userMenuRef.current && !userMenuRef.current.contains(target)) {
        setShowUserMenu(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("click", handleClickOutside);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen, showUserMenu]);

  const handleUserAction = () => {
    if (isSignedIn) setShowUserMenu(!showUserMenu);
  };

  const handleLogout = async () => {
    await signOut();
    setShowUserMenu(false);
    setIsMenuOpen(false);
    router.push("/");
  };

  const handleNavigation = (path: string) => {
    router.push(path);
    setIsMenuOpen(false);
    setShowUserMenu(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchResultClick = (eventId: string) => {
    router.push(`/events/${eventId}`);
    setSearchQuery("");
    setSearchResults([]);
    setShowSearchResults(false);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out ${isScrolled ? "bg-transparent" : "bg-white/95 backdrop-blur-md border-b border-gray-100"
          }`}
      >
        <div
          className={`w-full transition-all duration-300 ease-out ${isScrolled
            ? "max-w-4xl mx-auto my-2 sm:my-3 rounded-full bg-white/95 backdrop-blur-xl shadow-xl border border-white/20"
            : "max-w-7xl mx-auto"
            } px-3 sm:px-4 lg:px-8`}
        >
          <div className={`flex items-center justify-between w-full transition-all duration-300 ${isScrolled ? "h-12 sm:h-14" : "h-14 sm:h-16"}`}>
            {/* Logo */}
            <div
              className="flex items-center flex-shrink-0 cursor-pointer min-w-0"
              onClick={() => {
                router.push("/");
                setIsMenuOpen(false);
              }}
            >
              <Image
                src="/eventsgo_logo.png"
                alt="EVENTSGO"
                width={isScrolled ? 140 : 180}
                height={isScrolled ? 60 : 72}
                className="transition-all duration-300 object-contain"
                priority
              />
            </div>

            {/* Desktop Navigation */}
            {!isScrolled && (
              <nav className="hidden lg:flex items-center space-x-4 xl:space-x-6 flex-shrink-0">
                <button onClick={() => router.push("/category/concerts")} className="text-gray-700 hover:text-purple-600 transition-colors duration-200 font-medium text-sm xl:text-base whitespace-nowrap">Concerts</button>
                <button onClick={() => router.push("/category/sports")} className="text-gray-700 hover:text-purple-600 transition-colors duration-200 font-medium text-sm xl:text-base whitespace-nowrap">Sports</button>
                <button onClick={() => router.push("/category/events")} className="text-gray-700 hover:text-purple-600 transition-colors duration-200 font-medium text-sm xl:text-base whitespace-nowrap">Events</button>
              </nav>
            )}

            {/* Right Side Actions */}
            <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0 min-w-0">
              {/* Search Bar */}
              <div className={`relative transition-all duration-300 hidden md:block flex-shrink-0 ${isSearchFocused ? "w-48 lg:w-56" : isScrolled ? "w-20 lg:w-24" : "w-32 lg:w-40"}`} onClick={(e) => e.stopPropagation()}>
                <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
                  <Search className={`text-gray-400 ${isScrolled ? "h-3 w-3" : "h-4 w-4"}`} />
                </div>
                <input
                  type="text"
                  placeholder={isScrolled ? "Search..." : "Search events..."}
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className={`block w-full border rounded-lg transition-all duration-200 ${isScrolled
                    ? "pl-6 sm:pl-7 pr-2 py-1 text-xs border-gray-200 focus:ring-1 focus:ring-purple-500 focus:border-transparent bg-white"
                    : "pl-7 sm:pl-8 pr-2 sm:pr-3 py-1.5 sm:py-2 text-xs sm:text-sm border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                    }`}
                  onFocus={() => {
                    setIsSearchFocused(true);
                    if (searchResults.length > 0) setShowSearchResults(true);
                  }}
                  onBlur={() => {
                    setIsSearchFocused(false);
                    setTimeout(() => setShowSearchResults(false), 200);
                  }}
                />

                {/* Search Results Dropdown */}
                {showSearchResults && searchResults.length > 0 && !isScrolled && (
                  <div className="absolute mt-2 w-64 rounded-lg border border-gray-200 bg-white shadow-xl max-h-96 overflow-auto z-50">
                    <ul>
                      {searchResults.map((event) => (
                        <li
                          key={event._id}
                          onMouseDown={() => handleSearchResultClick(event._id)}
                          className="cursor-pointer border-b border-gray-100 p-3 hover:bg-purple-50 last:border-b-0"
                        >
                          <div className="flex items-start space-x-3">
                            <Image src={event.bannerImage} alt={event.title} width={48} height={48} className="h-12 w-12 rounded-lg object-cover" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">{event.title}</p>
                              <p className="text-xs text-gray-500 mt-1">{event.venue.city} • {formatDate(event.dateTime.start)}</p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Location */}
              {!isScrolled && (
                <button onClick={openSelector} className="hidden xl:flex items-center space-x-2 text-gray-700 hover:text-purple-600 cursor-pointer transition-colors duration-200 flex-shrink-0">
                  <MapPin className="w-4 h-4" />
                  <span className="font-medium text-sm whitespace-nowrap">{city || "Select City"}</span>
                </button>
              )}

              {/* User Profile Button */}
              {isLoaded && (
                <>
                  {!isSignedIn ? (
                    <SignInButton mode="modal">
                      <button className={`flex items-center space-x-1 sm:space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 hover:scale-105 flex-shrink-0 ${isScrolled ? "px-2 py-1 sm:px-3 sm:py-1.5" : "px-3 py-1.5 sm:px-4 sm:py-2"}`}>
                        <User className={`flex-shrink-0 ${isScrolled ? "w-3 h-3 sm:w-4 sm:h-4" : "w-4 h-4 sm:w-5 sm:h-5"}`} />
                        {!isScrolled && <span className="font-medium hidden sm:block text-xs sm:text-sm whitespace-nowrap">Sign In</span>}
                      </button>
                    </SignInButton>
                  ) : (
                    <div className="relative" ref={userMenuRef}>
                      <button onClick={handleUserAction} className={`flex items-center space-x-1 sm:space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 hover:scale-105 flex-shrink-0 ${isScrolled ? "px-2 py-1 sm:px-3 sm:py-1.5" : "px-3 py-1.5 sm:px-4 sm:py-2"}`}>
                        {imageUrl ? (
                          <Image src={imageUrl} alt={fullName || "User"} width={32} height={32} className={`rounded-full object-cover flex-shrink-0 ${isScrolled ? "w-5 h-5 sm:w-6 sm:h-6" : "w-6 h-6 sm:w-8 sm:h-8"}`} style={{ objectFit: "cover" }} />
                        ) : (
                          <User className={`flex-shrink-0 ${isScrolled ? "w-3 h-3 sm:w-4 sm:h-4" : "w-4 h-4 sm:w-5 sm:h-5"}`} />
                        )}
                        {!isScrolled && <span className="font-medium hidden sm:block text-xs sm:text-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-20">{fullName?.split(" ")[0] || "User"}</span>}
                      </button>

                      {/* User Dropdown Menu */}
                      {showUserMenu && (
                        <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-xl border border-gray-200 py-2 z-50">
                          <div className="px-4 py-3 border-b border-gray-100">
                            <p className="text-sm font-semibold text-gray-900">{fullName || "User"}</p>
                            <p className="text-xs text-gray-500 capitalize mt-0.5">{role} Account</p>
                          </div>
                          <div className="py-1">
                            <button onClick={() => handleNavigation("/profile")} className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors">
                              <User className="w-4 h-4" />
                              <span>My Profile</span>
                            </button>
                            <button onClick={() => handleNavigation("/profile/bookings")} className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors">
                              <span className="text-base">🎫</span>
                              <span>My Bookings</span>
                            </button>
                            {(role === "organiser" || role === "admin") && (
                              <>
                                <div className="border-t border-gray-100 my-1"></div>
                                <button onClick={() => handleNavigation("/management/organiser/dashboard")} className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-purple-600 hover:bg-purple-50 transition-colors font-medium">
                                  <span className="text-base">📊</span>
                                  <span>Organiser Dashboard</span>
                                </button>
                              </>
                            )}
                            {role === "admin" && (
                              <button onClick={() => handleNavigation("/management/admin/dashboard")} className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium">
                                <span className="text-base">👑</span>
                                <span>Admin Dashboard</span>
                              </button>
                            )}
                            <div className="border-t border-gray-100 my-1"></div>
                            <button onClick={() => handleNavigation("/profile/settings")} className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                              <Settings className="w-4 h-4" />
                              <span>Settings</span>
                            </button>
                            <button onClick={handleLogout} className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                              <LogOut className="w-4 h-4" />
                              <span>Sign Out</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* Mobile Menu Button */}
              <button className={`lg:hidden p-1.5 sm:p-2 rounded-lg transition-colors duration-200 hover:bg-gray-100 text-gray-700 mobile-menu-container flex-shrink-0 ${isScrolled ? "ml-1" : "ml-2"}`} onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }}>
                {isMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl mobile-menu-container overflow-hidden">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
                <Image src="/eventsgo_logo.png" alt="EVENTSGO" width={100} height={32} className="transition-all duration-300 object-contain" />
                <button onClick={() => setIsMenuOpen(false)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 flex-shrink-0">
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input type="text" placeholder="Search events..." value={searchQuery} onChange={handleSearchChange} className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-sm" />
                    {searchResults.length > 0 && (
                      <div className="mt-2 rounded-lg border border-gray-200 bg-white shadow-lg max-h-64 overflow-auto">
                        <ul>
                          {searchResults.map((event) => (
                            <li key={event._id} onClick={() => { handleSearchResultClick(event._id); setIsMenuOpen(false); }} className="cursor-pointer border-b border-gray-100 p-3 hover:bg-purple-50 last:border-b-0">
                              <div className="flex items-center space-x-3">
                                <Image src={event.bannerImage} alt={event.title} width={48} height={48} className="h-12 w-12 rounded object-cover" />
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-900 line-clamp-1">{event.title}</p>
                                  <p className="text-xs text-gray-500">{event.venue.city}</p>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">Categories</h3>
                    <button onClick={() => handleNavigation("/category/concerts")} className="w-full flex items-center space-x-3 px-3 py-3 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all duration-200 font-medium text-left"><span className="text-lg">🎵</span><span>Concerts</span></button>
                    <button onClick={() => handleNavigation("/category/sports")} className="w-full flex items-center space-x-3 px-3 py-3 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all duration-200 font-medium text-left"><span className="text-lg">🏆</span><span>Sports</span></button>
                    <button onClick={() => handleNavigation("/category/events")} className="w-full flex items-center space-x-3 px-3 py-3 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all duration-200 font-medium text-left"><span className="text-lg">🎉</span><span>Events</span></button>
                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <button onClick={openSelector} className="w-full flex items-center space-x-3 px-3 py-3 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all duration-200 font-medium text-left"><span className="text-lg">📍</span><span>{city || "Select City"}</span></button>
                    </div>
                    {isSignedIn && (
                      <div className="border-t border-gray-200 pt-4 mt-4 space-y-2">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">Account</h3>
                        <button onClick={() => handleNavigation("/profile")} className="w-full flex items-center space-x-3 px-3 py-3 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all duration-200 font-medium text-left"><User className="w-5 h-5" /><span>My Profile</span></button>
                        <button onClick={() => handleNavigation("/profile/bookings")} className="w-full flex items-center space-x-3 px-3 py-3 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all duration-200 font-medium text-left"><span className="text-lg">🎫</span><span>My Bookings</span></button>
                        {(role === "organiser" || role === "admin") && (
                          <button onClick={() => handleNavigation("/management/organiser/dashboard")} className="w-full flex items-center space-x-3 px-3 py-3 text-purple-600 hover:bg-purple-50 rounded-xl transition-all duration-200 font-medium text-left"><span className="text-lg">📊</span><span>Organiser Dashboard</span></button>
                        )}
                        {role === "admin" && (
                          <button onClick={() => handleNavigation("/management/admin/dashboard")} className="w-full flex items-center space-x-3 px-3 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 font-medium text-left"><span className="text-lg">👑</span><span>Admin Dashboard</span></button>
                        )}
                        <button onClick={handleLogout} className="w-full flex items-center space-x-3 px-3 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 font-medium text-left"><LogOut className="w-5 h-5" /><span>Sign Out</span></button>
                      </div>
                    )}
                    {!isSignedIn && isLoaded && (
                      <div className="border-t border-gray-200 pt-4 mt-4">
                        <SignInButton mode="modal">
                          <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-medium"><User className="w-5 h-5" /><span>Sign In</span></button>
                        </SignInButton>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <LocationSelector />
    </>
  );
};

export default Header;