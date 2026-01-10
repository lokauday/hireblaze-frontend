"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  Send,
  Mail,
  MessageSquare,
  Heart,
  Users,
  FileText,
  Briefcase,
  Save,
  Copy,
  CheckCircle2,
  Sparkles,
  Edit,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/layout/page-header"
import { LoadingSkeleton } from "@/components/shared/loading-skeleton"
import { EmptyState } from "@/components/shared/empty-state"
import { outreachAPI, OutreachRequest, OutreachResponse } from "@/lib/api/outreach"
import { documentsAPI, AppDocument } from "@/lib/api/documents"
import { jobsAPI, Job } from "@/lib/api/jobs"
import { useToast } from "@/hooks/use-toast"
import { APIError } from "@/lib/api-client"
import Link from "next/link"

type MessageType = "recruiter_followup" | "linkedin_dm" | "thank_you" | "referral_ask"

const messageTypes: { value: MessageType; label: string; icon: React.ReactNode; description: string }[] = [
  {
    value: "recruiter_followup",
    label: "Recruiter Follow-up",
    icon: <Mail className="h-4 w-4" />,
    description: "Professional email to follow up with a recruiter",
  },
  {
    value: "linkedin_dm",
    label: "LinkedIn DM",
    icon: <MessageSquare className="h-4 w-4" />,
    description: "Casual LinkedIn direct message",
  },
  {
    value: "thank_you",
    label: "Thank You Note",
    icon: <Heart className="h-4 w-4" />,
    description: "Post-interview thank you message",
  },
  {
    value: "referral_ask",
    label: "Referral Request",
    icon: <Users className="h-4 w-4" />,
    description: "Ask for a referral from your network",
  },
]

export default function OutreachPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [resumes, setResumes] = useState<AppDocument[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [messageType, setMessageType] = useState<MessageType>("recruiter_followup")
  const [selectedResumeId, setSelectedResumeId] = useState<string>("")
  const [selectedJobId, setSelectedJobId] = useState<string>("")
  const [company, setCompany] = useState<string>("")
  const [jobTitle, setJobTitle] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [generatedMessage, setGeneratedMessage] = useState<OutreachResponse | null>(null)
  const [editedMessage, setEditedMessage] = useState<string>("")
  const [copied, setCopied] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (generatedMessage) {
      setEditedMessage(generatedMessage.message)
    }
  }, [generatedMessage])

  useEffect(() => {
    if (selectedJobId) {
      const job = jobs.find((j) => j.id.toString() === selectedJobId)
      if (job) {
        setCompany(job.company)
        setJobTitle(job.title)
      }
    }
  }, [selectedJobId, jobs])

  const loadData = async () => {
    setLoadingData(true)
    try {
      const [resumesRes, jobsRes] = await Promise.all([
        documentsAPI.list({ page_size: 100 }),
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

  const handleGenerate = async () => {
    if (!selectedResumeId && !selectedJobId) {
      toast({
        title: "Selection required",
        description: "Please select at least a resume or job.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setGeneratedMessage(null)

    try {
      const request: OutreachRequest = {
        message_type: messageType,
        resume_id: selectedResumeId ? parseInt(selectedResumeId) : undefined,
        job_id: selectedJobId ? parseInt(selectedJobId) : undefined,
        company: company || undefined,
        job_title: jobTitle || undefined,
        save_to_drive: false,
      }

      const result = await outreachAPI.generate(request)
      setGeneratedMessage(result)
      toast({
        title: "Message generated!",
        description: "Review and customize your message below.",
      })
    } catch (err: any) {
      const errorMsg =
        err instanceof APIError
          ? err.message
          : err.detail?.detail || err.detail || err.message || "Failed to generate message"
      toast({
        title: "Generation failed",
        description: errorMsg,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    if (!editedMessage) return

    try {
      await navigator.clipboard.writeText(editedMessage)
      setCopied(true)
      toast({
        title: "Copied!",
        description: "Message copied to clipboard.",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSaveToDrive = async () => {
    if (!editedMessage || !generatedMessage) {
      return
    }

    setSaving(true)
    try {
      const selectedJob = selectedJobId ? jobs.find((j) => j.id.toString() === selectedJobId) : null
      const typeLabel = messageTypes.find((t) => t.value === messageType)?.label || messageType

      const content = generatedMessage.subject
        ? `Subject: ${generatedMessage.subject}\n\n${editedMessage}`
        : editedMessage

      await documentsAPI.create({
        title: `${typeLabel}: ${selectedJob ? `${selectedJob.company} - ${selectedJob.title}` : company || "Outreach"}`,
        type: "cover_letter",
        content_text: content,
        tags: [
          "outreach",
          messageType.replace("_", "-"),
          ...(selectedJob ? [selectedJob.company.toLowerCase().replace(/\s+/g, "-")] : []),
        ],
      })

      toast({
        title: "Saved to Drive",
        description: "Message has been saved to your AI Drive.",
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

  return (
    <div className="page-transition space-y-6">
      <PageHeader
        title="Outreach Studio"
        subtitle="Generate personalized messages for recruiters, LinkedIn DMs, thank-you notes, and referral requests"
      />

      {loadingData ? (
        <LoadingSkeleton count={3} />
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <Card>
            <CardHeader>
              <CardTitle>Message Configuration</CardTitle>
              <CardDescription>Choose message type and context</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Message Type Selection */}
              <div className="space-y-2">
                <Label>Message Type</Label>
                <Select value={messageType} onValueChange={(value) => setMessageType(value as MessageType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {messageTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          {type.icon}
                          <div>
                            <div className="font-medium">{type.label}</div>
                            <div className="text-xs text-muted-foreground">{type.description}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Resume Selection */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Resume (Optional)
                </Label>
                <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a resume from Drive" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {resumes
                      .filter((r) => r.type === "resume")
                      .map((resume) => (
                        <SelectItem key={resume.id} value={resume.id.toString()}>
                          {resume.title}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Job Selection */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Job (Optional)
                </Label>
                <Select value={selectedJobId} onValueChange={setSelectedJobId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a job from Jobs" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {jobs.map((job) => (
                      <SelectItem key={job.id} value={job.id.toString()}>
                        {job.company} - {job.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Manual Company/Title Input (if no job selected) */}
              {!selectedJobId && (
                <>
                  <div className="space-y-2">
                    <Label>Company</Label>
                    <Input
                      placeholder="Enter company name"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Job Title</Label>
                    <Input
                      placeholder="Enter job title"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                    />
                  </div>
                </>
              )}

              <Button onClick={handleGenerate} disabled={loading} className="w-full" size="lg">
                {loading ? (
                  <>
                    <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Generate Message
                  </>
                )}
              </Button>

              {resumes.length === 0 && jobs.length === 0 && (
                <div className="text-sm text-muted-foreground text-center p-4 border rounded-lg bg-muted/50">
                  <p className="mb-2">No resumes or jobs found.</p>
                  <div className="flex gap-2 justify-center">
                    <Link href="/drive">
                      <Button variant="link" size="sm">
                        Upload Resume
                      </Button>
                    </Link>
                    <Link href="/jobs">
                      <Button variant="link" size="sm">
                        Add Job
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Output Section */}
          <Card>
            <CardHeader>
              <CardTitle>Generated Message</CardTitle>
              <CardDescription>
                {generatedMessage
                  ? "Review and customize your message, then copy or save to Drive"
                  : "Generate a message to see it here"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {generatedMessage ? (
                <>
                  {generatedMessage.subject && (
                    <div className="space-y-2">
                      <Label>Subject</Label>
                      <Input value={generatedMessage.subject} readOnly className="font-medium" />
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2">
                        <Edit className="h-4 w-4" />
                        Message
                      </Label>
                      <Badge variant="outline" className="text-xs">
                        {generatedMessage.tone}
                      </Badge>
                    </div>
                    <Textarea
                      value={editedMessage}
                      onChange={(e) => setEditedMessage(e.target.value)}
                      className="min-h-[300px] font-mono text-sm"
                      placeholder="Your message will appear here..."
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleCopy} variant="outline" className="flex-1">
                      {copied ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy
                        </>
                      )}
                    </Button>
                    <Button onClick={handleSaveToDrive} disabled={saving} className="flex-1">
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? "Saving..." : "Save to Drive"}
                    </Button>
                  </div>
                </>
              ) : (
                <EmptyState
                  icon={Send}
                  title="No message generated yet"
                  description="Configure your message settings and click Generate to create a personalized outreach message"
                />
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}