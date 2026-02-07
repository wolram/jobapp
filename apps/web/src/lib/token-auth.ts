import { createHash } from "crypto";
import { prisma } from "./db";

/**
 * Hash a PAT for storage. We use SHA-256 so we never store the plain token.
 */
export function hashToken(plain: string): string {
  return createHash("sha256").update(plain).digest("hex");
}

/**
 * Generate a new random PAT with prefix for easy identification.
 */
export function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `gmj_${hex}`;
}

/**
 * Validate a Bearer PAT from the Authorization header.
 * Returns the user ID if valid, null otherwise.
 */
export async function validateBearerToken(
  authHeader: string | null
): Promise<string | null> {
  if (!authHeader?.startsWith("Bearer ")) return null;

  const plain = authHeader.slice(7);
  const hash = hashToken(plain);

  const token = await prisma.userToken.findFirst({
    where: {
      tokenHash: hash,
      revokedAt: null,
    },
  });

  if (!token) return null;

  // Update last used timestamp (fire and forget)
  prisma.userToken
    .update({
      where: { id: token.id },
      data: { lastUsedAt: new Date() },
    })
    .catch(() => {});

  return token.userId;
}
