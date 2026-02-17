import { NextRequest, NextResponse } from 'next/server'
import { batchFetchProductsByHandles } from '@/lib/data/products'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { handles } = body

    if (!handles || !Array.isArray(handles) || handles.length === 0) {
      return NextResponse.json(
        { error: 'Invalid handles array' },
        { status: 400 }
      )
    }

    // Limit to 12 products max to prevent abuse
    const limitedHandles = handles.slice(0, 12)

    // Fetch products using the existing batch fetch function
    const products = await batchFetchProductsByHandles({
      handles: limitedHandles,
      countryCode: 'pl', // Default to Poland
      limit: 12,
    })

    return NextResponse.json({ products })
  } catch (error) {
    console.error('Error fetching blog carousel products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}
