/**
 * Memory Service — Persist and retrieve user context for AI interactions
 * 
 * Provides:
 * - loadMemory(userId): Load all memory for a user
 * - saveBrandMemory(userId, data): Save/update brand memory
 * - saveProductMemory(userId, data): Save/update product memory
 * - savePreference(userId, data): Save user preferences
 * - saveGeneration(userId, data): Save generation history
 * - buildContext(userId, skill, actionType): Build AI prompt context
 */

import { prisma } from "@/lib/billing/credit-system";

// ============ TYPES ============

export interface BrandMemoryData {
  brandName?: string;
  tagline?: string;
  voice?: string;
  tone?: string;
  values?: string[];
  avoidWords?: string[];
  keyMessages?: string[];
  competitors?: string[];
  goodExamples?: string[];
  badExamples?: string[];
  industry?: string;
  description?: string;
}

export interface ProductMemoryData {
  name: string;
  description?: string;
  category?: string;
  features?: string[];
  benefits?: string[];
  differentiators?: string[];
  targetAudience?: string[];
  useCases?: string[];
  priceRange?: string;
  position?: string;
}

export interface UserPreferenceData {
  defaultLanguage?: string;
  defaultTone?: string;
  defaultAudience?: string;
  preferVariants?: boolean;
  preferShortCopy?: boolean;
  includeEmoji?: boolean;
  primaryPlatform?: string;
  primaryGoal?: string;
}

export interface GenerationData {
  skill: string;
  actionType: string;
  inputData: Record<string, unknown>;
  generatedContent: string;
  variants?: string[];
  rating?: number;
  userFeedback?: string;
  productId?: string;
  brandId?: string;
}

export interface FullMemory {
  brand: BrandMemoryData | null;
  products: ProductMemoryData[];
  preferences: UserPreferenceData;
  recentGenerations: {
    skill: string;
    actionType: string;
    generatedContent: string;
    createdAt: Date;
  }[];
}

// ============ LOADER ============

export async function loadMemory(userId: string): Promise<FullMemory> {
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      brandMemory: true,
      productMemories: true,
      preferences: true,
      generations: {
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          skill: true,
          actionType: true,
          generatedContent: true,
          createdAt: true,
        },
      },
    },
  });

  if (!user) {
    return {
      brand: null,
      products: [],
      preferences: getDefaultPreferences(),
      recentGenerations: [],
    };
  }

  return {
    brand: user.brandMemory ? sanitizeBrandMemory(user.brandMemory) : null,
    products: user.productMemories.map(sanitizeProductMemory),
    preferences: user.preferences ? sanitizePreferences(user.preferences) : getDefaultPreferences(),
    recentGenerations: user.generations.map((g) => ({
      skill: g.skill,
      actionType: g.actionType,
      generatedContent: g.generatedContent,
      createdAt: g.createdAt,
    })),
  };
}

// ============ SAVERS ============

export async function saveBrandMemory(
  userId: string,
  data: BrandMemoryData
): Promise<void> {
  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return;

  await prisma.brandMemory.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      ...data,
    },
    update: data,
  });
}

export async function saveProductMemory(
  userId: string,
  data: ProductMemoryData
): Promise<string> {
  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) throw new Error("User not found");

  // Check if product with same name exists
  const existing = await prisma.productMemory.findFirst({
    where: { userId: user.id, name: data.name },
  });

  const product = await prisma.productMemory.upsert({
    where: { id: existing?.id ?? "" },
    create: {
      userId: user.id,
      ...data,
    },
    update: data,
  });

  return product.id;
}

export async function savePreference(
  userId: string,
  data: Partial<UserPreferenceData>
): Promise<void> {
  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return;

  await prisma.userPreference.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      ...getDefaultPreferences(),
      ...data,
    },
    update: data,
  });
}

export async function saveGeneration(
  userId: string,
  data: GenerationData
): Promise<void> {
  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return;

  await prisma.generationHistory.create({
    data: {
      userId: user.id,
      skill: data.skill,
      actionType: data.actionType,
      inputData: JSON.stringify(data.inputData),
      generatedContent: data.generatedContent,
      variants: data.variants ?? [],
      rating: data.rating,
      userFeedback: data.userFeedback,
      productId: data.productId,
      brandId: data.brandId,
    },
  });
}

export async function rateGeneration(
  generationId: string,
  rating: number,
  feedback?: string
): Promise<void> {
  await prisma.generationHistory.update({
    where: { id: generationId },
    data: {
      rating,
      userFeedback: feedback,
    },
  });
}

// ============ CONTEXT BUILDER ============

/**
 * Sanitize user-controlled strings before injecting into AI prompts.
 * Prevents prompt injection by limiting length and removing control characters.
 */
function sanitizeForPrompt(value: string, maxLength = 500): string {
  if (!value) return "";
  // Remove control characters (but allow newlines for formatting)
  const cleaned = value
    .replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .trim();
  // Hard cap at maxLength
  return cleaned.length > maxLength ? cleaned.slice(0, maxLength) + "..." : cleaned;
}

/**
 * Sanitize array of strings with per-item limit
 */
function sanitizeArray(arr: string[], maxItems = 10, maxPerItem = 300): string[] {
  return arr.slice(0, maxItems).map((s) => sanitizeForPrompt(s, maxPerItem));
}

/**
 * Build a rich context string for AI prompts
 * This is injected into the system prompt to give AI user context
 */
export async function buildMemoryContext(
  userId: string,
  skill: string,
  _actionType?: string
): Promise<string> {
  const memory = await loadMemory(userId);

  const parts: string[] = [];

  // Brand context
  if (memory.brand) {
    const b = memory.brand;
    parts.push("=== BRAND CONTEXT ===");
    if (b.brandName) parts.push(`Brand: ${b.brandName}`);
    if (b.tagline) parts.push(`Tagline: ${b.tagline}`);
    if (b.voice) parts.push(`Voice: ${b.voice}`);
    if (b.tone) parts.push(`Tone: ${b.tone}`);
    if (b.values?.length) parts.push(`Values: ${b.values.join(", ")}`);
    if (b.industry) parts.push(`Industry: ${b.industry}`);
    if (b.description) parts.push(`Description: ${b.description}`);
    if (b.avoidWords?.length) parts.push(`AVOID these words/phrases: ${b.avoidWords.join(", ")}`);
    if (b.keyMessages?.length) parts.push(`Key messages to convey: ${b.keyMessages.join("; ")}`);
    if (b.goodExamples?.length) {
      parts.push("=== GOOD COPY EXAMPLES (follow this style) ===");
      b.goodExamples.forEach((ex, i) => parts.push(`${i + 1}. ${ex}`));
    }
    if (b.badExamples?.length) {
      parts.push("=== BAD COPY EXAMPLES (avoid this style) ===");
      b.badExamples.forEach((ex, i) => parts.push(`${i + 1}. ${ex}`));
    }
  }

  // Relevant products
  if (memory.products.length > 0) {
    parts.push("\n=== PRODUCTS ===");
    memory.products.slice(0, 5).forEach((p) => {
      parts.push(`- ${p.name}${p.description ? `: ${p.description}` : ""}`);
      if (p.features?.length) parts.push(`  Features: ${p.features.join(", ")}`);
      if (p.benefits?.length) parts.push(`  Benefits: ${p.benefits.join(", ")}`);
      if (p.targetAudience?.length) parts.push(`  Target: ${p.targetAudience.join(", ")}`);
      if (p.differentiators?.length) parts.push(`  Differentiators: ${p.differentiators.join(", ")}`);
    });
  }

  // User preferences
  const pref = memory.preferences;
  parts.push("\n=== USER PREFERENCES ===");
  parts.push(`Language: ${pref.defaultLanguage}`);
  parts.push(`Tone: ${pref.defaultTone}`);
  if (pref.defaultAudience) parts.push(`Default audience: ${pref.defaultAudience}`);
  parts.push(`Include emoji: ${pref.includeEmoji ? "Yes" : "No"}`);
  if (pref.primaryPlatform) parts.push(`Primary platform: ${pref.primaryPlatform}`);
  if (pref.primaryGoal) parts.push(`Primary goal: ${pref.primaryGoal}`);

  // Recent generations for this skill
  const recentForSkill = memory.recentGenerations
    .filter((g) => g.skill === skill)
    .slice(0, 3);

  if (recentForSkill.length > 0) {
    parts.push(`\n=== RECENT ${skill.toUpperCase()} OUTPUTS (for continuity) ===`);
    recentForSkill.forEach((g, i) => {
      parts.push(`[${i + 1}] ${g.generatedContent.substring(0, 200)}...`);
    });
  }

  return parts.join("\n");
}

// ============ HELPERS ============

function sanitizeBrandMemory(b: Record<string, unknown>): BrandMemoryData {
  return {
    brandName: b.brandName as string | undefined,
    tagline: b.tagline as string | undefined,
    voice: b.voice as string | undefined,
    tone: b.tone as string | undefined,
    values: (b.values as string[]) ?? [],
    avoidWords: (b.avoidWords as string[]) ?? [],
    keyMessages: (b.keyMessages as string[]) ?? [],
    competitors: (b.competitors as string[]) ?? [],
    goodExamples: (b.goodExamples as string[]) ?? [],
    badExamples: (b.badExamples as string[]) ?? [],
    industry: b.industry as string | undefined,
    description: b.description as string | undefined,
  };
}

function sanitizeProductMemory(p: Record<string, unknown>): ProductMemoryData {
  return {
    name: p.name as string,
    description: p.description as string | undefined,
    category: p.category as string | undefined,
    features: (p.features as string[]) ?? [],
    benefits: (p.benefits as string[]) ?? [],
    differentiators: (p.differentiators as string[]) ?? [],
    targetAudience: (p.targetAudience as string[]) ?? [],
    useCases: (p.useCases as string[]) ?? [],
    priceRange: p.priceRange as string | undefined,
    position: p.position as string | undefined,
  };
}

function sanitizePreferences(p: Record<string, unknown>): UserPreferenceData {
  return {
    defaultLanguage: (p.defaultLanguage as string) ?? "English",
    defaultTone: (p.defaultTone as string) ?? "Professional",
    defaultAudience: p.defaultAudience as string | undefined,
    preferVariants: (p.preferVariants as boolean) ?? true,
    preferShortCopy: (p.preferShortCopy as boolean) ?? false,
    includeEmoji: (p.includeEmoji as boolean) ?? true,
    primaryPlatform: p.primaryPlatform as string | undefined,
    primaryGoal: p.primaryGoal as string | undefined,
  };
}

function getDefaultPreferences(): UserPreferenceData {
  return {
    defaultLanguage: "English",
    defaultTone: "Professional",
    preferVariants: true,
    preferShortCopy: false,
    includeEmoji: true,
  };
}
