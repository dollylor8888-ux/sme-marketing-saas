/**
 * Margin Calculator — Backend only, hidden from users
 * Calculates and stores profit margins per action
 */

import { calculateApiCost, TokenRecord } from "./token-tracker";
import { CREDIT_USD_VALUE, SkillCreditCost } from "./models";

export interface MarginRecord {
  userId: string;
  skill: string;
  actionType: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  creditsUsed: number;
  apiCostUsd: number;
  userPaidUsd: number;
  marginUsd: number;
}

/**
 * Calculate full margin for an action
 */
export function calculateActionMargin(
  record: TokenRecord,
  creditCost: number = SkillCreditCost[record.skill] ?? 10
): MarginRecord {
  const apiCost = calculateApiCost(record.model, record.inputTokens, record.outputTokens);
  const userPaidUsd = record.userPaidCredits * CREDIT_USD_VALUE;
  const marginUsd = userPaidUsd - apiCost.totalCostUsd;

  return {
    ...record,
    creditsUsed: record.userPaidCredits,
    apiCostUsd: apiCost.totalCostUsd,
    userPaidUsd: Math.round(userPaidUsd * 1_000_000) / 1_000_000,
    marginUsd: Math.round(marginUsd * 1_000_000) / 1_000_000,
  };
}

/**
 * Aggregate margins for reporting (Boss only dashboard)
 */
export interface MarginSummary {
  date: string;
  totalRevenue: number;
  totalCost: number;
  totalMargin: number;
  totalTokens: number;
  actionCount: number;
  bySkill: Record<string, { count: number; revenue: number; cost: number; margin: number }>;
}

export function aggregateMargins(records: MarginRecord[]): MarginSummary {
  const summary: MarginSummary = {
    date: new Date().toISOString().split("T")[0],
    totalRevenue: 0,
    totalCost: 0,
    totalMargin: 0,
    totalTokens: 0,
    actionCount: records.length,
    bySkill: {},
  };

  for (const r of records) {
    summary.totalRevenue += r.userPaidUsd;
    summary.totalCost += r.apiCostUsd;
    summary.totalMargin += r.marginUsd;
    summary.totalTokens += r.inputTokens + r.outputTokens;

    if (!summary.bySkill[r.skill]) {
      summary.bySkill[r.skill] = { count: 0, revenue: 0, cost: 0, margin: 0 };
    }
    summary.bySkill[r.skill].count++;
    summary.bySkill[r.skill].revenue += r.userPaidUsd;
    summary.bySkill[r.skill].cost += r.apiCostUsd;
    summary.bySkill[r.skill].margin += r.marginUsd;
  }

  return summary;
}
