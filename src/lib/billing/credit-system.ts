/**
 * Credit System — Shared between frontend and backend
 * Handles credit balance checks, deductions, and top-ups
 */

import { prisma } from "../db/prisma";
export { prisma };

// ============ USER FACING (Credit Balance) ============

/**
 * Get user's current credit balance
 */
export async function getCreditBalance(userId: string): Promise<number> {
  const account = await prisma.creditAccount.findUnique({
    where: { userId },
  });
  return account?.balance ?? 0;
}

/**
 * Deduct credits for an action (returns false if insufficient)
 * Uses atomic UPDATE with balance check to prevent race conditions
 */
export async function deductCredits(
  userId: string,
  amount: number,
  description: string
): Promise<{ success: boolean; remaining: number }> {
  try {
    const updated = await prisma.creditAccount.update({
      where: {
        userId,
        // Atomic: only update if balance is sufficient
        balance: { gte: amount },
      },
      data: {
        balance: { decrement: amount },
        transactions: {
          create: { amount: -amount, type: "ACTION_DEDUCT", description },
        },
      },
    });
    return { success: true, remaining: updated.balance };
  } catch (error: unknown) {
    // Prisma throws if UPDATE WHERE clause doesn't match
    if (error && typeof error === "object" && "code" in error && (error as { code: string }).code === "P2025") {
      // Record not found or insufficient balance
      const account = await prisma.creditAccount.findUnique({ where: { userId } });
      return { success: false, remaining: account?.balance ?? 0 };
    }
    throw error;
  }
}

/**
 * Refund credits for a failed action
 * Used when AI generation fails after credits were already deducted
 */
export async function refundCredits(
  userId: string,
  amount: number,
  description: string
): Promise<{ success: boolean; newBalance: number }> {
  const updated = await prisma.creditAccount.update({
    where: { userId },
    data: {
      balance: { increment: amount },
      transactions: {
        create: { amount, type: "REFUND", description },
      },
    },
  });
  return { success: true, newBalance: updated.balance };
}

/**
 * Top up credits
 */
export async function topUpCredits(
  userId: string,
  amount: number,
  paymentRef?: string
): Promise<{ success: boolean; newBalance: number }> {
  const account = await prisma.creditAccount.findUnique({
    where: { userId },
  });

  if (!account) {
    // Create account if doesn't exist
    const newAccount = await prisma.creditAccount.create({
      data: {
        userId,
        balance: amount,
        transactions: {
          create: { amount, type: "TOP_UP", description: paymentRef ?? "Credit top-up" },
        },
      },
    });
    return { success: true, newBalance: newAccount.balance };
  }

  const updated = await prisma.creditAccount.update({
    where: { userId },
    data: {
      balance: { increment: amount },
      transactions: {
        create: { amount, type: "TOP_UP", description: paymentRef ?? "Credit top-up" },
      },
    },
  });

  return { success: true, newBalance: updated.balance };
}

/**
 * Ensure user has a credit account
 */
export async function ensureCreditAccount(clerkId: string, email: string, name?: string) {
  let user = await prisma.user.findUnique({ where: { clerkId } });

  if (!user) {
    user = await prisma.user.create({
      data: { clerkId, email, name },
    });
    // Give starter credits
    await prisma.creditAccount.create({
      data: {
        userId: user.id,
        balance: 100, // Free starter credits
        transactions: {
          create: { amount: 100, type: "BONUS", description: "Welcome bonus" },
        },
      },
    });
  } else {
    // Ensure credit account exists
    const account = await prisma.creditAccount.findUnique({ where: { userId: user.id } });
    if (!account) {
      await prisma.creditAccount.create({
        data: {
          userId: user.id,
          balance: 0,
        },
      });
    }
  }

  return user;
}
