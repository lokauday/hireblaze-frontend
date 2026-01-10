"use client"

import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function APIErrorBanner() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL

  // Only show in development
  if (process.env.NODE_ENV !== "development") {
    return null
  }

  if (!apiUrl) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>API URL Not Configured</AlertTitle>
        <AlertDescription>
          NEXT_PUBLIC_API_URL is not set. Please set it in your .env.local file.
          <br />
          <code className="text-xs mt-2 block bg-muted p-2 rounded">
            NEXT_PUBLIC_API_URL=https://your-railway-backend.up.railway.app
          </code>
          <span className="text-xs text-muted-foreground mt-2 block">
            For local development: NEXT_PUBLIC_API_URL=http://localhost:8000
          </span>
        </AlertDescription>
      </Alert>
    )
  }

  return null
}
