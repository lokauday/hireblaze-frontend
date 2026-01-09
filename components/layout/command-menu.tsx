"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Command } from "cmdk"
import { Search, FileText, Settings, CreditCard, Zap, LayoutDashboard, FolderOpen, History, Briefcase, Sparkles } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import * as DialogPrimitive from "@radix-ui/react-dialog"

const CommandMenu = React.forwardRef<
  React.ElementRef<typeof Command>,
  React.ComponentPropsWithoutRef<typeof Command> & {
    open?: boolean
    onOpenChange?: (open: boolean) => void
  }
>(({ className, open, onOpenChange, ...props }, ref) => {
  const router = useRouter()
  const [value, setValue] = React.useState("")

  const commands = [
    {
      icon: LayoutDashboard,
      label: "Go to Dashboard",
      keywords: ["dashboard", "home", "main"],
      action: () => router.push("/dashboard"),
    },
    {
      icon: FolderOpen,
      label: "Open AI Drive",
      keywords: ["drive", "documents", "files"],
      action: () => router.push("/drive"),
    },
    {
      icon: Zap,
      label: "AI Tools",
      keywords: ["tools", "ai", "generate"],
      action: () => router.push("/ai-tools"),
    },
    {
      icon: Briefcase,
      label: "Job Tracker",
      keywords: ["jobs", "applications", "tracker"],
      action: () => router.push("/jobs"),
    },
    {
      icon: History,
      label: "View History",
      keywords: ["history", "activity", "timeline"],
      action: () => router.push("/history"),
    },
    {
      icon: FileText,
      label: "New Document",
      keywords: ["new", "create", "document", "resume"],
      action: () => router.push("/editor/new"),
    },
    {
      icon: CreditCard,
      label: "Billing & Plans",
      keywords: ["billing", "plan", "upgrade", "subscription"],
      action: () => router.push("/billing"),
    },
    {
      icon: Settings,
      label: "Settings",
      keywords: ["settings", "preferences", "config"],
      action: () => router.push("/settings"),
    },
  ]

  const filteredCommands = React.useMemo(() => {
    if (!value) return commands

    const searchLower = value.toLowerCase()
    return commands.filter((cmd) => {
      const labelMatch = cmd.label.toLowerCase().includes(searchLower)
      const keywordMatch = cmd.keywords.some((keyword) =>
        keyword.toLowerCase().includes(searchLower)
      )
      return labelMatch || keywordMatch
    })
  }, [value])

  const handleSelect = (action: () => void) => {
    action()
    onOpenChange?.(false)
    setValue("")
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 rounded-lg overflow-hidden p-0">
          <Command
            ref={ref}
            className={cn(
              "rounded-lg",
              className
            )}
            {...props}
          >
            <div className="flex items-center border-b px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <Command.Input
                placeholder="Type a command or search..."
                value={value}
                onValueChange={setValue}
                className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <Command.List className="max-h-[300px] overflow-y-auto p-2">
              <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
                No results found.
              </Command.Empty>
              <Command.Group>
                {filteredCommands.map((command) => (
                  <Command.Item
                    key={command.label}
                    value={`${command.label} ${command.keywords.join(" ")}`}
                    onSelect={() => handleSelect(command.action)}
                    className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm cursor-pointer aria-selected:bg-accent aria-selected:text-accent-foreground"
                  >
                    <command.icon className="h-4 w-4" />
                    <span>{command.label}</span>
                  </Command.Item>
                ))}
              </Command.Group>
            </Command.List>
            <div className="flex items-center justify-between border-t px-3 py-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
                  <span className="text-xs">↑</span>
                  <span className="text-xs">↓</span> Navigate
                </kbd>
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
                  <span className="text-xs">↵</span> Select
                </kbd>
              </div>
              <div className="flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                <span>Hireblaze</span>
              </div>
            </div>
          </Command>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
})

CommandMenu.displayName = "CommandMenu"

export { CommandMenu }
