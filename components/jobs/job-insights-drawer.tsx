"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  X,
  BarChart3,
  Users,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Send,
  FileText,
  Save,
  Sparkles,
  ArrowRight,
  Copy,
  Briefcase,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Job } from "@/lib/api/jobs"
import { matchAPI, JobMatchResponse, RecruiterLensResponse } from "@/lib/api/match"
import { outreachAPI, OutreachRequest } from "@/lib/api/outreach"
import { aiAPI, InterviewPackRequest, InterviewPackResponse } from "@/lib/api/ai"
import { documentsAPI } from "@/lib/api/documents"
import { useToast } from "@/hooks/use-toast"
import { APIError } from "@/lib/api-client"

interface JobInsightsDrawerProps {
  job: Job | null
  open: boolean
  onOpenChange: (open: boolean) => void
  resumeId?: number | null
  onInterviewPackGenerated?: () => void
}

export function JobInsightsDrawer({
  job,
  open,
  onOpenChange,
  resumeId,
  onInterviewPackGenerated,
}: JobInsightsDrawerProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [matchData, setMatchData] = useState<JobMatchResponse | null>(null)
  const [recruiterLens, setRecruiterLens] = useState<RecruiterLensResponse | null>(null)
  const [outreachMessages, setOutreachMessages] = useState<Array<{ type: string; message: string; subject?: string }>>([])
  const [loadingOutreach, setLoadingOutreach] = useState(false)
  const [savingOutreach, setSavingOutreach] = useState(false)

  useEffect(() => {
    if (open && job && resumeId) {
      loadInsights()
    }
  }, [open, job?.id, resumeId])

  const loadInsights = async () => {
    if (!job || !resumeId) return

    setLoading(true)
    try {
      // Load match data
      const match = await matchAPI.jobMatch({
        resume_id: resumeId,
        job_id: job.id,
      })
      setMatchData(match)

      // Load recruiter lens
      try {
        const lens = await matchAPI.recruiterLens({
          resume_id: resumeId,
          job_id: job.id,
        })
        setRecruiterLens(lens)
      } catch (err) {
        console.warn("Recruiter lens failed:", err)
      }
    } catch (err: any) {
      toast({
        title: "Failed to load insights",
        description: err.message || "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const generateOutreach = async () => {
    if (!job || !resumeId) return

    setLoadingOutreach(true)
    try {
      const types: Array<"recruiter_followup" | "linkedin_dm" | "thank_you" | "referral_ask"> = [
        "linkedin_dm",
        "recruiter_followup",
        "referral_ask",
      ]

      const messages = await Promise.all(
        types.map(async (type) => {
          const result = await outreachAPI.generate({
            message_type: type,
            resume_id: resumeId,
            job_id: job.id,
            company: job.company,
            job_title: job.title,
          })
          return {
            type,
            message: result.message,
            subject: result.subject,
          }
        })
      )

      setOutreachMessages(messages)
      toast({
        title: "Outreach messages generated!",
        description: "Review and customize your messages below.",
      })
    } catch (err: any) {
      toast({
        title: "Failed to generate outreach",
        description: err.message || "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setLoadingOutreach(false)
    }
  }

  const handleSaveOutreach = async (message: { type: string; message: string; subject?: string }) => {
    if (!job) return

    setSavingOutreach(true)
    try {
      const content = message.subject ? `Subject: ${message.subject}\n\n${message.message}` : message.message
      await documentsAPI.create({
        title: `Outreach: ${job.company} - ${message.type.replace("_", " ")}`,
        type: "cover_letter",
        content_text: content,
        tags: ["outreach", message.type.replace("_", "-"), job.company.toLowerCase().replace(/\s+/g, "-")],
      })

      toast({
        title: "Saved to Drive",
        description: "Outreach message has been saved.",
      })
    } catch (err: any) {
      toast({
        title: "Failed to save",
        description: err.message || "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setSavingOutreach(false)
    }
  }

  const handleGenerateInterviewPack = async () => {
    if (!job || !resumeId) return

    setLoading(true)
    try {
      const result = await aiAPI.interviewPack({
        resume_id: resumeId,
        job_id: job.id,
        save_to_drive: true,
      })

      toast({
        title: "Interview Pack generated!",
        description: "Check your Drive for the complete interview preparation pack.",
      })

      onInterviewPackGenerated?.()
      onOpenChange(false)
    } catch (err: any) {
      toast({
        title: "Failed to generate interview pack",
        description: err.message || "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  if (!job) return null

  return (
    <AnimatePresence>
      {open && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => onOpenChange(false)}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-2xl bg-background border-l shadow-2xl z-50 overflow-y-auto"
          >
            <div className="sticky top-0 bg-background border-b z-10 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{job.company}</h2>
                <p className="text-muted-foreground">{job.title}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="p-6 space-y-6">
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-64 w-full" />
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-32 w-full" />
                </div>
              ) : matchData ? (
                <>
                  {/* Match Score Gauge */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-primary" />
                        Match Score
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-center py-6">
                        <div className="relative w-48 h-48">
                          <svg className="transform -rotate-90 w-48 h-48">
                            <circle
                              cx="96"
                              cy="96"
                              r="84"
                              stroke="currentColor"
                              strokeWidth="12"
                              fill="none"
                              className="text-muted"
                            />
                            <circle
                              cx="96"
                              cy="96"
                              r="84"
                              stroke="currentColor"
                              strokeWidth="12"
                              fill="none"
                              strokeDasharray={`${2 * Math.PI * 84}`}
                              strokeDashoffset={`${2 * Math.PI * 84 * (1 - matchData.match_score / 100)}`}
                              className={getScoreColor(matchData.match_score)}
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                              <div className={`text-4xl font-bold ${getScoreColor(matchData.match_score)}`}>
                                {matchData.match_score}%
                              </div>
                              <div className="text-sm text-muted-foreground mt-1">Compatibility</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Missing Skills */}
                  {Array.isArray(matchData.missing?.skills) && matchData.missing.skills.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <XCircle className="h-5 w-5 text-red-500" />
                          Missing Skills
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {matchData.missing.skills.map((skill: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-sm">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Recruiter Lens Summary */}
                  {recruiterLens && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Users className="h-5 w-5 text-primary" />
                          Recruiter Lens
                        </CardTitle>
                        <CardDescription>How recruiters view your application</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">First Impression</h4>
                          <p className="text-sm text-muted-foreground">{recruiterLens.first_impression}</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium mb-2 flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                              Strengths
                            </h4>
                            <ul className="space-y-1">
                              {recruiterLens.strengths.map((strength, index) => (
                                <li key={index} className="text-sm flex items-start gap-2">
                                  <CheckCircle2 className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                                  {strength}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h4 className="font-medium mb-2 flex items-center gap-2">
                              <XCircle className="h-4 w-4 text-red-500" />
                              Red Flags
                            </h4>
                            <ul className="space-y-1">
                              {recruiterLens.red_flags.length > 0 ? (
                                recruiterLens.red_flags.map((flag, index) => (
                                  <li key={index} className="text-sm flex items-start gap-2">
                                    <XCircle className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                                    {flag}
                                  </li>
                                ))
                              ) : (
                                <li className="text-sm text-muted-foreground">None identified</li>
                              )}
                            </ul>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Shortlist Decision</h4>
                          <Badge variant={recruiterLens.shortlist_decision.toLowerCase().includes("yes") ? "default" : "secondary"}>
                            {recruiterLens.shortlist_decision}
                          </Badge>
                        </div>

                        {recruiterLens.fixes.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2 flex items-center gap-2">
                              <TrendingUp className="h-4 w-4 text-primary" />
                              Recommended Fixes
                            </h4>
                            <ul className="space-y-1">
                              {recruiterLens.fixes.map((fix, index) => (
                                <li key={index} className="text-sm flex items-start gap-2">
                                  <ArrowRight className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                                  {fix}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* ATS Risk Warnings */}
                  {Array.isArray(matchData.risks?.flags) && matchData.risks.flags.length > 0 && (
                    <Card className="border-orange-500/50">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-orange-500" />
                          ATS Risk Warnings
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {matchData.risks.flags.map((flag: string, index: number) => (
                            <div key={index} className="flex items-start gap-2 p-2 rounded border border-orange-200 bg-orange-50 dark:bg-orange-950/20">
                              <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                              <p className="text-sm">{flag}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <Separator />

                  {/* Outreach Suggestions */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Send className="h-5 w-5 text-primary" />
                        Outreach Suggestions
                      </CardTitle>
                      <CardDescription>AI-generated messages ready to send</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {outreachMessages.length === 0 ? (
                        <Button onClick={generateOutreach} disabled={loadingOutreach} className="w-full" variant="outline">
                          {loadingOutreach ? (
                            <>
                              <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4 mr-2" />
                              Generate Outreach Messages
                            </>
                          )}
                        </Button>
                      ) : (
                        outreachMessages.map((msg, index) => (
                          <Card key={index} className="bg-muted/50">
                            <CardHeader className="pb-3">
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-sm capitalize">{msg.type.replace("_", " ")}</CardTitle>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleSaveOutreach(msg)}
                                  disabled={savingOutreach}
                                >
                                  <Save className="h-4 w-4 mr-2" />
                                  Save
                                </Button>
                              </div>
                              {msg.subject && (
                                <CardDescription className="text-xs font-medium">{msg.subject}</CardDescription>
                              )}
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </CardContent>
                  </Card>

                  {/* Interview Pack Button */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        Interview Preparation
                      </CardTitle>
                      <CardDescription>Generate complete interview pack with questions and talking points</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button onClick={handleGenerateInterviewPack} disabled={loading || !resumeId} className="w-full" size="lg">
                        {loading ? (
                          <>
                            <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Briefcase className="h-4 w-4 mr-2" />
                            Generate Interview Pack
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">
                      {resumeId
                        ? "Click &quot;Generate Insights&quot; to analyze this job"
                        : "Please select a resume to view insights"}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}