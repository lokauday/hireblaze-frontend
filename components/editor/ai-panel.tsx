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
import { aiAPI, type TransformRequest } from "@/lib/api/ai"
import { APIError } from "@/lib/api-client"
import { AIPreviewModal } from "./ai-preview-modal"

interface AIPanelProps {
  documentId: number
  documentContent: string
  selectedText?: string
  onContentUpdate: (newContent: string) => void
  onSelectedTextChange?: (text: string) => void
  className?: string
}

const AI_ACTIONS = [
  { id: "rewrite", label: "Rewrite", description: "Improve clarity and flow", icon: Wand2 },
  { id: "shorten", label: "Shorten", description: "Make it more concise", icon: Minimize2 },
  { id: "expand", label: "Expand", description: "Add more detail", icon: Maximize2 },
  { id: "fix_grammar", label: "Fix Grammar", description: "Fix grammar and spelling", icon: RotateCcw },
  { id: "add_keywords", label: "Add Keywords", description: "Add relevant keywords", icon: ArrowRight },
  { id: "ats_optimize", label: "ATS Optimize", description: "Optimize for ATS systems", icon: Sparkles },
] as const

export function AIPanel({ 
  documentId, 
  documentContent, 
  selectedText: propSelectedText = "",
  onContentUpdate, 
  onSelectedTextChange,
  className 
}: AIPanelProps) {
  const { toast } = useToast()
  const [isProcessing, setIsProcessing] = useState(false)
  const [internalSelectedText, setInternalSelectedText] = useState("")
  const [selectedAction, setSelectedAction] = useState<string | null>(null)
  
  // Use prop if provided, otherwise use internal state
  const selectedText = propSelectedText || internalSelectedText
  const setSelectedText = onSelectedTextChange || setInternalSelectedText
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewBefore, setPreviewBefore] = useState("")
  const [previewAfter, setPreviewAfter] = useState("")
  const [pendingMode, setPendingMode] = useState<string | null>(null)

  const handleAction = async (actionId: string) => {
    // Determine target text: selected text or full document
    const targetText = selectedText.trim() || documentContent.trim()
    
    if (!targetText) {
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
      setPendingMode(actionId)
      setPreviewBefore(targetText)
      setPreviewAfter("") // Clear previous result
      setPreviewOpen(true) // Open modal immediately to show "processing"
      
      // Map action IDs to backend modes
      const modeMap: Record<string, TransformRequest['mode']> = {
        rewrite: 'rewrite',
        shorten: 'shorten',
        expand: 'expand',
        fix_grammar: 'fix_grammar',
        add_keywords: 'add_keywords',
        ats_optimize: 'ats_optimize',
      }
      
      const mode = modeMap[actionId] || 'rewrite'
      
      // Call backend AI transform endpoint
      const response = await aiAPI.transformText({
        mode,
        text: targetText,
        context: {}, // Can be extended later with job context
      })
      
      setPreviewAfter(response.output)
      
      toast({
        title: "AI transformation complete",
        description: "Review the preview and click Apply to update your document",
      })
    } catch (error: any) {
      console.error("AI action failed:", error)
      setPreviewOpen(false)
      
      // Handle different error types
      if (error instanceof APIError) {
        if (error.status === 500 && error.message?.includes("AI not configured")) {
          toast({
            title: "AI not configured",
            description: "OpenAI API key is not set. Please configure it in the backend.",
            variant: "destructive",
          })
        } else if (error.status === 413) {
          toast({
            title: "Text too long",
            description: error.message || "Please select a shorter text to transform.",
            variant: "destructive",
          })
        } else {
          toast({
            title: "AI transformation failed",
            description: error.message || "Failed to process AI action. Please try again.",
            variant: "destructive",
          })
        }
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to process AI action",
          variant: "destructive",
        })
      }
    } finally {
      setIsProcessing(false)
      setSelectedAction(null)
    }
  }

  const handleApply = () => {
    if (!previewAfter) {
      toast({
        title: "Error",
        description: "No transformation to apply",
        variant: "destructive",
      })
      return
    }

    // Apply transformation: if text was selected, replace it; otherwise replace entire content
    if (selectedText.trim() && documentContent.includes(selectedText)) {
      // Replace first occurrence of selected text (most common case)
      const startIndex = documentContent.indexOf(selectedText)
      const newContent = 
        documentContent.substring(0, startIndex) + 
        previewAfter + 
        documentContent.substring(startIndex + selectedText.length)
      onContentUpdate(newContent)
    } else {
      // Replace entire document content
      onContentUpdate(previewAfter)
    }

    // Clear selection and close modal
    setSelectedText("")
    setPreviewOpen(false)
    setPreviewBefore("")
    setPreviewAfter("")
    setPendingMode(null)

    const actionLabel = AI_ACTIONS.find(a => a.id === pendingMode)?.label || "Transformation"
    toast({
      title: "Applied",
      description: `Applied: ${actionLabel}`,
    })
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
              placeholder={selectedText ? selectedText.substring(0, 100) + (selectedText.length > 100 ? "..." : "") : "Select text in the editor to transform, or leave empty to transform entire document"}
              value={selectedText}
              readOnly
              className="min-h-[80px] text-sm bg-muted/50 cursor-default"
            />
            {selectedText && (
              <p className="text-xs text-muted-foreground">
                {selectedText.length} characters selected. Will transform only this portion.
              </p>
            )}
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

      {/* Preview Modal */}
      <AIPreviewModal
        open={previewOpen}
        onOpenChange={(open) => {
          setPreviewOpen(open)
          if (!open && !isProcessing) {
            // Reset on cancel (unless still processing)
            setPreviewBefore("")
            setPreviewAfter("")
            setPendingMode(null)
            setIsProcessing(false)
            setSelectedAction(null)
          }
        }}
        mode={pendingMode || "rewrite"}
        before={previewBefore}
        after={previewAfter}
        onApply={handleApply}
        isLoading={isProcessing}
      />
    </div>
  )
}
