"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Check, Sparkles, Zap, TrendingUp, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { apiRequest, APIError } from "@/lib/api-client"

interface UpgradeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const benefits = [
  {
    icon: TrendingUp,
    title: "Match Score + missing skills for every JD",
    description: "Know exactly how you stack up against job requirements",
  },
  {
    icon: Zap,
    title: "Interview Pack with STAR answers + 30/60/90 plan",
    description: "Be interview-ready with structured preparation materials",
  },
  {
    icon: Sparkles,
    title: "Unlimited AI edits + exports",
    description: "Transform your documents as many times as you need",
  },
]

export function UpgradeModal({ open, onOpenChange }: UpgradeModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const handleUpgrade = async () => {
    setLoading(true)
    
    try {
      const response = await apiRequest<{ url: string }>("/billing/checkout", {
        method: "POST",
      })
      
      if (response.url) {
        window.location.href = response.url
      } else {
        throw new Error("No checkout URL returned")
      }
    } catch (err) {
      setLoading(false)
      if (err instanceof APIError) {
        toast({
          title: "Failed to create checkout",
          description: err.message || "Please try again later.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to create checkout session. Please try again later.",
          variant: "destructive",
        })
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Unlock Premium</DialogTitle>
          <DialogDescription className="text-base">
            Get interview-ready outputs in minutes — not days.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 space-y-4">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex gap-4">
              <div className="rounded-md bg-primary/10 p-2 h-fit mt-0.5">
                <benefit.icon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold mb-1">{benefit.title}</h4>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t pt-4">
          <div className="flex items-baseline justify-center gap-2 mb-4">
            <span className="text-4xl font-bold">$19</span>
            <span className="text-muted-foreground">/month</span>
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button
            onClick={handleUpgrade}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Upgrade with Stripe
                <Sparkles className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Secure checkout • Cancel anytime • No hidden fees
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
