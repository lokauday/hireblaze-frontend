import { Suspense } from "react"
import { JobsClient } from "./jobs-client"
import { LoadingSkeleton, TableSkeleton } from "@/components/shared/loading-skeleton"

export default function JobsPage() {
  return (
    <Suspense fallback={
      <div className="page-transition">
        <div className="space-y-6 mb-6">
          <div className="space-y-2">
            <div className="h-9 w-64 bg-muted animate-pulse rounded" />
            <div className="h-5 w-96 bg-muted animate-pulse rounded" />
          </div>
        </div>
        <TableSkeleton rows={5} />
      </div>
    }>
      <JobsClient />
    </Suspense>
  )
}
