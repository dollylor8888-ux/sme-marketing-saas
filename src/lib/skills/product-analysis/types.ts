/**
 * Product Analysis Skill - Types
 * 
 * Feature 1: 產品賣點分析
 * Input: Product URL or manual product details
 * Output: FABS analysis + Use cases + Emotional values + Differentiation + Proof points
 */

// ============ INPUT TYPES ============

export interface ProductAnalysisInput {
  // Either URL (auto-scrape) OR manual details
  url?: string;
  
  // Manual input fields
  productName?: string;
  category?: string;
  price?: string;
  targetAudience?: string;
  description?: string;
  ingredients?: string;
  usage?: string;
  applicableScope?: string;
  origin?: string;
  brandFocus?: string;
  competitors?: string;
  
  // Supplement (after confirmation)
  additionalNotes?: string;
  
  // Context
  workspaceId?: string;
  saveToBrandMemory?: boolean;
}

// ============ OUTPUT TYPES ============

export interface ProductAnalysisOutput {
  success: boolean;
  
  // Core analysis
  tagline: string;
  fabs: FABS;
  useCases: UseCase[];
  emotionalValues: EmotionalValue[];
  differentiation: Differentiation[];
  proofPoints: ProofPoint[];
  
  // Metadata
  analysisId?: string;
  tokensUsed?: {
    inputTokens: number;
    outputTokens: number;
  };
  creditsUsed?: number;
  
  error?: string;
}

// FABS: Feature → Advantage → Benefit → Selling Point
export interface FABS {
  feature: string;
  advantage: string;
  benefit: string;
  sellingPoint: string;
}

// Use Case: WHO × WHEN × WHERE × WHY model
export interface UseCase {
  id: string;
  persona: string;
  when: string;
  where: string;
  painPoint: string;
  action: string;
  reward: string;
  feeling: string;
}

// Emotional value with advertising angle
export interface EmotionalValue {
  emotion: string;
  hook: string;
  advertisingAngle: string;
}

// Differentiation vs competitors
export interface Differentiation {
  vs: string;
  ourAdvantage: string;
  claim: string;
}

// Proof points for trust building
export interface ProofPoint {
  type: "authority" | "user_review" | "media" | "origin" | "certification";
  content: string;
  canClaimNow: boolean;
  howToBuild?: string;
}

// ============ TOKEN LOG TYPES ============

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  inputCostUsd: number;
  outputCostUsd: number;
  totalCostUsd: number;
}

// ============ COST ESTIMATES ============
// Based on MiniMax-M2.7 pricing (approximate GPT-4o-mini equivalent)
// Input: ~$0.000075 / 1K tokens
// Output: ~$0.0003 / 1K tokens

export const CREDIT_COST = 20; // 20 credits per product analysis

export const ESTIMATED_TOKENS = {
  input: 800,   // ~800 tokens for detailed product input
  output: 1200, // ~1200 tokens for comprehensive analysis
};

// Cost per analysis in USD (for tracking)
export function calculateCost(tokens: TokenUsage): number {
  return tokens.totalCostUsd;
}
