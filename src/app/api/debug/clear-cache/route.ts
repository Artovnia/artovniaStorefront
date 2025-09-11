import { clearAllCaches, getCacheStats } from "@/lib/utils/storefront-cache"
import { NextRequest, NextResponse } from 'next/server'

/**
 * Emergency cache clearing endpoint for debugging stuck states
 * Usage: GET /api/debug/clear-cache
 */
export async function GET(request: NextRequest) {
  try {
    // Get stats before clearing
    const statsBefore = getCacheStats()
    
    // Clear all caches
    clearAllCaches()
    
    // Get stats after clearing
    const statsAfter = getCacheStats()
    
    return NextResponse.json({
      success: true,
      message: 'All caches cleared successfully',
      before: statsBefore,
      after: statsAfter,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error clearing caches:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to clear caches',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * Get cache statistics without clearing
 * Usage: POST /api/debug/clear-cache (for stats only)
 */
export async function POST(request: NextRequest) {
  try {
    const stats = getCacheStats()
    
    return NextResponse.json({
      success: true,
      stats,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error getting cache stats:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get cache stats',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
