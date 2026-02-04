# Product Page Image Optimization Guide

## Problem
Page loads instantly in production (SSR), but images appear after page loads, creating poor perceived performance.

## Root Causes
1. **No CDN** - Images served directly from S3 (eu-north-1) without edge caching
2. **Suboptimal Next.js Image Config** - Quality too high, missing optimizations
3. **Missing Critical Resource Hints** - No preload for LCP image
4. **Inefficient Loading Strategy** - All images treated equally

## Solution: Multi-Layer Optimization

### 1. Add CloudFront CDN (CRITICAL - Biggest Impact)

**Impact**: 60-80% faster image loading, especially for users far from eu-north-1

#### Setup CloudFront Distribution:
```bash
# AWS Console Steps:
1. CloudFront → Create Distribution
2. Origin Domain: artovnia-medusa.s3.eu-north-1.amazonaws.com
3. Origin Path: (leave empty)
4. Viewer Protocol Policy: Redirect HTTP to HTTPS
5. Allowed HTTP Methods: GET, HEAD, OPTIONS
6. Cache Policy: CachingOptimized
7. Compress Objects: Yes (automatic Brotli/Gzip)
8. Price Class: Use All Edge Locations (or Europe/US if budget-conscious)
```

#### Update next.config.ts:
```typescript
images: {
  formats: ['image/webp', 'image/avif'], // Add AVIF for better compression
  minimumCacheTTL: 31536000, // Keep 1 year
  dangerouslyAllowSVG: true,
  contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  deviceSizes: [640, 750, 828, 1080, 1200, 1920],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  
  // CRITICAL: Add CloudFront domain
  domains: ['d1234567890.cloudfront.net'], // Your CloudFront domain
  
  remotePatterns: [
    {
      protocol: "https",
      hostname: "d1234567890.cloudfront.net", // CloudFront
    },
    {
      protocol: "https",
      hostname: "artovnia-medusa.s3.eu-north-1.amazonaws.com", // Fallback
    },
    // ... other patterns
  ],
}
```

**Expected Result**: Images load 60-80% faster globally

---

### 2. Optimize Next.js Image Component Usage

#### A. ProductCarousel.tsx - Desktop Main Image

**Current (SLOW)**:
```typescript
<Image
  src={slides[selectedImageIndex].url}
  quality={90} // ❌ Too high
  priority={selectedImageIndex === 0} // ❌ Only first
  loading={selectedImageIndex === 0 ? "eager" : "lazy"}
  placeholder="blur"
  blurDataURL="data:image/jpeg..." // ❌ Same for all
/>
```

**Optimized (FAST)**:
```typescript
<Image
  src={slides[selectedImageIndex].url}
  quality={selectedImageIndex === 0 ? 85 : 75} // ✅ Reduced
  priority={selectedImageIndex === 0} // ✅ Keep
  loading={selectedImageIndex === 0 ? "eager" : "lazy"}
  fetchPriority={selectedImageIndex === 0 ? "high" : "auto"} // ✅ NEW
  placeholder="empty" // ✅ Faster than blur for subsequent images
  blurDataURL={selectedImageIndex === 0 ? "data:image/jpeg..." : undefined}
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, (max-width: 1440px) 50vw, 700px"
/>
```

#### B. ProductCarousel.tsx - Mobile Carousel

**Current (SLOW)**:
```typescript
<Image
  quality={index === 0 ? 85 : 75} // ✅ Good
  priority={index === 0} // ✅ Good
  loading={index === 0 ? "eager" : "lazy"} // ✅ Good
  placeholder="blur" // ❌ All images
/>
```

**Optimized (FAST)**:
```typescript
<Image
  quality={index === 0 ? 80 : 70} // ✅ Reduced further for mobile
  priority={index === 0}
  loading={index === 0 ? "eager" : "lazy"}
  fetchPriority={index === 0 ? "high" : "auto"} // ✅ NEW
  placeholder={index === 0 ? "blur" : "empty"} // ✅ Only first image
  blurDataURL={index === 0 ? "data:image/jpeg..." : undefined}
  sizes="(max-width: 640px) 100vw, (max-width: 768px) 90vw, 700px"
/>
```

#### C. Thumbnails - Aggressive Optimization

**Current**:
```typescript
<Image
  quality={60} // ✅ Good
  loading="lazy" // ✅ Good
/>
```

**Optimized**:
```typescript
<Image
  quality={50} // ✅ Lower for thumbnails
  loading="lazy"
  placeholder="empty" // ✅ No blur needed
  sizes="80px" // ✅ Exact size
/>
```

---

### 3. Add Preload Hints for LCP Image

**Impact**: 200-400ms faster LCP (Largest Contentful Paint)

#### Update page.tsx:

```typescript
// src/app/[locale]/(main)/products/[handle]/page.tsx

export default async function ProductPage({
  params,
}: {
  params: Promise<{ handle: string; locale: string }>
}) {
  const { handle, locale } = await params
  const region = await getRegion(locale)
  if (!region) return <div>Region not found</div>
  
  const product = await getCachedProduct(handle, region.id)
  if (!product) return <div>Product not found</div>

  // ✅ NEW: Get first image URL for preload
  const firstImageUrl = product.images?.[0]?.url

  return (
    <>
      {/* ✅ CRITICAL: Preload LCP image */}
      {firstImageUrl && (
        <link
          rel="preload"
          as="image"
          href={firstImageUrl}
          imageSrcSet={`
            /_next/image?url=${encodeURIComponent(firstImageUrl)}&w=640&q=80 640w,
            /_next/image?url=${encodeURIComponent(firstImageUrl)}&w=750&q=80 750w,
            /_next/image?url=${encodeURIComponent(firstImageUrl)}&w=828&q=80 828w,
            /_next/image?url=${encodeURIComponent(firstImageUrl)}&w=1080&q=85 1080w
          `}
          imageSizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 50vw"
          fetchPriority="high"
        />
      )}
      
      <main className="container">
        <ProductDetailsPage 
          handle={handle} 
          locale={locale} 
          product={product} 
          region={region} 
        />
      </main>
    </>
  )
}
```

---

### 4. Optimize S3 Bucket Configuration

#### Enable Transfer Acceleration (if not using CloudFront):
```bash
aws s3api put-bucket-accelerate-configuration \
  --bucket artovnia-medusa \
  --accelerate-configuration Status=Enabled
```

#### Set Optimal Cache Headers:
```bash
aws s3api put-object \
  --bucket artovnia-medusa \
  --key "your-image.webp" \
  --cache-control "public, max-age=31536000, immutable" \
  --content-type "image/webp"
```

---

### 5. Update next.config.ts - Complete Optimized Config

```typescript
images: {
  formats: ['image/avif', 'image/webp'], // ✅ AVIF first (better compression)
  minimumCacheTTL: 31536000,
  dangerouslyAllowSVG: true,
  contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  
  // ✅ Optimized device sizes for actual breakpoints
  deviceSizes: [640, 750, 828, 1080, 1200, 1920],
  
  // ✅ Optimized image sizes for thumbnails/icons
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  
  // ✅ Quality presets (Next.js will use these)
  // Default quality is 75, which is good
  // We override in components where needed
  
  loader: 'default',
  unoptimized: false,
  
  // ✅ Add CloudFront domain (CRITICAL)
  domains: ['d1234567890.cloudfront.net'], // Replace with your CloudFront domain
  
  remotePatterns: [
    {
      protocol: "https",
      hostname: "d1234567890.cloudfront.net", // CloudFront (primary)
    },
    {
      protocol: "https",
      hostname: "artovnia-medusa.s3.eu-north-1.amazonaws.com", // S3 (fallback)
    },
    // ... other patterns
  ],
}
```

---

### 6. Advanced: Responsive Image Optimization

#### Create Image URL Helper:

```typescript
// src/lib/helpers/image-optimization.ts

export const getOptimizedImageUrl = (
  url: string,
  options: {
    width?: number
    quality?: number
    format?: 'webp' | 'avif'
  } = {}
): string => {
  const { width, quality = 75, format = 'webp' } = options
  
  // If using CloudFront, replace S3 URL
  const cdnUrl = url.replace(
    'artovnia-medusa.s3.eu-north-1.amazonaws.com',
    'd1234567890.cloudfront.net' // Your CloudFront domain
  )
  
  // Next.js Image Optimization API
  const params = new URLSearchParams({
    url: cdnUrl,
    w: width?.toString() || '1200',
    q: quality.toString(),
  })
  
  return `/_next/image?${params.toString()}`
}

// Usage in components:
// <Image src={getOptimizedImageUrl(image.url, { width: 800, quality: 80 })} />
```

---

## Implementation Priority

### Phase 1: Quick Wins (1-2 hours)
1. ✅ Reduce image quality in ProductCarousel (85 → 75 for main, 60 → 50 for thumbnails)
2. ✅ Add `fetchPriority="high"` to first image
3. ✅ Change `placeholder="blur"` to `placeholder="empty"` for non-first images
4. ✅ Add preload hint in page.tsx

**Expected Impact**: 20-30% faster perceived load

### Phase 2: CDN Setup (2-4 hours)
1. ✅ Create CloudFront distribution
2. ✅ Update next.config.ts with CloudFront domain
3. ✅ Test image loading from CDN
4. ✅ Update S3 CORS if needed

**Expected Impact**: 60-80% faster image loading globally

### Phase 3: Advanced (Optional)
1. ✅ Enable AVIF format (better compression than WebP)
2. ✅ Implement responsive image helper
3. ✅ Add image dimension hints to prevent layout shift

**Expected Impact**: Additional 10-15% improvement

---

## Measuring Success

### Before Optimization:
- LCP (Largest Contentful Paint): ~2.5-3.5s
- Images appear: 1-2s after page load
- Total image load time: 3-5s

### After Phase 1:
- LCP: ~2.0-2.5s
- Images appear: 0.5-1s after page load
- Total image load time: 2-3s

### After Phase 2 (CDN):
- LCP: ~1.2-1.8s
- Images appear: Almost instant (0.2-0.5s)
- Total image load time: 1-2s

### Tools to Measure:
- Chrome DevTools → Performance tab
- Lighthouse (Core Web Vitals)
- WebPageTest.org
- Vercel Analytics (if enabled)

---

## Additional Vercel-Specific Optimizations

### 1. Enable Vercel Image Optimization (Already Active)
Your current setup uses Next.js Image Optimization, which is good.

### 2. Vercel Edge Network
Vercel automatically serves optimized images from their edge network, but adding CloudFront provides:
- Better global coverage
- Lower costs for high traffic
- More control over caching

### 3. Vercel Analytics
Enable to track actual user metrics:
```bash
npm install @vercel/analytics
```

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

---

## Cost Considerations

### CloudFront Pricing (Estimated):
- **Data Transfer**: ~$0.085/GB (first 10TB/month)
- **Requests**: ~$0.0075 per 10,000 requests
- **Estimated Monthly Cost**: $10-50 for typical e-commerce site

### Vercel Image Optimization:
- **Free Tier**: 1,000 optimizations
- **Pro**: $0.005 per optimization after free tier
- **Estimated Monthly Cost**: $5-20

**Total Additional Cost**: $15-70/month for significantly better performance

---

## Troubleshooting

### Images Still Slow After CDN?
1. Check CloudFront cache hit ratio (should be >90%)
2. Verify CORS headers on S3
3. Check CloudFront distribution status (deployed)
4. Clear browser cache and test

### Layout Shift Issues?
Add explicit dimensions:
```typescript
<Image
  src={url}
  width={700}
  height={700}
  // or
  fill
  className="object-cover"
/>
```

### AVIF Not Working?
Check browser support and ensure Next.js version ≥13.0

---

## Summary

**Immediate Actions** (Do Today):
1. Reduce image quality settings
2. Add fetchPriority="high" to first image
3. Add preload hint in page.tsx
4. Remove blur placeholder from non-first images

**This Week**:
1. Set up CloudFront CDN
2. Update next.config.ts with CloudFront domain
3. Test and measure improvements

**Expected Result**: Images load 70-80% faster, LCP improves from ~3s to ~1.5s
