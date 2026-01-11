"use client"

import React from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle2, Lightbulb, Key, FileText, Sparkles } from "lucide-react"

interface AIPreviewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: string
  before: string
  after: string
  onApply: () => void
  isLoading?: boolean
  explanation?: {
    what_changed?: string[]
    why_changed?: string
    keywords_added?: string[]
    summary?: string
  }
}

const modeLabels: Record<string, string> = {
  rewrite: "Rewrite",
  shorten: "Shorten",
  expand: "Expand",
  ats_optimize: "ATS Optimize",
  fix_grammar: "Fix Grammar",
  add_keywords: "Add Keywords",
}

export function AIPreviewModal(props: AIPreviewModalProps) {
  const { open, onOpenChange, mode, before, after, onApply, isLoading = false, explanation } = props

  const getButtonText = () => {
    if (isLoading) return "AI thinking..."
    if (!after || after === "(processing...)") return "Processing..."
    return "Apply"
  }
  const isApplyDisabled = isLoading || !after || after === "(processing...)"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl flex flex-col" style={{ maxHeight: '90vh' }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            AI Preview: <Badge variant="secondary">{modeLabels[mode] || mode}</Badge>
            {explanation?.summary && (
              <span className="text-sm font-normal text-muted-foreground ml-2">
                {explanation.summary}
              </span>
            )}
          </DialogTitle>
          <DialogDescription>
            Review the changes before applying. Click &quot;Apply&quot; to update your document.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="preview" className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="explain" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Explain Changes
              {explanation && <Badge variant="outline" className="ml-1 text-xs">New</Badge>}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="flex-1 flex flex-col min-h-0 mt-4">
            <div className="flex-1 grid grid-cols-2 gap-4 min-h-0">
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-muted-foreground">Before</h3>
                  <Badge variant="outline" className="text-xs">{before.length} chars</Badge>
                </div>
                <div className="flex-1 border rounded-md p-4 bg-muted/30 overflow-y-auto" style={{ maxHeight: '400px' }}>
                  <pre className="text-sm whitespace-pre-wrap font-mono">{before || "(empty)"}</pre>
                </div>
              </div>

              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-primary">After</h3>
                  <Badge variant="default" className="text-xs">{after.length} chars</Badge>
                </div>
                <div className="flex-1 border rounded-md p-4 bg-primary/5 border-primary/20 overflow-y-auto" style={{ maxHeight: '400px' }}>
                  <pre className="text-sm whitespace-pre-wrap font-mono">{after || "(processing...)"}</pre>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="explain" className="flex-1 flex flex-col min-h-0 mt-4">
            {explanation ? (
              <div className="flex-1 space-y-6 overflow-y-auto" style={{ maxHeight: '400px' }}>
                {/* What Changed */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">What Changed</h3>
                  </div>
                  {explanation.what_changed && explanation.what_changed.length > 0 ? (
                    <ul className="space-y-2 ml-7">
                      {explanation.what_changed.map((change, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span className="text-sm text-muted-foreground">{change}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground ml-7">No detailed changes available</p>
                  )}
                </div>

                {/* Why Changed */}
                {explanation.why_changed && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold">Why Changed</h3>
                    </div>
                    <p className="text-sm text-muted-foreground ml-7">{explanation.why_changed}</p>
                  </div>
                )}

                {/* Keywords Added */}
                {explanation.keywords_added && explanation.keywords_added.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Key className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold">Keywords Added</h3>
                    </div>
                    <div className="flex flex-wrap gap-2 ml-7">
                      {explanation.keywords_added.map((keyword, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Summary */}
                {explanation.summary && (
                  <div className="space-y-2 p-4 bg-muted/50 rounded-md">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <h4 className="text-sm font-medium">Summary</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">{explanation.summary}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center space-y-2">
                  <Sparkles className="h-8 w-8 mx-auto opacity-50" />
                  <p className="text-sm">Explanation not available</p>
                  <p className="text-xs">Changes applied but detailed explanation could not be generated</p>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={onApply} disabled={isApplyDisabled}>
            {getButtonText()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
