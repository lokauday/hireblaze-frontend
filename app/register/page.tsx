"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { motion } from "framer-motion"
import { Sparkles, Mail, Lock, User, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { auth } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"

const registerSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  visa_status: z.string().optional(),
})

type RegisterFormData = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const router = useRouter()
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      visa_status: "Citizen",
    },
  })

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const response = await auth.signup({
        full_name: data.full_name,
        email: data.email,
        password: data.password,
        visa_status: data.visa_status,
      })
      
      // If signup returns access_token, user is automatically logged in
      if (response.access_token) {
        toast({
          title: "Account created successfully!",
          description: "Welcome to Hireblaze! Redirecting to dashboard...",
        })
        router.push("/dashboard")
      } else {
        // Fallback: redirect to login if no token (shouldn't happen with new backend)
        toast({
          title: "Account created successfully!",
          description: "Redirecting to login...",
        })
        router.push("/login?signup=success")
      }
    } catch (err: any) {
      // Extract exact error message from backend response
      let errorMsg = "Failed to create account. Please try again."
      let errorTitle = "Registration failed"
      
      // Handle APIError from api-client
      if (err && typeof err === 'object' && 'status' in err) {
        const apiError = err as any
        
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
        if (apiError.status === 400) {
          errorTitle = "Invalid input"
          if (!errorMsg || errorMsg === "Failed to create account. Please try again.") {
            errorMsg = "Please check your input and try again."
          }
        } else if (apiError.status === 409) {
          errorTitle = "Email already registered"
          errorMsg = "This email address is already in use. Please use a different email or try logging in."
        } else if (apiError.status === 401) {
          errorTitle = "Authentication failed"
        } else if (apiError.status === 500) {
          errorTitle = "Server error"
          errorMsg = "Server error occurred. Please try again later."
        }
      } else if (err && typeof err === 'object' && 'message' in err) {
        errorMsg = err.message || errorMsg
      }
      
      toast({
        title: errorTitle,
        description: typeof errorMsg === "string" ? errorMsg : "Failed to create account",
        variant: "destructive",
      })
    }
  }

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
            <CardTitle className="text-2xl">Create an account</CardTitle>
            <CardDescription>
              Enter your information to get started with Hireblaze
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="full_name"
                    type="text"
                    placeholder="John Doe"
                    className="pl-9"
                    {...register("full_name")}
                    disabled={isSubmitting}
                  />
                </div>
                {errors.full_name && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.full_name.message}
                  </p>
                )}
              </div>
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
                    disabled={isSubmitting}
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
                    disabled={isSubmitting}
                  />
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.password.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="visa_status">Visa Status (Optional)</Label>
                <Input
                  id="visa_status"
                  type="text"
                  placeholder="Citizen"
                  {...register("visa_status")}
                  disabled={isSubmitting}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Creating account..." : "Create account"}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
