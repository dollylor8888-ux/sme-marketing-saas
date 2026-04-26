/**
 * AI SEO API Route
 * POST /api/actions/ai-seo
 * Auth: Clerk session
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { optimizeForSeo, SeoInput } from "@/lib/skills/ai-seo";
import { prisma, deductCredits, ensureCreditAccount } from "@/lib/billing/credit-system";
import { saveGeneration } from "@/lib/memory/memory-service";

const CREDITS_PER_SEO = 15;

// Idempotency: track recent requests to prevent duplicate processing
const recentRequests = new Map<string, number>();
const IDEMPOTENCY_WINDOW_MS = 30_000;

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Idempotency check
    const idempotencyKey = req.headers.get("x-idempotency-key");
    if (idempotencyKey) {
      const lastSeen = recentRequests.get(idempotencyKey);
      if (lastSeen && Date.now() - lastSeen < IDEMPOTENCY_WINDOW_MS) {
        return NextResponse.json({ error: "Duplicate request", code: "IDEMPOTENT" }, { status: 409 });
      }
      recentRequests.set(idempotencyKey, Date.now());
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
      const clerk = await clerkClient();
      const clerkUser = await clerk.users.getUser(userId);
      const email = clerkUser.emailAddresses[0]?.emailAddress ?? "unknown@unknown.com";
      const name = clerkUser.fullName ?? undefined;
      user = await ensureCreditAccount(userId, email, name);
    }

    // Atomic credit deduction
    const deductResult = await deductCredits(user.id, CREDITS_PER_SEO, `AI SEO: ${task}`);
    if (!deductResult.success) {
      return NextResponse.json({ error: "Insufficient credits", balance: deductResult.remaining }, { status: 402 });
    }

    // Run SEO optimization
    let result: Awaited<ReturnType<typeof optimizeForSeo>>;
    try {
      result = await optimizeForSeo(
        { task, content, title, targetKeyword, url, language },
        userId
      );
    } catch (aiError) {
      throw aiError;
    }

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
      newBalance: deductResult.remaining,
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
