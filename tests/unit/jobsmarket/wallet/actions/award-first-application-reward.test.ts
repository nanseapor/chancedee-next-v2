/**
 * @fileoverview Tests for awardFirstApplicationReward server action
 * @specification BLS-10-05 Wallet Stage - awardMilestoneReward (First Application)
 *
 * Requirements tested:
 * - BLS-10-05.precondition.exists: Candidate must exist
 * - BLS-10-05.precondition.flag: Check isFirstApplicantionRewarded flag
 * - BLS-10-05.success: Award bonus and set flag
 * - BLS-10-05.idempotent: Skip if already rewarded
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Firestore operations
const mockGet = vi.fn();
const mockSet = vi.fn();
const mockUpdate = vi.fn();
const mockRunTransaction = vi.fn();

const mockCollection = vi.fn((name: string) => ({
  doc: (id?: string) => ({
    get: mockGet,
    set: mockSet,
    update: mockUpdate,
    id: id || 'mock-doc-id',
  }),
  where: vi.fn().mockReturnThis(),
  get: vi.fn().mockResolvedValue({ empty: true, docs: [] }),
}));

vi.mock('@/lib/firebase/admin', () => ({
  getFirebaseAdminFirestore: () => ({
    collection: mockCollection,
    runTransaction: mockRunTransaction,
  }),
}));

describe('awardFirstApplicationReward', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock implementations
    mockGet.mockResolvedValue({
      exists: true,
      data: () => ({ isFirstApplicantionRewarded: false }),
    });
    mockRunTransaction.mockImplementation(async (callback) => {
      const mockT = {
        get: vi.fn().mockResolvedValue({
          exists: true,
          data: () => ({ isFirstApplicantionRewarded: false, balance: 100 }),
        }),
        set: vi.fn(),
        update: vi.fn(),
      };
      return callback(mockT);
    });
  });

  describe('Input validation', () => {
    it('should return error for empty candidateId', async () => {
      const { awardFirstApplicationReward } = await import(
        '@/lib/database/actions/wallet-rewards'
      );

      const result = await awardFirstApplicationReward('');

      expect(result.success).toBe(false);
      expect(result.error).toBe('INVALID_USER_ID');
    });

    it('should return error for whitespace-only candidateId', async () => {
      const { awardFirstApplicationReward } = await import(
        '@/lib/database/actions/wallet-rewards'
      );

      const result = await awardFirstApplicationReward('   ');

      expect(result.success).toBe(false);
      expect(result.error).toBe('INVALID_USER_ID');
    });
  });

  describe('Precondition: Candidate exists', () => {
    /**
     * Requirement: BLS-10-05.precondition.exists
     * "Candidate must exist"
     */
    it('should return USER_NOT_FOUND if candidate does not exist', async () => {
      mockGet.mockResolvedValue({ exists: false });

      const { awardFirstApplicationReward } = await import(
        '@/lib/database/actions/wallet-rewards'
      );

      const result = await awardFirstApplicationReward('nonexistent-candidate');

      expect(result.success).toBe(false);
      expect(result.error).toBe('USER_NOT_FOUND');
    });
  });

  describe('Idempotency: No duplicate rewards', () => {
    /**
     * Requirement: BLS-10-05.idempotent
     * "Skip if already rewarded"
     */
    it('should return alreadyAwarded=true if flag is already set', async () => {
      mockGet.mockResolvedValue({
        exists: true,
        data: () => ({ isFirstApplicantionRewarded: true }),
      });

      const { awardFirstApplicationReward } = await import(
        '@/lib/database/actions/wallet-rewards'
      );

      const result = await awardFirstApplicationReward('candidate-already-rewarded');

      expect(result.success).toBe(true);
      expect(result.alreadyAwarded).toBe(true);
      expect(mockRunTransaction).not.toHaveBeenCalled();
    });
  });

  describe('Success case: Award first application bonus', () => {
    /**
     * Requirement: BLS-10-05.success
     * "Award 100 coins and set flag"
     */
    it('should successfully award first application bonus', async () => {
      // Mock candidate exists with flag false
      mockGet.mockResolvedValue({
        exists: true,
        data: () => ({ isFirstApplicantionRewarded: false }),
      });

      const { awardFirstApplicationReward } = await import(
        '@/lib/database/actions/wallet-rewards'
      );

      const result = await awardFirstApplicationReward('candidate-123');

      expect(result.success).toBe(true);
      expect(result.alreadyAwarded).toBeFalsy();
      expect(mockRunTransaction).toHaveBeenCalled();
    });

    it('should run transaction to update balance and flag atomically', async () => {
      mockGet.mockResolvedValue({
        exists: true,
        data: () => ({ isFirstApplicantionRewarded: false }),
      });

      const { awardFirstApplicationReward } = await import(
        '@/lib/database/actions/wallet-rewards'
      );

      await awardFirstApplicationReward('candidate-456');

      expect(mockRunTransaction).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error handling', () => {
    it('should return NETWORK_ERROR on database failure', async () => {
      mockGet.mockResolvedValue({
        exists: true,
        data: () => ({ isFirstApplicantionRewarded: false }),
      });
      mockRunTransaction.mockRejectedValue(new Error('Database error'));

      const { awardFirstApplicationReward } = await import(
        '@/lib/database/actions/wallet-rewards'
      );

      const result = await awardFirstApplicationReward('candidate-error');

      expect(result.success).toBe(false);
      expect(result.error).toBe('NETWORK_ERROR');
    });
  });
});
