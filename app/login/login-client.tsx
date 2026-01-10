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
import { APIErrorBanner, isAPIConfigured } from "@/components/shared/api-error-banner"

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
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
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  useEffect(() => {
    // Handle query params for email autofill and toasts
    const reason = searchParams.get("reason")
    const emailParam = searchParams.get("email")
    const signupParam = searchParams.get("signup")
    
    // Autofill email from query param if provided
    if (emailParam) {
      try {
        const decodedEmail = decodeURIComponent(emailParam)
        setValue("email", decodedEmail)
        
        // Debug log in development only
        if (process.env.NODE_ENV === 'development') {
          console.log('[Login Debug] Autofilled email from query param:', decodedEmail)
        }
      } catch (e) {
        // If decode fails, just use the raw value
        setValue("email", emailParam)
      }
    }
    
    // Show appropriate toast based on query params
    if (signupParam === "success") {
      toast({
        title: "Account created successfully!",
        description: "Please sign in with your credentials.",
      })
    } else if (reason === "exists") {
      toast({
        title: "Account already exists — please log in",
        description: emailParam 
          ? `The email ${decodeURIComponent(emailParam)} is already registered. Please sign in with your password.`
          : "This email is already registered. Please sign in with your password.",
      })
    }
  }, [searchParams, toast, setValue])

  const onSubmit = async (data: LoginFormData) => {
    // Runtime guard: check if API is configured
    if (!isAPIConfigured()) {
      toast({
        title: "API not configured",
        description: "NEXT_PUBLIC_API_URL is not set. Please configure the API URL to continue.",
        variant: "destructive",
      })
      setLoading(false)
      return
    }
    
    // Debug log in development only
    if (process.env.NODE_ENV === 'development') {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://hireblaze-api-production.up.railway.app'
      console.log(`[Login Debug] Submitting login request`, {
        baseURL: apiUrl,
        endpoint: '/auth/login',
        email: data.email,
      })
    }

    setLoading(true)

    try {
      const response = await auth.login(data.email, data.password)
      if (response.access_token) {
        // Ensure token is stored (already done in auth.login, but verify)
        if (typeof window !== 'undefined') {
          const storedToken = localStorage.getItem('token')
          if (!storedToken || storedToken !== response.access_token) {
            localStorage.setItem('token', response.access_token)
          }
        }
        
        // Debug log in development only
        if (process.env.NODE_ENV === 'development') {
          console.log('[Login Debug] Login success - status 200, token stored, redirecting to /dashboard')
        }
        
        toast({
          title: "Welcome back!",
          description: "Successfully signed in.",
        })
        router.push("/dashboard")
      } else {
        throw new Error("Login failed: No access token received")
      }
    } catch (err: any) {
      // Extract exact error message from backend response
      let errorMsg = "Invalid email or password"
      let errorTitle = "Sign in failed"
      
      // Handle APIError from api-client
      if (err && typeof err === 'object' && 'status' in err) {
        const apiError = err as any
        
        // Debug log in development only
        if (process.env.NODE_ENV === 'development') {
          console.log('[Login Debug] Login error', {
            status: apiError.status,
            detail: apiError.detail,
            message: apiError.message,
          })
        }
        
        // Extract error message from different possible formats
        if (apiError.detail) {
          if (typeof apiError.detail === 'string') {
            errorMsg = apiError.detail
          } else if (apiError.detail.detail) {
            errorMsg = apiError.detail.detail
          } else if (apiError.detail.error || apiError.detail.message) {
            errorMsg = apiError.detail.error || apiError.detail.message || errorMsg
          }
        } else if (apiError.message) {
          errorMsg = apiError.message
        }
        
        // Handle specific status codes
        if (apiError.status === 401) {
          errorTitle = "Incorrect email or password"
          errorMsg = "Email or password is incorrect."
        } else if (apiError.status === 400 || apiError.status === 422) {
          errorTitle = "Invalid input"
          errorMsg = errorMsg || "Please check your email and password"
        } else if (apiError.status === 500) {
          errorTitle = "Server error"
          errorMsg = "Server error occurred. Please try again later."
        }
      } else if (err && typeof err === 'object' && 'message' in err) {
        errorMsg = err.message || errorMsg
      } else if (err && typeof err === 'string') {
        errorMsg = err
      }
      
      toast({
        title: errorTitle,
        description: typeof errorMsg === "string" ? errorMsg : "Invalid email or password",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = async () => {
    // Runtime guard: check if API is configured
    if (!isAPIConfigured()) {
      toast({
        title: "API not configured",
        description: "NEXT_PUBLIC_API_URL is not set. Please configure the API URL to continue.",
        variant: "destructive",
      })
      return
    }
    
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

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://hireblaze-api-production.up.railway.app'
      console.log(`[Demo Login] Submitting login request to: ${apiUrl}/auth/login`)
    }

    setLoading(true)

    try {
      const response = await auth.login(demoEmail, demoPassword)
      if (response.access_token) {
        // Store token (already done in auth.login, but verify)
        if (typeof window !== 'undefined' && !localStorage.getItem('token')) {
          localStorage.setItem('token', response.access_token)
        }
        
        // Log in development
        if (process.env.NODE_ENV === 'development') {
          console.log('[Demo Login] Token stored, redirecting to /dashboard')
        }
        
        toast({
          title: "Welcome!",
          description: "Successfully signed in with demo account.",
        })
        router.push("/dashboard")
      }
    } catch (err: any) {
      // Extract exact error message from backend response
      let errorMsg = "Demo login failed"
      
      if (err && typeof err === 'object' && 'status' in err) {
        const apiError = err as any
        if (apiError.detail) {
          if (typeof apiError.detail === 'string') {
            errorMsg = apiError.detail
          } else if (apiError.detail.detail) {
            errorMsg = apiError.detail.detail
          } else if (apiError.detail.error || apiError.detail.message) {
            errorMsg = apiError.detail.error || apiError.detail.message || errorMsg
          }
        } else if (apiError.message) {
          errorMsg = apiError.message
        }
      } else if (err && typeof err === 'object' && 'message' in err) {
        errorMsg = err.message || errorMsg
      }
      
      toast({
        title: "Demo login failed",
        description: typeof errorMsg === "string" ? errorMsg : "Demo login failed",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Runtime check: disable form if API not configured
  const apiConfigured = isAPIConfigured()
  const showDemoButton = process.env.NEXT_PUBLIC_DEMO_EMAIL && process.env.NEXT_PUBLIC_DEMO_PASSWORD

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <APIErrorBanner />
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/login#reset"
                    onClick={(e) => {
                      e.preventDefault()
                      toast({
                        title: "Password reset",
                        description: "Password reset feature coming soon. Please contact support if you need help.",
                        variant: "default",
                      })
                    }}
                    className="text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
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
              <Button type="submit" className="w-full" disabled={loading || !apiConfigured}>
                {loading ? "Signing in..." : !apiConfigured ? "API not configured" : "Sign in"}
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
