/**
 * Credit System — Shared between frontend and backend
 * Handles credit balance checks, deductions, and top-ups
 */

import { prisma } from "@/lib/db/prisma";
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
 * Uses atomic update to prevent race conditions
 */
export async function deductCredits(
  userId: string,
  amount: number,
  description: string
): Promise<{ success: boolean; remaining: number }> {
  return prisma.$transaction(async (tx) => {
    const updated = await tx.creditAccount.updateMany({
      where: {
        userId,
        balance: { gte: amount },
      },
      data: {
        balance: { decrement: amount },
      },
    });

    if (updated.count === 0) {
      const account = await tx.creditAccount.findUnique({
        where: { userId },
      });
      return { success: false, remaining: account?.balance ?? 0 };
    }

    const account = await tx.creditAccount.findUnique({
      where: { userId },
      select: { id: true, balance: true },
    });

    if (!account) {
      throw new Error("Credit account missing after deduction");
    }

    await tx.creditTransaction.create({
      data: {
        accountId: account.id,
        amount: -amount,
        type: "ACTION_DEDUCT",
        description,
      },
    });

    return { success: true, remaining: account.balance };
  });
}

/**
 * Refund credits for failed operations.
 */
export async function refundCredits(
  userId: string,
  amount: number,
  description: string
): Promise<{ success: boolean; newBalance: number }> {
  const account = await prisma.creditAccount.update({
    where: { userId },
    data: {
      balance: { increment: amount },
      transactions: {
        create: { amount, type: "REFUND", description },
      },
    },
  });

  return { success: true, newBalance: account.balance };
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
 /**
 * Ensure user exists (get or create) from Clerk ID
 * Uses Clerk to get email/name
 */
export async function ensureUser(clerkId: string) {
  const { clerkClient } = await import("@clerk/nextjs/server");
  const clerkUser = await (await clerkClient()).users.getUser(clerkId);
  const email = clerkUser.emailAddresses[0]?.emailAddress ?? "unknown@unknown.com";
  const name = clerkUser.fullName ?? undefined;
  
  return ensureCreditAccount(clerkId, email, name);
}
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

// ============ REFERRAL / AFFILIATE FUNCTIONS ============

const REFERRAL_SIGN_UP_BONUS = 20; // credits for the referrer when someone signs up
const AFFILIATE_COMMISSION_RATE = 0.1; // 10% of credits purchased by referred user

/**
 * Generate a unique referral code for a user
 */
export async function getOrCreateReferralCode(userId: string): Promise<string> {
  const existing = await prisma.referral.findFirst({
    where: { referrerId: userId },
  });

  if (existing) return existing.referralCode;

  // Generate a unique code
  let code: string;
  let attempts = 0;
  do {
    code = generateReferralCode();
    const found = await prisma.referral.findUnique({ where: { referralCode: code } });
    if (!found) break;
    attempts++;
  } while (attempts < 10);

  await prisma.referral.create({
    data: {
      referrerId: userId,
      referralCode: code,
    },
  });

  return code;
}

function generateReferralCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Apply a referral code during sign-up - gives sign-up bonus to the referrer
 */
export async function applyReferralCode(referralCode: string, newUserId: string): Promise<{ success: boolean; bonusAwarded: boolean }> {
  const referral = await prisma.referral.findUnique({
    where: { referralCode: referralCode.toUpperCase() },
  });

  if (!referral) return { success: false, bonusAwarded: false };

  // Prevent self-referral
  if (referral.referrerId === newUserId) return { success: false, bonusAwarded: false };

  // Check if already referred
  const existingUsage = await prisma.referralUsage.findFirst({
    where: { referralId: referral.id, referredUserId: newUserId },
  });

  if (existingUsage) return { success: false, bonusAwarded: false };

  // Create usage record
  const usage = await prisma.referralUsage.create({
    data: {
      referralId: referral.id,
      referredUserId: newUserId,
      signUpBonusAwarded: true,
    },
  });

  // Award sign-up bonus to referrer
  await prisma.creditAccount.update({
    where: { userId: referral.referrerId },
    data: {
      balance: { increment: REFERRAL_SIGN_UP_BONUS },
      transactions: {
        create: {
          amount: REFERRAL_SIGN_UP_BONUS,
          type: "REFERRAL_BONUS",
          description: `Sign-up bonus for inviting a friend (${usage.id.slice(0, 8)})`,
        },
      },
    },
  });

  return { success: true, bonusAwarded: true };
}

/**
 * Award affiliate commission when referred user purchases credits
 */
export async function awardAffiliateCommission(
  referredUserId: string,
  purchaseAmount: number
): Promise<{ success: boolean; commissionAmount: number }> {
  // Find the referral that led to this user
  const usage = await prisma.referralUsage.findFirst({
    where: {
      referredUserId,
      signUpBonusAwarded: true,
      firstPurchaseBonusAwarded: false,
    },
    include: { referral: true },
  });

  if (!usage) return { success: false, commissionAmount: 0 };

  const commissionAmount = Math.floor(purchaseAmount * AFFILIATE_COMMISSION_RATE);
  if (commissionAmount <= 0) return { success: false, commissionAmount: 0 };

  // Record commission
  await prisma.affiliateCommission.create({
    data: {
      referralId: usage.referralId,
      referredUserId,
      purchaseAmount,
      commissionAmount,
      status: "credited",
      creditedAt: new Date(),
    },
  });

  // Mark purchase as credited
  await prisma.referralUsage.update({
    where: { id: usage.id },
    data: { firstPurchaseBonusAwarded: true },
  });

  // Credit the referrer
  await prisma.creditAccount.update({
    where: { userId: usage.referral.referrerId },
    data: {
      balance: { increment: commissionAmount },
      transactions: {
        create: {
          amount: commissionAmount,
          type: "AFFILIATE_COMMISSION",
          description: `Commission for friend's first credit purchase (${purchaseAmount} credits)`,
        },
      },
    },
  });

  return { success: true, commissionAmount };
}

/**
 * Get referral stats for a user
 */
export async function getReferralStats(userId: string): Promise<{
  referralCode: string;
  totalReferrals: number;
  totalEarnings: number;
  pendingCommissions: number;
}> {
  const referral = await prisma.referral.findFirst({
    where: { referrerId: userId },
    include: {
      referredUsers: true,
      commissions: true,
    },
  });

  if (!referral) {
    return {
      referralCode: await getOrCreateReferralCode(userId),
      totalReferrals: 0,
      totalEarnings: 0,
      pendingCommissions: 0,
    };
  }

  const totalEarnings = referral.commissions
    .filter(c => c.status === "credited")
    .reduce((sum, c) => sum + c.commissionAmount, 0);

  const pendingCommissions = referral.commissions
    .filter(c => c.status === "pending")
    .reduce((sum, c) => sum + c.commissionAmount, 0);

  return {
    referralCode: referral.referralCode,
    totalReferrals: referral.referredUsers.length,
    totalEarnings,
    pendingCommissions,
  };
}
