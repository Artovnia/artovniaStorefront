# Product Details Page Investigation

## Overview
Investigating why product pages are `force-dynamic` and analyzing all components involved in product detail rendering to identify caching opportunities and performance issues.

---

## 1. Product Page Entry Point

### File: `src/app/[locale]/(main)/products/[handle]/page.tsx`

**Current Configuration:**
```typescript
export const dynamic = 'force-dynamic'
```

**Metadata Generation:**
```typescript
export async function generateMetadata({ params }) {
  const { handle, locale } = await params
  
  // ❌ FETCH #1: Product fetch for metadata
  const { response } = await listProducts({
    countryCode: locale,
    queryParams: { handle },
  })
  const product = response.products[0]
  
  // Generate metadata...
}
```

**Page Component:**
```typescript
export default async function ProductPage({ params }) {
  const { handle, locale } = await params

  // ❌ FETCH #2: Duplicate product fetch (same as metadata)
  const { response } = await listProducts({
    countryCode: locale,
    queryParams: { handle },
  })
  const product = response.products[0]

  return (
    <main className="container">
      <ProductDetailsPage handle={handle} locale={locale} product={product} />
    </main>
  )
}
```

**Issues:**
1. ❌ `force-dynamic` prevents ALL caching
2. ❌ Product fetched TWICE (metadata + page)
3. ❌ No React `cache()` deduplication

---

## 2. ProductDetailsPage Component

### File: `src/components/sections/ProductDetailsPage/ProductDetailsPage.tsx`

**Component Type:** Server Component (async)

**Props:**
```typescript
{
  handle: string
  locale: string
  product?: any  // Optional: if passed from page.tsx, skip fetch
}
```

**Data Fetching Strategy:**

#### Step 1: Product (if not provided)
```typescript
let prod = productProp

if (!prod) {
  // ❌ FETCH #3: Another product fetch if not passed
  const { response } = await listProducts({
    countryCode: locale,
    queryParams: { handle },
  })
  prod = response.products[0]
}
```

#### Step 2: Parallel Data Fetching (6 requests)
```typescript
const [
  sellerProductsResult,      // Seller's other products
  userResult,                 // User + wishlist
  reviewsResult,              // Product reviews
  vendorStatusResult,         // Vendor availability/holiday/suspension
  breadcrumbsResult,          // Breadcrumb hierarchy
  eligibilityResult          // Review eligibility
] = await Promise.allSettled([...])
```

**Detailed Breakdown:**

1. **Seller Products** (conditional):
   - Fetches up to 8 products from same seller
   - Uses `batchFetchProductsByHandles()`
   - Only if `prod.seller?.products` exists

2. **User Data**:
   - `retrieveCustomer()` - Medusa `/store/customers/me`
   - `getUserWishlists()` - Custom endpoint
   - `isAuthenticated()` - Session check
   - **USER-SPECIFIC** ❌ Cannot cache

3. **Reviews**:
   - `getProductReviews(prod.id)` - Custom endpoint
   - Public data ✅ Can cache

4. **Vendor Status** (conditional):
   - `getVendorCompleteStatus(prod.seller.id)` - Custom endpoint
   - 500ms timeout race
   - Public data ✅ Can cache

5. **Breadcrumbs**:
   - `buildProductBreadcrumbs(prod, locale)` - Utility function
   - Likely fetches category hierarchy
   - Public data ✅ Can cache

6. **Review Eligibility**:
   - `checkProductReviewEligibility(prod.id)` - Custom endpoint
   - **USER-SPECIFIC** ❌ Cannot cache

**Providers Wrapping Content:**
```typescript
<PromotionDataProvider countryCode={locale}>
  <BatchPriceProvider currencyCode="PLN" days={30}>
    <VendorAvailabilityProvider {...vendorStatus}>
      {/* Product Gallery + Details */}
    </VendorAvailabilityProvider>
  </BatchPriceProvider>
</PromotionDataProvider>
```

---

## 3. Sub-Components Analysis

### 3.1 ProductGallery
**File:** `src/components/organisms/ProductGallery/ProductGallery.tsx`

**Props:**
```typescript
{ images: ProductImage[] }
```

**Behavior:**
- Client component (image carousel)
- No data fetching
- ✅ Cacheable (receives data as props)

---

### 3.2 ProductDetails
**File:** `src/components/organisms/ProductDetails/ProductDetails.tsx`

**Props:**
```typescript
{
  product: StoreProduct & { seller: SellerProps }
  locale: string
}
```

**Need to investigate:**
- Does it fetch additional data?
- What sub-components does it render?
- Any user-specific data?

---

### 3.3 ProductReviews
**File:** `src/components/organisms/ProductReviews/ProductReviews.tsx`

**Props:**
```typescript
{
  productId: string
  isAuthenticated: boolean
  customer: any
  prefetchedReviews: Review[]
  isEligible: boolean
  hasPurchased: boolean
}
```

**Behavior:**
- Receives prefetched reviews ✅
- User-specific props (isAuthenticated, customer, isEligible)
- Likely client component for review form

---

### 3.4 HomeProductSection
**File:** `src/components/sections/HomeProductSection/HomeProductSection.tsx`

**Props:**
```typescript
{
  heading: string
  headingSpacing: string
  theme: string
  products: Product[]
  isSellerSection: boolean
}
```

**Behavior:**
- Receives products as props ✅
- No additional fetching
- Renders product carousel

---

## 4. Context Providers Investigation

### 4.1 PromotionDataProvider
**File:** `src/components/context/PromotionDataProvider.tsx`

**Props:**
```typescript
{
  countryCode: string
  limit?: number
  initialData?: Map<string, any>
}
```

**Behavior:**
- Client component
- Fetches promotional products
- Provides promotion data to children
- **Need to check:** Does it fetch on every render?

---

### 4.2 BatchPriceProvider
**File:** `src/components/context/BatchPriceProvider.tsx`

**Props:**
```typescript
{
  currencyCode: string
  days?: number
}
```

**Behavior:**
- Client component
- Batches price calculations
- **Need to check:** Does it make API calls?

---

### 4.3 VendorAvailabilityProvider
**File:** `src/components/organisms/VendorAvailabilityProvider/vendor-availability-provider.tsx`

**Props:**
```typescript
{
  vendorId?: string
  vendorName?: string
  availability?: any
  holidayMode?: any
  suspension?: any
  showModalOnLoad?: boolean
}
```

**Behavior:**
- Client component
- Receives data as props ✅
- Shows modals for vendor status
- No additional fetching

---

## 5. Data Fetching Functions

### 5.1 listProducts()
**File:** `src/lib/data/products.ts`

**Behavior:**
```typescript
export const listProducts = async ({
  pageParam = 1,
  queryParams,
  countryCode,
  regionId,
  category_id,
  collection_id,
}) => {
  // Fetches from Medusa API
  // Uses Next.js fetch cache
  const { products, count } = await sdk.client.fetch(
    "/store/products",
    {
      query: { ... },
      cache: "force-cache",
      next: { revalidate: 300 }
    }
  )
}
```

**Caching:**
- ✅ Uses `cache: "force-cache"`
- ✅ Revalidates every 300 seconds (5 minutes)
- ✅ Should be cached by Next.js

**Issue:**
- `force-dynamic` on page overrides this!

---

### 5.2 retrieveCustomer()
**File:** `src/lib/data/customer.ts`

**Behavior:**
```typescript
export const retrieveCustomer = async () => {
  const headers = await getAuthHeaders()
  
  const customer = await sdk.client.fetch(
    "/store/customers/me",
    {
      headers,
      cache: "no-store",  // ❌ Never cached
      next: { tags: ["customer"] }
    }
  )
}
```

**Caching:**
- ❌ `cache: "no-store"` - Never cached
- **USER-SPECIFIC** - Correct behavior

---

### 5.3 getUserWishlists()
**File:** `src/lib/data/wishlist.ts`

**Behavior:**
- Fetches user's wishlists
- **USER-SPECIFIC** - Cannot cache
- Likely uses `cache: "no-store"`

---

### 5.4 getProductReviews()
**File:** `src/lib/data/reviews.ts`

**Behavior:**
- Fetches reviews for a product
- **PUBLIC DATA** - Can cache
- **Need to check:** Current caching strategy

---

### 5.5 buildProductBreadcrumbs()
**File:** `src/lib/utils/breadcrumbs.ts`

**Behavior:**
- Builds breadcrumb trail
- Likely fetches category hierarchy
- **PUBLIC DATA** - Can cache
- **Need to check:** Does it fetch categories?

---

## 6. Why force-dynamic?

**Comment in code:**
```typescript
// Force dynamic rendering for this page to support no-store fetches
export const dynamic = 'force-dynamic'
```

**Analysis:**

The page was set to `force-dynamic` because:
1. ❌ User-specific data (customer, wishlist, review eligibility)
2. ❌ Assumption: "If any fetch is `no-store`, entire page must be dynamic"

**Problem:**
- This is INCORRECT in Next.js App Router!
- Server Components can mix cached and dynamic data
- Only user-specific parts need to be dynamic

**Correct Approach:**
1. ✅ Keep page as ISR (remove `force-dynamic`)
2. ✅ Move user-specific data to client components
3. ✅ Use Suspense boundaries for dynamic parts

---

## 7. Render Flow Analysis

```
User visits /products/some-handle
  ↓
Page Component (force-dynamic ❌)
  ├─ generateMetadata()
  │   └─ listProducts() [FETCH #1]
  ├─ Page render
  │   └─ listProducts() [FETCH #2 - DUPLICATE!]
  └─ <ProductDetailsPage product={product}>
      ├─ Product already passed ✅
      ├─ Promise.allSettled (6 parallel fetches):
      │   ├─ batchFetchProductsByHandles() [seller products]
      │   ├─ retrieveCustomer() [USER-SPECIFIC]
      │   ├─ getUserWishlists() [USER-SPECIFIC]
      │   ├─ isAuthenticated() [USER-SPECIFIC]
      │   ├─ getProductReviews() [PUBLIC - cacheable]
      │   ├─ getVendorCompleteStatus() [PUBLIC - cacheable]
      │   ├─ buildProductBreadcrumbs() [PUBLIC - cacheable]
      │   └─ checkProductReviewEligibility() [USER-SPECIFIC]
      └─ Render with providers
          ├─ <PromotionDataProvider> [CLIENT - may fetch]
          ├─ <BatchPriceProvider> [CLIENT - may fetch]
          └─ <VendorAvailabilityProvider> [CLIENT - no fetch]

TOTAL FETCHES: 8-10+
USER-SPECIFIC: 4 (customer, wishlist, auth, eligibility)
PUBLIC/CACHEABLE: 4-6 (product x2, reviews, vendor, breadcrumbs, seller products)
```

---

## 8. Critical Issues Summary

### Issue #1: force-dynamic Prevents ALL Caching
**Impact:** Every product page request hits all APIs
**Solution:** Remove `force-dynamic`, use ISR

### Issue #2: Duplicate Product Fetch
**Impact:** Product fetched 2x (metadata + page)
**Solution:** Use React `cache()` to deduplicate

### Issue #3: Mixed User-Specific and Public Data
**Impact:** Cannot cache page because of user data
**Solution:** Separate concerns - move user data to client

### Issue #4: Context Providers May Fetch
**Impact:** Unknown - need to investigate
**Solution:** Verify provider behavior

### Issue #5: No Suspense Boundaries
**Impact:** Slow fetches block entire page
**Solution:** Wrap dynamic parts in Suspense

---

## 9. Recommended Architecture

### New Structure:

```typescript
// page.tsx - ISR ENABLED
export const revalidate = 300 // 5 minutes

// Deduplicate product fetch
const getProduct = cache(async (handle: string, locale: string) => {
  const { response } = await listProducts({
    countryCode: locale,
    queryParams: { handle },
  })
  return response.products[0]
})

export async function generateMetadata({ params }) {
  const product = await getProduct(handle, locale)
  // Generate metadata
}

export default async function ProductPage({ params }) {
  const product = await getProduct(handle, locale)
  
  return (
    <main>
      {/* Static product data - cached */}
      <ProductDetailsPageStatic product={product} locale={locale} />
      
      {/* User-specific data - client component */}
      <Suspense fallback={<UserDataSkeleton />}>
        <ProductUserData productId={product.id} />
      </Suspense>
    </main>
  )
}
```

### ProductDetailsPageStatic (Server Component):
```typescript
// Fetches only PUBLIC, cacheable data
const [reviews, vendorStatus, breadcrumbs, sellerProducts] = await Promise.all([
  getProductReviews(product.id),
  getVendorCompleteStatus(product.seller.id),
  buildProductBreadcrumbs(product, locale),
  batchFetchProductsByHandles(...)
])

return (
  <>
    <ProductGallery images={product.images} />
    <ProductDetailsStatic product={product} />
    <SellerProducts products={sellerProducts} />
    {children} {/* User-specific parts */}
  </>
)
```

### ProductUserData (Client Component):
```typescript
'use client'

// Fetches user-specific data on client
const { user, wishlist, isEligible } = useUserProductData(productId)

return (
  <>
    <WishlistButton productId={productId} inWishlist={...} />
    <ReviewForm isEligible={isEligible} />
  </>
)
```

---

## 10. Next Steps

### Investigation Needed:

1. **Read ProductDetails component** - Check for additional fetches
2. **Read PromotionDataProvider** - Verify fetching behavior
3. **Read BatchPriceProvider** - Verify fetching behavior
4. **Read buildProductBreadcrumbs** - Check if it fetches categories
5. **Read getProductReviews** - Check caching strategy

### Implementation Plan:

1. ✅ **Fix Header** (DONE) - Pass categories from layout
2. 🔴 **Fix Product Page** - Remove force-dynamic
3. 🔴 **Deduplicate Product Fetch** - Use React cache()
4. 🔴 **Separate User Data** - Move to client components
5. 🔴 **Add Suspense Boundaries** - Isolate dynamic parts
6. 🔴 **Verify Provider Behavior** - Ensure no unnecessary fetches
7. 🔴 **Re-enable Category Caching** - Fix infinite request issue

---

## 11. Expected Performance Improvement

### Current (force-dynamic):
- **Every request:** 8-10 API calls
- **No caching:** All data fetched fresh
- **Load time:** 3-5 seconds

### After Fixes (ISR):
- **First request:** 6-8 API calls (eliminated duplicates)
- **Cached requests:** 2-4 API calls (only user-specific)
- **Load time:** 
  - First: 2-3 seconds
  - Cached: 500ms-1s

### Improvement:
- **60-80% faster** on cached loads
- **30-40% faster** on first load
- **50% fewer API calls**
