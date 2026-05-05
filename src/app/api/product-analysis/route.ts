/**
 * Product Analysis API Route
 * 
 * POST /api/product-analysis
 * 
 * Body: ProductAnalysisInput
 * Response: ProductAnalysisOutput
 */

import { NextRequest, NextResponse } from "next/server";
import { generateProductAnalysis, calculateTokenCost } from "@/lib/skills/product-analysis";
import type { ProductAnalysisInput } from "@/lib/skills/product-analysis/types";
import { CREDIT_COST } from "@/lib/skills/product-analysis/types";

// ============ POST ============

export async function POST(request: NextRequest) {
  try {
    const body: ProductAnalysisInput = await request.json();

    // Validate required fields
    if (!body.productName && !body.url) {
      return NextResponse.json(
        { success: false, error: "請提供產品名稱或 URL" },
        { status: 400 }
      );
    }

    // For URL input, we would need to scrape first
    // For now, we'll focus on manual input
    if (body.url && !body.productName) {
      // TODO: Implement URL scraping
      return NextResponse.json(
        { success: false, error: "URL 抓取功能即將推出，請先使用手動輸入" },
        { status: 501 }
      );
    }

    // Check if user has enough credits (if authenticated)
    // TODO: Implement credit check

    // Generate analysis
    const result = await generateProductAnalysis({ input: body, trackTokens: true });

    if (!result.success) {
      return NextResponse.json(result, { status: 500 });
    }

    // Log token usage for cost tracking (Boss only)
    if (result.tokensUsed) {
      const cost = calculateTokenCost(result.tokensUsed);
      console.log(
        `[ProductAnalysis] tokens=${cost.totalTokens} ` +
        `input_cost=$${cost.inputCostUsd.toFixed(6)} ` +
        `output_cost=$${cost.outputCostUsd.toFixed(6)} ` +
        `total_cost=$${cost.totalCostUsd.toFixed(6)} ` +
        `credits=${CREDIT_COST}`
      );
      // TODO: Save to TokenLog table
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("[ProductAnalysis API] Error:", error);
    return NextResponse.json(
      { success: false, error: "伺服器錯誤，請稍後再試" },
      { status: 500 }
    );
  }
}

// ============ OPTIONS ============

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
