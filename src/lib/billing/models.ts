/**
 * Model Pricing Reference — Backend only
 * Prices in USD per 1 million tokens
 */

export const ModelPricing: Record<string, { input: number; output: number }> = {
  // OpenAI
  "gpt-4o": { input: 2.5, output: 10.0 },
  "gpt-4o-mini": { input: 0.15, output: 0.6 },
  "gpt-4-turbo": { input: 10.0, output: 30.0 },
  // Anthropic
  "claude-3-5-sonnet": { input: 3.0, output: 15.0 },
  "claude-3-5-haiku": { input: 0.8, output: 4.0 },
  // MiniMax
  "abab6-chat": { input: 0.1, output: 0.1 },   // ~$0.10/1M both directions
  "abab6.5s-chat": { input: 0.05, output: 0.05 },
};

export const DEFAULT_MODEL = "gpt-4o-mini";

export const SkillCreditCost: Record<string, number> = {
  copywriting: 10,     // 10 credits per action
  "ai-seo": 15,        // 15 credits per optimization
  "analytics-tracking": 5, // 5 credits per tracking event
};

export const CREDIT_USD_VALUE = 0.01; // 1 credit = $0.01 USD
