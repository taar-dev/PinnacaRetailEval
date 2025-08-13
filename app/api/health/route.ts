import { NextResponse } from "next/server"

const FLASK_BASE_URL = process.env.FLASK_BASE_URL || "http://localhost:5000"

export async function GET() {
  try {
    const response = await fetch(`${FLASK_BASE_URL}/health`)

    if (!response.ok) {
      throw new Error(`Flask backend returned ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json({
      status: "connected",
      flask: data,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Health check failed:", error)
    return NextResponse.json(
      {
        status: "disconnected",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
