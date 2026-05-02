/**
 * Output Validators for Copywriting Modes
 * 
 * Validates AI output against mode-specific schema.
 * Returns success/error — does NOT throw.
 */

import type {
  CopywritingModeId,
  AdCopySetOutput,
  CampaignDirectionOutput,
  ProductAngleExplorerOutput,
} from "./types/modes";

// ─────────────────────────────────────────
// Validation Result
// ─────────────────────────────────────────

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

// ─────────────────────────────────────────
// Per-Mode Validators
// ─────────────────────────────────────────

function validateAdCopySet(output: unknown): ValidationResult {
  if (typeof output !== "object" || output === null) {
    return { valid: false, error: "Output must be a JSON object" };
  }

  const obj = output as Record<string, unknown>;

  // Required string fields
  const requiredStrings = [
    "headline",
    "primaryText",
    "description",
    "cta",
    "reasoning",
  ];
  for (const field of requiredStrings) {
    if (typeof obj[field] !== "string") {
      return { valid: false, error: `Missing or invalid field: ${field}` };
    }
  }

  // headline max 40 chars
  if ((obj.headline as string).length > 40) {
    return { valid: false, error: "headline exceeds 40 characters" };
  }

  // description max 30 chars
  if ((obj.description as string).length > 30) {
    return { valid: false, error: "description exceeds 30 characters" };
  }

  // hashtags must be array of strings
  if (!Array.isArray(obj.hashtags)) {
    return { valid: false, error: "hashtags must be an array" };
  }
  for (const tag of obj.hashtags) {
    if (typeof tag !== "string") {
      return { valid: false, error: "All hashtags must be strings" };
    }
  }

  // scores
  if (typeof obj.scores !== "object" || obj.scores === null) {
    return { valid: false, error: "Missing scores object" };
  }
  const scores = obj.scores as Record<string, unknown>;
  const scoreFields = ["clarity", "conversion", "brandFit"];
  for (const field of scoreFields) {
    if (typeof scores[field] !== "number" || scores[field] < 1 || scores[field] > 10) {
      return { valid: false, error: `scores.${field} must be a number 1-10` };
    }
  }

  return { valid: true };
}

function validateCampaignDirection(output: unknown): ValidationResult {
  if (typeof output !== "object" || output === null) {
    return { valid: false, error: "Output must be a JSON object" };
  }

  const obj = output as Record<string, unknown>;

  const requiredStrings = [
    "direction",
    "targetAudience",
    "keyMessage",
    "timeline",
    "reasoning",
  ];
  for (const field of requiredStrings) {
    if (typeof obj[field] !== "string") {
      return { valid: false, error: `Missing or invalid field: ${field}` };
    }
  }

  // contentPillars must be array
  if (!Array.isArray(obj.contentPillars)) {
    return { valid: false, error: "contentPillars must be an array" };
  }

  // suggestedAngles must be array of objects
  if (!Array.isArray(obj.suggestedAngles)) {
    return { valid: false, error: "suggestedAngles must be an array" };
  }
  for (const angle of obj.suggestedAngles as unknown[]) {
    if (typeof angle !== "object" || angle === null) {
      return { valid: false, error: "Each suggestedAngle must be an object" };
    }
    const a = angle as Record<string, unknown>;
    if (
      typeof a.angle !== "string" ||
      typeof a.hook !== "string" ||
      typeof a.supportingPoint !== "string"
    ) {
      return { valid: false, error: "Each suggestedAngle must have angle, hook, supportingPoint strings" };
    }
  }

  // budgetGuidance
  if (typeof obj.budgetGuidance !== "object" || obj.budgetGuidance === null) {
    return { valid: false, error: "budgetGuidance must be an object" };
  }
  const bg = obj.budgetGuidance as Record<string, unknown>;
  for (const level of ["low", "medium", "high"]) {
    if (typeof bg[level] !== "string") {
      return { valid: false, error: `budgetGuidance.${level} must be a string` };
    }
  }

  // scores
  if (typeof obj.scores !== "object" || obj.scores === null) {
    return { valid: false, error: "Missing scores object" };
  }
  const scores = obj.scores as Record<string, unknown>;
  const scoreFields = ["relevance", "feasibility", "differentiation"];
  for (const field of scoreFields) {
    if (typeof scores[field] !== "number" || scores[field] < 1 || scores[field] > 10) {
      return { valid: false, error: `scores.${field} must be a number 1-10` };
    }
  }

  return { valid: true };
}

function validateProductAngleExplorer(output: unknown): ValidationResult {
  if (typeof output !== "object" || output === null) {
    return { valid: false, error: "Output must be a JSON object" };
  }

  const obj = output as Record<string, unknown>;

  const requiredStrings = [
    "productName",
    "coreValue",
    "competitiveEdge",
    "reasoning",
  ];
  for (const field of requiredStrings) {
    if (typeof obj[field] !== "string") {
      return { valid: false, error: `Missing or invalid field: ${field}` };
    }
  }

  // painPoints
  if (!Array.isArray(obj.painPoints)) {
    return { valid: false, error: "painPoints must be an array" };
  }
  for (const pain of obj.painPoints as unknown[]) {
    if (typeof pain !== "object" || pain === null) {
      return { valid: false, error: "Each painPoint must be an object" };
    }
    const p = pain as Record<string, unknown>;
    if (typeof p.pain !== "string") {
      return { valid: false, error: "Each painPoint.pain must be a string" };
    }
    if (!["high", "medium", "low"].includes(p.severity as string)) {
      return { valid: false, error: "Each painPoint.severity must be high|medium|low" };
    }
    if (typeof p.language !== "string") {
      return { valid: false, error: "Each painPoint.language must be a string" };
    }
  }

  // sellingPoints
  if (!Array.isArray(obj.sellingPoints)) {
    return { valid: false, error: "sellingPoints must be an array" };
  }
  for (const sp of obj.sellingPoints as unknown[]) {
    if (typeof sp !== "object" || sp === null) {
      return { valid: false, error: "Each sellingPoint must be an object" };
    }
    const s = sp as Record<string, unknown>;
    if (
      typeof s.benefit !== "string" ||
      typeof s.proof !== "string" ||
      typeof s.emotionalTrigger !== "string"
    ) {
      return { valid: false, error: "Each sellingPoint must have benefit, proof, emotionalTrigger strings" };
    }
  }

  // targetPersona
  if (typeof obj.targetPersona !== "object" || obj.targetPersona === null) {
    return { valid: false, error: "targetPersona must be an object" };
  }
  const tp = obj.targetPersona as Record<string, unknown>;
  const tpFields = ["persona", "demographics", "psychographics", "biggestObjection"];
  for (const field of tpFields) {
    if (typeof tp[field] !== "string") {
      return { valid: false, error: `targetPersona.${field} must be a string` };
    }
  }

  // hookExamples
  if (!Array.isArray(obj.hookExamples)) {
    return { valid: false, error: "hookExamples must be an array" };
  }
  for (const hook of obj.hookExamples as unknown[]) {
    if (typeof hook !== "object" || hook === null) {
      return { valid: false, error: "Each hookExample must be an object" };
    }
    const h = hook as Record<string, unknown>;
    if (
      typeof h.hook !== "string" ||
      typeof h.platform !== "string" ||
      typeof h.format !== "string"
    ) {
      return { valid: false, error: "Each hookExample must have hook, platform, format strings" };
    }
  }

  // scores
  if (typeof obj.scores !== "object" || obj.scores === null) {
    return { valid: false, error: "Missing scores object" };
  }
  const scores = obj.scores as Record<string, unknown>;
  const scoreFields = ["clarity", "persuasiveness", "uniqueness"];
  for (const field of scoreFields) {
    if (typeof scores[field] !== "number" || scores[field] < 1 || scores[field] > 10) {
      return { valid: false, error: `scores.${field} must be a number 1-10` };
    }
  }

  return { valid: true };
}

// ─────────────────────────────────────────
// Main Validator Dispatcher
// ─────────────────────────────────────────

/**
 * Validate AI output against mode-specific schema.
 * Does NOT throw — returns ValidationResult.
 */
export function validateOutputByMode(
  modeId: CopywritingModeId,
  output: unknown
): ValidationResult {
  switch (modeId) {
    case "ad_copy_set":
      return validateAdCopySet(output);
    case "campaign_direction":
      return validateCampaignDirection(output);
    case "product_angle_explorer":
      return validateProductAngleExplorer(output);
    default:
      return { valid: false, error: `Unknown mode: ${modeId}` };
  }
}
