/**
 * Outreach API client for Outreach Studio.
 */
import { apiRequest, APIError } from '../api-client'
import { aiAPI, OutreachRequest, OutreachResponse } from './ai'

export type { OutreachRequest, OutreachResponse }

export const outreachAPI = {
  /**
   * Generate outreach message.
   */
  generate: async (data: OutreachRequest): Promise<OutreachResponse> => {
    return aiAPI.outreach(data)
  },
}
