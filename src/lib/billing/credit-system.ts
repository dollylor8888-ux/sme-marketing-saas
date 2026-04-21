/**
 * Credit System — Shared between frontend and backend
 * Handles credit balance checks, deductions, and top-ups
 */

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

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
 */
export async function deductCredits(
  userId: string,
  amount: number,
  description: string
): Promise<{ success: boolean; remaining: number }> {
  const account = await prisma.creditAccount.findUnique({
    where: { userId },
  });

  if (!account || account.balance < amount) {
    return { success: false, remaining: account?.balance ?? 0 };
  }

  const updated = await prisma.creditAccount.update({
    where: { userId },
    data: {
      balance: { decrement: amount },
      transactions: {
        create: { amount: -amount, type: "ACTION_DEDUCT", description },
      },
    },
  });

  return { success: true, remaining: updated.balance };
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
