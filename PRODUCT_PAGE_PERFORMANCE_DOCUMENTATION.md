# Product Page Performance Documentation (Current State)

## Scope
This document reflects the **actual current implementation** and observed runtime behavior as of 2026-02-23.

## Update log (2026-02-23, evening)

Implemented now:
- ✅ PDP detail field-set trimmed in `listProductsForDetail`:
  - removed `options.values.value`
  - removed `seller.logo_url`
  - kept `seller.photo` and breadcrumb-critical category parent chain fields.
- ✅ Removed redundant PDP category-only detail fetch path in storefront data layer:
  - deleted `PRODUCT_DETAIL_CATEGORY_TREE_FIELDS`
  - deleted `getProductDetailCategoryHierarchy` helper path (no active callsites in current PDP flow).
- ✅ Bumped detail cache namespace from `product-detail-v1` to `product-detail-v2` to avoid stale cached payload shape after field changes.
- ✅ Seller products endpoint fast-path hardened and validated in runtime:
  - default enabled unless `SELLER_PRODUCTS_CREATED_AT_FAST_PATH=false`,
  - dynamic SQL link-table resolution (`seller_seller_product_product` first, fallback candidate `seller_product`),
  - fixed knex compatibility issue by using `whereNull(...)` chain (removed failing `andWhereNull(...)` usage),
  - verified response header path marker via direct request:
    - `X-Seller-Products-Path: fast-path`.
- ✅ Added opt-in deep stage profiling for seller products route:
  - env flag: `SELLER_PRODUCTS_PROFILE=true`,
  - log location: backend terminal (`apps/backend` `yarn dev` process),
  - route file: `apps/backend/src/api/store/seller/[id]/products/route.ts`,
  - log message key: `seller products endpoint stage timings`.
- ✅ Added opt-in/threshold stage profiling for shipping options route:
  - env flag: `SHIPPING_OPTIONS_PROFILE=true` (forces logging for all requests),
  - default behavior when false: logs only when total >= `SLOW_ENDPOINT_STAGE_LOG_MS` (default 300ms),
  - log location: backend terminal (`apps/backend` `yarn dev` process),
  - route file: `apps/backend/src/api/store/product-shipping-options/route.ts`,
  - log message key: `Store endpoint stage timings` with `route: /store/product-shipping-options`.
- ✅ Shipping options endpoint payload trimmed for cold path:
  - reduced over-fetch in `shipping_option`, `service_zone`, and `shipping_option_price_set` graph fields to only pricing/filtering-relevant columns.
- ✅ Suggested products category query load reduced:
  - lowered per-category overfetch buffer from fixed `+4` to configurable default `+2`,
  - new env knob in storefront data layer: `PDP_SUGGESTED_EXTRA_PRODUCTS` (default `2`),
  - file: `ArtovniaStorefront/src/lib/data/products.ts`.
- ✅ Added storefront-side short-lived in-flight request dedup to reduce duplicate first-enter calls during parallel prefetch/render cycles:
  - `publicFetch(...)` dedup window via `PUBLIC_FETCH_DEDUP_TTL_MS` (default `2000`),
  - vendor status fetch dedup via `VENDOR_STATUS_DEDUP_TTL_MS` (default `2000`),
  - lowest-prices batch dedup via `PRICE_BATCH_DEDUP_TTL_MS` (default `2000`),
  - files:
    - `ArtovniaStorefront/src/lib/data/products.ts`
    - `ArtovniaStorefront/src/lib/data/vendor-availability.ts`
    - `ArtovniaStorefront/src/lib/data/price-history.ts`

New observed slowest PDP-adjacent API in logs:
- `GET /store/seller/:id/products?...` around ~313ms on MISS in the reported sample.
- Backend implementation path confirmed:
  - `apps/backend/src/api/store/seller/[id]/products/route.ts`

Analyzed sources:
- `src/app/[locale]/(main)/products/[handle]/page.tsx`
- `src/components/sections/ProductDetailsPage/ProductDetailsPage.tsx`
- `src/lib/data/products.ts`
- `src/lib/utils/breadcrumbs.ts`
- `src/lib/data/categories.ts`
- telemetry export: `telemetry-markdown-1771859413430.md`
- live slow warnings from storefront logs (`Slow storefront publicFetch`)

---

## 1) Current Top-Down PDP Flow

### 1.1 Route entry (`page.tsx`)
- `revalidate = 300`
- React request dedupe via `cache(async (handle, regionId) => listProductsForDetail(...))`
- Metadata and page body share the same cached detail fetch key in one render cycle.

### 1.2 Data layer cache defaults (`products.ts`)
- `PRODUCT_CACHE_REVALIDATE_SECONDS` default is **1800** (30 min), not 300.
- `publicFetch` uses native `fetch` + `next: { revalidate, tags }` and logs slow requests.
- `listProductsForDetail` uses `unstable_cache` (`getCachedProductDetail`) + `publicFetch('/store/products')`.

### 1.3 Product details server component (`ProductDetailsPage.tsx`)
Current `Promise.allSettled` fan-out includes:
1. seller products (`listProductsLean` -> `/store/seller/:id/products`)
2. vendor status (`getVendorCompleteStatus`)
3. promotions for viewed product (`getProductPromotions`)
4. shipping options (`getProductShippingOptions`)
5. variant attributes prefetch
6. suggested products (`listSuggestedProducts`, often multiple category queries)
7. batch lowest prices (`getBatchLowestPrices`)

Additionally, breadcrumbs are built with a hybrid path:
- `buildProductBreadcrumbs(product, locale)` is started in parallel with the rest of server fan-out.
- fast path uses `buildProductBreadcrumbsLocal` (no extra request), because PDP detail fields now include category parent chain.
- slow fallback calls `getCategoryHierarchy(...)` when local chain is incomplete at any ancestor level (fix for missing top parent in some trees).

---

## 2) Interpreting the current warning pattern

Observed warning examples (storefront):
- `listProductsForDetail` `/store/products` with `networkMs` often 1.2s–7.5s, and spikes to ~25s
- `listProductsLean` (both `/store/products` and `/store/seller/:id/products`) also slow on MISS
- `getProductPromotions` and `getProductShippingOptions` occasionally very slow on MISS

### What the warning fields mean
- `networkMs` dominates total time -> latency is mostly backend/network side, not JSON parsing.
- `cacheControl: null` -> backend response does not expose useful cache-control header to storefront logs.
- `backendCache: MISS` or `MISS, MISS` -> backend-side cache not warm for that exact key/shape.
- `cacheStatus: null` -> no edge cache status header visible in these fetch responses.

### Why MISS can still be high
High MISS ratio is expected when traffic pattern has high key cardinality:
- many unique product handles,
- seller-specific endpoints with many seller IDs,
- per-product promotions/shipping endpoints,
- suggested products requesting multiple category slices,
- potentially different field sets for the same base endpoint.

---

## 3) Cache ratio reported today

Reported by runtime telemetry snapshots:
- Snapshot A: `MISS 741 / STALE 53 / HIT 17`
- Snapshot B (after another browser revisits): `MISS 907 / STALE 69 / HIT 50 / PRERENDER 1`

Interpretation:
- Cross-session warmup exists (HIT count increased from 17 -> 50).
- But new-key churn is still dominant, so MISS grows faster than HIT.
- This is consistent with browsing many new PDPs and seller/category variants.

---

## 4) What likely changed vs “yesterday was faster” (and what has now been fixed)

Based on current code and behavior, the biggest likely contributors are:

1. **Breadcrumb hierarchy fetch path previously added overhead**
   - Earlier behavior could fetch hierarchy on every PDP path.
   - Current behavior is now local-first with fallback-only network fetch, and breadcrumbs are computed in parallel with other requests.

2. **PDP server fan-out is broad and all cold misses stack together**
   - One PDP render can trigger multiple remote requests in parallel.
   - If several endpoints MISS simultaneously, end-user sees the worst tail latency.

3. **Backend cache key diversity remains high, but storefront normalization improved**
   - Canonical field-set constants are now used for lean product cards, PDP seller cards, and suggested product cards.
   - This removes callsite-level `fields` drift and improves effective cache reuse.

4. **Current logs indicate backend/network bottleneck, not parse bottleneck**
   - `parseMs` is small in most warnings; `networkMs` is the dominant cost.

Note:
- Today’s invite-flow fixes in backend (`/vendor/invites`) are isolated from storefront product endpoints and are not direct PDP performance changes.

---

## 5) Telemetry export findings (`telemetry-markdown-1771859413430.md`)

In the analyzed export window:
- slowest operations are mainly Store API product endpoints,
- repeated slow entries include `/store/products` detail queries and `/store/seller/:id/products`,
- no error-rate regression (errors = 0), indicating a latency issue rather than failure issue.

This aligns with storefront warning logs showing large network latency spikes under cache MISS.

---

## 6) Current reality summary

What works:
- request-level dedupe and cache wrappers are present,
- repeated requests can hit warmed cache,
- no functional errors in PDP fetch path,
- PDP detail fetch now carries category parent chain needed for full breadcrumb tree without mandatory extra category request,
- key `fields` sets for storefront list calls are canonicalized to reduce cache fragmentation,
- `use server` runtime export issue fixed by moving card field constants out of `products.ts` into `src/lib/constants/product-fields.ts`.
- latest PDP detail query field trim deployed with no observed storefront regressions in manual tests.

What is still weak:
- cold-path latency remains high,
- MISS ratio dominates due to key diversity,
- shipping/promotions/seller endpoints contribute to long-tail latency.

---

## 7) Immediate verification checklist

1. ✅ Breadcrumb path optimized: local-first + fallback-only network fetch.
2. ✅ Fallback condition fixed to recover full root→leaf breadcrumb when local chain misses top ancestor.
3. ✅ Canonical field sets applied for lean/seller/suggested card queries.
4. Measure per-endpoint P95/P99 under warm and cold cache separately.
5. Separate metrics by sourceFunction (`listProductsForDetail`, `listProductsLean`, `getProductPromotions`, `getProductShippingOptions`).
6. Confirm backend cache key strategy for seller/promotions/shipping endpoints and whether keys are too granular.
7. Validate cache effectiveness by replaying the exact same PDP URL sequence in controlled runs.
8. For `/store/seller/:id/products`, compare:
   - current default graph path,
   - created_at fast-path (if enabled),
   - cache HIT vs MISS latency deltas.

---

## 8) Temporary profiling logs and cleanup plan (post-optimization)

These logs are intentionally temporary for tuning sessions.

### Current temporary profiling controls
- Seller products route profiling: `SELLER_PRODUCTS_PROFILE=true`
- Shipping options route profiling: `SHIPPING_OPTIONS_PROFILE=true`
- Slow-stage threshold (shipping route and other stage-timed routes): `SLOW_ENDPOINT_STAGE_LOG_MS` (default `300`)

### Where logs are emitted
- Backend process output only (Medusa app):
  - `apps/backend/src/api/store/seller/[id]/products/route.ts`
  - `apps/backend/src/api/store/product-shipping-options/route.ts`

---

## Update log (2026-02-23, late night) — post-restart cold test

### What happened on first enter (duplicate calls)
- In the recorded cold run, many PDP requests appeared in pairs (same URL + params). This pattern is consistent with parallel prefetch/render cycles in Next.js dev flow (metadata/render and/or prefetch + navigation overlap).
- Important: this duplicate pattern was strongest only on first cold navigation; subsequent product opens were mostly single-call and much faster.

### Current endpoint status from latest logs
- `/store/products?handle=...` (detail): ~80–145ms typical after warm-up; first cold sample had duplicate pair ~180–210ms.
- `/store/vendors/:id/status`: improved to ~49–89ms on later opens; cold duplicate pair observed (~155ms + ~75ms).
- `/store/seller/:id/products` fast-path:
  - strong on many sellers (~96–183ms),
  - occasional heavier MISS still present (example ~506ms with hydration dominating).
- `/store/products/:id/promotions`:
  - now mostly much lower on warm (~52ms),
  - still occasional slower first-hit sample (~288ms).
- `/store/product-shipping-options`:
  - warm often ~124–230ms,
  - cold MISS still main remaining bottleneck (~305–361ms stage-timed, ~339–465ms total response in samples).
- `/store/products/:id/variants/:variantId/attributes`:
  - now much faster in empty/common case (~11–22ms in latest samples).

### Remaining main bottlenecks (priority)
1. `product-shipping-options` cold path (`batch2_shipping_options`, `batch3_zones_and_prices`).
2. `seller/:id/products` occasional slow MISS where hydrate stage spikes for specific sellers.
3. `products/:id/promotions` occasional cold outliers despite improved shared active-promotions behavior.

### How to disable after development
1. Remove these env vars (or set to `false`):
   - `SELLER_PRODUCTS_PROFILE`
   - `SHIPPING_OPTIONS_PROFILE`
2. Keep `SLOW_ENDPOINT_STAGE_LOG_MS` at default or unset.
3. Optionally remove temporary stage-mark helpers from the two route files once KPI targets are reached and stable for multiple deploy cycles.
