"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Save, Download, FileText } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { PageHeader } from "@/components/layout/page-header"
import { EditorToolbar } from "@/components/editor/editor-toolbar"
import { DocumentOutline } from "@/components/editor/document-outline"
import { AIPanel } from "@/components/editor/ai-panel"
import { EmptyState } from "@/components/shared/empty-state"
import { documentsAPI, AppDocument } from "@/lib/api/documents"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { exportToPDF } from "@/lib/exports"

interface OutlineSection {
  id: string
  title: string
  level: number
  children?: OutlineSection[]
}

export default function EditorPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const documentId = params.id as string

  const [doc, setDoc] = useState<AppDocument | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [content, setContent] = useState("")
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [outline, setOutline] = useState<OutlineSection[]>([])
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [showOutline, setShowOutline] = useState(true)
  const [showAIPanel, setShowAIPanel] = useState(true)
  const [selectedText, setSelectedText] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  

  useEffect(() => {
    if (documentId && documentId !== "new") {
      loadDocument()
    } else {
      // New document
      setDoc(null)
      setContent("")
      setLoading(false)
    }
  }, [documentId])

  useEffect(() => {
    // Parse outline from content (extract headings)
    const sections = parseOutline(content)
    setOutline(sections)
  }, [content])

  // Auto-save draft to localStorage
  useEffect(() => {
    if (content && documentId && documentId !== "new") {
      localStorage.setItem(`doc-${documentId}-draft`, content)
      setHasUnsavedChanges(true)
    }
  }, [content, documentId])

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = ""
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [hasUnsavedChanges])

  const loadDocument = async () => {
    try {
      setLoading(true)
      const loadedDoc = await documentsAPI.get(Number(documentId))
      setDoc(loadedDoc)
      
      // Load draft if exists, otherwise use saved content
      const draft = localStorage.getItem(`doc-${loadedDoc.id}-draft`)
      let contentToUse = draft || loadedDoc.content_text || ""
      
      // Sanitize content - check if it's binary/corrupted data
      if (contentToUse && (contentToUse.startsWith('PK') || contentToUse.includes('\x00') || /[\x00-\x08\x0E-\x1F]/.test(contentToUse))) {
        console.warn('Document content appears to be binary or corrupted. Clearing content.')
        toast({
          title: "Warning",
          description: "Document content appears corrupted. Content has been cleared. Please recreate the document.",
          variant: "default",
        })
        contentToUse = "" // Clear corrupted content
        // Optionally update the document in the backend to clear corrupted data
        try {
          await documentsAPI.update(Number(documentId), {
            content_text: "",
          })
        } catch (e) {
          console.error('Failed to clear corrupted content:', e)
        }
      }
      
      setContent(contentToUse)
      setHasUnsavedChanges(!!draft)
    } catch (error: any) {
      console.error("Failed to load document:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to load document",
        variant: "destructive",
      })
      router.push("/drive")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = useCallback(async () => {
    if (!documentId || documentId === "new") {
      toast({
        title: "Error",
        description: "Cannot save: Document not created yet",
        variant: "destructive",
      })
      return
    }

    try {
      setSaving(true)
      const updated = await documentsAPI.update(Number(documentId), {
        content_text: content,
      })
      
      setDoc(updated)
      setHasUnsavedChanges(false)
      
      // Clear draft from localStorage
      localStorage.removeItem(`doc-${documentId}-draft`)
      
      toast({
        title: "Success",
        description: "Document saved successfully",
      })
    } catch (error: any) {
      console.error("Failed to save document:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to save document",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }, [documentId, content, toast])

  const handleContentUpdate = (newContent: string) => {
    setContent(newContent)
    setHasUnsavedChanges(true)
    // Clear selection after content update
    setSelectedText("")
    // Try to restore focus to textarea
    if (textareaRef.current) {
      setTimeout(() => {
        textareaRef.current?.focus()
      }, 100)
    }
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + S to save
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault()
        handleSave()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleSave])

  const parseOutline = (text: string): OutlineSection[] => {
    const lines = text.split("\n")
    const sections: OutlineSection[] = []
    let currentId = 1

    lines.forEach((line, index) => {
      const trimmed = line.trim()
      
      // Match markdown headings
      const h1Match = trimmed.match(/^#\s+(.+)$/)
      const h2Match = trimmed.match(/^##\s+(.+)$/)
      const h3Match = trimmed.match(/^###\s+(.+)$/)
      
      if (h1Match) {
        sections.push({
          id: `section-${currentId++}`,
          title: h1Match[1],
          level: 1,
        })
      } else if (h2Match) {
        sections.push({
          id: `section-${currentId++}`,
          title: h2Match[1],
          level: 2,
        })
      } else if (h3Match) {
        sections.push({
          id: `section-${currentId++}`,
          title: h3Match[1],
          level: 3,
        })
      }
    })

    return sections
  }

  // Toolbar actions (simple markdown formatting)
  const handleBold = () => {
    const textarea = globalThis.document.querySelector("textarea") as HTMLTextAreaElement | null
    if (!textarea) return
    
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = content.substring(start, end)
    
    if (selected) {
      const newContent = content.substring(0, start) + `**${selected}**` + content.substring(end)
      setContent(newContent)
      setHasUnsavedChanges(true)
      
      // Restore selection
      setTimeout(() => {
        textarea.setSelectionRange(start + 2, end + 2)
        textarea.focus()
      }, 0)
    }
  }

  const handleItalic = () => {
    const textarea = globalThis.document.querySelector("textarea") as HTMLTextAreaElement | null
    if (!textarea) return
    
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = content.substring(start, end)
    
    if (selected) {
      const newContent = content.substring(0, start) + `*${selected}*` + content.substring(end)
      setContent(newContent)
      setHasUnsavedChanges(true)
      
      setTimeout(() => {
        textarea.setSelectionRange(start + 1, end + 1)
        textarea.focus()
      }, 0)
    }
  }

  const handleUnderline = () => {
    // Markdown doesn't have underline, so we'll skip it or use HTML
    toast({
      title: "Note",
      description: "Markdown doesn't support underline. Use **bold** or *italic* instead.",
    })
  }

  const handleHeading1 = () => {
    const textarea = globalThis.document.querySelector("textarea") as HTMLTextAreaElement | null
    if (!textarea) return
    
    const start = textarea.selectionStart
    const end = textarea.selectionEnd || start
    const lineStart = content.lastIndexOf("\n", start - 1) + 1
    const lineEnd = content.indexOf("\n", end)
    const lineEndPos = lineEnd === -1 ? content.length : lineEnd
    const line = content.substring(lineStart, lineEndPos)
    
    let newLine = line
    if (!line.startsWith("#")) {
      newLine = `# ${line.trim()}`
    } else if (line.startsWith("##")) {
      newLine = line.replace(/^##\s*/, "# ")
    }
    
    const newContent = content.substring(0, lineStart) + newLine + content.substring(lineEndPos)
    setContent(newContent)
    setHasUnsavedChanges(true)
  }

  const handleHeading2 = () => {
    const textarea = globalThis.document.querySelector("textarea") as HTMLTextAreaElement | null
    if (!textarea) return
    
    const start = textarea.selectionStart
    const end = textarea.selectionEnd || start
    const lineStart = content.lastIndexOf("\n", start - 1) + 1
    const lineEnd = content.indexOf("\n", end)
    const lineEndPos = lineEnd === -1 ? content.length : lineEnd
    const line = content.substring(lineStart, lineEndPos)
    
    let newLine = line
    if (!line.startsWith("#")) {
      newLine = `## ${line.trim()}`
    } else if (line.startsWith("#") && !line.startsWith("##")) {
      newLine = line.replace(/^#\s*/, "## ")
    }
    
    const newContent = content.substring(0, lineStart) + newLine + content.substring(lineEndPos)
    setContent(newContent)
    setHasUnsavedChanges(true)
    
    setTimeout(() => {
      textarea.focus()
      const newStart = lineStart + newLine.length
      textarea.setSelectionRange(newStart, newStart)
    }, 0)
  }

  const handleBulletList = () => {
    const textarea = globalThis.document.querySelector("textarea") as HTMLTextAreaElement | null
    if (!textarea) return
    
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = content.substring(start, end)
    
    if (selected) {
      const lines = selected.split("\n")
      const bulleted = lines.map(line => line.trim() ? `- ${line.trim()}` : line).join("\n")
      const newContent = content.substring(0, start) + bulleted + content.substring(end)
      setContent(newContent)
      setHasUnsavedChanges(true)
    }
  }

  const handleOrderedList = () => {
    const textarea = globalThis.document.querySelector("textarea") as HTMLTextAreaElement | null
    if (!textarea) return
    
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = content.substring(start, end)
    
    if (selected) {
      const lines = selected.split("\n").filter(line => line.trim())
      const ordered = lines.map((line, i) => `${i + 1}. ${line.trim()}`).join("\n")
      const newContent = content.substring(0, start) + ordered + content.substring(end)
      setContent(newContent)
      setHasUnsavedChanges(true)
    }
  }

  const handleQuote = () => {
    const textarea = globalThis.document.querySelector("textarea") as HTMLTextAreaElement | null
    if (!textarea) return
    
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = content.substring(start, end)
    
    if (selected) {
      const lines = selected.split("\n")
      const quoted = lines.map(line => line.trim() ? `> ${line.trim()}` : line).join("\n")
      const newContent = content.substring(0, start) + quoted + content.substring(end)
      setContent(newContent)
      setHasUnsavedChanges(true)
    }
  }

  const handleCode = () => {
    const textarea = globalThis.document.querySelector("textarea") as HTMLTextAreaElement | null
    if (!textarea) return
    
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = content.substring(start, end)
    
    if (selected) {
      const newContent = content.substring(0, start) + "```\n" + selected + "\n```" + content.substring(end)
      setContent(newContent)
      setHasUnsavedChanges(true)
      
      setTimeout(() => {
        textarea.setSelectionRange(start + 4, end + 4)
        textarea.focus()
      }, 0)
    }
  }

  const handleUndo = () => {
    // Simple undo - just show a message for now
    // TODO: Implement proper undo/redo with history
    toast({
      title: "Note",
      description: "Undo/Redo will be implemented with a proper editor",
    })
  }

  const handleRedo = () => {
    toast({
      title: "Note",
      description: "Undo/Redo will be implemented with a proper editor",
    })
  }

  if (loading) {
    return (
      <div className="page-transition">
        <PageHeader title="Loading..." subtitle="Loading document..." />
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-96 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!doc && documentId !== "new") {
    return (
      <div className="page-transition">
        <EmptyState
          icon={FileText}
          title="Document not found"
          description="The document you're looking for doesn't exist or you don't have access to it."
          action={{
            label: "Back to Drive",
            onClick: () => router.push("/drive"),
          }}
        />
      </div>
    )
  }

  return (
    <div className="page-transition min-h-[calc(100vh-8rem)] flex flex-col">
      <PageHeader
        title={doc?.title || "New Document"}
        subtitle={doc ? `Last updated ${new Date(doc.updated_at).toLocaleDateString()}` : "Create a new document"}
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/drive")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                try {
                  await exportToPDF(doc?.title || "Document", content)
                  toast({
                    title: "Success",
                    description: "Opening print dialog for PDF export",
                  })
                } catch (error: any) {
                  toast({
                    title: "Error",
                    description: error.message || "Failed to export PDF",
                    variant: "destructive",
                  })
                }
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
            {hasUnsavedChanges && (
              <span className="text-xs text-muted-foreground">Unsaved changes</span>
            )}
          </div>
        }
      />

      <div className="flex-1 flex overflow-hidden border rounded-lg bg-card">
        {/* Left Sidebar - Document Outline */}
        {showOutline && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: 280 }}
            exit={{ width: 0 }}
            className="border-r bg-muted/30 overflow-y-auto p-4"
          >
            <DocumentOutline
              sections={outline}
              onSectionClick={(id) => {
                setActiveSection(id)
                // TODO: Scroll to section in editor
              }}
              activeSectionId={activeSection || undefined}
            />
          </motion.div>
        )}

        {/* Center - Editor */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <EditorToolbar
            onBold={handleBold}
            onItalic={handleItalic}
            onUnderline={handleUnderline}
            onHeading1={handleHeading1}
            onHeading2={handleHeading2}
            onBulletList={handleBulletList}
            onOrderedList={handleOrderedList}
            onQuote={handleQuote}
            onCode={handleCode}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onSave={handleSave}
            isSaving={saving}
            canUndo={false} // TODO: Implement
            canRedo={false} // TODO: Implement
          />
          <div className="flex-1 overflow-hidden relative">
            <Textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => {
                setContent(e.target.value)
                setHasUnsavedChanges(true)
              }}
              onSelect={(e) => {
                // Capture selected text from textarea
                const textarea = e.currentTarget
                const start = textarea.selectionStart
                const end = textarea.selectionEnd
                const selected = content.substring(start, end)
                setSelectedText(selected)
              }}
              placeholder="Start typing your document... Use markdown syntax for formatting:
# Heading 1
## Heading 2
**bold** or *italic*
- Bullet list
1. Numbered list
> Quote
\`\`\`code\`\`\`"
              className={cn(
                "h-full w-full resize-none border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 font-mono text-sm",
                "p-6"
              )}
              spellCheck={false}
            />
          </div>
          
          {/* Markdown Preview Toggle (optional) */}
          <div className="border-t p-2 text-xs text-muted-foreground text-center">
            Markdown Editor • Use Ctrl/Cmd + S to save • {content.length} characters
          </div>
        </div>

        {/* Right Sidebar - AI Panel */}
        {showAIPanel && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden min-w-[320px]"
          >
            <AIPanel
              documentId={doc?.id || 0}
              documentContent={content}
              selectedText={selectedText}
              onContentUpdate={handleContentUpdate}
              onSelectedTextChange={setSelectedText}
              className="h-full"
            />
          </motion.div>
        )}
      </div>
    </div>
  )
}
