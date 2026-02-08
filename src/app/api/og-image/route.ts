import { NextRequest, NextResponse } from "next/server"

/**
 * OG Image Proxy API Route
 * 
 * PURPOSE: Facebook Messenger's link preview renderer does not support WebP images.
 * All product images on S3 are stored as WebP (converted by the backend's S3 file service).
 * This route fetches the WebP image from S3 and converts it to JPEG on-the-fly.
 * 
 * USAGE: Set og:image to /api/og-image?url=<S3_URL>
 * 
 * CACHING: Response is cached by Vercel CDN for 30 days (immutable content).
 * The URL includes the source image URL as a query param, so different images = different cache keys.
 * 
 * SECURITY: Only allows fetching from whitelisted S3/CDN domains to prevent abuse.
 */

// Whitelisted domains that we allow fetching images from
const ALLOWED_DOMAINS = [
  "artovnia-medusa.s3.eu-north-1.amazonaws.com",
  "mercur-connect.s3.eu-central-1.amazonaws.com",
  "medusa-public-images.s3.eu-west-1.amazonaws.com",
  "cdn.sanity.io",
]

// OG image constraints
// Max dimension on either axis — preserves original aspect ratio
// Product images are often square or portrait, so we don't force landscape
const OG_MAX_SIZE = 1200
const OG_QUALITY = 80

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const imageUrl = searchParams.get("url")

  if (!imageUrl) {
    return new NextResponse("Missing 'url' parameter", { status: 400 })
  }

  // Validate URL
  let parsedUrl: URL
  try {
    parsedUrl = new URL(imageUrl)
  } catch {
    return new NextResponse("Invalid URL", { status: 400 })
  }

  // Security: only allow whitelisted domains
  if (!ALLOWED_DOMAINS.includes(parsedUrl.hostname)) {
    return new NextResponse("Domain not allowed", { status: 403 })
  }

  try {
    // Fetch the original image from S3
    const imageResponse = await fetch(imageUrl, {
      headers: {
        "Accept": "image/*",
      },
      // Cache the fetch on the server side too
      next: { revalidate: 86400 }, // 1 day
    })

    if (!imageResponse.ok) {
      console.error(`[og-image] Failed to fetch image: ${imageResponse.status} ${imageUrl}`)
      return new NextResponse("Failed to fetch image", { status: 502 })
    }

    const contentType = imageResponse.headers.get("content-type") || ""
    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer())

    // If the image is already JPEG/PNG, serve it directly (no conversion needed)
    if (contentType.includes("jpeg") || contentType.includes("jpg") || contentType.includes("png")) {
      return new NextResponse(new Uint8Array(imageBuffer), {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=2592000, s-maxage=2592000, stale-while-revalidate=86400",
          "CDN-Cache-Control": "public, max-age=2592000",
        },
      })
    }

    // Convert WebP (or any other format) to JPEG using sharp
    // sharp is listed in serverExternalPackages (not bundled by webpack)
    // and available at runtime via Next.js's bundled copy on Vercel
    try {
      const sharp = (await import("sharp")).default

      const jpegBuffer = await sharp(imageBuffer, {
        failOnError: false,
        limitInputPixels: false,
      })
        .resize(OG_MAX_SIZE, OG_MAX_SIZE, {
          fit: "inside",
          withoutEnlargement: true,
        })
        .jpeg({
          quality: OG_QUALITY,
          progressive: true, // Progressive JPEG loads faster for crawlers
        })
        .toBuffer()

      return new NextResponse(new Uint8Array(jpegBuffer), {
        status: 200,
        headers: {
          "Content-Type": "image/jpeg",
          // Cache for 30 days on CDN — images don't change once uploaded
          "Cache-Control": "public, max-age=2592000, s-maxage=2592000, stale-while-revalidate=86400",
          "CDN-Cache-Control": "public, max-age=2592000",
        },
      })
    } catch (sharpError) {
      // Fallback: if sharp is unavailable, redirect to Next.js image optimizer
      // which handles WebP→JPEG conversion natively
      console.warn("[og-image] sharp unavailable, falling back to /_next/image:", sharpError)
      const nextImageUrl = new URL("/_next/image", request.nextUrl.origin)
      nextImageUrl.searchParams.set("url", imageUrl)
      nextImageUrl.searchParams.set("w", String(OG_MAX_SIZE))
      nextImageUrl.searchParams.set("q", String(OG_QUALITY))
      return NextResponse.redirect(nextImageUrl, {
        status: 302,
        headers: {
          "Cache-Control": "public, max-age=2592000, s-maxage=2592000, stale-while-revalidate=86400",
        },
      })
    }
  } catch (error) {
    console.error("[og-image] Error processing image:", error)
    return new NextResponse("Error processing image", { status: 500 })
  }
}
