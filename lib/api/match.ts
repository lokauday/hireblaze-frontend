/**
 * Match API client for Job Match Score.
 */
import { apiRequest, APIError } from '../api-client'
import { aiAPI, JobMatchRequest, JobMatchResponse, RecruiterLensRequest, RecruiterLensResponse } from './ai'

export type { JobMatchRequest, JobMatchResponse, RecruiterLensRequest, RecruiterLensResponse }

export const matchAPI = {
  /**
   * Analyze job match between resume and job description.
   */
  jobMatch: async (data: JobMatchRequest): Promise<JobMatchResponse> => {
    return aiAPI.jobMatch(data)
  },

  /**
   * Generate recruiter lens analysis.
   */
  recruiterLens: async (data: RecruiterLensRequest): Promise<RecruiterLensResponse> => {
    return aiAPI.recruiterLens(data)
  },
}
