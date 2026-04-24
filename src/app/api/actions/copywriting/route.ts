/**
 * Copywriting API Route
 * POST /api/actions/copywriting
 * Auth: Clerk session (handled by auth() from @clerk/nextjs/server)
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { generateCopy, CopywritingInput } from "@/lib/skills/copywriting";
import { prisma, deductCredits, ensureCreditAccount, refundCredits } from "@/lib/billing/credit-system";
import { saveGeneration } from "@/lib/memory/memory-service";

const CREDITS_PER_COPY = 10;

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
    const { type, product, brand, audience, tone, language, extra } = body as CopywritingInput;

    if (!type || !product) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Ensure user exists in DB (auto-create on first action)
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
    const deductResult = await deductCredits(user.id, CREDITS_PER_COPY, `Copywriting: ${type}`);
    if (!deductResult.success) {
      return NextResponse.json({ error: "Insufficient credits", balance: deductResult.remaining }, { status: 402 });
    }

    // Generate copy (pass userId for memory context)
    let result: Awaited<ReturnType<typeof generateCopy>>;
    try {
      result = await generateCopy(
        { type, product, brand, audience, tone, language, extra },
        userId
      );
    } catch (aiError) {
      // Refund credits on AI failure
      await refundCredits(user.id, CREDITS_PER_COPY, `REFUND: Copywriting failed — ${type}`);
      throw aiError;
    }

    // Save to generation history (memory)
    if (result.output.success && result.output.copy) {
      await saveGeneration(userId, {
        skill: "copywriting",
        actionType: type,
        inputData: { type, product, brand, audience, tone, language, extra },
        generatedContent: result.output.copy,
        variants: result.output.variants,
      }).catch((e) => console.error("[memory] Failed to save generation:", e));
    }

    // Build response
    const response: Record<string, unknown> = {
      creditsUsed: CREDITS_PER_COPY,
      newBalance: deductResult.remaining,
    };

    if (result.output) {
      response.content = result.output.copy;
      response.variants = result.output.variants;
      response.structured = result.output.structured;
      response.error = result.output.error;
      response.success = result.output.success;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("[copywriting POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
