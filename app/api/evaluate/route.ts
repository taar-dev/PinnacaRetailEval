import { type NextRequest, NextResponse } from "next/server"

const FLASK_BASE_URL = process.env.FLASK_BASE_URL || "http://localhost:5000"

export async function POST(request: NextRequest) {
  console.log("🚀 Next.js API: Received file upload request")

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const agentName = formData.get("agentName") as string

    if (!file) {
      console.log("❌ Next.js API: No file provided")
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    console.log(`📁 Next.js API: Processing file: ${file.name} (${file.size} bytes), Agent: ${agentName}`)

    // Forward the request to your Flask backend
    const backendFormData = new FormData()
    backendFormData.append("file", file)
    if (agentName) {
      backendFormData.append("agentName", agentName)
    }

    console.log(`🔄 Next.js API: Forwarding to Flask backend at ${FLASK_BASE_URL}/evaluate`)

    const response = await fetch(`${FLASK_BASE_URL}/evaluate`, {
      method: "POST",
      body: backendFormData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.log(`❌ Flask Backend Error: ${response.status} - ${errorText}`)
      throw new Error(`Backend error: ${response.status} - ${errorText}`)
    }

    console.log("✅ Flask Backend: Analysis completed successfully")
    const result = await response.json()

    // Save to database via Flask backend
    try {
      console.log("💾 Next.js API: Saving results to database")
      // Ensure agent_name is included when saving the result
      const dataToSave = {
        ...result,
        agent_name: agentName, // Explicitly add agent_name from the initial form data
      }
      await fetch(`${FLASK_BASE_URL}/save-result`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSave),
      })
      console.log("✅ Database: Results saved successfully")
    } catch (saveError) {
      console.warn("⚠️ Database: Failed to save result:", saveError)
      // Don't fail the main request if saving fails
    }

    console.log("🎉 Next.js API: Returning results to frontend")
    return NextResponse.json(result)
  } catch (error) {
    console.error("💥 Next.js API Error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process audio file" },
      { status: 500 },
    )
  }
}
