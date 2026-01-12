import { authAPI } from './api-client'

export interface User {
  id: number
  email: string
  full_name: string
  visa_status?: string
  plan?: string
  usage?: {
    used: number
    limit: number
  }
}

export const auth = {
  login: async (email: string, password: string) => {
    try {
      const response = await authAPI.login(email, password)
      if (response.access_token) {
        // Always store token immediately
        localStorage.setItem('token', response.access_token)
        // Fetch full user info including plan and usage
        try {
          const me = await authAPI.getMe()
          const user: User = {
            id: me.id,
            email: me.email,
            full_name: me.full_name,
            plan: me.plan,
            usage: me.usage,
          }
          localStorage.setItem('user', JSON.stringify(user))
      } catch (err: any) {
        // Fallback: store basic user info if /me fails
        // Log error but don't throw - login was successful
        // This is a non-critical failure - user can still use the app
        if (typeof window !== 'undefined') {
          console.warn('[auth.login] Failed to fetch user info after login, using fallback:', {
            status: err?.status,
            message: err?.message,
            detail: err?.detail
          })
        }
        const user: User = {
          id: 0,
          email,
          full_name: email.split('@')[0],
        }
        localStorage.setItem('user', JSON.stringify(user))
      }
        return response
      }
      throw new Error('Login failed: No access token in response')
    } catch (err) {
      // Re-throw to let the caller handle it
      console.error('Login error:', err)
      throw err
    }
  },

  signup: async (data: {
    full_name: string
    email: string
    password: string
    visa_status?: string
  }) => {
    const response = await authAPI.signup(data)
    // Always store token if provided (backend returns access_token on signup)
    if (response.access_token) {
      localStorage.setItem('token', response.access_token)
      // Store user info from response (includes id, email, full_name, plan)
      let user: User
      if (response.user) {
        user = {
          id: response.user.id,
          email: response.user.email,
          full_name: response.user.full_name,
          visa_status: data.visa_status,
          plan: response.user.plan,
        }
      } else {
        // Fallback: store basic user info if user object not in response
        user = {
          id: 0,
          email: data.email,
          full_name: data.full_name,
          visa_status: data.visa_status,
        }
      }
      localStorage.setItem('user', JSON.stringify(user))
    }
    return response
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
  },

  getToken: (): string | null => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('token')
  },

  getUser: (): User | null => {
    if (typeof window === 'undefined') return null
    
    const userStr = localStorage.getItem('user')
    if (!userStr) return null
    try {
      return JSON.parse(userStr)
    } catch {
      return null
    }
  },

  isAuthenticated: (): boolean => {
    if (typeof window === 'undefined') return false
    
    return !!localStorage.getItem('token')
  },

  /**
   * Refresh user info from /auth/me endpoint.
   * Updates stored user data including plan and usage.
   */
  refreshMe: async (): Promise<User | null> => {
    if (typeof window === 'undefined') return null
    
    try {
      const me = await authAPI.getMe()
      const user: User = {
        id: me.id,
        email: me.email,
        full_name: me.full_name,
        plan: me.plan,
        usage: me.usage,
      }
      localStorage.setItem('user', JSON.stringify(user))
      return user
    } catch (err) {
      console.error('Failed to refresh user info:', err)
      return null
    }
  },
}
