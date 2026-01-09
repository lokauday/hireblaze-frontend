"use client"

import { useState, useEffect } from "react"
import { Sparkles, Wand2, Maximize2, Minimize2, RotateCcw, ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

interface AIPanelProps {
  documentId: number
  documentContent: string
  onContentUpdate: (newContent: string) => void
  className?: string
}

const AI_ACTIONS = [
  { id: "rewrite", label: "Rewrite", description: "Improve clarity and flow", icon: Wand2 },
  { id: "shorten", label: "Shorten", description: "Make it more concise", icon: Minimize2 },
  { id: "expand", label: "Expand", description: "Add more detail", icon: Maximize2 },
  { id: "bulletize", label: "Bulletize", description: "Convert to bullet points", icon: RotateCcw },
  { id: "quantize", label: "Quantize", description: "Add metrics and numbers", icon: ArrowRight },
  { id: "ats_optimize", label: "ATS Optimize", description: "Optimize for ATS systems", icon: Sparkles },
] as const

export function AIPanel({ documentId, documentContent, onContentUpdate, className }: AIPanelProps) {
  const { toast } = useToast()
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedText, setSelectedText] = useState("")
  const [selectedAction, setSelectedAction] = useState<string | null>(null)

  const handleAction = async (actionId: string) => {
    if (!documentContent.trim() && !selectedText.trim()) {
      toast({
        title: "Error",
        description: "Please select text or ensure document has content",
        variant: "destructive",
      })
      return
    }

    try {
      setIsProcessing(true)
      setSelectedAction(actionId)
      
      // TODO: Integrate with actual AI service
      // For now, simulate processing
      await new Promise((resolve) => setTimeout(resolve, 1500))
      
      // Simulated AI transformation
      let transformed = selectedText || documentContent
      switch (actionId) {
        case "rewrite":
          transformed = `[Rewritten version]\n\n${transformed}`
          break
        case "shorten":
          transformed = transformed.split(".").slice(0, 2).join(".") + "..."
          break
        case "expand":
          transformed = `${transformed}\n\n[Additional context and details...]`
          break
        case "bulletize":
          transformed = transformed.split(".").map(s => `• ${s.trim()}`).join("\n")
          break
        case "quantize":
          transformed = `${transformed}\n\n[Added metrics: 95% success rate, $50K revenue increase]`
          break
        case "ats_optimize":
          transformed = `[ATS Optimized]\n\n${transformed.replace(/and/g, "&")}`
          break
      }

      // If text was selected, replace only that part; otherwise replace all
      if (selectedText) {
        const newContent = documentContent.replace(selectedText, transformed)
        onContentUpdate(newContent)
      } else {
        onContentUpdate(transformed)
      }

      toast({
        title: "Success",
        description: "Content updated successfully",
      })
    } catch (error: any) {
      console.error("AI action failed:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to process AI action",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
      setSelectedAction(null)
    }
  }

  return (
    <div className={cn("h-full flex flex-col border-l bg-card", className)}>
      <div className="p-4 border-b">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">AI Assistant</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Enhance your document with AI-powered tools
        </p>
      </div>

      <Tabs defaultValue="actions" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="mx-4 mt-4">
          <TabsTrigger value="actions">Actions</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="actions" className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Selected Text (Optional)</label>
            <Textarea
              placeholder="Select text in the editor to transform, or leave empty to transform entire document"
              value={selectedText}
              onChange={(e) => setSelectedText(e.target.value)}
              className="min-h-[80px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">AI Actions</label>
            <div className="grid grid-cols-1 gap-2">
              {AI_ACTIONS.map((action) => (
                <Card
                  key={action.id}
                  className={cn(
                    "cursor-pointer transition-all hover:border-primary hover:shadow-sm",
                    selectedAction === action.id && "border-primary ring-2 ring-primary/20",
                    isProcessing && "opacity-50 cursor-not-allowed"
                  )}
                  onClick={() => !isProcessing && handleAction(action.id)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <div className="rounded-md bg-primary/10 p-2 mt-0.5">
                        <action.icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{action.label}</span>
                          <Badge variant="secondary" className="text-xs">
                            AI
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {action.description}
                        </p>
                      </div>
                      {isProcessing && selectedAction === action.id && (
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-muted/50 border">
            <p className="text-xs text-muted-foreground">
              💡 <strong>Tip:</strong> Select specific text to transform only that portion, or leave empty to transform the entire document.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Document Templates</label>
            <div className="space-y-2">
              <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => {
                onContentUpdate(`# Professional Resume

## Contact Information
- Email: your.email@example.com
- Phone: (555) 123-4567
- Location: City, State

## Professional Summary
Experienced professional with expertise in...

## Work Experience

### Job Title | Company Name | Date Range
- Achievement 1
- Achievement 2
- Achievement 3

## Education
Degree | University | Year

## Skills
- Skill 1
- Skill 2
- Skill 3`)
                toast({
                  title: "Template Applied",
                  description: "ATS Resume v1 template loaded",
                })
              }}>
                <CardContent className="p-3">
                  <div className="font-medium text-sm mb-1">ATS Resume v1</div>
                  <p className="text-xs text-muted-foreground">Professional resume optimized for ATS systems</p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => {
                onContentUpdate(`# Cover Letter

Dear [Hiring Manager Name],

I am writing to express my interest in the [Job Title] position at [Company Name]. With my background in [relevant experience], I am confident that I would be a valuable addition to your team.

## Why I'm Interested
[Your reasons for interest in the company/role]

## Relevant Experience
[Highlight your most relevant experience and achievements]

## What I Bring
[Your unique value proposition]

Thank you for considering my application. I look forward to the opportunity to discuss how my skills and experience align with your needs.

Sincerely,
[Your Name]`)
                toast({
                  title: "Template Applied",
                  description: "Cover Letter v1 template loaded",
                })
              }}>
                <CardContent className="p-3">
                  <div className="font-medium text-sm mb-1">Cover Letter v1</div>
                  <p className="text-xs text-muted-foreground">Professional cover letter template</p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => {
                onContentUpdate(`Subject: Re: [Job Title] Position - Networking Inquiry

Dear [Name],

I hope this email finds you well. I came across your profile and was impressed by your work at [Company/Role]. 

I am currently exploring opportunities in [field/industry] and would appreciate any insights or advice you might have.

## About Me
[Brief introduction]

## Questions
1. [Question 1]
2. [Question 2]
3. [Question 3]

Thank you for your time, and I look forward to hearing from you.

Best regards,
[Your Name]`)
                toast({
                  title: "Template Applied",
                  description: "Networking Email template loaded",
                })
              }}>
                <CardContent className="p-3">
                  <div className="font-medium text-sm mb-1">Networking Email</div>
                  <p className="text-xs text-muted-foreground">Professional networking email template</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
