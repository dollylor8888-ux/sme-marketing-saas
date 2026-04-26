/**
 * Campaign Performance Upload API
 * POST /api/campaigns/performance - Upload CSV and parse performance data
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma, ensureUser } from "@/lib/billing/credit-system";

interface AdSetRanking {
  name: string;
  roas: number;
  conversions: number;
  spend: number;
  ctr: number;
}

interface AssetRanking {
  name: string;
  ctr: number;
  conversions: number;
  spend: number;
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await ensureUser(userId);
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const workspaceId = formData.get("workspaceId") as string;

    if (!file || !workspaceId) {
      return NextResponse.json({ error: "File and workspaceId are required" }, { status: 400 });
    }

    // Verify workspace ownership
    const workspace = await prisma.workspace.findFirst({
      where: { id: workspaceId, userId: user.id },
    });
    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    // Parse CSV
    const text = await file.text();
    const lines = text.split("\n").filter(line => line.trim());
    
    if (lines.length < 2) {
      return NextResponse.json({ error: "CSV must have at least a header and one data row" }, { status: 400 });
    }

    // Parse header
    const headers = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/"/g, ""));
    
    // Find column indices
    const findIdx = (patterns: string[]) => {
      for (const p of patterns) {
        const idx = headers.findIndex(h => h.includes(p));
        if (idx !== -1) return idx;
      }
      return -1;
    };

    const idx = {
      date: findIdx(["date", "day"]),
      campaign: findIdx(["campaign", "campaign_name"]),
      adset: findIdx(["adset", "adset_name", "ad set", "audience"]),
      ad: findIdx(["ad", "ad_name", "ad name"]),
      asset: findIdx(["asset", "asset_name", "creative", "素材"]),
      impressions: findIdx(["impression", "impr"]),
      clicks: findIdx(["click"]),
      ctr: findIdx(["ctr", "click rate"]),
      cpc: findIdx(["cpc", "cost per click"]),
      spend: findIdx(["spend", "cost", "amount"]),
      conversions: findIdx(["conversion", "conv", "purchase", "complete registration"]),
      revenue: findIdx(["revenue", "sales", "return"]),
      roas: findIdx(["roas"]),
      reach: findIdx(["reach"]),
      frequency: findIdx(["frequency", "freq"]),
      videoViews: findIdx(["video view", "video_view", "video views"]),
    };

    // Parse data rows
    const performances: {
      campaignName: string;
      adsetName: string;
      adName: string;
      assetName: string | null;
      impressions: number;
      clicks: number;
      ctr: number | null;
      cpc: number | null;
      spend: number;
      conversions: number;
      revenue: number | null;
      roas: number | null;
    }[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      if (values.length < 4) continue;

      const getVal = (index: number, defaultVal: string | number = ""): string | number => {
        if (index === -1 || index >= values.length) return defaultVal;
        const v = values[index]?.trim().replace(/"/g, "");
        if (!v || v === "-" || v === "") return defaultVal;
        if (typeof defaultVal === "number") {
          const num = parseFloat(v.replace(/[^0-9.]/g, ""));
          return isNaN(num) ? defaultVal : num;
        }
        return v;
      };

      const campaignName = String(getVal(idx.campaign, "Unknown Campaign"));
      const adsetName = String(getVal(idx.adset, "Unknown AdSet"));
      const adName = String(getVal(idx.ad, "Unknown Ad"));

      if (campaignName === "Unknown Campaign") continue;

      performances.push({
        campaignName,
        adsetName,
        adName,
        assetName: idx.asset !== -1 ? String(getVal(idx.asset)) : null,
        impressions: Number(getVal(idx.impressions, 0)),
        clicks: Number(getVal(idx.clicks, 0)),
        ctr: idx.ctr !== -1 ? Number(getVal(idx.ctr)) : null,
        cpc: idx.cpc !== -1 ? Number(getVal(idx.cpc)) : null,
        spend: Number(getVal(idx.spend, 0)),
        conversions: Number(getVal(idx.conversions, 0)),
        revenue: idx.revenue !== -1 ? Number(getVal(idx.revenue)) : null,
        roas: idx.roas !== -1 ? Number(getVal(idx.roas)) : null,
      });
    }

    // Insert into database
    const inserted = await prisma.campaignPerformance.createMany({
      data: performances.map(p => ({
        workspaceId,
        date: new Date(),
        campaignName: p.campaignName,
        adsetName: p.adsetName,
        adName: p.adName,
        assetName: p.assetName,
        impressions: p.impressions,
        clicks: p.clicks,
        ctr: p.ctr,
        cpc: p.cpc,
        spend: p.spend,
        conversions: p.conversions,
        revenue: p.revenue,
        roas: p.roas,
      })),
    });

    // Generate AI analysis
    const analysis = await generateAnalysis(performances);

    return NextResponse.json({
      success: true,
      rowsImported: inserted.count,
      analysis,
    });
  } catch (error) {
    console.error("[campaigns/performance POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Parse CSV line handling quotes
function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  values.push(current);
  return values;
}

// Generate AI analysis of the performance data
async function generateAnalysis(performances: {
  campaignName: string;
  adsetName: string;
  adName: string;
  assetName: string | null;
  impressions: number;
  clicks: number;
  spend: number;
  conversions: number;
}[]) {
  // Aggregate by AdSet (audience)
  const byAdSet: Record<string, { spend: number; conversions: number; impressions: number; clicks: number }> = {};
  // Aggregate by Asset
  const byAsset: Record<string, { spend: number; conversions: number; impressions: number; clicks: number; adName: string }> = {};
  // Aggregate by Campaign
  const byCampaign: Record<string, { spend: number; conversions: number; impressions: number; clicks: number }> = {};

  let totalSpend = 0;
  let totalConversions = 0;

  for (const p of performances) {
    // By AdSet
    if (!byAdSet[p.adsetName]) byAdSet[p.adsetName] = { spend: 0, conversions: 0, impressions: 0, clicks: 0 };
    byAdSet[p.adsetName].spend += p.spend;
    byAdSet[p.adsetName].conversions += p.conversions;
    byAdSet[p.adsetName].impressions += p.impressions;
    byAdSet[p.adsetName].clicks += p.clicks;

    // By Asset
    const assetKey = p.assetName || p.adName;
    if (!byAsset[assetKey]) byAsset[assetKey] = { spend: 0, conversions: 0, impressions: 0, clicks: 0, adName: p.adName };
    byAsset[assetKey].spend += p.spend;
    byAsset[assetKey].conversions += p.conversions;
    byAsset[assetKey].impressions += p.impressions;
    byAsset[assetKey].clicks += p.clicks;

    // By Campaign
    if (!byCampaign[p.campaignName]) byCampaign[p.campaignName] = { spend: 0, conversions: 0, impressions: 0, clicks: 0 };
    byCampaign[p.campaignName].spend += p.spend;
    byCampaign[p.campaignName].conversions += p.conversions;
    byCampaign[p.campaignName].impressions += p.impressions;
    byCampaign[p.campaignName].clicks += p.clicks;

    totalSpend += p.spend;
    totalConversions += p.conversions;
  }

  // Calculate ROAS for each
  const calcROAS = (conv: number, spend: number) => spend > 0 ? (conv / spend) : 0;

  // Rank AdSets by ROAS
  const adsetRanking = Object.entries(byAdSet)
    .map(([name, data]) => ({
      name,
      roas: calcROAS(data.conversions, data.spend),
      conversions: data.conversions,
      spend: data.spend,
      ctr: data.impressions > 0 ? (data.clicks / data.impressions * 100) : 0,
    }))
    .sort((a, b) => b.roas - a.roas);

  // Rank Assets by CTR
  const assetRanking = Object.entries(byAsset)
    .map(([name, data]) => ({
      name,
      ctr: data.impressions > 0 ? (data.clicks / data.impressions * 100) : 0,
      conversions: data.conversions,
      spend: data.spend,
      adName: data.adName,
    }))
    .sort((a, b) => b.ctr - a.ctr);

  return {
    summary: {
      totalSpend,
      totalConversions,
      avgROAS: totalSpend > 0 ? (totalConversions / totalSpend) : 0,
      totalAdSets: Object.keys(byAdSet).length,
      totalAssets: Object.keys(byAsset).length,
      totalCampaigns: Object.keys(byCampaign).length,
    },
    topAdSets: adsetRanking.slice(0, 5),
    topAssets: assetRanking.slice(0, 5),
    insights: generateInsights(adsetRanking, assetRanking),
    recommendations: generateRecommendations(adsetRanking, assetRanking),
  };
}

function generateInsights(adsetRanking: AdSetRanking[], assetRanking: AssetRanking[]) {
  const insights = [];
  
  if (adsetRanking.length > 0) {
    const best = adsetRanking[0];
    const worst = adsetRanking[adsetRanking.length - 1];
    
    if (best.roas > 0) {
      insights.push({
        type: "winning_audience",
        content: `受眾「${best.name}」表現最佳，ROAS 達 ${best.roas.toFixed(2)}x`,
        confidence: 0.9,
      });
    }
    
    if (worst.roas < best.roas * 0.5 && worst.spend > 0) {
      insights.push({
        type: "underperforming_audience",
        content: `受眾「${worst.name}」表現較差，建議降低預算或優化`,
        confidence: 0.8,
      });
    }
  }

  if (assetRanking.length > 0) {
    const bestAsset = assetRanking[0];
    if (bestAsset.ctr > 2) {
      insights.push({
        type: "winning_creative",
        content: `素材「${bestAsset.name}」CTR 達 ${bestAsset.ctr.toFixed(2)}%，點擊率優秀`,
        confidence: 0.85,
      });
    }
  }

  return insights;
}

function generateRecommendations(adsetRanking: AdSetRanking[], assetRanking: AssetRanking[]) {
  const recs = [];

  if (adsetRanking.length > 0) {
    const best = adsetRanking[0];
    const totalSpend = adsetRanking.reduce((s, a) => s + a.spend, 0);
    
    if (best.spend / totalSpend < 0.5) {
      recs.push({
        type: "budget_increase",
        target: best.name,
        content: `建議增加「${best.name}」預算，可測試 +30%`,
        priority: "high",
      });
    }
  }

  if (assetRanking.length > 0) {
    const worst = assetRanking[assetRanking.length - 1];
    if (worst.ctr < 1 && worst.spend > 0) {
      recs.push({
        type: "creative_optimize",
        target: worst.name,
        content: `素材「${worst.name}」CTR 過低，建議重新設計或更換`,
        priority: "high",
      });
    }
  }

  recs.push({
    type: "test_variations",
    content: "建議對錶現好的受眾和素材組合進行 A/B 測試",
    priority: "medium",
  });

  return recs;
}
