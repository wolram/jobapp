export const OpportunitySource = {
  LINKEDIN: "linkedin",
  GUPY: "gupy",
} as const;
export type OpportunitySource =
  (typeof OpportunitySource)[keyof typeof OpportunitySource];

export const OpportunityStatus = {
  NEW: "new",
  SAVED: "saved",
  DISMISSED: "dismissed",
  APPLIED: "applied",
} as const;
export type OpportunityStatus =
  (typeof OpportunityStatus)[keyof typeof OpportunityStatus];

export const AlertChannel = {
  IN_APP: "in_app",
  EMAIL: "email",
} as const;
export type AlertChannel = (typeof AlertChannel)[keyof typeof AlertChannel];

export const AlertFrequency = {
  DAILY: "daily",
} as const;
export type AlertFrequency =
  (typeof AlertFrequency)[keyof typeof AlertFrequency];

export const WorkMode = {
  REMOTE: "remote",
  HYBRID: "hybrid",
  ONSITE: "onsite",
} as const;
export type WorkMode = (typeof WorkMode)[keyof typeof WorkMode];

export const Seniority = {
  INTERN: "intern",
  JUNIOR: "junior",
  MID: "mid",
  SENIOR: "senior",
  LEAD: "lead",
  MANAGER: "manager",
  DIRECTOR: "director",
  VP: "vp",
  C_LEVEL: "c_level",
} as const;
export type Seniority = (typeof Seniority)[keyof typeof Seniority];
