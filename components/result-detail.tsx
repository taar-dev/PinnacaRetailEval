"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Download, Mail, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface ResultDetailProps {
  result: {
    id: number
    transcript: string
    evaluation: Array<{
      kpi_number: string
      description: string
      score: number
      penalty: boolean
      justification: string
    }>
    emotion_summary: any
    created_at: string
    agent_name?: string // Added agent_name to the interface
  }
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

export function ResultDetail({ result }: ResultDetailProps) {
  const kpiStats = calculateKPIStats(result.evaluation || [])

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `analysis_${result.id}.json`
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
          agentName: result.agent_name || `Analysis #${result.id}`, // Use agent_name if available
          audioFilename: `analysis_${result.id}`,
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/results">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Results
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analysis #{result.id}</h1>
            <p className="text-muted-foreground">
              Created on {result.created_at ? new Date(result.created_at).toLocaleDateString() : "Unknown date"}
              {result.agent_name && (
                <>
                  {" by "}
                  <Link
                    href={`/agents/${encodeURIComponent(result.agent_name)}`}
                    className="hover:underline text-primary"
                  >
                    {result.agent_name}
                  </Link>
                </>
              )}{" "}
              {/* Display agent name here as a link */}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleDownload} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          <Button onClick={handleSendEmail}>
            <Mail className="mr-2 h-4 w-4" />
            Send Email
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiStats.percentage.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Average: {kpiStats.averageScore.toFixed(1)}/5</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Excellent Scores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{kpiStats.excellentCount}</div>
            <p className="text-xs text-muted-foreground">Scores 4-5</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Penalties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{kpiStats.penaltyCount}</div>
            <p className="text-xs text-muted-foreground">Areas flagged</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Needs Work</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{kpiStats.needsImprovementCount}</div>
            <p className="text-xs text-muted-foreground">Scores 1-2</p>
          </CardContent>
        </Card>
      </div>

      {/* Transcript */}
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

      {/* KPI Details */}
      <Card>
        <CardHeader>
          <CardTitle>KPI Evaluation Details</CardTitle>
          <CardDescription>Individual performance metrics with scores and feedback</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {result.evaluation && result.evaluation.length > 0 ? (
            result.evaluation.map((kpi, index) => (
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
            ))
          ) : (
            <p className="text-muted-foreground text-center py-8">No KPI evaluation data available</p>
          )}
        </CardContent>
      </Card>

      {/* Emotion Analysis */}
      {result.emotion_summary && (
        <Card>
          <CardHeader>
            <CardTitle>Emotion Analysis</CardTitle>
            <CardDescription>Emotional tone and sentiment detected throughout the conversation</CardDescription>
          </CardHeader>
          <CardContent>
            {(() => {
              try {
                let emotionData = result.emotion_summary
                if (typeof emotionData === "string") {
                  emotionData = JSON.parse(emotionData)
                }

                const topPositive = emotionData?.top_positive_emotions || []
                const topNegative = emotionData?.top_negative_emotions || []

                if (topPositive.length === 0 && topNegative.length === 0) {
                  return (
                    <div className="bg-muted p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">No emotion data available</p>
                    </div>
                  )
                }

                return (
                  <div className="grid gap-6 md:grid-cols-2">
                    {topPositive.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-4 text-green-700">Top Positive Emotions</h4>
                        <div className="space-y-3">
                          {topPositive.slice(0, 5).map((emotion, index) => {
                            const [name, score] = Array.isArray(emotion)
                              ? emotion
                              : [emotion.name || "Unknown", emotion.score || 0]
                            return (
                              <EmotionBar
                                key={`positive-${index}`}
                                emotion={name}
                                score={Math.round(score)}
                                index={index}
                                isPositive={true}
                              />
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {topNegative.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-4 text-red-700">Top Negative Emotions</h4>
                        <div className="space-y-3">
                          {topNegative.slice(0, 5).map((emotion, index) => {
                            const [name, score] = Array.isArray(emotion)
                              ? emotion
                              : [emotion.name || "Unknown", emotion.score || 0]
                            return (
                              <EmotionBar
                                key={`negative-${index}`}
                                emotion={name}
                                score={Math.round(score)}
                                index={index}
                                isPositive={false}
                              />
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )
              } catch (error) {
                return (
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">Error parsing emotion data</p>
                  </div>
                )
              }
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
