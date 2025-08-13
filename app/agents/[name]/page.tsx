import { Suspense } from "react"
import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileAudio, Eye, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import RepeatedMistakes, { RepeatedMistakesSkeleton } from "@/components/repeated-mistakes"

async function getAgentAnalyses(agentName: string) {
  try {
    const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"
    const response = await fetch(`${baseUrl}/api/agents/${encodeURIComponent(agentName)}`, {
      cache: "no-store",
    })

    if (!response.ok) {
      // If the agent name doesn't exist or there's an error, return null
      console.error(`Failed to fetch analyses for agent ${agentName}: ${response.status}`)
      return null
    }

    return await response.json()
  } catch (error) {
    console.error(`Error fetching analyses for agent ${agentName}:`, error)
    return null
  }
}

function getScoreBadgeVariant(score: number) {
  if (score >= 4) return "default"
  if (score >= 3) return "secondary"
  return "destructive"
}

export default async function AgentProfilePage({ params }: { params: { name: string } }) {
  const agentName = decodeURIComponent(params.name)
  const analyses = await getAgentAnalyses(agentName)

  if (!analyses || analyses.length === 0) {
    notFound() // Show 404 if no analyses found for this agent
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Agent Profile: {agentName}</h1>
            <p className="text-muted-foreground">All analysis results for this agent</p>
          </div>
        </div>
      </div>

      <Suspense fallback={<RepeatedMistakesSkeleton />}>
        <RepeatedMistakes agentName={agentName} />
      </Suspense>

      <Card>
        <CardHeader>
          <CardTitle>Analyses by {agentName}</CardTitle>
          <CardDescription>A list of all audio analyses performed by this agent.</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<AgentAnalysesSkeleton />}>
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
                      <p className="text-sm text-muted-foreground">
                        {analysis.transcript ? `${analysis.transcript.substring(0, 50)}...` : "No transcript"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {analysis.created_at ? new Date(analysis.created_at).toLocaleDateString() : "Unknown date"} at{" "}
                        {analysis.created_at
                          ? new Date(analysis.created_at).toLocaleTimeString([], {
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
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}

function AgentAnalysesSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
      ))}
    </div>
  )
}
