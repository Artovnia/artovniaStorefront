# Product Page Caching & Request-Staging Review (2026-02-26)

## Scope reviewed

### Historical context docs (read fully)
- `ArtovniaStorefront/PRODUCT_PAGE_PERFORMANCE_DOCUMENTATION.md`
- `ArtovniaStorefront/PRODUCT_PAGE_PERFORMANCE_MITIGATION_PLAN.md`
- `PERFORMANCE_OPTIMIZATIONS.md`
- `PRODUCT_PAGE_DATA_ANALYSIS.md`
- `PRODUCT_PAGE_DATA_FLOW_AUDIT.md`
- `PRODUCT_PAGE_INVESTIGATION_PART1.md`
- `PRODUCT_PAGE_INVESTIGATION_PART2.md`
- `PRODUCT_PAGE_OPTIMIZATIONS_COMPLETE.md`

### Current product-page path (read fully)
- `src/lib/data/products.ts`
- `src/lib/data/categories.ts`
- `src/lib/data/cookies.ts`
- `src/lib/data/regions.ts`
- `src/lib/constants/product-fields.ts`
- `src/app/[locale]/(main)/layout.tsx`
- `src/app/[locale]/(main)/products/[handle]/page.tsx`
- `src/components/sections/ProductDetailsPage/ProductDetailsPage.tsx`
- `src/components/organisms/ProductDetails/ProductDetails.tsx`
- `src/components/cells/ProductDetailsHeader/ProductDetailsHeader.tsx`

### Imported dependencies traced (request/caching-relevant)
- `src/lib/utils/breadcrumbs.ts`
- `src/components/context/ProductUserDataProvider.tsx`
- `src/components/context/PromotionDataProvider.tsx`
- `src/components/context/BatchPriceProvider.tsx`
- `src/lib/data/vendor-availability.ts`
- `src/lib/data/price-history.ts`
- `src/lib/utils/unified-cache.ts`
- `src/components/cells/ProductDetailsShipping/ProductDetailsShippingWrapper.tsx`
- `src/components/cells/ProductDetailsShipping/ProductDetailsShipping.tsx`
- `src/lib/data/delivery-timeframe.ts`
- `src/lib/data/measurements.ts`
- `src/hooks/use-batch-lowest-prices.ts`
- `src/lib/data/reviews.ts`
- `src/components/organisms/ProductReviews/ProductReviews.tsx`
- `next.config.ts`

### Telemetry exports checked
- `C:\Users\fitcrates\Downloads\telemetry-markdown-1772137463841.md`
- `C:\Users\fitcrates\Downloads\telemetry-json-1772137480111.json` (partial due file size limits)

---

## Executive conclusion

The current implementation is **much better than earlier versions** (no obvious ISR-killer in PDP SSR path like `getAuthHeaders()`), but there are still important causes of low hit ratio during traffic spikes:

1. **Request fan-out per PDP is still high** (SSR + client hydration).
2. **Promotion data is still fetched again client-side by design** for card products (`serverDataProvided={false}`).
3. **Category-related fallback/fetching paths still generate many calls under incomplete hierarchy chains and global layout fetches**.
4. **`next.config.ts` cache header route patterns likely do not match locale-prefixed routes** (`/pl/...`, `/en/...`), reducing intended CDN behavior.
5. **High-cardinality keys remain** (`handle`, `seller_id`, `category_id`, variant batches, etc.), so 8k MISS / 1k HIT is not shocking during surge traffic, but still indicates optimization headroom.

---

## Current request staging (verified)

## 1) PDP server path (`/products/[handle]`)

From `page.tsx` + `ProductDetailsPage.tsx` + `ProductDetails.tsx`, a single cold PDP can trigger:

1. Product detail fetch (`/store/products?handle=...`) via `listProductsForDetail`
2. Seller products (`/store/seller/:id/products`) via `listProductsLean`
3. Vendor status (`/store/vendors/:id/status`)
4. Product promotions (`/store/products/:id/promotions`)
5. Product shipping options (`/store/product-shipping-options`)
6. Suggested products (1-3x `/store/products?category_id=...` depending on chain)
7. Lowest prices batch (`/store/variants/lowest-prices-batch`)
8. Delivery timeframe (`/store/products/:id/delivery-timeframe`)
9. Measurements (`/store/products/:id?fields=...`)
10. Breadcrumb fallback category calls when local parent chain incomplete (`/store/product-categories...`)

So even after improvements, **PDP SSR remains multi-endpoint, not single-aggregate**.

## 2) PDP client hydration path

After first paint, additional calls may happen:

1. `ProductUserDataProvider`: `/api/customer` always, plus `/api/wishlists` and `/api/review-eligibility/:id` when authenticated.
2. `PromotionDataProvider`: client-side fetch for promotional products (because `serverDataProvided={false}`).
3. `ProductReviews` lazy fetch when section intersects (`/store/products/:id/reviews?limit=100`).
4. `BatchPriceProvider`/`useBatchLowestPrices`: additional batch price calls for registered below-fold variants not preloaded.

This is architecturally valid, but under spike traffic it increases backend pressure and miss opportunities.

---

## Caching behavior review (verified vs assumptions)

## A) Good/working

1. Public product/category fetches in `products.ts` use `publicFetch(...)` with no auth header and `next: { revalidate }`.
2. `listProductsForDetail` is wrapped in `unstable_cache` and uses normalized query params.
3. Shipping options moved to SSR prefetch (`getProductShippingOptions` now cached).
4. Variant URL updates no longer trigger router navigation (`history.replaceState` in `VariantSelectionContext`).
5. Reviews SSR ISR-killer path appears removed from PDP critical path (reviews now rendered by client component fetch).

## B) Important mismatches / risks still present

### 1. Page-level revalidate vs data-layer revalidate mismatch
- PDP route: `revalidate = 300`.
- Product data default: `PRODUCT_CACHE_REVALIDATE_SECONDS = 1800`.

This improves hit ratio for backend fetches but means product data can stay stale much longer than page HTML expectations.

### 2. `PromotionDataProvider` intentionally triggers client fetch on PDP
`ProductDetailsPage` passes only current product in `initialData`, but sets `serverDataProvided={false}`.
That means client promotion fetching still runs for cards and increases cold-path load.

### 3. Locale route cache-header mismatch in `next.config.ts`
Cache headers are configured for paths like:
- `/products/:path*`
- `/categories/:path*`
- `/sellers/:path*`
- `/promotions`

But app routes are locale-prefixed (`/[locale]/...`). If requests are actually `/pl/products/...`, these header rules likely do not match directly.

### 4. Layout-level category endpoints remain very hot
Main layout always fetches categories + regions server-side. Even with caching, during surges this can create high repeated traffic to:
- `/store/product-categories/categories-with-products`
- `/store/product-categories?parent_category_id=null&include_descendants_tree=true...`

### 5. Breadcrumb fallback still can trigger category network calls
`buildProductBreadcrumbs` is local-first, but if chain incomplete, falls back to `getCategoryHierarchy`, adding category calls.

### 6. Client-side in-memory cache (`unified-cache`) is local process/browser memory
Useful for client UX and in-flight dedup, but it does not replace shared CDN/data cache behavior.

---

## Telemetry interpretation against current code

From markdown export:
- Exported at `2026-02-26T20:24:23.827Z`
- `Total Traces: 17969`
- Time range in export metadata is very short (`~7s`), indicating a high-throughput burst sample.
- Slowest operations include PDP detail and card-fetch style `/store/products` requests around ~0.8s–1.4s for that window.

From user-reported aggregated rows (30 min window), high-volume operations include:
- `/store/product-categories/:id`
- `/store/product-categories`
- `/store/products/:id/promotions`
- `/store/variants/lowest-prices-batch`
- `/store/products/:id`
- `/store/seller/:id/products`
- `/store/product-categories/categories-with-products`
- `/store/products/:id/delivery-timeframe`

This **matches the current staged architecture**: these are exactly the endpoints touched by PDP + layout + below-fold client enrichments.

---

## Is 1k HIT / 8k MISS expected with 586 products?

Short answer: **partly expected, partly a signal to optimize further**.

### Why it can still be expected
1. High-cardinality keys:
   - many unique handles
   - seller_id/category_id combinations
   - different endpoint families
2. First-wave social traffic often skews to cold keys.
3. Not all misses are product-detail misses; many are from adjacent layout/category/promotion endpoints.

### Why it still indicates gaps
1. The hit ratio should improve more quickly for only 586 products if route-level and data-level cache alignment is ideal.
2. Category and promotion request volume is disproportionately high versus catalog size.
3. Locale-path cache-header mismatch likely reduces intended CDN caching effectiveness.

---

## Key findings by severity

## High
1. **Likely locale cache-header mismatch in `next.config.ts` path rules** for localized routes.
2. **Promotion client fetch still active by design on PDP** (`serverDataProvided={false}`), increasing load and misses.
3. **Heavy layout-level category call pressure** remains substantial in surge scenarios.

## Medium
4. **PDP still has broad server fan-out** (many endpoints per request).
5. **Revalidate mismatch (300 vs 1800)** can produce stale-vs-fresh inconsistency and harder reasoning.
6. **Breadcrumb fallback still adds category network calls** when chain incomplete.

## Low
7. Some stale/unused imports and legacy helpers exist (noise risk, but not major runtime issue by itself).

---

## Recommended next actions (prioritized)

1. **Fix cache header path matching for locale-prefixed routes**
   - Add localized patterns (`/:locale/products/:path*`, etc.) or equivalent middleware normalization.

2. **Split promotion strategy for PDP**
   - Keep SSR for current product promotion only.
   - For card products, fetch promotions in a tighter scope (explicit product IDs) instead of broad generic fetch path.

3. **Reduce category call pressure from layout**
   - Confirm category tree data can be cached in a longer-lived shared backend cache layer.
   - Consider reducing frequency/paths where `listCategoriesWithProducts()` runs.

4. **Instrument per-source-function hit/miss metrics**
   - You already started this in `publicFetch`; persist/export buckets and compare before/after each change.

5. **Consider a dedicated aggregated PDP endpoint**
   - Even a partial aggregator (product + promotions + shipping + delivery + seller mini-list) can significantly cut request fan-out under spikes.

6. **Align TTL strategy intentionally**
   - Decide if product-detail data should truly stay at 1800s while page shell is 300s; document rationale per endpoint.

---

## Assumptions challenged during this audit

1. **"Only 586 products should imply high cache hit"**
   - Not necessarily true when most misses come from non-detail endpoints and high-cardinality combinations.

2. **"PDP is now mostly one fetch"**
   - Not true today; it is still multi-stage SSR + hydration.

3. **"All previous critical cache killers still apply"**
   - Not fully; several old issues were already fixed (notably variant URL navigation and review ISR-killer path in PDP SSR).

---

## Final verdict

The current architecture is **stable and improved**, but the observed miss profile during traffic surge is consistent with:
- multi-endpoint PDP orchestration,
- still-active client enrichment fetches,
- heavy global layout category calls,
- and likely imperfect locale-level CDN header matching.

So: **8k MISS / 1k HIT is not a “single bug symptom”, but it is also not the target steady-state for your scale.**

The highest-impact next fix to test first is **locale-aware cache header matching + promotion fetch scope tightening**, then re-measure with the same telemetry export process.
