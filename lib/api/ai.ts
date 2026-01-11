/**
 * AI API client for FinalRoundAI++ features.
 */
import { apiRequest, APIError } from '../api-client'

export interface JobMatchRequest {
  resume_text?: string
  resume_id?: number
  jd_text?: string
  job_id?: number
}

export interface JobMatchResponse {
  match_score: number
  overlap: Record<string, any>
  missing: Record<string, any>
  risks: Record<string, any>
  improvement_plan: Record<string, any>
  recruiter_lens: Record<string, any>
}

export interface RecruiterLensRequest {
  resume_text?: string
  resume_id?: number
  jd_text?: string
  job_id?: number
  save_to_drive?: boolean
}

export interface RecruiterLensResponse {
  first_impression: string
  red_flags: string[]
  strengths: string[]
  shortlist_decision: string
  fixes: string[]
}

export interface InterviewPackRequest {
  resume_text?: string
  resume_id?: number
  jd_text?: string
  job_id?: number
  save_to_drive?: boolean
}

export interface InterviewPackResponse {
  questions: string[]
  star_outlines: Record<string, string>
  plan_30_60_90: {
    '30_days': string
    '60_days': string
    '90_days': string
  }
  additional_prep: Record<string, any>
}

export interface OutreachRequest {
  message_type: 'recruiter_followup' | 'linkedin_dm' | 'thank_you' | 'referral_ask'
  resume_text?: string
  resume_id?: number
  jd_text?: string
  job_id?: number
  company?: string
  job_title?: string
  save_to_drive?: boolean
}

export interface OutreachResponse {
  message: string
  subject?: string
  tone: string
}

export interface TransformRequest {
  mode: 'rewrite' | 'shorten' | 'expand' | 'ats_optimize' | 'fix_grammar' | 'add_keywords'
  text: string
  context?: {
    job_title?: string
    company?: string
    job_description?: string
    seniority?: string
  }
}

export interface TransformResponse {
  output: string
  explanation?: {
    what_changed?: string[]
    why_changed?: string
    keywords_added?: string[]
    summary?: string
  }
}

export const aiAPI = {
  /**
   * Analyze job match between resume and job description.
   */
  jobMatch: async (data: JobMatchRequest): Promise<JobMatchResponse> => {
    return apiRequest<JobMatchResponse>('/ai/job-match', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  /**
   * Generate recruiter lens analysis.
   */
  recruiterLens: async (data: RecruiterLensRequest): Promise<RecruiterLensResponse> => {
    return apiRequest<RecruiterLensResponse>('/ai/recruiter-lens', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  /**
   * Generate interview preparation pack.
   */
  interviewPack: async (data: InterviewPackRequest): Promise<InterviewPackResponse> => {
    return apiRequest<InterviewPackResponse>('/ai/interview-pack', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  /**
   * Generate outreach message.
   */
  outreach: async (data: OutreachRequest): Promise<OutreachResponse> => {
    return apiRequest<OutreachResponse>('/ai/outreach', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  /**
   * Transform text content using AI (for editor).
   */
  transformText: async (data: TransformRequest): Promise<TransformResponse> => {
    return apiRequest<TransformResponse>('/ai/transform', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },
}
