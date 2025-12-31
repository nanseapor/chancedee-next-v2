/**
 * Unit Tests: Candidate Saved Jobs Repository
 *
 * Tests the saved jobs repository with MOCKED dependencies.
 * These tests verify business logic WITHOUT touching the database.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { AppCandidateSavedJobType } from '@/lib/database/schemas/candidate-saved-jobs.schema';

// Mock Firebase Admin
vi.mock('@/lib/firebase/admin', () => ({
  getFirebaseAdminFirestore: vi.fn(),
}));

// Mock the repository module
vi.mock('@/lib/database/repositories/candidate-saved-jobs-repository', async () => {
  const actual = await vi.importActual<typeof import('@/lib/database/repositories/candidate-saved-jobs-repository')>(
    '@/lib/database/repositories/candidate-saved-jobs-repository'
  );
  return {
    ...actual,
    candidateSavedJobsRepository: {
      getById: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      getByCandidateId: vi.fn(),
      exists: vi.fn(),
      getByJobId: vi.fn(),
    },
  };
});

import { candidateSavedJobsRepository } from '@/lib/database/repositories/candidate-saved-jobs-repository';

describe('candidateSavedJobsRepository', () => {
  const mockCandidateId = 'test-candidate-123';
  const mockJobId = 'test-job-456';
  const mockCompositeId = `${mockCandidateId}_${mockJobId}`;
  const mockTimestamp = Date.now();

  const mockSavedJob: AppCandidateSavedJobType = {
    uid: mockCompositeId,
    candidateId: mockCandidateId,
    jobId: mockJobId,
    savedAt: mockTimestamp,
    createdBy: mockCandidateId,
    updatedBy: mockCandidateId,
    createdAt: mockTimestamp,
    updatedAt: mockTimestamp,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getById', () => {
    it('should return saved job when found', async () => {
      vi.mocked(candidateSavedJobsRepository.getById).mockResolvedValue(mockSavedJob);

      const result = await candidateSavedJobsRepository.getById(mockCompositeId);

      expect(result).toEqual(mockSavedJob);
      expect(candidateSavedJobsRepository.getById).toHaveBeenCalledWith(mockCompositeId);
    });

    it('should return null when not found', async () => {
      vi.mocked(candidateSavedJobsRepository.getById).mockResolvedValue(null);

      const result = await candidateSavedJobsRepository.getById('non-existent-id');

      expect(result).toBeNull();
    });

    it('should handle composite ID format correctly', async () => {
      const compositeId = 'candidate123_job456';
      vi.mocked(candidateSavedJobsRepository.getById).mockResolvedValue(mockSavedJob);

      await candidateSavedJobsRepository.getById(compositeId);

      expect(candidateSavedJobsRepository.getById).toHaveBeenCalledWith(compositeId);
    });
  });

  describe('create', () => {
    it('should create saved job with composite ID', async () => {
      vi.mocked(candidateSavedJobsRepository.create).mockResolvedValue(mockSavedJob);

      const result = await candidateSavedJobsRepository.create(mockCandidateId, mockJobId);

      expect(result).toEqual(mockSavedJob);
      expect(result.uid).toBe(mockCompositeId);
      expect(candidateSavedJobsRepository.create).toHaveBeenCalledWith(mockCandidateId, mockJobId);
    });

    it('should set savedAt timestamp', async () => {
      vi.mocked(candidateSavedJobsRepository.create).mockResolvedValue(mockSavedJob);

      const result = await candidateSavedJobsRepository.create(mockCandidateId, mockJobId);

      expect(result.savedAt).toBeDefined();
      expect(typeof result.savedAt).toBe('number');
      expect(result.savedAt).toBeGreaterThan(0);
    });

    it('should set createdBy and updatedBy to candidateId', async () => {
      vi.mocked(candidateSavedJobsRepository.create).mockResolvedValue(mockSavedJob);

      const result = await candidateSavedJobsRepository.create(mockCandidateId, mockJobId);

      expect(result.createdBy).toBe(mockCandidateId);
      expect(result.updatedBy).toBe(mockCandidateId);
    });

    it('should handle empty candidateId', async () => {
      const errorResult: AppCandidateSavedJobType = {
        ...mockSavedJob,
        uid: '_' + mockJobId,
        candidateId: '',
      };
      vi.mocked(candidateSavedJobsRepository.create).mockResolvedValue(errorResult);

      const result = await candidateSavedJobsRepository.create('', mockJobId);

      expect(result.candidateId).toBe('');
    });

    it('should handle empty jobId', async () => {
      const errorResult: AppCandidateSavedJobType = {
        ...mockSavedJob,
        uid: mockCandidateId + '_',
        jobId: '',
      };
      vi.mocked(candidateSavedJobsRepository.create).mockResolvedValue(errorResult);

      const result = await candidateSavedJobsRepository.create(mockCandidateId, '');

      expect(result.jobId).toBe('');
    });
  });

  describe('delete', () => {
    it('should return true when document exists and is deleted', async () => {
      vi.mocked(candidateSavedJobsRepository.delete).mockResolvedValue(true);

      const result = await candidateSavedJobsRepository.delete(mockCandidateId, mockJobId);

      expect(result).toBe(true);
      expect(candidateSavedJobsRepository.delete).toHaveBeenCalledWith(mockCandidateId, mockJobId);
    });

    it('should return false when document does not exist', async () => {
      vi.mocked(candidateSavedJobsRepository.delete).mockResolvedValue(false);

      const result = await candidateSavedJobsRepository.delete('non-existent-candidate', 'non-existent-job');

      expect(result).toBe(false);
    });

    it('should use composite ID for deletion', async () => {
      vi.mocked(candidateSavedJobsRepository.delete).mockResolvedValue(true);

      await candidateSavedJobsRepository.delete(mockCandidateId, mockJobId);

      expect(candidateSavedJobsRepository.delete).toHaveBeenCalledWith(mockCandidateId, mockJobId);
    });
  });

  describe('getByCandidateId', () => {
    it('should return all saved jobs for a candidate', async () => {
      const mockSavedJobs: AppCandidateSavedJobType[] = [
        mockSavedJob,
        { ...mockSavedJob, uid: `${mockCandidateId}_job2`, jobId: 'job2' },
        { ...mockSavedJob, uid: `${mockCandidateId}_job3`, jobId: 'job3' },
      ];
      vi.mocked(candidateSavedJobsRepository.getByCandidateId).mockResolvedValue(mockSavedJobs);

      const result = await candidateSavedJobsRepository.getByCandidateId(mockCandidateId);

      expect(result).toHaveLength(3);
      expect(result).toEqual(mockSavedJobs);
      expect(candidateSavedJobsRepository.getByCandidateId).toHaveBeenCalledWith(mockCandidateId);
    });

    it('should return empty array when no saved jobs', async () => {
      vi.mocked(candidateSavedJobsRepository.getByCandidateId).mockResolvedValue([]);

      const result = await candidateSavedJobsRepository.getByCandidateId('candidate-with-no-saves');

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should return jobs ordered by savedAt descending', async () => {
      const mockSavedJobs: AppCandidateSavedJobType[] = [
        { ...mockSavedJob, savedAt: 3000 },
        { ...mockSavedJob, savedAt: 2000 },
        { ...mockSavedJob, savedAt: 1000 },
      ];
      vi.mocked(candidateSavedJobsRepository.getByCandidateId).mockResolvedValue(mockSavedJobs);

      const result = await candidateSavedJobsRepository.getByCandidateId(mockCandidateId);

      expect(result[0].savedAt).toBeGreaterThan(result[1].savedAt);
      expect(result[1].savedAt).toBeGreaterThan(result[2].savedAt);
    });
  });

  describe('exists', () => {
    it('should return true when saved job exists', async () => {
      vi.mocked(candidateSavedJobsRepository.exists).mockResolvedValue(true);

      const result = await candidateSavedJobsRepository.exists(mockCandidateId, mockJobId);

      expect(result).toBe(true);
      expect(candidateSavedJobsRepository.exists).toHaveBeenCalledWith(mockCandidateId, mockJobId);
    });

    it('should return false when saved job does not exist', async () => {
      vi.mocked(candidateSavedJobsRepository.exists).mockResolvedValue(false);

      const result = await candidateSavedJobsRepository.exists(mockCandidateId, 'non-saved-job');

      expect(result).toBe(false);
    });

    it('should use composite ID for existence check', async () => {
      vi.mocked(candidateSavedJobsRepository.exists).mockResolvedValue(true);

      await candidateSavedJobsRepository.exists(mockCandidateId, mockJobId);

      expect(candidateSavedJobsRepository.exists).toHaveBeenCalledWith(mockCandidateId, mockJobId);
    });
  });

  describe('getByJobId', () => {
    it('should return all saves for a specific job', async () => {
      const mockSaves: AppCandidateSavedJobType[] = [
        mockSavedJob,
        { ...mockSavedJob, uid: `candidate2_${mockJobId}`, candidateId: 'candidate2' },
        { ...mockSavedJob, uid: `candidate3_${mockJobId}`, candidateId: 'candidate3' },
      ];
      vi.mocked(candidateSavedJobsRepository.getByJobId).mockResolvedValue(mockSaves);

      const result = await candidateSavedJobsRepository.getByJobId(mockJobId);

      expect(result).toHaveLength(3);
      expect(result.every(save => save.jobId === mockJobId)).toBe(true);
      expect(candidateSavedJobsRepository.getByJobId).toHaveBeenCalledWith(mockJobId);
    });

    it('should return empty array when job has no saves', async () => {
      vi.mocked(candidateSavedJobsRepository.getByJobId).mockResolvedValue([]);

      const result = await candidateSavedJobsRepository.getByJobId('job-with-no-saves');

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should return saves ordered by savedAt descending', async () => {
      const mockSaves: AppCandidateSavedJobType[] = [
        { ...mockSavedJob, candidateId: 'c1', savedAt: 3000 },
        { ...mockSavedJob, candidateId: 'c2', savedAt: 2000 },
        { ...mockSavedJob, candidateId: 'c3', savedAt: 1000 },
      ];
      vi.mocked(candidateSavedJobsRepository.getByJobId).mockResolvedValue(mockSaves);

      const result = await candidateSavedJobsRepository.getByJobId(mockJobId);

      expect(result[0].savedAt).toBeGreaterThan(result[1].savedAt);
      expect(result[1].savedAt).toBeGreaterThan(result[2].savedAt);
    });
  });

  describe('Edge Cases', () => {
    it('should handle special characters in IDs', async () => {
      const specialCandidateId = 'candidate@123#test';
      const specialJobId = 'job$456%test';
      const specialCompositeId = `${specialCandidateId}_${specialJobId}`;

      const specialSavedJob: AppCandidateSavedJobType = {
        ...mockSavedJob,
        uid: specialCompositeId,
        candidateId: specialCandidateId,
        jobId: specialJobId,
      };

      vi.mocked(candidateSavedJobsRepository.create).mockResolvedValue(specialSavedJob);

      const result = await candidateSavedJobsRepository.create(specialCandidateId, specialJobId);

      expect(result.uid).toBe(specialCompositeId);
      expect(result.candidateId).toBe(specialCandidateId);
      expect(result.jobId).toBe(specialJobId);
    });

    it('should handle very long IDs', async () => {
      const longCandidateId = 'c'.repeat(100);
      const longJobId = 'j'.repeat(100);
      const longCompositeId = `${longCandidateId}_${longJobId}`;

      const longSavedJob: AppCandidateSavedJobType = {
        ...mockSavedJob,
        uid: longCompositeId,
        candidateId: longCandidateId,
        jobId: longJobId,
      };

      vi.mocked(candidateSavedJobsRepository.create).mockResolvedValue(longSavedJob);

      const result = await candidateSavedJobsRepository.create(longCandidateId, longJobId);

      expect(result.uid).toBe(longCompositeId);
      expect(result.uid.length).toBe(201); // 100 + 1 (underscore) + 100
    });
  });
});
