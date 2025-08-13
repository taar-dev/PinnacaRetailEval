import { NextResponse } from "next/server"

const FLASK_BASE_URL = process.env.FLASK_BASE_URL || "http://localhost:5000"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Forward the request to your Flask backend
    const response = await fetch(`${FLASK_BASE_URL}/get-result/${id}`)

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`)
    }

    const result = await response.json()
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching result:", error)
    return NextResponse.json({ error: "Failed to fetch result" }, { status: 500 })
  }
}
