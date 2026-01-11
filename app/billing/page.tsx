"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Check, ArrowUpRight, CreditCard, AlertCircle, Info } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { billingAPI, APIError } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    features: [
      "2 ATS scans/month",
      "3 Resume tailoring/month",
      "3 Cover letters/month",
      "5 JD parsing/month",
      "Basic support",
    ],
    highlight: false,
    cta: "Current Plan",
    disabled: true,
  },
  {
    name: "Pro",
    price: "$29",
    period: "month",
    features: [
      "20 ATS scans/month",
      "25 Resume tailoring/month",
      "30 Cover letters/month",
      "60 JD parsing/month",
      "Priority support",
      "Advanced analytics",
    ],
    highlight: true,
    cta: "Upgrade to Pro",
    disabled: false,
  },
  {
    name: "Elite",
    price: "$99",
    period: "month",
    features: [
      "Unlimited ATS scans",
      "Unlimited Resume tailoring",
      "Unlimited Cover letters",
      "Unlimited JD parsing",
      "24/7 priority support",
      "Custom integrations",
      "Dedicated account manager",
    ],
    highlight: false,
    cta: "Upgrade to Elite",
    disabled: false,
  },
]

const faqs = [
  {
    question: "Can I change plans later?",
    answer: "Yes, you can upgrade or downgrade your plan at any time. Changes will be prorated.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, debit cards, and PayPal through Stripe.",
  },
  {
    question: "Can I cancel anytime?",
    answer: "Yes, you can cancel your subscription at any time. You'll retain access until the end of your billing period.",
  },
  {
    question: "Do unused credits roll over?",
    answer: "No, usage credits reset monthly and don't roll over. Elite plan users have unlimited usage.",
  },
  {
    question: "What happens if I exceed my quota?",
    answer: "You'll receive a notification when approaching your limit. Upgrade your plan for more quota or wait until the next billing cycle.",
  },
]

export default function BillingPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState<string | null>(null)
  const [stripeConfigured, setStripeConfigured] = useState<boolean | null>(null)

  const handleUpgrade = async (plan: string) => {
    if (plan === "Free") return

    setLoading(plan)
    
    try {
      // Use simpler endpoint for premium, legacy endpoint for pro/elite
      if (plan.toLowerCase() === "premium") {
        const response = await billingAPI.checkout()
        if (response.url) {
          window.location.href = response.url
        } else {
          throw new Error("No checkout URL returned")
        }
      } else {
        const response = await billingAPI.createCheckoutSession({
          plan: plan.toLowerCase(),
          success_url: `${window.location.origin}/dashboard?success=true`,
          cancel_url: `${window.location.origin}/billing?canceled=true`,
        })
        window.location.href = response.checkout_url
      }
    } catch (err) {
      setLoading(null)
      if (err instanceof APIError) {
        const detail = err.detail?.detail || err.detail?.error || err.message
        if (err.status === 500 || err.status === 501) {
          // Billing not configured
          setStripeConfigured(false)
          toast({
            title: "Billing not configured",
            description: "Stripe billing is not configured yet. Please contact support.",
            variant: "destructive",
          })
        } else {
          toast({
            title: "Failed to create checkout session",
            description: typeof detail === "string" ? detail : "Please try again later.",
            variant: "destructive",
          })
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to create checkout session. Please try again later.",
          variant: "destructive",
        })
      }
    }
  }

  const handleManageBilling = async () => {
    setLoading("manage")
    
    try {
      // Use simpler portal endpoint
      const response = await billingAPI.portal()
      
      // Redirect to Stripe portal
      if (response.url) {
        window.location.href = response.url
      } else {
        throw new Error("No portal URL returned")
      }
    } catch (err) {
      setLoading(null)
      if (err instanceof APIError) {
        const detail = err.detail?.detail || err.detail?.error || err.message
        if (err.status === 400 && typeof detail === "string" && detail.includes("subscription")) {
          toast({
            title: "No active subscription",
            description: "You need an active subscription to manage billing.",
            variant: "destructive",
          })
        } else {
          toast({
            title: "Failed to create portal session",
            description: typeof detail === "string" ? detail : "Make sure you have an active subscription.",
            variant: "destructive",
          })
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to create portal session. Please try again later.",
          variant: "destructive",
        })
      }
    }
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold tracking-tight">Billing & Plans</h1>
        <p className="text-muted-foreground mt-1">
          Choose the plan that works best for you. Upgrade or downgrade at any time.
        </p>
      </motion.div>

      {stripeConfigured === false && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Billing is not configured yet. Stripe integration is required to upgrade plans.
            Please contact support for assistance.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card
              className={`relative h-full flex flex-col ${
                plan.highlight
                  ? "border-primary shadow-lg ring-2 ring-primary"
                  : ""
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                    MOST POPULAR
                  </span>
                </div>
              )}
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">/{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <ul className="space-y-3 mb-6 flex-1">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={plan.highlight ? "default" : "outline"}
                  onClick={() => handleUpgrade(plan.name)}
                  disabled={plan.disabled || loading !== null}
                >
                  {loading === plan.name ? (
                    "Processing..."
                  ) : (
                    <>
                      {plan.cta}
                      {plan.name !== "Free" && (
                        <ArrowUpRight className="ml-2 h-4 w-4" />
                      )}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Manage Billing</CardTitle>
                <CardDescription>
                  Update your payment method, view invoices, or cancel your subscription
                </CardDescription>
              </div>
              <CreditCard className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              onClick={handleManageBilling}
              disabled={loading !== null}
              className="w-full md:w-auto"
            >
              {loading === "manage" ? (
                "Opening portal..."
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Manage Billing
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
            <CardDescription>
              Everything you need to know about our plans and billing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
