/**
 * Campaigns API
 * GET /api/campaigns - List campaigns (with workspace filter)
 * POST /api/campaigns - Create new campaign
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma, ensureUser } from "@/lib/billing/credit-system";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await ensureUser(userId);
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspaceId");
    const productId = searchParams.get("productId");

    const where: Record<string, unknown> = {};
    if (workspaceId) where.workspaceId = workspaceId;
    if (productId) where.productId = productId;

    const campaigns = await prisma.campaign.findMany({
      where,
      include: {
        product: true,
        adSets: {
          include: {
            ads: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ campaigns });
  } catch (error) {
    console.error("[campaigns GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await ensureUser(userId);
    const body = await req.json();
    const { workspaceId, productId, name, platform, objective, totalBudget, adSets } = body;

    if (!workspaceId || !name) {
      return NextResponse.json({ error: "workspaceId and name are required" }, { status: 400 });
    }

    // Verify workspace ownership
    const workspace = await prisma.workspace.findFirst({
      where: { id: workspaceId, userId: user.id },
    });
    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    const campaign = await prisma.campaign.create({
      data: {
        workspaceId,
        productId,
        name,
        platform: platform || "facebook",
        objective: objective || "sales",
        totalBudget,
        adSets: adSets ? {
          create: adSets.map((adset: { name: string; audienceDesc?: string; budget?: number; budgetPercent?: number; ads?: { name: string; assetName?: string; assetType?: string }[] }) => ({
            name: adset.name,
            audienceDesc: adset.audienceDesc,
            budget: adset.budget,
            budgetPercent: adset.budgetPercent,
            ads: adset.ads ? {
              create: adset.ads.map((ad: { name: string; assetName?: string; assetType?: string }) => ({
                name: ad.name,
                assetName: ad.assetName,
                assetType: ad.assetType,
              })),
            } : undefined,
          })),
        } : undefined,
      },
      include: {
        product: true,
        adSets: {
          include: {
            ads: true,
          },
        },
      },
    });

    return NextResponse.json({ campaign });
  } catch (error) {
    console.error("[campaigns POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
