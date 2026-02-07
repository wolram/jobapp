import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { TokenCreateSchema } from "@jobapp/contracts";
import { authOptions, getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateToken, hashToken } from "@/lib/token-auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = getSessionUserId(session);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tokens = await prisma.userToken.findMany({
    where: { userId, revokedAt: null },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      lastUsedAt: true,
      createdAt: true,
    },
  });

  return NextResponse.json({
    data: tokens.map((t) => ({
      id: t.id,
      name: t.name,
      last_used_at: t.lastUsedAt?.toISOString() ?? null,
      created_at: t.createdAt.toISOString(),
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
  const parsed = TokenCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation error", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const plainToken = generateToken();
  const tokenHash = hashToken(plainToken);

  const token = await prisma.userToken.create({
    data: {
      userId,
      tokenHash,
      name: parsed.data.name,
    },
  });

  return NextResponse.json(
    {
      id: token.id,
      name: token.name,
      plain_token: plainToken,
      last_used_at: null,
      created_at: token.createdAt.toISOString(),
    },
    { status: 201 }
  );
}
