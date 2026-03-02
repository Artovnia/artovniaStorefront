import { revalidateTag, revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

const REVALIDATION_DEBUG_ENDPOINT_ENABLED = process.env.REVALIDATION_DEBUG_ENDPOINT_ENABLED === 'true'

type RevalidationDebugStats = {
  totalRequests: number
  tagOnlyRequests: number
  pathOnlyRequests: number
  mixedRequests: number
  totalTagsRevalidated: number
  totalPathsRevalidated: number
  lastTriggerReason: string | null
  lastRequestAt: string | null
  lastTagsCount: number
  lastPathsCount: number
}

type RevalidatePayload = {
  secret?: unknown
  tag?: unknown
  path?: unknown
  tags?: unknown
  paths?: unknown
  triggerReason?: unknown
}

const revalidationDebugStats: RevalidationDebugStats = {
  totalRequests: 0,
  tagOnlyRequests: 0,
  pathOnlyRequests: 0,
  mixedRequests: 0,
  totalTagsRevalidated: 0,
  totalPathsRevalidated: 0,
  lastTriggerReason: null,
  lastRequestAt: null,
  lastTagsCount: 0,
  lastPathsCount: 0,
}

function normalizeStringArray(input: unknown): string[] {
  if (!Array.isArray(input)) {
    return []
  }

  return input
    .filter((value): value is string => typeof value === 'string')
    .map((value) => value.trim())
    .filter(Boolean)
}

function updateRevalidationDebugStats(tagsCount: number, pathsCount: number, triggerReason: string): void {
  revalidationDebugStats.totalRequests += 1
  revalidationDebugStats.totalTagsRevalidated += tagsCount
  revalidationDebugStats.totalPathsRevalidated += pathsCount
  revalidationDebugStats.lastTagsCount = tagsCount
  revalidationDebugStats.lastPathsCount = pathsCount
  revalidationDebugStats.lastTriggerReason = triggerReason
  revalidationDebugStats.lastRequestAt = new Date().toISOString()

  if (tagsCount > 0 && pathsCount > 0) {
    revalidationDebugStats.mixedRequests += 1
  } else if (tagsCount > 0) {
    revalidationDebugStats.tagOnlyRequests += 1
  } else if (pathsCount > 0) {
    revalidationDebugStats.pathOnlyRequests += 1
  }
}

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
    const expectedSecret = process.env.REVALIDATION_SECRET

    if (!expectedSecret) {
      console.error('[Revalidation] REVALIDATION_SECRET not configured')
      return NextResponse.json(
        { message: 'Revalidation not configured' },
        { status: 500 }
      )
    }

    let payload: RevalidatePayload = {}
    const contentType = request.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      payload = await request.json().catch(() => ({}))
    }

    const secretFromPayload = typeof payload.secret === 'string' ? payload.secret : null
    const secretFromHeader = request.headers.get('x-revalidation-secret')
    const secretFromQuery = request.nextUrl.searchParams.get('secret')
    const resolvedSecret = secretFromPayload || secretFromHeader || secretFromQuery

    if (resolvedSecret !== expectedSecret) {
      console.warn('[Revalidation] Invalid secret provided')
      return NextResponse.json(
        { message: 'Invalid secret' },
        { status: 401 }
      )
    }

    const queryTag = request.nextUrl.searchParams.get('tag')
    const queryPath = request.nextUrl.searchParams.get('path')

    const payloadTag = typeof payload.tag === 'string' ? payload.tag.trim() : ''
    const payloadPath = typeof payload.path === 'string' ? payload.path.trim() : ''
    const tagsFromPayload = normalizeStringArray(payload.tags)
    const pathsFromPayload = normalizeStringArray(payload.paths)

    const tags = Array.from(
      new Set([
        ...tagsFromPayload,
        ...(payloadTag ? [payloadTag] : []),
        ...(queryTag ? [queryTag.trim()] : []),
      ].filter(Boolean))
    )

    const paths = Array.from(
      new Set([
        ...pathsFromPayload,
        ...(payloadPath ? [payloadPath] : []),
        ...(queryPath ? [queryPath.trim()] : []),
      ].filter(Boolean))
    )

    if (tags.length === 0 && paths.length === 0) {
      return NextResponse.json(
        { message: 'At least one tag or path is required' },
        { status: 400 }
      )
    }

    for (const tag of tags) {
      console.log(`[Revalidation] Revalidating tag: ${tag}`)
      revalidateTag(tag)
    }

    for (const path of paths) {
      console.log(`[Revalidation] Revalidating path: ${path}`)
      revalidatePath(path)
    }

    const triggerReason =
      typeof payload.triggerReason === 'string' && payload.triggerReason.trim().length > 0
        ? payload.triggerReason.trim()
        : 'unknown'

    updateRevalidationDebugStats(tags.length, paths.length, triggerReason)

    console.info('[Revalidation] Batch request processed', {
      triggerReason,
      tagsCount: tags.length,
      pathsCount: paths.length,
      tags,
      paths,
    })

    return NextResponse.json({
      revalidated: true,
      tagsRevalidated: tags,
      pathsRevalidated: paths,
      triggerReason,
      timestamp: new Date().toISOString(),
    })
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
export async function GET(request: NextRequest) {
  const wantsStats = request.nextUrl.searchParams.get('stats') === '1'

  if (wantsStats) {
    if (!REVALIDATION_DEBUG_ENDPOINT_ENABLED) {
      return NextResponse.json(
        { message: 'Revalidation debug endpoint is disabled' },
        { status: 404 }
      )
    }

    const expectedSecret = process.env.REVALIDATION_SECRET
    const providedSecret =
      request.headers.get('x-revalidation-secret') ||
      request.nextUrl.searchParams.get('secret')

    if (!expectedSecret || providedSecret !== expectedSecret) {
      return NextResponse.json(
        { message: 'Invalid secret' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      status: 'ok',
      debugEnabled: REVALIDATION_DEBUG_ENDPOINT_ENABLED,
      stats: revalidationDebugStats,
      timestamp: new Date().toISOString(),
    })
  }

  return NextResponse.json({
    status: 'ok',
    message: 'Revalidation API is running',
    configured: !!process.env.REVALIDATION_SECRET,
    debugEndpointEnabled: REVALIDATION_DEBUG_ENDPOINT_ENABLED,
  })
}
