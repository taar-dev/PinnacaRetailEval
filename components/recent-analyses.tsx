import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileAudio, Eye } from "lucide-react"
import Link from "next/link"

async function getRecentAnalyses() {
  try {
    // Use an absolute URL for server-side fetch
    const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"
    const response = await fetch(`${baseUrl}/api/recent-analyses`, {
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error("Failed to fetch recent analyses")
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching recent analyses:", error)
    return []
  }
}

function getScoreBadgeVariant(score: number) {
  if (score >= 4) return "default"
  if (score >= 3) return "secondary"
  return "destructive"
}

export async function RecentAnalyses() {
  const analyses = await getRecentAnalyses()

  if (!analyses.length) {
    return (
      <div className="text-center py-8">
        <FileAudio className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground mb-2">No analyses found in database</p>
        <p className="text-sm text-muted-foreground mb-4">Upload your first audio file to get started</p>
        <Link href="/upload">
          <Button>Upload Audio File</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {analyses.map((analysis: any) => (
        <div
          key={analysis.id}
          className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
              <FileAudio className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="font-medium leading-none">Analysis #{analysis.id}</p>
              {analysis.agent_name && (
                <p className="text-sm text-muted-foreground">
                  Agent:{" "}
                  <Link
                    href={`/agents/${encodeURIComponent(analysis.agent_name)}`}
                    className="hover:underline text-primary"
                  >
                    {analysis.agent_name}
                  </Link>
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                {analysis.transcript ? `${analysis.transcript.substring(0, 50)}...` : "No transcript"}
              </p>
              <p className="text-xs text-muted-foreground">
                {analysis.createdAt ? new Date(analysis.createdAt).toLocaleDateString() : "Unknown date"} at{" "}
                {analysis.createdAt
                  ? new Date(analysis.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Unknown time"}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={getScoreBadgeVariant(analysis.kpiScore)}>
              KPI: {analysis.kpiScore > 0 ? `${analysis.kpiScore}/5` : "N/A"}
            </Badge>
            <Link href={`/results/${analysis.id}`}>
              <Button variant="ghost" size="sm">
                <Eye className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      ))}
    </div>
  )
}
