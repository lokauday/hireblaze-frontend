/**
 * History API client for Activity Timeline.
 */
import { apiRequest, apiGet, APIError } from '../api-client'

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
    return apiGet<HistoryListResponse>('/history', {
      feature: filters?.feature,
      start_date: filters?.start_date,
      end_date: filters?.end_date,
      page: filters?.page,
      page_size: filters?.page_size,
    })
  },
}
