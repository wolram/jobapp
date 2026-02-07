"use client";

import { useEffect, useState } from "react";

interface ResumeData {
  id: string;
  file_url: string;
  consent_version: string;
  consented_at: string;
  created_at: string;
}

export default function PrivacyPage() {
  const [resumes, setResumes] = useState<ResumeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [consented, setConsented] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetch("/api/v1/resumes")
      .then((res) => res.json())
      .then((data) => setResumes(data.data ?? []))
      .finally(() => setLoading(false));
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !consented) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("consent_version", "1.0");

    const res = await fetch("/api/v1/resumes", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      setResumes((prev) => [data, ...prev]);
    }
    setUploading(false);
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading...</div>;
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Privacy & Resume
      </h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-3">
          Data Collection
        </h2>
        <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
          <li>
            We only collect job listings from pages you actively visit in Safari.
          </li>
          <li>No background crawling or automated scraping is performed.</li>
          <li>
            Your job data is used solely for matching and scoring against your
            profiles.
          </li>
          <li>You can delete your data at any time.</li>
        </ul>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-3">
          Resume Upload
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Optionally upload your resume to improve semantic matching. Your
          resume is stored securely and only used for scoring.
        </p>

        <label className="flex items-center gap-2 mb-4">
          <input
            type="checkbox"
            checked={consented}
            onChange={(e) => setConsented(e.target.checked)}
            className="rounded"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            I consent to GoldMedal Jobs storing my resume for matching purposes
            (v1.0)
          </span>
        </label>

        <input
          type="file"
          accept=".pdf,.doc,.docx"
          disabled={!consented || uploading}
          onChange={handleUpload}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 disabled:opacity-50"
        />

        {resumes.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Uploaded Resumes
            </h3>
            {resumes.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between py-2 text-sm"
              >
                <span className="text-gray-600 dark:text-gray-300">
                  {r.file_url.split("/").pop()}
                </span>
                <span className="text-xs text-gray-400">
                  Consent v{r.consent_version} ·{" "}
                  {new Date(r.consented_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
