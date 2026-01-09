"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { FileText, MoreVertical, Trash2, Download, Edit, Eye } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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

interface DocTableProps {
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

export function DocTable({ documents, onDelete, className }: DocTableProps) {
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
    <div className={cn("border rounded-lg overflow-hidden", className)}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12"></TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((doc) => (
            <TableRow
              key={doc.id}
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => handleOpen(doc.id)}
            >
              <TableCell>
                <FileText className="h-5 w-5 text-muted-foreground" />
              </TableCell>
              <TableCell className="font-medium">{doc.title}</TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={cn(
                    DOCUMENT_TYPE_COLORS[doc.type] || "bg-gray-500/10 text-gray-700 dark:text-gray-400"
                  )}
                >
                  {DOCUMENT_TYPE_LABELS[doc.type] || doc.type}
                </Badge>
              </TableCell>
              <TableCell>
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
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {formatDistanceToNow(new Date(doc.updated_at), { addSuffix: true })}
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
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
                    <DropdownMenuItem onClick={() => {
                      // TODO: Export document
                      alert("Export functionality will open the document in the editor where you can export it as PDF")
                    }}>
                      <Download className="mr-2 h-4 w-4" />
                      Export
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleDelete(doc.id)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
