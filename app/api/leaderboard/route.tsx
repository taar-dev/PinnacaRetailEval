import { NextResponse } from "next/server"

export async function GET() {
  try {
    const flaskBaseUrl = process.env.FLASK_BASE_URL || "http://localhost:5000"
    const response = await fetch(`${flaskBaseUrl}/leaderboard`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Flask API responded with status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching leaderboard:", error)
    return NextResponse.json({ error: "Failed to fetch leaderboard data" }, { status: 500 })
  }
}
