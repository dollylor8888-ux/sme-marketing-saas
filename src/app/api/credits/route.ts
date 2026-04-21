/**
 * Credits API Route — User facing
 * GET /api/credits (balance)
 * POST /api/credits (top-up)
 * Auth: Clerk session token from client
 */

import { NextRequest, NextResponse } from "next/server";
import { getCreditBalance, topUpCredits } from "@/lib/billing/credit-system";
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

export async function GET(req: Request) {
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

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const balance = await getCreditBalance(user.id);
    return NextResponse.json({ balance });
  } catch (error) {
    console.error("[credits GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
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

    const { amount, paymentRef } = await req.json();
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // TODO: Verify payment with Stripe before crediting
    // For now, direct credit (MVP)
    const result = await topUpCredits(user.id, amount, paymentRef);

    return NextResponse.json({
      success: result.success,
      newBalance: result.newBalance,
    });
  } catch (error) {
    console.error("[credits POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
