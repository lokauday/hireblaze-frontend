"use client"

import { useState } from "react"
import { FileText, ChevronRight, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface OutlineSection {
  id: string
  title: string
  level: number
  children?: OutlineSection[]
}

interface DocumentOutlineProps {
  sections: OutlineSection[]
  onSectionClick?: (sectionId: string) => void
  activeSectionId?: string
  className?: string
}

export function DocumentOutline({
  sections,
  onSectionClick,
  activeSectionId,
  className,
}: DocumentOutlineProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())

  const toggleSection = (id: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedSections(newExpanded)
  }

  const renderSection = (section: OutlineSection) => {
    const hasChildren = section.children && section.children.length > 0
    const isExpanded = expandedSections.has(section.id)
    const isActive = activeSectionId === section.id

    return (
      <div key={section.id} className="select-none">
        <div
          style={{ paddingLeft: `${(section.level - 1) * 16 + 8}px` }}
          className={cn(
            "flex items-center gap-1 px-2 py-1.5 rounded-md cursor-pointer hover:bg-accent transition-colors",
            isActive && "bg-accent font-medium"
          )}
          onClick={() => {
            if (hasChildren) {
              toggleSection(section.id)
            }
            onSectionClick?.(section.id)
          }}
        >
          {hasChildren ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 -ml-1 mr-0"
              onClick={(e) => {
                e.stopPropagation()
                toggleSection(section.id)
              }}
            >
              {isExpanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </Button>
          ) : (
            <div className="w-5" />
          )}
          <FileText className="h-3 w-3 text-muted-foreground mr-1.5" />
          <span className="text-sm truncate flex-1">{section.title}</span>
        </div>
        {hasChildren && isExpanded && (
          <div className="ml-4">
            {section.children!.map((child) => renderSection(child))}
          </div>
        )}
      </div>
    )
  }

  if (sections.length === 0) {
    return (
      <div className={cn("p-4 text-center text-sm text-muted-foreground", className)}>
        No sections found
      </div>
    )
  }

  return (
    <div className={cn("space-y-1", className)}>
      <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        Outline
      </div>
      {sections.map((section) => renderSection(section))}
    </div>
  )
}
