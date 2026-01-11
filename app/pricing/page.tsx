"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Check, ArrowRight, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { apiRequest, APIError } from "@/lib/api-client"
import { auth } from "@/lib/auth"

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    features: [
      "3 AI actions/day",
      "Basic rewrite + grammar",
      "1 document",
      "Manual job entry",
    ],
    cta: "Continue Free",
    disabled: false,
  },
  {
    name: "Premium",
    price: "$19",
    period: "month",
    features: [
      "Unlimited AI actions",
      "Match score + recruiter lens",
      "Interview pack generator",
      "Outreach generator",
      "Unlimited docs + exports",
      "Priority processing",
    ],
    highlight: true,
    cta: "Upgrade to Premium",
    disabled: false,
  },
]

const faqs = [
  {
    question: "Can I cancel anytime?",
    answer: "Yes, you can cancel your subscription at any time. You'll retain access until the end of your billing period. No questions asked.",
  },
  {
    question: "Does Premium guarantee interviews?",
    answer: "While Premium provides powerful tools to optimize your applications, we cannot guarantee interview offers. However, Premium features significantly improve your application quality and ATS compatibility.",
  },
  {
    question: "Do you store my resume?",
    answer: "Yes, we store your documents securely in your account. Your data is encrypted and we never share your information with third parties. You can delete your data at any time.",
  },
  {
    question: "Is my payment secure?",
    answer: "Yes, all payments are processed securely through Stripe, a PCI-compliant payment processor. We never store your credit card information.",
  },
  {
    question: "Can I switch plans?",
    answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately and are prorated.",
  },
  {
    question: "Do you share data with third parties?",
    answer: "No, we never share your personal data or documents with third parties. Your information is kept private and secure.",
  },
]

export default function PricingPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState<string | null>(null)
  const [currentPlan, setCurrentPlan] = useState<string>("free")

  useEffect(() => {
    const user = auth.getUser()
    if (user?.plan) {
      setCurrentPlan(user.plan.toLowerCase())
    }
  }, [])

  const handleUpgrade = async () => {
    if (currentPlan === "premium") {
      toast({
        title: "Already Premium",
        description: "You're already on the Premium plan.",
      })
      return
    }

    setLoading("premium")
    
    try {
      // Use simpler /billing/checkout endpoint
      const response = await apiRequest<{ url: string }>("/billing/checkout", {
        method: "POST",
      })
      
      // Redirect to Stripe checkout
      if (response.url) {
        window.location.href = response.url
      } else {
        throw new Error("No checkout URL returned")
      }
    } catch (err) {
      setLoading(null)
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

  const handleContinueFree = () => {
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Get from application to interview — faster.
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Hireblaze turns your resume + JD into a tailored package recruiters respond to.
          </p>
        </motion.div>

        {/* Plans */}
        <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto mb-16">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className={`h-full flex flex-col relative ${
                  plan.highlight
                    ? "border-primary shadow-lg ring-2 ring-primary"
                    : ""
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                      RECOMMENDED
                    </span>
                  </div>
                )}
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    {plan.period !== "forever" && (
                      <span className="text-muted-foreground">/{plan.period}</span>
                    )}
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
                    onClick={plan.name === "Premium" ? handleUpgrade : handleContinueFree}
                    disabled={loading !== null || (plan.name === "Free" && currentPlan === "free")}
                  >
                    {loading === "premium" && plan.name === "Premium" ? (
                      "Processing..."
                    ) : (
                      <>
                        {plan.cta}
                        {plan.name === "Premium" && <ArrowRight className="ml-2 h-4 w-4" />}
                      </>
                    )}
                  </Button>
                  {plan.name === "Premium" && (
                    <p className="text-xs text-muted-foreground text-center mt-2">
                      Secure checkout • Cancel anytime • No hidden fees
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-3xl mx-auto"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center mb-2">Frequently Asked Questions</CardTitle>
              <CardDescription className="text-center">
                Everything you need to know about our plans
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left font-medium">
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

        {/* Trust Row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-12 text-sm text-muted-foreground"
        >
          <p>Secure payments via Stripe • Cancel anytime</p>
        </motion.div>
      </div>
    </div>
  )
}
