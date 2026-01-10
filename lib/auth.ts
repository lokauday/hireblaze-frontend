import { authAPI } from './api-client'

export interface User {
  id: number
  email: string
  full_name: string
  visa_status?: string
}

export const auth = {
  login: async (email: string, password: string) => {
    const response = await authAPI.login(email, password)
    if (response.access_token) {
      localStorage.setItem('token', response.access_token)
      // Store basic user info (we'll get full details from API if needed)
      const user: User = {
        id: 0,
        email,
        full_name: email.split('@')[0], // Temporary until we have /me endpoint
      }
      localStorage.setItem('user', JSON.stringify(user))
      return response
    }
    throw new Error('Login failed')
  },

  signup: async (data: {
    full_name: string
    email: string
    password: string
    visa_status?: string
  }) => {
    const response = await authAPI.signup(data)
    // Store token if provided (backend now returns access_token on signup)
    if (response.access_token) {
      localStorage.setItem('token', response.access_token)
      // Store basic user info
      const user: User = {
        id: response.user_id,
        email: data.email,
        full_name: data.full_name,
        visa_status: data.visa_status,
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
}
