import { Footer } from '@/components/organisms';
import { Header } from '@/components/organisms/Header/Header';
import { ConditionalNewsletter } from '@/components/cells';
import { CartProvider } from '@/components/context/CartContext';
import { GuestWishlistProvider } from '@/components/context/GuestWishlistContext';
import { Suspense } from 'react';
// ✅ OPTIMIZED: Lazy-loaded client components (Next.js 15 requires client wrapper for ssr: false)
import { CookieConsent, ConsentAwareAnalytics, MobileUserNavigation } from '@/components/providers/ClientOnlyProviders';
import { listCategoriesWithProducts } from '@/lib/data/categories';
import { getEssentialCategories } from '@/lib/data/categories-static';
import { listRegions } from '@/lib/data/regions';
import { setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';

// ✅ CRITICAL: Cache layout data to prevent blocking on every request
export const revalidate = 3600 // Cache for 1 hour

// ✅ CRITICAL: Enable static rendering for next-intl
// Without this, next-intl reads locale from headers() which forces dynamic rendering
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function MainLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  
  // ✅ CRITICAL: Enable static rendering for next-intl
  // This must be called BEFORE any next-intl APIs (getMessages, useTranslations, etc.)
  // Without this, next-intl reads locale from headers() which sets cache-control: no-store
  setRequestLocale(locale);

  // ✅ RESTORED: Fetch categories and regions on server-side with caching
  // This prevents client-side requests on every page navigation
  let categories: Awaited<ReturnType<typeof listCategoriesWithProducts>> | Awaited<ReturnType<typeof getEssentialCategories>>
  let regions: Awaited<ReturnType<typeof listRegions>> = []
  
  try {
    const startTime = Date.now()
    // Fetch categories and regions in parallel
    const [categoriesResult, regionsResult] = await Promise.all([
      listCategoriesWithProducts().catch(error => {
        console.error('Error loading categories in layout:', error)
        return getEssentialCategories()
      }),
      listRegions().catch(error => {
        console.error('Error loading regions in layout:', error)
        return []
      })
    ])
    const fetchTime = Date.now() - startTime
  
    
    categories = categoriesResult
    regions = regionsResult
  } catch (error) {
    console.error('Error loading layout data:', error)
    categories = getEssentialCategories()
    regions = []
  }
  
  const initialCart = null; // Always null - let CartContext handle it

  return (
    <GuestWishlistProvider>
      <CartProvider initialCart={initialCart}>
        <div className="flex flex-col min-h-screen ">
          {/* ✅ FIX: Pass parentCategories (tree structure) instead of categories (flat array) */}
          <Header categories={categories.parentCategories || []} regions={regions} />
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
            {/* Footer shows top-level parent categories only - use parentCategories (same as Header) */}
            <Footer categories={categories.parentCategories || []} />
          </Suspense>
        </div>
        <MobileUserNavigation />
        <CookieConsent />
        <ConsentAwareAnalytics />
      </CartProvider>
    </GuestWishlistProvider>
  );
}