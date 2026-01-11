"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FileText, Loader2, CheckCircle2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { aiAPI, JobPackRequest } from "@/lib/api/ai"
import { APIError } from "@/lib/api-client"
import { UpgradeModal } from "@/components/upgrade-modal"
import { auth } from "@/lib/auth"
import { Job } from "@/lib/api/jobs"
import { AppDocument } from "@/lib/api/documents"

interface JobPackButtonProps {
  job: Job
  resumeId?: number | null
  onComplete?: () => void
}

export function JobPackButton({ job, resumeId, onComplete }: JobPackButtonProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false)
  const userPlan = auth.getUser()?.plan || "free"

  const handleGeneratePack = async () => {
    if (!resumeId) {
      toast({
        title: "Resume required",
        description: "Please select a resume first to generate the application pack.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const request: JobPackRequest = {
        resume_id: resumeId,
        job_id: job.id,
        company: job.company,
        job_title: job.title,
      }

      const response = await aiAPI.jobPack(request)

      // Count successful documents
      const docCount = [
        response.resume_doc_id,
        response.cover_letter_doc_id,
        response.outreach_doc_id,
        response.interview_pack_doc_id,
      ].filter((id) => id !== null && id !== undefined).length

      toast({
        title: "Application Pack Generated!",
        description: `${docCount} documents created and saved to your Drive.`,
      })

      if (onComplete) {
        onComplete()
      }

      // Optionally navigate to drive
      setTimeout(() => {
        router.push("/drive")
      }, 1500)
    } catch (err) {
      setLoading(false)
      if (err instanceof APIError) {
        if (err.status === 402) {
          // Payment required - show upgrade modal
          setUpgradeModalOpen(true)
          return
        }
        toast({
          title: "Failed to generate pack",
          description: err.message || "Please try again later.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to generate application pack. Please try again.",
          variant: "destructive",
        })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleGeneratePack}
        disabled={loading || !resumeId}
        className="gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <FileText className="h-4 w-4" />
            Generate Application Pack
          </>
        )}
      </Button>

      <UpgradeModal
        open={upgradeModalOpen}
        onOpenChange={setUpgradeModalOpen}
      />
    </>
  )
}
