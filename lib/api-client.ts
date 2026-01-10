/**
 * API client for Hireblaze backend.
 * Handles authentication, error handling, and request/response transformation.
 */

// API Configuration
// Defaults to '/api/v1' as specified (configurable via NEXT_PUBLIC_API_PREFIX env var)
// To disable prefix: set NEXT_PUBLIC_API_PREFIX= in .env.local
const API_PREFIX = process.env.NEXT_PUBLIC_API_PREFIX !== undefined 
  ? process.env.NEXT_PUBLIC_API_PREFIX 
  : '/api/v1'

/**
 * Get base URL from environment variables.
 * Supports both NEXT_PUBLIC_API_BASE_URL and NEXT_PUBLIC_API_URL for backward compatibility.
 */
function getBaseURL(): string {
  // Try NEXT_PUBLIC_API_BASE_URL first (new standard), fallback to NEXT_PUBLIC_API_URL (legacy)
  // Always provide a fallback to production URL so app doesn't break
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 
                  process.env.NEXT_PUBLIC_API_URL || 
                  'https://hireblaze-api-production.up.railway.app'
  
  // Warn in development if URL is missing (but don't throw - use fallback)
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    if (!process.env.NEXT_PUBLIC_API_BASE_URL && !process.env.NEXT_PUBLIC_API_URL) {
      console.warn('⚠️ NEXT_PUBLIC_API_BASE_URL not set. Using default production URL:', baseUrl)
    }
  }
  
  // In production, log a warning but don't throw (use fallback)
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
    if (!process.env.NEXT_PUBLIC_API_BASE_URL && !process.env.NEXT_PUBLIC_API_URL) {
      console.warn('⚠️ NEXT_PUBLIC_API_BASE_URL not set in production. Using fallback URL:', baseUrl)
    }
  }
  
  return baseUrl
}

/**
 * Build full API URL with prefix.
 * Handles cases where base URL may already include the prefix to avoid double-prefixing.
 * 
 * Examples:
 * - BASE=https://api.example.com, prefix=/api/v1, endpoint=/usage
 *   → https://api.example.com/api/v1/usage
 * - BASE=https://api.example.com/api/v1, prefix=/api/v1, endpoint=/usage
 *   → https://api.example.com/api/v1/usage (no double prefix)
 */
function buildAPIUrl(endpoint: string): string {
  const baseUrl = getBaseURL()
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  
  // Normalize base URL (remove trailing slash)
  let cleanBaseUrl = baseUrl.replace(/\/+$/, '') // Remove one or more trailing slashes
  
  // If prefix is empty string, return base URL + endpoint directly (no prefix)
  if (!API_PREFIX || API_PREFIX.trim() === '') {
    return `${cleanBaseUrl}${normalizedEndpoint}`
  }
  
  // Normalize prefix (ensure starts with /, remove trailing slash)
  let normalizedPrefix = API_PREFIX.trim()
  if (!normalizedPrefix.startsWith('/')) {
    normalizedPrefix = `/${normalizedPrefix}`
  }
  normalizedPrefix = normalizedPrefix.replace(/\/+$/, '') // Remove trailing slashes
  
  // Check if base URL already ends with the normalized prefix to avoid double-prefixing
  // Also check for common variations
  const baseEndsWithPrefix = cleanBaseUrl.endsWith(normalizedPrefix) || 
                             cleanBaseUrl.endsWith('/api/v1')
  
  // Also check if base URL contains the prefix somewhere (more lenient check)
  const baseContainsPrefix = cleanBaseUrl.includes('/api/v1/') || 
                            (normalizedPrefix === '/api/v1' && cleanBaseUrl.includes('/api/v1'))
  
  if (baseEndsWithPrefix || baseContainsPrefix) {
    // Base URL already has prefix, use endpoint as-is
    return `${cleanBaseUrl}${normalizedEndpoint}`
  } else {
    // Add prefix before endpoint: ${BASE}${PREFIX}${endpoint}
    return `${cleanBaseUrl}${normalizedPrefix}${normalizedEndpoint}`
  }
}

// Runtime check for API URL (called on each request, not at build time)
function getBaseURLRuntime(): string {
  return getBaseURL()
}

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

/**
 * Standardized API GET helper with query params support.
 * Builds URLs like: ${BASE_URL}${API_PREFIX}${path}?query
 * 
 * @example
 * apiGet('/usage') → GET {BASE}/api/v1/usage
 * apiGet('/documents', { page: 1, page_size: 10 }) → GET {BASE}/api/v1/documents?page=1&page_size=10
 */
export async function apiGet<T>(
  path: string,
  params?: Record<string, string | number | boolean | undefined>
): Promise<T> {
  const queryParams = new URLSearchParams()
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value))
      }
    })
  }
  
  const queryString = queryParams.toString()
  const endpoint = queryString ? `${path}?${queryString}` : path
  
  return apiRequest<T>(endpoint, { method: 'GET' })
}

/**
 * Standardized API POST helper.
 * Builds URLs like: ${BASE_URL}${API_PREFIX}${path}
 * 
 * @example
 * apiPost('/auth/login', { email: '...', password: '...' }) → POST {BASE}/api/v1/auth/login
 */
export async function apiPost<T>(
  path: string,
  body?: Record<string, any>
): Promise<T> {
  return apiRequest<T>(path, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  })
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { requireAuth = true, ...fetchOptions } = options

  // Use plain object for headers (Record<string, string>)
  const headers: Record<string, string> = {}
  
  // Copy existing headers from options (if any)
  if (fetchOptions.headers) {
    if (fetchOptions.headers instanceof Headers) {
      fetchOptions.headers.forEach((value, key) => {
        headers[key] = value
      })
    } else if (Array.isArray(fetchOptions.headers)) {
      // Handle array of tuples [string, string][]
      fetchOptions.headers.forEach(([key, value]) => {
        headers[key] = value
      })
    } else {
      // Plain object
      Object.assign(headers, fetchOptions.headers)
    }
  }

  // Set Content-Type only if not already set (e.g., for form-urlencoded)
  if (!headers['Content-Type'] && !headers['content-type']) {
    headers['Content-Type'] = 'application/json'
  }

  // Add auth token if required
  if (requireAuth && typeof window !== 'undefined') {
    const token = localStorage.getItem('token')
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
  }

  // Build full URL with API prefix
  const url = buildAPIUrl(endpoint)
  
  // Debug logging for specific endpoints (always log in dev, errors in prod)
  const debugEndpoints = ['/usage', '/documents', '/history', '/ai/transform']
  const isDev = typeof window !== 'undefined' && process.env.NODE_ENV === 'development'
  const shouldLog = isDev || debugEndpoints.some(ep => endpoint.startsWith(ep))
  
  if (shouldLog) {
    const matchesDebugEndpoint = debugEndpoints.some(ep => endpoint.startsWith(ep))
    if (matchesDebugEndpoint || isDev) {
      console.log(`[API Request Debug] ${options.method || 'GET'} ${url}`, {
        endpoint,
        baseUrl: getBaseURL(),
        prefix: API_PREFIX || '(none)',
        finalUrl: url
      })
    } else {
      console.log(`[API Request] ${options.method || 'GET'} ${url}`)
    }
  }
  
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
      
      // Log error with full URL for debugging (especially for 404s)
      if (typeof window !== 'undefined') {
        console.error(`[API Error] ${response.status} ${options.method || 'GET'} ${url}`, {
          status: response.status,
          statusText: response.statusText,
          error: errorMessage,
          endpoint
        })
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

// Helper to handle auth responses (parses JSON even on errors)
async function handleAuthResponse<T>(res: Response): Promise<T> {
  let data: any
  try {
    const text = await res.text()
    data = text ? JSON.parse(text) : {}
  } catch {
    // If JSON parse fails, return empty object but still handle error status
    data = {}
  }

  // Debug log in development only (after parsing)
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development' && !res.ok) {
    console.log(`[Auth API Debug] Error response parsed:`, {
      status: res.status,
      detail: data.detail,
      message: data.message,
    })
  }

  if (!res.ok) {
    // Extract error message - FastAPI returns {"detail": "..."}
    const errorMessage = data.detail || data.message || `Request failed with status ${res.status}`
    throw new APIError(res.status, data, errorMessage)
  }

  // Debug log success in development only
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.log(`[Auth API Debug] Success response parsed:`, {
      has_access_token: !!data.access_token,
      has_user: !!data.user,
      user_plan: data.user?.plan,
    })
  }

  return data as T
}

// Auth API - Direct fetch for form-urlencoded endpoints (backend accepts both JSON and form)
export const authAPI = {
  login: async (email: string, password: string) => {
    // Build URL with API prefix (has fallback, so no need to throw error)
    const url = buildAPIUrl('/auth/login')
    
    // Use form-urlencoded (same as signup for consistency)
    // Backend also accepts JSON with {"email": "...", "password": "..."}
    const form = new URLSearchParams()
    form.set('username', email.trim().toLowerCase()) // OAuth2PasswordRequestForm uses 'username' field
    form.set('password', password)
    
    // Log in development only
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.log(`[Auth API] POST ${url}`)
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: form.toString(),
    })

    // Debug log in development only
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      const clonedRes = res.clone()
      clonedRes.json().then((data: any) => {
        console.log(`[Auth API Debug] Login response status: ${res.status}`, {
          has_access_token: !!data.access_token,
        })
      }).catch(() => {})
    }

    return handleAuthResponse<{ access_token: string; token_type: string }>(res)
  },

  signup: async (payload: {
    full_name: string
    email: string
    password: string
    visa_status?: string
  }) => {
    // Build URL with API prefix (has fallback, so no need to throw error)
    const url = buildAPIUrl('/auth/signup')
    
    const form = new URLSearchParams()
    form.set('full_name', payload.full_name.trim())
    form.set('email', payload.email.trim().toLowerCase())
    form.set('password', payload.password)
    if (payload.visa_status) {
      form.set('visa_status', payload.visa_status)
    }
    
    // Log in development only
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.log(`[Auth API] POST ${url}`)
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: form.toString(),
    })

    // Debug log in development only (log status before parsing)
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.log(`[Auth API Debug] Signup response status: ${res.status}`, {
        ok: res.ok,
        statusText: res.statusText,
      })
    }

    return handleAuthResponse<{
      access_token: string
      token_type: string
      user: {
        id: number
        email: string
        full_name: string
        plan: string
      }
    }>(res)
  },
}

// Usage API
export const usageAPI = {
  /**
   * Get current month usage statistics for the authenticated user.
   * Calls: GET {BASE}/api/v1/usage
   */
  getUsage: async () => {
    return apiGet<{
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
    }>('/usage')
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
