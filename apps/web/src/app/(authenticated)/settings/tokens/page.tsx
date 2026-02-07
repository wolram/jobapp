"use client";

import { useEffect, useState } from "react";
import type { TokenDTO, TokenCreatedDTO } from "@jobapp/contracts";

export default function TokensPage() {
  const [tokens, setTokens] = useState<TokenDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [newToken, setNewToken] = useState<string | null>(null);

  const loadTokens = () => {
    fetch("/api/v1/tokens")
      .then((res) => res.json())
      .then((data) => setTokens(data.data ?? []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTokens();
  }, []);

  const createToken = async () => {
    if (!name.trim()) return;
    const res = await fetch("/api/v1/tokens", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (res.ok) {
      const data: TokenCreatedDTO = await res.json();
      setNewToken(data.plain_token);
      setName("");
      loadTokens();
    }
  };

  const revokeToken = async (id: string) => {
    if (!confirm("Revoke this token? The extension will stop syncing.")) return;
    await fetch(`/api/v1/tokens/${id}`, { method: "DELETE" });
    loadTokens();
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading...</div>;
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Extension Tokens (PAT)
      </h1>

      {/* Create token */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-3">
          Generate New Token
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Create a Personal Access Token to connect your Safari extension to
          your account. Paste it in the extension popup.
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Token name (e.g. MacBook Pro)"
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <button
            onClick={createToken}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium"
          >
            Generate
          </button>
        </div>

        {newToken && (
          <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">
              Token created! Copy it now - it won&apos;t be shown again.
            </p>
            <code className="block p-2 bg-white dark:bg-gray-800 rounded text-sm font-mono break-all">
              {newToken}
            </code>
            <button
              onClick={() => {
                navigator.clipboard.writeText(newToken);
              }}
              className="mt-2 text-sm text-green-700 hover:text-green-800"
            >
              Copy to clipboard
            </button>
          </div>
        )}
      </div>

      {/* Token list */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-3">
          Active Tokens
        </h2>
        {tokens.length === 0 ? (
          <p className="text-sm text-gray-500">No tokens yet.</p>
        ) : (
          <div className="space-y-3">
            {tokens.map((token) => (
              <div
                key={token.id}
                className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {token.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    Created {new Date(token.created_at).toLocaleDateString()}
                    {token.last_used_at &&
                      ` · Last used ${new Date(token.last_used_at).toLocaleDateString()}`}
                  </p>
                </div>
                <button
                  onClick={() => revokeToken(token.id)}
                  className="text-sm text-red-500 hover:text-red-700"
                >
                  Revoke
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
