import { createHmac, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";

const BOSS_TTL_MS = 5 * 60 * 1000;

function safeEqual(left: string, right: string): boolean {
  const l = Buffer.from(left);
  const r = Buffer.from(right);
  if (l.length !== r.length) return false;
  return timingSafeEqual(l, r);
}

export function signBossRequest(timestamp: string, method: string, path: string, secret: string): string {
  const payload = `${timestamp}.${method.toUpperCase()}.${path}`;
  return createHmac("sha256", secret).update(payload).digest("hex");
}

export function verifyBossRequest(req: NextRequest): { ok: true } | { ok: false; reason: string } {
  const configuredKey = process.env.BOSS_SECRET_KEY;
  const hmacSecret = process.env.BOSS_HMAC_SECRET || process.env.BOSS_SECRET_KEY;

  if (!hmacSecret) {
    return { ok: false, reason: "Boss auth not configured" };
  }

  const bossKey = req.headers.get("x-boss-key");
  if (configuredKey && bossKey !== configuredKey) {
    return { ok: false, reason: "Invalid boss key" };
  }

  const timestamp = req.headers.get("x-boss-timestamp");
  const signature = req.headers.get("x-boss-signature");
  if (!timestamp || !signature) {
    return { ok: false, reason: "Missing boss signature headers" };
  }

  const ts = Number(timestamp);
  if (!Number.isFinite(ts)) {
    return { ok: false, reason: "Invalid timestamp" };
  }

  if (Math.abs(Date.now() - ts) > BOSS_TTL_MS) {
    return { ok: false, reason: "Expired signature" };
  }

  const expected = signBossRequest(timestamp, req.method, req.nextUrl.pathname, hmacSecret);
  if (!safeEqual(expected, signature)) {
    return { ok: false, reason: "Invalid signature" };
  }

  return { ok: true };
}
