# Region Selector Implementation - Medusa Marketplace

## Overview

This document describes the correct implementation of region selection in the Artovnia storefront, aligned with Medusa.js architecture principles.

## Problem Analysis

### Previous Implementation Issues:
1. **Hardcoded countries**: Only 5 countries (pl, de, cz, sk, at) were hardcoded in the selector
2. **Wrong mapping**: Tried to map country codes directly to regions
3. **404 errors**: Redirected to `/{countryCode}{currentPath}` which doesn't exist
4. **401 errors**: Customer endpoint failed due to improper region setup

### Root Cause:
The implementation didn't follow Medusa's region-based architecture. According to Medusa AI:
- **Regions are the primary concept**, not individual countries
- Each region has multiple countries assigned to it
- The storefront should select a **region**, not a country
- The cart's region determines which countries are available at checkout

## Backend Configuration

You have 4 regions configured in Medusa Admin:
1. **Polska** - Poland only
2. **EU** - Most EU countries (excluding Poland)
3. **USA** - United States
4. **Canada** - Canada

All regions use **PLN currency** (as configured).

## Solution Architecture

### 1. Region Selector Component (`CountrySelector.tsx`)

**Key Changes:**
- Receives `regions` array from backend (not hardcoded)
- Works with `regionId` instead of country codes
- Maps region names to display info (flags, translated names)
- Calls `updateCartRegion(regionId)` instead of redirecting

**Region Display Mapping:**
```typescript
const displayMap = {
  'Polska': { flag: '🇵🇱' },
  'EU': { flag: '🇪🇺', displayName: 'Europa' },
  'USA': { flag: '🇺🇸', displayName: 'Stany Zjednoczone' },
  'Canada': { flag: '🇨🇦', displayName: 'Kanada' }
}
```

### 2. Server Wrapper (`CountrySelectorWrapper.tsx`)

**Responsibilities:**
- Fetches all regions from backend via `listRegions()`
- Detects current region from cart via `retrieveCart()`
- Passes data to client component
- Returns `null` if no regions available

**Data Flow:**
```
Backend Regions → listRegions() → CountrySelectorWrapper → CountrySelector
Cart Region → retrieveCart() → currentRegionId → CountrySelector
```

### 3. Cart Region Update (`cart.ts`)

**New Function: `updateCartRegion(regionId: string)`**

This function:
1. Gets current cart ID
2. If cart exists: Updates cart's region via `updateCart({ region_id: regionId })`
3. If no cart: Creates new cart with selected region via `sdk.store.cart.create()`
4. Revalidates caches (cart, regions, products)
5. **Does NOT redirect** (avoids 404 errors)

**Key Difference from Old Implementation:**
- ❌ Old: `updateRegion(countryCode, path)` → redirected to `/{countryCode}{path}` → 404
- ✅ New: `updateCartRegion(regionId)` → updates cart → refreshes page → works!

## How It Works

### User Flow:

1. **User opens site**
   - `CountrySelectorWrapper` fetches regions from backend
   - Detects current region from cart (if exists)
   - Defaults to first region (Polska) if no cart

2. **User clicks region selector**
   - Dropdown shows all 4 regions with flags and names
   - Current region is highlighted

3. **User selects different region (e.g., EU)**
   - `handleRegionChange(regionId)` is called
   - `updateCartRegion(regionId)` updates or creates cart
   - Page refreshes with new region
   - Cart now has `region_id` set to EU region

4. **User proceeds to checkout**
   - Address form shows countries from selected region
   - If EU region: Shows all EU countries (except Poland)
   - If Polska region: Shows only Poland
   - Currency is PLN for all regions (as configured)

### Technical Flow:

```
User selects region
    ↓
handleRegionChange(regionId)
    ↓
updateCartRegion(regionId)
    ↓
Cart exists? → Yes → updateCart({ region_id })
           → No  → sdk.store.cart.create({ region_id })
    ↓
Revalidate caches
    ↓
router.refresh()
    ↓
Page reloads with new region
```

## Files Modified

### 1. `CountrySelector.tsx`
- Removed hardcoded countries
- Added `regions` and `currentRegionId` props
- Implemented `getRegionDisplay()` for mapping
- Changed to `handleRegionChange()` with region IDs

### 2. `CountrySelectorWrapper.tsx`
- Fetches regions via `listRegions()`
- Detects current region from cart
- Passes data to client component

### 3. `cart.ts`
- Added `updateCartRegion(regionId)` function
- Marked old `updateRegion()` as deprecated
- Handles both cart update and creation
- No redirects (avoids 404)

## Benefits of This Approach

### ✅ Correct Medusa Architecture
- Works with regions (not countries) as primary concept
- Cart's region determines available countries at checkout
- Follows Medusa's multi-region design

### ✅ No 404 Errors
- Doesn't redirect to country-specific URLs
- Uses region IDs internally
- Page refresh updates state without navigation

### ✅ No 401 Errors
- Cart is properly created/updated with region
- Customer endpoint works because cart has valid region
- Region determines currency and available countries

### ✅ Dynamic Configuration
- Fetches regions from backend (not hardcoded)
- Admin can add/remove regions without code changes
- Supports any number of regions

### ✅ Better UX
- Shows all configured regions automatically
- Clear visual feedback (flags, names)
- Smooth region switching without navigation

## Testing Checklist

### Basic Functionality:
- [ ] Region selector appears in header
- [ ] Shows all 4 regions (Polska, EU, USA, Canada)
- [ ] Current region is highlighted
- [ ] Can switch between regions

### Cart Behavior:
- [ ] Selecting region creates cart if none exists
- [ ] Selecting region updates existing cart
- [ ] Cart has correct `region_id` after selection
- [ ] No 404 errors when switching regions

### Checkout Flow:
- [ ] Address form shows correct countries for selected region
- [ ] Polska region: Only Poland available
- [ ] EU region: All EU countries (except Poland) available
- [ ] USA region: United States available
- [ ] Canada region: Canada available

### Edge Cases:
- [ ] Works when no cart exists (first visit)
- [ ] Works when cart already exists
- [ ] Works for authenticated users
- [ ] Works for guest users
- [ ] Handles backend errors gracefully

## Currency Considerations

### Current Setup:
- All regions use **PLN currency**
- This is valid in Medusa (regions can use any currency)
- Payment providers will handle currency as PLN

### If You Want Multi-Currency:
According to Medusa AI, you would need to:
1. Add EUR, USD, CAD as store currencies in Admin
2. Create separate regions for each currency
3. Provide prices in each currency for all products
4. **Note**: Medusa doesn't have built-in currency conversion
5. You'd need to implement custom pricing logic or use external APIs

### Recommendation:
Keep PLN for all regions initially. Banks/payment providers will handle currency conversion if needed. This simplifies pricing and avoids the need to maintain multiple price lists.

## Troubleshooting

### Issue: Region selector doesn't appear
**Solution**: Check backend logs - regions might not be fetching correctly

### Issue: 404 error when selecting region
**Solution**: Make sure you're using `updateCartRegion()` not old `updateRegion()`

### Issue: Countries not showing at checkout
**Solution**: Verify regions have countries assigned in Medusa Admin

### Issue: Cart not updating
**Solution**: Check browser console for errors in `updateCartRegion()`

## Next Steps

1. **Test the implementation** with all 4 regions
2. **Verify checkout flow** for each region
3. **Monitor backend logs** for any errors
4. **Consider adding region persistence** in localStorage for better UX
5. **Add analytics** to track region selection patterns

## References

- Medusa Regions Documentation: https://docs.medusajs.com/resources/commerce-modules/region
- Multi-Region Setup: https://docs.medusajs.com/resources/recipes/multi-region-store
- Storefront API: https://docs.medusajs.com/api/store#regions
