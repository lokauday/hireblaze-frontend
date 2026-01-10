"use client"

import React from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface AIPreviewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: string
  before: string
  after: string
  onApply: () => void
  isLoading?: boolean
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
  const { open, onOpenChange, mode, before, after, onApply, isLoading = false } = props

  const getButtonText = () => {
    if (isLoading) return "AI thinking..."
    if (!after || after === "(processing...)") return "Processing..."
    return "Apply"
  }

  const isApplyDisabled = isLoading || !after || after === "(processing...)"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl flex flex-col" style={{ maxHeight: '90vh' }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            AI Preview: <Badge variant="secondary">{modeLabels[mode] || mode}</Badge>
          </DialogTitle>
          <DialogDescription>
            Review the changes before applying. Click &quot;Apply&quot; to update your document.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 grid grid-cols-2 gap-4 min-h-0">
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-muted-foreground">Before</h3>
              <Badge variant="outline" className="text-xs">
                {before.length} chars
              </Badge>
            </div>
            <div className="flex-1 border rounded-md p-4 bg-muted/30 overflow-y-auto" style={{ maxHeight: '400px' }}>
              <pre className="text-sm whitespace-pre-wrap font-mono">{before || "(empty)"}</pre>
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-primary">After</h3>
              <Badge variant="default" className="text-xs">
                {after.length} chars
              </Badge>
            </div>
            <div className="flex-1 border rounded-md p-4 bg-primary/5 border-primary/20 overflow-y-auto" style={{ maxHeight: '400px' }}>
              <pre className="text-sm whitespace-pre-wrap font-mono">{after || "(processing...)"}</pre>
            </div>
          </div>
        </div>

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
