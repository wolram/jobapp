"use client";

import { useEffect, useState, useCallback } from "react";
import type { CareerProfileDTO } from "@jobapp/contracts";

interface SkillEntry {
  skill_name: string;
  weight: number;
  required: boolean;
}

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState<CareerProfileDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [functionArea, setFunctionArea] = useState("");
  const [locationPref, setLocationPref] = useState("");
  const [seniority, setSeniority] = useState("");
  const [workMode, setWorkMode] = useState("");
  const [skills, setSkills] = useState<SkillEntry[]>([
    { skill_name: "", weight: 50, required: false },
  ]);
  const [formError, setFormError] = useState("");

  const loadProfiles = useCallback(async () => {
    const res = await fetch("/api/v1/profiles");
    const data = await res.json();
    setProfiles(data.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  const resetForm = () => {
    setTitle("");
    setFunctionArea("");
    setLocationPref("");
    setSeniority("");
    setWorkMode("");
    setSkills([{ skill_name: "", weight: 50, required: false }]);
    setFormError("");
    setEditing(null);
    setShowCreate(false);
  };

  const startEdit = (profile: CareerProfileDTO) => {
    setEditing(profile.id);
    setShowCreate(true);
    setTitle(profile.title);
    setFunctionArea(profile.function_area ?? "");
    setLocationPref(profile.location_pref ?? "");
    setSeniority(profile.seniority ?? "");
    setWorkMode(profile.work_mode ?? "");
    setSkills(
      profile.skills.map((s) => ({
        skill_name: s.skill_name,
        weight: s.weight,
        required: s.required,
      }))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    const validSkills = skills.filter((s) => s.skill_name.trim());
    if (validSkills.length === 0) {
      setFormError("Add at least one skill.");
      return;
    }

    const payload = {
      title,
      function_area: functionArea || undefined,
      location_pref: locationPref || undefined,
      seniority: seniority || undefined,
      work_mode: workMode || undefined,
      is_active: true,
      skills: validSkills,
    };

    const res = await fetch(
      editing ? `/api/v1/profiles/${editing}` : "/api/v1/profiles",
      {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      const data = await res.json();
      setFormError(data.error || "Failed to save profile");
      return;
    }

    resetForm();
    loadProfiles();
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    await fetch(`/api/v1/profiles/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !isActive }),
    });
    loadProfiles();
  };

  const deleteProfile = async (id: string) => {
    if (!confirm("Delete this profile?")) return;
    await fetch(`/api/v1/profiles/${id}`, { method: "DELETE" });
    loadProfiles();
  };

  const addSkill = () =>
    setSkills([...skills, { skill_name: "", weight: 50, required: false }]);
  const removeSkill = (i: number) => setSkills(skills.filter((_, idx) => idx !== i));
  const updateSkill = (i: number, field: keyof SkillEntry, value: string | number | boolean) => {
    const updated = [...skills];
    (updated[i] as Record<string, unknown>)[field] = value;
    setSkills(updated);
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Career Profiles
        </h1>
        {!showCreate && (
          <button
            onClick={() => {
              resetForm();
              setShowCreate(true);
            }}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium"
          >
            + New Profile
          </button>
        )}
      </div>

      {showCreate && (
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6 space-y-4"
        >
          <h2 className="font-semibold text-gray-900 dark:text-white">
            {editing ? "Edit Profile" : "New Profile"}
          </h2>
          {formError && (
            <div className="bg-red-50 text-red-700 p-3 rounded text-sm">
              {formError}
            </div>
          )}
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Profile title"
            className="block w-full rounded-md border border-gray-300 px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              value={functionArea}
              onChange={(e) => setFunctionArea(e.target.value)}
              placeholder="Function area"
              className="rounded-md border border-gray-300 px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <input
              type="text"
              value={locationPref}
              onChange={(e) => setLocationPref(e.target.value)}
              placeholder="Location preference"
              className="rounded-md border border-gray-300 px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <select
              value={seniority}
              onChange={(e) => setSeniority(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">Seniority...</option>
              <option value="intern">Intern</option>
              <option value="junior">Junior</option>
              <option value="mid">Mid</option>
              <option value="senior">Senior</option>
              <option value="lead">Lead</option>
              <option value="manager">Manager</option>
            </select>
            <select
              value={workMode}
              onChange={(e) => setWorkMode(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">Work mode...</option>
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="onsite">On-site</option>
            </select>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Skills
              </span>
              <button
                type="button"
                onClick={addSkill}
                className="text-sm text-amber-600"
              >
                + Add
              </button>
            </div>
            {skills.map((skill, idx) => (
              <div key={idx} className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={skill.skill_name}
                  onChange={(e) =>
                    updateSkill(idx, "skill_name", e.target.value)
                  }
                  placeholder="Skill"
                  className="flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
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
                <span className="text-xs w-6">{skill.weight}</span>
                <label className="text-xs flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={skill.required}
                    onChange={(e) =>
                      updateSkill(idx, "required", e.target.checked)
                    }
                  />
                  Req
                </label>
                {skills.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSkill(idx)}
                    className="text-red-400 text-lg"
                  >
                    x
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium"
            >
              {editing ? "Update" : "Create"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {profiles.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No profiles yet. Create one to start matching jobs.
        </div>
      ) : (
        <div className="space-y-4">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {profile.title}
                    </h3>
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        profile.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {profile.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {[profile.function_area, profile.seniority, profile.work_mode, profile.location_pref]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {profile.skills.map((s) => (
                      <span
                        key={s.id}
                        className={`text-xs px-2 py-0.5 rounded ${
                          s.required
                            ? "bg-amber-100 text-amber-800"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {s.skill_name} ({s.weight})
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(profile)}
                    className="text-sm text-amber-600 hover:text-amber-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() =>
                      toggleActive(profile.id, profile.is_active)
                    }
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    {profile.is_active ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    onClick={() => deleteProfile(profile.id)}
                    className="text-sm text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
