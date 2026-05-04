/**
 * Copywriting Generation Core
 * 
 * Refactored architecture:
 * 1. Schema-driven (each CopyType has its own definition)
 * 2. Enforced JSON output schema
 * 3. Brand voice layer
 * 4. "Success then deduct" credit flow (handled by route, this returns success/fail)
 */

import OpenAI from "openai";
import { CopyTypeDefinition, COPY_TYPES, COPY_TYPE_LIST } from "./types/copy-types";
import { BrandVoiceInput, buildBrandVoiceContext } from "./types/brand-voice";
import type {
  CopywritingModeInput,
  CopywritingModeId,
  CopywritingModeOutput,
} from "./types/modes";
import { COPYWRITING_MODES } from "./types/modes";
import { buildModeSystemPrompt, buildModeUserPrompt } from "./prompts";
import { validateOutputByMode } from "./validators";

const provider = process.env.AI_PROVIDER ?? "openai";

const openai = new OpenAI({
  apiKey:
    provider === "minimax-proxy"
      ? process.env.AI_PROXY_KEY ?? "proxy-key-not-set"
      : provider === "minimax"
      ? process.env.OPENAI_API_KEY
      : process.env.OPENAI_API_KEY,
  baseURL:
    provider === "minimax"
      ? "https://api.minimax.chat/v1"
      : provider === "minimax-proxy"
      ? (process.env.AI_PROXY_URL ?? "http://localhost:3456") + "/v1"
      : undefined,
});

export const DEFAULT_MODEL =
  provider === "minimax"
    ? "abab6-chat"
    : provider === "minimax-proxy"
    ? (process.env.AI_PROXY_MODEL ?? "MiniMax-M2.7")
    : "gpt-4o-mini";

// ============ INPUT/OUTPUT TYPES ============

export interface CopywritingInput {
  type: string;
  product?: string;
  brand?: string;
  audience?: string;
  tone?: string;
  language?: string;
  extra?: string;
  brandVoice?: Partial<BrandVoiceInput>;
  /** For fine-tuning previous output */
  fineTune?: {
    length?: "shorter" | "same" | "longer";
    tone?: "professional" | "casual" | "bold" | "reserved";
    focus?: "value" | "quality" | "emotion" | "urgency";
    format?: "same" | "bullet" | "paragraph";
    instruction?: string;
  };
  previousOutput?: string;
}

export interface CopywritingOutput {
  success: boolean;
  copy?: string;        // primary copy
  variants?: string[];
  reasoning?: string;
  scores?: {
    clarity: number;
    conversion: number;
    brandFit: number;
  };
  error?: string;
}

// ============ CORE GENERATION ============

/**
 * Main generation function
 * 
 * @param input - User input with type, product, brand, audience, etc.
 * @param userId - For memory context (past generations)
 * @returns CopywritingOutput with parsed JSON result
 */
export async function generateCopy(
  input: CopywritingInput,
  userId?: string
): Promise<CopywritingOutput> {
  // 1. Validate copy type
  const copyType = COPY_TYPES[input.type];
  if (!copyType) {
    return {
      success: false,
      error: `Unknown copy type: ${input.type}. Available types: ${COPY_TYPE_LIST.map(t => t.id).join(", ")}`
    };
  }

  // 2. Build system prompt with brand voice
  const systemPrompt = buildSystemPrompt(copyType, input);

  // 3. Build user prompt
  const userPrompt = buildUserPrompt(input, copyType);

  // 4. Generate with AI
  try {
    const completion = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const rawOutput = completion.choices[0]?.message?.content;
    if (!rawOutput) {
      return { success: false, error: "No response from AI" };
    }

    // 5. Parse and validate JSON output
    const result = parseAndValidateOutput(rawOutput, copyType);
    if (!result.valid) {
      return {
        success: false,
        error: `Output validation failed: ${result.error}`
      };
    }

    return {
      success: true,
      copy: result.data!.primary,
      variants: result.data!.variants,
      reasoning: result.data!.reasoning,
      scores: result.data!.score
    };

  } catch (error) {
    console.error("[copywriting generate] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Generation failed"
    };
  }
}

// ============ PROMPT BUILDERS ============

function buildSystemPrompt(copyType: CopyTypeDefinition, input: CopywritingInput): string {
  // Base system from type definition
  let prompt = copyType.framework.systemPrompt;

  // Add brand voice context
  const brandVoiceContext = buildBrandVoiceContext({
    brand: input.brand,
    positioning: input.brandVoice?.positioning,
    audience: input.audience,
    tone: input.tone,
    language: input.language
  });
  prompt += `\n\n${brandVoiceContext}`;

  // Add formula if exists
  if (copyType.framework.formula) {
    prompt += `\n\nFORMULA: ${copyType.framework.formula}`;
  }

  // Add tips if exists
  if (copyType.framework.tips && copyType.framework.tips.length > 0) {
    prompt += `\n\nTips:\n${copyType.framework.tips.map(t => `- ${t}`).join("\n")}`;
  }

  // Add JSON schema instruction
  prompt += `\n\n## OUTPUT FORMAT (MUST FOLLOW EXACTLY)
Return ONLY valid JSON, no markdown, no explanation:

{
  "primary": "主文案（${copyType.characterLimit ? `max ${copyType.characterLimit} chars` : 'concise'}）",
  "variants": ["版本1", "版本2", "版本3"],
  "reasoning": "為何這樣寫",
  "score": {
    "clarity": 1-10,
    "conversion": 1-10,
    "brandFit": 1-10
  }
}`;

  return prompt;
}

function buildUserPrompt(input: CopywritingInput, copyType: CopyTypeDefinition): string {
  let prompt = `Generate a ${copyType.name} for:\n\n`;

  if (input.product) {
    prompt += `- Product: ${input.product}\n`;
  }
  if (input.brand) {
    prompt += `- Brand: ${input.brand}\n`;
  }
  if (input.audience) {
    prompt += `- Target Audience: ${input.audience}\n`;
  }
  if (input.tone) {
    prompt += `- Tone: ${input.tone}\n`;
  }
  if (input.language) {
    prompt += `- Language: ${input.language}\n`;
  }
  if (input.extra) {
    prompt += `- Extra Context: ${input.extra}\n`;
  }

  // Fine-tune mode
  if (input.fineTune && input.previousOutput) {
    prompt += `\n## FINE-TUNE PREVIOUS OUTPUT\n`;
    prompt += `Previous version: "${input.previousOutput}"\n`;
    prompt += `Adjustments:\n`;
    if (input.fineTune.length) prompt += `- Length: ${input.fineTune.length}\n`;
    if (input.fineTune.tone) prompt += `- Tone: ${input.fineTune.tone}\n`;
    if (input.fineTune.focus) prompt += `- Focus: ${input.fineTune.focus}\n`;
    if (input.fineTune.instruction) prompt += `- Custom: ${input.fineTune.instruction}\n`;
  }

  prompt += `\nReturn ONLY JSON matching the schema.`;

  return prompt;
}

// ============ OUTPUT VALIDATION ============

interface ValidationResult {
  valid: boolean;
  data?: {
    primary: string;
    variants: string[];
    reasoning: string;
    score: {
      clarity: number;
      conversion: number;
      brandFit: number;
    };
  };
  error?: string;
}

function parseAndValidateOutput(
  rawOutput: string,
  copyType: CopyTypeDefinition
): ValidationResult {
  try {
    // Clean markdown if present
    let cleaned = rawOutput.trim();
    if (cleaned.startsWith("```json")) {
      cleaned = cleaned.replace(/^```json\n?/, "").replace(/\n?```$/, "");
    } else if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```\n?/, "").replace(/\n?```$/, "");
    }

    // Parse JSON
    const data = JSON.parse(cleaned);

    // Validate required fields
    if (!data.primary || typeof data.primary !== "string") {
      return { valid: false, error: "Missing or invalid 'primary' field" };
    }
    if (!Array.isArray(data.variants) || data.variants.length < 1) {
      return { valid: false, error: "Missing or invalid 'variants' array" };
    }
    if (!data.reasoning || typeof data.reasoning !== "string") {
      return { valid: false, error: "Missing or invalid 'reasoning' field" };
    }
    if (!data.score || typeof data.score !== "object") {
      return { valid: false, error: "Missing or invalid 'score' object" };
    }

    // Validate scores are numbers in range
    const scores = data.score;
    if (
      typeof scores.clarity !== "number" || scores.clarity < 1 || scores.clarity > 10 ||
      typeof scores.conversion !== "number" || scores.conversion < 1 || scores.conversion > 10 ||
      typeof scores.brandFit !== "number" || scores.brandFit < 1 || scores.brandFit > 10
    ) {
      return {
        valid: false,
        error: "Scores must be numbers between 1-10"
      };
    }

    // Validate character limit if specified
    if (copyType.characterLimit) {
      if (data.primary.length > copyType.characterLimit) {
        console.warn(`[copywriting] Primary copy exceeds character limit: ${data.primary.length} > ${copyType.characterLimit}`);
        // Don't fail, just warn
      }
    }

    return {
      valid: true,
      data: {
        primary: data.primary,
        variants: data.variants,
        reasoning: data.reasoning,
        score: {
          clarity: scores.clarity,
          conversion: scores.conversion,
          brandFit: scores.brandFit
        }
      }
    };

  } catch (error) {
    return {
      valid: false,
      error: `JSON parse error: ${error instanceof Error ? error.message : "Unknown error"}. Raw output: ${rawOutput.slice(0, 200)}`
    };
  }
}

// ============ HELPER FUNCTIONS ============

/**
 * Get available copy types
 */
export function getCopyTypes(): CopyTypeDefinition[] {
  return COPY_TYPE_LIST;
}

/**
 * Get copy type by ID
 */
export function getCopyType(id: string): CopyTypeDefinition | undefined {
  return COPY_TYPES[id];
}

/**
 * Get copy types grouped by category
 */
export function getCopyTypesByCategory(): Record<string, CopyTypeDefinition[]> {
  return COPY_TYPE_LIST.reduce((acc, ct) => {
    if (!acc[ct.category]) acc[ct.category] = [];
    acc[ct.category].push(ct);
    return acc;
  }, {} as Record<string, CopyTypeDefinition[]>);
}

// ============ NEW MODE-BASED GENERATION ============

export interface GenerateCopywritingResult {
  success: boolean;
  mode: CopywritingModeId;
  output?: CopywritingModeOutput;
  error?: string;
}

/**
 * Mode-based copywriting generation
 * 
 * Supports 3 modes:
 * 1. ad_copy_set        — FB/IG ad: headline + primary text + description + CTA
 * 2. campaign_direction — Marketing direction + angles + budget guidance
 * 3. product_angle_explorer — Selling points, pain points, hooks
 * 
 * NOTE: This function does NOT deduct credits. The calling route must do it on success.
 */
export async function generateCopywriting(
  input: CopywritingModeInput
): Promise<GenerateCopywritingResult> {
  const { mode } = input;

  // 1. Validate mode
  if (!COPYWRITING_MODES[mode]) {
    return {
      success: false,
      mode,
      error: `Unknown mode: ${mode}. Available modes: ${Object.keys(COPYWRITING_MODES).join(", ")}`
    };
  }

  // 2. Build prompts
  const systemPrompt = buildModeSystemPrompt(mode, input);
  const userPrompt = buildModeUserPrompt(mode, input);

  // 3. Generate with AI
  try {
    const completion = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 2500,
    });

    const rawOutput = completion.choices[0]?.message?.content;
    if (!rawOutput) {
      return { success: false, mode, error: "No response from AI" };
    }

    // 4. Parse JSON
    let parsed: unknown;
    try {
      let cleaned = rawOutput.trim();
      if (cleaned.startsWith("```json")) {
        cleaned = cleaned.replace(/^```json\n?/, "").replace(/\n?```$/, "");
      } else if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/^```\n?/, "").replace(/\n?```$/, "");
      }
      parsed = JSON.parse(cleaned);
    } catch {
      return {
        success: false,
        mode,
        error: `JSON parse error: ${rawOutput.slice(0, 200)}`
      };
    }

    // 5. Validate output by mode
    const validation = validateOutputByMode(mode, parsed);
    if (!validation.valid) {
      return {
        success: false,
        mode,
        error: `Output validation failed: ${validation.error}`
      };
    }

    return {
      success: true,
      mode,
      output: parsed as CopywritingModeOutput
    };

  } catch (error) {
    console.error("[generateCopywriting] Error:", error);
    return {
      success: false,
      mode,
      error: error instanceof Error ? error.message : "Generation failed"
    };
  }
}
