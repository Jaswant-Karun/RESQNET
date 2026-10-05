import crypto from "crypto";
import { UserDocument } from "@/types";

export * from "./token";

/**
 * Cryptographic Password Hashing using PBKDF2 (SHA-512, 100k iterations)
 */
export function hashPassword(password: string): {
  hash: string;
  salt: string;
  algorithm: string;
  iterations: number;
} {
  const salt = crypto.randomBytes(16).toString("hex");
  const iterations = 100000;
  const hash = crypto.pbkdf2Sync(password, salt, iterations, 64, "sha512").toString("hex");
  return {
    hash,
    salt,
    algorithm: "pbkdf2-sha512",
    iterations,
  };
}

/**
 * Verifies password against stored hash & salt
 */
export function verifyPassword(
  providedPassword: string,
  storedHash: string,
  salt?: string,
  algorithm = "pbkdf2-sha512",
  iterations = 100000
): boolean {
  if (!providedPassword || !storedHash) return false;

  try {
    if (algorithm === "pbkdf2-sha512" && salt) {
      const derived = crypto
        .pbkdf2Sync(providedPassword, salt, iterations, 64, "sha512")
        .toString("hex");
      return crypto.timingSafeEqual(Buffer.from(derived, "hex"), Buffer.from(storedHash, "hex"));
    }

    // Fallback: scrypt or simple comparison if salt provided
    if (salt) {
      const derived = crypto.scryptSync(providedPassword, salt, 64).toString("hex");
      if (derived.length === storedHash.length) {
        return crypto.timingSafeEqual(Buffer.from(derived, "hex"), Buffer.from(storedHash, "hex"));
      }
    }
  } catch {
    return false;
  }

  return false;
}

/**
 * Default fallback Commander profile when operating offline or local
 */
export const DEMO_COMMANDER_USER: UserDocument = {
  userId: "usr-cmd-jaswant-01",
  name: "Cmdr Jaswant Karun",
  email: "jaswant@resqnet.gov.in",
  role: "COMMANDER",
  department: "State Disaster Management Authority (SDMA)",
  avatar: "/avatars/commander.png",
  createdAt: "2026-10-01T08:00:00.000Z",
};
