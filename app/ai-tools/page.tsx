import { Suspense } from "react"
import { AIToolsClient } from "./ai-tools-client"
import { LoadingSkeleton } from "@/components/shared/loading-skeleton"

export default function AIToolsPage() {
  return (
    <Suspense fallback={
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-9 w-64 bg-muted animate-pulse rounded" />
          <div className="h-5 w-96 bg-muted animate-pulse rounded" />
        </div>
        <LoadingSkeleton count={6} />
      </div>
    }>
      <AIToolsClient />
    </Suspense>
  )
}
