/**
 * Boss Margin Summary API — Hidden from users
 * GET /api/boss/margin-summary
 * Requires signed boss headers (x-boss-key, x-boss-timestamp, x-boss-signature)
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/billing/credit-system";
import { verifyBossRequest } from "@/lib/security/boss-auth";

export async function GET(req: NextRequest) {
  const keyFromQuery = req.nextUrl.searchParams.get("key");
  if (keyFromQuery) {
    return NextResponse.json({ error: "Query key is not supported. Use signed headers." }, { status: 400 });
  }

  const bossAuth = verifyBossRequest(req);
  if (!bossAuth.ok) {
    return NextResponse.json({ error: bossAuth.reason }, { status: 401 });
  }

  try {
    // Aggregate all token logs
    const logs = await prisma.tokenLog.findMany({
      orderBy: { createdAt: "desc" },
    });

    // Summary totals
    let totalRevenue = 0;
    let totalCost = 0;
    let totalTokens = 0;
    const bySkill: Record<string, { count: number; revenue: number; cost: number; margin: number }> = {};
    const byDate: Record<string, { revenue: number; cost: number; tokens: number; count: number }> = {};

    for (const log of logs) {
      totalRevenue += Number(log.userPaidUsd);
      totalCost += Number(log.totalCostUsd);
      totalTokens += log.inputTokens + log.outputTokens;

      // By skill
      if (!bySkill[log.skill]) {
        bySkill[log.skill] = { count: 0, revenue: 0, cost: 0, margin: 0 };
      }
      bySkill[log.skill].count++;
      bySkill[log.skill].revenue += Number(log.userPaidUsd);
      bySkill[log.skill].cost += Number(log.totalCostUsd);
      bySkill[log.skill].margin += Number(log.marginUsd);

      // By date
      const dateKey = log.createdAt.toISOString().split("T")[0];
      if (!byDate[dateKey]) {
        byDate[dateKey] = { revenue: 0, cost: 0, tokens: 0, count: 0 };
      }
      byDate[dateKey].revenue += Number(log.userPaidUsd);
      byDate[dateKey].cost += Number(log.totalCostUsd);
      byDate[dateKey].tokens += log.inputTokens + log.outputTokens;
      byDate[dateKey].count++;
    }

    const summary = {
      totalRevenue: Math.round(totalRevenue * 1_000_000) / 1_000_000,
      totalCost: Math.round(totalCost * 1_000_000) / 1_000_000,
      totalMargin: Math.round((totalRevenue - totalCost) * 1_000_000) / 1_000_000,
      totalTokens,
      actionCount: logs.length,
      bySkill,
    };

    const daily = Object.entries(byDate)
      .map(([date, data]) => ({
        date,
        totalRevenue: Math.round(data.revenue * 1_000_000) / 1_000_000,
        totalCost: Math.round(data.cost * 1_000_000) / 1_000_000,
        totalMargin: Math.round((data.revenue - data.cost) * 1_000_000) / 1_000_000,
        totalTokens: data.tokens,
        actionCount: data.count,
      }))
      .sort((a, b) => b.date.localeCompare(a.date));

    return NextResponse.json({ summary, daily });
  } catch (error) {
    console.error("[boss/margin-summary]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
