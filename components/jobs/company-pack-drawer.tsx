"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Save, Building2, Users, Lightbulb, HelpCircle, AlertTriangle, Calendar, CheckCircle2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { apiRequest, APIError } from "@/lib/api-client"
import { documentsAPI } from "@/lib/api/documents"
import { Job } from "@/lib/api/jobs"

interface CompanyPackDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  job: Job | null
}

export function CompanyPackDrawer({ open, onOpenChange, job }: CompanyPackDrawerProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [pack, setPack] = useState<any>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (open && job && !pack) {
      loadCompanyPack()
    }
  }, [open, job])

  const loadCompanyPack = async () => {
    if (!job) return

    setLoading(true)
    try {
      const response = await apiRequest<{
        document_id?: number
        content: {
          company_overview: string
          competitors: string[]
          interview_angles: string[]
          questions_to_ask: string[]
          role_risks: string[]
          plan_30_60_90: {
            days_30: string
            days_60: string
            days_90: string
          }
        }
        preview: string
      }>("/ai/company-pack", {
        method: "POST",
        body: JSON.stringify({
          job_id: job.id,
          company: job.company,
          job_title: job.title,
          save_to_drive: false,  // Don't auto-save, let user choose
        }),
      })

      setPack(response.content)
      setSaved(!!response.document_id)
    } catch (err) {
      setLoading(false)
      if (err instanceof APIError) {
        if (err.status === 402) {
          toast({
            title: "Premium required",
            description: "Company Research Pack is a premium feature. Please upgrade to continue.",
            variant: "destructive",
          })
        } else {
          toast({
            title: "Failed to generate pack",
            description: err.message || "Please try again later.",
            variant: "destructive",
          })
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to generate company research pack. Please try again.",
          variant: "destructive",
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSaveToDrive = async () => {
    if (!job) return

    setLoading(true)
    try {
      const response = await apiRequest<{ document_id: number }>("/ai/company-pack", {
        method: "POST",
        body: JSON.stringify({
          job_id: job.id,
          company: job.company,
          job_title: job.title,
          save_to_drive: true,
        }),
      })

      setSaved(true)
      toast({
        title: "Saved to Drive!",
        description: "Company research pack has been saved to your Drive.",
      })
    } catch (err) {
      setLoading(false)
      toast({
        title: "Failed to save",
        description: err instanceof APIError ? err.message : "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!job) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Company Research Pack
          </DialogTitle>
          <DialogDescription>
            Research insights for {job.company} - {job.title}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 space-y-6">
          {loading && !pack ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : pack ? (
            <>
              {/* Company Overview */}
              {pack.company_overview && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Company Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {pack.company_overview}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Competitors */}
              {pack.competitors && pack.competitors.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Competitors
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {pack.competitors.map((competitor: string, idx: number) => (
                        <li key={idx} className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{competitor}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Interview Angles */}
              {pack.interview_angles && pack.interview_angles.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5" />
                      Interview Angles
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {pack.interview_angles.map((angle: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-sm">•</span>
                          <span className="text-sm">{angle}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Questions to Ask */}
              {pack.questions_to_ask && pack.questions_to_ask.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <HelpCircle className="h-5 w-5" />
                      Questions to Ask
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {pack.questions_to_ask.map((question: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-sm">•</span>
                          <span className="text-sm">{question}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Role Risks */}
              {pack.role_risks && pack.role_risks.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-orange-500" />
                      Role Risks
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {pack.role_risks.map((risk: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5" />
                          <span className="text-sm">{risk}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* 30-60-90 Plan */}
              {pack.plan_30_60_90 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      30-60-90 Day Plan
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {pack.plan_30_60_90.days_30 && (
                      <div>
                        <h4 className="font-semibold text-sm mb-2">30 Days</h4>
                        <p className="text-sm text-muted-foreground">
                          {pack.plan_30_60_90.days_30}
                        </p>
                      </div>
                    )}
                    {pack.plan_30_60_90.days_60 && (
                      <div>
                        <h4 className="font-semibold text-sm mb-2">60 Days</h4>
                        <p className="text-sm text-muted-foreground">
                          {pack.plan_30_60_90.days_60}
                        </p>
                      </div>
                    )}
                    {pack.plan_30_60_90.days_90 && (
                      <div>
                        <h4 className="font-semibold text-sm mb-2">90 Days</h4>
                        <p className="text-sm text-muted-foreground">
                          {pack.plan_30_60_90.days_90}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Save Button */}
              <div className="flex justify-end pt-4 border-t">
                <Button
                  onClick={handleSaveToDrive}
                  disabled={loading || saved}
                  className="gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : saved ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Saved to Drive
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save to Drive
                    </>
                  )}
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No pack data available
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
