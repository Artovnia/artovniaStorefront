import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit') || '20'
    const offset = searchParams.get('offset') || '0'
    const letter = searchParams.get('letter')
    const sortBy = searchParams.get('sortBy')

    // Build query parameters for backend
    const params = new URLSearchParams({
      limit,
      offset,
      fields: 'id,handle,name,description,logo_url,created_at'
    })

    if (letter) {
      params.append('letter', letter)
    }

    if (sortBy) {
      params.append('sortBy', sortBy)
    }

    // Make request to Medusa backend
    const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'
    const response = await fetch(`${backendUrl}/store/sellers?${params.toString()}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`)
    }

    const data = await response.json()

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching sellers:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch sellers',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
