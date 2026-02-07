import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { OpportunityStatusUpdateSchema } from "@jobapp/contracts";
import { authOptions, getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const userId = getSessionUserId(session);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const body = await request.json();
  const parsed = OpportunityStatusUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation error", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // Find score record that belongs to this user
  const score = await prisma.profileOpportunityScore.findFirst({
    where: {
      id,
      profile: { userId },
    },
  });

  if (!score) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.profileOpportunityScore.update({
    where: { id },
    data: { status: parsed.data.status },
  });

  return NextResponse.json({
    id: updated.id,
    status: updated.status,
  });
}
