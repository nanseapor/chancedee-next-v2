/**
 * @fileoverview Tests for editApplication server action
 * @specification BLS-03-02 Application Stage - editApplication
 *
 * Requirements tested:
 * - BLS-03-02.precondition.exists: Application must exist
 * - BLS-03-02.precondition.owner: Application must be owned by candidate
 * - BLS-03-02.precondition.status: Status must be 'applied'
 * - BLS-03-02.precondition.job: Job must still be active
 * - BLS-03-02.input.salary: Salary validation (>= 0, <= 999999)
 * - BLS-03-02.input.headlines: Headlines max 500 chars
 * - BLS-03-02.input.overheadDays: Valid enum values
 * - BLS-03-02.success: Update application fields
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the repositories
const mockGetById = vi.fn();
const mockUpdate = vi.fn();
const mockJobGetById = vi.fn();

vi.mock('@/lib/database/repositories/job-applications-repository', () => ({
  jobApplicationsRepository: {
    getById: () => mockGetById(),
    update: (...args: unknown[]) => mockUpdate(...args),
  },
}));

vi.mock('@/lib/database/repositories/jobs-repository', () => ({
  jobsRepository: {
    getById: () => mockJobGetById(),
  },
}));

// Mock firebase admin
vi.mock('@/lib/firebase/admin', () => ({
  getFirebaseAdminFirestore: () => ({
    collection: () => ({
      doc: () => ({}),
    }),
  }),
}));

describe('editApplication', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const validApplication = {
    uid: 'app-123',
    jobId: 'job-456',
    candidateId: 'candidate-789',
    companyId: 'company-101',
    status: 'applied',
    expectedSalary: 50000,
    isNegotiable: true,
    overheadDays: 7,
    headlines: 'Original message',
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 86400000,
  };

  const activeJob = {
    uid: 'job-456',
    isActive: true,
    title: 'Software Engineer',
  };

  describe('Precondition: Application exists', () => {
    /**
     * Requirement: BLS-03-02.precondition.exists
     * "Application must exist"
     */
    it('should return NOT_FOUND when application does not exist', async () => {
      mockGetById.mockResolvedValue(null);

      const { editApplication } = await import(
        '@/lib/database/actions/job-applications'
      );

      const result = await editApplication(
        {
          applicationId: 'nonexistent-app',
          expectedSalary: 60000,
        },
        'candidate-789'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('NOT_FOUND');
    });
  });

  describe('Precondition: Application ownership', () => {
    /**
     * Requirement: BLS-03-02.precondition.owner
     * "Application must be owned by candidate"
     */
    it('should return NOT_OWNER when candidate does not own application', async () => {
      mockGetById.mockResolvedValue(validApplication);

      const { editApplication } = await import(
        '@/lib/database/actions/job-applications'
      );

      const result = await editApplication(
        {
          applicationId: 'app-123',
          expectedSalary: 60000,
        },
        'different-candidate'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('NOT_OWNER');
    });
  });

  describe('Precondition: Application status', () => {
    /**
     * Requirement: BLS-03-02.precondition.status
     * "Status must be 'applied'"
     */
    it('should return ALREADY_PROCESSED when status is not applied', async () => {
      mockGetById.mockResolvedValue({
        ...validApplication,
        status: 'read',
      });

      const { editApplication } = await import(
        '@/lib/database/actions/job-applications'
      );

      const result = await editApplication(
        {
          applicationId: 'app-123',
          expectedSalary: 60000,
        },
        'candidate-789'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('ALREADY_PROCESSED');
    });

    it('should return ALREADY_PROCESSED for accepted status', async () => {
      mockGetById.mockResolvedValue({
        ...validApplication,
        status: 'accepted',
      });

      const { editApplication } = await import(
        '@/lib/database/actions/job-applications'
      );

      const result = await editApplication(
        {
          applicationId: 'app-123',
          expectedSalary: 60000,
        },
        'candidate-789'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('ALREADY_PROCESSED');
    });

    it('should return ALREADY_PROCESSED for rejected status', async () => {
      mockGetById.mockResolvedValue({
        ...validApplication,
        status: 'rejected',
      });

      const { editApplication } = await import(
        '@/lib/database/actions/job-applications'
      );

      const result = await editApplication(
        {
          applicationId: 'app-123',
          expectedSalary: 60000,
        },
        'candidate-789'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('ALREADY_PROCESSED');
    });
  });

  describe('Precondition: Job active', () => {
    /**
     * Requirement: BLS-03-02.precondition.job
     * "Job must still be active"
     */
    it('should return JOB_INACTIVE when job is no longer active', async () => {
      mockGetById.mockResolvedValue(validApplication);
      mockJobGetById.mockResolvedValue({
        ...activeJob,
        isActive: false,
      });

      const { editApplication } = await import(
        '@/lib/database/actions/job-applications'
      );

      const result = await editApplication(
        {
          applicationId: 'app-123',
          expectedSalary: 60000,
        },
        'candidate-789'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('JOB_INACTIVE');
    });
  });

  describe('Input validation: expectedSalary', () => {
    /**
     * Requirement: BLS-03-02.input.salary
     * "Salary >= 0 and <= 999,999"
     */
    it('should reject negative salary', async () => {
      mockGetById.mockResolvedValue(validApplication);
      mockJobGetById.mockResolvedValue(activeJob);

      const { editApplication } = await import(
        '@/lib/database/actions/job-applications'
      );

      await expect(
        editApplication(
          {
            applicationId: 'app-123',
            expectedSalary: -1000,
          },
          'candidate-789'
        )
      ).rejects.toThrow();
    });

    it('should reject salary exceeding 999,999', async () => {
      mockGetById.mockResolvedValue(validApplication);
      mockJobGetById.mockResolvedValue(activeJob);

      const { editApplication } = await import(
        '@/lib/database/actions/job-applications'
      );

      await expect(
        editApplication(
          {
            applicationId: 'app-123',
            expectedSalary: 1000000,
          },
          'candidate-789'
        )
      ).rejects.toThrow();
    });

    it('should accept valid salary', async () => {
      mockGetById.mockResolvedValue(validApplication);
      mockJobGetById.mockResolvedValue(activeJob);
      mockUpdate.mockResolvedValue(undefined);

      const { editApplication } = await import(
        '@/lib/database/actions/job-applications'
      );

      const result = await editApplication(
        {
          applicationId: 'app-123',
          expectedSalary: 75000,
        },
        'candidate-789'
      );

      expect(result.success).toBe(true);
    });

    it('should accept null salary to clear value', async () => {
      mockGetById.mockResolvedValue(validApplication);
      mockJobGetById.mockResolvedValue(activeJob);
      mockUpdate.mockResolvedValue(undefined);

      const { editApplication } = await import(
        '@/lib/database/actions/job-applications'
      );

      const result = await editApplication(
        {
          applicationId: 'app-123',
          expectedSalary: null,
        },
        'candidate-789'
      );

      expect(result.success).toBe(true);
    });
  });

  describe('Input validation: headlines', () => {
    /**
     * Requirement: BLS-03-02.input.headlines
     * "Headlines max 500 characters"
     */
    it('should reject headlines exceeding 500 characters', async () => {
      mockGetById.mockResolvedValue(validApplication);
      mockJobGetById.mockResolvedValue(activeJob);

      const { editApplication } = await import(
        '@/lib/database/actions/job-applications'
      );

      const longHeadlines = 'x'.repeat(501);

      await expect(
        editApplication(
          {
            applicationId: 'app-123',
            headlines: longHeadlines,
          },
          'candidate-789'
        )
      ).rejects.toThrow();
    });

    it('should accept headlines within limit', async () => {
      mockGetById.mockResolvedValue(validApplication);
      mockJobGetById.mockResolvedValue(activeJob);
      mockUpdate.mockResolvedValue(undefined);

      const { editApplication } = await import(
        '@/lib/database/actions/job-applications'
      );

      const result = await editApplication(
        {
          applicationId: 'app-123',
          headlines: 'Updated cover letter message',
        },
        'candidate-789'
      );

      expect(result.success).toBe(true);
    });
  });

  describe('Input validation: overheadDays', () => {
    /**
     * Requirement: BLS-03-02.input.overheadDays
     * "Valid enum: 0, 7, 15, 30, 60, 90"
     */
    it('should reject invalid overheadDays value', async () => {
      mockGetById.mockResolvedValue(validApplication);
      mockJobGetById.mockResolvedValue(activeJob);

      const { editApplication } = await import(
        '@/lib/database/actions/job-applications'
      );

      await expect(
        editApplication(
          {
            applicationId: 'app-123',
            overheadDays: 45 as any, // Invalid value
          },
          'candidate-789'
        )
      ).rejects.toThrow();
    });

    it('should accept valid overheadDays values', async () => {
      mockGetById.mockResolvedValue(validApplication);
      mockJobGetById.mockResolvedValue(activeJob);
      mockUpdate.mockResolvedValue(undefined);

      const { editApplication } = await import(
        '@/lib/database/actions/job-applications'
      );

      for (const days of [0, 7, 15, 30, 60, 90]) {
        vi.clearAllMocks();
        mockGetById.mockResolvedValue(validApplication);
        mockJobGetById.mockResolvedValue(activeJob);
        mockUpdate.mockResolvedValue(undefined);

        const result = await editApplication(
          {
            applicationId: 'app-123',
            overheadDays: days as 0 | 7 | 15 | 30 | 60 | 90,
          },
          'candidate-789'
        );

        expect(result.success).toBe(true);
      }
    });
  });

  describe('Success case', () => {
    /**
     * Requirement: BLS-03-02.success
     * "Update application fields"
     */
    it('should update application with new values', async () => {
      mockGetById.mockResolvedValue(validApplication);
      mockJobGetById.mockResolvedValue(activeJob);
      mockUpdate.mockResolvedValue(undefined);

      const { editApplication } = await import(
        '@/lib/database/actions/job-applications'
      );

      const result = await editApplication(
        {
          applicationId: 'app-123',
          expectedSalary: 80000,
          isNegotiable: false,
          overheadDays: 30,
          headlines: 'Updated message',
        },
        'candidate-789'
      );

      expect(result.success).toBe(true);
      expect(mockUpdate).toHaveBeenCalled();
    });

    it('should return cache invalidation keys', async () => {
      mockGetById.mockResolvedValue(validApplication);
      mockJobGetById.mockResolvedValue(activeJob);
      mockUpdate.mockResolvedValue(undefined);

      const { editApplication } = await import(
        '@/lib/database/actions/job-applications'
      );

      const result = await editApplication(
        {
          applicationId: 'app-123',
          expectedSalary: 80000,
        },
        'candidate-789'
      );

      expect(result.success).toBe(true);
      expect(result.keysToInvalidate).toContain('candidate-applications-candidate-789');
    });

    it('should preserve unchanged fields', async () => {
      mockGetById.mockResolvedValue(validApplication);
      mockJobGetById.mockResolvedValue(activeJob);
      mockUpdate.mockResolvedValue(undefined);

      const { editApplication } = await import(
        '@/lib/database/actions/job-applications'
      );

      // Only update salary, leave other fields unchanged
      await editApplication(
        {
          applicationId: 'app-123',
          expectedSalary: 80000,
        },
        'candidate-789'
      );

      // Check that update was called with merged data
      expect(mockUpdate).toHaveBeenCalledWith(
        'app-123',
        expect.objectContaining({
          expectedSalary: 80000,
          // Original values should be preserved
          isNegotiable: true,
          overheadDays: 7,
          headlines: 'Original message',
        }),
        'candidate-789'
      );
    });
  });

  describe('Error handling', () => {
    it('should return NETWORK_ERROR on database failure', async () => {
      mockGetById.mockRejectedValue(new Error('Database error'));

      const { editApplication } = await import(
        '@/lib/database/actions/job-applications'
      );

      const result = await editApplication(
        {
          applicationId: 'app-123',
          expectedSalary: 60000,
        },
        'candidate-789'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('NETWORK_ERROR');
    });
  });
});
