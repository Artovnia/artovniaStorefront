import { revalidateTag, revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

/**
 * On-Demand Revalidation API Route
 * Called by Medusa backend when products/categories are created/updated
 * 
 * Usage from backend:
 * POST /api/revalidate?secret=xxx&tag=products
 * POST /api/revalidate?secret=xxx&path=/products/product-handle
 */
export async function POST(request: NextRequest) {
  try {
    // Verify secret token
    const secret = request.nextUrl.searchParams.get('secret')
    const expectedSecret = process.env.REVALIDATION_SECRET
    
    if (!expectedSecret) {
      console.error('[Revalidation] REVALIDATION_SECRET not configured')
      return NextResponse.json(
        { message: 'Revalidation not configured' },
        { status: 500 }
      )
    }
    
    if (secret !== expectedSecret) {
      console.warn('[Revalidation] Invalid secret provided')
      return NextResponse.json(
        { message: 'Invalid secret' },
        { status: 401 }
      )
    }

    // Get revalidation parameters
    const tag = request.nextUrl.searchParams.get('tag')
    const path = request.nextUrl.searchParams.get('path')
    
    if (!tag && !path) {
      return NextResponse.json(
        { message: 'Either tag or path parameter is required' },
        { status: 400 }
      )
    }

    // Revalidate by tag (recommended for bulk updates)
    if (tag) {
      console.log(`[Revalidation] Revalidating tag: ${tag}`)
      revalidateTag(tag)
      
      return NextResponse.json({
        revalidated: true,
        type: 'tag',
        value: tag,
        timestamp: new Date().toISOString()
      })
    }

    // Revalidate by path (for specific pages)
    if (path) {
      console.log(`[Revalidation] Revalidating path: ${path}`)
      revalidatePath(path)
      
      return NextResponse.json({
        revalidated: true,
        type: 'path',
        value: path,
        timestamp: new Date().toISOString()
      })
    }

    return NextResponse.json(
      { message: 'No revalidation performed' },
      { status: 400 }
    )
  } catch (error) {
    console.error('[Revalidation] Error:', error)
    return NextResponse.json(
      { 
        message: 'Revalidation failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Revalidation API is running',
    configured: !!process.env.REVALIDATION_SECRET
  })
}
