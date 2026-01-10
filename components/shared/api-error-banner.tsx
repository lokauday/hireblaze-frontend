"use client"

import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function APIErrorBanner() {
  // Runtime check: access env vars at runtime (not build time)
  // Support both NEXT_PUBLIC_API_BASE_URL (new) and NEXT_PUBLIC_API_URL (legacy)
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL
  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  const hasApiUrl = (apiBaseUrl && apiBaseUrl.trim() !== '') || (apiUrl && apiUrl.trim() !== '')

  // Don't show error if we have a valid URL or if we're in production (where env vars should be set via Vercel)
  // The API client has a fallback to production URL, so only show error in development if truly missing
  if (!hasApiUrl && process.env.NODE_ENV === "development") {
    return (
      <Alert variant="default" className="m-4 border-blue-500/50 bg-blue-50 dark:bg-blue-950/20">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-800 dark:text-blue-200">Using Default API URL</AlertTitle>
        <AlertDescription className="text-blue-700 dark:text-blue-300">
          API URL not configured. Using default production URL. For local development, create <code className="text-xs bg-muted px-1 py-0.5 rounded">.env.local</code> with:
          <br />
          <code className="text-xs mt-2 block bg-muted p-2 rounded">
            NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
          </code>
        </AlertDescription>
      </Alert>
    )
  }

  // Don't show error in production - env vars should be set via Vercel
  // If not set, the API client will use the fallback URL
  return null
}

// Helper to check if API is configured (for runtime checks)
// Always returns true now since we have a fallback URL
export function isAPIConfigured(): boolean {
  if (typeof window === 'undefined') return true // Server-side, assume configured
  // Always return true - we have a fallback URL in getBaseURL()
  return true
}
