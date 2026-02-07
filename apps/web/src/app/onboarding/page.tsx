"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface SkillEntry {
  skill_name: string;
  weight: number;
  required: boolean;
}

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [title, setTitle] = useState("");
  const [functionArea, setFunctionArea] = useState("");
  const [locationPref, setLocationPref] = useState("");
  const [seniority, setSeniority] = useState("");
  const [workMode, setWorkMode] = useState("");
  const [skills, setSkills] = useState<SkillEntry[]>([
    { skill_name: "", weight: 50, required: false },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }
  if (!session) {
    router.push("/login");
    return null;
  }

  const addSkill = () => {
    setSkills([...skills, { skill_name: "", weight: 50, required: false }]);
  };

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const updateSkill = (index: number, field: keyof SkillEntry, value: string | number | boolean) => {
    const updated = [...skills];
    (updated[index] as Record<string, unknown>)[field] = value;
    setSkills(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const validSkills = skills.filter((s) => s.skill_name.trim() !== "");
    if (validSkills.length === 0) {
      setError("Add at least one skill.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/v1/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          function_area: functionArea || undefined,
          location_pref: locationPref || undefined,
          seniority: seniority || undefined,
          work_mode: workMode || undefined,
          is_active: true,
          skills: validSkills,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to create profile");
        return;
      }

      router.push("/jobs");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome to GoldMedal Jobs
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Create your first career profile to start matching jobs
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 space-y-6"
        >
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Profile Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Senior Frontend Engineer"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-amber-500 focus:ring-amber-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Function Area
              </label>
              <input
                type="text"
                value={functionArea}
                onChange={(e) => setFunctionArea(e.target.value)}
                placeholder="e.g. Engineering"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-amber-500 focus:ring-amber-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Location Preference
              </label>
              <input
                type="text"
                value={locationPref}
                onChange={(e) => setLocationPref(e.target.value)}
                placeholder="e.g. Remote, São Paulo"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-amber-500 focus:ring-amber-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Seniority
              </label>
              <select
                value={seniority}
                onChange={(e) => setSeniority(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-amber-500 focus:ring-amber-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">Select...</option>
                <option value="intern">Intern</option>
                <option value="junior">Junior</option>
                <option value="mid">Mid-level</option>
                <option value="senior">Senior</option>
                <option value="lead">Lead</option>
                <option value="manager">Manager</option>
                <option value="director">Director</option>
                <option value="vp">VP</option>
                <option value="c_level">C-Level</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Work Mode
              </label>
              <select
                value={workMode}
                onChange={(e) => setWorkMode(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-amber-500 focus:ring-amber-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">Select...</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">On-site</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Skills *
              </label>
              <button
                type="button"
                onClick={addSkill}
                className="text-sm text-amber-600 hover:text-amber-700"
              >
                + Add skill
              </button>
            </div>
            <div className="space-y-3">
              {skills.map((skill, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={skill.skill_name}
                    onChange={(e) =>
                      updateSkill(idx, "skill_name", e.target.value)
                    }
                    placeholder="Skill name"
                    className="flex-1 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-amber-500 focus:ring-amber-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <div className="flex items-center gap-1 w-32">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={skill.weight}
                      onChange={(e) =>
                        updateSkill(idx, "weight", Number(e.target.value))
                      }
                      className="w-20"
                    />
                    <span className="text-xs text-gray-500 w-8">
                      {skill.weight}
                    </span>
                  </div>
                  <label className="flex items-center gap-1 text-xs text-gray-500">
                    <input
                      type="checkbox"
                      checked={skill.required}
                      onChange={(e) =>
                        updateSkill(idx, "required", e.target.checked)
                      }
                      className="rounded"
                    />
                    Req
                  </label>
                  {skills.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSkill(idx)}
                      className="text-red-400 hover:text-red-600 text-lg"
                    >
                      x
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg shadow-sm transition-colors disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Profile & Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
