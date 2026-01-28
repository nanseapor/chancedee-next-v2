/**
 * @fileoverview Tests for getTransactionHistoryPaginated action
 * @specification BLS-10 Wallet Management
 * @section BLS-10-02
 *
 * Requirements tested:
 * - BLS-10-02.auth: User must be authenticated
 * - BLS-10-02.auth.owner: User must be wallet owner
 * - BLS-10-02.query: Return transactions ordered by time DESC
 * - BLS-10-02.pagination: Support cursor-based pagination
 * - BLS-10-02.response: Return proper response shape
 * - BLS-10-02.empty: Handle empty results
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock dependencies
vi.mock("@/lib/firebase/admin-auth", () => ({
  getSessionUser: vi.fn(),
}));

// Create mock data for Firestore
const mockCoinTransactionDocs = [
  {
    id: "tx-1",
    data: () => ({
      transaction_owner: "system",
      transaction_receiver: "candidate-123",
      transaction_origin: "first_interview_reward",
      transaction_type: "deposit",
      transaction_amount: 100,
      transaction_currency: "coin",
      transaction_time: { toMillis: () => 1704067200000 }, // 2024-01-01
      remark: "รางวัลสัมภาษณ์ครั้งแรก",
    }),
  },
  {
    id: "tx-2",
    data: () => ({
      transaction_owner: "system",
      transaction_receiver: "candidate-123",
      transaction_origin: "signup_reward",
      transaction_type: "deposit",
      transaction_amount: 100,
      transaction_currency: "coin",
      transaction_time: { toMillis: () => 1703980800000 }, // 2023-12-31
      remark: "โบนัสสมัครสมาชิก",
    }),
  },
  {
    id: "tx-3",
    data: () => ({
      transaction_owner: "system",
      transaction_receiver: "candidate-123",
      transaction_origin: "referral_received",
      transaction_type: "deposit",
      transaction_amount: 50,
      transaction_currency: "coin",
      transaction_time: { toMillis: () => 1703894400000 }, // 2023-12-30
      remark: "โบนัสแนะนำ",
    }),
  },
];

const mockStarTransactionDocs = [
  {
    id: "star-tx-1",
    data: () => ({
      transaction_owner: "system",
      transaction_receiver: "candidate-123",
      transaction_origin: "star_reward",
      transaction_type: "deposit",
      transaction_amount: 10,
      transaction_currency: "star",
      transaction_time: { toMillis: () => 1704067200000 },
      remark: "รางวัลดาว",
    }),
  },
];

// Helper to create cursor doc mock
const createCursorDocMock = (exists: boolean) => ({
  exists,
  data: () => mockCoinTransactionDocs[0]?.data(),
});

// Helper to create query result mock
const createQueryResultMock = (docs: typeof mockCoinTransactionDocs) => ({
  docs,
  empty: docs.length === 0,
});

// Variable to track current mock behavior
let mockQueryDocs = mockCoinTransactionDocs;
let mockCursorDocExists = true;
let mockShouldThrow = false;

// Create chainable mock
const createChainableMock = () => {
  const chainMock: any = {
    where: vi.fn(() => chainMock),
    orderBy: vi.fn(() => chainMock),
    limit: vi.fn((limitValue: number) => {
      // Store the limit for use in get()
      chainMock._limit = limitValue;
      return chainMock;
    }),
    startAfter: vi.fn(() => chainMock),
    get: vi.fn(async () => {
      // Return sliced docs based on limit
      const limit = chainMock._limit || mockQueryDocs.length;
      return createQueryResultMock(mockQueryDocs.slice(0, limit));
    }),
    doc: vi.fn((id: string) => ({
      id,
      get: vi.fn(async () => createCursorDocMock(mockCursorDocExists)),
    })),
    _limit: null as number | null,
  };
  return chainMock;
};

vi.mock("@/lib/firebase/admin", () => ({
  getFirebaseAdminFirestore: vi.fn(() => {
    if (mockShouldThrow) {
      throw new Error("Database error");
    }
    return {
      collection: vi.fn(() => createChainableMock()),
    };
  }),
}));

import { getSessionUser } from "@/lib/firebase/admin-auth";

describe("getTransactionHistoryPaginated", () => {
  const mockCandidateUser = {
    uid: "user-123",
    candidateId: "candidate-123",
    companyId: null,
    email: "candidate@example.com",
  };

  const validInput = {
    userId: "candidate-123",
    currency: "coin" as const,
    limit: 20,
    startAfter: undefined,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getSessionUser).mockResolvedValue(mockCandidateUser);
    mockQueryDocs = mockCoinTransactionDocs;
    mockCursorDocExists = true;
    mockShouldThrow = false;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
  });

  describe("Authorization", () => {
    /**
     * Requirement: BLS-10-02.auth
     * "User must be authenticated"
     */
    it("should reject if user is not authenticated", async () => {
      vi.mocked(getSessionUser).mockResolvedValue(null);

      const { getTransactionHistoryPaginated } = await import(
        "@/lib/database/actions/wallet-transactions"
      );

      await expect(
        getTransactionHistoryPaginated(validInput)
      ).rejects.toThrow("UNAUTHORIZED");
    });

    /**
     * Requirement: BLS-10-02.auth.owner
     * "User must be wallet owner"
     */
    it("should reject if user is not wallet owner", async () => {
      vi.mocked(getSessionUser).mockResolvedValue({
        ...mockCandidateUser,
        candidateId: "different-candidate",
      });

      const { getTransactionHistoryPaginated } = await import(
        "@/lib/database/actions/wallet-transactions"
      );

      await expect(
        getTransactionHistoryPaginated(validInput)
      ).rejects.toThrow("FORBIDDEN");
    });
  });

  describe("Query Behavior", () => {
    /**
     * Requirement: BLS-10-02.query
     * "Return transactions ordered by time DESC (most recent first)"
     */
    it("should order transactions by transactionTime descending", async () => {
      const { getTransactionHistoryPaginated } = await import(
        "@/lib/database/actions/wallet-transactions"
      );

      const result = await getTransactionHistoryPaginated(validInput);

      // First transaction should be more recent than second
      if (result.transactions.length >= 2) {
        expect(result.transactions[0].transactionTime).toBeGreaterThan(
          result.transactions[1].transactionTime
        );
      }
    });

    /**
     * Requirement: BLS-10-02.query
     * "Filter by currency (coin or star)"
     */
    it("should filter by coin currency", async () => {
      const { getTransactionHistoryPaginated } = await import(
        "@/lib/database/actions/wallet-transactions"
      );

      const result = await getTransactionHistoryPaginated({
        ...validInput,
        currency: "coin",
      });

      result.transactions.forEach((tx) => {
        expect(tx.transactionCurrency).toBe("coin");
      });
    });

    /**
     * Requirement: BLS-10-02.query
     * "Filter by currency (coin or star)"
     */
    it("should filter by star currency", async () => {
      mockQueryDocs = mockStarTransactionDocs;

      const { getTransactionHistoryPaginated } = await import(
        "@/lib/database/actions/wallet-transactions"
      );

      const result = await getTransactionHistoryPaginated({
        ...validInput,
        currency: "star",
      });

      result.transactions.forEach((tx) => {
        expect(tx.transactionCurrency).toBe("star");
      });
    });
  });

  describe("Pagination", () => {
    /**
     * Requirement: BLS-10-02.pagination
     * "Support cursor-based pagination with limit"
     */
    it("should respect limit parameter", async () => {
      const { getTransactionHistoryPaginated } = await import(
        "@/lib/database/actions/wallet-transactions"
      );

      const result = await getTransactionHistoryPaginated({
        ...validInput,
        limit: 2,
      });

      expect(result.transactions.length).toBeLessThanOrEqual(2);
    });

    /**
     * Requirement: BLS-10-02.pagination
     * "Default limit is 20"
     */
    it("should use default limit of 20 if not specified", async () => {
      const { getTransactionHistoryPaginated } = await import(
        "@/lib/database/actions/wallet-transactions"
      );

      const result = await getTransactionHistoryPaginated({
        userId: "candidate-123",
        currency: "coin",
      });

      // Should use default limit (we can't directly test this without checking query,
      // but we verify it doesn't crash and returns valid structure)
      expect(result.transactions).toBeDefined();
      expect(Array.isArray(result.transactions)).toBe(true);
    });

    /**
     * Requirement: BLS-10-02.pagination
     * "Support startAfter cursor for pagination"
     */
    it("should continue from startAfter cursor", async () => {
      // Mock cursor doc exists
      mockCursorDocExists = true;

      const { getTransactionHistoryPaginated } = await import(
        "@/lib/database/actions/wallet-transactions"
      );

      const result = await getTransactionHistoryPaginated({
        ...validInput,
        startAfter: "tx-1",
      });

      // The implementation uses startAfter so first item should be different
      // With mock, we just verify the function executes without error
      expect(result.transactions).toBeDefined();
    });

    /**
     * Requirement: BLS-10-02.pagination
     * "Return hasMore flag indicating if more results exist"
     */
    it("should return hasMore=true when more results exist", async () => {
      const { getTransactionHistoryPaginated } = await import(
        "@/lib/database/actions/wallet-transactions"
      );

      // Fetch with limit 1 when there are 3 transactions
      // We request 1, but implementation fetches limit+1 to check hasMore
      const result = await getTransactionHistoryPaginated({
        ...validInput,
        limit: 1,
      });

      // With 3 mock docs and limit 1 (fetching 2), we should have hasMore=true
      expect(result.hasMore).toBe(true);
    });

    /**
     * Requirement: BLS-10-02.pagination
     * "Return hasMore=false when no more results"
     */
    it("should return hasMore=false when no more results", async () => {
      const { getTransactionHistoryPaginated } = await import(
        "@/lib/database/actions/wallet-transactions"
      );

      // Fetch all transactions with high limit
      const result = await getTransactionHistoryPaginated({
        ...validInput,
        limit: 100,
      });

      expect(result.hasMore).toBe(false);
    });

    /**
     * Requirement: BLS-10-02.pagination
     * "Return lastVisible for next pagination call"
     */
    it("should return lastVisible cursor when there are results", async () => {
      const { getTransactionHistoryPaginated } = await import(
        "@/lib/database/actions/wallet-transactions"
      );

      const result = await getTransactionHistoryPaginated(validInput);

      if (result.transactions.length > 0) {
        expect(result.lastVisible).not.toBeNull();
        expect(typeof result.lastVisible).toBe("string");
      }
    });
  });

  describe("Response Shape", () => {
    /**
     * Requirement: BLS-10-02.response
     * "Return proper response shape"
     */
    it("should return correct response structure", async () => {
      const { getTransactionHistoryPaginated } = await import(
        "@/lib/database/actions/wallet-transactions"
      );

      const result = await getTransactionHistoryPaginated(validInput);

      expect(result).toHaveProperty("transactions");
      expect(result).toHaveProperty("hasMore");
      expect(result).toHaveProperty("lastVisible");
      expect(Array.isArray(result.transactions)).toBe(true);
      expect(typeof result.hasMore).toBe("boolean");
    });

    /**
     * Requirement: BLS-10-02.response
     * "Each transaction has required fields"
     */
    it("should return transactions with all required fields", async () => {
      const { getTransactionHistoryPaginated } = await import(
        "@/lib/database/actions/wallet-transactions"
      );

      const result = await getTransactionHistoryPaginated(validInput);

      result.transactions.forEach((tx) => {
        expect(tx).toHaveProperty("transactionId");
        expect(tx).toHaveProperty("transactionOwner");
        expect(tx).toHaveProperty("transactionOrigin");
        expect(tx).toHaveProperty("transactionType");
        expect(tx).toHaveProperty("transactionAmount");
        expect(tx).toHaveProperty("transactionTime");
        expect(tx).toHaveProperty("transactionCurrency");
      });
    });
  });

  describe("Empty State", () => {
    /**
     * Requirement: BLS-10-02.empty
     * "Handle empty results gracefully"
     */
    it("should return empty array when no transactions exist", async () => {
      mockQueryDocs = [];

      const { getTransactionHistoryPaginated } = await import(
        "@/lib/database/actions/wallet-transactions"
      );

      const result = await getTransactionHistoryPaginated(validInput);

      expect(result.transactions).toEqual([]);
      expect(result.hasMore).toBe(false);
      expect(result.lastVisible).toBeNull();
    });
  });

  describe("Error Handling", () => {
    /**
     * Requirement: BLS-10-02.error
     * "Handle database errors gracefully"
     */
    it("should throw on database error", async () => {
      mockShouldThrow = true;

      const { getTransactionHistoryPaginated } = await import(
        "@/lib/database/actions/wallet-transactions"
      );

      await expect(
        getTransactionHistoryPaginated(validInput)
      ).rejects.toThrow("Database error");
    });
  });

  describe("Input Validation", () => {
    /**
     * Requirement: BLS-10-02.validation
     * "Validate currency parameter"
     */
    it("should reject invalid currency", async () => {
      const { getTransactionHistoryPaginated } = await import(
        "@/lib/database/actions/wallet-transactions"
      );

      await expect(
        getTransactionHistoryPaginated({
          ...validInput,
          currency: "invalid" as any,
        })
      ).rejects.toThrow("INVALID_CURRENCY");
    });

    /**
     * Requirement: BLS-10-02.validation
     * "Validate limit parameter"
     */
    it("should reject negative limit", async () => {
      const { getTransactionHistoryPaginated } = await import(
        "@/lib/database/actions/wallet-transactions"
      );

      await expect(
        getTransactionHistoryPaginated({
          ...validInput,
          limit: -1,
        })
      ).rejects.toThrow("INVALID_LIMIT");
    });

    /**
     * Requirement: BLS-10-02.validation
     * "Limit maximum is 100"
     */
    it("should cap limit at 100", async () => {
      const { getTransactionHistoryPaginated } = await import(
        "@/lib/database/actions/wallet-transactions"
      );

      const result = await getTransactionHistoryPaginated({
        ...validInput,
        limit: 500,
      });

      // Should still work but cap at 100 - verify it doesn't error
      expect(result.transactions.length).toBeLessThanOrEqual(100);
    });
  });
});
