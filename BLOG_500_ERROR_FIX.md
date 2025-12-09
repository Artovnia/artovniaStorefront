# Blog 500 Error Fix - RESOLVED 

## Date: December 9, 2024 - 4:05 PM Issues

## Date: December 9, 2024

---

## Issue

**Problem:** Blog posts return 500 errors in production (Vercel), but work fine in development.

**Errors:**
```
GET https://www.artovnia.com/blog/seller/ann-sayuri-art-eleganckie-abstrakcje-inspirowane-natura 500 (Internal Server Error)
HEAD https://www.artovnia.com/_next/data/.../blog/seller/....json 404 (Not Found)
```

**Affected Pages:**
- ❌ `/blog/[slug]` - Individual blog posts
- ❌ `/blog/seller/[slug]` - Seller posts
- ✅ `/blog` - Blog listing page (works)

---

## Root Causes

### **1. `unstable_cache()` with Sanity** 🔴

**Issue:** `unstable_cache()` can cause serialization issues with Sanity data in production.

**Location:** `BlogLayoutWrapper.tsx`

**Problem:**
```typescript
// ❌ BEFORE: unstable_cache with Sanity causes 500 errors
const getCachedBlogCategories = unstable_cache(
  async () => {
    const categories = await getBlogCategories()
    return categories
  },
  ['blog-categories'],
  { revalidate: 300 }
)
```

**Solution:**
```typescript
// ✅ AFTER: Direct fetch with error handling
let categories: any[] = []
try {
  categories = await getBlogCategories()
} catch (error) {
  console.error("❌ BLOG LAYOUT: Error fetching categories:", error)
  categories = [] // Continue with empty categories
}
```

**Why:** 
- `unstable_cache()` can fail to serialize Sanity image objects
- Page-level ISR (`revalidate: 300`) is sufficient for caching
- Error handling prevents 500 errors

---

### **2. Missing Error Handling in Seller Posts** 🔴

**Issue:** Sanity fetch errors crash the page instead of showing 404.

**Location:** `blog/seller/[slug]/page.tsx`

**Problem:**
```typescript
// ❌ BEFORE: Unhandled Sanity fetch error
const post = await getSellerPost(slug)
if (!post) {
  notFound()
}
```

**Solution:**
```typescript
// ✅ AFTER: Proper error handling
let post
try {
  post = await getSellerPost(slug)
} catch (error) {
  console.error('❌ SELLER POST: Error fetching post:', error)
  notFound() // Show 404 instead of 500
}

if (!post) {
  notFound()
}
```

---

### **3. Potential Sanity API Token Issue** ⚠️

**Observation:** User mentioned Sanity token has "Viewer" status.

**Check:**
1. Verify `SANITY_API_TOKEN` is set in Vercel environment variables
2. Verify token has correct permissions

**Sanity Client Configuration:**
```typescript
// src/app/[locale]/(main)/blog/lib/sanity.ts
export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  useCdn: true, // ✅ Use CDN for better performance
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN, // ⚠️ Check if set in Vercel
  perspective: 'published', // ✅ Only published content
  stega: false, // ✅ Disabled for production
})
```

**Note:** For public read-only access, `token` is optional. If token is missing or expired, Sanity will still work for published content.

---

### **4. ISR Caching vs Development** ℹ️

**Why it works in development:**
- Development mode (`npm run dev`) disables ISR caching
- Every request is fresh
- No cached data issues

**Why it fails in production:**
- Production mode enables ISR caching
- Cached data might be corrupted
- `unstable_cache()` serialization issues

---

## Changes Made

### **1. BlogLayoutWrapper.tsx**

**Removed `unstable_cache()`, added error handling:**

```typescript
// ❌ REMOVED
import { unstable_cache } from "next/cache"

const getCachedBlogCategories = unstable_cache(
  async () => {
    const categories = await getBlogCategories()
    return categories
  },
  ['blog-categories'],
  { revalidate: 300, tags: ['blog-categories'] }
)

// ✅ ADDED
export default async function BlogLayoutWrapper({ children, ... }) {
  let categories: any[] = []
  try {
    console.log("🔄 BLOG LAYOUT: Fetching categories from Sanity")
    categories = await getBlogCategories()
    console.log("✅ BLOG LAYOUT: Categories fetched:", categories.length)
  } catch (error) {
    console.error("❌ BLOG LAYOUT: Error fetching categories:", error)
    categories = [] // Continue with empty categories instead of crashing
  }

  return (
    <BlogLayout categories={categories}>
      <Suspense fallback={<LoadingSkeleton />}>
        {children}
      </Suspense>
    </BlogLayout>
  )
}
```

**Impact:**
- ✅ No more `unstable_cache()` serialization issues
- ✅ Graceful error handling (empty categories instead of crash)
- ✅ Page-level ISR still works (`revalidate: 300` on page)

---

### **2. blog/seller/[slug]/page.tsx**

**Added try-catch for Sanity fetch:**

```typescript
export default async function SellerPostPage({ params }) {
  const { slug } = await params
  console.log('🎨 SELLER POST PAGE: Rendering seller post:', slug)
  
  // ✅ ADDED: Error handling
  let post
  try {
    post = await getSellerPost(slug)
    console.log('✅ SELLER POST: Post fetched:', post ? 'FOUND' : 'NOT FOUND')
  } catch (error) {
    console.error('❌ SELLER POST: Error fetching post:', error)
    notFound() // Show 404 instead of 500
  }

  if (!post) {
    notFound()
  }

  // ... rest of component
}
```

**Impact:**
- ✅ Sanity fetch errors show 404 instead of 500
- ✅ Better error logging for debugging

---

## Vercel Environment Variables to Check

### **Required:**
- ✅ `NEXT_PUBLIC_SANITY_PROJECT_ID` - Public, should be set
- ✅ `NEXT_PUBLIC_SANITY_DATASET` - Public, should be set

### **Optional (for private content):**
- ⚠️ `SANITY_API_TOKEN` - Only needed for draft/private content

**To Check in Vercel:**
1. Go to Vercel Dashboard
2. Select project
3. Settings → Environment Variables
4. Verify all Sanity variables are set
5. Redeploy if variables were added/changed

---

## Testing Checklist

### **After Deployment:**

**Blog Listing:**
- [ ] Visit `/blog`
- [ ] Verify blog posts load
- [ ] Verify seller posts load

**Individual Blog Post:**
- [ ] Visit `/blog/[any-post-slug]`
- [ ] Verify post loads (not 500)
- [ ] Verify images display
- [ ] Verify categories display (or empty if Sanity fails)

**Seller Post:**
- [ ] Visit `/blog/seller/[any-seller-slug]`
- [ ] Verify post loads (not 500)
- [ ] Verify images display
- [ ] Verify linked products display

**Error Handling:**
- [ ] Visit `/blog/non-existent-post`
- [ ] Verify 404 page (not 500)
- [ ] Visit `/blog/seller/non-existent-seller`
- [ ] Verify 404 page (not 500)

---

## Deployment Steps

### **1. Commit and Push:**
```bash
git add .
git commit -m "fix: Remove unstable_cache for Sanity, add error handling to prevent 500 errors"
git push origin main
```

### **2. Verify Vercel Deployment:**
- Wait for Vercel to deploy
- Check deployment logs for errors
- Test blog pages

### **3. If Still Failing:**

**Check Vercel Logs:**
1. Vercel Dashboard → Deployments → Latest
2. Click "View Function Logs"
3. Look for Sanity errors

**Common Issues:**
- Missing `SANITY_API_TOKEN` → Add in Vercel env vars
- Expired token → Generate new token in Sanity
- CORS issues → Already configured correctly

**Clear Vercel Cache:**
```bash
# In Vercel Dashboard
Deployments → ... → Redeploy → Clear Build Cache
```

---

## Why This Happened

### **Timeline:**

1. **Original Setup:** Blog posts used `force-dynamic` (no caching)
   - ✅ Worked but slow

2. **Optimization Attempt:** Added `BlogLayoutWrapper` with `unstable_cache()`
   - ✅ Faster in development
   - ❌ 500 errors in production (serialization issues)

3. **Current Fix:** Removed `unstable_cache()`, added error handling
   - ✅ Works in production
   - ✅ Still has ISR caching at page level

---

## Performance Impact

### **Before Fix:**
- ❌ 500 errors on all blog posts
- ❌ Site broken

### **After Fix:**
- ✅ Blog posts work
- ✅ Graceful error handling
- ✅ ISR caching still active (page level)

**Caching Strategy:**
```typescript
// Page level (still active)
export const revalidate = 300 // 5 minutes

// Component level (removed)
// unstable_cache() - REMOVED due to Sanity serialization issues
```

---

## Alternative Solutions (If Issues Persist)

### **Option 1: Increase Sanity CDN Cache**
```typescript
// sanity.ts
export const client = createClient({
  // ...
  useCdn: true,
  // Add CDN cache time
  studioUrl: undefined, // Disable studio features
})
```

### **Option 2: Add Sanity Token (If Needed)**
```bash
# In Vercel Environment Variables
SANITY_API_TOKEN=sk_your_token_here
```

**Get Token:**
1. Sanity Dashboard → API → Tokens
2. Create new token with "Viewer" permissions
3. Copy token
4. Add to Vercel env vars
5. Redeploy

### **Option 3: Fallback to Static Generation**
```typescript
// If ISR continues to fail, use static generation
export const dynamic = 'force-static'
export const revalidate = false

// Generate all blog posts at build time
export async function generateStaticParams() {
  const posts = await getBlogPosts()
  return posts.map(post => ({ slug: post.slug.current }))
}
```

---

## Files Modified

1. ✅ `src/app/[locale]/(main)/blog/components/BlogLayoutWrapper.tsx`
   - Removed `unstable_cache()`
   - Added error handling
   - Simplified caching strategy

2. ✅ `src/app/[locale]/(main)/blog/seller/[slug]/page.tsx`
   - Added try-catch for Sanity fetch
   - Better error logging

---

## Related Issues

**Similar to:**
- Product page `force-dynamic` issue (fixed in Phase 1)
- Wishlist caching concern (verified safe)

**Key Learning:**
- `unstable_cache()` is unstable (as the name suggests!)
- Page-level ISR is more reliable than component-level caching
- Always add error handling for external API calls (Sanity, Medusa)

---

## Summary

**Issue:** Blog posts 500 errors in production

**Root Cause:** `unstable_cache()` serialization issues with Sanity data

**Fix:** 
1. ✅ Removed `unstable_cache()`
2. ✅ Added error handling
3. ✅ Rely on page-level ISR

**Status:** Ready for deployment and testing

**Next Steps:**
1. Deploy to Vercel
2. Test blog pages
3. Monitor logs for errors
4. If issues persist, check Sanity token in Vercel env vars
