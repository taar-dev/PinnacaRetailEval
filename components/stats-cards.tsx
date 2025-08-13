import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileAudio, BarChart3, Users } from "lucide-react"

async function getStats() {
  try {
    // Use an absolute URL for server-side fetch
    const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"
    const response = await fetch(`${baseUrl}/api/stats`, {
      cache: "no-store", // Always fetch fresh data
    })

    if (!response.ok) {
      throw new Error("Failed to fetch stats")
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching stats:", error)
    // Return default values if API fails
    return {
      totalAnalyses: 0,
      avgKpiScore: 0,
      totalAgents: 0,
    }
  }
}

export async function StatsCards() {
  const stats = await getStats()

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Analyses</CardTitle>
          <FileAudio className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalAnalyses}</div>
          <p className="text-xs text-muted-foreground">
            {stats.totalAnalyses > 0 ? "From your database" : "No analyses yet"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg KPI Score</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.avgKpiScore}/5</div>
          <p className="text-xs text-muted-foreground">
            {stats.avgKpiScore > 0 ? "Calculated from DB" : "No KPI data yet"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Records</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalAgents}</div>
          <p className="text-xs text-muted-foreground">Database entries</p>
        </CardContent>
      </Card>
    </div>
  )
}
