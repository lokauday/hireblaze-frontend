/**
 * API client for Hireblaze backend.
 * Handles authentication, error handling, and request/response transformation.
 */

// Get base URL with fallback and validation
function getBaseURL(): string {
  const url = process.env.NEXT_PUBLIC_API_URL || 'https://hireblaze-api-production.up.railway.app'
  
  // Warn in development if URL is missing
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_API_URL) {
    console.warn('⚠️ NEXT_PUBLIC_API_URL not set. Using default production URL.')
  }
  
  return url
}

const baseURL = getBaseURL()

interface RequestOptions extends RequestInit {
  requireAuth?: boolean
}

export class APIError extends Error {
  constructor(
    public status: number,
    public detail: any,
    message?: string
  ) {
    super(message || 'API request failed')
    this.name = 'APIError'
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { requireAuth = true, ...fetchOptions } = options

  // Create Headers object from existing headers or empty object
  const headers = new Headers(fetchOptions.headers ?? {})

  // Set Content-Type only if not already set (e.g., for form-urlencoded)
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  // Add auth token if required
  if (requireAuth && typeof window !== 'undefined') {
    const token = localStorage.getItem('token')
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
  }

  // Ensure endpoint starts with /
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  const url = `${baseURL}${normalizedEndpoint}`
  
  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    })

    // Handle 401 - redirect to login
    if (response.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
      throw new APIError(401, { error: 'Unauthorized' }, 'Authentication required')
    }

    // Parse response
    let data: any
    const contentType = response.headers.get('content-type')
    if (contentType?.includes('application/json')) {
      data = await response.json()
    } else {
      data = await response.text()
    }

    // Handle errors
    if (!response.ok) {
      // Extract error message from response
      let errorDetail = data?.detail || data
      let errorMessage = errorDetail
      
      // Handle string detail
      if (typeof errorDetail === "string") {
        errorMessage = errorDetail
      } else if (errorDetail && typeof errorDetail === "object") {
        errorMessage = errorDetail.message || errorDetail.detail || JSON.stringify(errorDetail)
      }
      
      throw new APIError(
        response.status,
        errorDetail,
        errorMessage || `Request failed with status ${response.status}`
      )
    }

    return data as T
  } catch (error) {
    if (error instanceof APIError) {
      throw error
    }
    // Network or other errors
    throw new APIError(
      0,
      { error: 'Network error' },
      error instanceof Error ? error.message : 'Unknown error occurred'
    )
  }
}

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const formData = new URLSearchParams()
    formData.append('username', email) // OAuth2PasswordRequestForm uses 'username' field
    formData.append('password', password)
    
    return apiRequest<{ access_token: string; token_type: string }>('/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
      requireAuth: false,
    })
  },

  signup: async (data: {
    full_name: string
    email: string
    password: string
    visa_status?: string
  }) => {
    const formData = new URLSearchParams()
    formData.append('full_name', data.full_name)
    formData.append('email', data.email)
    formData.append('password', data.password)
    if (data.visa_status) {
      formData.append('visa_status', data.visa_status)
    } else {
      formData.append('visa_status', 'Citizen') // Default value
    }
    
    return apiRequest<{ message: string; user_id: number }>('/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
      requireAuth: false,
    })
  },
}

// Usage API
export const usageAPI = {
  getUsage: async () => {
    return apiRequest<{
      plan: string
      month_key: string
      features: {
        [key: string]: {
          limit: number | null
          used: number
          remaining: number | null
          unlimited: boolean
        }
      }
    }>('/me/usage')
  },
}

// Billing API
export const billingAPI = {
  createCheckoutSession: async (data: {
    plan: string
    success_url: string
    cancel_url: string
  }) => {
    return apiRequest<{ checkout_url: string; session_id: string }>(
      '/billing/create-checkout-session',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    )
  },

  createPortalSession: async (data: { return_url: string }) => {
    return apiRequest<{ url: string }>('/billing/create-portal-session', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },
}

// AI Tools API
export const aiToolsAPI = {
  atsScan: async (data: { resume_text: string; jd_text: string }) => {
    return apiRequest<{ score: number; missing_keywords: string[] }>('/ats/score', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  tailorResume: async (data: { resume_text: string; jd_text: string }) => {
    return apiRequest<{ tailored_resume: string }>('/tailor/resume', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  generateCoverLetter: async (data: { resume_text: string; jd_text: string }) => {
    return apiRequest<{ cover_letter: string }>('/cover-letter/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  parseJD: async (data: { jd_text: string }) => {
    return apiRequest<{ skills: string[] }>('/jd/skills', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },
}
