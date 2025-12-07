# Country Selector Region Change Fix

## 🐛 **Problem**

After optimizing cart requests, changing the region in CountrySelector stopped updating the UI immediately. User had to manually refresh the page.

### **Symptoms**:
```
1. User selects different region (e.g., Poland → EU)
2. Backend requests are made:
   - POST /store/carts/{id} (updates cart region) ✅
   - GET /store/regions ✅
3. But UI doesn't update ❌
4. User must manually refresh page to see changes
```

---

## 🔍 **Root Cause**

After converting `CountrySelectorWrapper` to use `CartContext`, the component flow changed:

### **Before (Working)**:
```typescript
// CountrySelectorWrapper was a server component
export async function CountrySelectorWrapper() {
  const cart = await retrieveCart() // Fresh cart from server
  return <CountrySelector currentRegionId={cart?.region_id} />
}

// CountrySelector
const handleRegionChange = async (regionId: string) => {
  await updateCartRegion(regionId)
  router.refresh() // ✅ Refreshes server component → new cart fetched
}
```

### **After (Broken)**:
```typescript
// CountrySelectorWrapper is now a client component
export function CountrySelectorWrapper() {
  const { cart } = useCart() // Cart from CartContext
  return <CountrySelector currentRegionId={cart?.region_id} />
}

// CountrySelector
const handleRegionChange = async (regionId: string) => {
  await updateCartRegion(regionId) // Updates cart on server
  router.refresh() // ❌ Only refreshes server components, NOT CartContext!
}
```

**The Problem**:
- `updateCartRegion()` updates the cart on the server
- `router.refresh()` refreshes server components
- But `CartContext` still has the old cart in memory
- `CountrySelectorWrapper` shows old region because it uses stale `cart` from `useCart()`

---

## ✅ **Solution**

Pass `refreshCart()` from CartContext to CountrySelector, so it can update the cart after changing region.

### **Flow**:
```
1. User selects new region
2. updateCartRegion(regionId) → Updates cart on server
3. onRegionChanged() → Refreshes CartContext (fetches updated cart)
4. router.refresh() → Refreshes server components (updates prices, etc.)
5. UI updates with new region ✅
```

---

## 📝 **Changes Made**

### **1. CountrySelectorWrapper** - Pass refreshCart callback

```typescript
// F:\StronyInternetowe\mercur\ArtovniaStorefront\src\components\cells\CountrySelector\CountrySelectorWrapper.tsx

export function CountrySelectorWrapper({ regions }: CountrySelectorWrapperProps) {
  const { cart, refreshCart } = useCart() // ✅ Get refreshCart from context
  
  const currentRegionId = cart?.region_id
  
  // ✅ Pass refreshCart to CountrySelector
  return (
    <CountrySelector 
      regions={regions} 
      currentRegionId={currentRegionId}
      onRegionChanged={refreshCart} // ✅ Pass callback
    />
  )
}
```

---

### **2. CountrySelector** - Accept and use callback

```typescript
// F:\StronyInternetowe\mercur\ArtovniaStorefront\src\components\cells\CountrySelector\CountrySelector.tsx

interface CountrySelectorProps {
  regions: HttpTypes.StoreRegion[]
  currentRegionId?: string
  className?: string
  onRegionChanged?: () => Promise<void> // ✅ Add callback prop
}

export const CountrySelector = ({ 
  regions,
  currentRegionId,
  className,
  onRegionChanged // ✅ Accept callback
}: CountrySelectorProps) => {
  const handleRegionChange = async (regionId: string) => {
    setIsOpen(false)
    
    startTransition(async () => {
      try {
        // 1. Update cart region on server
        const { updateCartRegion } = await import('@/lib/data/cart')
        await updateCartRegion(regionId)
        
        // 2. ✅ Refresh CartContext to get updated cart
        if (onRegionChanged) {
          await onRegionChanged()
        }
        
        // 3. ✅ Refresh server components to update prices
        router.refresh()
      } catch (error) {
        console.error('Error updating region:', error)
        router.refresh()
      }
    })
  }
  
  // ... rest of component
}
```

---

## 🔄 **Update Flow Diagram**

```
User Clicks Region
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│ handleRegionChange(regionId)                             │
└──────────────────────────────────────────────────────────┘
       │
       ├─ Step 1: updateCartRegion(regionId)
       │           │
       │           └─> POST /store/carts/{id}
       │               { region_id: "new_region_id" }
       │               ✅ Cart updated on server
       │
       ├─ Step 2: onRegionChanged() (refreshCart)
       │           │
       │           └─> GET /store/carts/{id}
       │               ✅ CartContext gets fresh cart
       │               ✅ cart.region_id = "new_region_id"
       │
       ├─ Step 3: router.refresh()
       │           │
       │           └─> Re-renders server components
       │               ✅ Prices recalculated with new region
       │               ✅ Product data updated
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│ UI Updates                                               │
├──────────────────────────────────────────────────────────┤
│ ✅ CountrySelector shows new flag                        │
│ ✅ Prices show in new currency                           │
│ ✅ Shipping options updated                              │
│ ✅ All components reflect new region                     │
└──────────────────────────────────────────────────────────┘
```

---

## 🧪 **Testing**

### **Test Steps**:
1. ✅ Go to product page
2. ✅ Click country selector
3. ✅ Select different region (e.g., Poland → EU)
4. ✅ Verify UI updates immediately:
   - Country selector shows new flag
   - Prices update to new currency
   - Shipping options update
   - No manual refresh needed

### **Expected Behavior**:
- ✅ Region changes immediately
- ✅ All prices recalculate
- ✅ Shipping options update
- ✅ No page refresh required
- ✅ Smooth transition with loading state

---

## 📊 **Network Requests**

### **When Changing Region**:
```
1. POST /store/carts/{id} (200) - Update cart region
2. GET /store/carts/{id} (200) - Refresh CartContext
3. GET /store/regions (200) - Server component refresh
4. (Other server component refreshes as needed)
```

**Total**: ~3-4 requests (acceptable for region change)

---

## 🎯 **Key Learnings**

### **1. CartContext is Client-Side State**
- CartContext holds cart in memory (client-side)
- When cart updates on server, CartContext doesn't know
- Must explicitly call `refreshCart()` to sync

### **2. router.refresh() Only Refreshes Server Components**
- Doesn't affect client-side React state
- Doesn't trigger CartContext to refetch
- Need both `refreshCart()` AND `router.refresh()`

### **3. Callback Pattern for State Synchronization**
```typescript
// Parent provides state update function
<ChildComponent onDataChanged={refreshData} />

// Child calls it after mutation
const handleMutation = async () => {
  await mutateData()
  await onDataChanged() // ✅ Sync parent state
}
```

---

## ✅ **Result**

Region changes now work correctly:
- ✅ Immediate UI update
- ✅ CartContext synced with server
- ✅ Server components refreshed
- ✅ All prices and data updated
- ✅ No manual refresh needed

The fix maintains the cart optimization (no duplicate requests) while ensuring proper state synchronization! 🎉
