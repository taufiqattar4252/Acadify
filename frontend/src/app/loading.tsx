'use client';

import React from 'react';
import Image from 'next/image';

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full bg-white">

      {/* 
        Acadify Logo Placeholder
        To use the exact logo from your image, save it as 'logo.png' in the 'public' folder
        and uncomment the <Image /> tag below. 
      */}
      <div className="w-32 h-32 mb-8 relative flex items-center justify-center text-[#00BC7D]">
        <Image src="/logo.png" alt="Acadify Logo" width={128} height={128} className="object-contain" />

        {/* Fallback SVG roughly representing the shape */}
        <svg
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full text-current"
        >
          <path d="M50 160 Q30 160 40 135 L85 35 Q95 10 105 35 L125 80" stroke="currentColor" strokeWidth="24" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M125 150 Q160 160 160 120 Q160 90 120 110" fill="currentColor" />
          <circle cx="100" cy="85" r="7" fill="currentColor" />
          <rect x="96" y="90" width="8" height="60" rx="4" fill="currentColor" />
        </svg>
      </div>

      {/* Loading Text */}
      <h2 className="text-[#00BC7D] text-2xl font-semibold mb-6 tracking-wide">
        Loading...
      </h2>

      {/* Dynamic Loading Bar */}
      <div className="w-64 h-2.5 bg-gray-200 rounded-full overflow-hidden relative">
        <div
          className="absolute top-0 left-0 h-full bg-[#00BC7D] rounded-full animate-loading-bar"
        ></div>
      </div>

      <style jsx>{`
        @keyframes loading-bar {
          0% {
            width: 0%;
            left: 0%;
          }
          50% {
            width: 70%;
            left: 30%;
          }
          100% {
            width: 0%;
            left: 100%;
          }
        }
        .animate-loading-bar {
          animation: loading-bar 1.5s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}
