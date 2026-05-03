/**
 * Offline Prompt Preview Script — Copywriting Engine v2
 * 
 * Generates system prompt + user prompt for each mode WITHOUT calling AI API.
 * Use this to manually review prompt structure before going live.
 * 
 * Run: npx tsx scripts/test-copywriting-prompts.ts
 */

import {
  ommicareLumiClearAdCopySet,
  ommicareNeckWarmerCampaignDirection,
  ommicareEyeMaskProductAngleExplorer,
} from "../src/lib/skills/copywriting/test-fixtures/ommicare";
import { buildModeSystemPrompt, buildModeUserPrompt } from "../src/lib/skills/copywriting/prompts";
import { getOutputSchemaInstruction } from "../src/lib/skills/copywriting/prompts";
import type { CopywritingModeId } from "../src/lib/skills/copywriting/types/modes";

// ─────────────────────────────────────────
// Test Cases
// ─────────────────────────────────────────

interface TestCase {
  mode: CopywritingModeId;
  label: string;
  input: Parameters<typeof buildModeSystemPrompt>[1];
}

const testCases: TestCase[] = [
  {
    mode: "ad_copy_set",
    label: "OmmiCare LumiClear — Ad Copy Set (粵語)",
    input: ommicareLumiClearAdCopySet,
  },
  {
    mode: "campaign_direction",
    label: "OmmiCare Neck Warmer — Campaign Direction (繁中)",
    input: ommicareNeckWarmerCampaignDirection,
  },
  {
    mode: "product_angle_explorer",
    label: "OmmiCare Eye Mask — Product Angle Explorer (粵語)",
    input: ommicareEyeMaskProductAngleExplorer,
  },
];

// ─────────────────────────────────────────
// Output Helpers
// ─────────────────────────────────────────

function divider(char: string = "=", width: number = 80): string {
  return char.repeat(width);
}

function section(title: string): string {
  return `\n${divider("=")}\n${title}\n${divider("=")}`;
}

function subsection(title: string): string {
  return `\n${divider("-")}\n${title}\n${divider("-")}`;
}

function formatPrompt(text: string): string {
  // Word-wrap at 78 chars for readability
  return text
    .split("\n")
    .map((line) => {
      if (line.length <= 78) return line;
      const words = line.split(" ");
      let result = "";
      let currentLine = "";
      for (const word of words) {
        if ((currentLine + " " + word).trim().length <= 78) {
          currentLine = (currentLine + " " + word).trim();
        } else {
          if (currentLine) result += currentLine + "\n";
          currentLine = word;
        }
      }
      if (currentLine) result += currentLine;
      return result;
    })
    .join("\n");
}

// ─────────────────────────────────────────
// Main
// ─────────────────────────────────────────

async function main() {
  console.log(divider());
  console.log("COPYWRITING ENGINE v2 — OFFLINE PROMPT PREVIEW");
  console.log("Generated at:", new Date().toISOString());
  console.log("NOTE: No AI API called. No credits used.");
  console.log(divider());

  let output = "";

  for (const tc of testCases) {
    const systemPrompt = buildModeSystemPrompt(tc.mode, tc.input);
    const userPrompt = buildModeUserPrompt(tc.mode, tc.input);
    const schemaInstruction = getOutputSchemaInstruction(tc.mode);

    const block = [
      section(`MODE: ${tc.mode}`),
      `Label: ${tc.label}`,
      section("SYSTEM PROMPT"),
      formatPrompt(systemPrompt),
      section("USER PROMPT"),
      formatPrompt(userPrompt),
      section("EXPECTED OUTPUT SCHEMA"),
      schemaInstruction,
      `\n${divider("=")}\nEND OF ${tc.mode}\n${divider("=")}`,
    ].join("\n");

    output += block + "\n";
    console.log(block);
  }

  // Also print summary
  console.log(section("SUMMARY"));
  for (const tc of testCases) {
    console.log(`- ${tc.mode}: ${tc.label}`);
  }
  console.log(section("ALL PROMPTS PREVIEW COMPLETE"));
}

main().catch(console.error);
