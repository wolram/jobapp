/**
 * GoldMedal Jobs - Popup Script
 * Manages the extension popup UI: connection setup, status display, sync controls.
 */

const DEFAULT_API_URL = "http://localhost:3000";

// ── DOM elements ──
const setupSection = document.getElementById("setup");
const statusSection = document.getElementById("status");
const tokenInput = document.getElementById("tokenInput");
const apiUrlInput = document.getElementById("apiUrlInput");
const connectBtn = document.getElementById("connectBtn");
const connectError = document.getElementById("connectError");
const lastSyncEl = document.getElementById("lastSync");
const syncCountEl = document.getElementById("syncCount");
const queueSizeEl = document.getElementById("queueSize");
const syncBtn = document.getElementById("syncBtn");
const collectBtn = document.getElementById("collectBtn");
const disconnectBtn = document.getElementById("disconnectBtn");
const dashboardLink = document.getElementById("dashboardLink");

// ── State ──
function showSetup() {
  setupSection.style.display = "block";
  statusSection.style.display = "none";
}

function showStatus() {
  setupSection.style.display = "none";
  statusSection.style.display = "block";
}

function showError(msg) {
  connectError.textContent = msg;
  connectError.style.display = "block";
}

function hideError() {
  connectError.style.display = "none";
}

// ── Initialize ──
async function init() {
  const response = await browser.runtime.sendMessage({ action: "getStatus" });

  dashboardLink.href = response.apiUrl || DEFAULT_API_URL;

  if (response.connected) {
    showStatus();
    updateStatusDisplay(response);
  } else {
    showSetup();
  }
}

function updateStatusDisplay(status) {
  lastSyncEl.textContent = status.lastSync
    ? new Date(status.lastSync).toLocaleTimeString()
    : "Never";
  syncCountEl.textContent = status.stats?.success ?? 0;
  queueSizeEl.textContent = status.queueSize ?? 0;
}

// ── Event handlers ──
connectBtn.addEventListener("click", async () => {
  hideError();
  const token = tokenInput.value.trim();
  const apiUrl = apiUrlInput.value.trim() || DEFAULT_API_URL;

  if (!token) {
    showError("Please enter a token");
    return;
  }

  if (!token.startsWith("gmj_")) {
    showError("Invalid token format. Tokens start with 'gmj_'");
    return;
  }

  connectBtn.textContent = "Connecting...";
  connectBtn.disabled = true;

  try {
    // Save config
    await browser.runtime.sendMessage({
      action: "saveConfig",
      config: { token, apiUrl },
    });

    // Verify by getting status
    const status = await browser.runtime.sendMessage({ action: "getStatus" });
    dashboardLink.href = apiUrl;
    showStatus();
    updateStatusDisplay(status);
  } catch (err) {
    showError("Failed to connect: " + err.message);
  } finally {
    connectBtn.textContent = "Connect";
    connectBtn.disabled = false;
  }
});

syncBtn.addEventListener("click", async () => {
  syncBtn.textContent = "Syncing...";
  syncBtn.disabled = true;

  await browser.runtime.sendMessage({ action: "syncNow" });

  // Wait a moment, then refresh status
  setTimeout(async () => {
    const status = await browser.runtime.sendMessage({ action: "getStatus" });
    updateStatusDisplay(status);
    syncBtn.textContent = "Sync Now";
    syncBtn.disabled = false;
  }, 2000);
});

collectBtn.addEventListener("click", async () => {
  collectBtn.textContent = "Collecting...";
  collectBtn.disabled = true;

  try {
    const result = await browser.runtime.sendMessage({
      action: "collectFromTab",
    });
    const count = result?.opportunities?.length ?? 0;
    collectBtn.textContent = `Collected ${count}`;
  } catch {
    collectBtn.textContent = "No jobs found";
  }

  setTimeout(() => {
    collectBtn.textContent = "Collect Page";
    collectBtn.disabled = false;
  }, 2000);
});

disconnectBtn.addEventListener("click", async () => {
  await browser.runtime.sendMessage({
    action: "saveConfig",
    config: { token: "", apiUrl: DEFAULT_API_URL },
  });
  tokenInput.value = "";
  apiUrlInput.value = "";
  showSetup();
});

// Initialize on load
init();
