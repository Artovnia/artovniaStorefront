# Error Surface Audit - 2026-02-28

## Scope
Investigated runtime paths related to reported production incidents:
- User A: checkout `address` step
- User B: homepage

Analyzed files:
- `src/app/[locale]/(checkout)/layout.tsx`
- `src/app/[locale]/(checkout)/checkout/page.tsx`
- `src/app/[locale]/(checkout)/checkout/complete/page.tsx`
- `src/app/[locale]/(main)/layout.tsx`
- `src/app/[locale]/(main)/page.tsx`
- `src/app/layout.tsx`
- `next.config.ts`

Additional traced checkout components/services used by address flow:
- `src/components/sections/CheckoutWrapper/CheckoutWrapper.tsx`
- `src/components/sections/CartAddressSection/CartAddressSection.tsx`
- `src/components/context/CartContext.tsx`
- `src/lib/data/cart.ts` (`setAddresses`)
- `src/components/sections/CartShippingMethodsSection/CartShippingMethodsSection.tsx`
- `src/components/sections/CartPaymentSection/CartPaymentSection.tsx`
- `src/components/sections/CartReview/CartReview.tsx`
- `src/components/sections/CartReview/PaymentButton.tsx`

---

## Key finding: why users see generic "Something went wrong"
This message can appear when an uncaught runtime/render error reaches App Router default boundary behavior in production.

## Likely root causes behind incidents (homepage + checkout)
1. **Transient upstream failures (Medusa/store API, network, cache miss storms):**
   - server fetch path throws during SSR/render and bubbles to boundary.
2. **Unprotected top-level async orchestration on critical routes:**
   - when page-level awaits are not guarded, one failing source can fail entire route render.
3. **Client runtime exceptions after hydration:**
   - server `try/catch` cannot protect client event/render/hook failures in checkout step components.
4. **Provider/context invariant crashes:**
   - hooks intentionally throw (`useCart`, `useTerms`) when provider tree breaks; useful for correctness, but hard-fail at runtime.
5. **Limited production diagnostics before boundary handling:**
   - without structured telemetry fields, recurring failures are hard to correlate quickly.

## Prevention controls (mapped to causes)
1. **Segment boundaries** for `(main)` and `(checkout)` (implemented in Phase 1).
2. **Fail-soft SSR orchestration** on homepage (implemented in Phase 2) so section data failures degrade content, not whole page.
3. **Step-local client boundaries** in checkout (Phase 3 planned) to isolate address/shipping/payment crashes.
4. **Structured telemetry** (`segment`, `pathname`, `digest`, `message`, `timestamp`) with request/cart correlation IDs.
5. **Data-layer resilience patterns:**
   - return safe defaults for non-critical sections,
   - bounded retries/circuit-breaker for transient upstream errors,
   - preserve cache TTLs that avoid thundering-herd misses.

### Important architecture gap (initial state during investigation)
At audit start, only global boundary was present:
- `src/app/global-error.tsx`

This increased risk that segment/runtime failures would collapse into generic production error UX.

**Status now:** mitigated for primary segments via Phase 1:
- `src/app/[locale]/(main)/error.tsx`
- `src/app/[locale]/(checkout)/error.tsx`

---

## Problematic places (confirmed risk points)

## 1) Homepage top-level server fetch chain can fail hard
**File:** `src/app/[locale]/(main)/page.tsx`

The page performs top-level awaits (outside `try/catch`) for:
- `listProductsLean(...)`
- `listSmartHomeRandomProducts(...)`

If any unexpected throw escapes data layer, page render fails and user may receive generic error page.

**Why this matches reports:** intermittent production backend/network failures can happen occasionally and affect random users.

---

## 2) Root layout i18n load is unguarded
**File:** `src/app/layout.tsx`

`getMessages()` is awaited without a local guard. If locale/messages resolution fails at runtime, it can crash root render for that request.

---

## 3) Checkout address flow has many client components without local error boundary isolation
**Files:**
- `src/components/sections/CheckoutWrapper/CheckoutWrapper.tsx`
- `src/components/sections/CartAddressSection/CartAddressSection.tsx`
- `src/components/sections/CartShippingMethodsSection/CartShippingMethodsSection.tsx`
- `src/components/sections/CartPaymentSection/CartPaymentSection.tsx`
- `src/components/sections/CartReview/CartReview.tsx`
- `src/components/sections/CartReview/PaymentButton.tsx`

These components are complex and stateful (router/query params, context, async transitions). Most async submit handlers catch errors, but render-time/client runtime errors are not isolated by a checkout-level `error.tsx` boundary.

So a client render exception in this tree can present as generic production "Something went wrong".

---

## 4) Context guard throws are intentionally hard failures
**Files:**
- `src/components/context/CartContext.tsx` (`useCart` throws if provider missing)
- `src/components/sections/CheckoutWrapper/CheckoutWrapper.tsx` (`useTerms` throws if provider missing)

These are valid invariants, but any provider composition regression during navigation/hydration instantly becomes a runtime crash.

---

## 5) Checkout page server shell is guarded, but child client tree is not fully protected
**File:** `src/app/[locale]/(checkout)/checkout/page.tsx`

This page has server-side `try/catch` for loading cart/methods and returns custom fallback. Good.

However, once hydrated, failures inside checkout client tree are outside that server `try/catch` and rely on route error boundaries (currently missing at segment level).

---

## 6) Checkout complete page handles redirect errors, but not all client-side runtime faults elsewhere
**File:** `src/app/[locale]/(checkout)/checkout/complete/page.tsx`

This route catches checkout completion errors and redirects, but it does not solve generic boundary behavior for other checkout subtrees.

---

## 7) `not-found.tsx` is unrelated to this issue
`notFound()` only handles 404 flows. Reported generic page is 500/runtime boundary path, not 404.

---

## Mitigation plan (phased)

## Phase 1 (highest priority, low risk)
1. Add segment-level error boundaries:
   - `src/app/[locale]/(main)/error.tsx`
   - `src/app/[locale]/(checkout)/error.tsx`
2. Add `reset()` retry UI and structured `console.error` with:
   - route segment
   - pathname
   - digest (if present)
   - timestamp
3. Keep UX branded instead of default generic message.

Expected impact: users no longer see default blank/generic error for these segments.

## Phase 2 (homepage hardening)
1. Wrap top-level homepage fetch orchestration in guarded flow.
2. Fail soft: render partial homepage sections/fallback blocks when one data source fails.
3. Keep error logging with correlation ID.

Expected impact: transient backend issues degrade section content, not whole page.

## Phase 3 (checkout address-step hardening)
1. Add local client error boundary around checkout step column (`address/delivery/payment`).
2. Separate boundaries for:
   - address form block
   - shipping block
   - payment/review block
3. Ensure boundary fallback preserves cart context and offers recover action.

Expected impact: step-level failures won\'t collapse whole checkout.

## Phase 4 (observability)
1. Add centralized client error reporter (Sentry or API collector) for boundary-caught errors.
2. Include cart id, checkout step (`address|delivery|payment|review`), locale, user agent.
3. Add alerting threshold for recurring digests.

Expected impact: reproducible diagnostics for intermittent production-only failures.

---

## Recommended execution order
1. Phase 1 immediately
2. Phase 2 homepage
3. Phase 3 checkout step isolation
4. Phase 4 telemetry

---

## Notes
- This report intentionally focuses on investigation and mitigation planning only.
- Update (same day): **Phase 1 implemented** by adding segment boundaries:
  - `src/app/[locale]/(main)/error.tsx`
  - `src/app/[locale]/(checkout)/error.tsx`
- Both boundaries include retry (`reset()`), route-specific fallback UX, and structured `console.error` telemetry payload (`segment`, `pathname`, `digest`, `message`, `timestamp`).
- Update (same day): **Phase 2 implemented** in `src/app/[locale]/(main)/page.tsx`:
  - guarded newest/smart product pool orchestration,
  - fallback strategy to avoid full homepage failure when one source fails,
  - structured logs with `requestId`, `locale`, and error context.
- Update (next day): **Phase 3 implemented** with step-level checkout isolation:
  - `src/components/molecules/CheckoutStepErrorBoundary/CheckoutStepErrorBoundary.tsx`
  - `src/components/sections/CheckoutWrapper/CheckoutWrapper.tsx`
  - Address, delivery, payment, and review surfaces are wrapped separately so client runtime errors are isolated per step instead of collapsing the whole checkout tree.
- Update (next day): **Phase 4 baseline implemented** (centralized client boundary reporter):
  - `src/lib/telemetry/client-error-reporter.ts`
  - `src/app/api/client-errors/route.ts`
  - Segment boundaries (`src/app/[locale]/(main)/error.tsx`, `src/app/[locale]/(checkout)/error.tsx`) now report through the centralized reporter.
- Validation run after implementation:
  - `npm run type-check` (pass)
  - `npm run lint` (pass; existing project warnings remain, no new errors introduced by Phase 1-4 files)
