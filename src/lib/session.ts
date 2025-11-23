import { createHmac, timingSafeEqual } from "crypto";

export const SESSION_COOKIE_NAME = "rb-session";
const SESSION_SECRET = process.env.ROLLBOOK_SESSION_SECRET ?? "dev-session-secret";

function sign(payload: string) {
  return createHmac("sha256", SESSION_SECRET).update(payload).digest("hex");
}

function safeEqual(a: string, b: string) {
  const bufferA = Buffer.from(a, "utf-8");
  const bufferB = Buffer.from(b, "utf-8");
  if (bufferA.length !== bufferB.length) return false;
  return timingSafeEqual(bufferA, bufferB);
}

export interface SessionTokenPayload {
  username: string;
  issuedAt: number;
}

export function createSessionToken(username: string): string {
  const payload = `${username}:${Date.now()}`;
  const signature = sign(payload);
  return `${payload}.${signature}`;
}

export function parseSessionToken(token?: string | null): SessionTokenPayload | null {
  if (!token) {
    return null;
  }
  const [payload, signature] = token.split(".");
  if (!payload || !signature) {
    return null;
  }
  const expected = sign(payload);
  if (!safeEqual(signature, expected)) {
    return null;
  }
  const [username, ts] = payload.split(":");
  if (!username || !ts) {
    return null;
  }
  return { username, issuedAt: Number(ts) };
}

export function isAuthenticatedCookie(cookieValue?: string | null) {
  return parseSessionToken(cookieValue) !== null;
}
