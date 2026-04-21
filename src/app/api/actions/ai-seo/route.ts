/**
 * AI SEO API Route
 * POST /api/actions/ai-seo
 * Auth: Clerk session token from header or cookie
 */

import { NextRequest, NextResponse } from "next/server";
import { optimizeForSeo, SeoInput } from "@/lib/skills/ai-seo";
import { prisma, deductCredits } from "@/lib/billing/credit-system";

const CREDITS_PER_SEO = 10;

async function verifyClerkSession(token: string): Promise<string | null> {
  try {
    const res = await fetch("https://api.clerk.dev/v1/sessions/verify", {
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

    const body: SeoInput = await req.json();
    const { task, content, language, targetKeyword } = body;

    // Get user
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check and deduct credits atomically
    const deduction = await deductCredits(user.id, CREDITS_PER_SEO, `AI SEO: ${task}`);
    if (!deduction.success) {
      return NextResponse.json(
        { error: "Insufficient credits", required: CREDITS_PER_SEO, current: deduction.remaining },
        { status: 402 }
      );
    }

    // Generate SEO content
    const seoResult = await optimizeForSeo({ task, content, language, targetKeyword });

    return NextResponse.json({ result: seoResult.output.result || seoResult });
  } catch (error) {
    console.error("[ai-seo POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
