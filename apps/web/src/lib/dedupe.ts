import { createHash } from "crypto";

/**
 * Generate a dedupe key for an opportunity.
 * Uses source + normalized URL as the primary key.
 * Falls back to source + title + company if URL is not unique enough.
 */
export function generateDedupeKey(
  source: string,
  url: string,
  externalId?: string | null
): string {
  // If we have an external ID, prefer it (most stable)
  if (externalId) {
    return hashKey(`${source}:ext:${externalId}`);
  }

  // Normalize URL: remove tracking params, fragments
  const normalized = normalizeUrl(url);
  return hashKey(`${source}:url:${normalized}`);
}

function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    // Remove common tracking params
    const trackingParams = [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_term",
      "utm_content",
      "refId",
      "trackingId",
      "trk",
    ];
    for (const param of trackingParams) {
      parsed.searchParams.delete(param);
    }
    parsed.hash = "";
    return parsed.toString();
  } catch {
    return url;
  }
}

function hashKey(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}
