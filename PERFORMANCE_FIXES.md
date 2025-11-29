# Homepage Performance Optimization Guide

## Critical Issue #1: Hero Image LCP (3,220ms Resource Load Delay)

### Current Problem
- Hero is a client component with `"use client"` directive
- Browser doesn't discover hero image until JavaScript executes
- Preload link exists but image still loads late
- LCP: 3.85s (84% is resource load delay)

### Solution A: Convert Hero to Server Component (RECOMMENDED)

#### 1. Create Separate Client Component for Controls

**File: `src/components/sections/Hero/HeroControls.tsx`** (NEW)
```tsx
"use client"

import { useState, useEffect, useCallback } from "react"
import { ArrowLeftIcon, ArrowRightIcon } from "@/icons"
import { HERO_CONFIG } from "@/config/hero-banners"

interface HeroControlsProps {
  bannersCount: number
  currentIndex: number
  onIndexChange: (index: number) => void
  pauseOnHover?: boolean
}

export const HeroControls = ({ 
  bannersCount, 
  currentIndex, 
  onIndexChange,
  pauseOnHover = true 
}: HeroControlsProps) => {
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [isHovered, setIsHovered] = useState(false)

  // Auto-switch functionality
  useEffect(() => {
    if (!isAutoPlaying || bannersCount <= 1) return

    const interval = setInterval(() => {
      onIndexChange((currentIndex + 1) % bannersCount)
    }, HERO_CONFIG.autoSwitchInterval)

    return () => clearInterval(interval)
  }, [isAutoPlaying, bannersCount, currentIndex, onIndexChange])

  const handleDotClick = useCallback((index: number) => {
    onIndexChange(index)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), HERO_CONFIG.resumeAfterManualNavigation)
  }, [onIndexChange])

  const handlePrevious = useCallback(() => {
    onIndexChange((currentIndex - 1 + bannersCount) % bannersCount)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), HERO_CONFIG.resumeAfterManualNavigation)
  }, [currentIndex, bannersCount, onIndexChange])

  const handleNext = useCallback(() => {
    onIndexChange((currentIndex + 1) % bannersCount)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), HERO_CONFIG.resumeAfterManualNavigation)
  }, [currentIndex, bannersCount, onIndexChange])

  return (
    <>
      {/* Navigation Arrows */}
      {bannersCount > 1 && (
        <>
          <button
            onClick={handlePrevious}
            className={`hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 items-center justify-center w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
            aria-label="Previous slide"
          >
            <ArrowLeftIcon color="white" size={25} />
          </button>

          <button
            onClick={handleNext}
            className={`hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 items-center justify-center w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
            aria-label="Next slide"
          >
            <ArrowRightIcon color="white" size={25} />
          </button>
        </>
      )}

      {/* Navigation Dots */}
      {bannersCount > 1 && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20">
          <div className="flex space-x-3">
            {Array.from({ length: bannersCount }).map((_, index) => (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 hover:scale-110 ${
                  index === currentIndex
                    ? 'bg-white shadow-lg'
                    : 'bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      )}
    </>
  )
}
```

#### 2. Convert Hero to Server Component

**File: `src/components/sections/Hero/Hero.tsx`** (MODIFY)
```tsx
// REMOVE "use client" directive
import Image from "next/image"
import { HERO_BANNERS, HERO_CONFIG } from "@/config/hero-banners"
import { HeroControls } from "./HeroControls"

export interface HeroBanner {
  // Keep existing interface
}

type HeroProps = {
  banners?: HeroBanner[]
  className?: string
}

export const Hero = ({ 
  banners = HERO_BANNERS,
  className = ""
}: HeroProps) => {
  if (!banners.length) return null

  // Render first banner as static (LCP element)
  const firstBanner = banners[0]

  return (
    <section className={`relative w-full h-[20vh] sm:h-[40vh] lg:h-[50vh] min-h-[300px] sm:min-h-[350px] lg:min-h-[400px] overflow-hidden ${className}`}>
      {/* First Banner - Static for LCP */}
      <div className="relative w-full h-full">
        <Image
          src={firstBanner.image}
          alt={firstBanner.alt}
          fill
          className="object-cover"
          priority // ✅ Critical: Loads immediately
          fetchPriority="high" // ✅ Critical: Highest priority
          quality={HERO_CONFIG.imageQuality}
          sizes="100vw"
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        
        {/* Text Content */}
        {firstBanner.content && (
          <div className={`absolute inset-0 z-10 flex items-${firstBanner.content.verticalAlignment || 'center'} justify-${firstBanner.content.alignment || 'center'} px-4 sm:px-6 lg:px-8`}>
            <div className="w-full text-center">
              {/* Render heading, paragraph, CTA */}
            </div>
          </div>
        )}
      </div>

      {/* Client Component for Carousel Controls */}
      <HeroControls 
        bannersCount={banners.length}
        currentIndex={0}
        onIndexChange={() => {}} // Implement state management
        pauseOnHover={HERO_CONFIG.pauseOnHover}
      />
    </section>
  )
}
```

### Solution B: Optimize Preload (QUICK FIX)

**File: `src/app/[locale]/(main)/page.tsx`** (MODIFY Lines 181-189)
```tsx
{/* ✅ OPTIMIZED: Better preload syntax */}
<link
  rel="preload"
  as="image"
  href="/images/hero/Hero01.webp"
  // Use lowercase for better browser compatibility
  // @ts-ignore
  imagesrcset="/_next/image?url=%2Fimages%2Fhero%2FHero01.webp&w=640&q=90 640w, /_next/image?url=%2Fimages%2Fhero%2FHero01.webp&w=1080&q=90 1080w, /_next/image?url=%2Fimages%2Fhero%2FHero01.webp&w=1920&q=90 1920w"
  // @ts-ignore
  imagesizes="100vw"
  // @ts-ignore
  fetchpriority="high"
/>

{/* ✅ ADD: Preconnect to image optimization service */}
<link rel="preconnect" href="/_next/image" crossOrigin="anonymous" />
```

---

## Critical Issue #2: Duplicate API Calls

### Current Problem
- `retrieveCustomer()` called in both page.tsx and Header.tsx
- `getUserWishlists()` called in both page.tsx and Header.tsx
- `listCategories()` called in both Header.tsx and Footer.tsx
- Total: 3 duplicate API calls per page load (~450ms wasted)

### Solution: Implement React Cache

**File: `src/lib/data/customer.ts`** (MODIFY)
```tsx
import { cache } from 'react'

// ✅ Wrap with React cache - deduplicates calls within same request
export const retrieveCustomer = cache(async (): Promise<HttpTypes.StoreCustomer | null> => {
  try {
    const sdk = await getServerSdk()
    const { customer } = await sdk.store.customer.retrieve()
    return customer
  } catch (error: any) {
    if (error?.status === 401) {
      return null
    }
    console.error("Error retrieving customer:", error)
    return null
  }
})
```

**File: `src/lib/data/wishlist.ts`** (MODIFY)
```tsx
import { cache } from 'react'

export const getUserWishlists = cache(async () => {
  try {
    const sdk = await getServerSdk()
    const response = await sdk.store.wishlist.list()
    return response
  } catch (error) {
    console.error("Error retrieving wishlists:", error)
    return { wishlists: [] }
  }
})
```

**File: `src/lib/data/categories.ts`** (MODIFY)
```tsx
import { cache } from 'react'

export const listCategories = cache(async () => {
  // Existing implementation
  // Now called only ONCE per request even if Header and Footer both call it
})

export const listCategoriesWithProducts = cache(async () => {
  // Existing implementation
})
```

**Expected Impact:**
- Eliminate 3 duplicate API calls
- Save ~450ms on initial page load
- Reduce server load by 50%

---

## Critical Issue #3: Main Thread Blocking (2.0s TBT)

### Problem: Entire React Bundle Loaded Upfront

### Solution 1: Lazy Load Below-Fold Components

**File: `src/app/[locale]/(main)/page.tsx`** (MODIFY)
```tsx
import dynamic from 'next/dynamic'
import { Suspense } from "react"

// ✅ Lazy load below-fold sections
const BlogSection = dynamic(
  () => import('@/components/sections/BlogSection').then(mod => ({ default: mod.BlogSection })),
  {
    loading: () => <BlogSkeleton />,
    ssr: true // Keep SSR for SEO
  }
)

const DesignerOfTheWeekSection = dynamic(
  () => import('@/components/sections/DesignerOfTheWeekSection').then(mod => ({ default: mod.DesignerOfTheWeekSection })),
  {
    loading: () => null,
    ssr: false // Not critical, load after interaction
  }
)

const HomeCategories = dynamic(
  () => import('@/components/sections/HomeCategories').then(mod => ({ default: mod.HomeCategories })),
  {
    loading: () => null,
    ssr: true // Keep for SEO
  }
)

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  // ... existing code ...

  return (
    <>
      {/* Above-fold: Load immediately */}
      <Hero />
      <SmartBestProductsSection user={user} wishlist={wishlist} />
      
      {/* Below-fold: Lazy load */}
      <Suspense fallback={<ProductsSkeleton />}>
        <HomeNewestProductsSection /* ... */ />
      </Suspense>
      
      <HomeCategories heading="Wybrane" headingItalic="kategorie" />
      
      <DesignerOfTheWeekSection />
      
      <Suspense fallback={<BlogSkeleton />}>
        <BlogSection />
      </Suspense>
    </>
  )
}
```

### Solution 2: Optimize Package Imports

**File: `next.config.ts`** (MODIFY Lines 16-27)
```typescript
experimental: {
  optimizeCss: true,
  optimizePackageImports: [
    'lucide-react',
    '@heroicons/react',
    'react-icons',
    '@medusajs/ui',        // ✅ ADD: Reduce Medusa UI bundle
    'react-instantsearch', // ✅ ADD: Tree-shake Algolia
    '@medusajs/js-sdk',    // ✅ ADD: Reduce SDK bundle
  ],
  turbo: {
    // ... existing config
  },
},
```

### Solution 3: Remove Algolia from Homepage

**Check these files for Algolia imports:**
```bash
# Search for Algolia imports
grep -r "algoliasearch" src/app/[locale]/(main)/
grep -r "react-instantsearch" src/app/[locale]/(main)/
```

**If found, remove or lazy load:**
```tsx
// Only import Algolia on search/category pages, not homepage
```

---

## High Priority Issue #4: Client Context Overhead

### Problem: PromotionDataProvider and BatchPriceProvider Wrap Entire Page

### Solution: Pass Data Directly to Components

**File: `src/app/[locale]/(main)/page.tsx`** (MODIFY)
```tsx
// REMOVE context providers from page level
// INSTEAD: Pass data directly to components that need it

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  // ... fetch data ...

  return (
    <>
      {/* ✅ Pass data directly instead of using context */}
      <SmartBestProductsSection 
        user={user} 
        wishlist={wishlist}
        promotionalProducts={promotionalProductsMap}
      />
      
      <HomeNewestProductsSection 
        user={user}
        wishlist={wishlist}
      />
    </>
  )
}
```

**File: `src/components/sections/HomeProductSection/SmartBestProductsSection.tsx`** (MODIFY)
```tsx
interface SmartBestProductsSectionProps {
  heading?: string
  locale?: string
  limit?: number
  home?: boolean
  user?: HttpTypes.StoreCustomer | null
  wishlist?: SerializableWishlist[]
  promotionalProducts?: Map<string, HttpTypes.StoreProduct> // ✅ ADD
}

export const SmartBestProductsSection = async ({ 
  // ... existing props ...
  promotionalProducts
}: SmartBestProductsSectionProps) => {
  // ✅ No need for PromotionDataProvider context
  // Just use the data passed as props
  
  return (
    <section>
      <HomeProductsCarousel
        sellerProducts={bestProducts}
        promotionalProducts={promotionalProducts}
        // ...
      />
    </section>
  )
}
```

---

## Medium Priority Issue #5: Font Loading

### Current: Fonts Loaded in layout.tsx

**File: `src/app/layout.tsx`** (OPTIMIZE Lines 10-66)
```tsx
const instrumentSans = localFont({
  src: [
    {
      path: "../../public/fonts/instrument-sans-v4-latin-ext-regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/instrument-sans-v4-latin-ext-600.woff2",
      weight: "600",
      style: "normal",
    },
    // ✅ REMOVE: Italic variants if not used above-fold
    // Load them on-demand or remove entirely
  ],
  variable: "--font-instrument-sans",
  display: "swap",
  preload: true,
  fallback: ['system-ui', '-apple-system', 'sans-serif'],
})

// ✅ ADD: font-display: optional for faster FCP
const instrumentSerif = localFont({
  src: [
    {
      path: "../../public/fonts/instrument-serif-v5-latin-ext-regular.woff2",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-instrument-serif",
  display: "optional", // ✅ CHANGE: Use system font until custom font loads
  preload: true,
  fallback: ['Georgia', 'serif'],
})
```

---

## Implementation Checklist

### Phase 1: Critical Fixes (Day 1)
- [ ] Implement React cache for customer.ts
- [ ] Implement React cache for wishlist.ts
- [ ] Implement React cache for categories.ts
- [ ] Test: Verify only 1 API call per endpoint per request
- [ ] Convert Hero to server component OR optimize preload
- [ ] Test: Verify LCP improvement

### Phase 2: Bundle Optimization (Day 2)
- [ ] Add optimizePackageImports to next.config.ts
- [ ] Lazy load BlogSection with dynamic import
- [ ] Lazy load DesignerOfTheWeekSection with dynamic import
- [ ] Remove Algolia from homepage bundle
- [ ] Test: Verify bundle size reduction

### Phase 3: Context Optimization (Day 3)
- [ ] Remove PromotionDataProvider from page level
- [ ] Pass promotional data as props
- [ ] Remove BatchPriceProvider from page level
- [ ] Pass price data as props
- [ ] Test: Verify hydration time improvement

### Phase 4: Font & Image Optimization (Day 4)
- [ ] Optimize font loading strategy
- [ ] Implement intersection observer for below-fold images
- [ ] Add loading="lazy" to non-critical images
- [ ] Test: Verify CLS and FCP improvements

---

## Testing & Validation

### Before Deployment
1. **Run Lighthouse Audit:**
   ```bash
   npm run build
   npm run start
   # Open Chrome DevTools > Lighthouse > Run audit
   ```

2. **Check Bundle Size:**
   ```bash
   npm run build:analyze
   ```

3. **Test on Real Device:**
   - Use Chrome DevTools > Device Mode
   - Test on actual mobile device
   - Verify LCP < 2.5s, TBT < 300ms

### Success Metrics
- **LCP**: < 2.5s (currently 3.85s)
- **TBT**: < 300ms (currently 2.0s)
- **FCP**: < 1.8s
- **Bundle Size**: < 350KB (currently ~500KB)
- **API Calls**: 50% reduction in duplicate calls

---

## Monitoring

### Add Performance Monitoring
```tsx
// src/app/[locale]/(main)/page.tsx
export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const startTime = Date.now()
  
  // ... fetch data ...
  
  const dataFetchTime = Date.now() - startTime
  
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 Homepage Performance:', {
      dataFetchTime: `${dataFetchTime}ms`,
      userFetched: !!user,
      promotionalProductsCount: promotionalProductsMap.size
    })
  }
  
  return (/* ... */)
}
```

---

## Rollback Plan

If issues occur after deployment:

1. **Revert Hero Changes:**
   ```bash
   git revert <commit-hash>
   ```

2. **Disable React Cache:**
   ```tsx
   // Remove cache() wrapper temporarily
   export const retrieveCustomer = async () => { /* ... */ }
   ```

3. **Re-enable Context Providers:**
   ```tsx
   // Wrap page with providers again
   <PromotionDataProvider>
     <BatchPriceProvider>
       {children}
     </BatchPriceProvider>
   </PromotionDataProvider>
   ```

---

## Additional Resources

- [Next.js Performance Optimization](https://nextjs.org/docs/app/building-your-application/optimizing)
- [React Cache API](https://react.dev/reference/react/cache)
- [Web Vitals](https://web.dev/vitals/)
- [Lighthouse Performance Scoring](https://developer.chrome.com/docs/lighthouse/performance/performance-scoring)
