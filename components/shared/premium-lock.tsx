"use client"

import { Lock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { UpgradeModal } from "@/components/upgrade-modal"
import { useState } from "react"

interface PremiumLockProps {
  locked: boolean
  reason?: string
  children?: React.ReactNode
  className?: string
  onClickUpgrade?: () => void
  showBadge?: boolean
}

export function PremiumLock({
  locked,
  reason = "Premium feature",
  children,
  className,
  onClickUpgrade,
  showBadge = true,
}: PremiumLockProps) {
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false)

  const handleClick = () => {
    if (locked) {
      setUpgradeModalOpen(true)
      onClickUpgrade?.()
    }
  }

  if (!locked) {
    return <>{children}</>
  }

  return (
    <>
      <div
        className={cn("relative inline-block", className)}
        onClick={handleClick}
      >
        {children && (
          <div className="opacity-50 pointer-events-none">{children}</div>
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-md">
          <div className="flex flex-col items-center gap-2">
            <Lock className="h-5 w-5 text-muted-foreground" />
            {showBadge && (
              <Badge variant="secondary" className="text-xs">
                Premium
              </Badge>
            )}
          </div>
        </div>
      </div>
      <UpgradeModal open={upgradeModalOpen} onOpenChange={setUpgradeModalOpen} />
    </>
  )
}

interface RequirePremiumProps {
  feature?: string
  children: (allowed: boolean) => React.ReactNode
  fallback?: React.ReactNode
}

export function RequirePremium({
  feature,
  children,
  fallback,
}: RequirePremiumProps) {
  const { auth } = require("@/lib/auth")
  const user = auth.getUser()
  const isPremium = user?.plan === "premium"
  
  if (!isPremium) {
    if (fallback) {
      return <>{fallback}</>
    }
    return (
      <PremiumLock locked={true} reason={`${feature || "This"} requires Premium`}>
        <div>{children(false)}</div>
      </PremiumLock>
    )
  }
  
  return <>{children(true)}</>
}
