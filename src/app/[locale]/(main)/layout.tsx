import { Footer } from '@/components/organisms';
import { Header } from '@/components/organisms/Header/Header';
import { ConditionalNewsletter } from '@/components/cells';
import { CartProvider } from '@/components/context/CartContext';
import { GuestWishlistProvider } from '@/components/context/GuestWishlistContext';
import { Suspense } from 'react';
// ✅ OPTIMIZED: Lazy-loaded client components (Next.js 15 requires client wrapper for ssr: false)
import { CookieConsent, MobileUserNavigation } from '@/components/providers/ClientOnlyProviders';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // ✅ OPTIMIZATION: No blocking category fetch
  // Header shows static categories immediately, loads full data in background
  // This eliminates 3-5s white screen on initial page load
  
  const initialCart = null; // Always null - let CartContext handle it

  return (
    <GuestWishlistProvider>
      <CartProvider initialCart={initialCart}>
        <div className="flex flex-col min-h-screen ">
          <Header />
          <div className="flex-grow pb-0">
            {children}
          </div>
          {/* ✅ OPTIMIZATION: Newsletter in Suspense for consistent pattern */}
          {/* Below fold, lightweight component - null fallback for no visual change */}
          <Suspense fallback={null}>
            <ConditionalNewsletter />
          </Suspense>
          
          {/* ✅ OPTIMIZATION: Footer in Suspense for non-blocking render */}
          {/* Footer is below fold, so it can load after initial content */}
          <Suspense fallback={<div className="h-96 bg-tertiary" />}>
            <Footer categories={[]} />
          </Suspense>
        </div>
        <MobileUserNavigation />
        <CookieConsent />
      </CartProvider>
    </GuestWishlistProvider>
  );
}