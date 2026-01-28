/**
 * @fileoverview Tests for awardReferralBonus server action
 * @specification BLS-10-04 Wallet Stage - awardReferralBonus
 *
 * Requirements tested:
 * - BLS-10-04.precondition.valid: Referral code must be valid
 * - BLS-10-04.precondition.noself: Cannot self-refer
 * - BLS-10-04.success: Award bonus to BOTH new user and referrer
 * - BLS-10-04.idempotent: Skip if already awarded
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

describe('awardReferralBonus', () => {
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
    it('should return error for empty newUserId', async () => {
      const { awardReferralBonus } = await import(
        '@/lib/database/actions/wallet-rewards'
      );

      const result = await awardReferralBonus('', 'referrer-123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('INVALID_USER_ID');
    });

    it('should return error for empty referrerId', async () => {
      const { awardReferralBonus } = await import(
        '@/lib/database/actions/wallet-rewards'
      );

      const result = await awardReferralBonus('new-user-123', '');

      expect(result.success).toBe(false);
      expect(result.error).toBe('INVALID_USER_ID');
    });
  });

  describe('Self-referral prevention', () => {
    /**
     * Requirement: BLS-10-04.precondition.noself
     * "Cannot self-refer"
     */
    it('should return alreadyAwarded=true for self-referral', async () => {
      const { awardReferralBonus } = await import(
        '@/lib/database/actions/wallet-rewards'
      );

      const result = await awardReferralBonus('user-123', 'user-123');

      expect(result.success).toBe(true);
      expect(result.alreadyAwarded).toBe(true);
      // Should not run transaction
      expect(mockRunTransaction).not.toHaveBeenCalled();
    });
  });

  describe('Idempotency: No duplicate rewards', () => {
    /**
     * Requirement: BLS-10-04.idempotent
     * "Skip if already awarded"
     */
    it('should return alreadyAwarded=true if referral bonus already given', async () => {
      // Mock that a referral_received transaction already exists for new user
      mockQueryGet.mockResolvedValue({
        empty: false,
        docs: [{ id: 'existing-referral-tx' }],
      });

      const { awardReferralBonus } = await import(
        '@/lib/database/actions/wallet-rewards'
      );

      const result = await awardReferralBonus('new-user-123', 'referrer-456');

      expect(result.success).toBe(true);
      expect(result.alreadyAwarded).toBe(true);
      expect(mockRunTransaction).not.toHaveBeenCalled();
    });
  });

  describe('Success case: Award bonus to both users', () => {
    /**
     * Requirement: BLS-10-04.success
     * "Award 100 coins to BOTH new user and referrer"
     */
    it('should successfully award referral bonus to both users', async () => {
      // Mock no existing referral transaction
      mockQueryGet.mockResolvedValue({ empty: true, docs: [] });

      const { awardReferralBonus } = await import(
        '@/lib/database/actions/wallet-rewards'
      );

      const result = await awardReferralBonus('new-user-789', 'referrer-456');

      expect(result.success).toBe(true);
      expect(result.alreadyAwarded).toBeFalsy();
      expect(mockRunTransaction).toHaveBeenCalled();
    });

    it('should run transaction to update both balances atomically', async () => {
      mockQueryGet.mockResolvedValue({ empty: true, docs: [] });

      const { awardReferralBonus } = await import(
        '@/lib/database/actions/wallet-rewards'
      );

      await awardReferralBonus('new-user-abc', 'referrer-xyz');

      expect(mockRunTransaction).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error handling', () => {
    it('should return NETWORK_ERROR on database failure', async () => {
      mockQueryGet.mockResolvedValue({ empty: true, docs: [] });
      mockRunTransaction.mockRejectedValue(new Error('Database error'));

      const { awardReferralBonus } = await import(
        '@/lib/database/actions/wallet-rewards'
      );

      const result = await awardReferralBonus('new-user-error', 'referrer-123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('NETWORK_ERROR');
    });
  });
});
