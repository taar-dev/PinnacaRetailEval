import { ConnectionTest } from "@/components/connection-test"

export default function TestConnectionPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Connection Test</h1>
        <p className="text-muted-foreground">Test the connection between your Next.js frontend and Flask backend</p>
      </div>

      <ConnectionTest />
    </div>
  )
}
