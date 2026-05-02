/**
 * Brand Voice Definition
 * 
 * Arclion's core value: NOT just "generate copy"
 * BUT: "Generate copy that matches brand positioning, audience, tone, and history"
 * 
 * This layer ensures:
 * - Consistency across all generated content
 * - Brand-appropriate language
 * - Audience-specific messaging
 * - Learning from past generations
 */

export interface BrandVoice {
  /** Brand positioning statement */
  positioning: string;
  /** Tone rules - how the brand speaks */
  toneRules: ToneRule[];
  /** Words to absolutely avoid */
  bannedWords: string[];
  /** Preferred words that fit brand */
  preferredWords: string[];
  /** Common customer pain points this brand addresses */
  customerPainPoints: string[];
  /** How the brand presents offers */
  offerStyle: "value" | "premium" | "luxury" | "urgent" | "friendly";
  /** Target audience description */
  audienceProfile: string;
  /** Language preference */
  language: "english" | "traditional_chinese" | "simplified_chinese" | "cantonese" | "mixed";
}

export interface ToneRule {
  /** When this rule applies */
  context: "all" | "ads" | "email" | "social" | "landing";
  /** The tone to apply */
  tone: "professional" | "friendly" | "casual" | "luxury" | "urgent" | "playful";
  /** Description of this tone rule */
  description: string;
  /** Examples of this tone */
  examples?: string[];
}

export interface BrandVoiceInput {
  /** Optional brand name */
  brand?: string;
  /** Optional positioning */
  positioning?: string;
  /** Optional audience */
  audience?: string;
  /** Optional tone */
  tone?: string;
  /** Optional language */
  language?: string;
  /** Custom brand voice from user profile */
  customVoice?: Partial<BrandVoice>;
}

/**
 * Build brand voice context for prompt injection
 */
export function buildBrandVoiceContext(input: BrandVoiceInput): string {
  const lines: string[] = [];

  lines.push("## BRAND VOICE CONTEXT");
  lines.push("");

  // Positioning
  if (input.positioning) {
    lines.push(`Brand Positioning: ${input.positioning}`);
  } else if (input.brand) {
    lines.push(`Brand: ${input.brand}`);
  }

  // Audience
  if (input.audience) {
    lines.push(`Target Audience: ${input.audience}`);
  }

  // Language
  if (input.language) {
    const langMap: Record<string, string> = {
      "Traditional Chinese": "Traditional Chinese (繁體中文)",
      "Simplified Chinese": "Simplified Chinese (簡體中文)",
      "Cantonese": "Cantonese (廣東話) - Use natural spoken Cantonese, not written Chinese",
      "English": "English"
    };
    lines.push(`Language: ${langMap[input.language] || input.language}`);
  }

  // Tone
  if (input.tone) {
    const toneMap: Record<string, string> = {
      professional: "Professional and business-like. Focus on ROI, results, efficiency.",
      friendly: "Warm and approachable. Like a helpful friend who knows the industry.",
      casual: "Relaxed and conversational. Keep it light but still informative.",
      luxury: "Premium and exclusive. Sophisticated language, understated confidence.",
      urgent: "Time-sensitive and action-focused. Create momentum to act now.",
      playful: "Fun and witty. Use humor appropriately to engage."
    };
    lines.push(`Tone: ${toneMap[input.tone] || input.tone}`);
  }

  lines.push("");

  // Default rules for HK market
  lines.push("### HK Market Considerations");
  lines.push("- Price-conscious but quality-aware");
  lines.push("- Local cultural references resonate");
  lines.push("- Mix of Cantonese/colloquial Chinese in casual contexts");
  lines.push("- Professional/formal Chinese for business contexts");

  lines.push("");
  lines.push("### Words to AVOID");
  lines.push("- 'Groundbreaking', 'Revolutionary' (overused)");
  lines.push("- 'Best-in-class', 'World-class' (empty claims)");
  lines.push("- Direct translations from English that sound unnatural in Chinese");

  lines.push("");
  lines.push("### Preferred Style");
  lines.push("- Specific over vague");
  lines.push("- Benefit-forward (what they gain)");
  lines.push("- Use local expressions where appropriate");

  return lines.join("\n");
}

/**
 * Get default brand voice for Arclion Marketing
 */
export function getDefaultBrandVoice(): BrandVoice {
  return {
    positioning: "AI-powered marketing assistant for Hong Kong SMEs",
    toneRules: [
      {
        context: "all",
        tone: "professional",
        description: "Clear, actionable, no fluff",
        examples: ["結果導向", "實用建議", "清晰明確"]
      },
      {
        context: "ads",
        tone: "friendly",
        description: "Conversational but credible"
      },
      {
        context: "email",
        tone: "professional",
        description: "Business appropriate, value-first"
      }
    ],
    bannedWords: [
      "groundbreaking",
      "revolutionary",
      "best-in-class",
      "world-class",
      "synergy",
      "leverage",
      "paradigm"
    ],
    preferredWords: [
      "practical",
      "effective",
      "clear",
      "actionable",
      "結果",
      "實用",
      "清楚"
    ],
    customerPainPoints: [
      "不知道如何開始網路推廣",
      "時間有限，不知道什麼有效",
      "預算有限，想要高性價比方案",
      "不懂複雜的營銷工具"
    ],
    offerStyle: "value",
    audienceProfile: "Hong Kong SME owners, 25-50 years old, time-poor, budget-conscious",
    language: "traditional_chinese"
  };
}
