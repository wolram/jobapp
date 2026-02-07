"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ScoreBadge } from "@/components/ScoreBadge";
import { StatusBadge } from "@/components/StatusBadge";
import type { ScoredOpportunityDTO } from "@jobapp/contracts";

export default function JobDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const profileId = searchParams.get("profileId");
  const [item, setItem] = useState<ScoredOpportunityDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profileId) return;

    fetch(`/api/v1/opportunities?profileId=${profileId}&limit=100`)
      .then((res) => res.json())
      .then((data) => {
        const found = (data.data ?? []).find(
          (o: ScoredOpportunityDTO) => o.opportunity.id === params.id
        );
        setItem(found ?? null);
      })
      .finally(() => setLoading(false));
  }, [params.id, profileId]);

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading...</div>;
  }

  if (!item) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Opportunity not found.</p>
        <Link href="/jobs" className="text-amber-600 hover:text-amber-700">
          Back to jobs
        </Link>
      </div>
    );
  }

  const { opportunity, score } = item;

  return (
    <div className="max-w-3xl">
      <Link
        href="/jobs"
        className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-block"
      >
        &larr; Back to jobs
      </Link>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {opportunity.title}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mt-1">
              {opportunity.company}
              {opportunity.location && ` · ${opportunity.location}`}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <StatusBadge status={score.status} />
              <span className="text-xs text-gray-400">
                {opportunity.source} ·{" "}
                {opportunity.employment_type ?? "Not specified"}
              </span>
            </div>
          </div>
          <ScoreBadge score={score.total_score} />
        </div>

        <div className="border-t pt-4 mt-4">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Score Breakdown
          </h2>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {score.total_score}%
              </div>
              <div className="text-xs text-gray-500">Total</div>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
              <div className="text-2xl font-bold text-blue-600">
                {score.rule_score}%
              </div>
              <div className="text-xs text-gray-500">Rule (70%)</div>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
              <div className="text-2xl font-bold text-purple-600">
                {score.semantic_score}%
              </div>
              <div className="text-xs text-gray-500">Semantic (30%)</div>
            </div>
          </div>

          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Scoring Reasons
          </h3>
          <ul className="space-y-2">
            {score.reasons.map((reason, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300"
              >
                <span
                  className={`inline-block w-5 h-5 rounded-full text-center text-xs leading-5 flex-shrink-0 ${
                    reason.score > 0
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {reason.score > 0 ? "+" : "-"}
                </span>
                <span>{reason.detail}</span>
              </li>
            ))}
          </ul>
        </div>

        {opportunity.description_raw && (
          <div className="border-t pt-4 mt-4">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Description
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
              {opportunity.description_raw}
            </p>
          </div>
        )}

        {opportunity.skills.length > 0 && (
          <div className="border-t pt-4 mt-4">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Detected Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {opportunity.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {skill.skill_name}{" "}
                  <span className="ml-1 text-blue-500">
                    {Math.round(skill.confidence * 100)}%
                  </span>
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="border-t pt-4 mt-4">
          <a
            href={opportunity.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            View Original Listing &rarr;
          </a>
        </div>
      </div>
    </div>
  );
}
