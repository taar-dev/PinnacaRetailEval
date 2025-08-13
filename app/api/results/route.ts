import { NextResponse } from "next/server"

const FLASK_BASE_URL = process.env.FLASK_BASE_URL || "http://localhost:5000"

export async function GET() {
  try {
    // Forward the request to your Flask backend
    const response = await fetch(`${FLASK_BASE_URL}/get-results`)

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`)
    }

    const results = await response.json()
    return NextResponse.json(results)
  } catch (error) {
    console.error("Error fetching results:", error)
    return NextResponse.json({ error: "Failed to fetch results" }, { status: 500 })
  }
}
