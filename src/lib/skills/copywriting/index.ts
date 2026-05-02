/**
 * Copywriting Skill - Re-exports from new modular structure
 * 
 * For backwards compatibility, we re-export from the new structure.
 * New code should import directly from ./generate and ./types
 */

export { generateCopy, getCopyTypes, getCopyType, getCopyTypesByCategory } from "./generate";
export type { CopywritingInput, CopywritingOutput } from "./generate";

export * from "./types";
