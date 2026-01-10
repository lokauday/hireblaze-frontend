"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Loader2,
  Copy,
  Download,
  FileText,
  Briefcase,
  FileCheck,
  Zap,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  Save,
  Users,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  XCircle,
} from "lucide-react"
import { aiToolsAPI, APIError } from "@/lib/api-client"
import { aiAPI, InterviewPackResponse } from "@/lib/api/ai"
import { documentsAPI } from "@/lib/api/documents"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export function AIToolsClient() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()
  const defaultTab = searchParams.get("tab") || "tailor"
  
  const [activeTab, setActiveTab] = useState(defaultTab)
  const [loading, setLoading] = useState<string | null>(null)
  const [output, setOutput] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState<Record<string, boolean>>({})
  const [saveTitles, setSaveTitles] = useState<Record<string, string>>({})
  const [inputs, setInputs] = useState<Record<string, { resume?: string; jd: string }>>({
    tailor: { resume: "", jd: "" },
    cover: { resume: "", jd: "" },
    ats: { resume: "", jd: "" },
    jd: { jd: "" },
    interview: { resume: "", jd: "" },
  })

  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab)
    }
  }, [defaultTab])

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copied!",
        description: "Content copied to clipboard",
      })
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive",
      })
    }
  }

  const handleSaveToDrive = async (tool: string) => {
    const outputData = output[tool]
    if (!outputData) return

    setSaving({ ...saving, [tool]: true })
    try {
      let content = ""
      let title = saveTitles[tool] || `AI Tool Output - ${tool}`
      let docType: "resume" | "cover_letter" | "job_description" | "interview_notes" = "interview_notes"
      let tags: string[] = [tool]

      if (tool === "interview" && outputData.questions) {
        content = `# Interview Preparation Pack\n\n## Likely Interview Questions\n${outputData.questions.map((q: string, i: number) => `${i + 1}. ${q}`).join("\n")}\n\n## STAR Story Prompts\n${Object.entries(outputData.star_outlines || {}).map(([key, val]) => `### ${key}\n${val}`).join("\n\n")}\n\n## 30-60-90 Day Plan\n\n### 30 Days\n${outputData.plan_30_60_90?.["30_days"] || "N/A"}\n\n### 60 Days\n${outputData.plan_30_60_90?.["60_days"] || "N/A"}\n\n### 90 Days\n${outputData.plan_30_60_90?.["90_days"] || "N/A"}`
        docType = "interview_notes"
      } else {
        content = typeof outputData === "string" ? outputData : outputData.main || JSON.stringify(outputData, null, 2)
        if (tool === "tailor") docType = "resume"
        else if (tool === "cover") docType = "cover_letter"
        else if (tool === "jd") docType = "job_description"
      }

      await documentsAPI.create({
        title,
        type: docType,
        content_text: content,
        tags,
      })

      toast({
        title: "Saved to Drive!",
        description: "Your document has been saved to AI Drive",
      })
    } catch (err: any) {
      toast({
        title: "Failed to save",
        description: err.message || "Please try again",
        variant: "destructive",
      })
    } finally {
      setSaving({ ...saving, [tool]: false })
    }
  }

  const highlightKeywords = (text: string, keywords: string[]): React.ReactNode => {
    if (!keywords || keywords.length === 0) return text
    let highlighted = text
    keywords.forEach((keyword) => {
      const regex = new RegExp(`\\b${keyword}\\b`, "gi")
      highlighted = highlighted.replace(regex, `<mark class="bg-yellow-200 dark:bg-yellow-900/50 px-1 rounded">${keyword}</mark>`)
    })
    return <span dangerouslySetInnerHTML={{ __html: highlighted }} />
  }

  const handleGenerate = async (tool: string) => {
    setLoading(tool)
    setOutput({ ...output, [tool]: "" })
    setErrors({ ...errors, [tool]: "" })

    try {
      let result
      const input = inputs[tool as keyof typeof inputs]

      switch (tool) {
        case "tailor":
          if (!input.resume || !input.jd) {
            setErrors({ ...errors, [tool]: "Resume and job description are required" })
            setLoading(null)
            return
          }
          result = await aiToolsAPI.tailorResume({
            resume_text: input.resume,
            jd_text: input.jd,
          })
          // Will be enhanced below
          setOutput({ ...output, tailor: { main: result.tailored_resume || "" } })
          toast({
            title: "Success!",
            description: "Resume tailored successfully",
          })
          break
        case "cover":
          if (!input.resume || !input.jd) {
            setErrors({ ...errors, [tool]: "Resume and job description are required" })
            setLoading(null)
            return
          }
          result = await aiToolsAPI.generateCoverLetter({
            resume_text: input.resume,
            jd_text: input.jd,
          })
          // Will be enhanced below
          setOutput({ ...output, cover: { main: result.cover_letter || "" } })
          toast({
            title: "Success!",
            description: "Cover letter generated successfully",
          })
          break
        case "ats":
          if (!input.resume || !input.jd) {
            setErrors({ ...errors, [tool]: "Resume and job description are required" })
            setLoading(null)
            return
          }
          result = await aiToolsAPI.atsScan({
            resume_text: input.resume,
            jd_text: input.jd,
          })
          // Will be enhanced below
          setOutput({
            ...output,
            ats: {
              main: `Score: ${result.score || 0}/100\n\nMissing Keywords:\n${(result.missing_keywords || []).join("\n")}`,
            },
          })
          toast({
            title: "Success!",
            description: "ATS scan completed",
          })
          break
        case "jd":
          if (!input.jd) {
            setErrors({ ...errors, [tool]: "Job description is required" })
            setLoading(null)
            return
          }
          result = await aiToolsAPI.parseJD({
            jd_text: input.jd,
          })
          setOutput({
            ...output,
            jd: {
              main: (result.skills || []).join("\n"),
              skills: result.skills || [],
            },
          })
          setSaveTitles({ ...saveTitles, jd: "Parsed Job Description" })
          toast({
            title: "Success!",
            description: "Job description parsed successfully",
          })
          break
        case "interview":
          if (!input.resume || !input.jd) {
            setErrors({ ...errors, [tool]: "Resume and job description are required" })
            setLoading(null)
            return
          }
          result = await aiAPI.interviewPack({
            resume_text: input.resume,
            jd_text: input.jd,
          })
          setOutput({
            ...output,
            interview: result,
          })
          setSaveTitles({ ...saveTitles, interview: "Interview Preparation Pack" })
          toast({
            title: "Success!",
            description: "Interview pack generated successfully",
          })
          break
      }

      // Generate enhanced insights for tailor, cover, ats
      if ((tool === "tailor" || tool === "cover" || tool === "ats") && result) {
        try {
          // Mock enhanced data - in production, this would come from API
          const missingKeywords = tool === "ats" && "missing_keywords" in result ? (result as any).missing_keywords : []
          const enhanced = {
            recruiterSummary: `A recruiter reviewing this ${tool === "tailor" ? "resume" : tool === "cover" ? "cover letter" : "ATS scan"} will notice your ${tool === "ats" ? "compatibility score" : "alignment"} within 6 seconds.`,
            atsWarnings: tool === "ats" ? [] : ["Consider adding more action verbs", "Ensure consistent formatting"],
            keywordGaps: Array.isArray(missingKeywords) ? missingKeywords.map((kw: string) => ({ keyword: kw, found: false, recommendation: `Add "${kw}" to your resume` })) : [],
          }
          const existingOutput = output[tool]
          let mainOutput = ""
          if (typeof existingOutput === "string") {
            mainOutput = existingOutput
          } else if (existingOutput?.main) {
            mainOutput = existingOutput.main
          } else if (tool === "tailor" && "tailored_resume" in result) {
            mainOutput = (result as any).tailored_resume
          } else if (tool === "cover" && "cover_letter" in result) {
            mainOutput = (result as any).cover_letter
          } else if (tool === "ats") {
            mainOutput = `Score: ${"score" in result ? (result as any).score : 0}/100\n\nMissing Keywords:\n${missingKeywords.join("\n")}`
          }
          
          setOutput({
            ...output,
            [tool]: {
              main: mainOutput,
              enhanced,
            },
          })
          setSaveTitles({
            ...saveTitles,
            [tool]: tool === "tailor" ? "Tailored Resume" : tool === "cover" ? "Cover Letter" : "ATS Scan Results",
          })
        } catch (err) {
          // Continue without enhanced data if it fails
        }
      }
    } catch (error: any) {
      const errorDetail = error.detail || {}
      let errorMsg = "Failed to generate. Please try again."
      let showUpgradeCTA = false
      
      if (error instanceof APIError) {
        if (error.status === 429 || errorDetail.error === "quota_exceeded") {
          errorMsg = `Quota exceeded: You've used all ${errorDetail.used || 0}/${errorDetail.limit || 0} ${errorDetail.feature || tool} requests this month.`
          showUpgradeCTA = true
        } else if (errorDetail.detail) {
          errorMsg = typeof errorDetail.detail === "string" ? errorDetail.detail : errorMsg
        } else if (error.message) {
          errorMsg = error.message
        }
      } else if (error.detail) {
        errorMsg = typeof error.detail === "string" ? errorDetail : errorMsg
      }
      
      setErrors({ ...errors, [tool]: errorMsg })
      setOutput({ ...output, [tool]: "" })
      
      if (showUpgradeCTA) {
        toast({
          title: "Quota Exceeded",
          description: "Upgrade your plan for more quota",
          variant: "destructive",
          action: (
            <Link href="/billing">
              <Button variant="outline" size="sm">
                Upgrade
                <ArrowUpRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          ),
        })
      } else {
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive",
        })
      }
    } finally {
      setLoading(null)
    }
  }

  const renderToolContent = (tool: string, title: string, description: string, needsResume: boolean) => {
    const input = inputs[tool as keyof typeof inputs]
    const outputText = output[tool]
    const error = errors[tool]
    const isLoading = loading === tool
    const isQuotaError = error?.includes("Quota exceeded") || error?.includes("quota_exceeded")
    const mainOutputText = typeof outputText === "string" ? outputText : outputText?.main || ""

    return (
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Panel */}
        <Card className="lg:sticky lg:top-6 lg:h-fit">
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {needsResume && (
              <div className="space-y-2">
                <Label htmlFor={`${tool}-resume`}>Resume</Label>
                <Textarea
                  id={`${tool}-resume`}
                  placeholder="Paste your resume text here..."
                  rows={8}
                  value={input.resume}
                  onChange={(e) =>
                    setInputs({
                      ...inputs,
                      [tool]: { ...input, resume: e.target.value },
                    })
                  }
                  disabled={isLoading}
                  className="font-mono text-sm resize-none"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor={`${tool}-jd`}>Job Description</Label>
              <Textarea
                id={`${tool}-jd`}
                placeholder="Paste the job description here..."
                rows={needsResume ? 8 : 12}
                value={input.jd}
                onChange={(e) =>
                  setInputs({
                    ...inputs,
                    [tool]: { ...input, jd: e.target.value },
                  })
                }
                disabled={isLoading}
                className="font-mono text-sm resize-none"
              />
            </div>
            {error && (
              <Alert variant={isQuotaError ? "destructive" : "destructive"}>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p>{error}</p>
                    {isQuotaError && (
                      <Link href="/billing">
                        <Button variant="outline" size="sm" className="mt-2">
                          <ArrowUpRight className="h-3 w-3 mr-1" />
                          Upgrade Plan
                        </Button>
                      </Link>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}
            <Button
              onClick={() => handleGenerate(tool)}
              disabled={isLoading || !input.jd || (needsResume && !input.resume)}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                `Generate ${title}`
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Output Panel */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Output</CardTitle>
              {(mainOutputText || (typeof outputText !== "string" && outputText)) && (
                <div className="flex gap-2">
                  {mainOutputText && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy(mainOutputText)}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSaveToDrive(tool)}
                    disabled={saving[tool]}
                  >
                    {saving[tool] ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-1" />
                        Save
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {(mainOutputText || (typeof outputText !== "string" && outputText)) ? (
              <>
                {/* Main Output */}
                <Accordion type="single" collapsible defaultValue="main" className="w-full">
                  <AccordionItem value="main">
                    <AccordionTrigger className="text-sm font-medium">Main Output</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        {tool === "interview" && typeof outputText !== "string" && outputText.questions ? (
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-medium mb-2">Likely Interview Questions</h4>
                              <ol className="list-decimal list-inside space-y-1 text-sm">
                                {(outputText.questions || []).map((q: string, i: number) => (
                                  <li key={i}>{q}</li>
                                ))}
                              </ol>
                            </div>
                            {outputText.star_outlines && (
                              <div>
                                <h4 className="font-medium mb-2">STAR Story Prompts</h4>
                                {Object.entries(outputText.star_outlines).map(([key, val]) => (
                                  <div key={key} className="mb-2">
                                    <div className="font-medium text-sm">{key}</div>
                                    <div className="text-sm text-muted-foreground">{val as string}</div>
                                  </div>
                                ))}
                              </div>
                            )}
                            {outputText.plan_30_60_90 && (
                              <div>
                                <h4 className="font-medium mb-2">30-60-90 Day Plan</h4>
                                {["30_days", "60_days", "90_days"].map((key) => (
                                  <div key={key} className="mb-2">
                                    <div className="font-medium text-sm capitalize">{key.replace("_", "-")}</div>
                                    <div className="text-sm text-muted-foreground">{outputText.plan_30_60_90[key]}</div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <Textarea
                            value={typeof outputText === "string" ? outputText : outputText.main || ""}
                            readOnly
                            rows={15}
                            className="font-mono text-sm resize-none bg-muted/50"
                          />
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Enhanced Sections for non-interview tools */}
                  {tool !== "interview" && typeof outputText !== "string" && outputText.enhanced && (
                    <>
                      {/* Recruiter Summary */}
                      <AccordionItem value="recruiter">
                        <AccordionTrigger className="text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-primary" />
                            Recruiter Summary
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <p className="text-sm text-muted-foreground">
                            {outputText.enhanced.recruiterSummary || "What a recruiter will notice in 6 seconds."}
                          </p>
                        </AccordionContent>
                      </AccordionItem>

                      {/* ATS Warnings */}
                      {(outputText.enhanced.atsWarnings?.length > 0 || outputText.enhanced.keywordGaps?.length > 0) && (
                        <AccordionItem value="ats">
                          <AccordionTrigger className="text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4 text-orange-500" />
                              ATS Warnings
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="space-y-3">
                            {outputText.enhanced.atsWarnings?.length > 0 && (
                              <div>
                                <h5 className="font-medium text-sm mb-2">Formatting & Structure</h5>
                                <ul className="space-y-1">
                                  {outputText.enhanced.atsWarnings.map((warning: string, i: number) => (
                                    <li key={i} className="text-sm flex items-start gap-2">
                                      <AlertTriangle className="h-3 w-3 text-orange-500 mt-0.5 flex-shrink-0" />
                                      {warning}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {outputText.enhanced.keywordGaps?.length > 0 && (
                              <div>
                                <h5 className="font-medium text-sm mb-2">Keyword Gap Analysis</h5>
                                <div className="border rounded-lg overflow-hidden">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead className="w-1/3">Keyword</TableHead>
                                        <TableHead className="w-1/6">Found?</TableHead>
                                        <TableHead>Recommendation</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {outputText.enhanced.keywordGaps.slice(0, 10).map((gap: any, i: number) => (
                                        <TableRow key={i}>
                                          <TableCell className="font-medium text-sm">{gap.keyword}</TableCell>
                                          <TableCell>
                                            {gap.found ? (
                                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                                            ) : (
                                              <XCircle className="h-4 w-4 text-red-500" />
                                            )}
                                          </TableCell>
                                          <TableCell className="text-sm text-muted-foreground">
                                            {gap.recommendation || "Add this keyword"}
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>
                              </div>
                            )}
                          </AccordionContent>
                        </AccordionItem>
                      )}
                    </>
                  )}
                </Accordion>

                {/* Save Title Input */}
                <div className="border-t pt-4">
                  <Label htmlFor={`save-title-${tool}`} className="text-sm font-medium">
                    Document Title (for saving)
                  </Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id={`save-title-${tool}`}
                      value={saveTitles[tool] || ""}
                      onChange={(e) => setSaveTitles({ ...saveTitles, [tool]: e.target.value })}
                      placeholder="Enter document title..."
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Generated successfully</span>
                </div>
              </>
            ) : isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center space-y-4">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                  <p className="text-sm text-muted-foreground">Generating your content...</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">Output will appear here</p>
                  <p className="text-xs text-muted-foreground">Fill in the inputs and click generate</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold tracking-tight">AI Tools</h1>
        <p className="text-muted-foreground mt-1">
          Use AI-powered tools to enhance your job applications
        </p>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="tailor" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <FileText className="h-4 w-4 mr-2" />
            Resume Tailor
          </TabsTrigger>
          <TabsTrigger value="cover" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Briefcase className="h-4 w-4 mr-2" />
            Cover Letter
          </TabsTrigger>
          <TabsTrigger value="ats" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <FileCheck className="h-4 w-4 mr-2" />
            ATS Scan
          </TabsTrigger>
          <TabsTrigger value="jd" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Zap className="h-4 w-4 mr-2" />
            JD Parse
          </TabsTrigger>
          <TabsTrigger value="interview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <MessageSquare className="h-4 w-4 mr-2" />
            Interview Pack
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tailor" className="space-y-0">
          {renderToolContent(
            "tailor",
            "Resume Tailor",
            "Tailor your resume to match a specific job description",
            true
          )}
        </TabsContent>

        <TabsContent value="cover" className="space-y-0">
          {renderToolContent(
            "cover",
            "Cover Letter Generator",
            "Generate a personalized cover letter for your job application",
            true
          )}
        </TabsContent>

        <TabsContent value="ats" className="space-y-0">
          {renderToolContent(
            "ats",
            "ATS Scan",
            "Check how well your resume matches the job description (ATS compatibility)",
            true
          )}
        </TabsContent>

        <TabsContent value="jd" className="space-y-0">
          {renderToolContent(
            "jd",
            "JD Parser",
            "Extract key skills and requirements from a job description",
            false
          )}
        </TabsContent>

        <TabsContent value="interview" className="space-y-0">
          {renderToolContent(
            "interview",
            "Interview Pack",
            "Generate complete interview preparation with questions, STAR outlines, and 30-60-90 day plan",
            true
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
