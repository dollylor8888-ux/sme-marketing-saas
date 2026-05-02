/**
 * Copywriting Modes — mode-based prompt and output control
 * 
 * Defines 3 modes:
 * 1. ad_copy_set    — FB/IG ad with Headline + Primary Text + Description + CTA
 * 2. campaign_direction — Marketing direction based on product/month/market/goals
 * 3. product_angle_explorer — Product selling points, pain points, hooks
 */

// ─────────────────────────────────────────
// Mode IDs
// ─────────────────────────────────────────

export type CopywritingModeId = 
  | "ad_copy_set"
  | "campaign_direction"
  | "product_angle_explorer";

// ─────────────────────────────────────────
// Input Type
// ─────────────────────────────────────────

export interface CopywritingModeInput {
  mode: CopywritingModeId;
  // Core fields
  product?: string;
  brand?: string;
  audience?: string;
  benefits?: string;
  painPoint?: string;
  offer?: string;
  platform?: string;
  month?: string;
  market?: string;
  salesGoal?: string;
  festival?: string;
  budgetLevel?: string;
  tone?: string;
  language?: "traditional_chinese" | "cantonese" | "english";
  extra?: string;
  // Brand voice
  brandVoice?: {
    name?: string;
    tagline?: string;
    values?: string[];
    voice?: string;
    audience?: string;
    style?: string[];
  };
}

// ─────────────────────────────────────────
// Output Types Per Mode
// ─────────────────────────────────────────

/** ad_copy_set output */
export interface AdCopySetOutput {
  headline: string;
  primaryText: string;
  description: string;
  cta: string;
  hashtags: string[];
  reasoning: string;
  scores: {
    clarity: number;
    conversion: number;
    brandFit: number;
    cantoneseAuthenticity?: number;
  };
}

/** campaign_direction output */
export interface CampaignDirectionOutput {
  direction: string;
  targetAudience: string;
  keyMessage: string;
  contentPillars: string[];
  suggestedAngles: {
    angle: string;
    hook: string;
    supportingPoint: string;
  }[];
  budgetGuidance: {
    low: string;
    medium: string;
    high: string;
  };
  timeline: string;
  reasoning: string;
  scores: {
    relevance: number;
    feasibility: number;
    differentiation: number;
  };
}

/** product_angle_explorer output */
export interface ProductAngleExplorerOutput {
  productName: string;
  coreValue: string;
  painPoints: {
    pain: string;
    severity: "high" | "medium" | "low";
    language: string;
  }[];
  sellingPoints: {
    benefit: string;
    proof: string;
    emotionalTrigger: string;
  }[];
  targetPersona: {
    persona: string;
    demographics: string;
    psychographics: string;
    biggestObjection: string;
  };
  hookExamples: {
    hook: string;
    platform: string;
    format: string;
  }[];
  competitiveEdge: string;
  reasoning: string;
  scores: {
    clarity: number;
    persuasiveness: number;
    uniqueness: number;
  };
}

// ─────────────────────────────────────────
// Union Output Type
// ─────────────────────────────────────────

export type CopywritingModeOutput =
  | AdCopySetOutput
  | CampaignDirectionOutput
  | ProductAngleExplorerOutput;

// ─────────────────────────────────────────
// Mode Definition (with prompt + schema metadata)
// ─────────────────────────────────────────

export interface CopywritingModeDefinition {
  id: CopywritingModeId;
  label: string;
  userLabel: string;
  description: string;
  credits: number;
  systemPrompt: string;
  userPromptTemplate: string;
  outputInstructions: string;
  supportedLanguages: CopywritingModeInput["language"][];
}

// ─────────────────────────────────────────
// Language Rules
// ─────────────────────────────────────────

export const LANGUAGE_RULES: Record<
  NonNullable<CopywritingModeInput["language"]>,
  string
> = {
  traditional_chinese: `
- 繁體中文
- 台/港式中文遣詞用句
- 避免：大陸慣用語、「種草」「干貨」「老公」「小姐姐」等淘寶式用語
- 避免：過於文縐縐的官方措辭
- 用字：自然、口語化、有溫度
`.trim(),
  cantonese: `
- 粵語口語
- 常用粵語：「我哋」「你哋」「咁」「喺」「唔」「夠鐘」「正嘢」「超抵」「懶醒」「hea」「搵笨」「伏已隱藏」
- 避免：普通話直接翻譯成粵語
- 避免：「老師」「家人」「小紅書風格」
- 語氣：夠掂、幾好喈、無得輸
`.trim(),
  english: `
- English copy
- Conversational but professional tone
- HK/Asian market context
- Avoid: corporate stiff language, generic AI feel
`.trim(),
};

// ─────────────────────────────────────────
// Mode Definitions
// ─────────────────────────────────────────

export const COPYWRITING_MODES: Record<CopywritingModeId, CopywritingModeDefinition> = {
  ad_copy_set: {
    id: "ad_copy_set",
    label: "Ad Copy Set",
    userLabel: "廣告文案套裝",
    description: "生成 Headline + Primary Text + Description + CTA，適合 FB/IG 廣告",
    credits: 15,
    supportedLanguages: ["traditional_chinese", "cantonese", "english"],
    systemPrompt: `你是一位專門為香港/亞洲市場的創意廣告文案專家。
擅長創作能引發情緒共鳴、提升互動、帶來轉化的廣告文案。

核心原則：
- 了解目標受眾的語言習慣
- 文案要夠「吸睛」同時避免嘩眾取寵
- CTA 清晰有行動力
- 所有輸出的文案都要自然，避免AI感

忌用：
- 大陸淘寶式用語（種草、乾貨、老公、小姐姐、閨蜜）
- 過於官方/文縐縐的措辭
- 普通話直譯粵語
- generic AI feel 的罐頭語言`,
    userPromptTemplate: `【任務】生成一套廣告文案

【產品】{{product}}
【品牌】{{brand}}
【目標受眾】{{audience}}
【产品好处】{{benefits}}
【痛點】{{painPoint}}
【優惠/推廣】{{offer}}
【平台】{{platform}}
【月份/節日】{{month}}{{festival}}
【市場】{{market}}
【銷售目標】{{salesGoal}}
{{#if budgetLevel}}
【預算水平】{{budgetLevel}}
{{/if}}
{{#if tone}}
【語氣風格】{{tone}}
{{/if}}
{{#if extra}}
【額外提示】{{extra}}
{{/if}}
{{#if brandVoice}}
【品牌風格】{{brandVoice}}
{{/if}}
【語言】{{language}}`,
    outputInstructions: `你必須返回一個 pure JSON object，不能有 markdown、不能在 \`\`\`json 塊內、不能有任何其他文字。

Schema:
{
  "headline": "string (max 40 chars, attention-grabbing, benefit-focused)",
  "primaryText": "string (90-150 chars, emotional hook + value prop, end with soft CTA or question)",
  "description": "string (max 30 chars, supporting detail or social proof element)",
  "cta": "string (short action phrase: 2-5 words, e.g. '立即查看' / '報名試用' / '了解更多')",
  "hashtags": ["string (3-5 hashtags, HK-relevant, lowercase)"],
  "reasoning": "string (why this combination works for this audience and platform)",
  "scores": {
    "clarity": "number 1-10, 是否清楚表達產品價值",
    "conversion": "number 1-10, 是否有行動驅動力",
    "brandFit": "number 1-10, 是否符合品牌調性",
    "cantoneseAuthenticity": "number 1-10, 粵語是否自然道地 (如果不是粵語則填 null)"
  }
}`,
  },

  campaign_direction: {
    id: "campaign_direction",
    label: "Campaign Direction",
    userLabel: "推廣方向策劃",
    description: "根據產品/月/市場/目標，生成整體推廣方向和策略框架",
    credits: 20,
    supportedLanguages: ["traditional_chinese", "cantonese", "english"],
    systemPrompt: `你是一位資深的營銷策略顧問，專精香港/亞洲市場的中小企業推廣策劃。
能根據產品特質、市場趨勢、節日節點，給出可執行的推廣方向。

核心能力：
- 結合時事/節日/季節制訂切入角度
- 受眾洞察與精準定位
- 多觸點整合策略
- 預算分配建議
- 可落地執行`,
    userPromptTemplate: `【任務】制定推廣方向策略

【產品】{{product}}
【品牌】{{brand}}
【目標受眾】{{audience}}
【市場】{{market}}
【月份】{{month}}
【節日/活動】{{festival}}
【銷售目標】{{salesGoal}}
{{#if budgetLevel}}
【預算水平】{{budgetLevel}}
{{/if}}
{{#if tone}}
【風格調性】{{tone}}
{{/if}}
{{#if extra}}
【額外背景】{{extra}}
{{/if}}
{{#if brandVoice}}
【品牌風格】{{brandVoice}}
{{/if}}
【語言】{{language}}`,
    outputInstructions: `你必須返回一個 pure JSON object，不能有 markdown、不能在 \`\`\`json 塊內、不能有任何其他文字。

Schema:
{
  "direction": "string (推廣總方向，一句話概括核心切入點)",
  "targetAudience": "string (精準描述目標受眾，包括人口特徵和心理特徵)",
  "keyMessage": "string (campaign 主題句/核心訊息)",
  "contentPillars": ["string (3-5個內容支柱，每個一句話描述)"],
  "suggestedAngles": [
    {
      "angle": "string (切入角度名稱)",
      "hook": "string (鉤子句，用於引發興趣)",
      "supportingPoint": "string (支撐這個角度的論點或證據)"
    }
  ],
  "budgetGuidance": {
    "low": "string (低預算建議，HK$xxx，推薦策略)",
    "medium": "string (中預算建議，HK$xxx，推薦策略)",
    "high": "string (高預算建議，HK$xxx，推薦策略)"
  },
  "timeline": "string (建議執行時間線，例如：'節日前2週開始預熱，節日前1週高峰')",
  "reasoning": "string (解釋為什麼這個方向適合該產品和市場)",
  "scores": {
    "relevance": "number 1-10, 方向與產品/市場的相關性",
    "feasibility": "number 1-10, 策略是否易於執行",
    "differentiation": "number 1-10, 是否與競爭對手有足夠差異化"
  }
}`,
  },

  product_angle_explorer: {
    id: "product_angle_explorer",
    label: "Product Angle Explorer",
    userLabel: "產品角度挖掘",
    description: "拆解產品賣點、痛點、人群定位，生成多個 Hook 範例",
    credits: 15,
    supportedLanguages: ["traditional_chinese", "cantonese", "english"],
    systemPrompt: `你是一位產品營銷策略師，擅長從產品功能、使用場景、情感需求等維度挖掘獨特銷售角度。
能幫助品牌找到差異化定位，並提供具體的 hook 範例。

核心能力：
- 深度挖掘產品核心價值
- 識別目標人群的隱藏痛點
- 提供具體可用的 hook 句式
- 對比競爭對手找差異化切入點`,
    userPromptTemplate: `【任務】挖掘產品角度與賣點

【產品】{{product}}
【品牌】{{brand}}
【目標受眾】{{audience}}
【產品好處/賣點】{{benefits}}
【痛點】{{painPoint}}
{{#if offer}}
【優惠/促成】{{offer}}
{{/if}}
{{#if platform}}
【主要平台】{{platform}}
{{/if}}
{{#if market}}
【市場背景】{{market}}
{{/if}}
{{#if tone}}
【風格調性】{{tone}}
{{/if}}
{{#if extra}}
【額外背景】{{extra}}
{{/if}}
{{#if brandVoice}}
【品牌風格】{{brandVoice}}
{{/if}}
【語言】{{language}}`,
    outputInstructions: `你必須返回一個 pure JSON object，不能有 markdown、不能在 \`\`\`json 塊內、不能有任何其他文字。

Schema:
{
  "productName": "string (產品名稱或品類)",
  "coreValue": "string (一句話總結產品核心價值主張)",
  "painPoints": [
    {
      "pain": "string (痛點描述)",
      "severity": "high | medium | low (對目標受眾的重要性)",
      "language": "string (目標受眾描述這個痛點時的慣用語)"
    }
  ],
  "sellingPoints": [
    {
      "benefit": "string (賣點/好處)",
      "proof": "string (可驗證的證據或例子)",
      "emotionalTrigger": "string (觸發的情感類型：恐懼/渴望/歸屬/認可等)"
    }
  ],
  "targetPersona": {
    "persona": "string (人物角色名稱/暱稱)",
    "demographics": "string (人口統計：年齡、職業、收入、位置)",
    "psychographics": "string (心理特徵：價值觀、生活方式、興趣)",
    "biggestObjection": "string (這類人群最常見的反對理由)"
  },
  "hookExamples": [
    {
      "hook": "string (具體可用的 hook 句式)",
      "platform": "string (適用的平台：FB/IG/GF/小紅書等)",
      "format": "string (內容格式：圖文/影片/文案/Story)"
    }
  ],
  "competitiveEdge": "string (與同類產品相比的最大差異化優勢)",
  "reasoning": "string (分析這個定位背後的邏輯)",
  "scores": {
    "clarity": "number 1-10, 定位是否清晰易懂",
    "persuasiveness": "number 1-10, 論點是否有說服力",
    "uniqueness": "number 1-10, 角度是否足夠獨特差異化"
  }
}`,
  },
};

// ─────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────

/** Get all modes as array */
export function getCopywritingModes(): CopywritingModeDefinition[] {
  return Object.values(COPYWRITING_MODES);
}

/** Get mode definition by id */
export function getModeDefinition(
  modeId: CopywritingModeId
): CopywritingModeDefinition | undefined {
  return COPYWRITING_MODES[modeId];
}

/** Get language rules as string */
export function getLanguageRules(
  language: NonNullable<CopywritingModeInput["language"]>
): string {
  return LANGUAGE_RULES[language] ?? LANGUAGE_RULES.traditional_chinese;
}

/** Get credits cost for a mode */
export function getModeCredits(modeId: CopywritingModeId): number {
  return COPYWRITING_MODES[modeId]?.credits ?? 15;
}
