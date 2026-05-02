/**
 * Copywriting API Route
 * POST /api/actions/copywriting
 * Auth: Clerk session
 * 
 * Credit Flow: Auth → Check credits → Generate → Validate JSON → 
 *              Success → Deduct credits → Save
 *              Fail → No deduction → Return error
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { generateCopy, getCopyType } from "@/lib/skills/copywriting/generate";
import { prisma, getCreditBalance, deductCredits, ensureCreditAccount } from "@/lib/billing/credit-system";
import { saveGeneration } from "@/lib/memory/memory-service";

export async function POST(req: NextRequest) {
  try {
    // 1. Auth check
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { type, product, brand, audience, tone, language, extra, fineTune, previousOutput } = body;

    // 2. Validate input
    if (!type || !product) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 3. Get copy type definition for credit cost
    const copyType = getCopyType(type);
    if (!copyType) {
      return NextResponse.json(
        { error: `Unknown copy type: ${type}` },
        { status: 400 }
      );
    }

    const creditsCost = copyType.credits;

    // 4. Ensure user exists in DB
    let user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) {
      const { clerkClient } = await import("@clerk/nextjs/server");
      const clerkUser = await (await clerkClient()).users.getUser(userId);
      const email = clerkUser.emailAddresses[0]?.emailAddress ?? "unknown@unknown.com";
      const name = clerkUser.fullName ?? undefined;
      user = await ensureCreditAccount(userId, email, name);
    }

    // 5. Check credits (before generation)
    const balance = await getCreditBalance(user.id);
    if (balance < creditsCost) {
      return NextResponse.json(
        { error: "Insufficient credits", balance, required: creditsCost },
        { status: 402 }
      );
    }

    // 6. Generate copy (NO credit deduction yet)
    const result = await generateCopy(
      { type, product, brand, audience, tone, language, extra, fineTune, previousOutput },
      userId
    );

    // 7. If generation failed, return error WITHOUT deduction
    if (!result.success || !result.copy) {
      return NextResponse.json(
        {
          error: result.error || "Generation failed",
          success: false,
          creditsUsed: 0
        },
        { status: 422 }
      );
    }

    // 8. ✅ Generation SUCCESS - now deduct credits
    const deductResult = await deductCredits(user.id, creditsCost, `Copywriting: ${type}`);
    if (!deductResult.success) {
      // Edge case: credits deducted elsewhere between check and now
      return NextResponse.json(
        { error: "Insufficient credits", balance: deductResult.remaining },
        { status: 402 }
      );
    }

    const newBalance = deductResult.remaining ?? (await getCreditBalance(user.id));

    // 9. Save to generation history (after successful generation)
    await saveGeneration(userId, {
      skill: "copywriting",
      actionType: type,
      inputData: { type, product, brand, audience, tone, language, extra },
      generatedContent: result.copy,
      variants: result.variants,
    }).catch((e) => console.error("[memory] Failed to save generation:", e));

    // 10. Return success response
    return NextResponse.json({
      success: true,
      copy: result.copy,
      variants: result.variants,
      reasoning: result.reasoning,
      scores: result.scores,
      creditsUsed: creditsCost,
      newBalance,
      copyType: {
        id: copyType.id,
        name: copyType.name,
        category: copyType.category
      }
    });

  } catch (error) {
    console.error("[copywriting POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
