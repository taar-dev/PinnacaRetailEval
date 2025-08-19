import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {EmotionAnalytics} from "@/components/emotion-analytics"

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">Comprehensive insights and analytics from your audio analyses</p>
      </div>

      <div className="grid gap-6">
        <Suspense
          fallback={
            <Card>
              <CardHeader>
                <CardTitle>Loading Analytics...</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          }
        >
          <EmotionAnalytics />
        </Suspense>

        {/* Placeholder for future analytics components */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>Detailed performance analytics coming soon</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Additional analytics features will be added here, including KPI trends, agent performance comparisons, and
              detailed reporting.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
