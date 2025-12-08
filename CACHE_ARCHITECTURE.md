# Cache Architecture Issues & Solutions

## 🔴 Critical Issue Identified

### Problem: Client-Side Cache Used in Server-Side Functions

**Current State:**
- `unified-cache.ts` uses JavaScript `Map` (client-side memory)
- Data fetching functions in `lib/data/*.ts` are server-side (`"use server"`)
- Each server request creates a NEW cache instance
- Result: **100% cache miss rate** (as seen in Vercel logs)

**Evidence from Vercel Logs:**
```
Cache Miss - Cache Miss - Cache Miss - Cache Miss...
```

### Why This Happens:

```typescript
// unified-cache.ts - CLIENT-SIDE MEMORY
const memoryCache = new Map<string, { data: any; expires: number }>()

// products.ts - SERVER-SIDE
"use server"
export const listProducts = async (...) => {
  return unifiedCache.get(cacheKey, async () => {
    // ❌ Each server request = new Map instance = cache miss
  })
}
```

---

## ✅ Solutions

### Solution 1: Use Next.js Built-in Caching (RECOMMENDED)

Next.js provides proper server-side caching:

#### A. Request Deduplication (Automatic)
```typescript
// Multiple calls to same fetch in single render = 1 actual request
const product1 = await fetch('/api/products/123')
const product2 = await fetch('/api/products/123') // Deduplicated!
```

#### B. Data Cache with `next.revalidate`
```typescript
const { products } = await sdk.client.fetch('/store/products', {
  method: "GET",
  query: { ... },
  headers,
  next: { revalidate: 300 }, // Cache for 5 minutes
})
```

#### C. `unstable_cache` for Complex Logic
```typescript
import { unstable_cache } from 'next/cache'

export const getCachedProducts = unstable_cache(
  async (countryCode: string) => {
    return await listProducts({ countryCode })
  },
  ['products'], // Cache key prefix
  {
    revalidate: 300, // 5 minutes
    tags: ['products'] // For cache invalidation
  }
)
```

---

### Solution 2: Redis/Upstash for Distributed Cache

For true server-side caching across instances:

```typescript
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

export async function getCachedData<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl: number = 300
): Promise<T> {
  // Try cache
  const cached = await redis.get(key)
  if (cached) return cached as T

  // Fetch and cache
  const data = await fetchFn()
  await redis.setex(key, ttl, JSON.stringify(data))
  return data
}
```

---

## 📊 Current Cache Usage Analysis

### Files Using `unifiedCache` (Broken):

1. **`products.ts`**
   - `listProducts()` - ✅ FIXED (using `next.revalidate`)
   - `listProductsWithPromotions()` - ❌ Still using unifiedCache
   - `getShippingOptions()` - ❌ Still using unifiedCache
   - `batchFetchProductsByHandles()` - ❌ Still using unifiedCache

2. **`promotions.ts`**
   - `getActivePromotions()` - ❌ Still using unifiedCache
   - `getPromotionFilterOptions()` - ❌ Still using unifiedCache
   - `getSellersWithPromotions()` - ❌ Still using unifiedCache

3. **`measurements.ts`**
   - `getProductMeasurements()` - ❌ Still using unifiedCache

4. **`variant-attributes.ts`**
   - `getVariantAttributes()` - ❌ Still using unifiedCache

5. **`categories.ts`**
   - Cache temporarily disabled (commented out)

---

## 🎯 Recommended Action Plan

### Phase 1: Critical Fixes (Immediate)
1. ✅ **Fixed**: `listProducts()` - Now using `next.revalidate`
2. **TODO**: Fix `listProductsWithPromotions()` - High traffic function
3. **TODO**: Fix `batchFetchProductsByHandles()` - Causes duplicate image downloads

### Phase 2: Performance Optimization (Next)
4. Fix promotion-related functions
5. Fix measurement functions
6. Consider Redis for high-traffic data

### Phase 3: Long-term (Future)
7. Implement proper cache invalidation strategy
8. Add cache warming for popular products
9. Monitor cache hit rates in production

---

## 📈 Expected Improvements

### Before (Current):
```
Cache Hit Rate: 0%
Same product fetched: 3+ times per page load
Image downloads: 3x (12MB each = 36MB total)
Server load: High (every request hits database)
```

### After (With Next.js Caching):
```
Cache Hit Rate: 80-95%
Same product fetched: 1 time (cached for 5 min)
Image downloads: 1x (180KB AVIF, cached)
Server load: Low (most requests served from cache)
```

---

## 🔧 Implementation Status

- ✅ `listProducts()` - Fixed with `next.revalidate`
- ⏳ Other functions - Need similar fixes
- 📝 Documentation - This file

**Next Steps:**
1. Review and approve this architecture
2. Apply fixes to remaining functions
3. Monitor cache hit rates in Vercel logs
4. Consider Redis if needed for scale
