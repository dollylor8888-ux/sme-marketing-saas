/**
 * Copywriting API Route
 * POST /api/actions/copywriting
 * Auth: Clerk session (handled by auth() from @clerk/nextjs/server)
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { generateCopy, CopywritingInput, FineTuneOptions } from "@/lib/skills/copywriting";
import { prisma, getCreditBalance, deductCredits, ensureCreditAccount } from "@/lib/billing/credit-system";
import { saveGeneration } from "@/lib/memory/memory-service";

const CREDITS_PER_COPY = 10;

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { type, product, brand, audience, tone, language, extra, fineTune, previousOutput } = body as CopywritingInput & { fineTune?: FineTuneOptions; previousOutput?: string };

    if (!type || !product) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Fine-tune mode: previousOutput is required
    if (fineTune && !previousOutput) {
      return NextResponse.json({ error: "previousOutput is required when fine-tuning" }, { status: 400 });
    }

    // Ensure user exists in DB (auto-create on first action)
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
    if (balance < CREDITS_PER_COPY) {
      return NextResponse.json({ error: "Insufficient credits", balance }, { status: 402 });
    }

    // Generate copy (pass userId for memory context)
    const result = await generateCopy(
      { type, product, brand, audience, tone, language, extra, fineTune, previousOutput },
      userId
    );

    // Deduct credits
    await deductCredits(user.id, CREDITS_PER_COPY, `Copywriting: ${type}`);
    const newBalance = await getCreditBalance(user.id);

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
      newBalance,
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
