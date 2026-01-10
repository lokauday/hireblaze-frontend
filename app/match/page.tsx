"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Users,
  Sparkles,
  ArrowRight,
  Save,
  Download,
  FileText,
  Briefcase,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { PageHeader } from "@/components/layout/page-header"
import { LoadingSkeleton } from "@/components/shared/loading-skeleton"
import { EmptyState } from "@/components/shared/empty-state"
import { matchAPI, JobMatchRequest, JobMatchResponse, RecruiterLensResponse } from "@/lib/api/match"
import { documentsAPI, AppDocument } from "@/lib/api/documents"
import { jobsAPI, Job } from "@/lib/api/jobs"
import { useToast } from "@/hooks/use-toast"
import { APIError } from "@/lib/api-client"
import Link from "next/link"

interface MatchResult extends JobMatchResponse {
  recruiterLens?: RecruiterLensResponse
}

export default function MatchPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [resumes, setResumes] = useState<AppDocument[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [selectedResumeId, setSelectedResumeId] = useState<string>("")
  const [selectedJobId, setSelectedJobId] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoadingData(true)
    try {
      const [resumesRes, jobsRes] = await Promise.all([
        documentsAPI.list({ type: "resume", page_size: 100 }),
        jobsAPI.list({ page_size: 100 }),
      ])
      setResumes(resumesRes.documents)
      setJobs(jobsRes.jobs)
    } catch (err: any) {
      toast({
        title: "Failed to load data",
        description: err.message || "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setLoadingData(false)
    }
  }

  const handleRunMatch = async () => {
    if (!selectedResumeId || !selectedJobId) {
      toast({
        title: "Selection required",
        description: "Please select both a resume and a job.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setMatchResult(null)

    try {
      const resume = resumes.find((r) => r.id.toString() === selectedResumeId)
      const job = jobs.find((j) => j.id.toString() === selectedJobId)

      if (!resume || !job) {
        throw new Error("Selected resume or job not found")
      }

      const matchRequest: JobMatchRequest = {
        resume_id: resume.id,
        job_id: parseInt(selectedJobId),
      }

      // Run match analysis
      const matchData = await matchAPI.jobMatch(matchRequest)

      // Get recruiter lens analysis
      let recruiterLens: RecruiterLensResponse | undefined
      try {
        recruiterLens = await matchAPI.recruiterLens({
          ...matchRequest,
          save_to_drive: false,
        })
      } catch (err) {
        console.warn("Recruiter lens analysis failed:", err)
      }

      setMatchResult({
        ...matchData,
        recruiterLens,
      })

      toast({
        title: "Match analysis complete!",
        description: `Match score: ${matchData.match_score}%`,
      })
    } catch (err: any) {
      const errorMsg =
        err instanceof APIError
          ? err.message
          : err.detail?.detail || err.detail || err.message || "Failed to analyze match"
      toast({
        title: "Match analysis failed",
        description: errorMsg,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveToDrive = async () => {
    if (!matchResult || !selectedResumeId || !selectedJobId) {
      return
    }

    setSaving(true)
    try {
      const resume = resumes.find((r) => r.id.toString() === selectedResumeId)
      const job = jobs.find((j) => j.id.toString() === selectedJobId)

      if (!resume || !job) {
        throw new Error("Selected resume or job not found")
      }

      const content = `# Job Match Analysis: ${job.company} - ${job.title}

## Match Score: ${matchResult.match_score}%

### Missing Skills
${Array.isArray(matchResult.missing?.skills) ? matchResult.missing.skills.map((s: string) => `- ${s}`).join("\n") : "None identified"}

### Skill Overlap
${typeof matchResult.overlap === "object" ? JSON.stringify(matchResult.overlap, null, 2) : "N/A"}

### Risk Flags
${Array.isArray(matchResult.risks?.flags) ? matchResult.risks.flags.map((f: string) => `- ${f}`).join("\n") : "None identified"}

### Improvement Plan
${typeof matchResult.improvement_plan === "object" ? JSON.stringify(matchResult.improvement_plan, null, 2) : "N/A"}

${matchResult.recruiterLens ? `
## Recruiter Lens Analysis

**First Impression:** ${matchResult.recruiterLens.first_impression}

**Strengths:**
${matchResult.recruiterLens.strengths.map((s) => `- ${s}`).join("\n")}

**Red Flags:**
${matchResult.recruiterLens.red_flags.map((f) => `- ${f}`).join("\n")}

**Shortlist Decision:** ${matchResult.recruiterLens.shortlist_decision}

**Recommended Fixes:**
${matchResult.recruiterLens.fixes.map((f) => `- ${f}`).join("\n")}
` : ""}
`

      await documentsAPI.create({
        title: `Match Analysis: ${job.company} - ${job.title}`,
        type: "interview_notes",
        content_text: content,
        tags: ["match-analysis", job.company.toLowerCase().replace(/\s+/g, "-")],
      })

      toast({
        title: "Saved to Drive",
        description: "Match analysis has been saved to your AI Drive.",
      })
    } catch (err: any) {
      toast({
        title: "Failed to save",
        description: err.message || "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-green-500"
    if (score >= 60) return "bg-yellow-500"
    return "bg-red-500"
  }

  return (
    <div className="page-transition space-y-6">
      <PageHeader
        title="Job Match Score"
        subtitle="Analyze compatibility between your resume and job descriptions"
      />

      {loadingData ? (
        <LoadingSkeleton count={3} />
      ) : (
        <>
          {/* Selection Section */}
          <Card>
            <CardHeader>
              <CardTitle>Select Resume & Job</CardTitle>
              <CardDescription>Choose documents from your Drive and Jobs to analyze</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Resume
                  </label>
                  <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a resume from Drive" />
                    </SelectTrigger>
                    <SelectContent>
                      {resumes.length === 0 ? (
                        <div className="p-2 text-sm text-muted-foreground text-center">
                          No resumes found. <Link href="/drive" className="text-primary underline">Upload one</Link>
                        </div>
                      ) : (
                        resumes.map((resume) => (
                          <SelectItem key={resume.id} value={resume.id.toString()}>
                            {resume.title}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Job
                  </label>
                  <Select value={selectedJobId} onValueChange={setSelectedJobId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a job from Jobs" />
                    </SelectTrigger>
                    <SelectContent>
                      {jobs.length === 0 ? (
                        <div className="p-2 text-sm text-muted-foreground text-center">
                          No jobs found. <Link href="/jobs" className="text-primary underline">Add one</Link>
                        </div>
                      ) : (
                        jobs.map((job) => (
                          <SelectItem key={job.id} value={job.id.toString()}>
                            {job.company} - {job.title}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={handleRunMatch}
                disabled={loading || !selectedResumeId || !selectedJobId || resumes.length === 0 || jobs.length === 0}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Run Match Analysis
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results Section */}
          {matchResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Match Score Gauge */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Match Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center py-8">
                    <div className="relative w-64 h-64">
                      <svg className="transform -rotate-90 w-64 h-64">
                        <circle
                          cx="128"
                          cy="128"
                          r="112"
                          stroke="currentColor"
                          strokeWidth="16"
                          fill="none"
                          className="text-muted"
                        />
                        <circle
                          cx="128"
                          cy="128"
                          r="112"
                          stroke="currentColor"
                          strokeWidth="16"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 112}`}
                          strokeDashoffset={`${2 * Math.PI * 112 * (1 - matchResult.match_score / 100)}`}
                          className={getScoreColor(matchResult.match_score)}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className={`text-5xl font-bold ${getScoreColor(matchResult.match_score)}`}>
                            {matchResult.match_score}%
                          </div>
                          <div className="text-sm text-muted-foreground mt-2">Compatibility</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid lg:grid-cols-2 gap-6">
                {/* Missing Skills */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <XCircle className="h-5 w-5 text-red-500" />
                      Missing Skills
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {Array.isArray(matchResult.missing?.skills) && matchResult.missing.skills.length > 0 ? (
                      <div className="space-y-2">
                        {matchResult.missing.skills.map((skill: string, index: number) => (
                          <Badge key={index} variant="outline" className="mr-2 mb-2">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No missing skills identified.</p>
                    )}
                  </CardContent>
                </Card>

                {/* Risk Flags */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-orange-500" />
                      Risk Flags
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {Array.isArray(matchResult.risks?.flags) && matchResult.risks.flags.length > 0 ? (
                      <div className="space-y-2">
                        {matchResult.risks.flags.map((flag: string, index: number) => (
                          <div key={index} className="flex items-start gap-2 p-2 rounded border border-orange-200 bg-orange-50 dark:bg-orange-950/20">
                            <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                            <p className="text-sm">{flag}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No risk flags identified.</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Recruiter Lens Panel */}
              {matchResult.recruiterLens && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      Recruiter Lens
                    </CardTitle>
                    <CardDescription>See how recruiters view your application</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">First Impression</h4>
                      <p className="text-sm text-muted-foreground">{matchResult.recruiterLens.first_impression}</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          Strengths
                        </h4>
                        <ul className="space-y-1">
                          {matchResult.recruiterLens.strengths.map((strength, index) => (
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
                          {matchResult.recruiterLens.red_flags.length > 0 ? (
                            matchResult.recruiterLens.red_flags.map((flag, index) => (
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
                      <Badge variant={matchResult.recruiterLens.shortlist_decision.toLowerCase().includes("yes") ? "default" : "secondary"}>
                        {matchResult.recruiterLens.shortlist_decision}
                      </Badge>
                    </div>

                    {matchResult.recruiterLens.fixes.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Recommended Fixes</h4>
                        <ul className="space-y-1">
                          {matchResult.recruiterLens.fixes.map((fix, index) => (
                            <li key={index} className="text-sm flex items-start gap-2">
                              <TrendingUp className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                              {fix}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button
                  onClick={handleSaveToDrive}
                  disabled={saving}
                  variant="outline"
                  className="flex-1"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Saving..." : "Save to Drive"}
                </Button>
                <Button
                  onClick={() => router.push(`/ai-tools?tab=tailor&resume_id=${selectedResumeId}&job_id=${selectedJobId}`)}
                  className="flex-1"
                >
                  Improve Score
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {!matchResult && !loading && (
            <EmptyState
              icon={BarChart3}
              title="Ready to analyze"
              description="Select a resume and job above to get started with match analysis"
            />
          )}
        </>
      )}
    </div>
  )
}