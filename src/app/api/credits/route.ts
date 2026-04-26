/**
 * Credits API Route — User facing
 * GET /api/credits (balance)
 * POST /api/credits (top-up)
 * Auth: Clerk session via auth() from @clerk/nextjs/server
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getCreditBalance } from "@/lib/billing/credit-system";
import { prisma } from "@/lib/billing/credit-system";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const balance = await getCreditBalance(user.id);
    return NextResponse.json({ balance });
  } catch (error) {
    console.error("[credits GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(_req: NextRequest) {
  return NextResponse.json(
    { error: "Credit top-up is temporarily unavailable. Please contact support." },
    { status: 501 }
  );
}
