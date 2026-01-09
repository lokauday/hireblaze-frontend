/**
 * Jobs API client for Job Tracker.
 */
import { apiRequest, APIError } from '../api-client'

export interface Job {
  id: number
  user_id: number
  company: string
  title: string
  url: string | null
  status: 'saved' | 'applied' | 'interviewing' | 'offer' | 'rejected' | 'withdrawn'
  notes: string | null
  applied_at: string | null
  created_at: string
  updated_at: string
}

export interface JobCreate {
  company: string
  title: string
  url?: string | null
  status?: 'saved' | 'applied' | 'interviewing' | 'offer' | 'rejected' | 'withdrawn'
  notes?: string | null
  applied_at?: string | null
}

export interface JobUpdate {
  company?: string
  title?: string
  url?: string | null
  status?: 'saved' | 'applied' | 'interviewing' | 'offer' | 'rejected' | 'withdrawn'
  notes?: string | null
  applied_at?: string | null
}

export interface JobListResponse {
  jobs: Job[]
  total: number
  page: number
  page_size: number
}

export interface JobFilters {
  status?: string
  company?: string
  search?: string
  page?: number
  page_size?: number
}

export const jobsAPI = {
  /**
   * Create a new job.
   */
  create: async (data: JobCreate): Promise<Job> => {
    return apiRequest<Job>('/jobs', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  /**
   * List jobs with filters.
   */
  list: async (filters?: JobFilters): Promise<JobListResponse> => {
    const params = new URLSearchParams()
    if (filters?.status) params.append('status', filters.status)
    if (filters?.company) params.append('company', filters.company)
    if (filters?.search) params.append('search', filters.search)
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.page_size) params.append('page_size', filters.page_size.toString())

    const query = params.toString()
    return apiRequest<JobListResponse>(`/jobs${query ? `?${query}` : ''}`, {
      method: 'GET',
    })
  },

  /**
   * Get a specific job by ID.
   */
  get: async (id: number): Promise<Job> => {
    return apiRequest<Job>(`/jobs/${id}`, {
      method: 'GET',
    })
  },

  /**
   * Update a job.
   */
  update: async (id: number, data: JobUpdate): Promise<Job> => {
    return apiRequest<Job>(`/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  /**
   * Delete a job.
   */
  delete: async (id: number): Promise<void> => {
    return apiRequest<void>(`/jobs/${id}`, {
      method: 'DELETE',
    })
  },
}
