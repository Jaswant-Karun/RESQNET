import crypto from "crypto";
import { UserDocument } from "@/types";

export const SESSION_COOKIE_NAME = "resqnet_session";
export const SESSION_MAX_AGE = 60 * 60 * 24; // 24 hours in seconds

const DEFAULT_SECRET = "resqnet-eoc-emergency-command-secret-key-2026";
export const SESSION_SECRET = process.env.SESSION_SECRET || DEFAULT_SECRET;

export interface SessionPayload {
  userId: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  iat: number;
  exp: number;
}

/**
 * Encodes a string or Uint8Array to URL-safe base64
 */
function base64UrlEncode(data: string | Uint8Array): string {
  let base64: string;
  if (typeof data === "string") {
    if (typeof Buffer !== "undefined") {
      base64 = Buffer.from(data, "utf-8").toString("base64");
    } else {
      base64 = btoa(data);
    }
  } else {
    if (typeof Buffer !== "undefined") {
      base64 = Buffer.from(data).toString("base64");
    } else {
      let binary = "";
      const bytes = new Uint8Array(data);
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      base64 = btoa(binary);
    }
  }
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/**
 * Decodes a URL-safe base64 string
 */
function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  if (typeof Buffer !== "undefined") {
    return Buffer.from(base64, "base64").toString("utf-8");
  }
  return atob(base64);
}

/**
 * Signs data using HMAC-SHA256 via Web Crypto API (supported in Node & Edge middleware)
 */
async function signHmac(data: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return base64UrlEncode(new Uint8Array(signature));
}

/**
 * Verifies HMAC-SHA256 signature
 */
async function verifyHmac(data: string, signature: string, secret: string): Promise<boolean> {
  const expectedSignature = await signHmac(data, secret);
  if (expectedSignature.length !== signature.length) return false;
  // Constant time comparison
  let result = 0;
  for (let i = 0; i < signature.length; i++) {
    result |= signature.charCodeAt(i) ^ expectedSignature.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Creates a signed JWT-like session token
 */
export async function createSessionToken(user: {
  userId?: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = {
    userId: user.userId || `usr-${Date.now().toString(36)}`,
    name: user.name,
    email: user.email.toLowerCase(),
    role: user.role,
    avatar: user.avatar,
    iat: now,
    exp: now + SESSION_MAX_AGE,
  };

  const header = { alg: "HS256", typ: "JWT" };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = await signHmac(`${encodedHeader}.${encodedPayload}`, SESSION_SECRET);

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * Verifies and decodes a session token. Returns payload if valid and unexpired, null otherwise.
 */
export async function verifySessionToken(token: string | undefined | null): Promise<SessionPayload | null> {
  if (!token || typeof token !== "string") return null;

  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [encodedHeader, encodedPayload, signature] = parts;
  const isValidSig = await verifyHmac(`${encodedHeader}.${encodedPayload}`, signature, SESSION_SECRET);
  if (!isValidSig) return null;

  try {
    const payloadJson = base64UrlDecode(encodedPayload);
    const payload: SessionPayload = JSON.parse(payloadJson);
    const now = Math.floor(Date.now() / 1000);

    // Check expiration
    if (payload.exp && payload.exp < now) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

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
