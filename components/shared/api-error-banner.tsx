"use client"

import { useEffect, useState } from "react"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Use a singleton pattern to ensure banner only renders once
let bannerChecked = false

export function APIErrorBanner() {
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    // Only check once per app lifecycle
    if (bannerChecked || typeof window === 'undefined') return
    bannerChecked = true

    // Support both NEXT_PUBLIC_API_BASE_URL (new) and NEXT_PUBLIC_API_URL (legacy)
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL
    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    const hasApiUrl = (apiBaseUrl && apiBaseUrl.trim() !== '') || (apiUrl && apiUrl.trim() !== '')

    // Only show banner in development if URL is missing
    // Since we set NEXT_PUBLIC_API_BASE_URL in .env.local, this should not show
    if (!hasApiUrl && process.env.NODE_ENV === "development") {
      setShowBanner(true)
    }
  }, [])

  // Don't render if API URL is configured (should be hidden now that .env.local is set)
  if (!showBanner) return null

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

// Helper to check if API is configured (for runtime checks)
// Always returns true now since we have a fallback URL
export function isAPIConfigured(): boolean {
  if (typeof window === 'undefined') return true // Server-side, assume configured
  // Always return true - we have a fallback URL in getBaseURL()
  return true
}
