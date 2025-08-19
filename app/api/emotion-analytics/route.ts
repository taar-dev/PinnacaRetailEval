import { NextResponse } from "next/server"

export async function GET() {
  try {
    const flaskUrl = process.env.FLASK_BASE_URL || "http://localhost:5000"
    console.log("[v0] Attempting to fetch from Flask:", `${flaskUrl}/api/emotion-analytics`)

    const response = await fetch(`${flaskUrl}/api/emotion-analytics`)
    console.log("[v0] Flask response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.log("[v0] Flask error response:", errorText)
      throw new Error(`Flask API responded with status: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log("[v0] Successfully fetched emotion analytics data")
    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Error fetching emotion analytics:", error)
    if (error instanceof TypeError && error.message.includes("fetch")) {
      return NextResponse.json(
        {
          error: "Cannot connect to Flask backend. Is it running on port 5000?",
        },
        { status: 500 },
      )
    }
    return NextResponse.json({ error: "Failed to fetch emotion analytics" }, { status: 500 })
  }
}
