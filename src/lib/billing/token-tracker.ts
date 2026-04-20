/**
 * Token Tracker — Backend only, hidden from users
 * Tracks actual API costs for margin calculation
 */

import { ModelPricing } from "./models";

export interface TokenRecord {
  userId: string;
  skill: string;
  actionType: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  userPaidCredits: number; // Credits user was charged
}

export interface TokenCostBreakdown {
  inputCostUsd: number;
  outputCostUsd: number;
  totalCostUsd: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

/**
 * Calculate actual API cost for a given model + token count
 */
export function calculateApiCost(
  model: string,
  inputTokens: number,
  outputTokens: number
): TokenCostBreakdown {
  const pricing = ModelPricing[model] ?? ModelPricing["gpt-4o-mini"];

  const inputCostUsd = (inputTokens / 1_000_000) * pricing.input;
  const outputCostUsd = (outputTokens / 1_000_000) * pricing.output;
  const totalCostUsd = inputCostUsd + outputCostUsd;

  return {
    inputCostUsd: Math.round(inputCostUsd * 1_000_000) / 1_000_000,
    outputCostUsd: Math.round(outputCostUsd * 1_000_000) / 1_000_000,
    totalCostUsd: Math.round(totalCostUsd * 1_000_000) / 1_000_000,
    inputTokens,
    outputTokens,
    totalTokens: inputTokens + outputTokens,
  };
}

/**
 * Get margin = user paid - actual API cost
 * This is stored but NOT exposed to users
 */
export function calculateMargin(
  userPaidCredits: number,
  userPaidUsdPerCredit: number,
  apiCostUsd: number
): number {
  const userPaidUsd = userPaidCredits * userPaidUsdPerCredit;
  return Math.round((userPaidUsd - apiCostUsd) * 1_000_000) / 1_000_000;
}
