import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { AlertInputSchema } from "@jobapp/contracts";
import { authOptions, getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = getSessionUserId(session);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const alerts = await prisma.alert.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    data: alerts.map((a) => ({
      id: a.id,
      channel: a.channel,
      frequency: a.frequency,
      threshold: a.threshold,
      last_sent_at: a.lastSentAt?.toISOString() ?? null,
      created_at: a.createdAt.toISOString(),
    })),
  });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = getSessionUserId(session);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = AlertInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation error", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const alert = await prisma.alert.create({
    data: {
      userId,
      channel: parsed.data.channel,
      frequency: parsed.data.frequency,
      threshold: parsed.data.threshold,
    },
  });

  return NextResponse.json(
    {
      id: alert.id,
      channel: alert.channel,
      frequency: alert.frequency,
      threshold: alert.threshold,
      last_sent_at: null,
      created_at: alert.createdAt.toISOString(),
    },
    { status: 201 }
  );
}

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = getSessionUserId(session);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { id, ...updates } = body;

  if (!id) {
    return NextResponse.json({ error: "Alert ID required" }, { status: 400 });
  }

  const existing = await prisma.alert.findFirst({
    where: { id, userId },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const parsed = AlertInputSchema.partial().safeParse(updates);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation error", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const alert = await prisma.alert.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json({
    id: alert.id,
    channel: alert.channel,
    frequency: alert.frequency,
    threshold: alert.threshold,
    last_sent_at: alert.lastSentAt?.toISOString() ?? null,
    created_at: alert.createdAt.toISOString(),
  });
}
