"use client"

import { useState } from "react"
import { Link2, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { jobsAPI } from "@/lib/api/jobs"
import { useToast } from "@/hooks/use-toast"
import { APIError } from "@/lib/api-client"

interface ImportJobModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

const SUPPORTED_DOMAINS = [
  "linkedin.com",
  "indeed.com",
  "greenhouse.io",
  "lever.co",
  "apply.workable.com",
]

export function ImportJobModal({ open, onOpenChange, onSuccess }: ImportJobModalProps) {
  const { toast } = useToast()
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validateUrl = (urlString: string): boolean => {
    if (!urlString.trim()) {
      setError("Please enter a job URL")
      return false
    }

    try {
      const urlObj = new URL(urlString)
      const hostname = urlObj.hostname.toLowerCase()
      const isSupported = SUPPORTED_DOMAINS.some((domain) => hostname.includes(domain))

      if (!isSupported) {
        setError(
          `Unsupported URL. Supported platforms: LinkedIn, Indeed, Greenhouse, Lever, Workable`
        )
        return false
      }
      return true
    } catch {
      setError("Invalid URL format")
      return false
    }
  }

  const handleImport = async () => {
    setError(null)

    if (!validateUrl(url)) {
      return
    }

    setLoading(true)
    try {
      const result = await jobsAPI.importUrl({
        source_url: url,
        company: undefined,
        title: undefined,
        location: undefined,
      })

      toast({
        title: "Job imported successfully!",
        description: `${result.company || "Job"} - ${result.title || "Position"} has been added.`,
      })

      setUrl("")
      onOpenChange(false)
      onSuccess?.()
    } catch (err: any) {
      const errorMsg =
        err instanceof APIError
          ? err.message
          : err.detail?.detail || err.detail || err.message || "Failed to import job"
      setError(errorMsg)
      toast({
        title: "Import failed",
        description: errorMsg,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-primary" />
            Import Job from URL
          </DialogTitle>
          <DialogDescription>
            Paste a job posting URL from LinkedIn, Indeed, Greenhouse, Lever, or Workable to
            automatically extract job details.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="job-url">Job Posting URL</Label>
            <Input
              id="job-url"
              type="url"
              placeholder="https://linkedin.com/jobs/view/..."
              value={url}
              onChange={(e) => {
                setUrl(e.target.value)
                setError(null)
              }}
              disabled={loading}
              className={error ? "border-destructive" : ""}
            />
            {error && (
              <Alert variant="destructive" className="mt-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="rounded-lg bg-muted p-3 text-sm">
            <div className="font-medium mb-2">Supported platforms:</div>
            <div className="flex flex-wrap gap-2">
              {SUPPORTED_DOMAINS.map((domain) => (
                <Badge key={domain} variant="outline" className="text-xs">
                  {domain.replace(".com", "").replace(".io", "").replace(".co", "")}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={loading || !url.trim()}>
            {loading ? (
              <>
                <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Link2 className="h-4 w-4 mr-2" />
                Import Job
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}