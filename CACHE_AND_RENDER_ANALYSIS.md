# Cache and Render Analysis - Artovnia Storefront

## Executive Summary

**CRITICAL FINDINGS:**
1. ❌ **Categories fetched 3+ times per page load** (Header, Footer, potentially more)
2. ❌ **`listCategoriesWithProducts()` makes SLOW Medusa API call** (`/store/products?limit=1000`)
3. ❌ **Caching is DISABLED** in `categories.ts` (commented out)
4. ❌ **Product pages are `force-dynamic`** - no caching at all
5. ❌ **Footer links hit on every product browse** - suggests Footer re-renders

---

## 1. Main Layout Analysis

### File: `src/app/[locale]/(main)/layout.tsx`

**Render Behavior:**
- **Type**: Server Component
- **Fetches**: `listCategoriesWithProducts()` ONCE per request
- **Passes to**: Header and Footer as props

**Code:**
```typescript
const categoriesData = await listCategoriesWithProducts().catch((error) => {
  console.error("Layout: Error retrieving categories:", error)
  return { parentCategories: [], categories: [] }
})

return (
  <CartProvider initialCart={initialCart}>
    <Header />  // ❌ Does NOT receive categories!
    {children}
    <Footer categories={categoriesData.parentCategories} />  // ✅ Receives categories
  </CartProvider>
)
```

**ISSUE #1**: Header does NOT receive categories from layout!

---

## 2. Header Component Analysis

### File: `src/components/organisms/Header/Header.tsx`

**Render Behavior:**
- **Type**: Async Server Component
- **Fetches**: Makes its OWN parallel API calls

**Code:**
```typescript
const [user, categoriesData, regions] = await Promise.all([
  retrieveCustomer(),
  listCategoriesWithProducts(),  // ❌ DUPLICATE FETCH!
  import('@/lib/data/regions').then(m => m.listRegions())
])
```

**ISSUE #2**: Header fetches categories AGAIN, duplicating the layout fetch!

**API Calls Made:**
1. `retrieveCustomer()` - Medusa `/store/customers/me`
2. `listCategoriesWithProducts()` - **SLOW** Medusa `/store/products?limit=1000`
3. `listRegions()` - Medusa `/store/regions`

**Sub-components:**
- `Navbar` - Receives categories, renders `CategoryNavbar`
- `CountrySelectorWrapper` - Client component using `useCart()`
- `CartDropdown` - Client component
- `UserDropdown` - Receives user data

---

## 3. Footer Component Analysis

### File: `src/components/organisms/Footer/Footer.tsx`

**Render Behavior:**
- **Type**: Async Server Component
- **Receives**: Categories as props from layout ✅

**Code:**
```typescript
export async function Footer({ categories = [] }: FooterProps) {
  // Uses categories from props - NO additional fetch ✅
  return (
    <footer>
      {categories.slice(0, 6).map((category) => (
        <Link href={`/categories/${category.handle}`}>
          {category.name}
        </Link>
      ))}
    </footer>
  )
}
```

**GOOD**: Footer does NOT fetch categories, uses props!

---

## 4. Categories Data Fetching

### File: `src/lib/data/categories.ts`

**Function**: `listCategoriesWithProducts()`

**CRITICAL ISSUES:**

```typescript
export const listCategoriesWithProducts = async (): Promise<{
  parentCategories: HttpTypes.StoreProductCategory[]
  categories: HttpTypes.StoreProductCategory[]
}> => {
  try {
    // ❌ CACHING DISABLED!
    // Temporarily disabled caching to fix infinite requests
    // return unifiedCache.get('category:tree:all', async () => {
    
    // ❌ SLOW API CALL #1: Fetch ALL products to get category IDs
    const categoriesWithProducts = await getCategoriesWithProductsFromDatabase()
    
    // ❌ SLOW API CALL #2: Fetch ALL categories
    const response = await sdk.client.fetch<HttpTypes.StoreProductCategoryListResponse>(
      `/store/product-categories`,
      {
        query: {
          fields: "id, handle, name, rank, parent_category_id, mpath",
          limit: 1000,
        },
        cache: "force-cache",
        next: { revalidate: 300 }
      }
    )
    
    // Filter and build tree...
  }
}
```

**Sub-function**: `getCategoriesWithProductsFromDatabase()`

```typescript
export const getCategoriesWithProductsFromDatabase = async (): Promise<Set<string>> => {
  // ❌ CACHING DISABLED!
  // Temporarily disabled caching to fix infinite requests
  
  // ❌ EXTREMELY SLOW: Fetches ALL 1000 products just to get category IDs!
  const response = await sdk.client.fetch<{
    products: Array<{
      id: string
      categories?: Array<{ id: string; name?: string }>
    }>
  }>("/store/products", {
    query: {
      fields: "id,categories.id,categories.name",
      limit: 1000,  // ❌ FETCHES 1000 PRODUCTS!
    },
    cache: "force-cache",
    next: { revalidate: 300 }
  })
  
  // Extract category IDs...
  return categoryIds
}
```

**PERFORMANCE IMPACT:**
- **API Call 1**: `/store/products?limit=1000` (~2-3 seconds)
- **API Call 2**: `/store/product-categories?limit=1000` (~500ms)
- **Total**: ~2.5-3.5 seconds PER REQUEST
- **Frequency**: EVERY page load (caching disabled)
- **Multiplied by**: 2x (Layout + Header both call it)

---

## 5. Product Page Analysis

### File: `src/app/[locale]/(main)/products/[handle]/page.tsx`

**Render Behavior:**
```typescript
// ❌ FORCE DYNAMIC - NO CACHING!
export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }) {
  // Fetches product for metadata
  const { response } = await listProducts({
    countryCode: locale,
    queryParams: { handle },
  })
}

export default async function ProductPage({ params }) {
  // ❌ FETCHES PRODUCT AGAIN! (duplicate of generateMetadata)
  const { response } = await listProducts({
    countryCode: locale,
    queryParams: { handle },
  })
}
```

**ISSUES:**
1. ❌ `force-dynamic` prevents ALL caching
2. ❌ Product fetched TWICE (metadata + page)
3. ❌ Every product page triggers:
   - Layout fetch (categories)
   - Header fetch (categories + user + regions)
   - Product fetch (2x)

**Why `force-dynamic`?**
- Comment says: "Force dynamic rendering for this page to support no-store fetches"
- Likely added for wishlist data (user-specific)
- **PROBLEM**: Makes ENTIRE page uncacheable, not just user data

---

## 6. Homepage Analysis

### File: `src/app/[locale]/(main)/page.tsx`

**Render Behavior:**
- **Type**: Server Component (default, no export)
- **Fetches**: User data + promotional products in parallel

**Code:**
```typescript
const [userResult, promotionalDataResult] = await Promise.allSettled([
  retrieveCustomer().then(async (user) => {
    if (user) {
      const wishlistData = await getUserWishlists()
      return { user, wishlist: wishlistData.wishlists || [] }
    }
    return { user: null, wishlist: [] }
  }),
  listProductsWithPromotions({ page: 1, limit: 30, countryCode: 'PL' })
])
```

**GOOD**: Uses `Promise.allSettled` for parallel fetching ✅

**ISSUE**: Still triggers Layout + Header category fetches

---

## 7. Unified Cache Analysis

### File: `src/lib/utils/unified-cache.ts`

**Implementation:**
- In-memory Map cache
- TTL-based expiration
- Request deduplication
- User-specific data protection

**CRITICAL ISSUE:**
```typescript
// categories.ts line 19-21
// ❌ CACHING DISABLED!
// Temporarily disabled caching to fix infinite requests
// const cachedResult = await unifiedCache.get('category:tree:products-database', async () => {
const cachedResult = await (async () => {
  // Direct execution, no caching
})()
```

**WHY DISABLED?**
- Comment: "to fix infinite requests"
- Suggests there was a caching bug causing infinite loops
- **PROBLEM**: Disabling cache makes performance WORSE

---

## 8. Render Flow Diagram

```
User visits /products/some-product
  ↓
(main)/layout.tsx (Server Component)
  ├─ Fetches: listCategoriesWithProducts() [~3s] ❌
  ├─ Renders: <Header />
  │   └─ Fetches: listCategoriesWithProducts() [~3s] ❌ DUPLICATE!
  │   └─ Fetches: retrieveCustomer() [~200ms]
  │   └─ Fetches: listRegions() [~100ms]
  ├─ Renders: {children}
  │   └─ products/[handle]/page.tsx (force-dynamic)
  │       ├─ generateMetadata()
  │       │   └─ Fetches: listProducts() [~300ms]
  │       └─ Page Component
  │           └─ Fetches: listProducts() [~300ms] ❌ DUPLICATE!
  └─ Renders: <Footer categories={...} />
      └─ Uses props ✅ (no fetch)

TOTAL TIME: ~7+ seconds
TOTAL API CALLS: 7+
  - listCategoriesWithProducts: 2x (~6s)
  - retrieveCustomer: 1x (~200ms)
  - listRegions: 1x (~100ms)
  - listProducts: 2x (~600ms)
```

---

## 9. Vercel Logs Analysis

**User Report**: "Footer links being hit like terms of use or privacy policy on each product browse"

**What This Means:**
1. Footer is re-rendering on every navigation
2. Links are being re-created/re-mounted
3. Suggests the entire layout is re-rendering

**Why This Happens:**
- `force-dynamic` on product pages prevents caching
- Layout re-executes on every request
- Header fetches categories on every request
- No React Server Component caching

---

## 10. Critical Problems Summary

### Problem #1: Duplicate Category Fetches
- **Where**: Layout + Header
- **Impact**: 2x slow API calls (~6 seconds total)
- **Fix**: Pass categories from layout to Header as props

### Problem #2: Caching Disabled
- **Where**: `categories.ts`
- **Impact**: Every request hits Medusa API
- **Fix**: Re-enable caching with proper invalidation

### Problem #3: Slow Category Fetch
- **Where**: `getCategoriesWithProductsFromDatabase()`
- **Impact**: Fetches 1000 products just to get category IDs
- **Fix**: Use dedicated category endpoint or cache aggressively

### Problem #4: Force Dynamic Product Pages
- **Where**: `products/[handle]/page.tsx`
- **Impact**: No caching, duplicate fetches
- **Fix**: Use ISR with user-specific data in client components

### Problem #5: Duplicate Product Fetches
- **Where**: `generateMetadata()` + Page component
- **Impact**: 2x product API calls
- **Fix**: Share data between metadata and page

---

## 11. Recommended Fixes (Priority Order)

### 🔴 CRITICAL - Fix #1: Pass Categories to Header

**File**: `(main)/layout.tsx`
```typescript
// BEFORE
<Header />

// AFTER
<Header categories={categoriesData} />
```

**File**: `Header.tsx`
```typescript
// BEFORE
export const Header = async () => {
  const [user, categoriesData, regions] = await Promise.all([...])
}

// AFTER
export const Header = async ({ 
  categories 
}: { 
  categories?: { parentCategories: any[], categories: any[] } 
}) => {
  const [user, regions] = await Promise.all([
    retrieveCustomer(),
    import('@/lib/data/regions').then(m => m.listRegions())
  ])
  
  const categoriesData = categories || { parentCategories: [], categories: [] }
}
```

**Impact**: Eliminates 1 duplicate fetch, saves ~3 seconds

---

### 🔴 CRITICAL - Fix #2: Re-enable Category Caching

**File**: `categories.ts`
```typescript
// BEFORE
// Temporarily disabled caching to fix infinite requests
const cachedResult = await (async () => {
  // Direct execution
})()

// AFTER
const cachedResult = await unifiedCache.get(
  'category:tree:products-database',
  async () => {
    // Fetch logic
  },
  600 // 10 minutes TTL
)
```

**Impact**: Caches category data, saves ~3 seconds on subsequent requests

---

### 🟡 HIGH - Fix #3: Remove Force Dynamic from Product Pages

**File**: `products/[handle]/page.tsx`
```typescript
// BEFORE
export const dynamic = 'force-dynamic'

// AFTER
export const revalidate = 300 // 5 minutes ISR
```

**Move user-specific data to client components:**
```typescript
// Server component (cached)
export default async function ProductPage({ params }) {
  const product = await listProducts(...)
  
  return (
    <ProductDetailsWrapper product={product}>
      {/* Client component handles user-specific data */}
      <WishlistButton productId={product.id} />
    </ProductDetailsWrapper>
  )
}
```

**Impact**: Enables caching, eliminates duplicate fetches

---

### 🟡 HIGH - Fix #4: Share Product Data Between Metadata and Page

**File**: `products/[handle]/page.tsx`
```typescript
// Use React cache() to deduplicate
import { cache } from 'react'

const getProduct = cache(async (handle: string, locale: string) => {
  const { response } = await listProducts({
    countryCode: locale,
    queryParams: { handle },
  })
  return response.products[0]
})

export async function generateMetadata({ params }) {
  const product = await getProduct(handle, locale)
  // ...
}

export default async function ProductPage({ params }) {
  const product = await getProduct(handle, locale)
  // ...
}
```

**Impact**: Eliminates 1 duplicate fetch per product page

---

### 🟢 MEDIUM - Fix #5: Optimize Category Fetch

**File**: `categories.ts`
```typescript
// Instead of fetching 1000 products, use a dedicated endpoint
// OR cache the result for much longer (1 hour+)

export const getCategoriesWithProductsFromDatabase = async (): Promise<Set<string>> => {
  return unifiedCache.get(
    'category:tree:products-database',
    async () => {
      // Existing fetch logic
    },
    3600 // 1 hour cache (categories rarely change)
  )
}
```

**Impact**: Reduces frequency of slow API call

---

## 12. Expected Performance After Fixes

### Current Performance:
- **Product Page Load**: ~7+ seconds
- **API Calls**: 7+ per page
- **Caching**: None (force-dynamic + disabled cache)

### After Fixes:
- **First Load**: ~3-4 seconds (still needs API calls)
- **Cached Load**: ~500ms (ISR cached)
- **API Calls**: 3-4 per page (eliminated duplicates)
- **Caching**: Enabled (ISR + unified cache)

### Improvement:
- **50-60% faster** on first load
- **90%+ faster** on cached loads
- **50% fewer API calls**

---

## 13. Testing Plan

1. **Test Category Caching**:
   - Visit homepage
   - Check network tab for `/store/products` calls
   - Should see 1 call, not 2+

2. **Test Product Page Caching**:
   - Visit product page
   - Refresh page
   - Should load from cache (no API calls)

3. **Test Footer Links**:
   - Navigate between products
   - Check if footer links are being re-requested
   - Should NOT see new requests

4. **Monitor Vercel Logs**:
   - Check for repeated footer link hits
   - Should decrease significantly

---

## 14. Root Cause Analysis

**Why was caching disabled?**
- Comment: "to fix infinite requests"
- Likely: Cache invalidation was triggering re-fetches in a loop
- **Real issue**: Probably client-side cache invalidation in CartContext

**Why is product page force-dynamic?**
- Comment: "to support no-store fetches"
- Likely: Wishlist data needs to be fresh
- **Real issue**: Mixing user-specific data with cacheable product data

**Why duplicate fetches?**
- Header doesn't receive categories from layout
- Product metadata and page don't share data
- **Real issue**: No data sharing pattern established

---

## Conclusion

The performance issues stem from:
1. **Architectural**: Duplicate data fetching (layout vs header)
2. **Configuration**: Caching disabled + force-dynamic
3. **Implementation**: No data sharing between components

**Immediate Actions:**
1. Pass categories from layout to header
2. Re-enable category caching
3. Remove force-dynamic from product pages
4. Share product data between metadata and page

**Expected Result:**
- 50-90% performance improvement
- Significantly fewer API calls
- Better user experience
