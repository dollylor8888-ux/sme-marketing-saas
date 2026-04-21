/**
 * Copywriting API Route
 * POST /api/actions/copywriting
 * Auth: Clerk session (handled by auth() from @clerk/nextjs/server)
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { generateCopy, CopywritingInput } from "@/lib/skills/copywriting";
import { prisma, getCreditBalance, deductCredits } from "@/lib/billing/credit-system";

const CREDITS_PER_COPY = 10;

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { type, product, brand, audience, tone, language, extra } = body as CopywritingInput;

    if (!type || !product) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const balance = await getCreditBalance(user.id);
    if (balance < CREDITS_PER_COPY) {
      return NextResponse.json({ error: "Insufficient credits", balance }, { status: 402 });
    }

    const result = await generateCopy({
      type,
      product,
      brand,
      audience,
      tone,
      language,
      extra,
    });

    await deductCredits(user.id, CREDITS_PER_COPY, `Copywriting: ${type}`);
    const newBalance = await getCreditBalance(user.id);

    return NextResponse.json({
      content: result.output?.copy,
      variants: result.output?.variants,
      creditsUsed: CREDITS_PER_COPY,
      newBalance,
    });
  } catch (error) {
    console.error("[copywriting POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
