"use client";

import { useEffect, useState } from "react";

export default function ThreePreloader() {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Check if we're in the browser
    if (typeof window === 'undefined') return;

    // Check if preloader has been shown before
    const hasShownPreloader = sessionStorage.getItem("preloaderShown");
    
    if (hasShownPreloader) {
      return; // Don't show preloader if already shown in this session
    }

    setIsVisible(true);

    // Mark preloader as shown
    sessionStorage.setItem("preloaderShown", "true");

    // Simulate loading progress
    const startTime = Date.now();
    const duration = 2500; // 2.5 seconds

    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const currentProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(currentProgress);

      if (currentProgress < 100) {
        requestAnimationFrame(updateProgress);
      } else {
        // Fade out after completion
        setTimeout(() => {
          setIsVisible(false);
        }, 500);
      }
    };

    requestAnimationFrame(updateProgress);
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900 transition-opacity duration-500 ${
        progress >= 100 ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-pink-600/20 to-purple-600/20 animate-pulse" />

      {/* Floating Particles Effect (CSS only) */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Loading UI Overlay with Glassmorphism */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        {/* Glass Panel Container */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-12 shadow-2xl">
          {/* Logo/Brand */}
          <div className="mb-8 text-center">
            <h1 className="text-6xl font-bold text-white mb-2 tracking-tight drop-shadow-lg animate-pulse">
              EventzGo
            </h1>
            <p className="text-white/90 text-lg drop-shadow-md">
              Your Gateway to Amazing Events
            </p>
          </div>

          {/* Progress Bar with Glass Effect */}
          <div className="w-80 max-w-md">
            <div className="h-3 bg-white/10 rounded-full overflow-hidden backdrop-blur-md border border-white/20 shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 transition-all duration-300 ease-out shadow-lg"
                style={{ 
                  width: `${progress}%`,
                  boxShadow: '0 0 20px rgba(236, 72, 153, 0.5)'
                }}
              />
            </div>
            <p className="text-white/90 text-center mt-4 text-sm font-medium drop-shadow-md">
              {progress < 100 ? `Loading ${Math.floor(progress)}%` : "Ready!"}
            </p>
          </div>

          {/* Animated dots */}
          <div className="flex space-x-2 mt-6 justify-center">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2.5 h-2.5 bg-white/80 rounded-full animate-bounce shadow-lg"
                style={{
                  animationDelay: `${i * 0.15}s`,
                  animationDuration: "1s",
                  boxShadow: '0 0 10px rgba(255, 255, 255, 0.5)'
                }}
              />
            ))}
          </div>
        </div>

        {/* Additional Glass Accent Elements */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-white/5 backdrop-blur-sm rounded-full border border-white/10 animate-pulse" />
        <div className="absolute bottom-32 right-32 w-24 h-24 bg-white/5 backdrop-blur-sm rounded-full border border-white/10 animate-pulse" style={{ animationDelay: '0.5s' }} />
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          50% {
            opacity: 0.3;
          }
          100% {
            transform: translateY(-100vh) translateX(50px);
            opacity: 0;
          }
        }
        .animate-float {
          animation: float linear infinite;
        }
      `}</style>
    </div>
  );
}
