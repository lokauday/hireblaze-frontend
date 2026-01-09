"use client"

import { useState } from "react"
import { Search, Filter, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { JobFilters as JobFiltersType } from "@/lib/api/jobs"
import { cn } from "@/lib/utils"

interface JobFiltersProps {
  filters: JobFiltersType
  onFiltersChange: (filters: JobFiltersType) => void
  className?: string
}

const JOB_STATUSES = [
  { value: "saved", label: "Saved", color: "bg-gray-500/10 text-gray-700 dark:text-gray-400" },
  { value: "applied", label: "Applied", color: "bg-blue-500/10 text-blue-700 dark:text-blue-400" },
  { value: "interviewing", label: "Interviewing", color: "bg-purple-500/10 text-purple-700 dark:text-purple-400" },
  { value: "offer", label: "Offer", color: "bg-green-500/10 text-green-700 dark:text-green-400" },
  { value: "rejected", label: "Rejected", color: "bg-red-500/10 text-red-700 dark:text-red-400" },
  { value: "withdrawn", label: "Withdrawn", color: "bg-orange-500/10 text-orange-700 dark:text-orange-400" },
] as const

export function JobFilters({ filters, onFiltersChange, className }: JobFiltersProps) {
  const [searchQuery, setSearchQuery] = useState(filters.search || "")

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    onFiltersChange({ ...filters, search: value || undefined, page: 1 })
  }

  const handleStatusChange = (status: string) => {
    onFiltersChange({ ...filters, status: status === filters.status ? undefined : status, page: 1 })
  }

  const clearFilters = () => {
    setSearchQuery("")
    onFiltersChange({ page: 1, page_size: 20 })
  }

  const hasActiveFilters = !!filters.status || !!filters.search || !!filters.company

  return (
    <div className={cn("flex items-center gap-4 mb-6", className)}>
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search jobs..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Status
            {filters.status && (
              <Badge variant="secondary" className="ml-2">
                1
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Job Status</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {JOB_STATUSES.map((status) => (
            <DropdownMenuItem
              key={status.value}
              onClick={() => handleStatusChange(status.value)}
              className={cn(
                "cursor-pointer",
                filters.status === status.value && "bg-accent"
              )}
            >
              <Badge variant="outline" className={cn("mr-2 text-xs", status.color)}>
                {status.label}
              </Badge>
              {filters.status === status.value && " ✓"}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          <X className="mr-2 h-4 w-4" />
          Clear
        </Button>
      )}
    </div>
  )
}
