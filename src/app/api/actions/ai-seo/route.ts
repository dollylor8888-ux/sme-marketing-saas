/**
 * AI SEO API Route
 * POST /api/actions/ai-seo
 * Auth: Clerk session via auth() from @clerk/nextjs/server
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { optimizeForSeo, SeoInput } from "@/lib/skills/ai-seo";
import { prisma, deductCredits, getCreditBalance } from "@/lib/billing/credit-system";

const CREDITS_PER_SEO = 10;

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: SeoInput = await req.json();
    const { task, content, language, targetKeyword } = body;

    // Get user
    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check balance first
    const balance = await getCreditBalance(user.id);
    if (balance < CREDITS_PER_SEO) {
      return NextResponse.json(
        { error: "Insufficient credits", required: CREDITS_PER_SEO, balance },
        { status: 402 }
      );
    }

    // Deduct credits
    const deduction = await deductCredits(user.id, CREDITS_PER_SEO, `AI SEO: ${task}`);
    if (!deduction.success) {
      return NextResponse.json(
        { error: "Insufficient credits", required: CREDITS_PER_SEO, current: deduction.remaining },
        { status: 402 }
      );
    }

    // Generate SEO content
    const seoResult = await optimizeForSeo({ task, content, language, targetKeyword });
    const newBalance = await getCreditBalance(user.id);

    return NextResponse.json({
      result: seoResult.output?.result || seoResult,
      creditsUsed: CREDITS_PER_SEO,
      newBalance,
    });
  } catch (error) {
    console.error("[ai-seo POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
