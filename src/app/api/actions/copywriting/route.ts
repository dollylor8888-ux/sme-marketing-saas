/**
 * Copywriting API Route
 * POST /api/actions/copywriting
 * Auth: Clerk session (handled by auth() from @clerk/nextjs/server)
 */

import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { generateCopy, CopywritingInput } from "@/lib/skills/copywriting";
import { prisma, getCreditBalance, deductCredits, ensureCreditAccount } from "@/lib/billing/credit-system";

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

    let user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) {
      // Auto-create user + credit account on first action
      const clerkUser = await (await clerkClient()).users.getUser(userId);
      const email = clerkUser.emailAddresses[0]?.emailAddress ?? "unknown@unknown.com";
      const name = clerkUser.fullName ?? undefined;
      user = await ensureCreditAccount(userId, email, name);
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

    console.log("[DEBUG copywriting] result:", JSON.stringify(result));

    // Always deduct credits even if generateCopy "succeeds" but returns no content
    await deductCredits(user.id, CREDITS_PER_COPY, `Copywriting: ${type}`);
    const newBalance = await getCreditBalance(user.id);

    const response: Record<string, unknown> = {
      creditsUsed: CREDITS_PER_COPY,
      newBalance,
    };
    if (result.output) {
      response.content = result.output.copy;
      response.variants = result.output.variants;
      response.error = result.output.error;
      response.success = result.output.success;
    }
    if (result.tokenRecord) {
      response._debug = { tokens: result.tokenRecord, margin: result.marginRecord };
    }
    return NextResponse.json(response);
  } catch (error) {
    console.error("[copywriting POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
