import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendDigestEmail } from "@/lib/email";
import type { AlertDigestDTO } from "@jobapp/contracts";

/**
 * Daily digest cron job.
 * Call via: POST /api/cron/digest with Authorization: Bearer CRON_SECRET
 */
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Find all email alerts that are due
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const alerts = await prisma.alert.findMany({
    where: {
      channel: "email",
      frequency: "daily",
      OR: [{ lastSentAt: null }, { lastSentAt: { lt: oneDayAgo } }],
    },
    include: {
      user: {
        include: {
          careerProfiles: {
            where: { isActive: true },
            include: { skills: true },
          },
        },
      },
    },
  });

  let sent = 0;
  let failed = 0;

  for (const alert of alerts) {
    const user = alert.user;
    if (!user.email) continue;

    for (const profile of user.careerProfiles) {
      // Get top opportunities above threshold scored in last 24h
      const scores = await prisma.profileOpportunityScore.findMany({
        where: {
          profileId: profile.id,
          totalScore: { gte: alert.threshold },
          status: "new",
          scoredAt: { gte: oneDayAgo },
        },
        include: { opportunity: true },
        orderBy: { totalScore: "desc" },
        take: 10,
      });

      if (scores.length === 0) continue;

      const digest: AlertDigestDTO = {
        user_id: user.id,
        profile_title: profile.title,
        opportunities: scores.map((s) => ({
          title: s.opportunity.title,
          company: s.opportunity.company,
          url: s.opportunity.url,
          total_score: s.totalScore,
          reasons: s.reasonsJson as Array<{
            factor: string;
            score: number;
            detail: string;
          }>,
        })),
        generated_at: new Date().toISOString(),
      };

      const result = await sendDigestEmail(user.email, digest);
      if (result.success) {
        sent++;
      } else {
        failed++;
      }
    }

    // Update last sent timestamp
    await prisma.alert.update({
      where: { id: alert.id },
      data: { lastSentAt: new Date() },
    });
  }

  return NextResponse.json({ sent, failed, alerts_processed: alerts.length });
}
