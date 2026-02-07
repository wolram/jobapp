// Mock prisma before importing token-auth (which imports db.ts)
jest.mock("../lib/db", () => ({
  prisma: {
    userToken: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  },
}));

import { hashToken, generateToken } from "../lib/token-auth";

describe("Token Auth", () => {
  test("generateToken returns string with gmj_ prefix", () => {
    const token = generateToken();
    expect(token.startsWith("gmj_")).toBe(true);
  });

  test("generateToken returns unique tokens", () => {
    const tokens = new Set<string>();
    for (let i = 0; i < 100; i++) {
      tokens.add(generateToken());
    }
    expect(tokens.size).toBe(100);
  });

  test("generateToken returns correct length", () => {
    const token = generateToken();
    // gmj_ prefix (4 chars) + 64 hex chars = 68
    expect(token.length).toBe(68);
  });

  test("hashToken produces consistent hashes", () => {
    const token = "gmj_test123";
    const hash1 = hashToken(token);
    const hash2 = hashToken(token);
    expect(hash1).toBe(hash2);
  });

  test("hashToken produces different hashes for different tokens", () => {
    const hash1 = hashToken("gmj_token1");
    const hash2 = hashToken("gmj_token2");
    expect(hash1).not.toBe(hash2);
  });

  test("hashToken returns 64-char hex string (SHA-256)", () => {
    const hash = hashToken("gmj_test123");
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });
});
