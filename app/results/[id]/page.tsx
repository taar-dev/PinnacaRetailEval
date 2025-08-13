import { ResultDetail } from "@/components/result-detail"
import { notFound } from "next/navigation"

async function getResult(id: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/results/${id}`, {
      cache: "no-store",
    })

    if (!response.ok) {
      return null
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching result:", error)
    return null
  }
}

export default async function ResultDetailPage({ params }: { params: { id: string } }) {
  const result = await getResult(params.id)

  if (!result) {
    notFound()
  }

  return <ResultDetail result={result} />
}
