import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mockPrismaClient } from "../../test/setup";

// Re-import after mocking
import {
  getCreditBalance,
  deductCredits,
  refundCredits,
  topUpCredits,
  ensureCreditAccount,
} from "@/lib/billing/credit-system";

describe("Credit System", () => {
  describe("getCreditBalance", () => {
    it("returns balance for existing user", async () => {
      vi.mocked(mockPrismaClient.creditAccount.findUnique).mockResolvedValue({
        id: "acc-1",
        userId: "user-1",
        balance: 85,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const balance = await getCreditBalance("user-1");
      expect(balance).toBe(85);
    });

    it("returns 0 when account not found", async () => {
      vi.mocked(mockPrismaClient.creditAccount.findUnique).mockResolvedValue(null);

      const balance = await getCreditBalance("nonexistent");
      expect(balance).toBe(0);
    });
  });

  describe("deductCredits — atomic update", () => {
    it("deducts credits when balance is sufficient", async () => {
      vi.mocked(mockPrismaClient.creditAccount.update).mockResolvedValue({
        id: "acc-1",
        userId: "user-1",
        balance: 75,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await deductCredits("user-1", 10, "AI SEO: optimize_content");

      expect(result.success).toBe(true);
      expect(result.remaining).toBe(75);
      expect(mockPrismaClient.creditAccount.update).toHaveBeenCalledWith({
        where: { userId: "user-1", balance: { gte: 10 } },
        data: {
          balance: { decrement: 10 },
          transactions: {
            create: {
              amount: -10,
              type: "ACTION_DEDUCT",
              description: "AI SEO: optimize_content",
            },
          },
        },
      });
    });

    it("fails when balance is insufficient — no update called", async () => {
      // Prisma throws RecordNotFound when WHERE clause doesn't match
      vi.mocked(mockPrismaClient.creditAccount.update).mockRejectedValue({
        code: "P2025",
        name: "PrismaClientKnownRequestError",
      });
      vi.mocked(mockPrismaClient.creditAccount.findUnique).mockResolvedValue({
        id: "acc-1",
        userId: "user-1",
        balance: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await deductCredits("user-1", 10, "AI SEO: optimize_content");

      expect(result.success).toBe(false);
      expect(result.remaining).toBe(5);
    });

    it("fails when account does not exist", async () => {
      vi.mocked(mockPrismaClient.creditAccount.update).mockRejectedValue({
        code: "P2025",
        name: "PrismaClientKnownRequestError",
      });
      vi.mocked(mockPrismaClient.creditAccount.findUnique).mockResolvedValue(null);

      const result = await deductCredits("nonexistent", 10, "Test");

      expect(result.success).toBe(false);
      expect(result.remaining).toBe(0);
    });
  });

  describe("refundCredits", () => {
    it("refunds credits with REFUND transaction type", async () => {
      vi.mocked(mockPrismaClient.creditAccount.update).mockResolvedValue({
        id: "acc-1",
        userId: "user-1",
        balance: 85,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await refundCredits(
        "user-1",
        10,
        "REFUND: AI SEO failed — optimize_content"
      );

      expect(result.success).toBe(true);
      expect(result.newBalance).toBe(85);
      expect(mockPrismaClient.creditAccount.update).toHaveBeenCalledWith({
        where: { userId: "user-1" },
        data: {
          balance: { increment: 10 },
          transactions: {
            create: {
              amount: 10,
              type: "REFUND",
              description: "REFUND: AI SEO failed — optimize_content",
            },
          },
        },
      });
    });
  });

  describe("topUpCredits", () => {
    it("creates account with balance when none exists", async () => {
      vi.mocked(mockPrismaClient.creditAccount.findUnique).mockResolvedValue(null);
      vi.mocked(mockPrismaClient.creditAccount.create).mockResolvedValue({
        id: "acc-new",
        userId: "user-new",
        balance: 50,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await topUpCredits("user-new", 50, "stripe_pi_123");

      expect(result.success).toBe(true);
      expect(result.newBalance).toBe(50);
      expect(mockPrismaClient.creditAccount.create).toHaveBeenCalledWith({
        data: {
          userId: "user-new",
          balance: 50,
          transactions: {
            create: {
              amount: 50,
              type: "TOP_UP",
              description: "stripe_pi_123",
            },
          },
        },
      });
    });

    it("increments balance when account already exists", async () => {
      vi.mocked(mockPrismaClient.creditAccount.findUnique).mockResolvedValue({
        id: "acc-1",
        userId: "user-1",
        balance: 50,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      vi.mocked(mockPrismaClient.creditAccount.update).mockResolvedValue({
        id: "acc-1",
        userId: "user-1",
        balance: 150,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await topUpCredits("user-1", 100);

      expect(result.success).toBe(true);
      expect(result.newBalance).toBe(150);
    });
  });

  describe("ensureCreditAccount", () => {
    it("creates user and credit account on first call", async () => {
      vi.mocked(mockPrismaClient.user.findUnique).mockResolvedValue(null);
      vi.mocked(mockPrismaClient.user.create).mockResolvedValue({
        id: "db-user-1",
        clerkId: "clerk-user-1",
        email: "test@example.com",
        name: "Test User",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      vi.mocked(mockPrismaClient.creditAccount.create).mockResolvedValue({
        id: "acc-1",
        userId: "db-user-1",
        balance: 100,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const user = await ensureCreditAccount(
        "clerk-user-1",
        "test@example.com",
        "Test User"
      );

      expect(user.clerkId).toBe("clerk-user-1");
      expect(mockPrismaClient.user.create).toHaveBeenCalledWith({
        data: {
          clerkId: "clerk-user-1",
          email: "test@example.com",
          name: "Test User",
        },
      });
      expect(mockPrismaClient.creditAccount.create).toHaveBeenCalledWith({
        data: {
          userId: "db-user-1",
          balance: 100,
          transactions: {
            create: {
              amount: 100,
              type: "BONUS",
              description: "Welcome bonus",
            },
          },
        },
      });
    });

    it("returns existing user without creating duplicate", async () => {
      vi.mocked(mockPrismaClient.user.findUnique).mockResolvedValue({
        id: "db-user-1",
        clerkId: "clerk-user-1",
        email: "test@example.com",
        name: "Test User",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      vi.mocked(mockPrismaClient.creditAccount.findUnique).mockResolvedValue({
        id: "acc-1",
        userId: "db-user-1",
        balance: 100,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const user = await ensureCreditAccount(
        "clerk-user-1",
        "test@example.com",
        "Test User"
      );

      expect(user.id).toBe("db-user-1");
      expect(mockPrismaClient.user.create).not.toHaveBeenCalled();
    });
  });
});
