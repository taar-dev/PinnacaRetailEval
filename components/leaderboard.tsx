import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Medal, Award } from "lucide-react"
import Link from "next/link"

interface LeaderboardEntry {
  agent_name: string
  avg_score: number
}

async function getLeaderboardData(): Promise<LeaderboardEntry[]> {
  try {
    const response = await fetch(
      `${process.env.VERCEL_URL ? "https://" + process.env.VERCEL_URL : "http://localhost:3000"}/api/leaderboard`,
      {
        cache: "no-store",
      },
    )

    if (!response.ok) {
      throw new Error("Failed to fetch leaderboard data")
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching leaderboard:", error)
    return []
  }
}

function getRankIcon(index: number) {
  switch (index) {
    case 0:
      return <Trophy className="h-5 w-5 text-yellow-500" />
    case 1:
      return <Medal className="h-5 w-5 text-gray-400" />
    case 2:
      return <Award className="h-5 w-5 text-amber-600" />
    default:
      return (
        <span className="h-5 w-5 flex items-center justify-center text-sm font-bold text-muted-foreground">
          #{index + 1}
        </span>
      )
  }
}

function getScoreColor(score: number) {
  if (score >= 4.5) return "bg-green-100 text-green-800 border-green-200"
  if (score >= 4.0) return "bg-blue-100 text-blue-800 border-blue-200"
  if (score >= 3.5) return "bg-yellow-100 text-yellow-800 border-yellow-200"
  return "bg-red-100 text-red-800 border-red-200"
}

export async function Leaderboard() {
  const leaderboardData = await getLeaderboardData()

  if (leaderboardData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Agent Leaderboard
          </CardTitle>
          <CardDescription>Top performing agents by average KPI score</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">No leaderboard data available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Agent Leaderboard
        </CardTitle>
        <CardDescription>Top performing agents by average KPI score</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {leaderboardData.map((entry, index) => (
            <Link
              key={entry.agent_name}
              href={`/agents/${encodeURIComponent(entry.agent_name)}`}
              className="block hover:bg-muted/50 rounded-lg p-2 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getRankIcon(index)}
                  <span className="font-medium">{entry.agent_name}</span>
                </div>
                <Badge variant="outline" className={getScoreColor(entry.avg_score)}>
                  {entry.avg_score.toFixed(2)}
                </Badge>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
