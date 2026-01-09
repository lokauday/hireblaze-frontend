"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2, Copy, Download, FileText, Briefcase, FileCheck, Zap, AlertCircle, CheckCircle2, ArrowUpRight } from "lucide-react"
import { aiToolsAPI, APIError } from "@/lib/api-client"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export function AIToolsClient() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()
  const defaultTab = searchParams.get("tab") || "tailor"
  
  const [activeTab, setActiveTab] = useState(defaultTab)
  const [loading, setLoading] = useState<string | null>(null)
  const [output, setOutput] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [inputs, setInputs] = useState<Record<string, { resume?: string; jd: string }>>({
    tailor: { resume: "", jd: "" },
    cover: { resume: "", jd: "" },
    ats: { resume: "", jd: "" },
    jd: { jd: "" },
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
          setOutput({ ...output, tailor: result.tailored_resume || "" })
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
          setOutput({ ...output, cover: result.cover_letter || "" })
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
          setOutput({
            ...output,
            ats: `Score: ${result.score || 0}/100\n\nMissing Keywords:\n${(result.missing_keywords || []).join("\n")}`,
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
            jd: (result.skills || []).join("\n"),
          })
          toast({
            title: "Success!",
            description: "Job description parsed successfully",
          })
          break
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
              {outputText && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(outputText)}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </Button>
                  <Button variant="outline" size="sm" disabled>
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {outputText ? (
              <div className="space-y-2">
                <Textarea
                  value={outputText}
                  readOnly
                  rows={20}
                  className="font-mono text-sm resize-none bg-muted/50"
                />
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Generated successfully</span>
                </div>
              </div>
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
        <TabsList className="grid w-full grid-cols-4">
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
      </Tabs>
    </div>
  )
}
