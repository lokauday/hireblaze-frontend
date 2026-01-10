import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { APIErrorBanner } from "@/components/shared/api-error-banner"
import { ErrorBoundaryWrapper } from "@/components/shared/error-boundary-wrapper"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Hireblaze AI - Job Application Assistant",
  description: "AI-powered tools for job applications, resume tailoring, and cover letters",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundaryWrapper>
          <APIErrorBanner />
          {children}
          <Toaster />
        </ErrorBoundaryWrapper>
      </body>
    </html>
  )
}
