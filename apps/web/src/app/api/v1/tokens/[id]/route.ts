import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const userId = getSessionUserId(session);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const token = await prisma.userToken.findFirst({
    where: { id, userId, revokedAt: null },
  });
  if (!token) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.userToken.update({
    where: { id },
    data: { revokedAt: new Date() },
  });

  return NextResponse.json({ revoked: true });
}
