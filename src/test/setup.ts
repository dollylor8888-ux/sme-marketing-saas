import { vi, beforeEach, afterEach } from "vitest";
import "@testing-library/dom";

// Mock Prisma client
const mockPrismaClient = {
  creditAccount: {
    findUnique: vi.fn(),
    update: vi.fn(),
    create: vi.fn(),
  },
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
  },
  transaction: {
    create: vi.fn(),
  },
};

vi.mock("@/lib/db/prisma", () => ({
  prisma: mockPrismaClient,
}));

// Reset all mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

export { mockPrismaClient };
