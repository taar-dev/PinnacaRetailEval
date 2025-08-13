import { NextResponse } from "next/server"

const FLASK_BASE_URL = process.env.FLASK_BASE_URL || "http://localhost:5000"

export async function GET() {
  try {
    const response = await fetch(`${FLASK_BASE_URL}/api/unique-agents`)

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`)
    }

    const uniqueAgents = await response.json()
    return NextResponse.json(uniqueAgents)
  } catch (error) {
    console.error("Error fetching unique agents:", error)
    return NextResponse.json({ error: "Failed to fetch unique agents" }, { status: 500 })
  }
}
