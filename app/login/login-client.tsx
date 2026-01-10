"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { motion } from "framer-motion"
import { Sparkles, Mail, Lock, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert } from "@/components/ui/alert"
import { auth } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  useEffect(() => {
    if (searchParams.get("signup") === "success") {
      toast({
        title: "Account created successfully!",
        description: "Please sign in with your credentials.",
      })
    }
  }, [searchParams, toast])

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true)

    try {
      const response = await auth.login(data.email, data.password)
      if (response.access_token) {
        toast({
          title: "Welcome back!",
          description: "Successfully signed in.",
        })
        router.push("/dashboard")
      }
    } catch (err: any) {
      const errorMsg =
        err.detail?.detail || err.detail || err.message || "Invalid email or password"
      toast({
        title: "Sign in failed",
        description: typeof errorMsg === "string" ? errorMsg : "Invalid email or password",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = async () => {
    const demoEmail = process.env.NEXT_PUBLIC_DEMO_EMAIL
    const demoPassword = process.env.NEXT_PUBLIC_DEMO_PASSWORD

    if (!demoEmail || !demoPassword) {
      toast({
        title: "Demo account not configured",
        description: "Demo credentials are not available. Please sign up for an account.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const response = await auth.login(demoEmail, demoPassword)
      if (response.access_token) {
        toast({
          title: "Welcome!",
          description: "Successfully signed in with demo account.",
        })
        router.push("/dashboard")
      }
    } catch (err: any) {
      const errorMsg =
        err.detail?.detail || err.detail || err.message || "Demo login failed"
      toast({
        title: "Demo login failed",
        description: typeof errorMsg === "string" ? errorMsg : "Demo login failed",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const showDemoButton = process.env.NEXT_PUBLIC_DEMO_EMAIL && process.env.NEXT_PUBLIC_DEMO_PASSWORD

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-xl border-2">
          <CardHeader className="space-y-1 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="h-8 w-8 text-primary" />
              <span className="text-3xl font-bold">Hireblaze</span>
            </div>
            <CardTitle className="text-2xl">Welcome back</CardTitle>
            <CardDescription>
              Enter your email and password to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    className="pl-9"
                    {...register("email")}
                    disabled={loading}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.email.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-9"
                    {...register("password")}
                    disabled={loading}
                  />
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.password.message}
                  </p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
            {showDemoButton && (
              <>
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or</span>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleDemoLogin}
                  disabled={loading}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Use Demo Account
                </Button>
              </>
            )}
            <div className="mt-4 text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-primary hover:underline font-medium">
                Create an account
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
