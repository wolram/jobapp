"use client";

import { useEffect, useState } from "react";

interface AlertData {
  id: string;
  channel: string;
  frequency: string;
  threshold: number;
  last_sent_at: string | null;
  created_at: string;
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [loading, setLoading] = useState(true);
  const [threshold, setThreshold] = useState(50);
  const [channel, setChannel] = useState("email");

  useEffect(() => {
    fetch("/api/v1/alerts")
      .then((res) => res.json())
      .then((data) => {
        setAlerts(data.data ?? []);
        if (data.data?.length > 0) {
          setThreshold(data.data[0].threshold);
          setChannel(data.data[0].channel);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const saveAlert = async () => {
    if (alerts.length > 0) {
      // Update existing
      await fetch("/api/v1/alerts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: alerts[0].id,
          channel,
          threshold,
        }),
      });
    } else {
      // Create new
      await fetch("/api/v1/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel,
          frequency: "daily",
          threshold,
        }),
      });
    }

    // Reload
    const res = await fetch("/api/v1/alerts");
    const data = await res.json();
    setAlerts(data.data ?? []);
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading...</div>;
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Alert Settings
      </h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Alert Channel
          </label>
          <select
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="email">Email (daily digest)</option>
            <option value="in_app">In-app only</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Minimum Score Threshold: {threshold}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0% (all jobs)</span>
            <span>50%</span>
            <span>100% (perfect match only)</span>
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-500">
            Frequency: <strong>Daily</strong> (sent once per day with new
            matches above threshold)
          </p>
          {alerts.length > 0 && alerts[0].last_sent_at && (
            <p className="text-xs text-gray-400 mt-1">
              Last sent: {new Date(alerts[0].last_sent_at).toLocaleString()}
            </p>
          )}
        </div>

        <button
          onClick={saveAlert}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium"
        >
          Save Alert Settings
        </button>
      </div>
    </div>
  );
}
