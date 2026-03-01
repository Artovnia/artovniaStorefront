import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)

    if (!body || typeof body !== "object") {
      return NextResponse.json({ message: "Invalid payload" }, { status: 400 })
    }

    const forwardedFor = request.headers.get("x-forwarded-for")
    const ip = forwardedFor?.split(",")[0]?.trim() || "unknown"

    console.error("[ClientErrorAPI] boundary-caught error", {
      ...body,
      ip,
      receivedAt: new Date().toISOString(),
    })

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("[ClientErrorAPI] Failed to process payload", {
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json({ message: "Failed to process payload" }, { status: 500 })
  }
}
