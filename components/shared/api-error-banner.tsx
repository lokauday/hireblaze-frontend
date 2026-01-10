"use client"

import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

/**
 * Check if API base URL is configured.
 * Supports both NEXT_PUBLIC_API_BASE_URL (preferred) and NEXT_PUBLIC_API_URL (legacy).
 */
function getAPIUrl(): string | undefined {
  return process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL
}

export function APIErrorBanner() {
  // Runtime check: access env var at runtime (not build time)
  // Check both NEXT_PUBLIC_API_BASE_URL (preferred) and NEXT_PUBLIC_API_URL (legacy)
  const apiUrl = getAPIUrl()

  // Show banner if API URL is missing (both dev and production)
  if (!apiUrl || apiUrl.trim() === '') {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>API Not Configured</AlertTitle>
        <AlertDescription>
          <span className="block mb-2">
            <code className="font-semibold">NEXT_PUBLIC_API_BASE_URL</code> or <code className="font-semibold">NEXT_PUBLIC_API_URL</code> is not set.
            API requests will fail. Please set this environment variable.
          </span>
          <code className="text-xs mt-2 block bg-muted p-2 rounded">
            NEXT_PUBLIC_API_BASE_URL=https://your-railway-backend.up.railway.app
          </code>
          <span className="text-xs text-muted-foreground mt-2 block">
            {process.env.NODE_ENV === "development" 
              ? "For local development: NEXT_PUBLIC_API_BASE_URL=http://localhost:8000"
              : "Set this in your Vercel environment variables"}
          </span>
        </AlertDescription>
      </Alert>
    )
  }

  // In development, show info banner if using default production URL
  if (process.env.NODE_ENV === "development" && apiUrl === "https://hireblaze-api-production.up.railway.app") {
    return (
      <Alert variant="default" className="m-4 border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20">
        <AlertCircle className="h-4 w-4 text-yellow-600" />
        <AlertTitle className="text-yellow-800 dark:text-yellow-200">Using Default API URL</AlertTitle>
        <AlertDescription className="text-yellow-700 dark:text-yellow-300">
          API base URL not set. Using default production URL. Set <code className="text-xs bg-yellow-100 dark:bg-yellow-900 px-1 rounded">NEXT_PUBLIC_API_BASE_URL</code> in .env.local for local development.
        </AlertDescription>
      </Alert>
    )
  }

  return null
}

// Helper to check if API is configured (for runtime checks)
export function isAPIConfigured(): boolean {
  if (typeof window === 'undefined') return true // Server-side, assume configured
  const apiUrl = getAPIUrl()
  return !!apiUrl && apiUrl.trim() !== ''
}
