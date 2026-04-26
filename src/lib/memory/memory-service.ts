/**
 * Memory Service
 * Brand Intelligence Hub - Learning from every interaction
 */

import { prisma } from '@/lib/billing/credit-system';

export type MemoryContext = {
  brandMemory: Record<string, unknown> | null;
  products: Record<string, unknown>[];
  preferences: Record<string, unknown> | null;
  recentGenerations: Record<string, unknown>[];
};

/**
 * Load all memory context for a user
 */
export async function loadMemoryContext(clerkId: string): Promise<MemoryContext | null> {
  const user = await prisma.user.findUnique({
    where: { clerkId },
  });

  if (!user) return null;

  // Get first workspace
  const workspace = await prisma.workspace.findFirst({
    where: { userId: user.id },
  });

  const [brandMemory, products, preferences, generations] = await Promise.all([
    workspace ? prisma.brandMemory.findUnique({ where: { workspaceId: workspace.id } }) : null,
    workspace ? prisma.product.findMany({ where: { workspaceId: workspace.id } }) : [],
    workspace ? prisma.userPreference.findUnique({ where: { userId: user.id } }) : null,
    prisma.generationHistory.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
  ]);

  return {
    brandMemory: brandMemory as Record<string, unknown> | null,
    products: products as Record<string, unknown>[],
    preferences: preferences as Record<string, unknown> | null,
    recentGenerations: generations as Record<string, unknown>[],
  };
}

/**
 * Save or update brand memory
 */
export async function saveBrandMemory(
  clerkId: string,
  data: Record<string, unknown>
): Promise<unknown> {
  const user = await prisma.user.findUnique({
    where: { clerkId },
  });

  if (!user) return null;

  const workspace = await prisma.workspace.findFirst({
    where: { userId: user.id },
  });

  if (!workspace) return null;

  return prisma.brandMemory.upsert({
    where: { workspaceId: workspace.id },
    update: data,
    create: { workspaceId: workspace.id, ...data },
  });
}

/**
 * Save product
 */
export async function saveProduct(
  clerkId: string,
  data: Record<string, unknown> & { name: string; url: string }
): Promise<unknown> {
  const user = await prisma.user.findUnique({
    where: { clerkId },
  });

  if (!user) return null;

  const workspace = await prisma.workspace.findFirst({
    where: { userId: user.id },
  });

  if (!workspace) return null;

  const { id, ...rest } = data;

  if (id) {
    return prisma.product.update({
      where: { id: id as string },
      data: rest,
    });
  }

  return prisma.product.create({
    data: { workspaceId: workspace.id, ...rest },
  });
}

/**
 * Build context string for AI prompts
 */
export function buildMemoryContext(ctx: MemoryContext | null): string {
  if (!ctx) return '[No memory context available]';

  const parts: string[] = [];

  parts.push('=== BRAND MEMORY ===');
  if (ctx.brandMemory) {
    const bm = ctx.brandMemory;
    if (bm.brandName) parts.push(`Brand: ${bm.brandName}`);
    if (bm.industry) parts.push(`Industry: ${bm.industry}`);
    if (bm.tone) parts.push(`Tone: ${bm.tone}`);
    if (bm.keyMessages) parts.push(`Key Messages: ${(bm.keyMessages as string[]).join(', ')}`);
    if (bm.winningStyles) parts.push(`Winning Styles: ${(bm.winningStyles as string[]).join(', ')}`);
    if (bm.bestAudiences) parts.push(`Best Audiences: ${(bm.bestAudiences as string[]).join(', ')}`);
  } else {
    parts.push('[No brand memory set yet]');
  }

  parts.push('\n=== PRODUCTS ===');
  if (ctx.products.length > 0) {
    ctx.products.forEach((pm, i) => {
      parts.push(`Product ${i + 1}: ${pm.name || 'Unnamed'}`);
      if (pm.description) parts.push(`  Desc: ${pm.description}`);
      if (pm.category) parts.push(`  Category: ${pm.category}`);
      if (pm.sellingPoints) parts.push(`  Selling Points: ${JSON.stringify(pm.sellingPoints)}`);
    });
  } else {
    parts.push('[No products yet]');
  }

  parts.push('\n=== USER PREFERENCES ===');
  if (ctx.preferences) {
    const p = ctx.preferences;
    if (p.defaultLanguage) parts.push(`Language: ${p.defaultLanguage}`);
    if (p.defaultTone) parts.push(`Tone: ${p.defaultTone}`);
    if (p.defaultAudience) parts.push(`Audience: ${p.defaultAudience}`);
    if (p.primaryPlatform) parts.push(`Platform: ${p.primaryPlatform}`);
  } else {
    parts.push('[No preferences set yet]');
  }

  parts.push('\n=== RECENT GENERATIONS ===');
  if (ctx.recentGenerations.length > 0) {
    ctx.recentGenerations.slice(0, 5).forEach((g, i) => {
      parts.push(`${i + 1}. [${g.skill || g.actionType || 'copy'}] ${String(g.generatedContent || '').slice(0, 100)}...`);
    });
  } else {
    parts.push('[No generations yet]');
  }

  return parts.join('\n');
}

/**
 * Record a generation for learning
 * Supports both old 2-arg signature: saveGeneration(clerkId, { skill, actionType, inputData, generatedContent })
 * And new 4-arg signature: saveGeneration(clerkId, type, content, metadata)
 */
export async function saveGeneration(
  clerkId: string,
  typeOrData: string | Record<string, unknown>,
  contentOrMetadata?: string | Record<string, unknown>,
  metadata?: Record<string, unknown>
): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { clerkId },
  });

  if (!user) return;

  // Old 2-arg signature
  if (typeof typeOrData === 'object') {
    const data = typeOrData as Record<string, unknown>;
    await prisma.generationHistory.create({
      data: {
        userId: user.id,
        skill: data.skill as string || 'unknown',
        actionType: data.actionType as string || 'unknown',
        inputData: typeof data.inputData === 'string' ? data.inputData : JSON.stringify(data.inputData || {}),
        generatedContent: data.generatedContent as string || '',
      },
    });
    return;
  }

  // New 4-arg signature
  await prisma.generationHistory.create({
    data: {
      userId: user.id,
      skill: typeOrData,
      actionType: typeOrData,
      generatedContent: typeof contentOrMetadata === 'string' ? contentOrMetadata : JSON.stringify(contentOrMetadata || {}),
      inputData: JSON.stringify(metadata || {}),
    },
  });
}

// Alias for backward compatibility
export const recordGeneration = saveGeneration;

/**
 * Extract winning patterns from history
 */
export function extractWinningPatterns(generations: Record<string, unknown>[]): string {
  const patterns: string[] = [];

  const byType: Record<string, number> = {};
  generations.forEach((g) => {
    const t = (g.skill || g.actionType || 'unknown') as string;
    byType[t] = (byType[t] || 0) + 1;
  });

  Object.entries(byType).forEach(([type, count]) => {
    if (count >= 1) {
      patterns.push(`- ${type}: ${count} generations recorded`);
    }
  });

  return patterns.length > 0 ? patterns.join('\n') : 'Not enough data for pattern analysis';
}
