/**
 * Prompt Builders for Copywriting Modes
 * 
 * Builds system and user prompts based on mode, input, and language rules.
 */

import {
  type CopywritingModeInput,
  type CopywritingModeId,
  COPYWRITING_MODES,
  getLanguageRules,
  type CopywritingModeDefinition,
} from "./types/modes";
import { buildBrandVoiceContext } from "./types/brand-voice";

// ─────────────────────────────────────────
// Core Prompt Builders
// ─────────────────────────────────────────

/**
 * Build the full system prompt for a given mode
 */
export function buildModeSystemPrompt(
  modeId: CopywritingModeId,
  input: CopywritingModeInput
): string {
  const modeDef = COPYWRITING_MODES[modeId];
  if (!modeDef) {
    throw new Error(`Unknown copywriting mode: ${modeId}`);
  }

  const systemPrompt = modeDef.systemPrompt;
  const languageRules = getLanguageRules(input.language ?? "traditional_chinese");

  let brandVoiceContext = "";
  if (input.brandVoice) {
    brandVoiceContext = buildBrandVoiceContext(input.brandVoice);
  }

  return [
    systemPrompt,
    "",
    "═══════════════════════════════════════",
    "【語言規則 LANGUAGE RULES】",
    languageRules,
    "",
    "═══════════════════════════════════════",
    "【輸出格式 OUTPUT FORMAT】",
    modeDef.outputInstructions,
    brandVoiceContext ? "\n" + brandVoiceContext : "",
  ]
    .filter(Boolean)
    .join("\n");
}

/**
 * Replace template placeholders with actual values
 * Supports {{variable}} and conditional {{#if variable}}...{{/if}} blocks
 */
function interpolateTemplate(
  template: string,
  values: Record<string, string | undefined>
): string {
  let result = template;

  // Replace simple {{variable}} placeholders
  for (const [key, value] of Object.entries(values)) {
    if (value !== undefined && value !== "") {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
      result = result.replace(regex, value);
    }
  }

  // Handle conditional blocks {{#if variable}}...{{/if}}
  const ifRegex = /\{\{#if (\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g;
  result = result.replace(ifRegex, (_, key, blockContent) => {
    const val = values[key];
    if (val !== undefined && val !== "") {
      return blockContent;
    }
    return "";
  });

  // Remove any remaining {{variable}} placeholders (not provided)
  result = result.replace(/\{\{[^}]+\}\}/g, "");

  return result;
}

/**
 * Build the user prompt from template + input values
 */
export function buildModeUserPrompt(
  modeId: CopywritingModeId,
  input: CopywritingModeInput
): string {
  const modeDef = COPYWRITING_MODES[modeId];
  if (!modeDef) {
    throw new Error(`Unknown copywriting mode: ${modeId}`);
  }

  // Map input fields to template variables
  const values: Record<string, string> = {
    product: input.product ?? "",
    brand: input.brand ?? "",
    audience: input.audience ?? "",
    benefits: input.benefits ?? "",
    painPoint: input.painPoint ?? "",
    offer: input.offer ?? "",
    platform: input.platform ?? "",
    month: input.month ?? "",
    market: input.market ?? "",
    salesGoal: input.salesGoal ?? "",
    festival: input.festival ?? "",
    budgetLevel: input.budgetLevel ?? "",
    tone: input.tone ?? "",
    language: input.language ?? "traditional_chinese",
    extra: input.extra ?? "",
    // Extended product marketing context
    productOverview: input.productOverview ?? "",
    differentiators: input.differentiators ?? "",
    customerLanguage: input.customerLanguage ?? "",
    objections: input.objections ?? "",
    proofPoints: input.proofPoints?.join("；") ?? "",
    goals: input.goals ?? "",
    wordsToUse: input.wordsToUse?.join("；") ?? "",
    wordsToAvoid: input.wordsToAvoid?.join("；") ?? "",
    // Brand voice
    brandVoice: input.brandVoice
      ? buildBrandVoiceContext(input.brandVoice)
      : "",
  };

  return interpolateTemplate(modeDef.userPromptTemplate, values);
}

/**
 * Get output schema instructions for a mode
 */
export function getOutputSchemaInstruction(modeId: CopywritingModeId): string {
  const modeDef = COPYWRITING_MODES[modeId];
  if (!modeDef) {
    throw new Error(`Unknown copywriting mode: ${modeId}`);
  }
  return modeDef.outputInstructions;
}

/**
 * Get the mode definition
 */
export function getModeDefinition(modeId: CopywritingModeId): CopywritingModeDefinition {
  const modeDef = COPYWRITING_MODES[modeId];
  if (!modeDef) {
    throw new Error(`Unknown copywriting mode: ${modeId}`);
  }
  return modeDef;
}
