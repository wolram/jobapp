import type { ScoreReason } from "@jobapp/contracts";

interface ProfileForScoring {
  title: string;
  functionArea: string | null;
  locationPref: string | null;
  seniority: string | null;
  workMode: string | null;
  skills: Array<{
    skillName: string;
    weight: number;
    required: boolean;
  }>;
}

interface OpportunityForScoring {
  title: string;
  company: string;
  location: string | null;
  employmentType: string | null;
  descriptionRaw: string | null;
  skills: Array<{
    skillName: string;
    confidence: number;
  }>;
}

interface ScoreResult {
  totalScore: number;
  ruleScore: number;
  semanticScore: number;
  reasons: ScoreReason[];
}

const RULE_WEIGHT = 0.7;
const SEMANTIC_WEIGHT = 0.3;

/**
 * Calculate the rule-based score component.
 * Considers skill matches, title similarity, location, and seniority.
 */
function calculateRuleScore(
  profile: ProfileForScoring,
  opportunity: OpportunityForScoring
): { score: number; reasons: ScoreReason[] } {
  const reasons: ScoreReason[] = [];
  let totalWeight = 0;
  let earnedScore = 0;

  const oppSkillNames = new Set(
    opportunity.skills.map((s) => s.skillName.toLowerCase())
  );
  const oppDescription = (opportunity.descriptionRaw ?? "").toLowerCase();

  // Skill matching (primary factor)
  for (const skill of profile.skills) {
    const skillLower = skill.skillName.toLowerCase();
    const matched =
      oppSkillNames.has(skillLower) || oppDescription.includes(skillLower);
    const weight = skill.weight;
    totalWeight += weight;

    if (matched) {
      earnedScore += weight;
      reasons.push({
        factor: "skill_match",
        score: weight,
        detail: `Skill "${skill.skillName}" matched (weight: ${weight})`,
      });
    } else if (skill.required) {
      reasons.push({
        factor: "skill_missing_required",
        score: 0,
        detail: `Required skill "${skill.skillName}" not found`,
      });
    }
  }

  // Title similarity
  const profileTitleWords = profile.title.toLowerCase().split(/\s+/);
  const oppTitleLower = opportunity.title.toLowerCase();
  const titleMatchCount = profileTitleWords.filter((w) =>
    oppTitleLower.includes(w)
  ).length;
  const titleScore =
    profileTitleWords.length > 0
      ? (titleMatchCount / profileTitleWords.length) * 20
      : 0;
  if (titleScore > 0) {
    totalWeight += 20;
    earnedScore += titleScore;
    reasons.push({
      factor: "title_match",
      score: Math.round(titleScore),
      detail: `Title match: ${titleMatchCount}/${profileTitleWords.length} words`,
    });
  } else {
    totalWeight += 20;
  }

  // Location preference
  if (profile.locationPref && opportunity.location) {
    const locMatch = opportunity.location
      .toLowerCase()
      .includes(profile.locationPref.toLowerCase());
    totalWeight += 10;
    if (locMatch) {
      earnedScore += 10;
      reasons.push({
        factor: "location_match",
        score: 10,
        detail: `Location "${opportunity.location}" matches preference`,
      });
    }
  }

  const normalizedScore = totalWeight > 0 ? (earnedScore / totalWeight) * 100 : 0;

  return {
    score: Math.round(Math.min(100, Math.max(0, normalizedScore))),
    reasons,
  };
}

/**
 * Calculate the semantic score component.
 * MVP: uses simple text overlap heuristic. Will be replaced with embeddings.
 */
function calculateSemanticScore(
  profile: ProfileForScoring,
  opportunity: OpportunityForScoring
): { score: number; reasons: ScoreReason[] } {
  const reasons: ScoreReason[] = [];

  const profileText = [
    profile.title,
    profile.functionArea,
    profile.seniority,
    ...profile.skills.map((s) => s.skillName),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const oppText = [
    opportunity.title,
    opportunity.company,
    opportunity.descriptionRaw,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  // Simple word overlap heuristic for MVP
  const profileWords = new Set(
    profileText.split(/\s+/).filter((w) => w.length > 2)
  );
  const oppWords = new Set(oppText.split(/\s+/).filter((w) => w.length > 2));

  let overlap = 0;
  for (const word of profileWords) {
    if (oppWords.has(word)) overlap++;
  }

  const score =
    profileWords.size > 0
      ? Math.round((overlap / profileWords.size) * 100)
      : 0;

  reasons.push({
    factor: "semantic_similarity",
    score: Math.min(100, score),
    detail: `Text overlap: ${overlap}/${profileWords.size} profile terms found in opportunity`,
  });

  return {
    score: Math.min(100, score),
    reasons,
  };
}

/**
 * Calculate the combined score for a profile-opportunity pair.
 */
export function calculateScore(
  profile: ProfileForScoring,
  opportunity: OpportunityForScoring
): ScoreResult {
  const rule = calculateRuleScore(profile, opportunity);
  const semantic = calculateSemanticScore(profile, opportunity);

  const totalScore = Math.round(
    rule.score * RULE_WEIGHT + semantic.score * SEMANTIC_WEIGHT
  );

  return {
    totalScore: Math.min(100, Math.max(0, totalScore)),
    ruleScore: rule.score,
    semanticScore: semantic.score,
    reasons: [...rule.reasons, ...semantic.reasons],
  };
}
