# Product Page Performance Mitigation Plan

## Goal
Reduce cold/warm PDP latency and improve cache effectiveness without breaking product correctness.

## Current implementation status (2026-02-23)

Implemented:
- ✅ Breadcrumb strategy switched to local-first with fallback network hierarchy fetch only for incomplete local chains.
- ✅ Breadcrumb fallback completeness fix added (missing top-parent case now triggers hierarchy fetch).
- ✅ Breadcrumb computation starts in parallel with other PDP server fetches.
- ✅ Storefront cache field normalization applied using canonical constants (`lean`, `PDP seller`, `PDP suggested`).
- ✅ `use server` export issue resolved by moving field constants to `src/lib/constants/product-fields.ts`.
- ✅ PDP detail field trim applied for test/perf validation:
  - removed `options.values.value`
  - removed `seller.logo_url`
  - kept `seller.photo` and full breadcrumb-relevant category parent chain.
- ✅ Removed redundant storefront product-detail category-only query path (`PRODUCT_DETAIL_CATEGORY_TREE_FIELDS` + helper).
- ✅ Detail cache namespace bumped to `product-detail-v2` to invalidate stale field-shape cache entries safely.
- ✅ `/store/seller/:id/products` fast-path hardened and validated:
  - default-enabled unless `SELLER_PRODUCTS_CREATED_AT_FAST_PATH=false`,
  - dynamic link-table resolution for SQL path,
  - fixed knex null-filter compatibility (`whereNull` chain),
  - verified runtime path via response header `X-Seller-Products-Path: fast-path`.
- ✅ Added opt-in stage profiling for seller products endpoint:
  - env: `SELLER_PRODUCTS_PROFILE=true`,
  - location: `apps/backend/src/api/store/seller/[id]/products/route.ts`,
  - backend terminal log key: `seller products endpoint stage timings`.
- ✅ Added opt-in/threshold stage profiling for shipping options endpoint:
  - env: `SHIPPING_OPTIONS_PROFILE=true`,
  - threshold env: `SLOW_ENDPOINT_STAGE_LOG_MS` (default `300`),
  - location: `apps/backend/src/api/store/product-shipping-options/route.ts`,
  - backend terminal log key: `Store endpoint stage timings` (`route: /store/product-shipping-options`).
- ✅ Trimmed shipping-options cold-path graph payload to required fields only:
  - `shipping_option`: kept id/name/price_type/service_zone_id/data/amount/prices,
  - `service_zone`: reduced to `geo_zones.country_code`,
  - `shipping_option_price_set`: reduced to `price_set.prices.amount/currency_code`.
- ✅ Reduced PDP suggested-products category overfetch:
  - replaced fixed extra buffer `+4` with configurable `PDP_SUGGESTED_EXTRA_PRODUCTS` (default `2`),
  - location: `ArtovniaStorefront/src/lib/data/products.ts` (`listSuggestedProducts`).

Still pending from plan:
- telemetry comparison (post-change P50/P95/P99, MISS/HIT trend),
- backend endpoint index/query tuning (post-profiling),
- explicit cache warmup + alert hardening.

---

## 0) Baseline (before code changes)

1. Capture 30-60 min baseline in production:
   - P50/P95/P99 by `sourceFunction`:
     - `listProductsForDetail`
     - `listProductsLean`
     - `getProductPromotions`
     - `getProductShippingOptions`
   - cache counters: `MISS/STALE/HIT/PRERENDER`
   - count of slow warnings (`Slow storefront publicFetch`).
2. Run fixed replay script for same PDP handles sequence (A/B comparability).
3. Store baseline in a dated section in performance docs.

Success criteria baseline quality:
- same locale/region
- same product list order
- same time window length

---

## 1) Fastest high-impact fix: Breadcrumb path

### Problem
PDP currently uses `buildProductBreadcrumbs(...)`, which can trigger additional category hierarchy fetches.

### Action
Switch PDP SSR path to local breadcrumb builder:
- use `buildProductBreadcrumbsLocal(product, locale)`
- keep `buildProductBreadcrumbs(...)` only where full network-based hierarchy is strictly required.

### Expected impact
- removes one category network dependency from critical SSR path
- reduces cold-tail latency and backend load per PDP request.

Validation:
- verify breadcrumb correctness on products with 1/2/3 category levels
- verify no extra `/store/product-categories*` request on PDP render path.

---

## 2) Reduce PDP fan-out pressure

### Problem
One PDP render fans out to multiple endpoints; concurrent MISS amplifies tail latency.

### Actions
1. Keep SSR-critical only:
   - detail product
   - shipping options
   - product promotions
2. Defer non-critical below-fold data to client or progressive fetch:
   - seller products
   - suggested products
3. If keeping server-side for seller/suggested:
   - add strict timeout/abort policy
   - return empty fallback quickly on timeout.

### Expected impact
Lower worst-case TTFB and fewer 6s-25s stalls.

---

## 3) Cache key normalization and cardinality control

### Problem
Global hit ratio is diluted by high-key cardinality.

### Actions
1. Ensure all list calls use stable field sets per use-case:
   - PDP detail fields (single canonical string)
   - seller card fields (single canonical string)
   - suggested card fields (single canonical string)
2. Avoid accidental query variance (ordering/optional params).
3. Split dashboards by bucket key (already available in `publicFetch` telemetry summary).

### Expected impact
Higher effective hit rate for repeated paths and less cache fragmentation.

---

## 4) Backend-side optimization focus

### Problem
`networkMs` dominates total time in warnings; parse is negligible.

### Actions
1. Profile backend endpoints under MISS:
   - `/store/products` (handle detail)
   - `/store/seller/:id/products`
   - `/store/products/:id/promotions`
   - `/store/product-shipping-options`
2. For each endpoint capture:
   - DB query count
   - max query time
   - whether cache was hit/missed
3. Add/verify indexes used by slow filters/sorts.
4. Review expensive joins in promotions and shipping endpoints.
5. For `/store/seller/:id/products` specifically (now frequently the slowest PDP-adjacent call):
   - confirm route path: `apps/backend/src/api/store/seller/[id]/products/route.ts`,
   - profile cold path branches (`fast-path` vs default graph path),
   - verify if `SELLER_PRODUCTS_CREATED_AT_FAST_PATH=true` is safe in current DB schema,
   - inspect query count/latency split between:
     - seller-product link fetch,
     - sortable payload fetch,
     - final page hydration fetch.

### Expected impact
Reduce cold fetch latency where storefront cache cannot help.

---

## 5) Cache policy + invalidation strategy

### Actions
1. Keep `PRODUCT_CACHE_REVALIDATE_SECONDS` configurable by env.
2. Align invalidation tags with product/promotion/shipping updates.
3. Add explicit warmup for high-traffic PDPs after deploy.

### Expected impact
Fewer post-deploy cold misses and faster cache convergence.

---

## 6) Observability improvements

### Actions
1. Add periodic summary logs by `sourceFunction`:
   - requests, hit rate, avg/p95
2. Separate cold vs warm dashboards.
3. Alert thresholds:
   - warning when P95 for `listProductsForDetail` > 1200ms for 10m window
   - warning when MISS ratio > target threshold for top buckets.

---

## 7) Rollout plan

1. **Phase A (safe, fast):** breadcrumbs local switch + measure 24h.
2. **Phase B:** fan-out reduction/defer below-fold fetches.
3. **Phase C:** backend endpoint profiling and DB/index optimizations.
4. **Phase D:** cache warming + dashboard alerts hardening.

Rollback:
- each phase behind small, isolated commits; revert phase independently if KPI degrades.

---

## KPI Targets

- `listProductsForDetail` P95 < 1200ms (cold), < 400ms (warm)
- PDP server request count reduced on first render
- HIT ratio trend up, MISS growth slope down
- eliminate 20s+ outliers for promotions/shipping during normal load

---

## Temporary profiling cleanup checklist (after optimization phase)

1. Disable env-based verbose profiling:
   - unset or set `SELLER_PRODUCTS_PROFILE=false`
   - unset or set `SHIPPING_OPTIONS_PROFILE=false`
2. Keep/restore `SLOW_ENDPOINT_STAGE_LOG_MS` to default behavior (or unset).
3. If logs remain noisy in stable production, remove temporary stage-mark helpers from:
   - `apps/backend/src/api/store/seller/[id]/products/route.ts`
   - `apps/backend/src/api/store/product-shipping-options/route.ts`
