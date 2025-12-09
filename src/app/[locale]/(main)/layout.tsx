import { Footer } from '@/components/organisms';
import { Header } from '@/components/organisms/Header/Header';
import { ConditionalNewsletter } from '@/components/cells';
import { CartProvider } from '@/components/context/CartContext';
import { listCategoriesWithProducts } from '@/lib/data/categories';
import { Suspense } from 'react';
// ✅ OPTIMIZED: Lazy-loaded client components (Next.js 15 requires client wrapper for ssr: false)
import { CookieConsent, MobileUserNavigation } from '@/components/providers/ClientOnlyProviders';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // ✅ OPTIMIZATION: Fetch categories once and pass to both Header and Footer
  // This eliminates duplicate API calls (Header + Footer both need categories)
  // React cache() will deduplicate this call if both components call it
  console.log("🏗️ MAIN LAYOUT: Fetching categories (should only happen once per page load)")
  const categoriesData = await listCategoriesWithProducts().catch((error) => {
    console.error("Layout: Error retrieving categories:", error)
    return { parentCategories: [], categories: [] }
  })
  console.log("✅ MAIN LAYOUT: Categories fetched successfully:", {
    parentCount: categoriesData.parentCategories.length,
    totalCount: categoriesData.categories.length
  })
 
  const initialCart = null; // Always null - let CartContext handle it

  return (
    <CartProvider initialCart={initialCart}>
      <div className="flex flex-col min-h-screen ">
        <Header categories={categoriesData} />
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
          <Footer categories={categoriesData.parentCategories} />
        </Suspense>
      </div>
      <MobileUserNavigation />
      <CookieConsent />
    </CartProvider>
  );
}