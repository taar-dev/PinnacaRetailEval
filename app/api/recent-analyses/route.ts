import { NextResponse } from "next/server"

const FLASK_BASE_URL = process.env.FLASK_BASE_URL || "http://localhost:5000"

export async function GET() {
  try {
    const response = await fetch(`${FLASK_BASE_URL}/api/recent-analyses`)

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`)
    }

    const analyses = await response.json()
    return NextResponse.json(analyses)
  } catch (error) {
    console.error("Error fetching recent analyses:", error)
    return NextResponse.json([])
  }
}
