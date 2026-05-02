/**
 * Copywriting Skill - Re-exports from new modular structure
 * 
 * For backwards compatibility, we re-export from the new structure.
 * New code should import directly from ./generate and ./types
 */

// Old generateCopy (backwards compatible)
export { generateCopy, getCopyTypes, getCopyType, getCopyTypesByCategory } from "./generate";
export type { CopywritingInput, CopywritingOutput } from "./generate";

// New mode-based generation
export { generateCopywriting } from "./generate";
export type { GenerateCopywritingResult } from "./generate";

// Types
export * from "./types";
