"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"

export function ConnectionTest() {
  const [testResults, setTestResults] = useState<Record<string, any>>({})
  const [isLoading, setIsLoading] = useState(false)

  const runTests = async () => {
    setIsLoading(true)
    const results: Record<string, any> = {}

    // Test 1: Health Check
    try {
      const response = await fetch("/api/health")
      results.health = {
        status: response.ok ? "success" : "failed",
        data: response.ok ? await response.json() : null,
        error: response.ok ? null : `HTTP ${response.status}`,
      }
    } catch (error) {
      results.health = {
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }

    // Test 2: Stats API
    try {
      const response = await fetch("/api/stats")
      results.stats = {
        status: response.ok ? "success" : "failed",
        data: response.ok ? await response.json() : null,
        error: response.ok ? null : `HTTP ${response.status}`,
      }
    } catch (error) {
      results.stats = {
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }

    // Test 3: Results API
    try {
      const response = await fetch("/api/results")
      results.results = {
        status: response.ok ? "success" : "failed",
        data: response.ok ? await response.json() : null,
        error: response.ok ? null : `HTTP ${response.status}`,
      }
    } catch (error) {
      results.results = {
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }

    // Test 4: Direct Flask Backend
    try {
      const response = await fetch("http://localhost:5000/health")
      results.directFlask = {
        status: response.ok ? "success" : "failed",
        data: response.ok ? await response.json() : null,
        error: response.ok ? null : `HTTP ${response.status}`,
      }
    } catch (error) {
      results.directFlask = {
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }

    setTestResults(results)
    setIsLoading(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Loader2 className="h-4 w-4 animate-spin" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-500">Connected</Badge>
      case "failed":
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Connection Test</CardTitle>
        <CardDescription>Test the connection between Next.js frontend and Flask backend</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={runTests} disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Testing Connection...
            </>
          ) : (
            "Run Connection Test"
          )}
        </Button>

        {Object.keys(testResults).length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Test Results:</h3>

            {/* Health Check Test */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(testResults.health?.status)}
                <div>
                  <p className="font-medium">Next.js → Flask Health Check</p>
                  <p className="text-sm text-muted-foreground">Tests API proxy connection</p>
                </div>
              </div>
              <div className="text-right">
                {getStatusBadge(testResults.health?.status)}
                {testResults.health?.error && <p className="text-xs text-red-500 mt-1">{testResults.health.error}</p>}
              </div>
            </div>

            {/* Stats API Test */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(testResults.stats?.status)}
                <div>
                  <p className="font-medium">Dashboard Stats API</p>
                  <p className="text-sm text-muted-foreground">Tests database connection</p>
                </div>
              </div>
              <div className="text-right">
                {getStatusBadge(testResults.stats?.status)}
                {testResults.stats?.data && (
                  <p className="text-xs text-green-600 mt-1">{testResults.stats.data.totalAnalyses} analyses found</p>
                )}
                {testResults.stats?.error && <p className="text-xs text-red-500 mt-1">{testResults.stats.error}</p>}
              </div>
            </div>

            {/* Results API Test */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(testResults.results?.status)}
                <div>
                  <p className="font-medium">Results API</p>
                  <p className="text-sm text-muted-foreground">Tests results retrieval</p>
                </div>
              </div>
              <div className="text-right">
                {getStatusBadge(testResults.results?.status)}
                {testResults.results?.data && Array.isArray(testResults.results.data) && (
                  <p className="text-xs text-green-600 mt-1">{testResults.results.data.length} results found</p>
                )}
                {testResults.results?.error && <p className="text-xs text-red-500 mt-1">{testResults.results.error}</p>}
              </div>
            </div>

            {/* Direct Flask Test */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(testResults.directFlask?.status)}
                <div>
                  <p className="font-medium">Direct Flask Connection</p>
                  <p className="text-sm text-muted-foreground">Tests direct backend access</p>
                </div>
              </div>
              <div className="text-right">
                {getStatusBadge(testResults.directFlask?.status)}
                {testResults.directFlask?.error && (
                  <p className="text-xs text-red-500 mt-1">{testResults.directFlask.error}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
