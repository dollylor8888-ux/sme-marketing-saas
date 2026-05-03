/**
 * Output Validators for Copywriting Modes — v2
 *
 * Validates AI output against upgraded mode-specific schema.
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
// Per-Mode Validators — v2
// ─────────────────────────────────────────

function validateAdCopySet(output: unknown): ValidationResult {
  if (typeof output !== "object" || output === null) {
    return { valid: false, error: "Output must be a JSON object" };
  }

  const obj = output as Record<string, unknown>;

  // Required string fields
  const requiredStrings = [
    "angle",
    "angleExplanation",
    "headline",
    "primaryText",
    "description",
    "cta",
    "whyThisWorks",
    "riskNote",
    "testingNotes",
  ];
  for (const field of requiredStrings) {
    if (typeof obj[field] !== "string") {
      return { valid: false, error: `Missing or invalid field: ${field}` };
    }
  }

  // Character counts
  if (typeof obj.headlineCharCount !== "number") {
    return { valid: false, error: "headlineCharCount must be a number" };
  }
  if (typeof obj.primaryTextCharCount !== "number") {
    return { valid: false, error: "primaryTextCharCount must be a number" };
  }
  if (typeof obj.descriptionCharCount !== "number") {
    return { valid: false, error: "descriptionCharCount must be a number" };
  }

  // Character limits
  if ((obj.headline as string).length > 40) {
    return { valid: false, error: `headline exceeds 40 chars (actual: ${(obj.headline as string).length})` };
  }
  if ((obj.description as string).length > 30) {
    return { valid: false, error: `description exceeds 30 chars (actual: ${(obj.description as string).length})` };
  }
  if ((obj.primaryText as string).length > 150) {
    return { valid: false, error: `primaryText exceeds 150 chars (actual: ${(obj.primaryText as string).length})` };
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

  // platformLimitWarnings must be array of strings
  if (!Array.isArray(obj.platformLimitWarnings)) {
    return { valid: false, error: "platformLimitWarnings must be an array" };
  }
  for (const warn of obj.platformLimitWarnings) {
    if (typeof warn !== "string") {
      return { valid: false, error: "All platformLimitWarnings must be strings" };
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
    "mainTheme",
    "campaignGoal",
  ];
  for (const field of requiredStrings) {
    if (typeof obj[field] !== "string") {
      return { valid: false, error: `Missing or invalid field: ${field}` };
    }
  }

  // campaignDirections
  if (!Array.isArray(obj.campaignDirections)) {
    return { valid: false, error: "campaignDirections must be an array" };
  }
  for (const dir of obj.campaignDirections as unknown[]) {
    if (typeof dir !== "object" || dir === null) {
      return { valid: false, error: "Each campaignDirection must be an object" };
    }
    const d = dir as Record<string, unknown>;
    if (typeof d.direction !== "string" || typeof d.rationale !== "string") {
      return { valid: false, error: "Each campaignDirection must have direction and rationale strings" };
    }
    if (!Array.isArray(d.channels)) {
      return { valid: false, error: "Each campaignDirection.channels must be an array" };
    }
  }

  // suggestedAngles
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
      typeof a.supportingPoint !== "string" ||
      typeof a.emotionalTrigger !== "string"
    ) {
      return { valid: false, error: "Each suggestedAngle must have angle, hook, supportingPoint, emotionalTrigger strings" };
    }
  }

  // creativeTestingPlan
  if (!Array.isArray(obj.creativeTestingPlan)) {
    return { valid: false, error: "creativeTestingPlan must be an array" };
  }
  for (const phase of obj.creativeTestingPlan as unknown[]) {
    if (typeof phase !== "object" || phase === null) {
      return { valid: false, error: "Each creativeTestingPlan phase must be an object" };
    }
    const p = phase as Record<string, unknown>;
    if (typeof p.phase !== "string" || typeof p.testFocus !== "string" || typeof p.duration !== "string") {
      return { valid: false, error: "Each creativeTestingPlan phase must have phase, testFocus, duration strings" };
    }
    if (!Array.isArray(p.copies)) {
      return { valid: false, error: "Each creativeTestingPlan phase must have copies array" };
    }
  }

  // budgetGuidance
  if (typeof obj.budgetGuidance !== "object" || obj.budgetGuidance === null) {
    return { valid: false, error: "budgetGuidance must be an object" };
  }
  const bg = obj.budgetGuidance as Record<string, unknown>;
  for (const level of ["low", "medium", "high", "allocationAdvice"]) {
    if (typeof bg[level] !== "string") {
      return { valid: false, error: `budgetGuidance.${level} must be a string` };
    }
  }

  // nextActions
  if (!Array.isArray(obj.nextActions)) {
    return { valid: false, error: "nextActions must be an array" };
  }
  for (const action of obj.nextActions as unknown[]) {
    if (typeof action !== "object" || action === null) {
      return { valid: false, error: "Each nextAction must be an object" };
    }
    const na = action as Record<string, unknown>;
    if (typeof na.action !== "string" || typeof na.timeline !== "string") {
      return { valid: false, error: "Each nextAction must have action and timeline strings" };
    }
    if (!["high", "medium", "low"].includes(na.priority as string)) {
      return { valid: false, error: "Each nextAction.priority must be high|medium|low" };
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
    "corePositioning",
    "testingPriority",
    "riskNote",
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
    if (typeof p.language !== "string" || typeof p.emotionalWeight !== "string") {
      return { valid: false, error: "Each painPoint must have language and emotionalWeight strings" };
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
      typeof s.emotionalTrigger !== "string" ||
      typeof s.howToCommunicate !== "string"
    ) {
      return { valid: false, error: "Each sellingPoint must have benefit, proof, emotionalTrigger, howToCommunicate strings" };
    }
  }

  // targetPersonas (plural now)
  if (!Array.isArray(obj.targetPersonas)) {
    return { valid: false, error: "targetPersonas must be an array" };
  }
  for (const tp of obj.targetPersonas as unknown[]) {
    if (typeof tp !== "object" || tp === null) {
      return { valid: false, error: "Each targetPersona must be an object" };
    }
    const t = tp as Record<string, unknown>;
    const tpFields = ["persona", "demographics", "psychographics", "biggestObjection", "preferredAngle"];
    for (const field of tpFields) {
      if (typeof t[field] !== "string") {
        return { valid: false, error: `targetPersona.${field} must be a string` };
      }
    }
  }

  // objections
  if (!Array.isArray(obj.objections)) {
    return { valid: false, error: "objections must be an array" };
  }
  for (const obj2 of obj.objections as unknown[]) {
    if (typeof obj2 !== "object" || obj2 === null) {
      return { valid: false, error: "Each objection must be an object" };
    }
    const o = obj2 as Record<string, unknown>;
    if (typeof o.objection !== "string" || typeof o.response !== "string") {
      return { valid: false, error: "Each objection must have objection and response strings" };
    }
    if (!["high", "medium", "low"].includes(o.severity as string)) {
      return { valid: false, error: "Each objection.severity must be high|medium|low" };
    }
  }

  // testableAngles
  if (!Array.isArray(obj.testableAngles)) {
    return { valid: false, error: "testableAngles must be an array" };
  }
  for (const angle of obj.testableAngles as unknown[]) {
    if (typeof angle !== "object" || angle === null) {
      return { valid: false, error: "Each testableAngle must be an object" };
    }
    const ta = angle as Record<string, unknown>;
    const taFields = ["angle", "hypothesis", "whatToTest", "successMetric"];
    for (const field of taFields) {
      if (typeof ta[field] !== "string") {
        return { valid: false, error: `testableAngle.${field} must be a string` };
      }
    }
    if (!["high", "medium", "low"].includes(ta.priority as string)) {
      return { valid: false, error: "Each testableAngle.priority must be high|medium|low" };
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
      typeof h.format !== "string" ||
      typeof h.angleUsed !== "string"
    ) {
      return { valid: false, error: "Each hookExample must have hook, platform, format, angleUsed strings" };
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
