import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { ResumeUploadSchema } from "@jobapp/contracts";
import { authOptions, getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = getSessionUserId(session);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const consentVersion = formData.get("consent_version") as string | null;

  if (!file) {
    return NextResponse.json({ error: "File is required" }, { status: 400 });
  }

  const parsed = ResumeUploadSchema.safeParse({
    consent_version: consentVersion,
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation error", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // MVP: store file URL as a placeholder. In production, upload to S3/GCS.
  const fileUrl = `/uploads/resumes/${userId}/${Date.now()}-${file.name}`;

  const resume = await prisma.resume.create({
    data: {
      userId,
      fileUrl,
      consentVersion: parsed.data.consent_version,
      consentedAt: new Date(),
    },
  });

  return NextResponse.json(
    {
      id: resume.id,
      file_url: resume.fileUrl,
      consent_version: resume.consentVersion,
      consented_at: resume.consentedAt.toISOString(),
      created_at: resume.createdAt.toISOString(),
    },
    { status: 201 }
  );
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = getSessionUserId(session);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resumes = await prisma.resume.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    data: resumes.map((r) => ({
      id: r.id,
      file_url: r.fileUrl,
      consent_version: r.consentVersion,
      consented_at: r.consentedAt.toISOString(),
      created_at: r.createdAt.toISOString(),
    })),
  });
}
