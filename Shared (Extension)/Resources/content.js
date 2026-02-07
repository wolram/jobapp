/**
 * GoldMedal Jobs - Content Script
 * Parses job listings from LinkedIn and Gupy pages.
 * Runs on pages matching the manifest content_scripts.matches patterns.
 */

// ── Parsers ──

function linkedinParser() {
  const cards = document.querySelectorAll(
    ".jobs-search-results__list-item, .job-card-container, .jobs-search-results-list__list-item"
  );
  const opportunities = [];

  for (const card of cards) {
    try {
      const titleEl =
        card.querySelector(".job-card-list__title, .job-card-container__link") ||
        card.querySelector("a[data-control-name='jobCardTitle']") ||
        card.querySelector("a.job-card-list__title--link");

      const companyEl =
        card.querySelector(".job-card-container__primary-description, .artdeco-entity-lockup__subtitle") ||
        card.querySelector(".job-card-container__company-name");

      const locationEl =
        card.querySelector(".job-card-container__metadata-item, .artdeco-entity-lockup__caption") ||
        card.querySelector(".job-card-container__metadata-wrapper");

      const title = titleEl?.textContent?.trim();
      const company = companyEl?.textContent?.trim();
      const url = titleEl?.closest("a")?.href || titleEl?.href;
      const location = locationEl?.textContent?.trim();

      // Try to get job description snippet if available
      const descEl = card.querySelector(
        ".job-card-list__insight, .job-card-container__footer-item"
      );
      const descriptionSnippet = descEl?.textContent?.trim();

      // Extract external ID from URL
      let externalId = null;
      if (url) {
        const match = url.match(/\/view\/(\d+)/);
        if (match) externalId = match[1];
      }

      if (title && company && url) {
        opportunities.push({
          title,
          company,
          url: url.split("?")[0], // Remove tracking params
          location: location || null,
          description_snippet: descriptionSnippet || null,
          external_id: externalId,
        });
      }
    } catch (e) {
      console.warn("[GoldMedal] Failed to parse LinkedIn card:", e);
    }
  }

  return opportunities;
}

function gupyParser() {
  const cards = document.querySelectorAll(
    "[data-testid='job-card'], .sc-eXNvrr, [class*='JobCard'], a[href*='/job/']"
  );
  const opportunities = [];

  for (const card of cards) {
    try {
      const titleEl =
        card.querySelector("h2, h3, [class*='title'], [data-testid='job-card-title']") ||
        card.querySelector("a > span:first-child");

      const companyEl =
        card.querySelector("[class*='company'], [data-testid='job-card-company']") ||
        card.querySelector("p");

      const locationEl =
        card.querySelector("[class*='location'], [data-testid='job-card-location']");

      const linkEl = card.closest("a") || card.querySelector("a");

      const title = titleEl?.textContent?.trim();
      const company = companyEl?.textContent?.trim();
      const url = linkEl?.href;
      const location = locationEl?.textContent?.trim();

      // Extract external ID from Gupy URL
      let externalId = null;
      if (url) {
        const match = url.match(/\/job\/(\d+)/);
        if (match) externalId = match[1];
      }

      if (title && url) {
        opportunities.push({
          title,
          company: company || "Unknown",
          url,
          location: location || null,
          description_snippet: null,
          external_id: externalId,
        });
      }
    } catch (e) {
      console.warn("[GoldMedal] Failed to parse Gupy card:", e);
    }
  }

  return opportunities;
}

// ── Main ──

function detectSource() {
  const hostname = window.location.hostname;
  if (hostname.includes("linkedin.com")) return "linkedin";
  if (hostname.includes("gupy.io")) return "gupy";
  return null;
}

function collectOpportunities() {
  const source = detectSource();
  if (!source) return [];

  switch (source) {
    case "linkedin":
      return linkedinParser();
    case "gupy":
      return gupyParser();
    default:
      return [];
  }
}

// Listen for messages from background/popup to trigger collection
browser.runtime.onMessage.addListener((request, _sender, _sendResponse) => {
  if (request.action === "collect") {
    const source = detectSource();
    const opportunities = collectOpportunities();
    return Promise.resolve({
      source,
      page_url: window.location.href,
      collected_at: new Date().toISOString(),
      opportunities,
    });
  }
});

// Auto-collect on page load and send to background
(async function autoCollect() {
  // Wait for page to render
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const source = detectSource();
  if (!source) return;

  const opportunities = collectOpportunities();
  if (opportunities.length === 0) return;

  browser.runtime.sendMessage({
    action: "ingest",
    payload: {
      source,
      page_url: window.location.href,
      collected_at: new Date().toISOString(),
      opportunities,
    },
  });
})();

// Observe DOM changes for dynamically loaded content (infinite scroll)
const observer = new MutationObserver(() => {
  const source = detectSource();
  if (!source) return;

  const opportunities = collectOpportunities();
  if (opportunities.length > 0) {
    browser.runtime.sendMessage({
      action: "ingest",
      payload: {
        source,
        page_url: window.location.href,
        collected_at: new Date().toISOString(),
        opportunities,
      },
    });
  }
});

// Start observing after a short delay
setTimeout(() => {
  const target =
    document.querySelector(".jobs-search-results-list") ||
    document.querySelector("[class*='JobList']") ||
    document.body;
  observer.observe(target, { childList: true, subtree: true });
}, 3000);
