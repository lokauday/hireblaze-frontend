"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Check, ArrowRight, Lock, Sparkles, Zap, TrendingUp, Crown, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { apiRequest, APIError, billingAPI } from "@/lib/api-client"
import { auth } from "@/lib/auth"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

const plans = [
  {
    name: "Free",
    id: "free",
    price: { monthly: 0, yearly: 0 },
    period: "forever",
    description: "Get started with basic features",
    features: [
      "3 AI actions/day",
      "Basic rewrite + grammar",
      "1 document",
      "Manual job entry",
      "Basic job tracking",
    ],
    cta: "Continue Free",
    disabled: false,
    popular: false,
  },
  {
    name: "Pro",
    id: "pro",
    price: { monthly: 19, yearly: 190 },
    period: "month",
    description: "For serious job seekers",
    features: [
      "Unlimited AI actions",
      "Advanced AI tools (Interview Pack, Outreach Generator)",
      "Match score + recruiter lens",
      "Company research pack",
      "Resume versioning",
      "ATS heatmap",
      "Job pack export",
      "Unlimited docs + exports",
      "Priority processing",
    ],
    highlight: true,
    cta: "Upgrade to Pro",
    disabled: false,
    popular: true,
    icon: Zap,
  },
  {
    name: "Elite",
    id: "elite",
    price: { monthly: 49, yearly: 490 },
    period: "month",
    description: "Complete career transformation",
    features: [
      "Everything in Pro",
      "Interview simulation mode",
      "Weekly AI job review",
      "Smart re-apply engine",
      "Dedicated support",
      "Early access to new features",
    ],
    cta: "Upgrade to Elite",
    disabled: false,
    popular: false,
    icon: Crown,
  },
]

const faqs = [
  {
    question: "Can I cancel anytime?",
    answer: "Yes, you can cancel your subscription at any time. You'll retain access until the end of your billing period. No questions asked, no hassle.",
  },
  {
    question: "Does Pro/Elite guarantee interviews?",
    answer: "While we can't guarantee interviews, Pro and Elite plans give you the best tools to improve your application materials, match scores, and interview preparation. Your success depends on many factors, but we give you the best chance.",
  },
  {
    question: "Do you store my resume?",
    answer: "Yes, we store your resume and documents securely in your account. You can delete them at any time. We never share your data with third parties. See our Privacy Policy for details.",
  },
  {
    question: "Is my payment secure?",
    answer: "Yes, all payments are processed securely through Stripe, a PCI-DSS compliant payment processor. We never store your credit card information.",
  },
  {
    question: "Can I switch plans?",
    answer: "Yes, you can upgrade or downgrade your plan at any time. When upgrading, you'll get immediate access. When downgrading, changes take effect at the end of your billing period.",
  },
  {
    question: "Do you share my data?",
    answer: "No, we never share your personal data or resume content with third parties. Your data is encrypted and stored securely. See our Privacy Policy for complete details.",
  },
]

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Software Engineer",
    content: "Pro plan helped me land 3 interviews in 2 weeks. The interview pack generator is a game-changer.",
    rating: 5,
  },
  {
    name: "Marcus Johnson",
    role: "Product Manager",
    content: "Worth every penny. The ATS heatmap showed me exactly what was missing from my resume.",
    rating: 5,
  },
  {
    name: "Priya Patel",
    role: "Data Scientist",
    content: "Elite plan's interview simulation prepared me so well, I aced every technical round.",
    rating: 5,
  },
]

export default function PricingPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")
  const [loading, setLoading] = useState<string | null>(null)
  const [currentPlan, setCurrentPlan] = useState<string>("free")

  useEffect(() => {
    const user = auth.getUser()
    if (user?.plan) {
      setCurrentPlan(user.plan)
    }
  }, [])

  const handleUpgrade = async (planId: string) => {
    if (planId === "free") {
      router.push("/dashboard")
      return
    }

    setLoading(planId)
    try {
      const response = await billingAPI.createCheckout({
        plan: planId,
        success_url: `${window.location.origin}/dashboard?upgraded=true`,
        cancel_url: `${window.location.origin}/pricing`,
      })

      if (response.checkout_url) {
        window.location.href = response.checkout_url
      } else {
        throw new Error("No checkout URL returned")
      }
    } catch (err: any) {
      setLoading(null)
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

  const getPrice = (plan: typeof plans[0]) => {
    const price = billingCycle === "yearly" ? plan.price.yearly : plan.price.monthly
    if (price === 0) return "Free"
    return `$${price}`
  }

  const getPeriod = (plan: typeof plans[0]) => {
    if (plan.price.monthly === 0) return ""
    return billingCycle === "yearly" ? "/year" : "/month"
  }

  const isCurrentPlan = (planId: string) => {
    return currentPlan === planId || (currentPlan === "premium" && planId === "pro")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Choose Your Plan
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            From application to interview—faster. Choose the plan that fits your job search.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <Label htmlFor="billing-toggle" className={billingCycle === "monthly" ? "font-semibold" : ""}>
              Monthly
            </Label>
            <Switch
              id="billing-toggle"
              checked={billingCycle === "yearly"}
              onCheckedChange={(checked) => setBillingCycle(checked ? "yearly" : "monthly")}
            />
            <Label htmlFor="billing-toggle" className={billingCycle === "yearly" ? "font-semibold" : ""}>
              Yearly
            </Label>
            {billingCycle === "yearly" && (
              <Badge variant="secondary" className="ml-2">
                Save 17%
              </Badge>
            )}
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-16">
          {plans.map((plan, index) => {
            const Icon = plan.icon
            const isCurrent = isCurrentPlan(plan.id)
            const isPopular = plan.popular

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card
                  className={`relative h-full flex flex-col ${
                    isPopular ? "border-primary shadow-lg scale-105" : ""
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                    </div>
                  )}

                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-2 mb-2">
                      {Icon && <Icon className="h-5 w-5 text-primary" />}
                      <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    </div>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="mt-4">
                      <span className="text-4xl font-bold">{getPrice(plan)}</span>
                      <span className="text-muted-foreground ml-2">{getPeriod(plan)}</span>
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1 flex flex-col">
                    <ul className="space-y-3 mb-6 flex-1">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      className="w-full"
                      variant={isPopular ? "default" : "outline"}
                      size="lg"
                      disabled={loading === plan.id || isCurrent}
                      onClick={() => handleUpgrade(plan.id)}
                    >
                      {loading === plan.id ? (
                        "Processing..."
                      ) : isCurrent ? (
                        "Current Plan"
                      ) : (
                        <>
                          {plan.cta}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* Testimonials */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="max-w-4xl mx-auto mb-16"
        >
          <h2 className="text-2xl font-bold text-center mb-8">Trusted by job seekers</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, idx) => (
              <Card key={idx}>
                <CardContent className="pt-6">
                  <div className="flex gap-1 mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">"{testimonial.content}"</p>
                  <div>
                    <p className="font-semibold text-sm">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, idx) => (
              <AccordionItem key={idx} value={`item-${idx}`}>
                <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        {/* Trust Row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center mt-12 text-sm text-muted-foreground"
        >
          <p>Secure payments via Stripe • Cancel anytime • No hidden fees</p>
        </motion.div>
      </div>
    </div>
  )
}
