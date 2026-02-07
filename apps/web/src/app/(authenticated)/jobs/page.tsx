"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ScoreBadge } from "@/components/ScoreBadge";
import { StatusBadge } from "@/components/StatusBadge";
import type { ScoredOpportunityDTO, CareerProfileDTO } from "@jobapp/contracts";

export default function JobsPage() {
  const [profiles, setProfiles] = useState<CareerProfileDTO[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<string>("");
  const [opportunities, setOpportunities] = useState<ScoredOpportunityDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [minScore, setMinScore] = useState<string>("");

  useEffect(() => {
    fetch("/api/v1/profiles")
      .then((res) => res.json())
      .then((data) => {
        setProfiles(data.data ?? []);
        if (data.data?.length > 0) {
          setSelectedProfile(data.data[0].id);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedProfile) return;
    setLoading(true);

    const params = new URLSearchParams({ profileId: selectedProfile });
    if (statusFilter) params.set("status", statusFilter);
    if (minScore) params.set("minScore", minScore);

    fetch(`/api/v1/opportunities?${params}`)
      .then((res) => res.json())
      .then((data) => setOpportunities(data.data ?? []))
      .finally(() => setLoading(false));
  }, [selectedProfile, statusFilter, minScore]);

  const updateStatus = async (
    scoreId: string,
    status: string
  ) => {
    await fetch(`/api/v1/opportunities/${scoreId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setOpportunities((prev) =>
      prev.map((o) =>
        o.score.scored_at === scoreId
          ? { ...o, score: { ...o.score, status } }
          : o
      )
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Job Opportunities
        </h1>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Profile</label>
          <select
            value={selectedProfile}
            onChange={(e) => setSelectedProfile(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            {profiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="">All</option>
            <option value="new">New</option>
            <option value="saved">Saved</option>
            <option value="applied">Applied</option>
            <option value="dismissed">Dismissed</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">
            Min Score
          </label>
          <input
            type="number"
            min="0"
            max="100"
            value={minScore}
            onChange={(e) => setMinScore(e.target.value)}
            placeholder="0"
            className="w-20 rounded-md border border-gray-300 px-3 py-1.5 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
      </div>

      {/* Job list */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : opportunities.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            No opportunities found. Connect your Safari extension to start
            collecting jobs.
          </p>
          <Link
            href="/settings/tokens"
            className="mt-4 inline-block text-amber-600 hover:text-amber-700"
          >
            Generate a token to connect
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {opportunities.map((item) => (
            <div
              key={item.opportunity.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Link
                      href={`/jobs/${item.opportunity.id}?profileId=${selectedProfile}`}
                      className="text-lg font-medium text-gray-900 dark:text-white hover:text-amber-600"
                    >
                      {item.opportunity.title}
                    </Link>
                    <StatusBadge status={item.score.status} />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {item.opportunity.company}
                    {item.opportunity.location &&
                      ` · ${item.opportunity.location}`}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {item.opportunity.source} · Captured{" "}
                    {new Date(item.opportunity.captured_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <ScoreBadge score={item.score.total_score} />
                  <div className="flex gap-1">
                    <button
                      onClick={() =>
                        updateStatus(item.opportunity.id, "saved")
                      }
                      className="px-2 py-1 text-xs rounded bg-purple-50 text-purple-700 hover:bg-purple-100"
                      title="Save"
                    >
                      Save
                    </button>
                    <button
                      onClick={() =>
                        updateStatus(item.opportunity.id, "dismissed")
                      }
                      className="px-2 py-1 text-xs rounded bg-gray-50 text-gray-600 hover:bg-gray-100"
                      title="Dismiss"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
