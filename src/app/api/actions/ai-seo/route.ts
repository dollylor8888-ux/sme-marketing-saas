/**
 * AI SEO API Route
 * POST /api/actions/ai-seo
 * Auth: Clerk session token passed from client via Authorization header
 */

import { NextRequest, NextResponse } from "next/server";
import { optimizeForSeo, SeoInput } from "@/lib/skills/ai-seo";
import { deductCredits } from "@/lib/billing/credit-system";
import { SkillCreditCost } from "@/lib/billing/models";
import { prisma } from "@/lib/billing/credit-system";

async function verifyClerkToken(token: string): Promise<string | null> {
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

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const clerkId = await verifyClerkToken(token);
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
