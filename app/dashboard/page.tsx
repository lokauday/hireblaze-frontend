"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  ArrowUpRight,
  Zap,
  FileText,
  Briefcase,
  FileCheck,
  AlertCircle,
  Clock,
  TrendingUp,
  Plus,
  FolderOpen,
  History,
  Sparkles,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { PageHeader } from "@/components/layout/page-header"
import { LoadingSkeleton } from "@/components/shared/loading-skeleton"
import { EmptyState } from "@/components/shared/empty-state"
import { OnboardingChecklist } from "@/components/shared/onboarding-checklist"
import { usageAPI, APIError } from "@/lib/api-client"
import { documentsAPI, AppDocument } from "@/lib/api/documents"
import { historyAPI, HistoryEntry } from "@/lib/api/history"
import { auth } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface UsageFeature {
  limit: number | null
  used: number
  remaining: number | null
  unlimited: boolean
}

interface UsageResponse {
  plan: string
  month_key: string
  features: {
    [key: string]: UsageFeature
  }
}

const featureIcons: Record<string, any> = {
  ats_scan: FileCheck,
  resume_tailor: FileText,
  cover_letter: Briefcase,
  jd_parse: Zap,
}

const featureNames: Record<string, string> = {
  ats_scan: "ATS Scan",
  resume_tailor: "Resume Tailor",
  cover_letter: "Cover Letter",
  jd_parse: "JD Parse",
}

const featureOrder = ["ats_scan", "resume_tailor", "cover_letter", "jd_parse"]

// Format date helper
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

export default function DashboardPage() {
  const router = useRouter()
  const [usage, setUsage] = useState<UsageResponse | null>(null)
  const [recentDocuments, setRecentDocuments] = useState<AppDocument[]>([])
  const [recentActivity, setRecentActivity] = useState<HistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingActivity, setLoadingActivity] = useState(true)
  const [loadingDocuments, setLoadingDocuments] = useState(true)
  const { toast } = useToast()
  const user = auth.getUser()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    // Fetch usage
    try {
      const usageData = await usageAPI.getUsage()
      setUsage(usageData)
    } catch (err: any) {
      if (err instanceof APIError) {
        toast({
          title: "Failed to load usage data",
          description: err.message || "Please try again later.",
          variant: "destructive",
        })
      }
    } finally {
      setLoading(false)
    }

    // Fetch recent documents
    try {
      const docsResponse = await documentsAPI.list({ page: 1, page_size: 5 })
      setRecentDocuments(docsResponse.documents)
    } catch (err: any) {
      console.error("Failed to load recent documents:", err)
    } finally {
      setLoadingDocuments(false)
    }

    // Fetch recent activity
    try {
      const activityResponse = await historyAPI.list({ page: 1, page_size: 10 })
      setRecentActivity(activityResponse.entries)
    } catch (err: any) {
      console.error("Failed to load activity:", err)
    } finally {
      setLoadingActivity(false)
    }
  }

  // Calculate total credits remaining
  const totalRemaining = usage
    ? Object.values(usage.features).reduce((sum, feature) => {
        if (feature.unlimited || feature.remaining === null) return sum + 999
        return sum + feature.remaining
      }, 0)
    : 0

  // Calculate total used this month
  const totalUsed = usage
    ? Object.values(usage.features).reduce((sum, feature) => sum + feature.used, 0)
    : 0

  // Estimate time saved (rough calculation: 10 minutes per AI action)
  const estimatedTimeSaved = totalUsed * 10 // minutes

  if (loading) {
    return (
      <div className="page-transition space-y-6">
        <PageHeader title="Dashboard" subtitle="Loading your data..." />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-2 w-full" />
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!usage) {
    return (
      <div className="page-transition">
        <PageHeader title="Dashboard" subtitle="Failed to load data" />
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p>Failed to load usage data</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const planColors: Record<string, "default" | "secondary" | "outline"> = {
    free: "secondary",
    pro: "default",
    elite: "outline",
  }

  return (
    <div className="page-transition space-y-6">
      <OnboardingChecklist />
      <PageHeader
        title={`Welcome back, ${user?.full_name || user?.email?.split("@")[0] || "User"}`}
        subtitle={`Here's your overview for ${usage.month_key}`}
        action={
          <Badge variant={planColors[usage.plan] || "secondary"} className="text-sm px-4 py-1.5">
            {usage.plan.toUpperCase()} Plan
          </Badge>
        }
      />

      {/* KPI Strip */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Plan</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{usage.plan}</div>
            <p className="text-xs text-muted-foreground mt-1">Monthly billing</p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credits Remaining</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRemaining > 999 ? "∞" : totalRemaining}</div>
            <p className="text-xs text-muted-foreground mt-1">Available this month</p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month Usage</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsed}</div>
            <p className="text-xs text-muted-foreground mt-1">AI actions completed</p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Saved</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {estimatedTimeSaved >= 60
                ? `${Math.floor(estimatedTimeSaved / 60)}h`
                : `${estimatedTimeSaved}m`}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Estimated time saved</p>
          </CardContent>
        </Card>
      </div>

      {/* Usage Cards */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Feature Usage</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {featureOrder.map((featureKey, index) => {
            const feature = usage.features[featureKey]
            if (!feature) return null

            const Icon = featureIcons[featureKey] || Zap
            const percentage = feature.unlimited
              ? 0
              : feature.limit
              ? Math.min((feature.used / feature.limit) * 100, 100)
              : 0
            const isNearLimit =
              !feature.unlimited &&
              feature.limit &&
              feature.remaining !== null &&
              feature.remaining <= feature.limit * 0.3
            const isLow =
              !feature.unlimited &&
              feature.limit &&
              feature.remaining !== null &&
              feature.remaining / feature.limit < 0.2

            return (
              <motion.div
                key={featureKey}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={cn("card-hover transition-all", isLow && "border-orange-500/50")}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {featureNames[featureKey] || featureKey}
                    </CardTitle>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold">{feature.used}</span>
                        <span className="text-muted-foreground text-sm">
                          / {feature.unlimited ? "∞" : feature.limit || 0}
                        </span>
                      </div>
                      {!feature.unlimited && (
                        <>
                          <Progress value={percentage} className="h-2" />
                          <p className="text-xs text-muted-foreground">
                            {feature.remaining !== null
                              ? `${feature.remaining} remaining`
                              : "Unlimited"}
                          </p>
                        </>
                      )}
                      {feature.unlimited && (
                        <p className="text-xs text-muted-foreground">Unlimited usage</p>
                      )}
                      {isNearLimit && !feature.unlimited && (
                        <Link href="/billing">
                          <Button variant={isLow ? "default" : "outline"} size="sm" className="w-full mt-2">
                            <ArrowUpRight className="h-3 w-3 mr-1" />
                            {isLow ? "Upgrade Now" : "Upgrade"}
                          </Button>
                        </Link>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Get started with AI-powered tools</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <Link href="/ai-tools?tab=tailor">
                <Button variant="outline" className="w-full justify-start h-auto py-3 group hover:border-primary">
                  <FileText className="h-4 w-4 mr-3 text-primary" />
                  <div className="text-left flex-1">
                    <div className="font-medium">Tailor Resume</div>
                    <div className="text-xs text-muted-foreground">Customize your resume for a job</div>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Button>
              </Link>
              <Link href="/ai-tools?tab=cover">
                <Button variant="outline" className="w-full justify-start h-auto py-3 group hover:border-primary">
                  <Briefcase className="h-4 w-4 mr-3 text-primary" />
                  <div className="text-left flex-1">
                    <div className="font-medium">Generate Cover Letter</div>
                    <div className="text-xs text-muted-foreground">Create personalized cover letters</div>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Button>
              </Link>
              <Link href="/ai-tools?tab=ats">
                <Button variant="outline" className="w-full justify-start h-auto py-3 group hover:border-primary">
                  <FileCheck className="h-4 w-4 mr-3 text-primary" />
                  <div className="text-left flex-1">
                    <div className="font-medium">ATS Scan</div>
                    <div className="text-xs text-muted-foreground">Check ATS compatibility</div>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Button>
              </Link>
              <Link href="/ai-tools?tab=jd">
                <Button variant="outline" className="w-full justify-start h-auto py-3 group hover:border-primary">
                  <Zap className="h-4 w-4 mr-3 text-primary" />
                  <div className="text-left flex-1">
                    <div className="font-medium">Parse Job Description</div>
                    <div className="text-xs text-muted-foreground">Extract key requirements</div>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Continue Where You Left Off */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Continue Where You Left Off</CardTitle>
              <CardDescription>Your recent documents</CardDescription>
            </div>
            <Link href="/drive">
              <Button variant="ghost" size="sm">
                <FolderOpen className="h-4 w-4 mr-2" />
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {loadingDocuments ? (
              <LoadingSkeleton count={3} />
            ) : recentDocuments.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No documents yet"
                description="Create your first document to get started"
                action={{
                  label: "New Document",
                  onClick: () => router.push("/drive"),
                }}
                className="py-8"
              />
            ) : (
              <div className="space-y-2">
                {recentDocuments.map((doc) => (
                  <Link
                    key={doc.id}
                    href={`/editor/${doc.id}`}
                    className="block p-3 rounded-lg border hover:bg-accent transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                          {doc.title}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {doc.type.replace("_", " ")}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(doc.updated_at)}
                          </span>
                        </div>
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform opacity-0 group-hover:opacity-100" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Feed */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest AI actions and updates</CardDescription>
          </div>
          <Link href="/history">
            <Button variant="ghost" size="sm">
              <History className="h-4 w-4 mr-2" />
              View All
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {loadingActivity ? (
            <LoadingSkeleton count={5} />
          ) : recentActivity.length === 0 ? (
            <EmptyState
              icon={History}
              title="No activity yet"
              description="Your AI actions will appear here"
              className="py-8"
            />
          ) : (
            <div className="space-y-3">
              {recentActivity.slice(0, 10).map((entry) => {
                const Icon = featureIcons[entry.feature] || Zap
                return (
                  <div
                    key={entry.id}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="rounded-full bg-primary/10 p-2">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">
                        {featureNames[entry.feature] || entry.feature.replace("_", " ")}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {formatDate(entry.created_at)} • {entry.amount} credit{entry.amount > 1 ? "s" : ""} used
                      </div>
                    </div>
                    {entry.document_id && (
                      <Link href={`/editor/${entry.document_id}`}>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </Link>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
