'use client';

import React, { useEffect } from 'react';

// Modern Black & Purple Jumping Preloader
export default function EventzGoPreloaderBlackPurple({ onComplete, duration = 1200 }: { onComplete?: () => void; duration?: number }) {
  useEffect(() => {
    if (!onComplete) return;
    const t = setTimeout(() => {
      try {
        onComplete();
      } catch (e) {
        // ignore
      }
    }, duration);
    return () => clearTimeout(t);
  }, [onComplete, duration]);
  const letters = ['E', 'V', 'E', 'N', 'T', 'Z', 'G', 'O'];
  
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black">
      {/* Modern Purple Glow Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-700/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
      </div>

      {/* Subtle Grid Pattern */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: 'linear-gradient(rgba(147,51,234,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(147,51,234,0.3) 1px, transparent 1px)',
        backgroundSize: '50px 50px'
      }}></div>

      <div className="relative flex flex-col items-center gap-10">
        
        {/* Jumping Letters with Glow */}
        <div className="flex items-center gap-1">
          {letters.map((letter, index) => (
            <div key={index} className="relative">
              {/* Glow Effect */}
              <span
                className="absolute top-0 left-0 text-5xl md:text-6xl font-bold tracking-tight text-purple-500 blur-lg opacity-60 animate-jump"
                style={{
                  animationDelay: `${index * 0.1}s`,
                  display: 'inline-block'
                }}
              >
                {letter}
              </span>
              
              {/* Main Letter */}
              <span
                className={`relative text-5xl md:text-6xl font-bold tracking-tight animate-jump ${
                  letter === 'Z' 
                    ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600' 
                    : 'text-white'
                }`}
                style={{
                  animationDelay: `${index * 0.1}s`,
                  display: 'inline-block',
                  textShadow: letter === 'Z' ? 'none' : '0 0 20px rgba(147, 51, 234, 0.5)'
                }}
              >
                {letter}
              </span>
            </div>
          ))}
        </div>

        {/* Modern Loading Dots */}
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce shadow-lg shadow-purple-500/50"></div>
          <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce shadow-lg shadow-purple-500/50" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce shadow-lg shadow-purple-500/50" style={{ animationDelay: '0.2s' }}></div>
        </div>

        {/* Loading Text */}
        <p className="text-purple-400 text-xs font-medium tracking-widest uppercase animate-pulse">
          Loading
        </p>
      </div>

      <style jsx>{`
        @keyframes jump {
          0%, 100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-20px) scale(1.1);
          }
        }

        .animate-jump {
          animation: jump 1.2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

// Elegant Black & Purple with Gradient Accent
export function EventzGoPreloaderBlackPurpleGradient() {
  const letters = ['E', 'V', 'E', 'N', 'T', 'Z', 'G', 'O'];
  
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Purple Glow Orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative flex flex-col items-center gap-10">
        
        {/* Letters with Purple Gradient Glow */}
        <div className="relative">
          {/* Background Glow */}
          <div className="absolute inset-0 blur-2xl opacity-50">
            <div className="flex items-center gap-1">
              {letters.map((letter, index) => (
                <span
                  key={index}
                  className="text-5xl md:text-6xl font-bold text-purple-500 animate-jump"
                  style={{
                    animationDelay: `${index * 0.1}s`,
                    display: 'inline-block'
                  }}
                >
                  {letter}
                </span>
              ))}
            </div>
          </div>
          
          {/* Main Letters */}
          <div className="relative flex items-center gap-1">
            {letters.map((letter, index) => (
              <span
                key={index}
                className={`text-5xl md:text-6xl font-bold tracking-tight animate-jump ${
                  letter === 'Z' 
                    ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600' 
                    : 'text-white'
                }`}
                style={{
                  animationDelay: `${index * 0.1}s`,
                  display: 'inline-block'
                }}
              >
                {letter}
              </span>
            ))}
          </div>
        </div>

        {/* Progress Line */}
        <div className="w-64 h-0.5 bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full animate-slideProgress shadow-lg shadow-purple-500/50"></div>
        </div>

        {/* Minimalist Text */}
        <p className="text-gray-500 text-xs font-medium tracking-widest uppercase">
          Please wait
        </p>
      </div>

      <style jsx>{`
        @keyframes jump {
          0%, 100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-20px) scale(1.1);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-30px) scale(1.1);
          }
        }

        @keyframes slideProgress {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .animate-jump {
          animation: jump 1.2s ease-in-out infinite;
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-slideProgress {
          animation: slideProgress 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

// Neon Purple on Black
export function EventzGoPreloaderNeonPurple() {
  const letters = ['E', 'V', 'E', 'N', 'T', 'Z', 'G', 'O'];
  
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black">
      {/* Neon Glow Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-purple-600/25 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative flex flex-col items-center gap-8">
        
        {/* Neon Letters */}
        <div className="flex items-center gap-1">
          {letters.map((letter, index) => (
            <span
              key={index}
              className={`text-5xl md:text-6xl font-bold tracking-tight animate-jump ${
                letter === 'Z' 
                  ? 'text-purple-500' 
                  : 'text-white'
              }`}
              style={{
                animationDelay: `${index * 0.1}s`,
                display: 'inline-block',
                textShadow: letter === 'Z' 
                  ? '0 0 10px #9333ea, 0 0 20px #9333ea, 0 0 30px #9333ea, 0 0 40px #9333ea'
                  : '0 0 10px rgba(147, 51, 234, 0.5)'
              }}
            >
              {letter}
            </span>
          ))}
        </div>

        {/* Neon Loading Ring */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-gray-800 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-purple-500 border-r-purple-500 rounded-full animate-spin"
               style={{ filter: 'drop-shadow(0 0 8px #9333ea)' }}></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"
                 style={{ boxShadow: '0 0 15px #9333ea' }}></div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes jump {
          0%, 100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-20px) scale(1.1);
          }
        }

        .animate-jump {
          animation: jump 1.2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

// Sleek Black & Purple Minimal
export function EventzGoPreloaderBlackPurpleMinimal() {
  const letters = ['E', 'V', 'E', 'N', 'T', 'Z', 'G', 'O'];
  
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black">
      <div className="relative flex flex-col items-center gap-12">
        
        {/* Clean Letters */}
        <div className="flex items-center gap-2">
          {letters.map((letter, index) => (
            <span
              key={index}
              className={`text-5xl md:text-6xl font-bold tracking-tight animate-jump ${
                letter === 'Z' 
                  ? 'text-purple-500' 
                  : 'text-white'
              }`}
              style={{
                animationDelay: `${index * 0.1}s`,
                display: 'inline-block'
              }}
            >
              {letter}
            </span>
          ))}
        </div>

        {/* Simple Progress Bar */}
        <div className="w-80 h-1 bg-gray-900 rounded-full overflow-hidden">
          <div className="h-full bg-purple-500 rounded-full animate-progress"></div>
        </div>
      </div>

      <style jsx>{`
        @keyframes jump {
          0%, 100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-20px) scale(1.1);
          }
        }

        @keyframes progress {
          0% {
            width: 0%;
          }
          50% {
            width: 50%;
          }
          100% {
            width: 100%;
          }
        }

        .animate-jump {
          animation: jump 1.2s ease-in-out infinite;
        }

        .animate-progress {
          animation: progress 2.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

// Premium Black & Deep Purple
export function EventzGoPreloaderDeepPurple() {
  const letters = ['E', 'V', 'E', 'N', 'T', 'Z', 'G', 'O'];
  
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-black via-purple-950/20 to-black">
      {/* Vibrant Purple Orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/25 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
      </div>

      <div className="relative flex flex-col items-center gap-10">
        
        {/* Deep Purple Accent Letters */}
        <div className="flex items-center gap-1">
          {letters.map((letter, index) => (
            <div key={index} className="relative">
              {/* Double Glow Effect */}
              <span
                className="absolute top-0 left-0 text-5xl md:text-6xl font-bold tracking-tight text-purple-500 blur-xl opacity-70 animate-jump"
                style={{
                  animationDelay: `${index * 0.1}s`,
                  display: 'inline-block'
                }}
              >
                {letter}
              </span>
              <span
                className="absolute top-0 left-0 text-5xl md:text-6xl font-bold tracking-tight text-purple-400 blur-md opacity-50 animate-jump"
                style={{
                  animationDelay: `${index * 0.1}s`,
                  display: 'inline-block'
                }}
              >
                {letter}
              </span>
              
              {/* Main Letter */}
              <span
                className={`relative text-5xl md:text-6xl font-bold tracking-tight animate-jump ${
                  letter === 'Z' 
                    ? 'text-transparent bg-clip-text bg-gradient-to-b from-purple-400 to-purple-600' 
                    : 'text-white'
                }`}
                style={{
                  animationDelay: `${index * 0.1}s`,
                  display: 'inline-block'
                }}
              >
                {letter}
              </span>
            </div>
          ))}
        </div>

        {/* Premium Loading Dots */}
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full animate-bounce shadow-2xl shadow-purple-500/50"></div>
          <div className="w-3 h-3 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full animate-bounce shadow-2xl shadow-purple-500/50" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-3 h-3 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full animate-bounce shadow-2xl shadow-purple-500/50" style={{ animationDelay: '0.2s' }}></div>
        </div>

        {/* Stylish Text */}
        <div className="flex items-center gap-2">
          <div className="w-12 h-px bg-gradient-to-r from-transparent to-purple-500"></div>
          <p className="text-purple-400 text-xs font-medium tracking-widest uppercase">
            Loading
          </p>
          <div className="w-12 h-px bg-gradient-to-l from-transparent to-purple-500"></div>
        </div>
      </div>

      <style jsx>{`
        @keyframes jump {
          0%, 100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-20px) scale(1.1);
          }
        }

        .animate-jump {
          animation: jump 1.2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

// Ultra Modern Purple & Black
export function EventzGoPreloaderUltraModern() {
  const letters = ['E', 'V', 'E', 'N', 'T', 'Z', 'G', 'O'];
  
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black">
      {/* Animated Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-purple-500/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          ></div>
        ))}
      </div>

      <div className="relative flex flex-col items-center gap-10">
        
        {/* Futuristic Letters */}
        <div className="flex items-center gap-1">
          {letters.map((letter, index) => (
            <div key={index} className="relative">
              {/* Outer Glow */}
              <span
                className="absolute top-0 left-0 text-5xl md:text-6xl font-bold tracking-tight text-purple-500/30 blur-2xl animate-jump"
                style={{
                  animationDelay: `${index * 0.1}s`,
                  display: 'inline-block',
                  transform: 'scale(1.5)'
                }}
              >
                {letter}
              </span>
              
              {/* Main Letter */}
              <span
                className={`relative text-5xl md:text-6xl font-bold tracking-tight animate-jump ${
                  letter === 'Z' 
                    ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-purple-500 to-purple-700' 
                    : 'text-white'
                }`}
                style={{
                  animationDelay: `${index * 0.1}s`,
                  display: 'inline-block'
                }}
              >
                {letter}
              </span>
            </div>
          ))}
        </div>

        {/* Hexagonal Spinner */}
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 border-2 border-purple-500/20 rotate-0 animate-spin" style={{ clipPath: 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)' }}></div>
          <div className="absolute inset-2 border-2 border-purple-400/40 rotate-45 animate-spin" style={{ clipPath: 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)', animationDirection: 'reverse', animationDuration: '3s' }}></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Modern Text */}
        <p className="text-purple-400/80 text-xs font-light tracking-[0.3em] uppercase">
          Loading
        </p>
      </div>

      <style jsx>{`
        @keyframes jump {
          0%, 100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-20px) scale(1.1);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh) translateX(50px);
            opacity: 0;
          }
        }

        .animate-jump {
          animation: jump 1.2s ease-in-out infinite;
        }

        .animate-float {
          animation: float linear infinite;
        }
      `}</style>
    </div>
  );
}