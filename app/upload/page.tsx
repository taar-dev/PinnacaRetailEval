"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, FileAudio, AlertCircle, CheckCircle2 } from "lucide-react"
import { useDropzone } from "react-dropzone"
import { AnalysisResults } from "@/components/analysis-results"

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

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [agentName, setAgentName] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const audioFile = acceptedFiles[0]
    if (audioFile && audioFile.type.startsWith("audio/")) {
      setFile(audioFile)
      setError(null)
    } else {
      setError("Please upload a valid audio file")
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "audio/*": [".mp3", ".wav", ".m4a", ".ogg", ".flac"],
    },
    multiple: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      setError("Please select an audio file to upload.")
      return
    }
    if (!agentName.trim()) {
      // Check if agentName is empty or just whitespace
      setError("Agent Name is required.")
      return
    }

    setIsUploading(true)
    setProgress(0)
    setError(null)

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev
        return prev + Math.random() * 30
      })
    }, 500)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("agentName", agentName) // agentName is now guaranteed to be present

      const response = await fetch("/api/evaluate", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const analysisResult = await response.json()
      setResult(analysisResult)
      setProgress(100)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during analysis")
    } finally {
      clearInterval(progressInterval)
      setIsUploading(false)
    }
  }

  const resetForm = () => {
    setFile(null)
    setAgentName("")
    setResult(null)
    setError(null)
    setProgress(0)
  }

  if (result) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analysis Complete</h1>
            <p className="text-muted-foreground">Results for {file?.name}</p>
            {result.agent_name && <p className="text-sm text-muted-foreground">Agent: {result.agent_name}</p>}
          </div>
          <Button onClick={resetForm} variant="outline">
            Analyze Another File
          </Button>
        </div>
        <AnalysisResults result={result} fileName={file?.name || ""} agentName={agentName} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Upload Audio File</h1>
        <p className="text-muted-foreground">
          Upload audio files for transcript analysis, KPI evaluation, and emotion detection
        </p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileAudio className="h-5 w-5" />
            Audio Analysis
          </CardTitle>
          <CardDescription>
            Upload your audio file to get detailed analysis including transcription, KPI evaluation, and emotion
            detection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? "border-primary bg-primary/5"
                  : file
                    ? "border-green-500 bg-green-50"
                    : "border-muted-foreground/25 hover:border-muted-foreground/50"
              }`}
            >
              <input {...getInputProps()} />
              {file ? (
                <div className="space-y-2">
                  <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => setFile(null)}>
                    Change File
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-12 w-12 text-muted-foreground mx-auto" />
                  <div>
                    <p className="text-lg font-medium">
                      {isDragActive ? "Drop your audio file here" : "Drop your audio file here, or click to browse"}
                    </p>
                    <p className="text-sm text-muted-foreground">Supports WAV, MP3, M4A, and other audio formats</p>
                  </div>
                </div>
              )}
            </div>

            {/* Agent Name Input - now required */}
            <div className="space-y-2">
              <Label htmlFor="agentName">
                Agent Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="agentName"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                placeholder="Enter agent name for the analysis"
                required // Added required attribute
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {isUploading && (
              <div className="space-y-2">
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-muted-foreground text-center">
                  Processing your audio file... This may take a few moments.
                </p>
              </div>
            )}

            <Button type="submit" disabled={!file || !agentName.trim() || isUploading} className="w-full" size="lg">
              {isUploading ? "Analyzing..." : "Analyze Audio"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
