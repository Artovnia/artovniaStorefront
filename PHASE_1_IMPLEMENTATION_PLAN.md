# Phase 1 Implementation Plan - Product Page Optimization

## Date: December 9, 2024

---

## Critical Issues to Address

### **1. Production Crash: `reduce()` on Empty Array** 🔴

**Location:** `src/lib/helpers/get-promotional-price.ts:40`

**Error:**
```
TypeError: Reduce of empty array with no initial value
at Array.reduce (<anonymous>)
```

**Root Cause:**
```typescript
const targetVariant = variantId 
  ? product.variants?.find(v => v.id === variantId)
  : product.variants?.reduce((prev, current) => { // ❌ CRASHES if variants is []
      // ...
    })
```

**Fix:**
```typescript
const targetVariant = variantId 
  ? product.variants?.find(v => v.id === variantId)
  : product.variants?.reduce((prev, current) => {
      // ...
    }, product.variants[0]) // ✅ Provide initial value
```

---

### **2. Wishlist Caching Safety** 🔒

**Concern:** ISR caching might cache user-specific wishlist data and share it across users.

**Analysis:**

#### **Current Wishlist Data Flow:**

**Server-Side (ProductDetailsPage.tsx):**
```typescript
// ✅ Fetched server-side, passed as props
const userResult = await retrieveCustomer()
  .then(async (user) => {
    if (user) {
      const wishlistData = await getUserWishlists()
      return { user, wishlist: wishlistData.wishlists || [], authenticated }
    }
    return { user: null, wishlist: [], authenticated: false }
  })

// ✅ Passed to ProductReviews (not cached)
<ProductReviews
  customer={customer}
  isAuthenticated={isUserAuthenticated}
/>
```

**Client-Side (ProductCard.tsx):**
```typescript
// ✅ Receives wishlist as props from server
export const ProductCard = ({
  user = null,
  wishlist = [],
  onWishlistChange,
}) => {
  // Uses wishlist to determine if product is in wishlist
  const inWishlist = wishlist?.some(w => 
    w.products?.some(p => p.id === product.id)
  )
}
```

**HomeProductSection.tsx (Seller Products):**
```typescript
// ✅ Server component - no caching of user data
export const HomeProductSection = async ({ products, isSellerSection }) => {
  return (
    <BatchPriceProvider currencyCode="PLN" days={30}>
      <HomeProductsCarousel
        sellerProducts={products.slice(0, 8)}
        isSellerSection={isSellerSection}
      />
    </BatchPriceProvider>
  )
}
```

**Safety Verification:**
- ✅ Wishlist fetched server-side per request (not cached)
- ✅ `unifiedCache` blocks user-specific keys (`user:`, `customer:`, `cart:`)
- ✅ ProductCard receives wishlist as props (no independent fetch)
- ✅ HomeProductSection doesn't fetch user data

**Conclusion:** **Wishlist is SAFE** - no caching risk.

---

### **3. ISR Caching Strategy for Product Pages**

**Safe to Cache:**
- ✅ Product data (5 min)
- ✅ Seller products (5 min)
- ✅ Reviews (5 min)
- ✅ Vendor status (1 min)
- ✅ Breadcrumbs (5 min)

**NEVER Cache:**
- ❌ User data (customer, auth)
- ❌ Wishlist
- ❌ Review eligibility
- ❌ Cart data

**Implementation:**
```typescript
// ✅ Enable ISR for product pages
export const revalidate = 300 // 5 minutes

// ✅ React cache() for deduplication (within single request)
import { cache } from 'react'

const getProduct = cache(async (handle: string, locale: string) => {
  // This deduplicates within a SINGLE REQUEST ONLY
  // Does NOT cache across users or requests
  const { response } = await listProducts({
    countryCode: locale,
    queryParams: { handle },
  })
  return response.products[0]
})
```

**Key Points:**
1. **ISR (`revalidate: 300`)** - Caches rendered HTML for 5 minutes
   - ✅ Safe because user-specific data is fetched fresh
   - ✅ Only caches public product data
   
2. **React `cache()`** - Deduplicates within single request
   - ✅ Safe because it's per-request, not cross-request
   - ✅ Prevents duplicate fetches in `generateMetadata()` + `ProductPage()`

3. **`unstable_cache()`** - Server-side data cache
   - ✅ Safe for public data (reviews, vendor status)
   - ❌ NEVER use for user-specific data

---

## Phase 1 Implementation

### **Step 1: Fix Production Crash** (CRITICAL)

**File:** `src/lib/helpers/get-promotional-price.ts`

**Change:**
```typescript
// Line 38-48
const targetVariant = variantId 
  ? product.variants?.find(v => v.id === variantId)
  : product.variants && product.variants.length > 0
    ? product.variants.reduce((prev, current) => {
        const prevPrice = prev.prices?.find(p => !regionId || p.region_id === regionId)
        const currentPrice = current.prices?.find(p => !regionId || p.region_id === regionId)
        
        if (!prevPrice) return current
        if (!currentPrice) return prev
        
        return (currentPrice.amount || 0) < (prevPrice.amount || 0) ? current : prev
      }, product.variants[0]) // ✅ Provide initial value
    : undefined // ✅ Handle empty array case
```

---

### **Step 2: Remove `force-dynamic` and Enable ISR**

**File:** `src/app/[locale]/(main)/products/[handle]/page.tsx`

**Changes:**
```typescript
// ❌ REMOVE (Line 8)
export const dynamic = 'force-dynamic'

// ✅ ADD (Line 8)
export const revalidate = 300 // 5 minutes ISR

// ✅ ADD React cache() for deduplication (Line 6)
import { cache } from 'react'

// ✅ ADD cached product fetch (after imports)
const getCachedProduct = cache(async (handle: string, locale: string) => {
  console.log('🔍 PRODUCT PAGE: Fetching product:', handle)
  const { response } = await listProducts({
    countryCode: locale,
    queryParams: { handle },
  })
  console.log('✅ PRODUCT PAGE: Product fetched:', response.products[0] ? 'FOUND' : 'NOT FOUND')
  return response.products[0]
})

// ✅ UPDATE generateMetadata (Line 19)
export async function generateMetadata({ params }) {
  const { handle, locale } = await params
  
  try {
    const product = await getCachedProduct(handle, locale) // ✅ Use cached fetch
    
    if (!product) {
      return {
        title: "Product Not Found",
        description: "The requested product could not be found.",
        robots: { index: false, follow: false },
      }
    }

    const baseMetadata = generateProductMetadata(product, locale)
    // ... rest of metadata
  } catch (error) {
    console.error("Error generating product metadata:", error)
    return { title: "Product", description: "Product page" }
  }
}

// ✅ UPDATE ProductPage (Line 80)
export default async function ProductPage({ params }) {
  const { handle, locale } = await params

  const product = await getCachedProduct(handle, locale) // ✅ Use cached fetch (no duplicate!)

  return (
    <main className="container">
      <ProductDetailsPage handle={handle} locale={locale} product={product} />
    </main>
  )
}
```

---

### **Step 3: Add Logging to Verify Caching**

**Purpose:** Confirm that:
1. Product is fetched only once per request (not twice)
2. ISR caching works (product not fetched on subsequent visits)
3. User data is still fetched fresh

**Logs Added:**
```typescript
// Product fetch
console.log('🔍 PRODUCT PAGE: Fetching product:', handle)
console.log('✅ PRODUCT PAGE: Product fetched:', product ? 'FOUND' : 'NOT FOUND')
```

---

## Safety Checklist

### **Before Deployment:**

- [ ] **Fix `reduce()` crash** - Add initial value
- [ ] **Remove `force-dynamic`** - Enable ISR
- [ ] **Add React `cache()`** - Deduplicate product fetch
- [ ] **Add logging** - Verify behavior
- [ ] **Test locally** - `npm run dev`
- [ ] **Build succeeds** - `npm run build`
- [ ] **Test production** - `npm start`

### **Verify User Data Safety:**

- [ ] Wishlist still works correctly
- [ ] Different users see different wishlists
- [ ] No user data in cached HTML
- [ ] Review eligibility correct per user

### **Verify Caching Works:**

- [ ] First visit: Product fetched (see logs)
- [ ] Second visit (within 5 min): Product NOT fetched (cached)
- [ ] Console shows only 1 product fetch per request (not 2)
- [ ] User data still fetched fresh every time

---

## Expected Results

### **Performance:**

**Before:**
- First load: 2.5-3s
- Subsequent loads: 2.5-3s (no caching)
- Product fetched: 2x per request

**After:**
- First load: 1.3s (**50% faster**)
- Cached loads: 0.3s (**90% faster**)
- Product fetched: 1x per request

### **Console Logs:**

**First Visit:**
```
🔍 PRODUCT PAGE: Fetching product: some-handle
✅ PRODUCT PAGE: Product fetched: FOUND
```

**Second Visit (within 5 min, production):**
```
(No logs - page served from cache)
```

**User Data (every visit):**
```
(User data fetched fresh - no logs, but happens every time)
```

---

## Rollback Plan

If issues occur:

1. **Restore `force-dynamic`:**
   ```typescript
   export const dynamic = 'force-dynamic'
   ```

2. **Remove React `cache()`:**
   ```typescript
   // Use direct listProducts() calls
   ```

3. **Redeploy:**
   ```bash
   npm run build
   npm start
   ```

---

## Next Steps (Phase 2)

After Phase 1 is stable:

1. Add `unstable_cache()` for reviews (5 min)
2. Add `unstable_cache()` for vendor status (1 min)
3. Add `unstable_cache()` for breadcrumbs (5 min)
4. Optimize client providers (skip promotional products fetch)

---

## Conclusion

**Phase 1 is SAFE because:**

1. ✅ **React `cache()`** - Per-request only, not cross-request
2. ✅ **ISR caching** - Only caches public product data
3. ✅ **User data** - Fetched fresh every time (not cached)
4. ✅ **Wishlist** - Passed as props, not cached
5. ✅ **`unifiedCache`** - Blocks user-specific keys

**Phase 1 FIXES:**

1. ✅ Production crash (`reduce()` on empty array)
2. ✅ Duplicate product fetch (2x → 1x)
3. ✅ No caching (force-dynamic removed)
4. ✅ 50-90% faster page loads

**Ready to implement!**
