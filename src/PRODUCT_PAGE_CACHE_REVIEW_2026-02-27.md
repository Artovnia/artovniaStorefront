# Product Page Cache & Shipping Performance Review (2026-02-27)

## Scope (today)

Reviewed again with new telemetry and current implementation:

- `src/app/[locale]/(main)/layout.tsx`
- `src/lib/data/categories.ts`
- `src/lib/data/products.ts`
- `src/components/sections/ProductDetailsPage/ProductDetailsPage.tsx`
- `src/components/organisms/ProductDetails/ProductDetails.tsx`
- `src/components/cells/ProductDetailsShipping/ProductDetailsShippingWrapper.tsx`
- `src/components/cells/ProductDetailsShipping/ProductDetailsShipping.tsx`
- `../mercur/apps/backend/src/api/store/product-shipping-options/route.ts`
- telemetry export: `telemetry-markdown-1772200753642.md` (+ additional OTEL aggregates shared by user)

---

## Key telemetry interpretation update

1. `/store/products?handle=...&limit=1` has occasional outliers >1s, but aggregate behavior is better than those outliers.
2. Highest total-time pressure in 30-minute window is mainly:
   - `GET /store/products` (high volume + high avg)
   - `GET /store/product-shipping-options` (high volume + medium/high avg)
   - category endpoints (`/store/product-categories*`) still very hot
3. Shipping endpoint shows many 700-900ms calls even when not failing, so miss-path cost remains meaningful.

---

## Findings (code-level)

### A) Category/layout pressure

- Main layout is server-side and always fetches categories + regions.
- Category tree call in `listCategoriesWithProducts` is suitable for long cache because category topology changes infrequently.

Relevant paths:
- `src/app/[locale]/(main)/layout.tsx`
- `src/lib/data/categories.ts`

### B) Product detail bottleneck shape

- `/store/products?handle=...` still pulls a broad field set for PDP and can produce DB-heavy traces.
- Outliers exist, but aggregate p50/p95 on `/store/products/:id` are acceptable; biggest improvement opportunity is reducing repeated expensive adjacent calls.

### C) Shipping endpoint miss-path cost

In backend route `api/store/product-shipping-options/route.ts`:
- miss path previously did extra graph reads that can be partially cached/reused,
- cache write was fire-and-forget, which can let near-concurrent requests miss before cache is persisted.

---

## Changes implemented today

## 1) Extended category tree cache horizon to 24h (configurable)

**File changed:** `src/lib/data/categories.ts`

- Added:
  - `CATEGORY_TREE_REVALIDATE_SECONDS` (default `86400`)
- Applied to the heavy parent tree call in `listCategoriesWithProducts`.

Result:
- lower pressure on `/store/product-categories?...include_descendants_tree=true...`
- lower pressure on `categories-with-products` dependent layout fetch path

## 2) Extended main layout ISR horizon to 24h

**File changed:** `src/app/[locale]/(main)/layout.tsx`

- Changed `revalidate` from `3600` to `86400`.

Result:
- fewer layout re-renders causing category/region backend calls
- better protection during bursts

## 3) Safe optimization of shipping endpoint miss-path

**File changed:** `../mercur/apps/backend/src/api/store/product-shipping-options/route.ts`

Implemented:

1. **Configurable shipping cache TTL**
   - `SHIPPING_OPTIONS_CACHE_TTL_SECONDS` (default `3600`, previously hardcoded 300)

2. **Removed redundant product existence query**
   - no standalone `product` graph query; product validity is inferred from required links (`product_shipping_profile` + `seller_product`)

3. **Cached region metadata for reuse**
   - cache key: `shipping_region_meta:{region_id}`
   - caches `currencyCode` and `regionCountryCodes`

4. **Cached seller shipping-option IDs for reuse**
   - cache key: `seller_shipping_option_ids:{sellerId}`

5. **Awaited cache writes**
   - switched from fire-and-forget to awaited writes for result/empty result paths
   - improves subsequent request hit probability under parallel load

Behavior preserved:
- response payload shape and seller name still returned
- same endpoint contract

---

## Expected impact

1. **Category/layout load reduction** due to 24h caching:
   - fewer repeated category-tree requests
   - fewer layout-triggered category calls in spikes

2. **Shipping endpoint median/p95 improvement**:
   - fewer graph queries on miss
   - more reusable subdata from cache
   - fewer near-concurrent misses after first response due to awaited cache write

3. **PDP stability improvement**:
   - not only faster raw responses, but reduced backend pressure from surrounding hot endpoints

---

## Validation checklist for next telemetry run

Track for 30-minute windows before/after deploy:

1. `GET /store/product-shipping-options`
   - Calls, Avg, P95, P99, total time
2. `GET /store/product-categories?....include_descendants_tree=true`
   - Calls and total time
3. `GET /store/product-categories/categories-with-products`
   - Calls and total time
4. Storefront `Slow storefront publicFetch` logs for:
   - `getProductShippingOptions`
   - `listProductsForDetail`

Target short-term:
- shipping endpoint P95 < 700ms
- meaningful drop in category endpoint call count per 30 min window

---

## Follow-up route revision (same day, based on code review)

Additional backend updates applied to `apps/backend/src/api/store/product-shipping-options/route.ts`:

1. TTL/config strategy
   - hardcoded endpoint TTL to `3600` seconds as requested (no env sprawl)
   - added cache key versioning (`v2`) to avoid mixed payloads across deploys

2. Input safety
   - handle array query params safely (`product_id`, `region_id`)
   - added format validation before key construction / query execution

3. Region handling correctness
   - moved region metadata resolution into parallel batch with core entities
   - invalid `region_id` now returns `404` instead of silently falling back to EUR behavior
   - no hardcoded EUR fallback path in miss handling

4. Main optimization based on your architecture note
   - removed seller-shipping-option link lookup from this endpoint path
   - shipping options now filtered by `shipping_profile_id` directly
   - this removes one graph query + one cache branch from miss path

5. Safer option eligibility/pricing
   - options without geo-zone coverage are excluded
   - removed hardcoded `1000` amount fallback
   - prefer currency-matching prices (price_set first, then option prices)

6. Error/logging hygiene
   - renamed profiling flag to avoid confusion with shipping profiles
   - retained detailed server logs, but stopped returning internal error details to clients
   - cache helper failures now emit warnings instead of being fully silent

---

## Latest validation run (localhost, after SQL-path fix)

### What was done since previous section

Additional backend change in `apps/backend/src/api/store/product-shipping-options/route.ts`:

1. Replaced multi-query graph miss-path with a lean SQL path using `PG_CONNECTION`
   - product profile + region lookup kept
   - shipping option eligibility + geo-zone filter + region-currency price done in one query
2. Fixed runtime regression (`column so.amount does not exist`)
   - removed invalid `so.amount` selection/grouping
   - payload now uses `priced_amount` from `price`
3. Preserved storefront behavior for calculated options
   - if no fixed amount and `price_type=calculated`, option is still returned with `amount=null`

### Observed timings from your latest run

`GET /store/product-shipping-options` now observed at:
- ~95ms (first seller first entry)
- ~35ms, ~38ms, ~15ms on subsequent entries
- ~65ms for a product not visited before in that sequence

Interpretation:
- Endpoint is now materially faster on both first-load and subsequent requests.
- Cached responses reported by you around ~20ms are consistent with this route shape + Redis hits.
- No current sign of the previous 300-500ms miss-path behavior in the provided sample.

### Current bottleneck shape (from same logs)

Shipping is no longer the dominant PDP cost. Heavier calls are now typically:
- `/store/products?handle=...` (~76-149ms in this run)
- `/store/seller/:id/products` (~109-192ms)
- `/store/products?category_id=...` (~96-217ms)

### Recommended next optimization steps (priority order)

1. **PDP duplicate call deduplication (storefront)**
   - unify repeated requests for dimensions / delivery-timeframe / reviews via shared server-level fetch or cache tags
2. **Trim `products?handle` field set for PDP first paint**
   - split critical-vs-deferred fields to reduce first query payload and hydration pressure
3. **Add/verify composite DB indexes (production DB)**
   - `price(price_set_id, currency_code) WHERE deleted_at IS NULL`
   - `geo_zone(service_zone_id, country_code) WHERE deleted_at IS NULL`
4. **Collect production APM before further backend rewrites**
   - compare p50/p95/p99 for shipping endpoint after this release window

### Status

- Shipping endpoint optimization: **completed and validated in latest local run**
- Next iteration focus: **PDP data-fetch dedup + products-by-handle slimming**

---

## PDP dedup + first-paint field split (implemented)

### 1) Delivery timeframe + measurements dedup across component tree

Changes:
- `src/lib/data/delivery-timeframe.ts`
  - wrapped product timeframe fetch in `react cache()` (`getCachedProductDeliveryTimeframe`)
- `src/lib/data/measurements.ts`
  - wrapped base product-measurements fetch in `react cache()` (`getProductWithMeasurements`)
- `src/components/sections/ProductDetailsPage/ProductDetailsPage.tsx`
  - prefetches `deliveryTimeframe` and `measurements` once in parent `Promise.allSettled`
- `src/components/organisms/ProductDetails/ProductDetails.tsx`
  - removed internal server fetches for timeframe/measurements
  - consumes prefetched props (`initialDeliveryTimeframe`, `initialMeasurements`)

Result:
- avoids repeated server-path requests for these PDP concerns when multiple components touch same product data in one render cycle

### 2) Reviews path dedup for product reviews

Changes:
- `src/components/sections/ProductDetailsPage/ProductDetailsPage.tsx`
  - prefetches `getProductReviews(product.id)` once and passes `prefetchedReviews`
- `src/components/organisms/ProductReviews/ProductReviews.tsx`
  - skips client refetch when `prefetchedReviews` already exists

Result:
- removes unnecessary extra `/store/products/{id}/reviews?limit=100` request on PDP when server-prefetched payload is available

### 3) `/store/products?handle` critical-vs-deferred split

Changes in `src/lib/data/products.ts`:
- renamed critical field set to `PRODUCT_DETAIL_FIRST_PAINT_FIELDS`
- introduced `PRODUCT_DETAIL_DEFERRED_FIELDS` for non-blocking detail payload
- `listProductsForDetail` now uses first-paint fields
- added `getProductDeferredDetail({ productId, regionId })` with cached fetch
- `ProductDetailsPage` now hydrates `product` with deferred fields from this separate call

Current split behavior:
- First paint: product identity/media, variants/pricing essentials, seller basics, category chain
- Deferred: product metadata/tags/post date (used by lower sections like footer/GPSR)

### Validation note

- Storefront lint command is currently blocked by workspace lockfile state in this environment
  (`This package doesn't seem to be present in your lockfile; run "yarn install"`)

### Next telemetry checks for this batch

Track specifically after this change set:
1. duplicate rate of:
   - `/store/products/{id}/delivery-timeframe`
   - `/store/products/{id}?fields=id,weight,length,height,width,...`
   - `/store/products/{id}/reviews?limit=100`
2. p50/p95 for `/store/products?handle=...&limit=1`
3. first-load vs subsequent-load `ProductDetailsPage` total server time

---

## Follow-up fixes (same day)

### A) PDP stock regression in header (`Brak w magazynie` always shown)

Root cause:
- Deferred product merge used full-object spread (`{ ...product, ...deferredProduct }`),
  so any overlapping keys from deferred payload could replace first-paint variant payload.
- `ProductDetailsHeader` stock logic depends on first-paint variant inventory fields.

Fix:
- changed merge to **selective field hydration only** (`description`, `created_at`, `metadata`, `tags`)
- keeps original first-paint `variants` payload untouched for stock + price logic

File:
- `src/components/sections/ProductDetailsPage/ProductDetailsPage.tsx`

### B) Shipping cold entries latency trim

Observation:
- cold misses stayed ~170-255ms for `/store/product-shipping-options`

Adjustment:
- removed non-essential seller lookup SQL join from shipping endpoint cold path
- kept API shape stable by returning `seller_id: null`, `seller_name: null`
- storefront now falls back to `product.seller.name` for shipping UI label

Files:
- `apps/backend/src/api/store/product-shipping-options/route.ts`
- `src/components/cells/ProductDetailsShipping/ProductDetailsShipping.tsx`
