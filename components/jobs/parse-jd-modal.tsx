"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Loader2, FileText, MapPin, Briefcase, Building2, Code, GraduationCap, List, DollarSign } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { apiRequest, APIError } from "@/lib/api-client"

interface ParseJDModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onParsed: (data: {
    job_title: string
    company: string
    location: string
    skills: string[]
    requirements: string[]
    responsibilities: string[]
    experience_level: string
    salary_range?: string
    summary: string
  }) => void
}

export function ParseJDModal({ open, onOpenChange, onParsed }: ParseJDModalProps) {
  const { toast } = useToast()
  const [jdText, setJdText] = useState("")
  const [loading, setLoading] = useState(false)
  const [parsedData, setParsedData] = useState<any>(null)

  const handleParse = async () => {
    if (!jdText.trim() || jdText.trim().length < 10) {
      toast({
        title: "Invalid input",
        description: "Please paste a job description (at least 10 characters)",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setParsedData(null)

    try {
      const response = await apiRequest<{
        job_title: string
        company: string
        location: string
        skills: string[]
        requirements: string[]
        responsibilities: string[]
        experience_level: string
        salary_range?: string
        summary: string
      }>("/jd/parse", {
        method: "POST",
        body: JSON.stringify({ jd_text: jdText }),
      })

      setParsedData(response)
      toast({
        title: "JD parsed successfully",
        description: `Extracted: ${response.job_title} at ${response.company || "Company"}`,
      })
    } catch (err) {
      setLoading(false)
      if (err instanceof APIError) {
        toast({
          title: "Failed to parse JD",
          description: err.message || "Please try again",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to parse job description. Please try again.",
          variant: "destructive",
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleUseData = () => {
    if (parsedData) {
      onParsed(parsedData)
      onOpenChange(false)
      setJdText("")
      setParsedData(null)
    }
  }

  const handleCancel = () => {
    onOpenChange(false)
    setJdText("")
    setParsedData(null)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Parse Job Description
          </DialogTitle>
          <DialogDescription>
            Paste a job description and we&apos;ll extract structured data for you
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4">
          {!parsedData ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="jd-text">Job Description</Label>
                <Textarea
                  id="jd-text"
                  placeholder="Paste the full job description here..."
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                  className="min-h-[300px] font-mono text-sm"
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">
                  {jdText.length} characters • Minimum 10 characters required
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Summary */}
              {parsedData.summary && (
                <div className="p-4 bg-muted/50 rounded-md">
                  <h4 className="font-semibold mb-2">Summary</h4>
                  <p className="text-sm text-muted-foreground">{parsedData.summary}</p>
                </div>
              )}

              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                {parsedData.job_title && (
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      Job Title
                    </Label>
                    <p className="text-sm font-medium">{parsedData.job_title}</p>
                  </div>
                )}
                {parsedData.company && (
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Company
                    </Label>
                    <p className="text-sm font-medium">{parsedData.company}</p>
                  </div>
                )}
                {parsedData.location && (
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Location
                    </Label>
                    <p className="text-sm font-medium">{parsedData.location}</p>
                  </div>
                )}
                {parsedData.experience_level && (
                  <div className="space-y-2">
                    <Label>Experience Level</Label>
                    <Badge variant="outline" className="capitalize">
                      {parsedData.experience_level}
                    </Badge>
                  </div>
                )}
              </div>

              {/* Skills */}
              {parsedData.skills && parsedData.skills.length > 0 && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Code className="h-4 w-4" />
                    Skills
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {parsedData.skills.map((skill: string, index: number) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Requirements */}
              {parsedData.requirements && parsedData.requirements.length > 0 && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    Requirements
                  </Label>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {parsedData.requirements.map((req: string, index: number) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Responsibilities */}
              {parsedData.responsibilities && parsedData.responsibilities.length > 0 && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <List className="h-4 w-4" />
                    Responsibilities
                  </Label>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {parsedData.responsibilities.map((resp: string, index: number) => (
                      <li key={index}>{resp}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Salary */}
              {parsedData.salary_range && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Salary Range
                  </Label>
                  <p className="text-sm font-medium">{parsedData.salary_range}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          {!parsedData ? (
            <>
              <Button variant="outline" onClick={handleCancel} disabled={loading}>
                Cancel
              </Button>
              <Button onClick={handleParse} disabled={loading || !jdText.trim() || jdText.trim().length < 10}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Parsing...
                  </>
                ) : (
                  "Parse JD"
                )}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setParsedData(null)}>
                Parse Another
              </Button>
              <Button onClick={handleUseData}>
                Use This Data
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
