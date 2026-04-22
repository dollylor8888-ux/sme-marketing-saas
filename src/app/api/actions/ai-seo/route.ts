/**
 * AI SEO API Route
 * POST /api/actions/ai-seo
 * Auth: Clerk session
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { optimizeForSeo, SeoInput } from "@/lib/skills/ai-seo";
import { prisma, getCreditBalance, deductCredits, ensureCreditAccount } from "@/lib/billing/credit-system";
import { saveGeneration } from "@/lib/memory/memory-service";

const CREDITS_PER_SEO = 15;

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { task, content, title, targetKeyword, url, language } = body as SeoInput;

    if (!task) {
      return NextResponse.json({ error: "Missing task parameter" }, { status: 400 });
    }

    // Ensure user exists
    let user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) {
      const { clerkClient } = await import("@clerk/nextjs/server");
      const clerkUser = await (await clerkClient()).users.getUser(userId);
      const email = clerkUser.emailAddresses[0]?.emailAddress ?? "unknown@unknown.com";
      const name = clerkUser.fullName ?? undefined;
      user = await ensureCreditAccount(userId, email, name);
    }

    // Check credits
    const balance = await getCreditBalance(user.id);
    if (balance < CREDITS_PER_SEO) {
      return NextResponse.json({ error: "Insufficient credits", balance }, { status: 402 });
    }

    // Run SEO optimization
    const result = await optimizeForSeo(
      { task, content, title, targetKeyword, url, language },
      userId
    );

    // Deduct credits
    await deductCredits(user.id, CREDITS_PER_SEO, `AI SEO: ${task}`);
    const newBalance = await getCreditBalance(user.id);

    // Save to history
    if (result.output.success && result.output.result) {
      await saveGeneration(userId, {
        skill: "ai-seo",
        actionType: task,
        inputData: { task, content, title, targetKeyword, url, language },
        generatedContent: result.output.result,
        variants: result.output.suggestions ?? [],
      }).catch((e) => console.error("[memory] Failed to save SEO generation:", e));
    }

    const response: Record<string, unknown> = {
      creditsUsed: CREDITS_PER_SEO,
      newBalance,
    };

    if (result.output) {
      response.result = result.output.result;
      response.suggestions = result.output.suggestions;
      response.structured = result.output.structured;
      response.error = result.output.error;
      response.success = result.output.success;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("[ai-seo POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
