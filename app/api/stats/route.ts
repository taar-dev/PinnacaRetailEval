import { NextResponse } from "next/server"

const FLASK_BASE_URL = process.env.FLASK_BASE_URL || "http://localhost:5000"

export async function GET() {
  try {
    const response = await fetch(`${FLASK_BASE_URL}/api/stats`)

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`)
    }

    const stats = await response.json()
    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching stats:", error)
    // Return default stats if backend is unavailable
    return NextResponse.json({
      totalAnalyses: 0,
      avgKpiScore: 0,
      totalAgents: 0,
      avgEmotionScore: 0,
    })
  }
}
