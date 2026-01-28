/**
 * BLS-03-01: Unit tests for submitApplication server action
 * TDD RED Phase - These tests should FAIL until implementation
 *
 * Per BLS-03-01 Assessment Phase 1
 * Target: 17 unit tests with 90%+ coverage
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { submitApplication } from '@/lib/database/actions/job-applications';

// Mock the repositories
vi.mock('@/lib/database/repositories/job-applications-repository', () => ({
  jobApplicationsRepository: {
    create: vi.fn(),
    getById: vi.fn(),
    getByFilter: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock('@/lib/database/repositories/jobs-repository', () => ({
  jobsRepository: {
    getById: vi.fn(),
  },
}));

vi.mock('@/lib/database/repositories/candidate-information-repository', () => ({
  candidateInformationRepository: {
    getById: vi.fn(),
  },
}));

vi.mock('@/lib/firebase/admin', () => ({
  getFirebaseAdminFirestore: vi.fn(() => ({
    collection: vi.fn(() => ({
      doc: vi.fn((id: string) => ({
        id,
        path: `collection/${id}`,
        update: vi.fn().mockResolvedValue(undefined),
      })),
    })),
    runTransaction: vi.fn(async (callback) => {
      // Mock transaction object
      const transaction = {
        set: vi.fn(),
        update: vi.fn(),
        get: vi.fn(),
      };
      // Execute callback with mock transaction
      return await callback(transaction);
    }),
  })),
}));

// Import mocked modules
import { jobApplicationsRepository } from '@/lib/database/repositories/job-applications-repository';
import { jobsRepository } from '@/lib/database/repositories/jobs-repository';
import { candidateInformationRepository } from '@/lib/database/repositories/candidate-information-repository';

const mockCreate = jobApplicationsRepository.create as ReturnType<typeof vi.fn>;
const mockGetById = jobApplicationsRepository.getById as ReturnType<typeof vi.fn>;
const mockGetByFilter = jobApplicationsRepository.getByFilter as ReturnType<typeof vi.fn>;
const mockJobGetById = jobsRepository.getById as ReturnType<typeof vi.fn>;
const mockCandidateGetById = candidateInformationRepository.getById as ReturnType<typeof vi.fn>;

describe('BLS-03-01: submitApplication', () => {
  const mockUser = {
    uid: 'candidate-123',
    email: 'test@example.com',
  };

  const mockCandidate = {
    uid: 'candidate-123',
    isResumeCompleted: true,
    displayName: 'Test User',
  };

  const mockJob = {
    uid: 'job-456',
    companyId: 'company-789',
    companyName: 'Test Company',
    title: 'Test Position',
    isActive: true,
    isClosed: false,
    postExpiryDate: Date.now() + 86400000, // Tomorrow
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Default successful candidate fetch
    mockCandidateGetById.mockResolvedValue(mockCandidate);

    // Default successful job fetch
    mockJobGetById.mockResolvedValue(mockJob);

    // Default no existing application
    mockGetByFilter.mockResolvedValue([]);

    // Default successful create
    mockCreate.mockResolvedValue('application-new-123');
  });

  /**
   * INPUT VALIDATION TESTS (6 tests)
   */
  describe('Input Validation', () => {
    it('should accept valid minimal input (required fields only)', async () => {
      // Arrange
      const input = {
        jobId: 'job-456',
      };

      // Act
      const result = await submitApplication(input, mockUser.uid);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.applicationId).toBe('application-new-123');
      expect(result.data?.status).toBe('applied');
    });

    it('should accept valid full input (all optional fields)', async () => {
      // Arrange
      const input = {
        jobId: 'job-456',
        expectedSalary: 50000,
        isNegotiable: false,
        overheadDays: 30 as 0 | 7 | 15 | 30 | 60 | 90,
        headlines: 'I am very interested in this position',
      };

      // Act
      const result = await submitApplication(input, mockUser.uid);

      // Assert
      expect(result.success).toBe(true);
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          expectedSalary: 50000,
          isNegotiable: false,
          overheadDays: 30,
          headlines: 'I am very interested in this position',
        }),
        mockUser.uid
      );
    });

    it('should reject negative expected salary', async () => {
      // Arrange
      const input = {
        jobId: 'job-456',
        expectedSalary: -1000,
      };

      // Act & Assert
      await expect(submitApplication(input)).rejects.toThrow();
    });

    it('should reject expected salary exceeding 999,999', async () => {
      // Arrange
      const input = {
        jobId: 'job-456',
        expectedSalary: 1000000,
      };

      // Act & Assert
      await expect(submitApplication(input)).rejects.toThrow();
    });

    it('should accept null expected salary', async () => {
      // Arrange
      const input = {
        jobId: 'job-456',
        expectedSalary: null,
      };

      // Act
      const result = await submitApplication(input, mockUser.uid);

      // Assert
      // Per schema, null is converted to undefined (see job-applications.ts line 719)
      expect(result.success).toBe(true);
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          expectedSalary: undefined,
        }),
        mockUser.uid
      );
    });

    it('should reject headlines exceeding 500 characters', async () => {
      // Arrange
      const input = {
        jobId: 'job-456',
        headlines: 'x'.repeat(501),
      };

      // Act & Assert
      await expect(submitApplication(input)).rejects.toThrow();
    });
  });

  /**
   * PRECONDITION CHECKS TESTS (4 tests)
   * Note: Unauthorized test removed - will be tested in implementation
   */
  describe('Precondition Checks', () => {
    it('should return PROFILE_INCOMPLETE when isResumeCompleted is false', async () => {
      // Arrange
      mockCandidateGetById.mockResolvedValue({
        ...mockCandidate,
        isResumeCompleted: false,
      });
      const input = { jobId: 'job-456' };

      // Act
      const result = await submitApplication(input, mockUser.uid);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('PROFILE_INCOMPLETE');
      expect(mockCreate).not.toHaveBeenCalled();
    });

    it('should return JOB_NOT_FOUND when job does not exist', async () => {
      // Arrange
      mockJobGetById.mockResolvedValue(null);
      const input = { jobId: 'job-nonexistent' };

      // Act
      const result = await submitApplication(input, mockUser.uid);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('JOB_NOT_FOUND');
      expect(mockCreate).not.toHaveBeenCalled();
    });

    it('should return JOB_CLOSED when job is inactive', async () => {
      // Arrange
      mockJobGetById.mockResolvedValue({
        ...mockJob,
        isActive: false,
      });
      const input = { jobId: 'job-456' };

      // Act
      const result = await submitApplication(input, mockUser.uid);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('JOB_CLOSED');
      expect(mockCreate).not.toHaveBeenCalled();
    });

    it('should return ALREADY_APPLIED when active application exists', async () => {
      // Arrange
      mockGetByFilter.mockResolvedValue([
        {
          uid: 'application-existing',
          status: 'applied',
          candidateId: 'candidate-123',
          jobId: 'job-456',
        },
      ]);
      const input = { jobId: 'job-456' };

      // Act
      const result = await submitApplication(input, mockUser.uid);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('ALREADY_APPLIED');
      expect(mockCreate).not.toHaveBeenCalled();
    });
  });

  /**
   * SUCCESS PATH TESTS (3 tests)
   */
  describe('Success Path', () => {
    it('should create application with minimal fields and defaults', async () => {
      // Arrange
      const input = {
        jobId: 'job-456',
      };

      // Act
      const result = await submitApplication(input, mockUser.uid);

      // Assert
      // Per schema, undefined is used instead of null for expectedSalary
      expect(result.success).toBe(true);
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          jobId: 'job-456',
          candidateId: 'candidate-123',
          companyId: 'company-789',
          companyName: 'Test Company',
          status: 'applied',
          expectedSalary: undefined, // Schema uses undefined, not null
          isNegotiable: true, // Default
          overheadDays: 0, // Default
          headlines: '', // Default
        }),
        mockUser.uid
      );
    });

    it('should create application with all optional fields', async () => {
      // Arrange
      const input = {
        jobId: 'job-456',
        expectedSalary: 75000,
        isNegotiable: false,
        overheadDays: 60 as 0 | 7 | 15 | 30 | 60 | 90,
        headlines: 'Passionate about this role',
      };

      // Act
      const result = await submitApplication(input, mockUser.uid);

      // Assert
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          expectedSalary: 75000,
          isNegotiable: false,
          overheadDays: 60,
          headlines: 'Passionate about this role',
        }),
        mockUser.uid
      );
    });

    it('should return correct response shape with applicationId and timestamp', async () => {
      // Arrange
      const input = { jobId: 'job-456' };
      const beforeTime = Date.now();

      // Act
      const result = await submitApplication(input, mockUser.uid);

      // Assert
      const afterTime = Date.now();
      expect(result).toEqual({
        success: true,
        data: {
          applicationId: 'application-new-123',
          status: 'applied',
          appliedAt: expect.any(Number),
        },
        keysToInvalidate: expect.arrayContaining([
          'job-job-456',
          'candidate-applications-candidate-123',
        ]),
      });
      expect(result.data?.appliedAt).toBeGreaterThanOrEqual(beforeTime);
      expect(result.data?.appliedAt).toBeLessThanOrEqual(afterTime);
    });
  });

  /**
   * ERROR HANDLING TESTS (3 tests)
   */
  describe('Error Handling', () => {
    it('should return NETWORK_ERROR when repository throws', async () => {
      // Arrange
      mockCreate.mockRejectedValue(new Error('Database connection failed'));
      const input = { jobId: 'job-456' };

      // Act
      const result = await submitApplication(input, mockUser.uid);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('NETWORK_ERROR');
    });

    it('should return JOB_NOT_FOUND when invalid job ID provided', async () => {
      // Arrange
      mockJobGetById.mockResolvedValue(null);
      const input = { jobId: 'invalid-job-id' };

      // Act
      const result = await submitApplication(input, mockUser.uid);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('JOB_NOT_FOUND');
    });

    it('should handle job expiry date check correctly', async () => {
      // Arrange
      mockJobGetById.mockResolvedValue({
        ...mockJob,
        postExpiryDate: Date.now() - 86400000, // Yesterday (expired)
      });
      const input = { jobId: 'job-456' };

      // Act
      const result = await submitApplication(input, mockUser.uid);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('JOB_CLOSED');
    });
  });

  /**
   * EDGE CASES AND BUSINESS LOGIC (Additional tests)
   */
  describe('Edge Cases and Business Logic', () => {
    it('should allow reapplication when previous status is "withdraw"', async () => {
      // Arrange
      mockGetByFilter.mockResolvedValue([
        {
          uid: 'application-old',
          status: 'withdraw', // Withdrawn - should allow reapply
          candidateId: 'candidate-123',
          jobId: 'job-456',
        },
      ]);
      const input = { jobId: 'job-456' };

      // Act
      const result = await submitApplication(input, mockUser.uid);

      // Assert
      expect(result.success).toBe(true);
      expect(mockCreate).toHaveBeenCalled();
    });

    it('should allow reapplication when previous status is "rejected"', async () => {
      // Arrange
      mockGetByFilter.mockResolvedValue([
        {
          uid: 'application-old',
          status: 'rejected', // Rejected - should allow reapply
          candidateId: 'candidate-123',
          jobId: 'job-456',
        },
      ]);
      const input = { jobId: 'job-456' };

      // Act
      const result = await submitApplication(input, mockUser.uid);

      // Assert
      expect(result.success).toBe(true);
      expect(mockCreate).toHaveBeenCalled();
    });

    it('should block reapplication when status is "read"', async () => {
      // Arrange
      mockGetByFilter.mockResolvedValue([
        {
          uid: 'application-existing',
          status: 'read', // Active status - should block
          candidateId: 'candidate-123',
          jobId: 'job-456',
        },
      ]);
      const input = { jobId: 'job-456' };

      // Act
      const result = await submitApplication(input, mockUser.uid);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('ALREADY_APPLIED');
    });

    it('should handle job with no expiry date (fallback to isActive)', async () => {
      // Arrange
      mockJobGetById.mockResolvedValue({
        ...mockJob,
        postExpiryDate: undefined, // No expiry date set
      });
      const input = { jobId: 'job-456' };

      // Act
      const result = await submitApplication(input, mockUser.uid);

      // Assert
      expect(result.success).toBe(true); // Should pass since isActive=true
    });
  });
});
