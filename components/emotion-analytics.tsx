"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Heart, Frown } from "lucide-react"

interface EmotionData {
  emotion: string
  avg_score: number
  frequency: number
}

interface EmotionAnalytics {
  total_analyses: number
  top_positive_emotions: EmotionData[]
  top_negative_emotions: EmotionData[]
}

export function EmotionAnalytics() {
  const [data, setData] = useState<EmotionAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchEmotionAnalytics() {
      try {
        const response = await fetch("/api/emotion-analytics")
        if (!response.ok) {
          throw new Error("Failed to fetch emotion analytics")
        }
        const result = await response.json()
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchEmotionAnalytics()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Emotion Analytics
          </CardTitle>
          <CardDescription>Loading emotion insights...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-2 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Emotion Analytics
          </CardTitle>
          <CardDescription>Unable to load emotion data</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const maxFrequency = Math.max(
    ...data.top_positive_emotions.map((e) => e.frequency),
    ...data.top_negative_emotions.map((e) => e.frequency),
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5" />
          Emotion Analytics
        </CardTitle>
        <CardDescription>Insights from {data.total_analyses} analyses</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {data.top_positive_emotions.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-green-700 mb-3 flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Top Positive Emotions
            </h4>
            <div className="space-y-3">
              {data.top_positive_emotions.slice(0, 3).map((emotion, index) => (
                <div key={emotion.emotion} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium capitalize">{emotion.emotion}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {emotion.frequency}x
                      </Badge>
                      <span className="text-green-600 font-medium">{emotion.avg_score}%</span>
                    </div>
                  </div>
                  <Progress value={(emotion.frequency / maxFrequency) * 100} className="h-2" />
                </div>
              ))}
            </div>
          </div>
        )}

        {data.top_negative_emotions.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-red-700 mb-3 flex items-center gap-2">
              <Frown className="h-4 w-4" />
              Top Negative Emotions
            </h4>
            <div className="space-y-3">
              {data.top_negative_emotions.slice(0, 3).map((emotion, index) => (
                <div key={emotion.emotion} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium capitalize">{emotion.emotion}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {emotion.frequency}x
                      </Badge>
                      <span className="text-red-600 font-medium">{emotion.avg_score}%</span>
                    </div>
                  </div>
                  <Progress value={(emotion.frequency / maxFrequency) * 100} className="h-2 [&>div]:bg-red-500" />
                </div>
              ))}
            </div>
          </div>
        )}

        {data.top_positive_emotions.length === 0 && data.top_negative_emotions.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No emotion data available yet. Upload some audio files to see insights!
          </p>
        )}
      </CardContent>
    </Card>
  )
}
