# Product Page Performance Documentation

## Scope
This document describes the current product-page performance architecture, what was changed, which functions are used, and exact field payloads.

It covers:
- `src/app/[locale]/(main)/products/[handle]/page.tsx`
- `src/components/sections/ProductDetailsPage/ProductDetailsPage.tsx`
- `src/lib/data/products.ts`
- Supporting layout/data flow that affects ISR and render performance.

---

## 1) Current Product Page Data Flow (Top-Down)

### 1.1 Route entry
File: `src/app/[locale]/(main)/products/[handle]/page.tsx`

- Uses App Router ISR:
  - `export const revalidate = 300`
- Uses request-level deduplication:
  - `cache(async (handle, regionId) => listProductsForDetail(...))`
- Server flow:
  1. Resolve locale/region via `getRegion(locale)`
  2. Fetch product detail via `listProductsForDetail({ handle, regionId })`
  3. Render `ProductDetailsPage` with already-fetched `product` and `region`

### 1.2 Product details server component
File: `src/components/sections/ProductDetailsPage/ProductDetailsPage.tsx`

`ProductDetailsPage` performs parallel server-side fetches with `Promise.allSettled`:

1. Seller products (cards):
   - `listProductsLean({ seller_id, regionId, queryParams: { limit: 8 } })`
2. Vendor status:
   - `getVendorCompleteStatus(...)`
3. Breadcrumbs:
   - local build (`buildProductBreadcrumbsLocal`)
4. Product promotions:
   - `getProductPromotions(product.id)`
5. Product shipping options:
   - `getProductShippingOptions(product.id, region.id)`
6. Variant attributes prefetch
7. Suggested products:
   - `listSuggestedProducts({ product, regionId, limit: 8 })`
8. Product variant price history batch:
   - `getBatchLowestPrices(...)`

Then it renders `ProductPageUserContent` (client) with prefetched seller/suggested data.

### 1.3 Client section rendering
File: `src/components/sections/ProductDetailsPage/ProductPageUserContent.tsx`

- Receives server-fetched `sellerProducts` and `suggestedProducts`
- Memoizes these arrays to avoid rerender churn on wishlist/auth changes
- Renders:
  - `HomeProductSection` (seller products)
  - `SuggestedProductsGallery`
  - `ProductReviews`

No server fetch is triggered here for seller products.

---

## 2) Functions Used for Product Page and Their Endpoints

## 2.1 `listProductsForDetail`
File: `src/lib/data/products.ts`

Purpose:
- Single product detail payload (lean but detail-complete for PDP)

Endpoint:
- `GET /store/products`

Query keys:
- `handle`
- `region_id`
- `limit=1`
- `fields=<detail fields string>`

Fields currently fetched:
- `id,title,handle,description,thumbnail,created_at,status`
- `images.id,images.url`
- `metadata`
- `options.id,options.title,options.values.id,options.values.value`
- `variants.id,variants.title,variants.calculated_price`
- `variants.inventory_quantity,variants.manage_inventory,variants.allow_backorder`
- `variants.metadata`
- `variants.options.id,variants.options.value,variants.options.option_id`
- `variants.options.option.id,variants.options.option.title`
- `seller.id,seller.handle,seller.name,seller.photo,seller.logo_url`
- `categories.id,categories.name,categories.handle,categories.parent_category_id`
- `categories.parent_category.id,categories.parent_category.name,categories.parent_category.handle,categories.parent_category.parent_category_id`
- `categories.parent_category.parent_category.id,categories.parent_category.parent_category.name,categories.parent_category.parent_category.handle`
- `shipping_profile.name`

Cache strategy:
- `publicFetch` (no auth header) + `next: { revalidate: 300, tags: ['products'] }`

## 2.2 `listProductsLean`
File: `src/lib/data/products.ts`

Purpose:
- Lightweight listing for cards/home/seller/suggested sections

Endpoint:
- seller-aware:
  - `GET /store/seller/:seller_id/products` (when `seller_id` provided)
- default:
  - `GET /store/products`

Lean card fields:
- `id,title,handle,thumbnail,images.url,variants.id,variants.calculated_price,seller.name`

Cache strategy:
- `publicFetch` + `revalidate: 300`

## 2.3 `getProductPromotions`
Endpoint:
- `GET /store/products/:id/promotions`

## 2.4 `getProductShippingOptions`
Endpoint:
- `GET /store/product-shipping-options?product_id=...&region_id=...`

## 2.5 `listSuggestedProducts`
Strategy:
- Uses `listProductsLean` on category chain in parallel
- Dedupes + excludes current product + shuffles

---

## 3) Backend Seller Products Endpoint Notes

Backend file:
- `apps/backend/src/api/store/seller/[id]/products/route.ts`

Implemented behavior:
1. Honors `fields` from query (no forced overfetch)
2. Includes fields in cache key signature (prevents wrong payload-shape cache hits)
3. Keeps required sort fields (`id`, `created_at`, and price fields when price sorting)
4. Contains optional created_at SQL fast path; if unavailable in current DB schema (missing relation), it falls back safely to `query.graph` path.

Current known behavior:
- If SQL fast path relation does not exist in DB schema, endpoint logs one fallback warning and serves from safe path (no 500).

---

## 4) ISR and Caching Verification

## Product page
- `src/app/[locale]/(main)/products/[handle]/page.tsx` uses:
  - `revalidate = 300`
  - server fetches using cache-friendly `publicFetch`

## Main layout
- `src/app/[locale]/(main)/layout.tsx` uses:
  - `revalidate = 3600`
  - server fetches for categories/regions (cacheable)
  - Header/Footer receive props (no duplicate server fetch for nav data)

## Root layout
- `src/app/layout.tsx`
  - no `noStore()`
  - no direct dynamic opt-out in this file

Conclusion:
- No hard ISR blocker identified in the reviewed product-page path files.
- Main runtime variability is user/client-specific behavior (Header user/wishlist client fetch, cart/wishlist providers), which does not disable ISR of the product route itself.

---

## 5) Why Product Page Became Faster

Main gains:
1. PDP fetch narrowed and cacheable (`listProductsForDetail` via `publicFetch`)
2. Parallelized server fetches in `ProductDetailsPage`
3. Seller/suggested sections use lean card payloads
4. Request-level dedupe via React `cache()`
5. Layout navigation data fetched once server-side and passed to Header/Footer

---

## 6) Practical Debug Checklist

If regressions appear:
1. Confirm `/store/products?handle=...` stays near ~100-200ms
2. Confirm `/store/seller/:id/products` response shape matches requested `fields`
3. Check backend logs for seller fast-path fallback warnings
4. In admin telemetry, verify slow request card badge:
   - `POOL CAPTURED` vs `POOL MISSING`
5. Verify OpenTelemetry overview pool coverage card for snapshot availability

---

## 7) Change Log (Performance-focused)

- PDP route uses cached detail fetch + ISR
- `ProductDetailsPage` runs parallel server fetches
- `listProductsLean` drives seller/suggested card sections
- Seller endpoint honors requested fields and field-sensitive caching
- Telemetry UI/API enhanced with DB pool visibility and coverage
