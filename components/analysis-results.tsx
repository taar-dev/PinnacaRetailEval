"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, AlertTriangle, TrendingUp, Download, Mail } from "lucide-react"
import { FileAudio } from "lucide-react" // Added FileAudio import
import Link from "next/link" // Added Link import

interface AnalysisResult {
  transcript: string
  evaluation: Array<{
    kpi_number: string
    description: string
    score: number
    penalty: boolean
    justification: string
  }>
  emotion_summary: {
    mean: number
    median: number
    mode: number | null
    range: number
    top_positive_emotions: Array<[string, number]>
    top_negative_emotions: Array<[string, number]>
  }
  emotion_scores: Record<string, number>
  agent_name?: string // Added agent_name to the interface
}

interface AnalysisResultsProps {
  result: AnalysisResult
  fileName: string
  agentName: string
}

export function AnalysisResults({ result, fileName, agentName }: AnalysisResultsProps) {
  const kpiStats = calculateKPIStats(result.evaluation)

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `analysis_${fileName.replace(/\.[^/.]+$/, "")}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleSendEmail = async () => {
    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentName,
          audioFilename: fileName,
          kpiScores: result.evaluation,
          emotionSummary: result.emotion_summary,
        }),
      })

      const data = await response.json()
      if (data.success) {
        alert("Email sent successfully!")
      } else {
        alert("Failed to send email: " + (data.error || "Unknown error"))
      }
    } catch (err) {
      console.error("Error sending email:", err)
      alert("Error sending email.")
    }
  }

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button onClick={handleDownload} className="flex-1">
          <Download className="mr-2 h-4 w-4" />
          Download Report
        </Button>
        <Button onClick={handleSendEmail} variant="outline" className="flex-1 bg-transparent">
          <Mail className="mr-2 h-4 w-4" />
          Send Email
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          {" "}
          {/* Adjusted grid-cols from 5 to 4 */}
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transcript">Transcript</TabsTrigger>
          <TabsTrigger value="kpi">KPI Analysis</TabsTrigger>
          {/* Removed Emotions tab trigger */}
          <TabsTrigger value="summary">Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overall KPI Score</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpiStats.percentage.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">Average: {kpiStats.averageScore.toFixed(1)}/5</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Excellent Scores</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{kpiStats.excellentCount}</div>
                <p className="text-xs text-muted-foreground">Scores 4-5</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Penalties</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{kpiStats.penaltyCount}</div>
                <p className="text-xs text-muted-foreground">Areas flagged</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Agent Name</CardTitle>
                <FileAudio className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
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
                </div>
                <p className="text-xs text-muted-foreground">Assigned Agent</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transcript">
          <Card>
            <CardHeader>
              <CardTitle>Transcript</CardTitle>
              <CardDescription>Complete transcription of the audio file</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {result.transcript || "No transcript available"}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kpi" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{kpiStats.percentage.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">Overall Score</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-green-600">{kpiStats.excellentCount}</div>
                <p className="text-xs text-muted-foreground">Excellent (4-5)</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-red-600">{kpiStats.penaltyCount}</div>
                <p className="text-xs text-muted-foreground">Penalties</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-orange-600">{kpiStats.needsImprovementCount}</div>
                <p className="text-xs text-muted-foreground">Needs Work (1-2)</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Detailed KPI Evaluation</CardTitle>
              <CardDescription>Individual performance metrics with scores and feedback</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {result.evaluation.map((kpi, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant="outline">KPI {kpi.kpi_number}</Badge>
                        <Badge variant={getScoreBadgeVariant(kpi.score)}>
                          {getScoreIcon(kpi.score)} {kpi.score}/5
                        </Badge>
                        {kpi.penalty && <Badge variant="destructive">Penalty</Badge>}
                      </div>
                      <h4 className="font-medium mb-2">{kpi.description}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{kpi.justification}</p>
                    </div>
                  </div>
                  <Progress value={(kpi.score / 5) * 100} className="w-full" />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Removed Emotions tab content */}

        <TabsContent value="summary">
          <Card>
            <CardHeader>
              <CardTitle>Analysis Summary</CardTitle>
              <CardDescription>Complete overview of the analysis results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h4 className="font-semibold mb-3">Performance Overview</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Overall KPI Score:</span>
                      <span className="font-medium">{kpiStats.percentage.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Average Rating:</span>
                      <span className="font-medium">{kpiStats.averageScore.toFixed(1)}/5</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Penalties:</span>
                      <span className="font-medium">{kpiStats.penaltyCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Agent Name:</span>
                      <span className="font-medium">
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
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Emotional Overview</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Average Intensity:</span>
                      <span className="font-medium">{result.emotion_summary.mean}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Emotional Range:</span>
                      <span className="font-medium">{result.emotion_summary.range}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Most Common:</span>
                      <span className="font-medium">
                        {result.emotion_summary.mode ? `${result.emotion_summary.mode}%` : "Varied"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function EmotionBar({
  emotion,
  score,
  index,
  isPositive,
}: {
  emotion: string
  score: number
  index: number
  isPositive: boolean
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`flex items-center justify-center w-8 h-8 rounded-full font-semibold text-sm ${
          isPositive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        }`}
      >
        {index + 1}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="font-medium capitalize">{emotion}</span>
          <span className={`text-sm font-semibold ${isPositive ? "text-green-600" : "text-red-600"}`}>{score}%</span>
        </div>
        <Progress value={score} className={`w-full ${isPositive ? "[&>div]:bg-green-500" : "[&>div]:bg-red-500"}`} />
      </div>
    </div>
  )
}

function calculateKPIStats(evaluations: any[]) {
  const validEvaluations = evaluations.filter((kpi) => typeof kpi.score === "number" && !isNaN(kpi.score))

  if (!validEvaluations || validEvaluations.length === 0) {
    return {
      totalScore: 0,
      maxScore: 0,
      averageScore: 0,
      penaltyCount: 0,
      excellentCount: 0,
      needsImprovementCount: 0,
      percentage: 0,
    }
  }

  const totalScore = validEvaluations.reduce((sum, kpi) => sum + kpi.score, 0)
  const maxScore = validEvaluations.length * 5
  const averageScore = totalScore / validEvaluations.length
  const penaltyCount = validEvaluations.filter((kpi) => kpi.penalty).length
  const excellentCount = validEvaluations.filter((kpi) => kpi.score >= 4).length
  const needsImprovementCount = validEvaluations.filter((kpi) => kpi.score <= 2).length

  return {
    totalScore,
    maxScore,
    averageScore,
    penaltyCount,
    excellentCount,
    needsImprovementCount,
    percentage: (totalScore / maxScore) * 100,
  }
}

function getScoreBadgeVariant(score: number) {
  if (score >= 4) return "default"
  if (score >= 3) return "secondary"
  return "destructive"
}

function getScoreIcon(score: number) {
  if (score >= 4) return "👍"
  if (score >= 3) return "⚠️"
  return "👎"
}
