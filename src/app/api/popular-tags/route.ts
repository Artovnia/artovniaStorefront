import { NextResponse } from 'next/server'
import { getPopularTags } from '@/lib/data/tags'

export async function GET() {
  try {
    const tags = await getPopularTags(20) // Get top 20 tags
    
    return NextResponse.json({
      tags,
      success: true,
    })
  } catch (error) {
    console.error('Error fetching popular tags:', error)
    return NextResponse.json(
      { error: 'Failed to fetch popular tags', success: false },
      { status: 500 }
    )
  }
}

// Cache for 1 hour
export const revalidate = 3600
