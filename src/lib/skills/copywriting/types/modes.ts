/**
 * Copywriting Modes — mode-based prompt and output control (v2)
 *
 * Upgraded with Marketing Skill structure:
 * 1. product-marketing-context as foundation
 * 2. ad-creative generates angles first, then variations
 * 3. paid-ads informs campaign direction
 * 4. copywriting reserved for page/product copy
 *
 * Modes:
 * 1. ad_copy_set        — FB/IG ad: angle + headline + primary text + description + CTA + variations
 * 2. campaign_direction — Monthly marketing plan with direction + angles + budget + actions
 * 3. product_angle_explorer — Selling points, pain points, hooks, testable angles
 */

// ─────────────────────────────────────────
// Mode IDs
// ─────────────────────────────────────────

export type CopywritingModeId =
  | "ad_copy_set"
  | "campaign_direction"
  | "product_angle_explorer";

// ─────────────────────────────────────────
// Extended Input Type (Product Marketing Context)
// ─────────────────────────────────────────

export interface CopywritingModeInput {
  mode: CopywritingModeId;

  // ── Core required fields ──
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

  // ── Extended Product Marketing Context ──
  /** Product overview / category */
  productOverview?: string;
  /** Key differentiators vs competition */
  differentiators?: string;
  /** Known customer objections */
  objections?: string;
  /** How customers describe the problem/solution in their own words */
  customerLanguage?: string;
  /** Words and phrases to actively use */
  wordsToUse?: string[];
  /** Words and phrases to avoid */
  wordsToAvoid?: string[];
  /** Social proof, reviews, case studies, certifications */
  proofPoints?: string[];
  /** Campaign or business goals */
  goals?: string;

  // ── Brand Voice ──
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

/** ad_copy_set output — v2 with angle-first, multi-copies */
export interface AdCopySetOutput {
  // Which angle this copy is based on
  angle: string;
  angleExplanation: string;

  // Copy elements with character counts
  headline: string;
  headlineCharCount: number;
  primaryText: string;
  primaryTextCharCount: number;
  description: string;
  descriptionCharCount: number;
  cta: string;

  // Why it works + risk note
  whyThisWorks: string;
  riskNote: string;

  // Testing guidance
  testingNotes: string;
  platformLimitWarnings: string[];

  // Scoring
  scores: {
    clarity: number;
    conversion: number;
    brandFit: number;
    cantoneseAuthenticity?: number;
  };
}

/** campaign_direction output — v2 with monthly plan + actionable next steps */
export interface CampaignDirectionOutput {
  mainTheme: string;
  campaignGoal: string;

  // Core directions
  campaignDirections: {
    direction: string;
    rationale: string;
    channels: string[];
  }[];

  // Angles to explore
  suggestedAngles: {
    angle: string;
    hook: string;
    supportingPoint: string;
    emotionalTrigger: string;
  }[];

  // Creative testing plan
  creativeTestingPlan: {
    phase: string;
    copies: string[];
    testFocus: string;
    duration: string;
  }[];

  // Budget guidance
  budgetGuidance: {
    low: string;
    medium: string;
    high: string;
    allocationAdvice: string;
  };

  // Actionable next steps
  nextActions: {
    action: string;
    priority: "high" | "medium" | "low";
    timeline: string;
  }[];

  scores: {
    relevance: number;
    feasibility: number;
    differentiation: number;
  };
}

/** product_angle_explorer output — v2 with testable angles + risk */
export interface ProductAngleExplorerOutput {
  corePositioning: string;

  // Expanded pain points
  painPoints: {
    pain: string;
    severity: "high" | "medium" | "low";
    language: string;
    emotionalWeight: string;
  }[];

  // Expanded selling points
  sellingPoints: {
    benefit: string;
    proof: string;
    emotionalTrigger: string;
    howToCommunicate: string;
  }[];

  // Multiple personas
  targetPersonas: {
    persona: string;
    demographics: string;
    psychographics: string;
    biggestObjection: string;
    preferredAngle: string;
  }[];

  // Known objections + how to overcome
  objections: {
    objection: string;
    response: string;
    severity: "high" | "medium" | "low";
  }[];

  // Testable advertising angles
  testableAngles: {
    angle: string;
    hypothesis: string;
    whatToTest: string;
    successMetric: string;
    priority: "high" | "medium" | "low";
  }[];

  // Hook examples per platform
  hookExamples: {
    hook: string;
    platform: string;
    format: string;
    angleUsed: string;
  }[];

  testingPriority: string;
  riskNote: string;

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
// Mode Definition
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
// Language Rules — HK Market Focused
// ─────────────────────────────────────────

export const LANGUAGE_RULES: Record<
  NonNullable<CopywritingModeInput["language"]>,
  string
> = {
  traditional_chinese: `
## 語言規則 — 繁體中文（香港/台灣市場）

- 繁體中文
- 台/港式中文遣詞用句
- 避免：大陸慣用語、「種草」「乾貨」「老公」「小姐姐」「閨蜜」「乾飯人」等淘寶式/小紅書用語
- 避免：過於文縐縐的官方措辭
- 避免：直接，普通話直譯
- 避免：醫療聲稱或誇大療效（除非客户提供並確認合法）
- 用字：自然、口語化、有溫度、接地氣
- 標點符號：全形標點（，。：；？！）
`.trim(),

  cantonese: `
## 語言規則 — 粵語口語（香港市場）

- 粵語口語為主
- 常用粵語：「我哋」「你哋」「咁」「喺」「唔」「夠鐘」「正嘢」「超抵」「懶醒」「hea」「搵笨」「伏已隱藏」「爆場」「甩碌」「中伏」「為食」「貪靚」「扮靚」「好嘢」「冇得輸」
- 避免：普通話直接翻譯成粵語（呃話→呃人、老公→老公、種草→種草）
- 避免：「老師」「家人」「小紅書風格」「寶寶輔食」
- 語氣：夠掂、幾好喈、無得輸、自然唔浮
- 避免：醫療聲稱或誇大療效（除非客户提供並確認合法）
- 標點符號：全形標點（，。：；？！）
`.trim(),

  english: `
## Language Rules — English (HK/Asian market)

- English copy
- Conversational but professional tone
- HK/Asian market context
- Avoid: corporate stiff language, generic AI feel
- Avoid: exaggerated medical or health claims unless provided and legally verified
- Avoid: mainland Chinese internet slang
- Tone: natural, direct, action-oriented
`.trim(),
};

// ─────────────────────────────────────────
// Mode Definitions — Full System Prompts
// ─────────────────────────────────────────

const AD_COPY_SYSTEM_PROMPT = `你是一位專門為香港/亞洲市場的創意廣告文案專家。

你的方法論：
1. **先選角度，再寫文案** — 每套文案都基於一個清晰的 marketing angle
2. **了解受眾語言** — 用受眾自己的話說他們的痛點和渴望
3. **避免罐頭語言** — 不使用generic AI copy，不使用淘寶/小紅書用語
4. **平台合規** — 了解 FB/IG/GC 廣告政策限制

忌用：
- 大陸淘寶式用語（種草、乾貨、老公、小姐姐、閨蜜、乾飯人）
- 過於官方/文縐縐的措辭
- 普通話直譯粵語
- 醫療聲稱或誇大療效（除非客户提供並確認合法）
- generic AI feel 的罐頭語言：「立即行動」「不容錯過」「改變你的人生」

每次輸出：
- 先說明你選的 angle 和為什麼
- 再提供完整文案
- 最後說明測試建議`;

const CAMPAIGN_DIRECTION_SYSTEM_PROMPT = `你是一位資深的營銷策略顧問，專精香港/亞洲市場的中小企業推廣策劃。

你的方法論：
1. **結合時節** — 月份、節日、季節性消費行為
2. **可執行性** — 每個建議都要能落地執行
3. **測試優先** — 給出具體的創意測試計劃
4. **預算合理** — 根據不同預算給出實際建議

忌用：
- 過於宏大但無法落地的策略
- 不適合香港市場的推廣方式
- 醫療聲稱或誇大療效

每次輸出：
- 清晰的 campaign 主題
- 2-3個核心推廣方向
- 每個方向的具體切入角度
- 創意測試時間表
- 按預算水平的資源分配建議
- 明確的下一步行動`;

const PRODUCT_ANGLE_EXPLORER_SYSTEM_PROMPT = `你是一位產品營銷策略師，擅長從產品功能、使用場景、情感需求等維度挖掘獨特銷售角度。

你的方法論：
1. **以人為本** — 從真實用戶的語言和痛點出發
2. **差異化優先** — 找到與競品相比的獨特位置
3. **可測試** — 每個角度都要能轉化為可測試的廣告假設
4. **風險意識** — 指出可能的風險和限制

忌用：
- 模糊的定位描述
- 無法實際使用的 hook
- 醫療聲稱或誇大療效（除非客户提供並確認合法）
- 不適合香港/亞洲市場的角度

每次輸出：
- 清晰的核心定位句
- 識別 3-5 個目標人群（不同 personas）
- 每個 persona 的首選角度
- 3-5 個可測試的廣告角度（附假設和成功指標）
- Hook 範例（按平台分類）
- 測試優先級建議
- 風險提示`;

const PRODUCT_CONTEXT_TEMPLATE = `{{#if productOverview}}
【產品概覽】{{productOverview}}
{{/if}}
{{#if differentiators}}
【差異化賣點】{{differentiators}}
{{/if}}
{{#if customerLanguage}}
【顧客語言】{{customerLanguage}}
{{/if}}
{{#if wordsToUse}}
【建議用詞】{{wordsToUse}}
{{/if}}
{{#if wordsToAvoid}}
【避免用詞】{{wordsToAvoid}}
{{/if}}
{{#if proofPoints}}
【證明/社會認同】{{proofPoints}}
{{/if}}
{{#if goals}}
【目標】{{goals}}
{{/if}}`;

const BRAND_VOICE_TEMPLATE = `{{#if brandVoice}}
【品牌風格】
{{#if brandVoice.name}}品牌名稱：{{brandVoice.name}}{{/if}}
{{#if brandVoice.tagline}}品牌標語：{{brandVoice.tagline}}{{/if}}
{{#if brandVoice.values}}品牌價值：{{brandVoice.values}}{{/if}}
{{#if brandVoice.voice}}品牌聲音：{{brandVoice.voice}}{{/if}}
{{#if brandVoice.style}}風格關鍵詞：{{brandVoice.style}}{{/if}}
{{/if}}`;

export const COPYWRITING_MODES: Record<CopywritingModeId, CopywritingModeDefinition> = {
  ad_copy_set: {
    id: "ad_copy_set",
    label: "Ad Copy Set",
    userLabel: "廣告文案套裝",
    description: "先選角度，再生成 FB/IG 廣告文案（Headline + Primary Text + Description + CTA）",
    credits: 15,
    supportedLanguages: ["traditional_chinese", "cantonese", "english"],

    systemPrompt: AD_COPY_SYSTEM_PROMPT,

    userPromptTemplate: `【任務】為以下產品生成一套廣告文案

## 產品背景
【產品】{{product}}
{{#if productOverview}}
【產品概覽】{{productOverview}}
{{/if}}
【品牌】{{brand}}
{{#if brandVoice}}
{{BRAND_VOICE_TEMPLATE}}
{{/if}}

## 目標受眾
【目標受眾】{{audience}}
{{#if customerLanguage}}
【顧客語言】{{customerLanguage}}
{{/if}}

## 價值主張
【產品好處】{{benefits}}
【痛點】{{painPoint}}
{{#if differentiators}}
【差異化賣點】{{differentiators}}
{{/if}}
{{#if proofPoints}}
【證明/社會認同】{{proofPoints}}
{{/if}}
{{#if objections}}
【已知反對意見】{{objections}}
{{/if}}

## 推廣條件
{{#if offer}}
【優惠/推廣】{{offer}}
{{/if}}
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
{{#if wordsToUse}}
【建議用詞】{{wordsToUse}}
{{/if}}
{{#if wordsToAvoid}}
【避免用詞】{{wordsToAvoid}}
{{/if}}
{{#if extra}}
【額外提示】{{extra}}
{{/if}}

【語言】{{language}}`,

    outputInstructions: `你必須返回一個 pure JSON object，不能有 markdown、不能在 \`\`\`json 塊內、不能有任何其他文字。

Schema:
{
  "angle": "string (這套文案的核心切入角度名稱，例如：'價格優勢'、'情感共鳴'、'解決痛點')",
  "angleExplanation": "string (解釋為什麼選擇這個角度，它如何與目標受眾產生共鳴)",
  "headline": "string (max 40 chars, attention-grabbing, benefit-focused)",
  "headlineCharCount": "number (headline 的實際字數)",
  "primaryText": "string (90-150 chars, emotional hook + value prop, end with soft CTA or question)",
  "primaryTextCharCount": "number (primaryText 的實際字數)",
  "description": "string (max 30 chars, supporting detail or social proof element)",
  "descriptionCharCount": "number (description 的實際字數)",
  "cta": "string (short action phrase: 2-5 words, e.g. '立即查看' / '報名試用' / '了解更多')",
  "whyThisWorks": "string (解釋這套文案為什麼能打動目標受眾)",
  "riskNote": "string (指出這套文案可能的風險或需要注意的事項，例如：'避免過度承諾'、'確保證據屬實')",
  "testingNotes": "string (A/B 測試建議，例如：測試哪個變量、如何判斷勝出)",
  "platformLimitWarnings": ["string (平台限制警告，例如：FB 不允許 '最' 等最高級詞彙)"],
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
    description: "根據產品/月/市場/目標，生成月度的整體推廣方向、創意測試計劃和下一步行動",
    credits: 20,
    supportedLanguages: ["traditional_chinese", "cantonese", "english"],

    systemPrompt: CAMPAIGN_DIRECTION_SYSTEM_PROMPT,

    userPromptTemplate: `【任務】為以下產品制定月度推廣策略

## 產品背景
【產品】{{product}}
{{#if productOverview}}
【產品概覽】{{productOverview}}
{{/if}}
【品牌】{{brand}}
{{#if brandVoice}}
{{BRAND_VOICE_TEMPLATE}}
{{/if}}

## 市場背景
【市場】{{market}}
【月份】{{month}}
【節日/活動】{{festival}}

## 目標受眾
【目標受眾】{{audience}}
{{#if customerLanguage}}
【顧客語言】{{customerLanguage}}
{{/if}}

## 產品價值
【產品好處】{{benefits}}
【痛點】{{painPoint}}
{{#if differentiators}}
【差異化賣點】{{differentiators}}
{{/if}}
{{#if proofPoints}}
【證明/社會認同】{{proofPoints}}
{{/if}}
{{#if objections}}
【已知反對意見】{{objections}}
{{/if}}

## 商業目標
【銷售目標】{{salesGoal}}
{{#if budgetLevel}}
【預算水平】{{budgetLevel}}
{{/if}}
{{#if goals}}
【目標】{{goals}}
{{/if}}
{{#if tone}}
【風格調性】{{tone}}
{{/if}}
{{#if extra}}
【額外背景】{{extra}}
{{/if}}

【語言】{{language}}`,

    outputInstructions: `你必須返回一個 pure JSON object，不能有 markdown、不能在 \`\`\`json 塊內、不能有任何其他文字。

Schema:
{
  "mainTheme": "string (本月 Campaign 的核心主題，一句話概括)",
  "campaignGoal": "string (本次 Campaign 的具體目標，例如：'增加品牌知名度30%'、'帶來500個新客')",
  "campaignDirections": [
    {
      "direction": "string (推廣方向名稱，例如：'情感共鳴路線')",
      "rationale": "string (為什麼選擇這個方向)",
      "channels": ["string (適用的渠道，例如：'Facebook Feed'、'Instagram Story'、'Google Search'）"]
    }
  ],
  "suggestedAngles": [
    {
      "angle": "string (切入角度名稱)",
      "hook": "string (鉤子句，用於引發興趣)",
      "supportingPoint": "string (支撐這個角度的論點或證據)",
      "emotionalTrigger": "string (觸發的情感類型：恐懼/渴望/歸屬/認可/好奇等）"
    }
  ],
  "creativeTestingPlan": [
    {
      "phase": "string (測試階段名稱，例如：'第一週：情感角度測試'）",
      "copies": ["string (該階段測試的文案/創意描述）"],
      "testFocus": "string (本次測試的重點變量，例如：'headline 情感 vs 理性'）",
      "duration": "string (測試持續時間，例如：'5-7天'）"
    }
  ],
  "budgetGuidance": {
    "low": "string (低預算建議，HK$xxx，推薦策略，例如：'集中单一渠道，測試2-3個角度'）",
    "medium": "string (中預算建議，HK$xxx，推薦策略，例如：'雙渠道並行，各測試2個角度'）",
    "high": "string (高預算建議，HK$xxx，推薦策略，例如：'全渠道覆蓋，系統化測試矩陣'）",
    "allocationAdvice": "string (跨渠道預算分配建議，例如：'60%效果廣告、30%品牌廣告、10%測試預算'）"
  },
  "nextActions": [
    {
      "action": "string (具體的下一步行動)",
      "priority": "high | medium | low (優先級)",
      "timeline": "string (建議時間，例如：'本週內'、'節日前2週'）"
    }
  ],
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
    description: "深度挖掘產品賣點、痛點、人群定位，生成可測試的廣告角度和 Hook 範例",
    credits: 15,
    supportedLanguages: ["traditional_chinese", "cantonese", "english"],

    systemPrompt: PRODUCT_ANGLE_EXPLORER_SYSTEM_PROMPT,

    userPromptTemplate: `【任務】深度分析產品角度與賣點

## 產品背景
【產品】{{product}}
{{#if productOverview}}
【產品概覽】{{productOverview}}
{{/if}}
【品牌】{{brand}}
{{#if brandVoice}}
{{BRAND_VOICE_TEMPLATE}}
{{/if}}

## 目標受眾
【目標受眾】{{audience}}
{{#if customerLanguage}}
【顧客語言】{{customerLanguage}}
{{/if}}

## 價值主張
【產品好處/賣點】{{benefits}}
【痛點】{{painPoint}}
{{#if differentiators}}
【差異化賣點】{{differentiators}}
{{/if}}
{{#if proofPoints}}
【證明/社會認同】{{proofPoints}}
{{/if}}
{{#if objections}}
【已知反對意見】{{objections}}
{{/if}}

## 推廣條件
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
{{#if wordsToUse}}
【建議用詞】{{wordsToUse}}
{{/if}}
{{#if wordsToAvoid}}
【避免用詞】{{wordsToAvoid}}
{{/if}}
{{#if extra}}
【額外背景】{{extra}}
{{/if}}

【語言】{{language}}`,

    outputInstructions: `你必須返回一個 pure JSON object，不能有 markdown、不能在 \`\`\`json 塊內、不能有任何其他文字。

Schema:
{
  "corePositioning": "string (一句話核心定位句，概括產品相對於目標受眾的最大價值)",
  "painPoints": [
    {
      "pain": "string (痛點描述)",
      "severity": "high | medium | low (對目標受眾的重要性)",
      "language": "string (目標受眾描述這個痛點時的慣用語)",
      "emotionalWeight": "string (這個痛點觸發的情感強度，例如：'輕微焦慮'、'強烈恐懼'、'長期困擾')"
    }
  ],
  "sellingPoints": [
    {
      "benefit": "string (賣點/好處)",
      "proof": "string (可驗證的證據或例子)",
      "emotionalTrigger": "string (觸發的情感類型：恐懼/渴望/歸屬/認可/好奇等）",
      "howToCommunicate": "string (如何在小篇幅廣告中傳達這個賣點)"
    }
  ],
  "targetPersonas": [
    {
      "persona": "string (人物角色名稱/暱稱)",
      "demographics": "string (人口統計：年齡、職業、收入、位置)",
      "psychographics": "string (心理特徵：價值觀、生活方式、興趣)",
      "biggestObjection": "string (這類人群最常見的反對理由)",
      "preferredAngle": "string (這類人群最可能被打動的切入角度)"
    }
  ],
  "objections": [
    {
      "objection": "string (反對意見原文)",
      "response": "string (如何回應這個反對意見)",
      "severity": "high | medium | low (這個反對意見的普遍程度)"
    }
  ],
  "testableAngles": [
    {
      "angle": "string (廣告角度名稱)",
      "hypothesis": "string (這個角度的假設，例如：'如果我們強調價格優勢目標顧客會更傾向於點擊'）",
      "whatToTest": "string (具體測試什麼，例如：'價格強調 vs 品質強調的 CTR'）",
      "successMetric": "string (如何判斷測試成功，例如：'CTR提升20%'）",
      "priority": "high | medium | low (測試優先級)"
    }
  ],
  "hookExamples": [
    {
      "hook": "string (具體可用的 hook 句式)",
      "platform": "string (適用的平台：FB/IG/GF/小紅書等)",
      "format": "string (內容格式：圖文/影片/文案/Story)",
      "angleUsed": "string (這個 hook 使用哪個角度)"
    }
  ],
  "testingPriority": "string (測試優先級建議：先測試哪個角度，為什麼)",
  "riskNote": "string (指出這個定位可能存在的風險，例如：'如果價格敏感人群不是核心受眾，這個角度可能會稀釋品牌'）",
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
