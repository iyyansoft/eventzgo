"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, Bell } from "lucide-react";
import Link from "next/link";

// Disable static generation for this page
export const dynamic = 'force-dynamic';

export default function ComingSoonPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the email to your backend
    setSubmitted(true);
    setEmail("");
    // Reset the message after 3 seconds
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900 flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-blob"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
      <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-blob animation-delay-4000"></div>

      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="absolute top-4 sm:top-6 left-4 sm:left-6 flex items-center space-x-2 text-white/80 hover:text-white transition-colors duration-200 group text-sm sm:text-base"
      >
        <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform duration-200" />
        <span>Back</span>
      </button>

      {/* Main Content */}
      <div className="relative z-10 max-w-2xl w-full text-center px-4 sm:px-0">
        {/* Logo / Icon */}
        <div className="mb-6 sm:mb-8 inline-block">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-yellow-400 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl">
            <span className="text-3xl sm:text-4xl">ðŸš€</span>
          </div>
        </div>

        {/* Main Heading */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-3 sm:mb-4 leading-tight">
          Coming <span className="bg-gradient-to-r from-yellow-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">Soon</span>
        </h1>

        {/* Subheading */}
        <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-6 sm:mb-8 leading-relaxed">
          Management Portal
        </p>

        {/* Description */}
        <p className="text-base sm:text-lg md:text-lg text-white/80 mb-8 sm:mb-12 max-w-xl mx-auto leading-relaxed px-2">
          We're working hard to bring you an amazing experience to manage your events, connect with vendors, and grow your business. Get notified when we launch!
        </p>

        {/* Email Subscription */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-white/20 shadow-2xl mb-8 sm:mb-12 mx-2">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 flex items-center justify-center space-x-2">
            <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
            <span>Get Notified</span>
          </h2>
          <p className="text-sm sm:text-base text-white/80 mb-4 sm:mb-6">
            Enter your email to be the first to know when Management Portal launches
          </p>

          <form onSubmit={handleEmailSubmit} className="space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="flex-1 px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl bg-white/20 border border-white/30 text-white text-sm sm:text-base placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
              />
              <button
                type="submit"
                className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold text-sm sm:text-base rounded-lg sm:rounded-xl hover:from-pink-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center justify-center space-x-2 group whitespace-nowrap"
              >
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform duration-200" />
                <span className="hidden sm:inline">Notify Me</span>
                <span className="sm:hidden">Notify</span>
              </button>
            </div>
            {submitted && (
              <p className="text-green-400 text-xs sm:text-sm font-semibold animate-fade-in">
                âœ“ Thanks! We'll notify you when we launch.
              </p>
            )}
          </form>
        </div>

        {/* Features Preview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-8 sm:mb-12 px-2">
          <div className="bg-white/10 backdrop-blur-md rounded-lg sm:rounded-xl p-4 sm:p-6 border border-white/20 hover:border-pink-500/50 transition-all duration-200 hover:bg-white/20">
            <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">ðŸ“Š</div>
            <h3 className="text-base sm:text-lg font-semibold text-white mb-1 sm:mb-2">Analytics</h3>
            <p className="text-white/70 text-xs sm:text-sm">Track event performance and sales data</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-lg sm:rounded-xl p-4 sm:p-6 border border-white/20 hover:border-pink-500/50 transition-all duration-200 hover:bg-white/20">
            <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">ðŸŽ«</div>
            <h3 className="text-base sm:text-lg font-semibold text-white mb-1 sm:mb-2">Event Management</h3>
            <p className="text-white/70 text-xs sm:text-sm">Create and manage events effortlessly</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-lg sm:rounded-xl p-4 sm:p-6 border border-white/20 hover:border-pink-500/50 transition-all duration-200 hover:bg-white/20">
            <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">ðŸ¤</div>
            <h3 className="text-base sm:text-lg font-semibold text-white mb-1 sm:mb-2">Connect</h3>
            <p className="text-white/70 text-xs sm:text-sm">Network with vendors and sponsors</p>
          </div>
        </div>

        {/* CTA Button */}
        <Link
          href="/"
          className="inline-block px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-sm sm:text-base rounded-lg sm:rounded-xl hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-200 shadow-xl"
        >
          Explore Events
        </Link>
      </div>

      {/* CSS for animations */}
      <style>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.3s ease-in;
        }
      `}</style>
    </div>
  );
}
