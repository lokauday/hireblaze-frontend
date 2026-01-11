"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Plus, Briefcase, LayoutGrid, List, Link2, FileSearch, BarChart3, Sparkles } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/layout/page-header"
import { JobFilters } from "@/components/jobs/job-filters"
import { JobTable } from "@/components/jobs/job-table"
import { JobForm } from "@/components/jobs/job-form"
import { ImportJobModal } from "@/components/jobs/import-job-modal"
import { ParseJDModal } from "@/components/jobs/parse-jd-modal"
import { JobInsightsDrawer } from "@/components/jobs/job-insights-drawer"
import { EmptyState } from "@/components/shared/empty-state"
import { LoadingSkeleton, TableSkeleton } from "@/components/shared/loading-skeleton"
import { jobsAPI, Job, JobCreate, JobUpdate, JobFilters as JobFiltersType } from "@/lib/api/jobs"
import { documentsAPI, AppDocument } from "@/lib/api/documents"
import { useToast } from "@/hooks/use-toast"
import { APIError } from "@/lib/api-client"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

type ViewMode = "table" | "grid"

export function JobsClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>("table")
  const [filters, setFilters] = useState<JobFiltersType>({
    page: 1,
    page_size: 20,
  })
  const [total, setTotal] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [showParseJDModal, setShowParseJDModal] = useState(false)
  const [showInsightsDrawer, setShowInsightsDrawer] = useState(false)
  const [editingJob, setEditingJob] = useState<Job | null>(null)
  const [selectedJobForInsights, setSelectedJobForInsights] = useState<Job | null>(null)
  const [resumes, setResumes] = useState<AppDocument[]>([])
  const [selectedResumeId, setSelectedResumeId] = useState<string>("")
  const [parsingJobId, setParsingJobId] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Check if edit mode from URL params
  useEffect(() => {
    const editId = searchParams.get("edit")
    if (editId && jobs.length > 0) {
      const job = jobs.find((j) => j.id === Number(editId))
      if (job) {
        setEditingJob(job)
        setShowForm(true)
      }
    }
  }, [searchParams, jobs])

  useEffect(() => {
    loadJobs()
    loadResumes()
  }, [filters])

  const loadResumes = async () => {
    try {
      const response = await documentsAPI.list({ type: "resume", page_size: 100 })
      setResumes(response.documents)
      if (response.documents.length > 0 && !selectedResumeId) {
        setSelectedResumeId(response.documents[0].id.toString())
      }
    } catch (err) {
      // Silently fail - resumes not critical for jobs page
    }
  }

  const loadJobs = async () => {
    try {
      setLoading(true)
      const response = await jobsAPI.list(filters)
      setJobs(response.jobs)
      setTotal(response.total)
    } catch (error: any) {
      console.error("Failed to load jobs:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to load jobs",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await jobsAPI.delete(id)
      toast({
        title: "Success",
        description: "Job deleted successfully",
      })
      loadJobs()
    } catch (error: any) {
      console.error("Failed to delete job:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete job",
        variant: "destructive",
      })
      throw error
    }
  }

  const handleSubmit = async (data: JobCreate | JobUpdate) => {
    try {
      setSubmitting(true)
      if (editingJob) {
        await jobsAPI.update(editingJob.id, data as JobUpdate)
        toast({
          title: "Success",
          description: "Job updated successfully",
        })
      } else {
        await jobsAPI.create(data as JobCreate)
        toast({
          title: "Success",
          description: "Job added successfully",
        })
      }
      setShowForm(false)
      setEditingJob(null)
      loadJobs()
    } catch (error: any) {
      console.error("Failed to save job:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to save job",
        variant: "destructive",
      })
      throw error
    } finally {
      setSubmitting(false)
    }
  }

  const handleFiltersChange = (newFilters: JobFiltersType) => {
    setFilters(newFilters)
  }

  const handleParseJD = async (id: number) => {
    setParsingJobId(id)
    try {
      await jobsAPI.parseJD(id)
      toast({
        title: "JD parsed successfully!",
        description: "Job description has been analyzed and skills extracted.",
      })
      loadJobs()
    } catch (error: any) {
      toast({
        title: "Parse failed",
        description: error.message || "Failed to parse job description",
        variant: "destructive",
      })
    } finally {
      setParsingJobId(null)
    }
  }

  const handleViewInsights = (job: Job) => {
    setSelectedJobForInsights(job)
    setShowInsightsDrawer(true)
  }

  const handleGenerateOutreach = (job: Job) => {
    router.push(`/outreach?job_id=${job.id}`)
  }

  const handleInterviewPack = async (job: Job) => {
    if (!selectedResumeId) {
      toast({
        title: "Resume required",
        description: "Please select a resume first to generate interview pack.",
        variant: "destructive",
      })
      return
    }

    try {
      const { aiAPI } = await import("@/lib/api/ai")
      await aiAPI.interviewPack({
        resume_id: parseInt(selectedResumeId),
        job_id: job.id,
        save_to_drive: true,
      })

      toast({
        title: "Interview Pack generated!",
        description: "Check your Drive for the complete interview preparation pack.",
      })
    } catch (error: any) {
      toast({
        title: "Failed to generate interview pack",
        description: error.message || "Please try again later.",
        variant: "destructive",
      })
    }
  }

  const handleGenerateJobPack = async (job: Job) => {
    if (!selectedResumeId) {
      toast({
        title: "Resume required",
        description: "Please select a resume first to generate the application pack.",
        variant: "destructive",
      })
      return
    }

    try {
      const { aiAPI } = await import("@/lib/api/ai")
      const { auth } = await import("@/lib/auth")
      const user = auth.getUser()
      
      // Check if user is premium
      if (user?.plan !== "premium") {
        // This will be handled by premium lock component, but we can also check here
        toast({
          title: "Premium required",
          description: "Generate Application Pack is a premium feature. Please upgrade to continue.",
          variant: "destructive",
        })
        return
      }

      const response = await aiAPI.jobPack({
        resume_id: parseInt(selectedResumeId),
        job_id: job.id,
        company: job.company,
        job_title: job.title,
      })

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

      // Refresh usage
      auth.refreshMe()
    } catch (error: any) {
      if (error.status === 402) {
        toast({
          title: "Premium required",
          description: "Generate Application Pack is a premium feature. Please upgrade to continue.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Failed to generate pack",
          description: error.message || "Please try again later.",
          variant: "destructive",
        })
      }
    }
  }

  // Statistics
  const stats = {
    total: jobs.length,
    applied: jobs.filter((j) => j.status === "applied").length,
    interviewing: jobs.filter((j) => j.status === "interviewing").length,
    offer: jobs.filter((j) => j.status === "offer").length,
  }

  return (
    <div className="page-transition">
      <PageHeader
        title="Job Tracker"
        subtitle="Manage your job applications and track progress"
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowImportModal(true)}
              className="gap-2"
            >
              <Link2 className="h-4 w-4" />
              Import Job
            </Button>
            <Button
              onClick={() => {
                setEditingJob(null)
                setShowForm(true)
              }}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Job
            </Button>
          </div>
        }
      />

      {/* Resume Selection for Insights */}
      {resumes.length > 0 && (
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Label htmlFor="resume-select" className="text-sm font-medium">
                Select Resume for Insights:
              </Label>
              <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
                <SelectTrigger id="resume-select" className="w-64">
                  <SelectValue placeholder="Select a resume" />
                </SelectTrigger>
                <SelectContent>
                  {resumes.map((resume) => (
                    <SelectItem key={resume.id} value={resume.id.toString()}>
                      {resume.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics */}
      {!loading && jobs.length > 0 && (
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card className="card-hover">
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total Jobs</div>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.applied}</div>
              <div className="text-sm text-muted-foreground">Applied</div>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">{stats.interviewing}</div>
              <div className="text-sm text-muted-foreground">Interviewing</div>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{stats.offer}</div>
              <div className="text-sm text-muted-foreground">Offers</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* View Mode Toggle */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "table" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("table")}
          >
            <List className="mr-2 h-4 w-4" />
            Table
          </Button>
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid className="mr-2 h-4 w-4" />
            Grid
          </Button>
        </div>
      </div>

      {/* Filters */}
      <JobFilters filters={filters} onFiltersChange={handleFiltersChange} />

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          {viewMode === "table" ? (
            <TableSkeleton rows={5} />
          ) : (
            <LoadingSkeleton count={6} />
          )}
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No jobs yet"
          description="Track your job applications and progress"
          action={{
            label: "Add First Job",
            onClick: () => {
              setEditingJob(null)
              setShowForm(true)
            },
          }}
        />
      ) : (
        <>
          {viewMode === "table" ? (
            <JobTable
              jobs={jobs}
              onDelete={handleDelete}
              onParseJD={handleParseJD}
              onViewInsights={handleViewInsights}
              onGenerateOutreach={handleGenerateOutreach}
              onInterviewPack={handleInterviewPack}
              onGenerateJobPack={handleGenerateJobPack}
              parsingJobId={parsingJobId}
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {jobs.map((job) => (
                <Card
                  key={job.id}
                  className="card-hover cursor-pointer"
                  onClick={() => {
                    setEditingJob(job)
                    setShowForm(true)
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-base mb-1">{job.company}</h3>
                        <p className="text-sm text-muted-foreground">{job.title}</p>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          job.status === "offer"
                            ? "bg-green-500/10 text-green-700 dark:text-green-400"
                            : job.status === "interviewing"
                            ? "bg-purple-500/10 text-purple-700 dark:text-purple-400"
                            : job.status === "applied"
                            ? "bg-blue-500/10 text-blue-700 dark:text-blue-400"
                            : job.status === "rejected"
                            ? "bg-red-500/10 text-red-700 dark:text-red-400"
                            : ""
                        }
                      >
                        {job.status}
                      </Badge>
                    </div>
                    {job.notes && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-2">
                        {job.notes}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                      {job.applied_at && (
                        <span>Applied: {new Date(job.applied_at).toLocaleDateString()}</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {total > filters.page_size! && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
                Showing {(filters.page! - 1) * filters.page_size! + 1} to{" "}
                {Math.min(filters.page! * filters.page_size!, total)} of {total} jobs
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilters({ ...filters, page: filters.page! - 1 })}
                  disabled={filters.page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilters({ ...filters, page: filters.page! + 1 })}
                  disabled={filters.page! * filters.page_size! >= total}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Job Form Dialog */}
      <JobForm
        open={showForm}
        onOpenChange={(open) => {
          setShowForm(open)
          if (!open) {
            setEditingJob(null)
            router.push("/jobs", { scroll: false }) // Remove edit param
          }
        }}
        onSubmit={handleSubmit}
        initialData={editingJob}
        mode={editingJob ? "edit" : "create"}
      />

      {/* Parse JD Modal */}
      <ParseJDModal
        open={showParseJDModal}
        onOpenChange={setShowParseJDModal}
        onParsed={(data) => {
          // Pre-populate job form with parsed data
          setEditingJob({
            id: 0,
            user_id: 0,
            company: data.company || "",
            title: data.job_title || "",
            url: null,
            status: "saved",
            notes: data.summary || "",
            applied_at: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } as Job)
          setShowForm(true)
          setShowParseJDModal(false)
        }}
      />

      {/* Import Job Modal */}
      <ImportJobModal
        open={showImportModal}
        onOpenChange={setShowImportModal}
        onSuccess={() => {
          loadJobs()
        }}
      />

      {/* Insights Drawer */}
      <JobInsightsDrawer
        job={selectedJobForInsights}
        open={showInsightsDrawer}
        onOpenChange={setShowInsightsDrawer}
        resumeId={selectedResumeId ? parseInt(selectedResumeId) : null}
        onInterviewPackGenerated={() => {
          toast({
            title: "Interview Pack generated!",
            description: "Check your Drive for the complete interview preparation pack.",
          })
        }}
      />
    </div>
  )
}
