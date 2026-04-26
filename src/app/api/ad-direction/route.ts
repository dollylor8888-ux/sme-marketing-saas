/**
 * Ad Direction API
 * POST /api/ad-direction - Generate ad direction suggestions based on product analysis
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/billing/credit-system";
import { ensureUser } from "@/lib/billing/credit-system";
import { OpenAI } from "openai";

const CREDITS_PER_REQUEST = 15;

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await ensureUser(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check credits
    const balance = await prisma.creditAccount.findUnique({
      where: { userId: user.id },
    });

    const credits = balance?.balance ?? 0;
    if (credits < CREDITS_PER_REQUEST) {
      return NextResponse.json(
        { error: `Insufficient credits. Need ${CREDITS_PER_REQUEST}, have ${credits}` },
        { status: 402 }
      );
    }

    const body = await req.json();
    const {
      productName,
      productDescription,
      features,
      sellingPoints,
      targetAudience,
      platform = "facebook",
      objective = "sales",
    } = body;

    if (!productName || !sellingPoints) {
      return NextResponse.json(
        { error: "Missing productName or sellingPoints" },
        { status: 400 }
      );
    }

    // Normalize sellingPoints to array of strings
    const allPoints: string[] = [];
    if (Array.isArray(sellingPoints)) {
      for (const sp of sellingPoints) {
        if (typeof sp === "string") allPoints.push(sp);
        else if (sp && typeof sp === "object" && "point" in sp) allPoints.push((sp as { point: string }).point);
      }
    }

    const featureNames = Array.isArray(features)
      ? features.map((f) => typeof f === "string" ? f : (f as { name?: string }).name).filter(Boolean).join(", ")
      : "N/A";

    const platformLabel = platform === "both" ? "Facebook + Instagram" : platform === "instagram" ? "Instagram" : "Facebook";
    const objectiveLabel = objective === "sales" ? "直接銷售" : objective === "awareness" ? "品牌認知" : objective === "lead" ? "Lead Generation" : "再行銷";

    const prompt = `你是 Facebook/Instagram 廣告策略專家。

根據以下產品資訊，生成 2-3 個廣告方向建議：

## 產品
名稱: ${productName}
描述: ${productDescription || "N/A"}
功能: ${featureNames || "N/A"}

## 確認的賣點
${allPoints.length > 0 ? allPoints.map((p: string, i: number) => `${i + 1}. ${p}`).join("\n") : "N/A"}

## 目標
- 平台: ${platformLabel}
- 目標: ${objectiveLabel}

請生成 2-3 個廣告方向，每個方向包含：
1. **方向名稱** - 簡潔有力的名稱
2. **策略** - 這個方向的核心理念
3. **受眾描述** - 包括年齡、性別、興趣等
4. **創意方向** - 建議的素材風格和情感訴求
5. **主打賣點** - 這個方向主打哪個賣點
6. **平台** - facebook / instagram / both
7. **AdSet 數量** - 建議的 AdSet 數量 (1-2)
8. **預算分配** - 建議佔總預算的百分比

JSON 輸出格式：
{
  "directions": [
    {
      "name": "方向名稱",
      "strategy": "核心策略描述",
      "audienceDesc": "受眾描述",
      "creativeDirection": "創意方向描述",
      "mainSellingPoint": "主打賣點",
      "platform": "facebook|instagram|both",
      "adsetCount": 1-2,
      "estimatedBudget": "30%"
    }
  ]
}`;

    // Call MiniMax AI
    const apiKey = process.env.OPENAI_API_KEY || process.env.AI_PROVIDER_KEY;
    const baseURL = process.env.AI_API_BASE || "https://api.minimax.chat/v1";

    let directions = null;

    if (apiKey && apiKey.startsWith("sk-")) {
      try {
        const client = new OpenAI({
          apiKey,
          baseURL,
          defaultHeaders: { "x-api-key": apiKey },
        });

        const completion = await client.chat.completions.create({
          model: "abab6-chat",
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          max_tokens: 2000,
          temperature: 0.7,
        });

        const result = completion.choices[0]?.message?.content?.trim() || "";

        // Try to parse JSON
        try {
          // Extract JSON from response
          const jsonMatch = result.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            directions = parsed.directions || parsed;
          }
        } catch {
          // Not JSON, return as text
          directions = [{ name: "AI 建議方向", strategy: result, audienceDesc: targetAudience || "", creativeDirection: "", mainSellingPoint: allPoints[0] || "", platform: "both", adsetCount: 1, estimatedBudget: "50%" }];
        }
      } catch (e) {
        console.error("AI API error:", e);
      }
    }

    // Only deduct credits and log if we got real AI directions
    if (directions) {
      await prisma.creditAccount.update({
        where: { userId: user.id },
        data: { balance: { decrement: CREDITS_PER_REQUEST } },
      });

      await prisma.actionLog.create({
        data: {
          userId: user.id,
          skill: "copywriting",
          actionType: "ad_direction",
          creditsUsed: CREDITS_PER_REQUEST,
        },
      }).catch((logErr) => console.error('ActionLog failed:', logErr));

      return NextResponse.json({ success: true, directions, credits });
    }

    // Fallback mock directions — NO credit deduction
    const mockDirections = [
      {
        name: "時尚生活派",
        strategy: "主打產品時尚輕巧設計，瞄準追求品質生活的年輕女性",
        audienceDesc: "女性, 25-35歲, 興趣:時尚、音樂、生活品質、健身",
        creativeDirection: "生活場景化素材，展示通勤/運動/咖啡廳等場景",
        mainSellingPoint: allPoints[0] || "時尚輕巧",
        platform: "both",
        adsetCount: 1,
        estimatedBudget: "40%",
      },
      {
        name: "實用主義者",
        strategy: "強調性價比和功能性，吸引理性消費者",
        audienceDesc: "男女不限, 28-45歲, 興趣:科技、性價比、實用主義",
        creativeDirection: "產品功能展示，特寫鏡頭，數據化呈現",
        mainSellingPoint: allPoints[1] || allPoints[0] || "高性價比",
        platform: "facebook",
        adsetCount: 1,
        estimatedBudget: "35%",
      },
      {
        name: "送禮首選",
        strategy: "節日/生日送禮場景，瞄準送禮需求",
        audienceDesc: "男女不限, 30-50歲, 有送禮需求",
        creativeDirection: "禮物包裝、送禮場景、情感連結",
        mainSellingPoint: allPoints[2] || allPoints[0] || "精美禮品",
        platform: "instagram",
        adsetCount: 1,
        estimatedBudget: "25%",
      },
    ];

    return NextResponse.json({ success: true, directions: mockDirections, credits });
  } catch (error) {
    console.error("Ad direction API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
