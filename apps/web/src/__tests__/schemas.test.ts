import {
  CareerProfileInputSchema,
  OpportunityIngestPayloadSchema,
  OpportunityStatusUpdateSchema,
  AlertInputSchema,
  TokenCreateSchema,
  OpportunityQuerySchema,
} from "@jobapp/contracts";

describe("Contract Schemas", () => {
  describe("CareerProfileInputSchema", () => {
    test("validates valid profile", () => {
      const result = CareerProfileInputSchema.safeParse({
        title: "Senior Frontend Engineer",
        function_area: "Engineering",
        seniority: "senior",
        skills: [
          { skill_name: "react", weight: 80, required: true },
          { skill_name: "typescript", weight: 70, required: false },
        ],
      });
      expect(result.success).toBe(true);
    });

    test("rejects empty title", () => {
      const result = CareerProfileInputSchema.safeParse({
        title: "",
        skills: [{ skill_name: "react", weight: 80, required: true }],
      });
      expect(result.success).toBe(false);
    });

    test("rejects empty skills array", () => {
      const result = CareerProfileInputSchema.safeParse({
        title: "Engineer",
        skills: [],
      });
      expect(result.success).toBe(false);
    });

    test("rejects skill weight > 100", () => {
      const result = CareerProfileInputSchema.safeParse({
        title: "Engineer",
        skills: [{ skill_name: "react", weight: 150, required: false }],
      });
      expect(result.success).toBe(false);
    });

    test("rejects skill weight < 0", () => {
      const result = CareerProfileInputSchema.safeParse({
        title: "Engineer",
        skills: [{ skill_name: "react", weight: -10, required: false }],
      });
      expect(result.success).toBe(false);
    });
  });

  describe("OpportunityIngestPayloadSchema", () => {
    test("validates valid ingest payload", () => {
      const result = OpportunityIngestPayloadSchema.safeParse({
        source: "linkedin",
        page_url: "https://linkedin.com/jobs",
        collected_at: "2024-01-15T10:00:00.000Z",
        opportunities: [
          {
            title: "Software Engineer",
            company: "TechCorp",
            url: "https://linkedin.com/jobs/view/123",
          },
        ],
      });
      expect(result.success).toBe(true);
    });

    test("rejects invalid source", () => {
      const result = OpportunityIngestPayloadSchema.safeParse({
        source: "indeed",
        page_url: "https://indeed.com",
        collected_at: "2024-01-15T10:00:00.000Z",
        opportunities: [],
      });
      expect(result.success).toBe(false);
    });

    test("rejects empty opportunities", () => {
      const result = OpportunityIngestPayloadSchema.safeParse({
        source: "linkedin",
        page_url: "https://linkedin.com/jobs",
        collected_at: "2024-01-15T10:00:00.000Z",
        opportunities: [],
      });
      expect(result.success).toBe(false);
    });

    test("rejects invalid URL in opportunities", () => {
      const result = OpportunityIngestPayloadSchema.safeParse({
        source: "linkedin",
        page_url: "https://linkedin.com/jobs",
        collected_at: "2024-01-15T10:00:00.000Z",
        opportunities: [
          { title: "SWE", company: "Corp", url: "not-a-url" },
        ],
      });
      expect(result.success).toBe(false);
    });

    test("accepts gupy source", () => {
      const result = OpportunityIngestPayloadSchema.safeParse({
        source: "gupy",
        page_url: "https://company.gupy.io/jobs",
        collected_at: "2024-01-15T10:00:00.000Z",
        opportunities: [
          {
            title: "Developer",
            company: "BrazilCo",
            url: "https://company.gupy.io/job/123",
          },
        ],
      });
      expect(result.success).toBe(true);
    });
  });

  describe("OpportunityStatusUpdateSchema", () => {
    test("accepts valid statuses", () => {
      for (const status of ["saved", "dismissed", "applied"]) {
        const result = OpportunityStatusUpdateSchema.safeParse({ status });
        expect(result.success).toBe(true);
      }
    });

    test("rejects invalid status", () => {
      const result = OpportunityStatusUpdateSchema.safeParse({
        status: "invalid",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("AlertInputSchema", () => {
    test("validates valid alert", () => {
      const result = AlertInputSchema.safeParse({
        channel: "email",
        threshold: 50,
      });
      expect(result.success).toBe(true);
    });

    test("rejects threshold > 100", () => {
      const result = AlertInputSchema.safeParse({
        channel: "email",
        threshold: 150,
      });
      expect(result.success).toBe(false);
    });

    test("defaults frequency to daily", () => {
      const result = AlertInputSchema.parse({
        channel: "email",
        threshold: 50,
      });
      expect(result.frequency).toBe("daily");
    });
  });

  describe("TokenCreateSchema", () => {
    test("validates valid token name", () => {
      const result = TokenCreateSchema.safeParse({ name: "MacBook Pro" });
      expect(result.success).toBe(true);
    });

    test("rejects empty name", () => {
      const result = TokenCreateSchema.safeParse({ name: "" });
      expect(result.success).toBe(false);
    });
  });

  describe("OpportunityQuerySchema", () => {
    test("validates valid query", () => {
      const result = OpportunityQuerySchema.safeParse({
        profileId: "550e8400-e29b-41d4-a716-446655440000",
        status: "new",
        minScore: "50",
      });
      expect(result.success).toBe(true);
    });

    test("coerces string numbers", () => {
      const result = OpportunityQuerySchema.parse({
        profileId: "550e8400-e29b-41d4-a716-446655440000",
        minScore: "75",
        limit: "10",
      });
      expect(result.minScore).toBe(75);
      expect(result.limit).toBe(10);
    });
  });
});
