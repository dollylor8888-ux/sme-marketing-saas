/**
 * Copywriting Skill — Generate marketing copy
 * User-facing: ads, emails, social posts, landing pages
 */

import OpenAI from "openai";
import { TokenRecord } from "../../billing/token-tracker";
import { MarginRecord, calculateActionMargin } from "../../billing/margin-calculator";
import { SkillCreditCost } from "../../billing/models";

const provider = process.env.AI_PROVIDER ?? "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: provider === "minimax" ? "https://api.minimax.chat/v1" : undefined,
});

export const DEFAULT_MODEL = provider === "minimax"
  ? "abab6-chat"  // MiniMax model
  : "gpt-4o-mini"; // OpenAI fallback

export { openai };

export type CopyType = "ad_headline" | "ad_description" | "email_subject" | "email_body" | "social_post" | "landing_hero" | "product_description";

export interface CopywritingInput {
  type: CopyType;
  product?: string;
  brand?: string;
  audience?: string;
  tone?: string;
  language?: string;
  extra?: string;
}

export interface CopywritingOutput {
  success: boolean;
  copy?: string;
  variants?: string[];
  error?: string;
}

const SYSTEM_PROMPTS: Record<CopyType, string> = {
  ad_headline: "You are an expert copywriter specializing in attention-grabbing ad headlines. Create compelling, concise headlines (max 30 chars) that drive clicks.",
  ad_description: "You are an expert copywriter. Write persuasive ad descriptions (max 90 chars) that complement the headline and drive action.",
  email_subject: "You are an email marketing expert. Create compelling subject lines (max 50 chars) that maximize open rates.",
  email_body: "You are an expert email copywriter. Write engaging email body copy that drives the desired action.",
  social_post: "You are a social media expert. Write engaging social media posts that drive engagement.",
  landing_hero: "You are a conversion copywriter. Write hero section copy that captures attention and drives conversions.",
  product_description: "You are a product copywriter. Write compelling product descriptions that highlight benefits and drive sales.",
};

const MOCK_MODE = true; // TODO: set to false when real MiniMax key is available

export async function generateCopy(input: CopywritingInput): Promise<{
  output: CopywritingOutput;
  tokenRecord?: TokenRecord;
  marginRecord?: MarginRecord;
}> {
  const { type, product, brand, audience, tone = "professional", language = "English", extra } = input;

  // MOCK MODE - return fake copy for testing
  if (MOCK_MODE) {
    const mockCopy = `[MOCK] ${type} for ${product || "your product"} by ${brand || "your brand"} — Target: ${audience || "everyone"} — Tone: ${tone}`;
    return {
      output: { success: true, copy: mockCopy, variants: [`${mockCopy} (v2)`, `${mockCopy} (v3)`] },
    };
  }

  const systemPrompt = SYSTEM_PROMPTS[type] ?? "You are an expert copywriter.";
  const userPrompt = buildUserPrompt(type, { product, brand, audience, tone, language, extra });

  try {
    // Estimate tokens (rough)
    const estimatedInputTokens = Math.ceil((systemPrompt + userPrompt).length / 4);

    const completion = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 500,
    });

    const outputText = completion.choices[0]?.message?.content ?? "";
    const usage = completion.usage;

    const inputTokens = usage?.prompt_tokens ?? estimatedInputTokens;
    const outputTokens = usage?.completion_tokens ?? Math.ceil(outputText.length / 4);

    // Build token record for billing (hidden from user)
    const tokenRecord: TokenRecord = {
      userId: "pending", // Set by caller
      skill: "copywriting",
      actionType: type,
      model: DEFAULT_MODEL,
      inputTokens,
      outputTokens,
      userPaidCredits: SkillCreditCost["copywriting"],
    };

    // Calculate margin (hidden from user)
    const marginRecord = calculateActionMargin(tokenRecord);

    return {
      output: { success: true, copy: outputText },
      tokenRecord,
      marginRecord,
    };
  } catch (error) {
    return {
      output: { success: false, error: error instanceof Error ? error.message : "Unknown error" },
    };
  }
}

function buildUserPrompt(
  type: CopyType,
  opts: { product?: string; brand?: string; audience?: string; tone?: string; language?: string; extra?: string }
): string {
  const { product, brand, audience, tone, language, extra } = opts;

  const base = [
    product && `Product: ${product}`,
    brand && `Brand: ${brand}`,
    audience && `Target audience: ${audience}`,
    `Tone: ${tone}`,
    `Language: ${language}`,
    extra && `Additional context: ${extra}`,
  ]
    .filter(Boolean)
    .join("\n");

  const typeInstructions: Record<CopyType, string> = {
    ad_headline: "Generate 3 ad headline options. Each must be under 30 characters.",
    ad_description: "Generate 3 ad description options. Each must be under 90 characters.",
    email_subject: "Generate 5 email subject line options.",
    email_body: "Generate a full email body. Include a hook, body, and call-to-action.",
    social_post: "Generate 3 social media post options. Include relevant hashtags.",
    landing_hero: "Generate hero copy: headline (8 words max), subheadline (16 words max), and CTA text.",
    product_description: "Generate a compelling product description with benefits and a call to action.",
  };

  return `${base}\n\nTask: ${typeInstructions[type] ?? "Generate marketing copy."}`;
}
