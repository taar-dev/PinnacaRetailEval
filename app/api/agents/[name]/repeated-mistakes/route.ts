import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { name: string } }) {
  try {
    const agentName = decodeURIComponent(params.name)
    const flaskUrl = process.env.FLASK_BASE_URL || "http://localhost:5000"

    const response = await fetch(`${flaskUrl}/api/repeated-mistakes/${encodeURIComponent(agentName)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      console.error(`Flask API error: ${response.status}`)
      return NextResponse.json({ error: "Failed to fetch repeated mistakes" }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching repeated mistakes:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
