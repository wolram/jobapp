import { generateDedupeKey } from "../lib/dedupe";

describe("Deduplication", () => {
  test("same URL produces same dedupe key", () => {
    const key1 = generateDedupeKey(
      "linkedin",
      "https://linkedin.com/jobs/view/12345"
    );
    const key2 = generateDedupeKey(
      "linkedin",
      "https://linkedin.com/jobs/view/12345"
    );
    expect(key1).toBe(key2);
  });

  test("different URLs produce different keys", () => {
    const key1 = generateDedupeKey(
      "linkedin",
      "https://linkedin.com/jobs/view/12345"
    );
    const key2 = generateDedupeKey(
      "linkedin",
      "https://linkedin.com/jobs/view/67890"
    );
    expect(key1).not.toBe(key2);
  });

  test("different sources with same URL produce different keys", () => {
    const key1 = generateDedupeKey(
      "linkedin",
      "https://example.com/job/123"
    );
    const key2 = generateDedupeKey("gupy", "https://example.com/job/123");
    expect(key1).not.toBe(key2);
  });

  test("tracking params are stripped", () => {
    const key1 = generateDedupeKey(
      "linkedin",
      "https://linkedin.com/jobs/view/12345"
    );
    const key2 = generateDedupeKey(
      "linkedin",
      "https://linkedin.com/jobs/view/12345?utm_source=google&trk=abc"
    );
    expect(key1).toBe(key2);
  });

  test("fragments are stripped", () => {
    const key1 = generateDedupeKey(
      "linkedin",
      "https://linkedin.com/jobs/view/12345"
    );
    const key2 = generateDedupeKey(
      "linkedin",
      "https://linkedin.com/jobs/view/12345#details"
    );
    expect(key1).toBe(key2);
  });

  test("external ID takes priority over URL", () => {
    const key1 = generateDedupeKey(
      "linkedin",
      "https://linkedin.com/jobs/view/12345",
      "ext-123"
    );
    const key2 = generateDedupeKey(
      "linkedin",
      "https://linkedin.com/jobs/view/different",
      "ext-123"
    );
    expect(key1).toBe(key2);
  });

  test("key is a valid hex string", () => {
    const key = generateDedupeKey(
      "linkedin",
      "https://linkedin.com/jobs/view/12345"
    );
    expect(key).toMatch(/^[a-f0-9]{64}$/);
  });
});
