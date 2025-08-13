import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, TrendingDown } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface RepeatedMistakesProps {
  agentName: string
}

async function getRepeatedMistakes(agentName: string) {
  try {
    const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"
    const response = await fetch(`${baseUrl}/api/agents/${encodeURIComponent(agentName)}/repeated-mistakes`, {
      cache: "no-store",
    })

    if (!response.ok) {
      console.error(`Failed to fetch repeated mistakes for agent ${agentName}: ${response.status}`)
      return null
    }

    return await response.json()
  } catch (error) {
    console.error(`Error fetching repeated mistakes for agent ${agentName}:`, error)
    return null
  }
}

export default async function RepeatedMistakes({ agentName }: RepeatedMistakesProps) {
  const data = await getRepeatedMistakes(agentName)

  if (!data || !data.repeated_mistakes) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5" />
            Repeated Issues
          </CardTitle>
          <CardDescription>KPIs that frequently need improvement</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No repeated issues found for this agent.</p>
        </CardContent>
      </Card>
    )
  }

  const repeatedMistakes = data.repeated_mistakes
  const mistakeEntries = Object.entries(repeatedMistakes).sort(([, a], [, b]) => (b as number) - (a as number))

  if (mistakeEntries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5" />
            Repeated Issues
          </CardTitle>
          <CardDescription>KPIs that frequently need improvement</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No repeated issues found for this agent.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingDown className="h-5 w-5" />
          Repeated Issues
        </CardTitle>
        <CardDescription>KPIs that frequently need improvement for {agentName}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {mistakeEntries.map(([kpiNumber, count]) => {
            const countNumber = count as number
            return (
              <div key={kpiNumber} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-destructive/10">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                  </div>
                  <div>
                    <p className="font-medium">KPI #{kpiNumber}</p>
                    <p className="text-sm text-muted-foreground">
                      Needs improvement in {countNumber} call{countNumber > 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <Badge variant="destructive" className="font-semibold">
                  {countNumber}x
                </Badge>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

export function RepeatedMistakesSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingDown className="h-5 w-5" />
          Repeated Issues
        </CardTitle>
        <CardDescription>KPIs that frequently need improvement</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
              <Skeleton className="h-6 w-8" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
