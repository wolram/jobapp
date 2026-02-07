import { z } from "zod";
import {
  CareerProfileInputSchema,
  SkillWeightInputSchema,
  OpportunityIngestPayloadSchema,
  OpportunityItemSchema,
  OpportunityQuerySchema,
  AlertInputSchema,
  TokenCreateSchema,
} from "./schemas";

// ── Input Types (from schemas) ──
export type CareerProfileInput = z.infer<typeof CareerProfileInputSchema>;
export type SkillWeightInput = z.infer<typeof SkillWeightInputSchema>;
export type OpportunityIngestPayload = z.infer<
  typeof OpportunityIngestPayloadSchema
>;
export type OpportunityItem = z.infer<typeof OpportunityItemSchema>;
export type OpportunityQuery = z.infer<typeof OpportunityQuerySchema>;
export type AlertInput = z.infer<typeof AlertInputSchema>;
export type TokenCreateInput = z.infer<typeof TokenCreateSchema>;

// ── DTO Types (API responses) ──
export interface SkillWeightDTO {
  id: string;
  skill_name: string;
  weight: number;
  required: boolean;
}

export interface CareerProfileDTO {
  id: string;
  user_id: string;
  title: string;
  function_area: string | null;
  location_pref: string | null;
  seniority: string | null;
  work_mode: string | null;
  salary_min: number | null;
  salary_currency: string | null;
  is_active: boolean;
  skills: SkillWeightDTO[];
  created_at: string;
  updated_at: string;
}

export interface OpportunitySkillDTO {
  skill_name: string;
  confidence: number;
}

export interface OpportunityDTO {
  id: string;
  source: string;
  external_id: string | null;
  url: string;
  title: string;
  company: string;
  location: string | null;
  employment_type: string | null;
  description_raw: string | null;
  language: string | null;
  posted_at: string | null;
  captured_at: string;
  skills: OpportunitySkillDTO[];
}

export interface ScoreBreakdownDTO {
  total_score: number;
  rule_score: number;
  semantic_score: number;
  reasons: ScoreReason[];
  status: string;
  scored_at: string;
}

export interface ScoreReason {
  factor: string;
  score: number;
  detail: string;
}

export interface ScoredOpportunityDTO {
  opportunity: OpportunityDTO;
  score: ScoreBreakdownDTO;
  profile_id: string;
}

export interface IngestResultDTO {
  inserted: number;
  updated: number;
  ids: string[];
}

export interface AlertDigestDTO {
  user_id: string;
  profile_title: string;
  opportunities: Array<{
    title: string;
    company: string;
    url: string;
    total_score: number;
    reasons: ScoreReason[];
  }>;
  generated_at: string;
}

export interface TokenDTO {
  id: string;
  name: string;
  last_used_at: string | null;
  created_at: string;
}

export interface TokenCreatedDTO extends TokenDTO {
  /** Only returned at creation time */
  plain_token: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  next_cursor: string | null;
  total: number;
}
