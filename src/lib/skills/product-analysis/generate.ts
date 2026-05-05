/**
 * Product Analysis Skill - Generation Logic
 * 
 * Feature 1: 產品賣點分析
 * Handles AI generation with MiniMax/MiniMax-Proxy/OpenAI
 */

import { PRODUCT_ANALYSIS_SYSTEM_PROMPT, buildProductAnalysisUserPrompt, OUTPUT_SCHEMA_INSTRUCTION } from "./prompts";
import type { ProductAnalysisInput, ProductAnalysisOutput, TokenUsage } from "./types";

// ============ PROVIDER CONFIG ============

const provider = process.env.AI_PROVIDER ?? "openai";

export const DEFAULT_MODEL =
  provider === "minimax"
    ? "abab6-chat"
    : provider === "minimax-proxy"
    ? (process.env.AI_PROXY_MODEL ?? "MiniMax-M2.7")
    : "gpt-4o-mini";

const MINIMAX_BASE_URL = "https://api.minimax.io";

// ============ CUSTOM FETCH FOR MINIMAX-PROXY ============

/**
 * Call AI API using native fetch
 * Handles both OpenAI-compatible and MiniMax-Proxy (X-API-Key header)
 */
async function callAI({
  model,
  messages,
  temperature = 0.7,
  maxTokens = 2000,
}: {
  model: string;
  messages: { role: string; content: string }[];
  temperature?: number;
  maxTokens?: number;
}): Promise<{ content: string; usage?: { prompt_tokens: number; completion_tokens: number } }> {
  let url: string;
  let headers: Record<string, string>;

  if (provider === "minimax-proxy") {
    // Use local proxy server
    const proxyUrl = process.env.AI_PROXY_URL ?? "http://localhost:3456";
    url = `${proxyUrl}/v1/chat/completions`;
    headers = {
      "Content-Type": "application/json",
      "X-API-Key": process.env.AI_PROXY_KEY ?? "proxy-key-not-set",
      "Authorization": `Bearer ${process.env.AI_PROXY_KEY ?? "proxy-key-not-set"}`,
    };
  } else if (provider === "minimax") {
    // Direct MiniMax API
    url = `${MINIMAX_BASE_URL}/v1/chat/completions`;
    headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
    };
  } else {
    // OpenAI
    url = "https://api.openai.com/v1/chat/completions";
    headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
    };
  }

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`${response.status} ${response.statusText}: ${error}`);
  }

  const data = await response.json();
  return {
    content: data.choices?.[0]?.message?.content ?? "",
    usage: data.usage ? {
      prompt_tokens: data.usage.prompt_tokens ?? 0,
      completion_tokens: data.usage.completion_tokens ?? 0,
    } : undefined,
  };
}

// ============ MAIN GENERATION FUNCTION ============

export interface GenerateProductAnalysisOptions {
  input: ProductAnalysisInput;
  /** Return raw token usage (for cost tracking) */
  trackTokens?: boolean;
}

/**
 * Generate product analysis using AI
 */
export async function generateProductAnalysis(
  options: GenerateProductAnalysisOptions
): Promise<ProductAnalysisOutput> {
  const { input, trackTokens = true } = options;

  const userPrompt = buildProductAnalysisUserPrompt(input);

  try {
    const result = await callAI({
      model: DEFAULT_MODEL,
      messages: [
        { role: "system", content: PRODUCT_ANALYSIS_SYSTEM_PROMPT },
        { role: "user", content: userPrompt + "\n\n" + OUTPUT_SCHEMA_INSTRUCTION },
      ],
      temperature: 0.7,
      maxTokens: 2000,
    });

    const rawOutput = result.content;
    const usage = result.usage;

    // Parse JSON output
    let parsed: Partial<ProductAnalysisOutput>;
    try {
      parsed = JSON.parse(rawOutput);
    } catch {
      return {
        success: false,
        tagline: "",
        fabs: { feature: "", advantage: "", benefit: "", sellingPoint: "" },
        useCases: [],
        emotionalValues: [],
        differentiation: [],
        proofPoints: [],
        error: "AI 輸出格式錯誤，請稍後再試",
      };
    }

    // Validate required fields
    if (!parsed.tagline || !parsed.fabs || !parsed.useCases || !parsed.emotionalValues || !parsed.differentiation || !parsed.proofPoints) {
      return {
        success: false,
        tagline: parsed.tagline ?? "",
        fabs: parsed.fabs ?? { feature: "", advantage: "", benefit: "", sellingPoint: "" },
        useCases: parsed.useCases ?? [],
        emotionalValues: parsed.emotionalValues ?? [],
        differentiation: parsed.differentiation ?? [],
        proofPoints: parsed.proofPoints ?? [],
        error: "AI 輸出資料不完整，請稍後再試",
      };
    }

    // Ensure arrays have expected lengths
    const useCases = parsed.useCases ?? [];
    const emotionalValues = parsed.emotionalValues ?? [];
    const differentiation = parsed.differentiation ?? [];
    const proofPoints = parsed.proofPoints ?? [];

    return {
      success: true,
      tagline: parsed.tagline,
      fabs: parsed.fabs,
      useCases: useCases.slice(0, 3), // Ensure max 3
      emotionalValues: emotionalValues.slice(0, 3),
      differentiation: differentiation.slice(0, 3),
      proofPoints: proofPoints.slice(0, 3),
      tokensUsed: trackTokens && usage
        ? {
            inputTokens: usage.prompt_tokens ?? 0,
            outputTokens: usage.completion_tokens ?? 0,
          }
        : undefined,
      creditsUsed: 20, // Fixed credit cost
    };
  } catch (error) {
    console.error("[ProductAnalysis] Generation error:", error);
    return {
      success: false,
      tagline: "",
      fabs: { feature: "", advantage: "", benefit: "", sellingPoint: "" },
      useCases: [],
      emotionalValues: [],
      differentiation: [],
      proofPoints: [],
      error: error instanceof Error ? error.message : "未知錯誤，請稍後再試",
    };
  }
}

// ============ TOKEN COST CALCULATOR ============

/**
 * Calculate USD cost from token usage
 * Based on MiniMax-M2.7 pricing (approximate GPT-4o-mini equivalent)
 */
export function calculateTokenCost(usage: { inputTokens: number; outputTokens: number }): TokenUsage {
  const inputCostPerToken = 0.000000075; // $0.075 / 1M tokens
  const outputCostPerToken = 0.0000003;   // $0.30 / 1M tokens

  const inputCostUsd = usage.inputTokens * inputCostPerToken;
  const outputCostUsd = usage.outputTokens * outputCostPerToken;
  const totalCostUsd = inputCostUsd + outputCostUsd;

  return {
    inputTokens: usage.inputTokens,
    outputTokens: usage.outputTokens,
    totalTokens: usage.inputTokens + usage.outputTokens,
    inputCostUsd,
    outputCostUsd,
    totalCostUsd,
  };
}

// ============ TEST FUNCTION ============

/**
 * Test the product analysis with a sample product
 */
export async function testProductAnalysis(): Promise<void> {
  console.log("🧪 Testing Product Analysis...\n");

  const testInput: ProductAnalysisInput = {
    productName: "OmmiCare 亮白精華液",
    category: "護膚品 / 面部精華",
    price: "HK$388",
    targetAudience: "25-45歲香港女性",
    description: "蘊含維他命C及透明質酸，深層保濕並提亮膚色",
    ingredients: "維他命C、透明質酸、膠原蛋白",
    usage: "早晚各2滴",
    applicableScope: "所有膚質",
    origin: "韓國",
    brandFocus: "方便、有效、韓國製造",
    competitors: "其他韓國精華如 Innisfree, Laneige",
  };

  const startTime = Date.now();
  const result = await generateProductAnalysis({ input: testInput, trackTokens: true });
  const elapsed = Date.now() - startTime;

  console.log("✅ Analysis Result:");
  console.log(JSON.stringify(result, null, 2));
  console.log(`\n⏱️ Time: ${elapsed}ms`);
  
  if (result.tokensUsed) {
    const cost = calculateTokenCost(result.tokensUsed);
    console.log(`📊 Tokens: ${cost.inputTokens} in / ${cost.outputTokens} out`);
    console.log(`💰 Cost: $${cost.totalCostUsd.toFixed(6)}`);
  }
}
