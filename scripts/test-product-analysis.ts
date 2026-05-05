/**
 * Test script for Product Analysis
 * 
 * Usage:
 *   npx tsx scripts/test-product-analysis.ts
 */

import { generateProductAnalysis, calculateTokenCost } from "../src/lib/skills/product-analysis";
import type { ProductAnalysisInput } from "../src/lib/skills/product-analysis/types";

async function main() {
  console.log("🧪 Product Analysis Test\n");
  console.log("=".repeat(50));

  // Test Case: OmmiCare 亮白精華液
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

  console.log("\n📦 Input Product:");
  console.log(JSON.stringify(testInput, null, 2));

  console.log("\n⏳ Generating analysis...\n");

  const startTime = Date.now();
  const result = await generateProductAnalysis({ input: testInput, trackTokens: true });
  const elapsed = Date.now() - startTime;

  console.log("=".repeat(50));
  console.log("\n✅ Analysis Result:\n");

  if (result.success) {
    console.log("📌 Tagline:");
    console.log(`   ${result.tagline}`);
    
    console.log("\n📌 FABS:");
    console.log(`   Feature: ${result.fabs.feature}`);
    console.log(`   Advantage: ${result.fabs.advantage}`);
    console.log(`   Benefit: ${result.fabs.benefit}`);
    console.log(`   Selling Point: ${result.fabs.sellingPoint}`);

    console.log("\n📌 Use Cases:");
    result.useCases.forEach((uc, i) => {
      console.log(`   ${i + 1}. [${uc.id}] ${uc.persona}`);
      console.log(`      WHEN: ${uc.when}`);
      console.log(`      WHERE: ${uc.where}`);
      console.log(`      PAIN: ${uc.painPoint}`);
      console.log(`      ACTION: ${uc.action}`);
      console.log(`      REWARD: ${uc.reward}`);
      console.log(`      FEELING: ${uc.feeling}`);
      console.log("");
    });

    console.log("📌 Emotional Values:");
    result.emotionalValues.forEach((ev, i) => {
      console.log(`   ${i + 1}. ${ev.emotion}`);
      console.log(`      Hook: ${ev.hook}`);
      console.log(`      Ad Angle: ${ev.advertisingAngle}`);
      console.log("");
    });

    console.log("📌 Differentiation:");
    result.differentiation.forEach((d, i) => {
      console.log(`   ${i + 1}. vs ${d.vs}`);
      console.log(`      Advantage: ${d.ourAdvantage}`);
      console.log(`      Claim: ${d.claim}`);
      console.log("");
    });

    console.log("📌 Proof Points:");
    result.proofPoints.forEach((pp, i) => {
      console.log(`   ${i + 1}. [${pp.type}] ${pp.content}`);
      console.log(`      Can Claim Now: ${pp.canClaimNow}`);
      if (pp.howToBuild) console.log(`      How to Build: ${pp.howToBuild}`);
      console.log("");
    });
  } else {
    console.log("❌ Analysis Failed:", result.error);
  }

  console.log("=".repeat(50));
  console.log(`\n⏱️ Time: ${elapsed}ms`);

  if (result.tokensUsed) {
    const cost = calculateTokenCost(result.tokensUsed);
    console.log(`📊 Tokens:`);
    console.log(`   Input:  ${cost.inputTokens.toLocaleString()} tokens`);
    console.log(`   Output: ${cost.outputTokens.toLocaleString()} tokens`);
    console.log(`   Total:  ${cost.totalTokens.toLocaleString()} tokens`);
    console.log(`\n💰 Cost:`);
    console.log(`   Input:  $${cost.inputCostUsd.toFixed(6)}`);
    console.log(`   Output: $${cost.outputCostUsd.toFixed(6)}`);
    console.log(`   Total:  $${cost.totalCostUsd.toFixed(6)}`);
    console.log(`\n💎 Credits Used: ${result.creditsUsed ?? 20}`);
  }

  console.log("\n✅ Test Complete!");
}

main().catch(console.error);
