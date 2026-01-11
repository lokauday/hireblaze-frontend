"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Check, Sparkles, Zap, TrendingUp, Loader2, Crown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { apiRequest, APIError, billingAPI } from "@/lib/api-client"
import { useRouter } from "next/navigation"

interface UpgradeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  feature?: string
  requiredPlan?: "pro" | "elite"
}

const benefits = {
  pro: [
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
  ],
  elite: [
    {
      icon: Crown,
      title: "Everything in Pro, plus:",
      description: "Interview simulation, weekly reviews, smart re-apply",
    },
    {
      icon: Zap,
      title: "Advanced AI features",
      description: "Priority processing and early access to new features",
    },
    {
      icon: TrendingUp,
      title: "Dedicated support",
      description: "Get help when you need it most",
    },
  ],
}

export function UpgradeModal({ open, onOpenChange, feature, requiredPlan = "pro" }: UpgradeModalProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleUpgrade = async () => {
    setLoading(true)
    
    try {
      const response = await billingAPI.createCheckout({
        plan: requiredPlan,
        success_url: `${window.location.origin}/dashboard?upgraded=true`,
        cancel_url: window.location.href,
      })
      
      if (response.checkout_url) {
        window.location.href = response.checkout_url
      } else {
        throw new Error("No checkout URL returned")
      }
    } catch (err: any) {
      setLoading(false)
      if (err instanceof APIError) {
        toast({
          title: "Failed to start checkout",
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

  const planBenefits = benefits[requiredPlan]
  const planName = requiredPlan === "elite" ? "Elite" : "Pro"
  const planPrice = requiredPlan === "elite" ? "$49/month" : "$19/month"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Unlock {planName}</DialogTitle>
          <DialogDescription>
            {feature
              ? `This feature requires ${planName} plan.`
              : `Get interview-ready outputs in minutes — not days.`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-3">
            {planBenefits.map((benefit, idx) => {
              const Icon = benefit.icon
              return (
                <div key={idx} className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-full bg-primary/10 p-1.5">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{benefit.title}</p>
                    <p className="text-xs text-muted-foreground">{benefit.description}</p>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="rounded-lg bg-muted p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{planName} Plan</p>
                <p className="text-sm text-muted-foreground">{planPrice}</p>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium">Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Maybe Later
          </Button>
          <Button onClick={handleUpgrade} disabled={loading} className="w-full sm:w-auto">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Upgrade to {planName}
                <Sparkles className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </DialogFooter>

        <p className="text-xs text-center text-muted-foreground mt-2">
          Secure checkout via Stripe • Cancel anytime • No hidden fees
        </p>
      </DialogContent>
    </Dialog>
  )
}
