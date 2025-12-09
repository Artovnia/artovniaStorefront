# Blog Seller Post Schema Update - Full URLs

## Date: December 9, 2024 - 5:35 PM

---

## ✅ CHANGES COMPLETED

Updated Sanity seller post schema to use **full URLs** instead of handles/IDs for better simplicity and reliability.

---

## 📝 SCHEMA CHANGES

### **1. Seller URL Field**

**Before:**
```typescript
sellerHandle: string  // e.g., "ann-sayuri-art"
```

**After:**
```typescript
sellerUrl: string  // e.g., "https://www.artovnia.com/sellers/ann-sayuri-art-anna-wawrzyniak"
```

### **2. Product URL Field**

**Before:**
```typescript
linkedProducts: Array<{
  productId: string        // Medusa product ID
  productHandle: string    // e.g., "stolik-pod-obraz-1747921701916-9falth"
  productName: string
  productImage?: any
}>
```

**After:**
```typescript
linkedProducts: Array<{
  productUrl: string       // e.g., "https://www.artovnia.com/products/stolik-pod-obraz-1747921701916-9falth"
  productName: string
  productImage?: any
}>
```

---

## 📂 FILES MODIFIED

### **1. Sanity Schema**
- ✅ `blog/schemas/sellerPost.ts`
  - Changed `sellerHandle` → `sellerUrl` (type: `url`)
  - Changed `productId` + `productHandle` → `productUrl` (type: `url`)
  - Added URL validation with `uri({ scheme: ['http', 'https'] })`
  - Added helpful placeholders

### **2. TypeScript Interfaces**
- ✅ `blog/lib/data.ts`
  - Updated `SellerPost` interface

### **3. Sanity Queries**
- ✅ `blog/lib/sanity.ts`
  - Updated `FEATURED_SELLER_POST_QUERY`
  - Updated `SELLER_POST_QUERY`
  - Updated `SELLER_POSTS_QUERY`

### **4. Components**
- ✅ `blog/seller/[slug]/page.tsx`
  - Replaced all `sellerHandle` references with `sellerUrl`
  - Replaced all `productHandle` references with `productUrl`
  - Updated structured data
  - Updated product links

- ✅ `DesignerOfTheWeekSection/DesignerOfTheWeekSection.tsx`
  - Updated mock data to use `sellerUrl`

---

## 🎯 BENEFITS

### **1. Simplicity**
- ❌ **Before:** Need to construct URLs from handles
- ✅ **After:** URLs are ready to use

### **2. Flexibility**
- ❌ **Before:** Tied to specific URL structure
- ✅ **After:** Can link to any URL (external products, different domains, etc.)

### **3. Reliability**
- ❌ **Before:** Handle changes break links
- ✅ **After:** Full URLs are stable

### **4. No Medusa Dependency**
- ❌ **Before:** Need Medusa product IDs and handles
- ✅ **After:** Just copy-paste product URLs from storefront

---

## 📋 MIGRATION STEPS FOR EXISTING DATA

### **In Sanity Studio:**

1. **Open each Seller Post**
2. **Update Seller URL:**
   - Old: `sellerHandle: "ann-sayuri-art"`
   - New: `sellerUrl: "https://www.artovnia.com/sellers/ann-sayuri-art-anna-wawrzyniak"`

3. **Update Product URLs:**
   - Old: `productHandle: "stolik-pod-obraz-1747921701916-9falth"`
   - New: `productUrl: "https://www.artovnia.com/products/stolik-pod-obraz-1747921701916-9falth"`

4. **Save and Publish**

---

## 🔄 SANITY UPDATES VISIBILITY

### **Why Updates Don't Show Immediately:**

With `force-dynamic`, there's **no caching**, so updates should appear immediately. If they don't:

1. **Check Sanity Studio:**
   - Ensure post is **Published** (not just saved as draft)
   - Check publish status in top-right corner

2. **Check Browser Cache:**
   - Hard refresh: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
   - Or open in incognito/private window

3. **Check Sanity API:**
   - Verify `SANITY_API_TOKEN` is set in Vercel
   - Check token has read permissions
   - Token should have "Viewer" or higher role

4. **Check Sanity Client Config:**
   ```typescript
   useCdn: true,           // ✅ Use CDN for better performance
   perspective: 'published', // ✅ Only published content
   ```

---

## 🐛 SELLER POST RENDERING ISSUES

### **Problem:** "Seller post loads terribly, seems like it rerenders whole page twice"

**Possible Causes:**

1. **Double Data Fetch:**
   - Check if `getSellerPost()` is called multiple times
   - Check if `BlogLayoutWrapper` fetches categories twice

2. **Layout Shift:**
   - Images loading without dimensions
   - Content jumping as it loads

3. **Hydration Mismatch:**
   - Check console for hydration warnings
   - Verify `suppressHydrationWarning` on date elements

**Debugging:**
- Check browser console for duplicate fetch logs
- Check Network tab for duplicate requests
- Look for React hydration warnings

---

## ✅ DEPLOYMENT

```bash
git add .
git commit -m "refactor: Update seller post schema to use full URLs"
git push origin main
```

**After Deployment:**
1. Update existing seller posts in Sanity Studio
2. Test seller post pages load correctly
3. Verify product links work
4. Verify seller store links work

---

## 📚 USAGE GUIDE

### **Creating New Seller Post:**

1. **In Sanity Studio:**
   - Title: "Poznaj Ann Sayuri ART"
   - Seller Name: "Ann Sayuri ART"
   - **Seller URL:** `https://www.artovnia.com/sellers/ann-sayuri-art-anna-wawrzyniak`
   - Add images and content

2. **Adding Products:**
   - Go to storefront
   - Copy product URL: `https://www.artovnia.com/products/product-handle`
   - Paste into **Product URL** field
   - Add product name and optional image

3. **Publish:**
   - Click "Publish" in top-right
   - Changes appear immediately (no caching with `force-dynamic`)

---

## ✅ STATUS: COMPLETE

All schema changes, queries, and components updated to use full URLs instead of handles/IDs.

**Next Steps:**
1. Deploy changes
2. Update existing posts in Sanity
3. Test seller post pages
4. Investigate rendering performance if issues persist
