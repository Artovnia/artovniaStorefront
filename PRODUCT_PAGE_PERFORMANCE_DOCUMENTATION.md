# Product Page Performance Documentation (Current State)

## Scope
This document reflects the **actual current implementation** and observed runtime behavior as of 2026-02-23.

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
