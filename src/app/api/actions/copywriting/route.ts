/**
 * Copywriting API Route
 * POST /api/actions/copywriting
 * Auth: Clerk session token from header or cookie
 */

import { NextRequest, NextResponse } from "next/server";
import { generateCopy, CopywritingInput } from "@/lib/skills/copywriting";
import { prisma, getCreditBalance, deductCredits } from "@/lib/billing/credit-system";

const CREDITS_PER_COPY = 10;

async function verifyClerkSession(token: string): Promise<string | null> {
  try {
    const res = await fetch("https://api.clerk.com/v1/sessions/verify", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.user_id || null;
  } catch {
    return null;
  }
}

async function getClerkUserIdFromRequest(req: NextRequest): Promise<string | null> {
  const authHeader = req.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const userId = await verifyClerkSession(token);
    if (userId) return userId;
  }

  const cookies = req.headers.get("Cookie") || "";
  const sessionCookie = cookies.match(/__session=([^;]+)/)?.[1];
  if (sessionCookie) {
    return await verifyClerkSession(sessionCookie);
  }

  return null;
}

export async function POST(req: NextRequest) {
  try {
    const clerkId = await getClerkUserIdFromRequest(req);
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: CopywritingInput = await req.json();
    const { type, product, brand, audience, tone, language, extra } = body;

    // Get user
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check and deduct credits atomically
    const deduction = await deductCredits(user.id, CREDITS_PER_COPY, `Copywriting: ${type}`);
    if (!deduction.success) {
      return NextResponse.json(
        { error: "Insufficient credits", required: CREDITS_PER_COPY, current: deduction.remaining },
        { status: 402 }
      );
    }

    // Generate copy
    const result = await generateCopy({ type, product, brand, audience, tone, language, extra });

    return NextResponse.json({ copy: result.output?.copy || result.output || result });
  } catch (error) {
    console.error("[copywriting POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
