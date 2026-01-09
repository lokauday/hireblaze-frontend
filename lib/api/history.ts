/**
 * History API client for Activity Timeline.
 */
import { apiRequest, APIError } from '../api-client'

export interface HistoryEntry {
  id: number
  feature: string
  created_at: string
  amount: number
  document_id: number | null
  job_id: number | null
}

export interface HistoryListResponse {
  entries: HistoryEntry[]
  total: number
  page: number
  page_size: number
}

export interface HistoryFilters {
  feature?: string
  start_date?: string
  end_date?: string
  page?: number
  page_size?: number
}

export const historyAPI = {
  /**
   * Get activity history timeline.
   */
  list: async (filters?: HistoryFilters): Promise<HistoryListResponse> => {
    const params = new URLSearchParams()
    if (filters?.feature) params.append('feature', filters.feature)
    if (filters?.start_date) params.append('start_date', filters.start_date)
    if (filters?.end_date) params.append('end_date', filters.end_date)
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.page_size) params.append('page_size', filters.page_size.toString())

    const query = params.toString()
    return apiRequest<HistoryListResponse>(`/history${query ? `?${query}` : ''}`, {
      method: 'GET',
    })
  },
}
