import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma, ensureUser } from "@/lib/billing/credit-system";
import { verifyBossRequest } from "@/lib/security/boss-auth";

/**
 * Boss workspace summary (requires Clerk user + workspace ownership + boss HMAC headers)
 */
export async function GET(req: NextRequest) {
  const bossAuth = verifyBossRequest(req);
  if (!bossAuth.ok) {
    return NextResponse.json({ error: bossAuth.reason }, { status: 401 });
  }

  const keyFromQuery = req.nextUrl.searchParams.get("key");
  if (keyFromQuery) {
    return NextResponse.json({ error: "Query key is not supported. Use signed headers." }, { status: 400 });
  }

  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await ensureUser(userId);
    const workspaceId = req.nextUrl.searchParams.get("workspaceId");

    if (!workspaceId) {
      return NextResponse.json({ error: "workspaceId is required" }, { status: 400 });
    }

    const workspace = await prisma.workspace.findFirst({
      where: { id: workspaceId, userId: user.id },
      select: { id: true, name: true },
    });

    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    const [campaigns, products, generations] = await Promise.all([
      prisma.campaign.count({ where: { workspaceId } }),
      prisma.product.count({ where: { workspaceId } }),
      prisma.generationHistory.count({ where: { workspaceId } }),
    ]);

    return NextResponse.json({
      workspace,
      metrics: {
        campaigns,
        products,
        generations,
      },
    });
  } catch (error) {
    console.error("[boss GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
