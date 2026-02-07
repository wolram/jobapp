/**
 * GoldMedal Jobs - Background Script
 * Manages the ingest queue with retry logic and sends batches to the API.
 */

// ── Configuration ──
const DEFAULT_API_URL = "http://localhost:3000";
const INGEST_ENDPOINT = "/api/v1/extension/ingest";
const MAX_RETRIES = 3;
const RETRY_DELAYS = [2000, 4000, 8000]; // Exponential backoff

// ── In-memory queue ──
let ingestQueue = [];
let isProcessing = false;
let lastSyncTime = null;
let syncStats = { total: 0, success: 0, failed: 0 };

// ── Storage helpers ──
async function getConfig() {
  const result = await browser.storage.local.get(["apiUrl", "token"]);
  return {
    apiUrl: result.apiUrl || DEFAULT_API_URL,
    token: result.token || null,
  };
}

async function saveConfig(config) {
  await browser.storage.local.set(config);
}

// ── API calls ──
async function sendIngestBatch(payload, retryCount = 0) {
  const config = await getConfig();
  if (!config.token) {
    console.warn("[GoldMedal] No token configured, skipping ingest");
    return { success: false, error: "No token" };
  }

  try {
    const response = await fetch(`${config.apiUrl}${INGEST_ENDPOINT}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.token}`,
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const data = await response.json();
      syncStats.success += data.inserted + data.updated;
      syncStats.total += payload.opportunities.length;
      lastSyncTime = new Date().toISOString();
      return { success: true, data };
    }

    if (response.status === 401) {
      return { success: false, error: "Invalid or revoked token" };
    }

    throw new Error(`HTTP ${response.status}`);
  } catch (error) {
    if (retryCount < MAX_RETRIES) {
      const delay = RETRY_DELAYS[retryCount] || 8000;
      console.log(
        `[GoldMedal] Retry ${retryCount + 1}/${MAX_RETRIES} in ${delay}ms`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
      return sendIngestBatch(payload, retryCount + 1);
    }

    syncStats.failed += payload.opportunities.length;
    syncStats.total += payload.opportunities.length;
    return { success: false, error: error.message };
  }
}

// ── Queue processing ──
async function processQueue() {
  if (isProcessing || ingestQueue.length === 0) return;
  isProcessing = true;

  // Deduplicate by URL before sending
  const seen = new Set();
  const unique = [];
  for (const item of ingestQueue) {
    const key = `${item.source}:${item.url}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(item);
    }
  }
  ingestQueue = [];

  // Group by source
  const bySource = {};
  for (const item of unique) {
    if (!bySource[item.source]) {
      bySource[item.source] = {
        source: item.source,
        page_url: item.page_url,
        collected_at: item.collected_at,
        opportunities: [],
      };
    }
    bySource[item.source].opportunities.push({
      title: item.title,
      company: item.company,
      url: item.url,
      location: item.location,
      description_snippet: item.description_snippet,
      external_id: item.external_id,
    });
  }

  // Send each batch
  for (const payload of Object.values(bySource)) {
    // Split into chunks of 50
    const opportunities = payload.opportunities;
    for (let i = 0; i < opportunities.length; i += 50) {
      const chunk = opportunities.slice(i, i + 50);
      await sendIngestBatch({
        ...payload,
        opportunities: chunk,
      });
    }
  }

  isProcessing = false;
}

// ── Message handling ──
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Ingest from content script
  if (request.action === "ingest" && request.payload) {
    const { source, page_url, collected_at, opportunities } = request.payload;
    for (const opp of opportunities) {
      ingestQueue.push({
        ...opp,
        source,
        page_url,
        collected_at,
      });
    }
    // Debounce processing
    setTimeout(processQueue, 1000);
    return Promise.resolve({ queued: opportunities.length });
  }

  // Manual sync from popup
  if (request.action === "syncNow") {
    processQueue();
    return Promise.resolve({ status: "processing" });
  }

  // Get status for popup
  if (request.action === "getStatus") {
    return getConfig().then((config) => ({
      connected: !!config.token,
      apiUrl: config.apiUrl,
      lastSync: lastSyncTime,
      stats: { ...syncStats },
      queueSize: ingestQueue.length,
    }));
  }

  // Save config from popup
  if (request.action === "saveConfig") {
    return saveConfig(request.config).then(() => ({ saved: true }));
  }

  // Trigger collection on active tab
  if (request.action === "collectFromTab") {
    return browser.tabs
      .query({ active: true, currentWindow: true })
      .then((tabs) => {
        if (tabs[0]?.id) {
          return browser.tabs.sendMessage(tabs[0].id, { action: "collect" });
        }
        return { opportunities: [] };
      });
  }
});

// Process queue periodically (every 30 seconds)
setInterval(processQueue, 30000);
