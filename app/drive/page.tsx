"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { LayoutGrid, List, Plus, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/layout/page-header"
import { DocumentFilters } from "@/components/drive/document-filters"
import { DocTable } from "@/components/drive/doc-table"
import { DocGrid } from "@/components/drive/doc-grid"
import { UploadDropzone } from "@/components/drive/upload-dropzone"
import { EmptyState } from "@/components/shared/empty-state"
import { LoadingSkeleton, TableSkeleton } from "@/components/shared/loading-skeleton"
import { documentsAPI, type AppDocument, DocumentFilters as DocumentFiltersType } from "@/lib/api/documents"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type ViewMode = "table" | "grid"

export default function DrivePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [documents, setDocuments] = useState<AppDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>("table")
  const [filters, setFilters] = useState<DocumentFiltersType>({
    page: 1,
    page_size: 20,
  })
  const [total, setTotal] = useState(0)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [creating, setCreating] = useState(false)
  const [uploading, setUploading] = useState(false)

  // Form state for new document
  const [newDoc, setNewDoc] = useState({
    title: "",
    type: "resume" as AppDocument["type"],
    content_text: "",
    tags: [] as string[],
  })

  useEffect(() => {
    loadDocuments()
  }, [filters])

  const loadDocuments = async () => {
    try {
      setLoading(true)
      const response = await documentsAPI.list(filters)
      setDocuments(response.documents)
      setTotal(response.total)
    } catch (error: any) {
      console.error("Failed to load documents:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to load documents",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await documentsAPI.delete(id)
      toast({
        title: "Success",
        description: "Document deleted successfully",
      })
      loadDocuments()
    } catch (error: any) {
      console.error("Failed to delete document:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete document",
        variant: "destructive",
      })
    }
  }

  const handleCreate = async () => {
    if (!newDoc.title.trim()) {
      toast({
        title: "Error",
        description: "Title is required",
        variant: "destructive",
      })
      return
    }

    try {
      setCreating(true)
      const doc = await documentsAPI.create({
        title: newDoc.title,
        type: newDoc.type,
        content_text: newDoc.content_text || null,
        tags: newDoc.tags,
      })
      toast({
        title: "Success",
        description: "Document created successfully",
      })
      setShowCreateDialog(false)
      setNewDoc({ title: "", type: "resume", content_text: "", tags: [] })
      router.push(`/editor/${doc.id}`)
    } catch (error: any) {
      console.error("Failed to create document:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to create document",
        variant: "destructive",
      })
    } finally {
      setCreating(false)
    }
  }

  const extractTextFromFile = async (file: File): Promise<string> => {
    const extension = file.name.split('.').pop()?.toLowerCase()
    
    try {
      // Handle text files directly
      if (extension === 'txt') {
        return await file.text()
      }
      
      // For binary files (PDF, DOC, DOCX), we need to extract text
      // Since we can't parse binary formats in the browser without libraries,
      // we'll show a user-friendly message and create an empty document
      // The user can manually paste content or we can implement backend parsing
      if (extension === 'pdf' || extension === 'doc' || extension === 'docx') {
        toast({
          title: "File Processing",
          description: `${file.name} will be created. Please paste content manually or use backend parsing (coming soon).`,
          variant: "default",
        })
        // Return empty content - user will need to add content manually
        // TODO: Implement backend file parsing endpoint
        return `[File uploaded: ${file.name}]\n\nPlease paste or type the content of this file into the editor.`
      }
      
      // Fallback: try to read as text, but validate it's not binary
      const text = await file.text()
      // Check if it's binary (starts with PK, has null bytes, etc.)
      if (text.startsWith('PK') || text.includes('\x00') || /[\x00-\x08\x0E-\x1F]/.test(text.substring(0, 100))) {
        return `[Binary file: ${file.name}]\n\nUnable to extract text content. Please paste the content manually.`
      }
      return text
    } catch (error) {
      console.error(`Failed to read file ${file.name}:`, error)
      return `[Error reading file: ${file.name}]\n\nPlease paste the content manually.`
    }
  }

  const handleUpload = async (files: File[]) => {
    try {
      setUploading(true)
      let successCount = 0
      let errorCount = 0
      
      for (const file of files) {
        try {
          // Extract text content from file
          const content = await extractTextFromFile(file)
          
          // Get file extension to infer document type
          const extension = file.name.split('.').pop()?.toLowerCase()
          let docType: AppDocument["type"] = "resume" // Default
          
          // Infer type from filename patterns
          const fileName = file.name.toLowerCase()
          if (fileName.includes('cover') || fileName.includes('letter')) {
            docType = "cover_letter"
          } else if (fileName.includes('job') || fileName.includes('jd') || fileName.includes('description')) {
            docType = "job_description"
          } else if (fileName.includes('interview') || fileName.includes('notes')) {
            docType = "interview_notes"
          }
          
          // Create document with extracted text
          await documentsAPI.create({
            title: file.name.replace(/\.[^/.]+$/, ""),
            type: docType,
            content_text: content,
            tags: [],
          })
          successCount++
        } catch (error: any) {
          console.error(`Failed to upload file ${file.name}:`, error)
          errorCount++
          
          // Check if it's the binary content validation error
          if (error.message?.includes('binary') || error.message?.includes('corrupted')) {
            toast({
              title: "Upload Warning",
              description: `${file.name}: Unable to extract text content. Creating empty document - please add content manually.`,
              variant: "default",
            })
            // Create document with placeholder content
            try {
              await documentsAPI.create({
                title: file.name.replace(/\.[^/.]+$/, ""),
                type: "resume",
                content_text: `[File: ${file.name}]\n\nUnable to automatically extract content from this file format.\nPlease paste or type the content manually.`,
                tags: [],
              })
              successCount++
              errorCount--
            } catch (createError) {
              // If even creating with placeholder fails, show error
              toast({
                title: "Error",
                description: `Failed to create document for ${file.name}: ${createError}`,
                variant: "destructive",
              })
            }
          } else {
            toast({
              title: "Error",
              description: `Failed to upload ${file.name}: ${error.message || 'Unknown error'}`,
              variant: "destructive",
            })
          }
        }
      }
      
      // Show summary
      if (successCount > 0) {
        toast({
          title: "Success",
          description: `${successCount} file(s) uploaded successfully${errorCount > 0 ? `, ${errorCount} failed` : ''}`,
        })
        setShowUploadDialog(false)
        loadDocuments()
      } else if (errorCount > 0) {
        toast({
          title: "Upload Failed",
          description: `Failed to upload ${errorCount} file(s). Please check file formats and try again.`,
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Failed to upload files:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to upload files",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleFiltersChange = (newFilters: DocumentFiltersType) => {
    setFilters(newFilters)
  }

  return (
    <div className="page-transition">
      <PageHeader
        title="AI Drive"
        subtitle="Manage your resumes, cover letters, and job documents"
        action={{
          label: "New Document",
          onClick: () => setShowCreateDialog(true),
          icon: <Plus className="h-4 w-4" />,
        }}
      />

      {/* View Mode Toggle and Upload */}
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
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowUploadDialog(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Upload Files
        </Button>
      </div>

      {/* Filters */}
      <DocumentFilters filters={filters} onFiltersChange={handleFiltersChange} />

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          {viewMode === "table" ? (
            <TableSkeleton rows={5} />
          ) : (
            <LoadingSkeleton count={6} />
          )}
        </div>
      ) : documents.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No documents yet"
          description="Create your first document or upload files to get started"
          action={{
            label: "Create Document",
            onClick: () => setShowCreateDialog(true),
          }}
        />
      ) : (
        <>
          {viewMode === "table" ? (
            <DocTable documents={documents} onDelete={handleDelete} />
          ) : (
            <DocGrid documents={documents} onDelete={handleDelete} />
          )}

          {/* Pagination */}
          {total > filters.page_size! && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
                Showing {(filters.page! - 1) * filters.page_size! + 1} to{" "}
                {Math.min(filters.page! * filters.page_size!, total)} of {total} documents
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

      {/* Create Document Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Document</DialogTitle>
            <DialogDescription>
              Create a new document to get started with AI tools.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Software Engineer Resume"
                value={newDoc.title}
                onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type *</Label>
              <Select
                value={newDoc.type}
                onValueChange={(value) => setNewDoc({ ...newDoc, type: value as AppDocument["type"] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="resume">Resume</SelectItem>
                  <SelectItem value="cover_letter">Cover Letter</SelectItem>
                  <SelectItem value="job_description">Job Description</SelectItem>
                  <SelectItem value="interview_notes">Interview Notes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={creating || !newDoc.title.trim()}>
              {creating ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload Files</DialogTitle>
            <DialogDescription>
              Upload PDF, DOC, DOCX, or TXT files to create documents.
            </DialogDescription>
          </DialogHeader>
          <UploadDropzone onUpload={handleUpload} disabled={uploading} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
