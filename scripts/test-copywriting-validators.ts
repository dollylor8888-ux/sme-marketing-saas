/**
 * Offline Validator Test Script — Copywriting Engine v2
 * 
 * Tests validators with mock valid/invalid outputs WITHOUT calling AI API.
 * Use this to verify validator logic before going live.
 * 
 * Run: npx tsx scripts/test-copywriting-validators.ts
 */

import { validateOutputByMode } from "../src/lib/skills/copywriting/validators";
import type {
  CopywritingModeId,
  AdCopySetOutput,
  CampaignDirectionOutput,
  ProductAngleExplorerOutput,
} from "../src/lib/skills/copywriting/types/modes";

// ─────────────────────────────────────────
// Mock Valid Outputs
// ─────────────────────────────────────────

const validAdCopySetOutput: AdCopySetOutput = {
  angle: "價格優惠切入",
  angleExplanation: "母親節送禮市場，價格優惠係最強驅動因素",
  headline: "母親節摰獻｜LumiClear 美白精華低至8折",
  headlineCharCount: 21,
  primaryText: "香港夏天就到，色斑黑色素浮哂出嚟？LumiClear 4週見效，保濕美白一 take 過。母親節買二送一，唔好嘥氣！",
  primaryTextCharCount: 61,
  description: "母親節限定優惠・香港免費送貨",
  descriptionCharCount: 17,
  cta: "立即查看",
  whyThisWorks: "母親節送禮場景 + 優惠力度強 + 清楚call to action",
  riskNote: "避免過度承諾見效時間；確保「買二送一」庫存充足",
  testingNotes: "A/B測試： headline 優惠強調 vs 產品功效強調，睇邊個CTR更高",
  platformLimitWarnings: [
    "Facebook不允許「最有效」「第一」等最高級詞彙",
    "避免提及「醫學級」「臨床證明」等醫療聲稱",
  ],
  scores: {
    clarity: 9,
    conversion: 8,
    brandFit: 9,
    cantoneseAuthenticity: 9,
  },
};

const validCampaignDirectionOutput: CampaignDirectionOutput = {
  mainTheme: "「母親節・送給媽媽最好的禮物」",
  campaignGoal: "母親節檔期 HK$50,000 銷售額；建立 OmmiCare 送禮品牌形象",
  campaignDirections: [
    {
      direction: "情感共鳴路線",
      rationale: "母親節係情感主導節日，打情感牌最易引起共鳴",
      channels: ["Facebook Feed", "Instagram Story", "WhatsApp"],
    },
    {
      direction: "功效對比路線",
      rationale: "美白產品最難建立信任，用效果說話最直接",
      channels: ["Facebook Feed", "小紅書"],
    },
  ],
  suggestedAngles: [
    {
      angle: "送禮場景",
      hook: "今年母親節，唔好送朱古力，送白雪雪既靚",
      supportingPoint: "每個媽媽都想女兒靚，靚係最窩心既禮物",
      emotionalTrigger: "愛與感恩",
    },
    {
      angle: "功效保證",
      hook: "4週告別暗啞肌，媽媽見到實開心",
      supportingPoint: "SGS認證 + 真人用家分享",
      emotionalTrigger: "安心感與期待",
    },
  ],
  creativeTestingPlan: [
    {
      phase: "第一週：情感角度預熱",
      copies: ["母親節送給媽媽的白皙禮物", "每個媽媽都值得擁有的美白精華"],
      testFocus: "情感角度 vs 功效角度 CTR",
      duration: "5-7天",
    },
    {
      phase: "第二週：功效角度收購",
      copies: ["4週見效・香港女性見證", "SGS認證・告別色斑困擾"],
      testFocus: "不同功效聲稱的轉化率",
      duration: "5-7天",
    },
  ],
  budgetGuidance: {
    low: "HK$3,000：集中 Facebook，測試2個角度，側重情感路線",
    medium: "HK$5,000：Facebook + Instagram 雙渠道，各2個角度測試",
    high: "HK$10,000+：全渠道覆蓋，系統化測試矩陣，加投 KOL",
    allocationAdvice: "60% 效果廣告（dynamic product ads）、30% 品牌廣告（awareness）、10% 創意測試預算",
  },
  nextActions: [
    {
      action: "拍攝 2-3 條母親節短片（情感線 + 功效線）",
      priority: "high",
      timeline: "本週內完成",
    },
    {
      action: "整理用家見證和 before/after 圖片",
      priority: "high",
      timeline: "3天內",
    },
    {
      action: "設定 Facebook Pixel 和轉化追蹤",
      priority: "medium",
      timeline: "下週前",
    },
  ],
  scores: {
    relevance: 9,
    feasibility: 8,
    differentiation: 7,
  },
};

const validProductAngleExplorerOutput: ProductAngleExplorerOutput = {
  corePositioning: "為香港女性設計的夏日美白恩物——質地清爽、4週見效、母親節送禮首選",
  painPoints: [
    {
      pain: "香港夏天濕熱，化妝品易溶，護膚品太笠",
      severity: "high",
      language: "成日出油，塊面立敕敕咁",
      emotionalWeight: "煩躁同自信下降",
    },
    {
      pain: "色斑和暗瘡印難以消退",
      severity: "high",
      language: "退唔到印，化妆都吾蓋得住",
      emotionalWeight: "長期困擾同無助感",
    },
    {
      pain: "試過好多美白產品都冇效",
      severity: "medium",
      language: "已經冇信心了，試到慣咗失望",
      emotionalWeight: "消費疲勞同懷疑",
    },
  ],
  sellingPoints: [
    {
      benefit: "質地超清爽，適合香港濕熱天氣",
      proof: "香港用家測試，95%表示質地比同類產品更清爽",
      emotionalTrigger: "舒適感與安心感",
      howToCommunicate: "强调「一抹吸收」「唔黏笠」「用完可以即刻化妆」",
    },
    {
      benefit: "4週看見明顯美白效果",
      proof: "臨床測試結果 + 100位香港女性用家見證",
      emotionalTrigger: "希望與期待",
      howToCommunicate: "Before/after 圖片 + 具體時間「4週」",
    },
    {
      benefit: "保濕 + 美白，兩效合一",
      proof: "配方含有玻尿酸和維他命C衍生物",
      emotionalTrigger: "便利性與性價比",
      howToCommunicate: "「一枝搞掂，唔洗疊羅衣」",
    },
  ],
  targetPersonas: [
    {
      persona: "在職媽媽（Amy）",
      demographics: "30-40歲，在職女性，有1-2個小朋友，家庭月入HK$40,000+",
      psychographics: "注重效率，護膚要快夾正；願意為品質俾多啲錢；鍾意睇KOL推荐",
      biggestObjection: "太貴/見效慢",
      preferredAngle: "功效保證 + 母親節送禮場景",
    },
    {
      persona: "愛美OL（Susan）",
      demographics: "25-32歲，OL，長時間對電腦，空閒時間少",
      psychographics: "護膚係必需品但唔想花太多時間；注重CP值；樂於嘗試新產品",
      biggestObjection: "質地太笠/性價比不高",
      preferredAngle: "清爽質地 +性價比",
    },
  ],
  objections: [
    {
      objection: "市面上美白產品聲稱有效但係用完冇反應",
      response: "LumiClear有SGS認證，4週見效，無效退款保障",
      severity: "high",
    },
    {
      objection: "質地會唔會好笠？香港夏天用唔用得？",
      response: "專為香港濕熱氣候設計，超清爽配方，用家實測唔黏笠",
      severity: "high",
    },
    {
      objection: "母親節優惠係咪真係幾好",
      response: "買二送一，平均每枝等於原價既67%，非常劃算",
      severity: "medium",
    },
  ],
  testableAngles: [
    {
      angle: "母親節送禮",
      hypothesis: "母親節期間，送禮場景角度比個人使用角度點擊率更高",
      whatToTest: "「送給媽媽的美白恩物」vs「自己用的美白精華」",
      successMetric: "CTR提升30%以上",
      priority: "high",
    },
    {
      angle: "清爽質地 vs 美白功效",
      hypothesis: "香港夏天，質地清爽係最強嘅購買驅動因素",
      whatToTest: "「質地超清爽」vs「4週美白效果」邊個CTR更高",
      successMetric: "CTR提升20%以上",
      priority: "high",
    },
  ],
  hookExamples: [
    {
      hook: "阿媽今年母親節想要白雪雪既肌膚✨",
      platform: "Facebook",
      format: "圖文帖文",
      angleUsed: "母親節送禮",
    },
    {
      hook: "香港夏天用到嘅美白精華！質地超light！",
      platform: "Instagram",
      format: "Reels短片",
      angleUsed: "清爽質地",
    },
    {
      hook: "用咗4週，色斑真係淡咗好多🇭🇰",
      platform: "小紅書",
      format: "用家分享帖",
      angleUsed: "功效保證",
    },
  ],
  testingPriority: "優先測試母親節送禮角度（高相關性 + 高轉化潛力），其次測試清爽質地角度",
  riskNote: "如果母親節檔期競爭激烈，大品牌搶流量，我哋需要更強既差異化角度先可以突圍",
  scores: {
    clarity: 9,
    persuasiveness: 8,
    uniqueness: 7,
  },
};

// ─────────────────────────────────────────
// Mock Invalid Outputs
// ─────────────────────────────────────────

const invalidAdCopySetOutputs = [
  {
    label: "Missing required field: angle",
    output: {
      headline: "母親節摰獻｜LumiClear 美白精華低至8折",
      headlineCharCount: 21,
      primaryText: "香港夏天就到，色斑黑色素浮哂出嚟？LumiClear 4週見效，保濕美白一 take 過。母親節買二送一，唔好嘥氣！",
      primaryTextCharCount: 61,
      description: "母親節限定優惠・香港免費送貨",
      descriptionCharCount: 17,
      cta: "立即查看",
      whyThisWorks: "母親節送禮場景 + 優惠力度強 + 清楚call to action",
      riskNote: "避免過度承諾見效時間；確保「買二送一」庫存充足",
      testingNotes: "A/B測試： headline 優惠強調 vs 產品功效強調，睇邊個CTR更高",
      platformLimitWarnings: [
        "Facebook不允許「最有效」「第一」等最高級詞彙",
        "避免提及「醫學級」「臨床證明」等醫療聲稱",
      ],
      scores: { clarity: 9, conversion: 8, brandFit: 9, cantoneseAuthenticity: 9 },
    } as unknown,
  },
  {
    label: "Wrong type: headlineCharCount is string",
    output: { ...validAdCopySetOutput, headlineCharCount: "21" } as unknown,
  },
  {
    label: "Over character limit: headline > 44 chars",
    output: {
      angle: "價格優惠切入",
      angleExplanation: "母親節送禮市場，價格優惠係最強驅動因素",
      headline: "母親節摰獻｜LumiClear 美白精華液低至8折優惠，滿額再送旅行裝試用裝面膜全套呵護裝",
      headlineCharCount: 49,
      primaryText: "香港夏天就到，色斑黑色素浮哂出嚟？LumiClear 4週見效，保濕美白一 take 過。母親節買二送一，唔好嘥氣！",
      primaryTextCharCount: 61,
      description: "母親節限定優惠",
      descriptionCharCount: 8,
      cta: "立即查看",
      whyThisWorks: "母親節送禮場景 + 優惠力度強 + 清楚call to action",
      riskNote: "避免過度承諾見效時間",
      testingNotes: "A/B測試",
      platformLimitWarnings: ["Facebook不允許最高級詞彙"],
      scores: { clarity: 9, conversion: 8, brandFit: 9 },
    } as unknown,
  },
  {
    label: "Over character limit: description > 33 chars",
    output: {
      angle: "價格優惠切入",
      angleExplanation: "母親節送禮市場",
      headline: "母親節摰獻｜LumiClear 美白精華低至8折",
      headlineCharCount: 21,
      primaryText: "香港夏天就到，色斑黑色素浮哂出嚟？LumiClear 4週見效，保濕美白一 take 過。母親節買二送一，唔好嘥氣！",
      primaryTextCharCount: 61,
      description: "母親節限定優惠・香港/澳門/台灣/新加坡全店免運費優惠ing母親節上架",
      descriptionCharCount: 35,
      cta: "立即查看",
      whyThisWorks: "母親節送禮場景 + 優惠力度強",
      riskNote: "避免過度承諾見效時間",
      testingNotes: "A/B測試",
      platformLimitWarnings: ["Facebook不允許最高級詞彙"],
      scores: { clarity: 9, conversion: 8, brandFit: 9 },
    } as unknown,
  },
  {
    label: "Score out of range: clarity = 15",
    output: { ...validAdCopySetOutput, scores: { ...validAdCopySetOutput.scores, clarity: 15 } } as unknown,
  },
];

const invalidCampaignDirectionOutputs = [
  {
    label: "Missing required field: mainTheme (providing only campaignGoal)",
    output: {
      campaignGoal: "母親節檔期 HK$50,000 銷售額",
      campaignDirections: [
        {
          direction: "情感共鳴路線",
          rationale: "母親節係情感主導節日",
          channels: ["Facebook Feed", "Instagram Story"],
        },
      ],
      suggestedAngles: [
        {
          angle: "送禮場景",
          hook: "今年母親節，唔好送朱古力",
          supportingPoint: "每個媽媽都想要靚",
          emotionalTrigger: "愛與感恩",
        },
      ],
      creativeTestingPlan: [
        {
          phase: "第一週",
          copies: ["母親節送給媽媽的白皙禮物"],
          testFocus: "情感角度 vs 功效角度",
          duration: "5-7天",
        },
      ],
      budgetGuidance: {
        low: "HK$3,000",
        medium: "HK$5,000",
        high: "HK$10,000+",
        allocationAdvice: "60%效果廣告",
      },
      nextActions: [
        { action: "拍攝母親節短片", priority: "high", timeline: "本週內" },
      ],
      scores: { relevance: 9, feasibility: 8, differentiation: 7 },
    } as unknown,
  },
  {
    label: "Wrong type: nextActions[0].priority not in enum",
    output: {
      ...validCampaignDirectionOutput,
      nextActions: [{ action: "test", priority: "urgent" as unknown as "high" | "medium" | "low", timeline: "today" }],
    } as unknown,
  },
];

const invalidProductAngleExplorerOutputs = [
  {
    label: "Missing required field: corePositioning (providing only painPoints)",
    output: {
      painPoints: [
        {
          pain: "香港夏天濕熱，化妝品易溶",
          severity: "high",
          language: "成日出油，塊面立敕敕咁",
          emotionalWeight: "煩躁同自信下降",
        },
      ],
      sellingPoints: [
        {
          benefit: "質地超清爽",
          proof: "95%用家表示更清爽",
          emotionalTrigger: "舒適感",
          howToCommunicate: "一抹吸收",
        },
      ],
      targetPersonas: [
        {
          persona: "在職媽媽Amy",
          demographics: "30-40歲，在職女性",
          psychographics: "注重效率",
          biggestObjection: "太貴",
          preferredAngle: "功效保證",
        },
      ],
      objections: [
        {
          objection: "用完冇反應",
          response: "SGS認證，無效退款",
          severity: "high",
        },
      ],
      testableAngles: [
        {
          angle: "母親節送禮",
          hypothesis: "送禮場景點擊率更高",
          whatToTest: "送禮 vs 自用",
          successMetric: "CTR提升30%",
          priority: "high",
        },
      ],
      hookExamples: [
        {
          hook: "阿媽今年母親節想要白雪雪既肌膚",
          platform: "Facebook",
          format: "圖文帖文",
          angleUsed: "母親節送禮",
        },
      ],
      testingPriority: "優先測試母親節送禮角度",
      riskNote: "競爭激烈需要差異化",
      scores: { clarity: 9, persuasiveness: 8, uniqueness: 7 },
    } as unknown,
  },
  {
    label: "Wrong severity value in painPoints",
    output: {
      ...validProductAngleExplorerOutput,
      painPoints: [{ ...validProductAngleExplorerOutput.painPoints[0], severity: "very_high" as unknown }],
    } as unknown,
  },
  {
    label: "Score out of range: uniqueness = 0",
    output: {
      ...validProductAngleExplorerOutput,
      scores: { ...validProductAngleExplorerOutput.scores, uniqueness: 0 },
    } as unknown,
  },
];

// ─────────────────────────────────────────
// Test Runner
// ─────────────────────────────────────────

interface TestResult {
  mode: CopywritingModeId;
  totalValid: number;
  totalInvalid: number;
  passedValid: number;
  passedInvalid: number;
  details: {
    description: string;
    expected: "pass" | "fail";
    actual: "pass" | "fail";
    reason?: string;
    ok: boolean;
  }[];
}

function runTests(
  mode: CopywritingModeId,
  validOutput: unknown,
  invalidOutputs: { label: string; output: unknown }[]
): TestResult {
  const result: TestResult = {
    mode,
    totalValid: 1 + invalidOutputs.length,
    totalInvalid: invalidOutputs.length,
    passedValid: 0,
    passedInvalid: 0,
    details: [],
  };

  // Test valid output
  const validResult = validateOutputByMode(mode, validOutput);
  const validPass = validResult.valid === true;
  if (validPass) result.passedValid++;
  result.details.push({
    description: "[VALID] Should pass",
    expected: "pass",
    actual: validPass ? "pass" : "fail",
    reason: validPass ? undefined : validResult.error,
    ok: validPass,
  });

  // Test invalid outputs
  for (const inv of invalidOutputs) {
    const invResult = validateOutputByMode(mode, inv.output);
    const invPass = invResult.valid === false;
    if (invPass) result.passedInvalid++;
    result.details.push({
      description: `[INVALID] ${inv.label}`,
      expected: "fail",
      actual: invPass ? "fail" : "pass",
      reason: invPass ? undefined : `Should have failed but got: ${JSON.stringify(invResult)}`,
      ok: invPass,
    });
  }

  return result;
}

// ─────────────────────────────────────────
// Output Helpers
// ─────────────────────────────────────────

function divider(char: string = "=", width: number = 80): string {
  return char.repeat(width);
}

function section(title: string): string {
  return `\n${divider("=")}\n${title}\n${divider("=")}`;
}

function formatResult(result: TestResult): string {
  const lines: string[] = [];
  const validOk = result.passedValid;
  const invalidOk = result.passedInvalid;
  const total = validOk + invalidOk;
  const totalTests = result.totalValid + result.totalInvalid;
  const allPass = total === totalTests;

  lines.push(section(`MODE: ${result.mode}`));
  lines.push(`Valid tests: ${validOk}/${result.totalValid} passed`);
  lines.push(`Invalid rejection: ${invalidOk}/${result.totalInvalid} passed`);
  lines.push(`Overall: ${total}/${totalTests} passed ${allPass ? "✅" : "❌"}`);
  lines.push(divider("-"));

  for (const d of result.details) {
    const icon = d.ok ? "✅" : "❌";
    lines.push(`${icon} ${d.description}`);
    lines.push(`   Expected: ${d.expected} | Actual: ${d.actual}`);
    if (d.reason) lines.push(`   Reason: ${d.reason}`);
  }

  return lines.join("\n");
}

// ─────────────────────────────────────────
// Main
// ─────────────────────────────────────────

async function main() {
  console.log(divider());
  console.log("COPYWRITING ENGINE v2 — OFFLINE VALIDATOR TESTS");
  console.log("Generated at:", new Date().toISOString());
  console.log("NOTE: No AI API called. No credits used.");
  console.log(divider());

  const results: TestResult[] = [];

  // ad_copy_set
  results.push(runTests("ad_copy_set", validAdCopySetOutput, invalidAdCopySetOutputs));

  // campaign_direction
  results.push(runTests("campaign_direction", validCampaignDirectionOutput, invalidCampaignDirectionOutputs));

  // product_angle_explorer
  results.push(runTests("product_angle_explorer", validProductAngleExplorerOutput, invalidProductAngleExplorerOutputs));

  // Output all results
  let allPassed = true;
  for (const result of results) {
    const output = formatResult(result);
    console.log(output);
    const total = result.passedValid + result.passedInvalid;
    const totalTests = result.totalValid + result.totalInvalid;
    if (total !== totalTests) allPassed = false;
  }

  // Summary
  console.log(section("SUMMARY"));
  const totalTests = results.reduce((acc, r) => acc + r.totalValid + r.totalInvalid, 0);
  const totalPassed = results.reduce((acc, r) => acc + r.passedValid + r.passedInvalid, 0);
  console.log(`Total: ${totalPassed}/${totalTests} tests passed ${allPassed ? "✅ ALL PASS" : "❌ SOME FAILED"}`);
  console.log(section("VALIDATOR TESTS COMPLETE"));
}

main().catch(console.error);
