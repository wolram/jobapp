import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { OpportunityQuerySchema } from "@jobapp/contracts";
import { authOptions, getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = getSessionUserId(session);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = Object.fromEntries(request.nextUrl.searchParams);
  const parsed = OpportunityQuerySchema.safeParse(searchParams);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation error", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { profileId, status, minScore, cursor, limit } = parsed.data;

  // Verify profile belongs to user
  const profile = await prisma.careerProfile.findFirst({
    where: { id: profileId, userId },
  });
  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  // Build where clause
  const where: Record<string, unknown> = { profileId };
  if (status) where.status = status;
  if (minScore !== undefined) where.totalScore = { gte: minScore };
  if (cursor) where.id = { lt: cursor };

  const scores = await prisma.profileOpportunityScore.findMany({
    where,
    include: {
      opportunity: {
        include: { skills: true },
      },
    },
    orderBy: [{ totalScore: "desc" }, { scoredAt: "desc" }],
    take: limit + 1,
  });

  const hasMore = scores.length > limit;
  const items = hasMore ? scores.slice(0, limit) : scores;

  const data = items.map((s) => ({
    opportunity: {
      id: s.opportunity.id,
      source: s.opportunity.source,
      external_id: s.opportunity.externalId,
      url: s.opportunity.url,
      title: s.opportunity.title,
      company: s.opportunity.company,
      location: s.opportunity.location,
      employment_type: s.opportunity.employmentType,
      description_raw: s.opportunity.descriptionRaw,
      language: s.opportunity.language,
      posted_at: s.opportunity.postedAt?.toISOString() ?? null,
      captured_at: s.opportunity.capturedAt.toISOString(),
      skills: s.opportunity.skills.map((sk) => ({
        skill_name: sk.skillName,
        confidence: sk.confidence,
      })),
    },
    score: {
      total_score: s.totalScore,
      rule_score: s.ruleScore,
      semantic_score: s.semanticScore,
      reasons: s.reasonsJson as Array<{
        factor: string;
        score: number;
        detail: string;
      }>,
      status: s.status,
      scored_at: s.scoredAt.toISOString(),
    },
    profile_id: s.profileId,
  }));

  return NextResponse.json({
    data,
    next_cursor: hasMore ? items[items.length - 1].id : null,
    total: data.length,
  });
}
