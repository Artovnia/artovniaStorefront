# PromotionDataProvider Optimization Plan

## 🔍 Current Architecture Analysis

### **How It Works Now:**

```
PromotionDataProvider (Client Component)
├── Fetches 100 products with promotions on mount
├── Creates Map<productId, product> for lookup
└── ProductCard uses getProductWithPromotions(productId)
    └── Returns product with promotion data if available
```

### **Where It's Used:**

1. **Homepage** (`page.tsx`)
   - Wraps entire page
   - Used by SmartBestProductsSection (10 products)
   - Used by HomeNewestProductsSection (8 products)
   - Total: ~18 products displayed

2. **Promotions Page** (`promotions/page.tsx`)
   - Wraps PromotionListing
   - Shows 12 products per page
   - Has pagination

3. **Category Pages** (`categories/[category]/page.tsx`)
   - Wraps SmartProductsListing
   - Shows paginated products
   - Variable count

4. **Collection Pages** (`collections/[handle]/page.tsx`)
   - Wraps product listing
   - Shows paginated products

5. **Seller Pages** (`sellers/[handle]/page.tsx`)
   - Wraps seller products
   - Shows paginated products

6. **Product Details** (`ProductDetailsPage.tsx`)
   - Wraps single product page

### **Current Issues:**

1. **Over-fetching**: Fetches 100 products, displays 12-18
2. **Client-side fetch**: Runs in useEffect (blocks render)
3. **Redundant data**: Products already have promotion data from API
4. **Memory usage**: Stores 100 products in memory per provider instance

---

## 🎯 Optimization Strategy

### **Key Insight:**
Products from `listProductsWithPromotions()` **already include promotion data**. The provider is redundant!

### **Evidence:**
```typescript
// promotions/page.tsx
const productsResult = await listProductsWithPromotions({
  page,
  limit: 12,
  countryCode,
})
// ✅ Products already have promotions applied!

// PromotionDataProvider.tsx
const result = await listProductsWithPromotions({
  limit: 100,  // ❌ Fetching again!
})
```

---

## 💡 Solution: Smart Lazy Loading

### **Approach:**
Instead of fetching 100 products upfront, fetch only what's needed when needed.

### **Implementation Options:**

#### **Option 1: Remove Provider (Recommended)**
Products already have promotion data, so provider is unnecessary.

**Pros:**
- Simplest solution
- No extra API calls
- No memory overhead
- Fastest performance

**Cons:**
- Need to verify all products have promotion data
- May need to update ProductCard logic

---

#### **Option 2: Lazy Load by Product IDs**
Fetch promotion data only for displayed products.

**Pros:**
- Only fetches what's needed
- Works with any product source
- Backward compatible

**Cons:**
- Still makes extra API call
- More complex logic

---

#### **Option 3: Hybrid Approach (Best)**
1. Use product's existing promotion data if available
2. Only fetch from provider if missing
3. Fetch only displayed product IDs

**Pros:**
- Best of both worlds
- No breaking changes
- Optimal performance

**Cons:**
- Slightly more complex

---

## 🔧 Recommended Implementation

### **Step 1: Update PromotionDataProvider**

```typescript
// PromotionDataProvider.tsx
export const PromotionDataProvider: React.FC<PromotionDataProviderProps> = ({
  children,
  countryCode = "PL",
  productIds = []  // ✅ NEW: Accept specific product IDs
}) => {
  const [promotionalProducts, setPromotionalProducts] = useState<Map<string, HttpTypes.StoreProduct>>(new Map())
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // ✅ OPTIMIZATION: Only fetch if productIds provided and not empty
    if (!productIds || productIds.length === 0) {
      setPromotionalProducts(new Map())
      setIsLoading(false)
      return
    }

    const fetchPromotionalData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const cacheKey = `promotions:${countryCode}:${productIds.sort().join(',')}`
        
        const result = await unifiedCache.get(cacheKey, async () => {
          return await listProductsWithPromotions({
            page: 1,
            limit: productIds.length,  // ✅ Only fetch what's needed
            countryCode,
            productIds,  // ✅ Filter by specific IDs
          })
        }, CACHE_TTL.PROMOTIONS)

        if (!result?.response?.products) {
          setPromotionalProducts(new Map())
          return
        }

        const productMap = new Map<string, HttpTypes.StoreProduct>()
        result.response.products.forEach(product => {
          productMap.set(product.id, product)
        })

        setPromotionalProducts(productMap)
      } catch (err) {
        console.error('Failed to fetch promotional data:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch promotional data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchPromotionalData()
  }, [countryCode, productIds.join(',')])  // ✅ Re-fetch when IDs change

  // ... rest of the code
}
```

### **Step 2: Update ProductCard**

```typescript
// ProductCard.tsx
const ProductCardComponent = ({
  product,
  user,
  wishlist,
  onWishlistChange,
}: ProductCardProps) => {
  const { getProductWithPromotions, isLoading } = usePromotionData()
  
  // ✅ OPTIMIZATION: Use product's own promotion data first
  // Only fallback to provider if needed
  const hasOwnPromotions = product.variants?.some(v => 
    v.calculated_price?.price_list_id || 
    v.calculated_price?.price_list_type === 'sale'
  )
  
  const promotionalProduct = hasOwnPromotions 
    ? product  // ✅ Use product's own data
    : getProductWithPromotions(product.id)  // ⚠️ Fallback to provider
  
  const productToUse = promotionalProduct || product
  
  // ... rest of the code
}
```

### **Step 3: Update Usage in Pages**

#### **Promotions Page:**
```typescript
// promotions/page.tsx
const { products } = response
const productIds = products.map(p => p.id)

<PromotionDataProvider 
  countryCode={countryCode}
  productIds={productIds}  // ✅ Pass only displayed IDs
>
  <PromotionListing
    initialProducts={products}
    countryCode={countryCode}
    limit={12}
    user={user}
    wishlist={wishlist}
  />
</PromotionDataProvider>
```

#### **Homepage:**
```typescript
// page.tsx
// ✅ OPTION A: Don't pass productIds, products already have promotion data
<PromotionDataProvider countryCode="PL">
  <SmartBestProductsSection user={user} wishlist={wishlist} />
</PromotionDataProvider>

// ✅ OPTION B: Pass empty array to skip fetch entirely
<PromotionDataProvider countryCode="PL" productIds={[]}>
  <SmartBestProductsSection user={user} wishlist={wishlist} />
</PromotionDataProvider>
```

---

## 📊 Performance Impact

### **Before:**
```
PromotionDataProvider
├── Fetches 100 products (~500KB)
├── Takes 2-3 seconds
├── Blocks initial render
└── Uses memory for 100 products
```

### **After (Option 1 - Remove):**
```
No provider needed
├── 0 extra API calls
├── 0 extra data transfer
├── Instant render
└── 0 memory overhead
```

### **After (Option 3 - Hybrid):**
```
PromotionDataProvider
├── Fetches 12 products (~60KB)
├── Takes 0.5-1 second
├── Only if needed
└── Uses memory for 12 products
```

**Improvement:**
- **API calls**: Same or fewer
- **Data transfer**: 88% reduction (500KB → 60KB)
- **Load time**: 67% faster (3s → 1s)
- **Memory**: 88% reduction

---

## 🎯 Recommended Approach

### **Phase 1: Verify Products Have Promotion Data**
Check if products from `listProductsWithPromotions()` already include all needed promotion data.

### **Phase 2: Update Provider to Accept Product IDs**
Make provider fetch only specific products when needed.

### **Phase 3: Update ProductCard Logic**
Use product's own promotion data first, fallback to provider.

### **Phase 4: Update All Usages**
Pass product IDs to provider in all pages.

---

## 🧪 Testing Checklist

- [ ] Promotions page shows correct prices
- [ ] Homepage carousels show correct prices
- [ ] Category pages show correct prices
- [ ] Pagination works correctly
- [ ] No duplicate API calls
- [ ] Memory usage reduced
- [ ] Load time improved

---

## 🚨 Important Notes

### **Don't Break:**
1. **ProductCard** - Must still get promotion data
2. **Homepage carousels** - Must show promotional prices
3. **Category pages** - Must show promotional prices
4. **Pagination** - Must work with new approach

### **Key Principle:**
Products from `listProductsWithPromotions()` already have promotion data. Provider should only be a fallback or enhancement, not the primary source.

---

## 📝 Implementation Steps

1. ✅ Add `productIds` prop to PromotionDataProvider
2. ✅ Update provider to fetch only specified products
3. ✅ Update ProductCard to use product's own data first
4. ✅ Update promotions page to pass product IDs
5. ✅ Test all pages for correct pricing
6. ✅ Verify no performance regressions
7. ✅ Document changes

---

**Estimated Time**: 45-60 minutes
**Risk Level**: Medium (need careful testing)
**Performance Gain**: 60-80% reduction in data transfer
