'use client';

import dynamic from 'next/dynamic';

// ✅ LAZY LOAD: CookieConsent - Not critical for initial render, saves ~15KB from initial bundle
// Moved to client component to use ssr: false (Next.js 15 requirement)
export const CookieConsent = dynamic(
  () => import('@/components/cells/CookieConsent').then(mod => ({ default: mod.CookieConsent })),
  { 
    ssr: false,  // Don't render on server - only needed in browser
    loading: () => null  // No loading spinner needed
  }
);

// ✅ IMMEDIATE RENDER: MobileUserNavigation - Shows UI immediately, data loads in background
// Removed ssr: false to allow immediate rendering, but component is still client-only
export const MobileUserNavigation = dynamic(
  () => import('@/components/molecules/MobileUserNavigation').then(mod => ({ default: mod.MobileUserNavigation })),
  { 
    loading: () => (
      // Show skeleton/placeholder while component loads (very brief)
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 md:hidden">
        <div className="flex justify-around items-center h-16 px-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex flex-col items-center justify-center flex-1 animate-pulse">
              <div className="w-6 h-6 bg-gray-200 rounded mb-1"></div>
              <div className="w-12 h-2 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </nav>
    )
  }
);
