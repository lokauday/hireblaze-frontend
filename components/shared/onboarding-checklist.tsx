"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import confetti from "canvas-confetti"
import { CheckCircle2, Circle, Upload, Briefcase, BarChart3, FileText, Save, X } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useRouter } from "next/navigation"

interface ChecklistItem {
  id: string
  label: string
  icon: React.ReactNode
  route?: string
}

const checklistItems: ChecklistItem[] = [
  {
    id: "upload_resume",
    label: "Upload resume",
    icon: <Upload className="h-5 w-5" />,
    route: "/drive",
  },
  {
    id: "add_job",
    label: "Add job / import url",
    icon: <Briefcase className="h-5 w-5" />,
    route: "/jobs",
  },
  {
    id: "run_match",
    label: "Run match score",
    icon: <BarChart3 className="h-5 w-5" />,
    route: "/match",
  },
  {
    id: "generate_tailored",
    label: "Generate tailored resume",
    icon: <FileText className="h-5 w-5" />,
    route: "/ai-tools",
  },
  {
    id: "save_to_drive",
    label: "Save to drive",
    icon: <Save className="h-5 w-5" />,
    route: "/drive",
  },
]

const ONBOARDING_STORAGE_KEY = "hireblaze_onboarding_completed"

export function OnboardingChecklist() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set())
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false)

  useEffect(() => {
    // Check if user has already seen onboarding
    const seen = localStorage.getItem(ONBOARDING_STORAGE_KEY)
    if (seen) {
      setHasSeenOnboarding(true)
      return
    }

    // Check for completed items in localStorage
    const savedItems = localStorage.getItem("hireblaze_onboarding_items")
    if (savedItems) {
      try {
        const items = JSON.parse(savedItems) as string[]
        setCompletedItems(new Set(items))
      } catch (e) {
        // Invalid JSON, ignore
      }
    }

    // Show onboarding if user is new (hasn't completed it before)
    setIsOpen(true)
  }, [])

  const progress = (completedItems.size / checklistItems.length) * 100
  const allCompleted = completedItems.size === checklistItems.length

  const toggleItem = (itemId: string) => {
    const newCompleted = new Set(completedItems)
    if (newCompleted.has(itemId)) {
      newCompleted.delete(itemId)
    } else {
      newCompleted.add(itemId)
    }
    setCompletedItems(newCompleted)
    localStorage.setItem("hireblaze_onboarding_items", JSON.stringify(Array.from(newCompleted)))
  }

  const handleItemClick = (item: ChecklistItem) => {
    if (item.route) {
      router.push(item.route)
    }
  }

  const handleComplete = () => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, "true")
    setHasSeenOnboarding(true)
    setIsOpen(false)

    // Trigger confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    })

    // Trigger multiple bursts
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
      })
    }, 250)

    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
      })
    }, 400)
  }

  const handleSkip = () => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, "skipped")
    setHasSeenOnboarding(true)
    setIsOpen(false)
  }

  if (hasSeenOnboarding || !isOpen) {
    return null
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={handleSkip}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md mx-4"
          >
            <Card className="shadow-2xl border-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">Welcome to Hireblaze! 🎉</CardTitle>
                    <CardDescription className="mt-2">
                      Complete these steps to get the most out of your job search
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleSkip}
                    className="h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">
                      {completedItems.size} / {checklistItems.length}
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {checklistItems.map((item, index) => {
                  const isCompleted = completedItems.has(item.id)
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => handleItemClick(item)}
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleItem(item.id)
                        }}
                        className="flex-shrink-0"
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="h-6 w-6 text-primary" />
                        ) : (
                          <Circle className="h-6 w-6 text-muted-foreground" />
                        )}
                      </button>
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-muted-foreground">{item.icon}</span>
                        <span className={isCompleted ? "line-through text-muted-foreground" : ""}>
                          {item.label}
                        </span>
                      </div>
                    </motion.div>
                  )
                })}
                <div className="flex gap-2 pt-4 mt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={handleSkip}
                    className="flex-1"
                  >
                    Skip for now
                  </Button>
                  <Button
                    onClick={handleComplete}
                    disabled={!allCompleted}
                    className="flex-1"
                  >
                    {allCompleted ? "Complete! 🎉" : `Complete ${checklistItems.length - completedItems.size} more`}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}