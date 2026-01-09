"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { MoreVertical, Trash2, Download, Edit, Eye } from "lucide-react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AppDocument } from "@/lib/api/documents"
import { cn } from "@/lib/utils"

interface DocGridProps {
  documents: AppDocument[]
  onDelete: (id: number) => void
  className?: string
}

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  resume: "Resume",
  cover_letter: "Cover Letter",
  job_description: "Job Description",
  interview_notes: "Interview Notes",
}

const DOCUMENT_TYPE_COLORS: Record<string, string> = {
  resume: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  cover_letter: "bg-green-500/10 text-green-700 dark:text-green-400",
  job_description: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
  interview_notes: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
}

// Format date helper
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "just now"
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`
  return date.toLocaleDateString()
}

export function DocGrid({ documents, onDelete, className }: DocGridProps) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this document?")) return
    
    setDeletingId(id)
    try {
      await onDelete(id)
    } finally {
      setDeletingId(null)
    }
  }

  const handleOpen = (id: number) => {
    router.push(`/editor/${id}`)
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No documents found. Create your first document to get started.
      </div>
    )
  }

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", className)}>
      {documents.map((doc) => (
        <motion.div
          key={doc.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Card
            className={cn(
              "card-hover cursor-pointer h-full flex flex-col",
              deletingId === doc.id && "opacity-50"
            )}
            onClick={() => handleOpen(doc.id)}
          >
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div className="flex-1">
                <CardTitle className="text-base font-semibold line-clamp-2">
                  {doc.title}
                </CardTitle>
                <CardDescription className="mt-1.5">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs",
                      DOCUMENT_TYPE_COLORS[doc.type] || "bg-gray-500/10 text-gray-700 dark:text-gray-400"
                    )}
                  >
                    {DOCUMENT_TYPE_LABELS[doc.type] || doc.type}
                  </Badge>
                </CardDescription>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    disabled={deletingId === doc.id}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleOpen(doc.id)}>
                    <Eye className="mr-2 h-4 w-4" />
                    Open
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push(`/editor/${doc.id}`)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation()
                    // TODO: Export document
                    alert("Export functionality will open the document in the editor where you can export it as PDF")
                  }}>
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(doc.id)
                    }}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent className="flex-1">
              {doc.tags && doc.tags.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  {doc.tags.slice(0, 3).map((tag, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {doc.tags.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{doc.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter className="text-xs text-muted-foreground">
              Updated {formatDate(doc.updated_at)}
            </CardFooter>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
