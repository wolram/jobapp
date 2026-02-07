import { NextRequest, NextResponse } from "next/server";
import { OpportunityIngestPayloadSchema } from "@jobapp/contracts";
import { validateBearerToken } from "@/lib/token-auth";
import { prisma } from "@/lib/db";
import { generateDedupeKey } from "@/lib/dedupe";
import { extractSkills } from "@/lib/skill-extractor";
import { calculateScore } from "@/lib/scoring";

export async function POST(request: NextRequest) {
  // Auth via PAT
  const userId = await validateBearerToken(
    request.headers.get("authorization")
  );
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Parse and validate body
  const body = await request.json();
  const parsed = OpportunityIngestPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation error", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { source, opportunities, collected_at } = parsed.data;
  const inserted: string[] = [];
  const updated: string[] = [];

  for (const opp of opportunities) {
    const dedupeKey = generateDedupeKey(source, opp.url, opp.external_id);

    // Upsert opportunity
    const existing = await prisma.opportunity.findUnique({
      where: { dedupeKey },
    });

    let opportunityId: string;

    if (existing) {
      await prisma.opportunity.update({
        where: { id: existing.id },
        data: {
          title: opp.title,
          company: opp.company,
          location: opp.location,
          employmentType: opp.employment_type,
          descriptionRaw: opp.description_snippet,
        },
      });
      opportunityId = existing.id;
      updated.push(opportunityId);
    } else {
      const created = await prisma.opportunity.create({
        data: {
          source,
          externalId: opp.external_id,
          url: opp.url,
          title: opp.title,
          company: opp.company,
          location: opp.location,
          employmentType: opp.employment_type,
          descriptionRaw: opp.description_snippet,
          postedAt: opp.posted_at ? new Date(opp.posted_at) : null,
          capturedAt: new Date(collected_at),
          dedupeKey,
        },
      });
      opportunityId = created.id;
      inserted.push(opportunityId);

      // Extract and store skills for new opportunities
      const skills = extractSkills(opp.description_snippet ?? "");
      if (skills.length > 0) {
        await prisma.opportunitySkill.createMany({
          data: skills.map((s) => ({
            opportunityId,
            skillName: s.skillName,
            confidence: s.confidence,
          })),
        });
      }
    }

    // Score against all active profiles for this user
    const profiles = await prisma.careerProfile.findMany({
      where: { userId, isActive: true },
      include: { skills: true },
    });

    const opportunity = await prisma.opportunity.findUnique({
      where: { id: opportunityId },
      include: { skills: true },
    });

    if (opportunity) {
      for (const profile of profiles) {
        const result = calculateScore(
          {
            title: profile.title,
            functionArea: profile.functionArea,
            locationPref: profile.locationPref,
            seniority: profile.seniority,
            workMode: profile.workMode,
            skills: profile.skills.map((s) => ({
              skillName: s.skillName,
              weight: s.weight,
              required: s.required,
            })),
          },
          {
            title: opportunity.title,
            company: opportunity.company,
            location: opportunity.location,
            employmentType: opportunity.employmentType,
            descriptionRaw: opportunity.descriptionRaw,
            skills: opportunity.skills.map((s) => ({
              skillName: s.skillName,
              confidence: s.confidence,
            })),
          }
        );

        await prisma.profileOpportunityScore.upsert({
          where: {
            profileId_opportunityId: {
              profileId: profile.id,
              opportunityId: opportunity.id,
            },
          },
          create: {
            profileId: profile.id,
            opportunityId: opportunity.id,
            totalScore: result.totalScore,
            ruleScore: result.ruleScore,
            semanticScore: result.semanticScore,
            reasonsJson: result.reasons,
            scoredAt: new Date(),
          },
          update: {
            totalScore: result.totalScore,
            ruleScore: result.ruleScore,
            semanticScore: result.semanticScore,
            reasonsJson: result.reasons,
            scoredAt: new Date(),
          },
        });
      }
    }
  }

  return NextResponse.json({
    inserted: inserted.length,
    updated: updated.length,
    ids: [...inserted, ...updated],
  });
}
