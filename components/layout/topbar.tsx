"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, User, LogOut, Bell, Settings, Sparkles, CheckCircle2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { auth, User as UserType } from "@/lib/auth"
import { CommandMenu } from "./command-menu"
import { cn } from "@/lib/utils"
import { aiAPI } from "@/lib/api/ai"
import { APIError } from "@/lib/api-client"

export function Topbar() {
  const router = useRouter()
  const [user, setUser] = useState<UserType | null>(null)
  const [commandMenuOpen, setCommandMenuOpen] = useState(false)
  const [aiStatus, setAiStatus] = useState<"checking" | "configured" | "not_configured">("checking")

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = auth.getUser()
      setUser(currentUser)
      
      // Refresh user info to get latest plan and usage
      try {
        const refreshed = await auth.refreshMe()
        if (refreshed) {
          setUser(refreshed)
        }
      } catch (err) {
        // Silently fail - use cached user
      }
    }
    
    loadUser()
    
    // Check AI configuration status (client-side only)
    if (typeof window !== "undefined") {
      checkAIStatus()
    }
  }, [])

  const checkAIStatus = async () => {
    if (typeof window === "undefined") return
    
    try {
      await aiAPI.transformText({
        mode: "rewrite",
        text: "test",
        context: {}
      })
      setAiStatus("configured")
    } catch (error: any) {
      if (error instanceof APIError && error.status === 500 && error.message?.includes("AI not configured")) {
        setAiStatus("not_configured")
      } else {
        setAiStatus("configured") // Assume configured for other errors
      }
    }
  }

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setCommandMenuOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  return (
    <>
      <div className="flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 sticky top-0 z-30">
        {/* Global Search / Command Menu Trigger */}
        <div className="flex-1">
          <Button
            variant="outline"
            className={cn(
              "relative h-9 w-full justify-start rounded-md bg-muted/50 text-sm text-muted-foreground sm:pr-12 md:w-64 lg:w-80"
            )}
            onClick={() => setCommandMenuOpen(true)}
          >
            <Search className="mr-2 h-4 w-4" />
            <span>Search or run command...</span>
            <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>
        </div>

        {/* Plan Badge + Usage Meter */}
        {user && (
          <div className="flex items-center gap-2">
            <Badge
              variant={user.plan === "premium" ? "default" : "outline"}
              className="text-xs"
            >
              {user.plan === "premium" ? "Premium" : "Free"}
            </Badge>
            {user.plan !== "premium" && user.usage && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>AI: {user.usage.used}/{user.usage.limit}</span>
              </div>
            )}
            {user.plan !== "premium" && (
              <Button
                variant="default"
                size="sm"
                className="h-7 text-xs"
                onClick={() => router.push("/pricing")}
              >
                Upgrade
              </Button>
            )}
          </div>
        )}

        {/* AI Status Indicator (only in development) */}
        {process.env.NODE_ENV === "development" && (
          <div className="flex items-center gap-2">
            {aiStatus === "checking" && (
              <Badge variant="outline" className="text-xs">
                <Sparkles className="mr-1 h-3 w-3 animate-pulse" />
                Checking AI...
              </Badge>
            )}
            {aiStatus === "configured" && (
              <Badge variant="default" className="text-xs bg-green-600">
                <CheckCircle2 className="mr-1 h-3 w-3" />
                AI Connected
              </Badge>
            )}
            {aiStatus === "not_configured" && (
              <Badge variant="outline" className="text-xs border-orange-500 text-orange-600">
                <XCircle className="mr-1 h-3 w-3" />
                AI Not Configured
              </Badge>
            )}
          </div>
        )}

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive" />
          <span className="sr-only">Notifications</span>
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <User className="h-4 w-4" />
              <span className="sr-only">User menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user?.full_name || "User"}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/settings")}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => auth.logout()}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <CommandMenu open={commandMenuOpen} onOpenChange={setCommandMenuOpen} />
    </>
  )
}
