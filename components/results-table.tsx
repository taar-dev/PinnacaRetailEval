"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye, Download } from "lucide-react"
import Link from "next/link"

async function getResults() {
  try {
    // Use an absolute URL for server-side fetch
    const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"
    const response = await fetch(`${baseUrl}/api/results`, {
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error("Failed to fetch results")
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching results:", error)
    return []
  }
}

// 🧮 KPI SCORE CALCULATION
function calculateKPIScore(evaluation: any[]) {
  if (!evaluation || !Array.isArray(evaluation) || evaluation.length === 0) {
    return 0
  }

  try {
    const scores = evaluation
      .map((kpi) => {
        const score = Number.parseFloat(kpi.score)
        return score
      })
      .filter((score) => !isNaN(score)) // Remove invalid scores

    if (scores.length === 0) {
      return 0
    }

    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length
    return Math.round(average * 10) / 10 // Round to 1 decimal place
  } catch (error) {
    console.error("Error calculating KPI score:", error)
    return 0
  }
}

// ⚠️ PENALTIES CALCULATION
function countPenalties(evaluation: any[]) {
  if (!evaluation || !Array.isArray(evaluation)) {
    return 0
  }

  try {
    return evaluation.filter((kpi) => {
      const penalty = kpi.penalty
      return penalty === true || penalty === 1 || penalty === "true" || penalty === "1"
    }).length
  } catch (error) {
    console.error("Error counting penalties:", error)
    return 0
  }
}

function getScoreBadgeVariant(score: number) {
  if (score >= 4) return "default" // Green for excellent (4-5)
  if (score >= 3) return "secondary" // Yellow for good (3-4)
  return "destructive" // Red for poor (0-3)
}

export async function ResultsTable() {
  const results = await getResults()

  if (!results.length) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">No results found in your database</p>
        <Link href="/upload">
          <Button>Upload Your First Audio File</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Agent Name</TableHead> {/* Added Agent Name column */}
              <TableHead>Transcript Preview</TableHead>
              <TableHead>KPI Score</TableHead>
              <TableHead>Penalties</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((result: any) => {
              const kpiScore = calculateKPIScore(result.evaluation)
              const penalties = countPenalties(result.evaluation)

              return (
                <TableRow key={result.id}>
                  <TableCell className="font-mono text-sm">#{result.id}</TableCell>
                  <TableCell className="font-mono text-sm">
                    {result.created_at ? new Date(result.created_at).toLocaleDateString() : "Unknown"}
                  </TableCell>
                  <TableCell className="font-medium">
                    {result.agent_name ? (
                      <Link
                        href={`/agents/${encodeURIComponent(result.agent_name)}`}
                        className="hover:underline text-primary"
                      >
                        {result.agent_name}
                      </Link>
                    ) : (
                      "N/A"
                    )}
                  </TableCell>{" "}
                  {/* Display Agent Name as a link */}
                  <TableCell className="max-w-xs">
                    <p className="truncate text-sm text-muted-foreground">
                      {result.transcript ? result.transcript.substring(0, 100) + "..." : "No transcript available"}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getScoreBadgeVariant(kpiScore)}>{kpiScore > 0 ? `${kpiScore}/5` : "N/A"}</Badge>
                  </TableCell>
                  <TableCell>
                    {penalties > 0 ? (
                      <Badge variant="destructive">{penalties}</Badge>
                    ) : (
                      <Badge variant="outline">0</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/results/${result.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const blob = new Blob([JSON.stringify(result, null, 2)], {
                            type: "application/json",
                          })
                          const url = URL.createObjectURL(blob)
                          const a = document.createElement("a")
                          a.href = url
                          a.download = `analysis-${result.id}.json`
                          document.body.appendChild(a)
                          a.click()
                          document.body.removeChild(a)
                          URL.revokeObjectURL(url)
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
      <div className="text-sm text-muted-foreground">
        Showing {results.length} result{results.length !== 1 ? "s" : ""} from your database
      </div>
    </div>
  )
}
