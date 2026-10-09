export const SESSION_COOKIE_NAME = "resqnet_session";
export const SESSION_MAX_AGE = 60 * 60 * 24; // 24 hours

const configuredSecret = process.env.SESSION_SECRET?.trim();
const developmentSecret = crypto.randomBytes(32).toString("hex");

function getSessionSecret(): string {
  if (configuredSecret) return configuredSecret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET must be configured in production.");
  }
  return developmentSecret;
}

export interface SessionPayload {
  userId: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  iat: number;
  exp: number;
}

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

async function verifyHmac(data: string, signature: string, secret: string): Promise<boolean> {
  const expectedSignature = await signHmac(data, secret);
  if (expectedSignature.length !== signature.length) return false;
  let result = 0;
  for (let i = 0; i < signature.length; i++) {
    result |= signature.charCodeAt(i) ^ expectedSignature.charCodeAt(i);
  }
  return result === 0;
}

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
  const signature = await signHmac(
    `${encodedHeader}.${encodedPayload}`,
    getSessionSecret()
  );

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export async function verifySessionToken(token: string | undefined | null): Promise<SessionPayload | null> {
  if (!token || typeof token !== "string") return null;

  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [encodedHeader, encodedPayload, signature] = parts;
  let isValidSig = false;
  try {
    isValidSig = await verifyHmac(
      `${encodedHeader}.${encodedPayload}`,
      signature,
      getSessionSecret()
    );
  } catch {
    return null;
  }
  if (!isValidSig) return null;

  try {
    const payloadJson = base64UrlDecode(encodedPayload);
    const payload: SessionPayload = JSON.parse(payloadJson);
    const now = Math.floor(Date.now() / 1000);

    if (payload.exp && payload.exp < now) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
