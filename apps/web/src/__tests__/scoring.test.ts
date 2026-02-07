import { calculateScore } from "../lib/scoring";

describe("Scoring Engine", () => {
  const baseProfile = {
    title: "Senior Frontend Engineer",
    functionArea: "Engineering",
    locationPref: "Remote",
    seniority: "senior",
    workMode: "remote",
    skills: [
      { skillName: "react", weight: 80, required: true },
      { skillName: "typescript", weight: 70, required: true },
      { skillName: "css", weight: 40, required: false },
      { skillName: "node.js", weight: 30, required: false },
    ],
  };

  const highMatchOpportunity = {
    title: "Senior Frontend Engineer",
    company: "TechCorp",
    location: "Remote",
    employmentType: "Full-time",
    descriptionRaw:
      "We are looking for a Senior Frontend Engineer with strong React and TypeScript skills. Experience with CSS and Node.js is a plus. Remote position.",
    skills: [
      { skillName: "react", confidence: 0.9 },
      { skillName: "typescript", confidence: 0.8 },
      { skillName: "css", confidence: 0.7 },
      { skillName: "node.js", confidence: 0.6 },
    ],
  };

  const lowMatchOpportunity = {
    title: "Data Scientist",
    company: "DataCo",
    location: "New York",
    employmentType: "Full-time",
    descriptionRaw:
      "Looking for a Data Scientist with Python, pandas, and machine learning experience.",
    skills: [
      { skillName: "python", confidence: 0.9 },
      { skillName: "pandas", confidence: 0.8 },
      { skillName: "machine learning", confidence: 0.7 },
    ],
  };

  const partialMatchOpportunity = {
    title: "Full Stack Developer",
    company: "StartupX",
    location: "Hybrid - São Paulo",
    employmentType: "Full-time",
    descriptionRaw:
      "Full stack developer needed. Must know React and Node.js. TypeScript preferred.",
    skills: [
      { skillName: "react", confidence: 0.8 },
      { skillName: "node.js", confidence: 0.8 },
    ],
  };

  test("high match opportunity scores above 60", () => {
    const result = calculateScore(baseProfile, highMatchOpportunity);

    expect(result.totalScore).toBeGreaterThanOrEqual(60);
    expect(result.ruleScore).toBeGreaterThanOrEqual(50);
    expect(result.semanticScore).toBeGreaterThanOrEqual(0);
    expect(result.reasons.length).toBeGreaterThan(0);
  });

  test("low match opportunity scores below 40", () => {
    const result = calculateScore(baseProfile, lowMatchOpportunity);

    expect(result.totalScore).toBeLessThanOrEqual(40);
  });

  test("partial match scores between low and high", () => {
    const high = calculateScore(baseProfile, highMatchOpportunity);
    const low = calculateScore(baseProfile, lowMatchOpportunity);
    const partial = calculateScore(baseProfile, partialMatchOpportunity);

    expect(partial.totalScore).toBeGreaterThan(low.totalScore);
    expect(partial.totalScore).toBeLessThanOrEqual(high.totalScore);
  });

  test("total score is within 0-100 range", () => {
    const result = calculateScore(baseProfile, highMatchOpportunity);
    expect(result.totalScore).toBeGreaterThanOrEqual(0);
    expect(result.totalScore).toBeLessThanOrEqual(100);
  });

  test("total score combines rule (70%) and semantic (30%)", () => {
    const result = calculateScore(baseProfile, highMatchOpportunity);
    const expected = Math.round(
      result.ruleScore * 0.7 + result.semanticScore * 0.3
    );
    // Allow 1 point rounding difference
    expect(Math.abs(result.totalScore - expected)).toBeLessThanOrEqual(1);
  });

  test("reasons include skill match details", () => {
    const result = calculateScore(baseProfile, highMatchOpportunity);
    const skillReasons = result.reasons.filter(
      (r) => r.factor === "skill_match"
    );
    expect(skillReasons.length).toBeGreaterThan(0);
  });

  test("missing required skill is flagged", () => {
    const result = calculateScore(baseProfile, lowMatchOpportunity);
    const missingRequired = result.reasons.filter(
      (r) => r.factor === "skill_missing_required"
    );
    expect(missingRequired.length).toBeGreaterThan(0);
  });

  test("title match contributes to score", () => {
    const result = calculateScore(baseProfile, highMatchOpportunity);
    const titleReason = result.reasons.find((r) => r.factor === "title_match");
    expect(titleReason).toBeDefined();
    expect(titleReason!.score).toBeGreaterThan(0);
  });

  test("location match contributes to score", () => {
    const result = calculateScore(baseProfile, highMatchOpportunity);
    const locationReason = result.reasons.find(
      (r) => r.factor === "location_match"
    );
    expect(locationReason).toBeDefined();
  });

  test("handles empty skills gracefully", () => {
    const emptyProfile = { ...baseProfile, skills: [] };
    const result = calculateScore(
      emptyProfile as typeof baseProfile,
      highMatchOpportunity
    );
    expect(result.totalScore).toBeGreaterThanOrEqual(0);
    expect(result.totalScore).toBeLessThanOrEqual(100);
  });

  test("handles empty description gracefully", () => {
    const noDescOpp = { ...highMatchOpportunity, descriptionRaw: null };
    const result = calculateScore(baseProfile, noDescOpp);
    expect(result.totalScore).toBeGreaterThanOrEqual(0);
  });
});
