import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { CareerProfileUpdateSchema } from "@jobapp/contracts";
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

  // Verify ownership
  const existing = await prisma.careerProfile.findFirst({
    where: { id, userId },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = CareerProfileUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation error", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { skills, ...profileData } = parsed.data;

  // Build update data
  const updateData: Record<string, unknown> = {};
  if (profileData.title !== undefined) updateData.title = profileData.title;
  if (profileData.function_area !== undefined)
    updateData.functionArea = profileData.function_area;
  if (profileData.location_pref !== undefined)
    updateData.locationPref = profileData.location_pref;
  if (profileData.seniority !== undefined)
    updateData.seniority = profileData.seniority;
  if (profileData.work_mode !== undefined)
    updateData.workMode = profileData.work_mode;
  if (profileData.salary_min !== undefined)
    updateData.salaryMin = profileData.salary_min;
  if (profileData.salary_currency !== undefined)
    updateData.salaryCurrency = profileData.salary_currency;
  if (profileData.is_active !== undefined)
    updateData.isActive = profileData.is_active;

  // If skills are provided, replace them all
  if (skills) {
    await prisma.profileSkill.deleteMany({ where: { profileId: id } });
    await prisma.profileSkill.createMany({
      data: skills.map((s) => ({
        profileId: id,
        skillName: s.skill_name,
        weight: s.weight,
        required: s.required,
      })),
    });
  }

  const profile = await prisma.careerProfile.update({
    where: { id },
    data: updateData,
    include: { skills: true },
  });

  return NextResponse.json({
    id: profile.id,
    user_id: profile.userId,
    title: profile.title,
    function_area: profile.functionArea,
    location_pref: profile.locationPref,
    seniority: profile.seniority,
    work_mode: profile.workMode,
    salary_min: profile.salaryMin,
    salary_currency: profile.salaryCurrency,
    is_active: profile.isActive,
    skills: profile.skills.map((s) => ({
      id: s.id,
      skill_name: s.skillName,
      weight: s.weight,
      required: s.required,
    })),
    created_at: profile.createdAt.toISOString(),
    updated_at: profile.updatedAt.toISOString(),
  });
}

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

  const existing = await prisma.careerProfile.findFirst({
    where: { id, userId },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.careerProfile.delete({ where: { id } });

  return NextResponse.json({ deleted: true });
}
