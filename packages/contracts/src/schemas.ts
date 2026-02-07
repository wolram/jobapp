import { z } from "zod";

// ── Skill Weight ──
export const SkillWeightInputSchema = z.object({
  skill_name: z.string().min(1).max(100),
  weight: z.number().int().min(0).max(100),
  required: z.boolean().default(false),
});

// ── Career Profile ──
export const CareerProfileInputSchema = z.object({
  title: z.string().min(1).max(200),
  function_area: z.string().max(200).optional(),
  location_pref: z.string().max(200).optional(),
  seniority: z.string().max(50).optional(),
  work_mode: z.string().max(50).optional(),
  salary_min: z.number().positive().optional(),
  salary_currency: z.string().length(3).optional(),
  is_active: z.boolean().default(true),
  skills: z.array(SkillWeightInputSchema).min(1).max(50),
});

export const CareerProfileUpdateSchema = CareerProfileInputSchema.partial();

// ── Opportunity Ingest ──
export const OpportunityItemSchema = z.object({
  title: z.string().min(1).max(500),
  company: z.string().min(1).max(300),
  url: z.string().url().max(2000),
  location: z.string().max(300).optional(),
  description_snippet: z.string().max(5000).optional(),
  external_id: z.string().max(500).optional(),
  employment_type: z.string().max(100).optional(),
  posted_at: z.string().datetime().optional(),
});

export const OpportunityIngestPayloadSchema = z.object({
  source: z.enum(["linkedin", "gupy"]),
  page_url: z.string().url().max(2000),
  collected_at: z.string().datetime(),
  opportunities: z.array(OpportunityItemSchema).min(1).max(100),
});

// ── Opportunity Status Update ──
export const OpportunityStatusUpdateSchema = z.object({
  status: z.enum(["saved", "dismissed", "applied"]),
});

// ── Alert ──
export const AlertInputSchema = z.object({
  channel: z.enum(["in_app", "email"]),
  frequency: z.enum(["daily"]).default("daily"),
  threshold: z.number().int().min(0).max(100).default(50),
});

// ── Token ──
export const TokenCreateSchema = z.object({
  name: z.string().min(1).max(100),
});

// ── Resume ──
export const ResumeUploadSchema = z.object({
  consent_version: z.string().min(1),
});

// ── Query Params ──
export const OpportunityQuerySchema = z.object({
  profileId: z.string().uuid(),
  status: z.enum(["new", "saved", "dismissed", "applied"]).optional(),
  minScore: z.coerce.number().int().min(0).max(100).optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
