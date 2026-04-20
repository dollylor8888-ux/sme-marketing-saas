/**
 * AI SEO API Route
 * POST /api/actions/ai-seo
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { optimizeForSeo, SeoInput } from "@/lib/skills/ai-seo";
import { deductCredits } from "@/lib/billing/credit-system";
import { SkillCreditCost } from "@/lib/billing/models";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: SeoInput = await req.json();
    if (!body.task) {
      return NextResponse.json({ error: "Missing required field: task" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const creditCost = SkillCreditCost["ai-seo"] ?? 15;

    const deduction = await deductCredits(user.id, creditCost, `AI SEO: ${body.task}`);
    if (!deduction.success) {
      return NextResponse.json(
        { error: "Insufficient credits", remaining: deduction.remaining, required: creditCost },
        { status: 402 }
      );
    }

    const result = await optimizeForSeo(body);

    if (!result.output.success) {
      await deductCredits(user.id, -creditCost, `Refund: ${body.task} failed`);
      return NextResponse.json({ error: result.output.error }, { status: 500 });
    }

    if (result.tokenRecord && result.marginRecord) {
      result.tokenRecord.userId = user.id;
      result.marginRecord.userId = user.id;

      await prisma.tokenLog.create({
        data: {
          userId: user.id,
          skill: result.tokenRecord.skill,
          actionType: result.tokenRecord.actionType,
          model: result.tokenRecord.model,
          inputTokens: result.tokenRecord.inputTokens,
          outputTokens: result.tokenRecord.outputTokens,
          inputCostUsd: result.marginRecord.apiCostUsd / 2,
          outputCostUsd: result.marginRecord.apiCostUsd / 2,
          totalCostUsd: result.marginRecord.apiCostUsd,
          userPaidUsd: result.marginRecord.userPaidUsd,
          marginUsd: result.marginRecord.marginUsd,
        },
      });

      await prisma.actionLog.create({
        data: {
          userId: user.id,
          skill: "ai-seo",
          actionType: body.task,
          inputTokens: result.tokenRecord.inputTokens,
          outputTokens: result.tokenRecord.outputTokens,
          creditsUsed: creditCost,
        },
      });
    }

    return NextResponse.json({
      success: true,
      result: result.output.result,
      remaining: deduction.remaining,
    });
  } catch (error) {
    console.error("[ai-seo]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
