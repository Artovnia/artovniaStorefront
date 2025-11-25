/**
 * Custom Image Loader for AWS S3 Images
 * 
 * This loader bypasses Next.js image optimization for S3 images to prevent timeout errors.
 * S3 images are already optimized and don't need additional processing.
 * 
 * Benefits:
 * - Eliminates 500 errors from Next.js image optimization timeouts
 * - Faster loading by serving images directly from S3
 * - Reduces server load by skipping unnecessary optimization
 * - S3 automatically serves WebP/AVIF when browser supports it
 */

export interface ImageLoaderProps {
  src: string
  width: number
  quality?: number
}

/**
 * Custom image loader that serves S3 images directly
 * Uses Next.js optimization for local/relative images
 */
export default function imageLoader({ src, width, quality }: ImageLoaderProps): string {
  // Check if image is from S3 (full URL with S3 domain)
  const isS3Image = src.startsWith('http') && (src.includes('s3.') || src.includes('amazonaws.com'))
  
  if (isS3Image) {
    // ✅ Serve S3 images directly without Next.js optimization
    // S3 already handles format conversion (WebP/AVIF) based on Accept headers
    return src
  }
  
  // For local/relative images, use Next.js default optimization
  // This handles: /Logo.svg, /products/image.png, etc.
  const params = new URLSearchParams()
  params.set('url', src)
  params.set('w', width.toString())
  if (quality) {
    params.set('q', quality.toString())
  }
  
  return `/_next/image?${params.toString()}`
}

/**
 * Helper function to check if an image should use direct loading
 */
export function shouldUseDirectLoading(src: string): boolean {
  return src.startsWith('http') && (src.includes('s3.') || src.includes('amazonaws.com'))
}

/**
 * Get optimized image URL for S3 images
 * This can be extended to add S3-specific transformations if needed
 */
export function getOptimizedS3Url(src: string, width?: number): string {
  // For now, return the original URL
  // In the future, you could add CloudFront transformations here
  return src
}
