/**
 * Boss Layout — Protected admin route
 * Requires BOSS_SECRET_KEY header for access
 */

import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const bossKey = req.headers.get("x-boss-key");

  if (bossKey !== process.env.BOSS_SECRET_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/boss(.*)", "/api/boss(.*)"],
};
