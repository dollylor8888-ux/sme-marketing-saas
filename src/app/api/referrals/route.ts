/**
 * Referrals API Route
 * GET /api/referrals - Get user's referral code and stats
 * POST /api/referrals - Apply a referral code
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma, getOrCreateReferralCode, applyReferralCode, getReferralStats } from "@/lib/billing/credit-system";

export async function GET() {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const stats = await getReferralStats(user.id);
    return NextResponse.json(stats);
  } catch (error) {
    console.error("[referrals GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { referralCode } = body;

    if (!referralCode || typeof referralCode !== "string") {
      return NextResponse.json({ error: "Referral code is required" }, { status: 400 });
    }

    const result = await applyReferralCode(referralCode.trim(), user.id);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid or expired referral code" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      bonusAwarded: result.bonusAwarded,
      message: result.bonusAwarded
        ? "Referral code applied! Your friend got bonus credits, and so did you!"
        : "Referral code applied successfully",
    });
  } catch (error) {
    console.error("[referrals POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
