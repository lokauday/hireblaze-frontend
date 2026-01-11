"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Briefcase,
  MoreVertical,
  Trash2,
  Edit,
  ExternalLink,
  Calendar,
  FileSearch,
  BarChart3,
  Send,
  FileText,
  Sparkles,
  Lock,
  Package,
} from "lucide-react"
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
import { Job } from "@/lib/api/jobs"
import { cn } from "@/lib/utils"
import { auth } from "@/lib/auth"

interface JobTableProps {
  jobs: Job[]
  onDelete: (id: number) => void
  onParseJD?: (id: number) => void
  onViewInsights?: (job: Job) => void
  onGenerateOutreach?: (job: Job) => void
  onInterviewPack?: (job: Job) => void
  onGenerateJobPack?: (job: Job) => void
  parsingJobId?: number | null
  className?: string
}

const STATUS_LABELS: Record<string, string> = {
  saved: "Saved",
  applied: "Applied",
  interviewing: "Interviewing",
  offer: "Offer",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
}

const STATUS_COLORS: Record<string, string> = {
  saved: "bg-gray-500/10 text-gray-700 dark:text-gray-400",
  applied: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  interviewing: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
  offer: "bg-green-500/10 text-green-700 dark:text-green-400",
  rejected: "bg-red-500/10 text-red-700 dark:text-red-400",
  withdrawn: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
}

// Format date helper
function formatDate(dateString: string | null): string {
  if (!dateString) return "—"
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
}

export function JobTable({
  jobs,
  onDelete,
  onParseJD,
  onViewInsights,
  onGenerateOutreach,
  onInterviewPack,
  onGenerateJobPack,
  parsingJobId,
  className,
}: JobTableProps) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this job application?")) return

    setDeletingId(id)
    try {
      await onDelete(id)
    } finally {
      setDeletingId(null)
    }
  }

  const handleEdit = (id: number) => {
    router.push(`/jobs?edit=${id}`)
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No jobs found. Add your first job application to get started.
      </div>
    )
  }

  return (
    <div className={cn("border rounded-lg overflow-hidden", className)}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12"></TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Applied</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.map((job) => (
            <TableRow
              key={job.id}
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => handleEdit(job.id)}
            >
              <TableCell>
                <Briefcase className="h-5 w-5 text-muted-foreground" />
              </TableCell>
              <TableCell className="font-medium">{job.company}</TableCell>
              <TableCell>{job.title}</TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={cn(
                    STATUS_COLORS[job.status] || "bg-gray-500/10 text-gray-700 dark:text-gray-400"
                  )}
                >
                  {STATUS_LABELS[job.status] || job.status}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {formatDate(job.applied_at)}
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {formatDate(job.updated_at)}
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      disabled={deletingId === job.id}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={() => handleEdit(job.id)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    {job.url && (
                      <DropdownMenuItem onClick={() => window.open(job.url!, "_blank")}>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Open Job Post
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    {onParseJD && (
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          onParseJD(job.id)
                        }}
                        disabled={parsingJobId === job.id}
                      >
                        {parsingJobId === job.id ? (
                          <>
                            <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                            Parsing...
                          </>
                        ) : (
                          <>
                            <FileSearch className="mr-2 h-4 w-4" />
                            Parse JD
                          </>
                        )}
                      </DropdownMenuItem>
                    )}
                    {onViewInsights && (
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          onViewInsights(job)
                        }}
                      >
                        <BarChart3 className="mr-2 h-4 w-4" />
                        View Insights
                      </DropdownMenuItem>
                    )}
                    {onGenerateOutreach && (
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          onGenerateOutreach(job)
                        }}
                      >
                        <Send className="mr-2 h-4 w-4" />
                        Generate Outreach
                      </DropdownMenuItem>
                    )}
                    {onInterviewPack && (
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          onInterviewPack(job)
                        }}
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        Interview Pack
                      </DropdownMenuItem>
                    )}
                    {onGenerateJobPack && (
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          onGenerateJobPack(job)
                        }}
                        className="relative"
                      >
                        <Package className="mr-2 h-4 w-4" />
                        Generate Application Pack
                        {auth.getUser()?.plan !== "premium" && (
                          <Lock className="ml-auto h-3 w-3 text-muted-foreground" />
                        )}
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(job.id)
                      }}
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
