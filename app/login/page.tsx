import { Suspense } from "react"
import { LoginClient } from "./login-client"
import { LoadingSkeleton } from "@/components/shared/loading-skeleton"

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4">
          <LoadingSkeleton count={3} />
        </div>
      </div>
    }>
      <LoginClient />
    </Suspense>
  )
}
