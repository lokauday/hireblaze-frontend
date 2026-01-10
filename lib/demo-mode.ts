/**
 * Demo mode utilities.
 * When NEXT_PUBLIC_DEMO_MODE is "true", authentication is bypassed and mock data is returned.
 */

/**
 * Check if demo mode is enabled.
 * Reads NEXT_PUBLIC_DEMO_MODE environment variable (defaults to "false").
 */
export function isDemoMode(): boolean {
  if (typeof window === 'undefined') return false // Server-side, default to false
  const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE || 'false'
  return demoMode.toLowerCase() === 'true'
}

/**
 * Get demo user object.
 */
export function getDemoUser() {
  return {
    id: 1,
    email: 'demo@hireblaze.ai',
    full_name: 'Demo User',
    plan: 'Pro' as const,
    visa_status: 'Citizen' as const,
  }
}

/**
 * Get demo usage data.
 */
export function getDemoUsage() {
  return {
    plan: 'Pro',
    month_key: new Date().toISOString().slice(0, 7), // YYYY-MM
    features: {
      resume_tailor: {
        limit: 100,
        used: 12,
        remaining: 88,
        unlimited: false,
      },
      cover_letter: {
        limit: 50,
        used: 5,
        remaining: 45,
        unlimited: false,
      },
      ats_scan: {
        limit: 200,
        used: 23,
        remaining: 177,
        unlimited: false,
      },
      jd_parse: {
        limit: null,
        used: 15,
        remaining: null,
        unlimited: true,
      },
    },
  }
}

/**
 * Get demo documents list.
 */
export function getDemoDocuments() {
  const now = new Date()
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)

  return {
    documents: [
      {
        id: 1,
        user_id: 1,
        title: 'Senior Software Engineer Resume',
        type: 'resume' as const,
        content_text: '...',
        tags: ['software', 'engineering'],
        created_at: oneDayAgo.toISOString(),
        updated_at: oneDayAgo.toISOString(),
      },
      {
        id: 2,
        user_id: 1,
        title: 'Cover Letter - Google',
        type: 'cover_letter' as const,
        content_text: '...',
        tags: ['google', 'cover-letter'],
        created_at: threeDaysAgo.toISOString(),
        updated_at: threeDaysAgo.toISOString(),
      },
    ],
    total: 2,
    page: 1,
    page_size: 10,
  }
}

/**
 * Get demo jobs list.
 */
export function getDemoJobs() {
  const now = new Date()
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

  return {
    jobs: [
      {
        id: 1,
        user_id: 1,
        company: 'Google',
        title: 'Senior Software Engineer',
        url: 'https://careers.google.com/jobs/123',
        status: 'applied' as const,
        notes: 'Applied via referral',
        applied_at: oneWeekAgo.toISOString(),
        created_at: twoWeeksAgo.toISOString(),
        updated_at: oneWeekAgo.toISOString(),
      },
      {
        id: 2,
        user_id: 1,
        company: 'Meta',
        title: 'Full Stack Engineer',
        url: 'https://www.meta.com/careers/456',
        status: 'interviewing' as const,
        notes: 'Phone screen completed',
        applied_at: twoWeeksAgo.toISOString(),
        created_at: twoWeeksAgo.toISOString(),
        updated_at: now.toISOString(),
      },
    ],
    total: 2,
    page: 1,
    page_size: 10,
  }
}

/**
 * Get demo history entries.
 */
export function getDemoHistory() {
  const now = new Date()
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
  const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000)
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

  return {
    entries: [
      {
        id: 1,
        feature: 'resume_tailor',
        created_at: oneHourAgo.toISOString(),
        amount: 1,
        document_id: 1,
        job_id: null,
      },
      {
        id: 2,
        feature: 'ats_scan',
        created_at: threeHoursAgo.toISOString(),
        amount: 1,
        document_id: 1,
        job_id: 1,
      },
      {
        id: 3,
        feature: 'cover_letter',
        created_at: oneDayAgo.toISOString(),
        amount: 1,
        document_id: 2,
        job_id: 1,
      },
    ],
    total: 3,
    page: 1,
    page_size: 10,
  }
}