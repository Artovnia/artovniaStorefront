import { NextRequest, NextResponse } from "next/server"

/**
 * IndexNow API Route — Push URLs to Bing/Yandex/other search engines instantly.
 *
 * Usage:
 *   POST /api/indexnow
 *   Body: { "urls": ["https://artovnia.com/products/my-product"] }
 *   Headers: { "x-api-key": "<INDEXNOW_API_SECRET>" }
 *
 * This is called:
 * 1. Manually via a script to bulk-submit unindexed URLs
 * 2. (Future) Automatically when products are created/updated via webhook
 *
 * IndexNow protocol: https://www.indexnow.org/documentation
 * Supported by: Bing, Yandex, Seznam, Naver
 * NOT supported by: Google (Google uses its own Indexing API)
 */

const INDEXNOW_KEY = process.env.INDEXNOW_KEY || "9d98375c285e4bbc9a9155f7ee550d82"
const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow"
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://artovnia.com"
const API_SECRET = process.env.INDEXNOW_API_SECRET || ""

export async function POST(request: NextRequest) {
  // Verify API secret to prevent unauthorized submissions
  const apiKey = request.headers.get("x-api-key")
  if (!API_SECRET || apiKey !== API_SECRET) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  try {
    const body = await request.json()
    const urls: string[] = body.urls

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { error: "Missing or empty 'urls' array in request body" },
        { status: 400 }
      )
    }

    // IndexNow accepts up to 10,000 URLs per request
    if (urls.length > 10000) {
      return NextResponse.json(
        { error: "Maximum 10,000 URLs per request" },
        { status: 400 }
      )
    }

    // Validate all URLs belong to our domain
    const invalidUrls = urls.filter(
      (url) => !url.startsWith(BASE_URL) && !url.startsWith(BASE_URL.replace("https://", "https://www."))
    )
    if (invalidUrls.length > 0) {
      return NextResponse.json(
        { error: "All URLs must belong to the site domain", invalidUrls },
        { status: 400 }
      )
    }

    // Submit to IndexNow
    const response = await fetch(INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: new URL(BASE_URL).hostname,
        key: INDEXNOW_KEY,
        keyLocation: `${BASE_URL}/${INDEXNOW_KEY}.txt`,
        // Key file must exist at this URL: https://artovnia.com/9d98375c285e4bbc9a9155f7ee550d82.txt
        urlList: urls,
      }),
    })

    // IndexNow returns 200 or 202 on success
    if (response.ok || response.status === 202) {
      return NextResponse.json({
        success: true,
        submitted: urls.length,
        status: response.status,
      })
    }

    const errorText = await response.text().catch(() => "Unknown error")
    console.error(`❌ IndexNow submission failed: ${response.status}`, errorText)

    return NextResponse.json(
      {
        error: "IndexNow submission failed",
        status: response.status,
        details: errorText,
      },
      { status: 502 }
    )
  } catch (error) {
    console.error("❌ IndexNow API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
