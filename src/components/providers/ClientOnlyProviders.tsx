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

// ✅ CLIENT-ONLY: MobileUserNavigation - Only renders in browser to prevent hydration issues
// Uses ssr: false to ensure server doesn't try to render this component
export const MobileUserNavigation = dynamic(
  () => import('@/components/molecules/MobileUserNavigation').then(mod => ({ default: mod.MobileUserNavigation })),
  { 
    ssr: false,  // Critical: Prevent server rendering to avoid hydration mismatch
    loading: () => null  // No loading state needed - renders quickly on client
  }
);
