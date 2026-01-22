"use client";

import { useEffect, useState } from "react";

export default function ModernGlassPreloader() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if preloader has been shown before
    const hasShownPreloader = sessionStorage.getItem("preloaderShown");

    if (!hasShownPreloader) {
      setIsVisible(true);

      // Hide preloader after animation
      const timer = setTimeout(() => {
        setIsVisible(false);
        // Mark preloader as shown
        sessionStorage.setItem("preloaderShown", "true");
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 animate-fadeOut">
      {/* Glassmorphism Container */}
      <div className="relative">
        {/* Animated Background Blobs */}
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-20 left-20 w-72 h-72 bg-red-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>

        {/* Glass Card */}
        <div className="relative backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-12 shadow-2xl">
          {/* Logo/Brand */}
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-white mb-2 tracking-tight">
              EventzGo
            </h1>
            <p className="text-white/80 text-sm font-medium tracking-wider">
              DISCOVER AMAZING EVENTS
            </p>
          </div>

          {/* Animated Loader */}
          <div className="flex justify-center items-center space-x-3">
            <div className="w-4 h-4 bg-white rounded-full animate-bounce"></div>
            <div className="w-4 h-4 bg-white rounded-full animate-bounce animation-delay-200"></div>
            <div className="w-4 h-4 bg-white rounded-full animate-bounce animation-delay-400"></div>
          </div>

          {/* Progress Bar */}
          <div className="mt-8 w-64 h-1 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 animate-progress"></div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeOut {
          0% {
            opacity: 1;
          }
          80% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            visibility: hidden;
          }
        }

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

        @keyframes progress {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .animate-fadeOut {
          animation: fadeOut 2.5s ease-in-out forwards;
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

        .animation-delay-200 {
          animation-delay: 0.2s;
        }

        .animation-delay-400 {
          animation-delay: 0.4s;
        }

        .animate-progress {
          animation: progress 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
