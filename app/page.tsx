import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { BarChart3, FileAudio, TrendingUp } from "lucide-react"
import Link from "next/link"
import { RecentAnalyses } from "@/components/recent-analyses"
import { StatsCards } from "@/components/stats-cards"
import { Leaderboard } from "@/components/leaderboard"

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Audio Analysis Dashboard</h1>
        <p className="text-muted-foreground">Monitor and analyze your audio processing results</p>
      </div>

      <Suspense fallback={<StatsCardsSkeleton />}>
        <StatsCards />
      </Suspense>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Recent Analyses</CardTitle>
            <CardDescription>Latest audio analysis results from your uploads</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<RecentAnalysesSkeleton />}>
              <RecentAnalyses />
            </Suspense>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Suspense fallback={<LeaderboardSkeleton />}>
            <Leaderboard />
          </Suspense>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/upload">
                <Button className="w-full justify-start" size="lg">
                  <FileAudio className="mr-2 h-4 w-4" />
                  Upload New Audio
                </Button>
              </Link>
              <Link href="/results">
                <Button variant="outline" className="w-full justify-start bg-transparent" size="lg">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  View All Results
                </Button>
              </Link>
              <Link href="/analytics">
                <Button variant="outline" className="w-full justify-start bg-transparent" size="lg">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Analytics Overview
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function StatsCardsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16 mb-1" />
            <Skeleton className="h-3 w-24" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function RecentAnalysesSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-6 w-16" />
        </div>
      ))}
    </div>
  )
}

function LeaderboardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-5 w-32" />
        </CardTitle>
        <CardDescription>
          <Skeleton className="h-4 w-48" />
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-2">
              <div className="flex items-center gap-3">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-6 w-12" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
