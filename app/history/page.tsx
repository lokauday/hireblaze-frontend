"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Clock, Filter, Calendar, Zap, FileText, Briefcase, FileCheck, Sparkles } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/layout/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { LoadingSkeleton } from "@/components/shared/loading-skeleton"
import { historyAPI, HistoryEntry, HistoryFilters as HistoryFiltersType } from "@/lib/api/history"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import Link from "next/link"

const featureIcons: Record<string, any> = {
  ats_scan: FileCheck,
  resume_tailor: FileText,
  cover_letter: Briefcase,
  jd_parse: Zap,
  document_create: FileText,
  document_update: FileText,
  document_delete: FileText,
}

const featureNames: Record<string, string> = {
  ats_scan: "ATS Scan",
  resume_tailor: "Resume Tailor",
  cover_letter: "Cover Letter",
  jd_parse: "JD Parse",
  document_create: "Document Created",
  document_update: "Document Updated",
  document_delete: "Document Deleted",
}

const featureColors: Record<string, string> = {
  ats_scan: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  resume_tailor: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
  cover_letter: "bg-green-500/10 text-green-700 dark:text-green-400",
  jd_parse: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
  document_create: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  document_update: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400",
  document_delete: "bg-red-500/10 text-red-700 dark:text-red-400",
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
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
}

function formatDateTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function HistoryPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [entries, setEntries] = useState<HistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<HistoryFiltersType>({
    page: 1,
    page_size: 50,
  })
  const [total, setTotal] = useState(0)
  const [selectedFeature, setSelectedFeature] = useState<string>("")

  useEffect(() => {
    loadHistory()
  }, [filters])

  const loadHistory = async () => {
    try {
      setLoading(true)
      const response = await historyAPI.list(filters)
      setEntries(response.entries)
      setTotal(response.total)
    } catch (error: any) {
      console.error("Failed to load history:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to load activity history",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFeatureFilter = (feature: string) => {
    setSelectedFeature(feature)
    setFilters({
      ...filters,
      feature: feature || undefined,
      page: 1,
    })
  }

  // Group entries by date
  const groupedEntries = entries.reduce((acc, entry) => {
    const date = new Date(entry.created_at).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(entry)
    return acc
  }, {} as Record<string, HistoryEntry[]>)

  const sortedDates = Object.keys(groupedEntries).sort((a, b) => {
    return new Date(b).getTime() - new Date(a).getTime()
  })

  // Statistics
  const stats = {
    total: entries.length,
    today: entries.filter((e) => {
      const today = new Date().toDateString()
      return new Date(e.created_at).toDateString() === today
    }).length,
    thisWeek: entries.filter((e) => {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return new Date(e.created_at) >= weekAgo
    }).length,
    totalCredits: entries.reduce((sum, e) => sum + e.amount, 0),
  }

  return (
    <div className="page-transition">
      <PageHeader
        title="Activity History"
        subtitle="Timeline of all your AI actions and document operations"
      />

      {/* Statistics */}
      {!loading && entries.length > 0 && (
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card className="card-hover">
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total Actions</div>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.today}</div>
              <div className="text-sm text-muted-foreground">Today</div>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">{stats.thisWeek}</div>
              <div className="text-sm text-muted-foreground">This Week</div>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{stats.totalCredits}</div>
              <div className="text-sm text-muted-foreground">Credits Used</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1">
          <Select value={selectedFeature} onValueChange={handleFeatureFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by feature" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Features</SelectItem>
              <SelectItem value="ats_scan">ATS Scan</SelectItem>
              <SelectItem value="resume_tailor">Resume Tailor</SelectItem>
              <SelectItem value="cover_letter">Cover Letter</SelectItem>
              <SelectItem value="jd_parse">JD Parse</SelectItem>
              <SelectItem value="document_create">Document Created</SelectItem>
              <SelectItem value="document_update">Document Updated</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {selectedFeature && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedFeature("")
              setFilters({ ...filters, feature: undefined, page: 1 })
            }}
          >
            Clear Filter
          </Button>
        )}
      </div>

      {/* Timeline */}
      {loading ? (
        <LoadingSkeleton count={10} />
      ) : entries.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="No activity yet"
          description="Your AI actions and document operations will appear here"
          className="py-12"
        />
      ) : (
        <div className="space-y-8">
          {sortedDates.map((date, dateIndex) => (
            <motion.div
              key={date}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: dateIndex * 0.1 }}
              className="relative"
            >
              {/* Date Header */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <h3 className="text-lg font-semibold">{date}</h3>
                </div>
                <div className="flex-1 h-px bg-border" />
                <Badge variant="secondary" className="text-xs">
                  {groupedEntries[date].length} action{groupedEntries[date].length > 1 ? "s" : ""}
                </Badge>
              </div>

              {/* Timeline Entries */}
              <div className="space-y-3 pl-8 border-l-2 border-muted">
                {groupedEntries[date].map((entry, index) => {
                  const Icon = featureIcons[entry.feature] || Sparkles
                  const featureName = featureNames[entry.feature] || entry.feature.replace("_", " ")
                  const featureColor = featureColors[entry.feature] || "bg-gray-500/10 text-gray-700 dark:text-gray-400"

                  return (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: dateIndex * 0.1 + index * 0.05 }}
                      className="relative"
                    >
                      {/* Timeline Dot */}
                      <div className="absolute -left-[33px] top-2 w-2 h-2 rounded-full bg-primary border-2 border-background" />

                      {/* Entry Card */}
                      <Card className="card-hover">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <div className={cn("rounded-md p-2 mt-0.5", featureColor)}>
                              <Icon className="h-5 w-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm">{featureName}</span>
                                <Badge variant="secondary" className="text-xs">
                                  {entry.amount} credit{entry.amount > 1 ? "s" : ""}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatDate(entry.created_at)}
                                </span>
                                <span>•</span>
                                <span>{formatDateTime(entry.created_at)}</span>
                              </div>
                              {(entry.document_id || entry.job_id) && (
                                <div className="mt-2 flex gap-2">
                                  {entry.document_id && (
                                    <Link href={`/editor/${entry.document_id}`}>
                                      <Button variant="outline" size="sm" className="h-7 text-xs">
                                        <FileText className="h-3 w-3 mr-1" />
                                        View Document
                                      </Button>
                                    </Link>
                                  )}
                                  {entry.job_id && (
                                    <Link href={`/jobs?edit=${entry.job_id}`}>
                                      <Button variant="outline" size="sm" className="h-7 text-xs">
                                        <Briefcase className="h-3 w-3 mr-1" />
                                        View Job
                                      </Button>
                                    </Link>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          ))}

          {/* Pagination */}
          {total > filters.page_size! && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
                Showing {(filters.page! - 1) * filters.page_size! + 1} to{" "}
                {Math.min(filters.page! * filters.page_size!, total)} of {total} entries
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
        </div>
      )}
    </div>
  )
}
