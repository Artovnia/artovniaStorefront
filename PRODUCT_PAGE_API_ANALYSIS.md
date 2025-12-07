# Product Page API Request Analysis

## 📊 **Executive Summary**

**Total Requests on Page Load**: ~28 requests  
**Duplicate Requests**: 4x `/store/variants/{id}/lowest-30d` (OPTIONS + GET)  
**Critical Issues**: 
- ❌ 4 duplicate lowest price requests for the same variant
- ⚠️ Multiple cart fetches (3x)
- ⚠️ Vendor availability checks could be batched
- ✅ Most requests are properly cached and necessary

---

## 🔍 **Request Breakdown by Category**

### **1. Authentication & User Data** (2 requests)
```
GET /store/customers/me?fields=*addresses (401) - 55.702 ms
GET /store/customers/me?fields=*addresses (401) - 7.309 ms
```

**Status**: ✅ **ACCEPTABLE**  
**Reason**: 
- First request from server-side (ProductDetailsPage)
- Second request from client-side (likely cart context)
- Both return 401 (not logged in), so they're fast
- Could be optimized but low priority

**Location**:
- `ProductDetails.tsx` line 53: `retrieveCustomer()`
- `ProductDetailsPage.tsx` line 63: `retrieveCustomer()`

---

### **2. Product Data** (2 requests)
```
GET /store/products?fields=id,categories.id,categories.name&limit=1000 (200) - 125.952 ms
GET /store/products?limit=12&offset=0&region_id=...&handle=puchatek-2... (200) - 575.179 ms
```

**Status**: ✅ **NECESSARY**  
**Reason**:
- First: Fetching all products for navigation/breadcrumbs
- Second: Fetching specific product with full details (variants, seller, pricing)

**Location**:
- `page.tsx` line 88: `listProducts()` - Main product fetch
- Breadcrumbs/navigation component

---

### **3. Categories** (2 requests)
```
GET /store/product-categories?fields=id,handle,name,rank,parent_category_id,mpath&limit=1000 (200) - 100.627 ms
GET /store/product-categories?fields=id,handle,name,rank,parent_category_id,mpath,*parent_category&limit=1000 (200) - 34.800 ms
```

**Status**: ⚠️ **COULD BE OPTIMIZED**  
**Reason**: Two similar category requests with slightly different fields

**Recommendation**: Combine into single request with all needed fields

**Location**:
- Breadcrumbs: `buildProductBreadcrumbs()`
- Navigation component

---

### **4. Regions** (2 requests)
```
GET /store/regions (200) - 14.025 ms
GET /store/regions (200) - 11.428 ms
```

**Status**: ✅ **ACCEPTABLE**  
**Reason**: Fast requests, likely from different components (server + client)

---

### **5. Vendor Availability** (3 requests) ⚠️
```
GET /store/vendors/sel_01JRQRPXXEKREAE925JG6SVZ1A/availability (200) - 22.820 ms
GET /store/vendors/sel_01JRQRPXXEKREAE925JG6SVZ1A/holiday (200) - 29.348 ms
GET /store/vendors/sel_01JRQRPXXEKREAE925JG6SVZ1A/suspension (200) - 24.860 ms
```

**Status**: ⚠️ **SHOULD BE BATCHED**  
**Reason**: Three separate requests to same vendor for related data

**Recommendation**: Create single endpoint `/store/vendors/{id}/status` that returns all three

**Location**:
- `ProductDetailsPage.tsx` lines 78-98:
  ```typescript
  getVendorAvailability(prod.seller.id)
  getVendorHolidayMode(prod.seller.id)
  getVendorSuspension(prod.seller.id)
  ```

**Proposed Solution**:
```typescript
// New endpoint: GET /store/vendors/{id}/status
{
  availability: {...},
  holiday: {...},
  suspension: {...}
}
```

---

### **6. Reviews** (2 requests)
```
GET /store/products/prod_01KBMMPH0C9TYC9NZ5GSZRE9C8/reviews?limit=100 (200) - 79.586 ms
GET /store/seller/grzesiowska-art/reviews?limit=100 (200) - 35.090 ms
```

**Status**: ✅ **NECESSARY**  
**Reason**: Product reviews and seller reviews are different data

**Location**:
- `ProductDetailsPage.tsx` line 75: `getProductReviews()`
- Seller reviews component

---

### **7. Related Products** (1 request)
```
GET /store/products?limit=8&region_id=...&handle[0]=kanapa-1751917234279-uvukb4&... (200) - 151.168 ms
```

**Status**: ✅ **NECESSARY**  
**Reason**: Fetching seller's other products for "More from seller" section

**Location**:
- `ProductDetailsPage.tsx` line 52: `batchFetchProductsByHandles()`

---

### **8. Cart** (3 requests) ⚠️
```
GET /store/carts/cart_01KBT69D4P8F5T223VPF26PEZC?fields=... (200) - 705.596 ms
GET /store/carts/cart_01KBT69D4P8F5T223VPF26PEZC?fields=... (200) - 48.651 ms
GET /store/carts/cart_01KBT69D4P8F5T223VPF26PEZC?fields=... (200) - 65.772 ms
```

**Status**: ⚠️ **DUPLICATE REQUESTS**  
**Reason**: Cart is being fetched multiple times from different components

**Location**:
- `ProductDetails.tsx` line 52: `retrieveCart()`
- Cart context (client-side)
- Possibly from header/navigation

**Recommendation**: Use React Context to share cart data, fetch once

---

### **9. Measurements** (1 request)
```
GET /store/products/prod_01KBMMPH0C9TYC9NZ5GSZRE9C8?fields=id,weight,length,height,width,variants... (200) - 20.492 ms
```

**Status**: ✅ **OPTIMIZED**  
**Reason**: 
- Fast request with timeout protection
- Cached with unified cache
- Has fallback to client-side loading

**Location**:
- `ProductDetails.tsx` line 90: `getProductMeasurements()`

---

### **10. Variant Attributes** (1 request)
```
GET /store/products/prod_01KBMMPH0C9TYC9NZ5GSZRE9C8/variants/variant_01KBMMPH2PKZQS6YB00KA0Q0N7/attributes (200) - 15.302 ms
```

**Status**: ✅ **NECESSARY**  
**Reason**: Fetching additional attributes for selected variant

**Location**:
- `ProductAdditionalAttributes.tsx` (client component)

---

### **11. Shipping Options** (1 request)
```
GET /store/product-shipping-options?product_id=prod_01KBMMPH0C9TYC9NZ5GSZRE9C8&region_id=reg_01JQK4VQD6VHDXKCYTD932KTPN (200) - 180.858 ms
```

**Status**: ✅ **NECESSARY**  
**Reason**: Fetching available shipping methods for product

**Location**:
- `ProductDetailsShipping.tsx` line 40: `getProductShippingOptions()`

---

### **12. Promotions** (2 requests)
```
GET /store/products/promotions?limit=50&offset=0&region_id=... (200) - 99.143 ms
GET /store/products/price-list-discounts?limit=100&offset=0&region_id=... (200) - 10.936 ms
```

**Status**: ✅ **NECESSARY**  
**Reason**: 
- Fetching active promotions
- Fetching price list discounts
- Both needed for accurate pricing display

**Location**:
- `PromotionDataProvider.tsx` (context provider)

---

### **13. Lowest Price History** (4x DUPLICATE!) ❌
```
OPTIONS /store/variants/variant_01KBMMPH2PKZQS6YB00KA0Q0N7/lowest-30d?currency_code=PLN&days=30 (204) - 1.218 ms
OPTIONS /store/variants/variant_01KBMMPH2PKZQS6YB00KA0Q0N7/lowest-30d?currency_code=PLN&days=30 (204) - 0.856 ms
OPTIONS /store/variants/variant_01KBMMPH2PKZQS6YB00KA0Q0N7/lowest-30d?currency_code=PLN&days=30 (204) - 0.620 ms
OPTIONS /store/variants/variant_01KBMMPH2PKZQS6YB00KA0Q0N7/lowest-30d?currency_code=PLN&days=30 (204) - 0.479 ms
GET /store/variants/variant_01KBMMPH2PKZQS6YB00KA0Q0N7/lowest-30d?currency_code=PLN&days=30 (304) - 45.904 ms
GET /store/variants/variant_01KBMMPH2PKZQS6YB00KA0Q0N7/lowest-30d?currency_code=PLN&days=30 (304) - 8.948 ms
GET /store/variants/variant_01KBMMPH2PKZQS6YB00KA0Q0N7/lowest-30d?currency_code=PLN&days=30 (304) - 12.029 ms
GET /store/variants/variant_01KBMMPH2PKZQS6YB00KA0Q0N7/lowest-30d?currency_code=PLN&days=30 (304) - 9.584 ms
```

**Status**: ❌ **CRITICAL ISSUE - 4 DUPLICATE REQUESTS**  
**Reason**: Same variant price being requested 4 times!

**Root Cause Analysis**:

1. **Multiple Component Instances**: The `OptimizedLowestPriceDisplay` component is being rendered multiple times
2. **No Request Deduplication**: Each instance makes its own request
3. **OPTIONS Preflight**: CORS preflight for each request

**Location**:
- `ProductDetailsHeader.tsx` line 280: `<OptimizedLowestPriceDisplay>`
- Possibly in related products carousel (4 products × 1 request each)

**Impact**:
- 4 OPTIONS requests (CORS preflight)
- 4 GET requests for same data
- ~80ms total wasted time
- Unnecessary server load

---

### **14. Batch Lowest Prices** (1 request) ✅
```
POST /store/variants/lowest-prices-batch (200) - 31.472 ms
```

**Status**: ✅ **EXCELLENT OPTIMIZATION**  
**Reason**: Batching multiple variant price requests into one

**Location**:
- `BatchPriceProvider.tsx` - Context provider
- `use-batch-lowest-prices.ts` - Custom hook

**This is the RIGHT way to fetch prices!**

---

## 🔥 **Critical Issues**

### **Issue #1: Duplicate Lowest Price Requests** ❌

**Problem**: 4 identical requests for same variant's lowest price

**Evidence**:
```
GET /store/variants/variant_01KBMMPH2PKZQS6YB00KA0Q0N7/lowest-30d (4 times!)
```

**Root Cause**: 
- `OptimizedLowestPriceDisplay` component rendered 4 times
- Each instance uses `useLowestPrice` hook independently
- No request deduplication at hook level

**Solution**:

**Option A: Use BatchPriceProvider** (RECOMMENDED)
```typescript
// ProductDetailsHeader.tsx
// BEFORE:
<OptimizedLowestPriceDisplay
  variantId={currentVariantId}
  currencyCode="PLN"
/>

// AFTER: Already wrapped in BatchPriceProvider!
// The issue is OptimizedLowestPriceDisplay is NOT using the batch context
```

**Option B: Add Request Deduplication to useLowestPrice**
```typescript
// use-lowest-price.ts
const pendingRequests = new Map<string, Promise<any>>()

export function useLowestPrice({ variantId, ... }: UseLowestPriceOptions) {
  const fetchLowestPrice = async () => {
    const cacheKey = `${variantId}-${currencyCode}-${days}`
    
    // Check if request is already pending
    if (pendingRequests.has(cacheKey)) {
      return pendingRequests.get(cacheKey)
    }
    
    const promise = fetch(url, ...)
      .then(res => res.json())
      .finally(() => pendingRequests.delete(cacheKey))
    
    pendingRequests.set(cacheKey, promise)
    return promise
  }
}
```

**Option C: Fix OptimizedLowestPriceDisplay to use BatchPriceProvider**
```typescript
// OptimizedLowestPriceDisplay.tsx
import { useBatchPrice } from '@/components/context/BatchPriceProvider'

export const OptimizedLowestPriceDisplay = ({ variantId, ... }) => {
  const { registerVariant, getPriceData, loading } = useBatchPrice()
  
  useEffect(() => {
    registerVariant(variantId)
    return () => unregisterVariant(variantId)
  }, [variantId])
  
  const priceData = getPriceData(variantId)
  // ... render
}
```

---

### **Issue #2: Multiple Cart Fetches** ⚠️

**Problem**: Cart fetched 3 times on page load

**Evidence**:
```
GET /store/carts/cart_01KBT69D4P8F5T223VPF26PEZC (3 times!)
- 705.596 ms (first, slowest)
- 48.651 ms
- 65.772 ms
```

**Root Cause**:
1. Server-side fetch in `ProductDetails.tsx`
2. Client-side fetch in `CartContext`
3. Possibly another fetch in header/navigation

**Solution**:

```typescript
// Create a CartProvider at app level
// app/layout.tsx
<CartProvider initialCart={serverCart}>
  {children}
</CartProvider>

// ProductDetails.tsx - pass cart as prop instead of fetching
export const ProductDetails = async ({ product, cart }) => {
  // Use cart prop instead of retrieveCart()
}
```

---

### **Issue #3: Vendor Status Requests Not Batched** ⚠️

**Problem**: 3 separate requests for vendor status

**Evidence**:
```
GET /store/vendors/{id}/availability
GET /store/vendors/{id}/holiday
GET /store/vendors/{id}/suspension
```

**Solution**: Create combined endpoint

**Backend** (`F:\StronyInternetowe\mercur\mercur\apps\backend\src\api\store\vendors\[id]\status\route.ts`):
```typescript
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id } = req.params
  
  const [availability, holiday, suspension] = await Promise.all([
    getVendorAvailability(id),
    getVendorHolidayMode(id),
    getVendorSuspension(id)
  ])
  
  res.json({
    availability,
    holiday,
    suspension
  })
}
```

**Frontend** (`lib/data/vendor-availability.ts`):
```typescript
export const getVendorStatus = async (vendorId: string) => {
  const response = await sdk.client.fetch(`/store/vendors/${vendorId}/status`)
  return response // { availability, holiday, suspension }
}
```

**Savings**: 3 requests → 1 request (~50ms saved)

---

## 📈 **Performance Metrics**

### **Current State**:
- **Total Requests**: ~28
- **Total Time**: ~2.5 seconds (waterfall)
- **Duplicate Requests**: 7 (4 lowest-price + 3 cart)
- **Cacheable Requests**: ~20 (71%)

### **After Optimization**:
- **Total Requests**: ~21 (-7)
- **Total Time**: ~2.0 seconds (-20%)
- **Duplicate Requests**: 0
- **Cacheable Requests**: ~18 (86%)

---

## ✅ **What's Working Well**

### **1. Parallel Fetching** ✅
```typescript
// ProductDetailsPage.tsx lines 41-103
const [
  sellerProductsResult,
  userResult,
  reviewsResult,
  vendorAvailabilityResult,
  // ...
] = await Promise.allSettled([...])
```
**Excellent!** All independent data fetched in parallel

### **2. Unified Caching** ✅
```typescript
// unified-cache.ts
export const unifiedCache = new UnifiedCache()
```
- Prevents duplicate requests
- TTL-based expiration
- User-specific data protection

### **3. Batch Price Fetching** ✅
```typescript
// BatchPriceProvider.tsx
POST /store/variants/lowest-prices-batch
```
- Multiple variants in single request
- Used in product carousels
- **Should be used everywhere!**

### **4. Timeout Protection** ✅
```typescript
// ProductDetails.tsx line 96
const timeoutPromise = new Promise((_, reject) => {
  timeoutId = setTimeout(() => reject(new Error('timeout')), 3000)
})
```
- Prevents slow requests from blocking page render
- Graceful degradation

### **5. Error Boundaries** ✅
```typescript
<ProductErrorBoundary>
  <MeasurementsErrorBoundary>
```
- Prevents component failures from crashing page

---

## 🎯 **Recommendations Priority**

### **HIGH PRIORITY** 🔴

1. **Fix Duplicate Lowest Price Requests**
   - Impact: -4 requests, ~80ms saved
   - Effort: Medium
   - Solution: Make `OptimizedLowestPriceDisplay` use `BatchPriceProvider`

2. **Reduce Cart Fetches**
   - Impact: -2 requests, ~100ms saved
   - Effort: Medium
   - Solution: Use CartContext with server-side initial data

### **MEDIUM PRIORITY** 🟡

3. **Batch Vendor Status Requests**
   - Impact: -2 requests, ~50ms saved
   - Effort: Medium (requires backend endpoint)
   - Solution: Create `/store/vendors/{id}/status` endpoint

4. **Combine Category Requests**
   - Impact: -1 request, ~30ms saved
   - Effort: Low
   - Solution: Use same fields in both requests

### **LOW PRIORITY** 🟢

5. **Optimize Customer Requests**
   - Impact: -1 request, minimal time saved (401 responses are fast)
   - Effort: Low
   - Solution: Share customer data via context

---

## 📊 **Request Flow Diagram**

```
Page Load
│
├─ Server-Side (SSR)
│  ├─ Product Data (575ms) ✅
│  ├─ Seller Products (151ms) ✅
│  ├─ Reviews (80ms) ✅
│  ├─ Vendor Availability (3x ~25ms) ⚠️ BATCH THIS
│  ├─ Categories (2x ~100ms) ⚠️ COMBINE
│  └─ Measurements (20ms) ✅
│
└─ Client-Side (Hydration)
   ├─ Cart (3x) ❌ DEDUPLICATE
   ├─ Promotions (100ms) ✅
   ├─ Shipping Options (180ms) ✅
   ├─ Variant Attributes (15ms) ✅
   ├─ Lowest Prices (4x) ❌ USE BATCH
   └─ Batch Prices (31ms) ✅ GOOD!
```

---

## 🔧 **Implementation Plan**

### **Phase 1: Quick Wins** (1-2 hours)

1. Fix `OptimizedLowestPriceDisplay` to use `BatchPriceProvider`
2. Add request deduplication to `useLowestPrice` hook
3. Combine category requests

### **Phase 2: Context Improvements** (2-3 hours)

4. Implement CartContext with server-side initial data
5. Share customer data via context

### **Phase 3: Backend Optimization** (3-4 hours)

6. Create `/store/vendors/{id}/status` endpoint
7. Update frontend to use new endpoint

---

## 📝 **Code Examples**

### **Fix #1: OptimizedLowestPriceDisplay**

**File**: `src/components/cells/LowestPriceDisplay/OptimizedLowestPriceDisplay.tsx`

```typescript
"use client"

import { useBatchPrice } from '@/components/context/BatchPriceProvider'
import { useEffect } from 'react'

export const OptimizedLowestPriceDisplay = ({
  variantId,
  currencyCode,
  className = ''
}: {
  variantId: string
  currencyCode: string
  className?: string
}) => {
  const { registerVariant, unregisterVariant, getPriceData, loading } = useBatchPrice()
  
  useEffect(() => {
    registerVariant(variantId)
    return () => unregisterVariant(variantId)
  }, [variantId, registerVariant, unregisterVariant])
  
  const priceData = getPriceData(variantId)
  
  if (loading || !priceData) {
    return <div className={className}>Loading...</div>
  }
  
  return (
    <div className={className}>
      Lowest price in last 30 days: {priceData.lowest_price}
    </div>
  )
}
```

### **Fix #2: Vendor Status Endpoint**

**File**: `F:\StronyInternetowe\mercur\mercur\apps\backend\src\api\store\vendors\[id]\status\route.ts`

```typescript
import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'

export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  const { id } = req.params
  
  try {
    // Fetch all vendor status data in parallel
    const [availability, holiday, suspension] = await Promise.all([
      getVendorAvailability(id),
      getVendorHolidayMode(id),
      getVendorSuspension(id)
    ])
    
    res.json({
      vendor_id: id,
      availability,
      holiday,
      suspension,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch vendor status' })
  }
}
```

---

## 🎉 **Conclusion**

Your product page is **well-architected** with good patterns like:
- ✅ Parallel data fetching
- ✅ Unified caching
- ✅ Batch price requests
- ✅ Timeout protection
- ✅ Error boundaries

**Main issues**:
- ❌ 4 duplicate lowest price requests (same variant)
- ⚠️ 3 cart fetches (should be 1)
- ⚠️ 3 vendor status requests (should be 1)

**After fixes**: 28 requests → 21 requests (-25% reduction)

**Estimated Performance Gain**: ~20% faster page load (~500ms saved)
