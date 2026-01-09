"use client"

import { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface PageHeaderProps {
  title: string
  subtitle?: string
  action?: ReactNode | {
    label: string
    onClick: () => void
    icon?: ReactNode
  }
  className?: string
}

export function PageHeader({ title, subtitle, action, className }: PageHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between mb-6", className)}>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {subtitle && (
          <p className="text-muted-foreground mt-1.5">{subtitle}</p>
        )}
      </div>
      {action && (
        <>
          {typeof action === "object" && "onClick" in action ? (
            <Button onClick={action.onClick} size="lg">
              {action.icon && <span className="mr-2">{action.icon}</span>}
              {action.label}
            </Button>
          ) : (
            action
          )}
        </>
      )}
    </div>
  )
}
