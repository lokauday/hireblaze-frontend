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
import { DocumentFilters as DocumentFiltersType } from "@/lib/api/documents"
import { cn } from "@/lib/utils"

interface DocumentFiltersProps {
  filters: DocumentFiltersType
  onFiltersChange: (filters: DocumentFiltersType) => void
  className?: string
}

const DOCUMENT_TYPES = [
  { value: "resume", label: "Resume" },
  { value: "cover_letter", label: "Cover Letter" },
  { value: "job_description", label: "Job Description" },
  { value: "interview_notes", label: "Interview Notes" },
] as const

export function DocumentFilters({ filters, onFiltersChange, className }: DocumentFiltersProps) {
  const [searchQuery, setSearchQuery] = useState(filters.search || "")

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    onFiltersChange({ ...filters, search: value || undefined, page: 1 })
  }

  const handleTypeChange = (type: string) => {
    onFiltersChange({ ...filters, type: type === filters.type ? undefined : type, page: 1 })
  }

  const clearFilters = () => {
    setSearchQuery("")
    onFiltersChange({ page: 1, page_size: 20 })
  }

  const hasActiveFilters = !!filters.type || !!filters.search || !!filters.tags

  return (
    <div className={cn("flex items-center gap-4 mb-6", className)}>
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search documents..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Type
            {filters.type && (
              <Badge variant="secondary" className="ml-2">
                1
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Document Type</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {DOCUMENT_TYPES.map((type) => (
            <DropdownMenuItem
              key={type.value}
              onClick={() => handleTypeChange(type.value)}
              className={cn(
                "cursor-pointer",
                filters.type === type.value && "bg-accent"
              )}
            >
              {type.label}
              {filters.type === type.value && " ✓"}
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
