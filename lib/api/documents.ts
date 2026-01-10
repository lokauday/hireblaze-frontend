/**
 * Documents API client for AI Drive.
 */
import { apiRequest, apiGet, APIError } from '../api-client'

export interface AppDocument {
  id: number
  user_id: number
  title: string
  type: 'resume' | 'cover_letter' | 'job_description' | 'interview_notes'
  content_text: string | null
  tags: string[]
  created_at: string
  updated_at: string
}

export interface DocumentCreate {
  title: string
  type: 'resume' | 'cover_letter' | 'job_description' | 'interview_notes'
  content_text?: string | null
  tags?: string[]
}

export interface DocumentUpdate {
  title?: string
  type?: 'resume' | 'cover_letter' | 'job_description' | 'interview_notes'
  content_text?: string | null
  tags?: string[]
}

export interface DocumentListResponse {
  documents: AppDocument[]
  total: number
  page: number
  page_size: number
}

export interface DocumentFilters {
  type?: string
  tags?: string
  search?: string
  page?: number
  page_size?: number
}

export const documentsAPI = {
  /**
   * Create a new document.
   */
  create: async (data: DocumentCreate): Promise<AppDocument> => {
    return apiRequest<AppDocument>('/documents', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  /**
   * List documents with filters.
   */
  list: async (filters?: DocumentFilters): Promise<DocumentListResponse> => {
    return apiGet<DocumentListResponse>('/documents', {
      type: filters?.type,
      tags: filters?.tags,
      search: filters?.search,
      page: filters?.page,
      page_size: filters?.page_size,
    })
  },

  /**
   * Get a specific document by ID.
   */
  get: async (id: number): Promise<AppDocument> => {
    return apiRequest<AppDocument>(`/documents/${id}`, {
      method: 'GET',
    })
  },

  /**
   * Update a document.
   */
  update: async (id: number, data: DocumentUpdate): Promise<AppDocument> => {
    return apiRequest<AppDocument>(`/documents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  /**
   * Delete a document.
   */
  delete: async (id: number): Promise<void> => {
    return apiRequest<void>(`/documents/${id}`, {
      method: 'DELETE',
    })
  },
}
