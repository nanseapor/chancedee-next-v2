/**
 * @fileoverview Tests for awardSignupBonus server action
 * @specification BLS-10-03 Wallet Stage - awardSignupBonus
 *
 * Requirements tested:
 * - BLS-10-03.precondition.unique: No existing signup bonus transaction
 * - BLS-10-03.success: Create/update pocket + create transaction
 * - BLS-10-03.idempotent: Skip if already awarded
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Firestore operations
const mockGet = vi.fn();
const mockSet = vi.fn();
const mockUpdate = vi.fn();
const mockRunTransaction = vi.fn();
const mockQueryGet = vi.fn();

const mockCollection = vi.fn((name: string) => ({
  doc: (id?: string) => ({
    get: mockGet,
    set: mockSet,
    update: mockUpdate,
    id: id || 'mock-doc-id',
  }),
  where: vi.fn().mockReturnThis(),
  get: mockQueryGet,
}));

vi.mock('@/lib/firebase/admin', () => ({
  getFirebaseAdminFirestore: () => ({
    collection: mockCollection,
    runTransaction: mockRunTransaction,
  }),
}));

describe('awardSignupBonus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock implementations
    mockQueryGet.mockResolvedValue({ empty: true, docs: [] });
    mockGet.mockResolvedValue({ exists: false });
    mockRunTransaction.mockImplementation(async (callback) => {
      const mockT = {
        get: vi.fn().mockResolvedValue({ exists: false }),
        set: vi.fn(),
        update: vi.fn(),
      };
      return callback(mockT);
    });
  });

  describe('Input validation', () => {
    it('should return error for empty userId', async () => {
      const { awardSignupBonus } = await import(
        '@/lib/database/actions/wallet-rewards'
      );

      const result = await awardSignupBonus('');

      expect(result.success).toBe(false);
      expect(result.error).toBe('INVALID_USER_ID');
    });

    it('should return error for whitespace-only userId', async () => {
      const { awardSignupBonus } = await import(
        '@/lib/database/actions/wallet-rewards'
      );

      const result = await awardSignupBonus('   ');

      expect(result.success).toBe(false);
      expect(result.error).toBe('INVALID_USER_ID');
    });
  });

  describe('Idempotency: No duplicate rewards', () => {
    /**
     * Requirement: BLS-10-03.idempotent
     * "Skip if already awarded"
     */
    it('should return alreadyAwarded=true if signup bonus exists', async () => {
      // Mock that a signup transaction already exists
      mockQueryGet.mockResolvedValue({
        empty: false,
        docs: [{ id: 'existing-tx-123' }],
      });

      const { awardSignupBonus } = await import(
        '@/lib/database/actions/wallet-rewards'
      );

      const result = await awardSignupBonus('user-123');

      expect(result.success).toBe(true);
      expect(result.alreadyAwarded).toBe(true);
      // Should not run transaction
      expect(mockRunTransaction).not.toHaveBeenCalled();
    });
  });

  describe('Success case: Award bonus', () => {
    /**
     * Requirement: BLS-10-03.success
     * "Award 100 coins to new user"
     */
    it('should successfully award signup bonus for new user', async () => {
      // Mock no existing transaction
      mockQueryGet.mockResolvedValue({ empty: true, docs: [] });
      // Mock no existing pocket
      mockGet.mockResolvedValue({ exists: false });

      const { awardSignupBonus } = await import(
        '@/lib/database/actions/wallet-rewards'
      );

      const result = await awardSignupBonus('user-456');

      expect(result.success).toBe(true);
      expect(result.alreadyAwarded).toBeFalsy();
      expect(mockRunTransaction).toHaveBeenCalled();
    });

    it('should run transaction to update balance atomically', async () => {
      mockQueryGet.mockResolvedValue({ empty: true, docs: [] });

      const { awardSignupBonus } = await import(
        '@/lib/database/actions/wallet-rewards'
      );

      await awardSignupBonus('user-789');

      expect(mockRunTransaction).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error handling', () => {
    it('should return NETWORK_ERROR on database failure', async () => {
      mockQueryGet.mockResolvedValue({ empty: true, docs: [] });
      mockRunTransaction.mockRejectedValue(new Error('Database error'));

      const { awardSignupBonus } = await import(
        '@/lib/database/actions/wallet-rewards'
      );

      const result = await awardSignupBonus('user-error');

      expect(result.success).toBe(false);
      expect(result.error).toBe('NETWORK_ERROR');
    });
  });
});
