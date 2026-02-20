# Product Page Code Review
**Date:** 2026-02-20  
**Scope:** Full product detail page — layout, data fetching, caching, component tree, field usage

---

## 1. Component Tree

```
layout.tsx  [SERVER, revalidate=3600]
│  Fetches: listCategoriesWithProducts(), listRegions()
│  Providers: GuestWishlistProvider, CartProvider
│
└── page.tsx  [SERVER, revalidate=300]
    │  Fetches: getRegion(locale), getCachedProduct(handle, regionId)
    │  React cache() deduplicates metadata + component fetch
    │
    └── ProductDetailsPage  [SERVER]
        │  Promise.allSettled (parallel):
        │    1. listProductsLean({ seller_id, limit:8 })
        │    2. getVendorCompleteStatus(seller.id)
        │    3. buildProductBreadcrumbsLocal()  ← NO network
        │    4. listProductsWithPromotions({ limit:50 })
        │    5. getProductShippingOptions(product.id, region.id)
        │    6. getVariantAttributes(product.id, variantId)
        │    7. listSuggestedProducts({ product, regionId, limit:8 })
        │    8. getBatchLowestPrices(variantIds, 'PLN', region.id, 30)
        │
        ├── PromotionDataProvider  [CLIENT, serverDataProvided=true → no client fetch]
        │   └── BatchPriceProvider  [CLIENT, initialPriceData → skips fetched variants]
        │       └── ProductUserDataProvider  [CLIENT]
        │           │  Fetches after hydration:
        │           │    1. /api/customer (always)
        │           │    2. /api/wishlists (auth only)
        │           │    3. /api/review-eligibility/{id} (auth only)
        │           │
        │           └── VendorAvailabilityProvider  [CLIENT, pure context]
        │               ├── ProductGallery  [CLIENT]
        │               └── ProductDetails  [SERVER]
        │                   │  Promise.allSettled:
        │                   │    1. getProductDeliveryTimeframe(product.id)
        │                   │    2. getProductMeasurements(product.id, variantId)
        │                   │
        │                   ├── ProductDetailsClient  [CLIENT]
        │                   │   ├── ProductDetailsHeader  [CLIENT]
        │                   │   │   Contexts: useProductUserData, useVendorAvailability,
        │                   │   │             useVariantSelection, usePromotionData, useBatchPrice
        │                   │   ├── ProductAdditionalAttributes  [CLIENT]
        │                   │   ├── ProductPageDetails  [CLIENT]
        │                   │   ├── ProductDetailsSellerReviews  [CLIENT]
        │                   │   └── ProductDetailsMeasurements  [CLIENT]
        │                   │
        │                   ├── ProductDetailsShippingWrapper  [CLIENT]
        │                   │   └── ProductDetailsShipping  [CLIENT]
        │                   │       Uses initialShippingOptions (server-prefetched)
        │                   │       ⚠️ Has dead client-side fallback fetch
        │                   │
        │                   └── ProductDetailsFooter  [SERVER]
        │
        └── [Suspense] ProductPageUserContent  [CLIENT]
            ├── HomeProductSection → ProductCard[] (seller products)
            ├── SuggestedProductsGallery → ProductCard[] (suggested)
            └── ProductReviews  [CLIENT]
                ⚠️ ALWAYS fetches /store/products/{id}/reviews on mount
                prefetchedReviews is always [] — never server-prefetched
```

---

## 2. Server Fetches Per Page Load (cold cache)

| # | Function | Endpoint | Cache |
|---|----------|----------|-------|
| 1 | `listProductsForDetail` | `GET /store/products?handle=` | revalidate:300 |
| 2 | `getRegion` | `GET /store/regions` | revalidate:3600 |
| 3 | `listProductsLean` (seller) | `GET /store/seller/{id}/products` | revalidate:300 |
| 4 | `getVendorCompleteStatus` | `GET /store/vendors/{id}/status` | revalidate:3600 |
| 5 | `listProductsWithPromotions` | `GET /store/products/promotions` | revalidate:300 |
| 6 | `getProductShippingOptions` | `GET /store/product-shipping-options` | revalidate:300 |
| 7 | `getVariantAttributes` | `GET /store/products/{id}/variants/{id}/attributes` | unknown |
| 8 | `listSuggestedProducts` | `GET /store/products?category_id=` × 1-3 | revalidate:300 |
| 9 | `getBatchLowestPrices` | `GET /store/variants/lowest-prices-batch` | revalidate:60 |
| 10 | `getProductDeliveryTimeframe` | `GET /store/products/{id}/delivery-timeframe` | revalidate:300 |
| 11 | `getProductMeasurements` | `GET /store/products/{id}/measurements` | unknown |

**Total: 11 server fetches** (most parallel, some sequential)

## 3. Client Fetches Per Page Load (after hydration)

| # | Component | Endpoint | Condition |
|---|-----------|----------|-----------|
| 1 | `ProductUserDataProvider` | `GET /api/customer` | always |
| 2 | `ProductUserDataProvider` | `GET /api/wishlists` | auth only |
| 3 | `ProductUserDataProvider` | `GET /api/review-eligibility/{id}` | auth only |
| 4 | `ProductReviews` | `GET /store/products/{id}/reviews` | **always, every mount** |
| 5 | `BatchPriceProvider` | `GET /store/variants/lowest-prices-batch` | only new variants |

---

## 4. Cache Miss Analysis (1K misses in 30 min)

**Why so many misses:** Vercel Edge Network has many nodes. Each node has its own independent cache. `revalidate:300` means each node revalidates independently. With 300+ unique product URLs × multiple edge nodes, misses are expected and normal. `STALE:115` entries are stale-while-revalidate hits (served instantly, good).

**The real problem is not miss rate — it's cold-cache latency (4-11s per miss).**

---

## 5. Fields Analysis

### `listProductsForDetail` — fields vs actual usage

| Field | Used By | Status |
|-------|---------|--------|
| `id,title,handle,description,thumbnail,created_at,status` | Multiple components | ✅ Used |
| `images.id` | Nobody | ⚠️ WASTE |
| `images.url` | ProductGallery, SEO | ✅ Used |
| `metadata` | ProductDetailsFooter (GPSR), SEO | ✅ Used |
| `options.*` | ProductVariants | ✅ Used |
| `variants.id` | Header, getBatchLowestPrices | ✅ Used |
| `variants.title` | ProductVariants | ✅ Used |
| `variants.calculated_price.calculated_amount` | Price display | ✅ Used |
| `variants.calculated_price.currency_code` | Price formatting | ✅ Used |
| `variants.calculated_price.original_amount` | Discount display | ❌ **MISSING** |
| `variants.calculated_price.region_id` | getPromotionalPrice() | ❌ **MISSING** |
| `variants.inventory_quantity,manage_inventory,allow_backorder` | Stock logic | ✅ Used |
| `variants.metadata` | Stock fallback | ✅ Used |
| `variants.options.*` | ProductVariants | ✅ Used |
| `seller.id,handle,name` | Multiple | ✅ Used |
| `seller.store_name` | Not used on product page | ⚠️ WASTE |
| `seller.photo,logo_url` | SEO metadata only | ✅ Used (SEO) |
| `categories.*` (3 levels deep) | Breadcrumbs, suggested products | ✅ Used |
| `collection.id,title,handle` | Nobody on product page | ⚠️ WASTE |
| `shipping_profile.name` | SEO JSON-LD weight estimation | ✅ Used |

### `listProductsLean` — fields vs ProductCard usage

ProductCard only needs: `id, title, handle, thumbnail, images.url, seller.name, variants.id, variants.calculated_price`

Wasted fields: `description, created_at, status, variants.title, seller.id, seller.handle, seller.store_name, categories.*, collection.*, metadata.*, shipping_profile.name`

---

## 6. Issues Found

### 🔴 CRITICAL — `original_amount` and `region_id` missing from `listProductsForDetail` fields

**File:** `src/lib/data/products.ts:244-255`

`variants.calculated_price.original_amount` is used by `getPricesForVariant()` → `original_price_number` → shown as strikethrough price in `ProductDetailsHeader`. It's NOT in the fields string → always `undefined` → price-list discounts never show on product detail page.

`variants.calculated_price.region_id` is used by `getPromotionalPrice()` in `ProductDetailsHeader` line 217.

**Fix:** Add both to the fields string in `listProductsForDetail`.

---

### 🔴 CRITICAL — `ProductReviews` always fetches on every mount, no server prefetch

**File:** `src/components/organisms/ProductReviews/ProductReviews.tsx:416-450`

`useEffect` unconditionally fires `fetch(/store/products/{id}/reviews)` on every mount. `prefetchedReviews` is always `[]` (never server-prefetched in `ProductDetailsPage`). Every product page visit = 1 extra uncached backend request.

**Fix option A:** Prefetch reviews server-side in `ProductDetailsPage` and pass via `ProductPageUserContent`.  
**Fix option B:** Lazy-load reviews only when the reviews section scrolls into view (IntersectionObserver).  
**Fix option C:** Only fetch when `prefetchedReviews` is empty AND the accordion is opened.

---

### 🟠 HIGH — Dead client-side fallback fetch in `ProductDetailsShipping`

**File:** `src/components/cells/ProductDetailsShipping/ProductDetailsShipping.tsx:29-59`

The `useEffect` has a fallback that calls `getProductShippingOptions()` (server action) from client-side if `initialShippingOptions` is falsy. Since `ProductDetailsPage` always passes an array (`.catch(() => [])`), this branch is dead code. But if it ever fires, server actions called from client bypass Next.js Data Cache entirely.

**Fix:** Remove the import of `getProductShippingOptions` and the fallback fetch branch. The check `if (initialShippingOptions)` is also wrong — it should be `if (initialShippingOptions !== undefined)` since `[]` is truthy but an empty array is a valid "no options" result.

---

### 🟠 HIGH — `listProducts` uses `sdk.client.fetch` with auth headers → never cached

**File:** `src/lib/data/products.ts:361-416`

`listProducts()` calls `sdk.client.fetch` with `getAuthHeaders()`. The Medusa SDK injects JWT globally. Next.js Data Cache requires NO `Authorization` header. This function is never cached by Next.js.

`listProductsLean` and `listProductsForDetail` correctly use `publicFetch` (no auth) and ARE cached. `listProducts` is used by `listProductsWithSort` for non-seller queries (category/collection pages).

**Fix:** Use `publicFetch` for public product data in `listProducts`.

---

### 🟠 HIGH — 50 promotional products fetched on every product page

**File:** `src/components/sections/ProductDetailsPage/ProductDetailsPage.tsx:83-86`

`listProductsWithPromotions({ limit: 50 })` runs on every product page to populate `PromotionDataProvider`. These 50 products are used only to check if seller products or suggested products have active promotions (discount badges). Fetching 50 is excessive when the page shows max 8+8=16 products.

**Fix:** Pass the specific product IDs from `sellerProducts` and `suggestedProducts` to fetch only relevant promotional data. Or reduce limit to 20.

---

### 🟡 MEDIUM — `collection.*` fields fetched but never used on product detail page

**File:** `src/lib/data/products.ts:252-254`

`collection.id`, `collection.title`, `collection.handle` are in `listProductsForDetail` fields but not used anywhere in the product detail component tree. Leftover from when `buildProductBreadcrumbs` (async) was used instead of `buildProductBreadcrumbsLocal`.

**Fix:** Remove from fields string.

---

### 🟡 MEDIUM — `images.id` fetched but never used

**File:** `src/lib/data/products.ts:241`

Only `images.url` is accessed. `images.id` is never read.

**Fix:** Remove from fields string.

---

### 🟡 MEDIUM — `ProductDetailsHeader` has 3 `useEffect` hooks for wishlist sync — fragile

**File:** `src/components/cells/ProductDetailsHeader/ProductDetailsHeader.tsx:99-178`

Maintains local `optimisticWishlist` + `pendingUpdate` state, syncs with context via `useEffect`, AND listens to `window.addEventListener('wishlist:change')`. This is 3 separate mechanisms for one piece of state. The `pendingUpdate` flag logic can desync if events fire out of order.

**Fix:** Move optimistic wishlist management into `ProductUserDataProvider` context with an `updateWishlistOptimistically(productId, action)` method.

---

### 🟡 MEDIUM — `next.config.ts` `qualities` array has 9 values — unusual

**File:** `next.config.ts:510`

```js
qualities: [10, 50, 65, 70, 75, 80, 85, 90, 100],
```

Next.js Image optimization generates separate cached versions for each quality value. 9 quality levels × many image sizes = large CDN cache footprint. Standard is 3-4 values.

**Fix:** Reduce to `[65, 75, 85]` or `[70, 80, 90]`.

---

### 🟢 LOW — `vercel.json` and `next.config.ts` both set `Cache-Control` for `/_next/image` — redundant

Both set identical headers. No conflict, just redundant. Can remove from `vercel.json` since `next.config.ts` takes precedence.

---

### 🟢 LOW — `buildProductBreadcrumbs` (async, network) exported but unused on product page

**File:** `src/lib/utils/breadcrumbs.ts:19-59`

The async version makes a network call to `getCategoryHierarchy`. Product page uses `buildProductBreadcrumbsLocal` (no network). The async version may be used elsewhere — no action needed unless confirmed dead.

---

## 7. Priority Action Items

| Priority | Issue | File | Effort |
|----------|-------|------|--------|
| 🔴 | Add `original_amount` + `region_id` to `listProductsForDetail` fields | `products.ts` | 5 min |
| 🔴 | Fix reviews: lazy-load or server-prefetch | `ProductDetailsPage.tsx` + `ProductReviews.tsx` | 1h |
| 🟠 | Remove dead fallback fetch from `ProductDetailsShipping` | `ProductDetailsShipping.tsx` | 10 min |
| 🟠 | Reduce promotional products fetch (50→IDs of visible products) | `ProductDetailsPage.tsx` | 20 min |
| 🟡 | Remove unused fields from `listProductsForDetail` | `products.ts` | 5 min |
| 🟡 | Reduce `listProductsLean` fields to ProductCard minimum | `products.ts` | 10 min |
| 🟡 | Fix `listProducts` to use `publicFetch` | `products.ts` | 15 min |
| 🟡 | Simplify wishlist state in `ProductDetailsHeader` | `ProductDetailsHeader.tsx` | 30 min |
