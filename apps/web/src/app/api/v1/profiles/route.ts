import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { CareerProfileInputSchema } from "@jobapp/contracts";
import { authOptions, getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = getSessionUserId(session);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profiles = await prisma.careerProfile.findMany({
    where: { userId },
    include: { skills: true },
    orderBy: { createdAt: "desc" },
  });

  const data = profiles.map((p) => ({
    id: p.id,
    user_id: p.userId,
    title: p.title,
    function_area: p.functionArea,
    location_pref: p.locationPref,
    seniority: p.seniority,
    work_mode: p.workMode,
    salary_min: p.salaryMin,
    salary_currency: p.salaryCurrency,
    is_active: p.isActive,
    skills: p.skills.map((s) => ({
      id: s.id,
      skill_name: s.skillName,
      weight: s.weight,
      required: s.required,
    })),
    created_at: p.createdAt.toISOString(),
    updated_at: p.updatedAt.toISOString(),
  }));

  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = getSessionUserId(session);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = CareerProfileInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation error", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { skills, ...profileData } = parsed.data;

  const profile = await prisma.careerProfile.create({
    data: {
      userId,
      title: profileData.title,
      functionArea: profileData.function_area,
      locationPref: profileData.location_pref,
      seniority: profileData.seniority,
      workMode: profileData.work_mode,
      salaryMin: profileData.salary_min,
      salaryCurrency: profileData.salary_currency,
      isActive: profileData.is_active,
      skills: {
        create: skills.map((s) => ({
          skillName: s.skill_name,
          weight: s.weight,
          required: s.required,
        })),
      },
    },
    include: { skills: true },
  });

  return NextResponse.json(
    {
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
    },
    { status: 201 }
  );
}
