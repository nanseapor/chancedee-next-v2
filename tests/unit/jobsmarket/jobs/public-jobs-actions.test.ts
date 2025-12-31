/**
 * Unit Tests: Public Jobs Server Actions
 *
 * Tests public job actions with MOCKED dependencies.
 * These tests verify business logic WITHOUT touching the database or MeiliSearch.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { JobSearchParams, JobSearchResponse, SaveJobParams, SaveJobResult, JobDetailData, JobCardData, SavedJobItem } from '@/types/public-jobs';

// Mock all dependencies
vi.mock('@/lib/meilisearch/job-search', () => ({
  searchJobsWithFilters: vi.fn(),
}));

vi.mock('@/lib/database/repositories/jobs-repository', () => ({
  jobsRepository: {
    getById: vi.fn(),
    getByFilter: vi.fn(),
  },
}));

vi.mock('@/lib/database/repositories/candidate-saved-jobs-repository', () => ({
  candidateSavedJobsRepository: {
    create: vi.fn(),
    delete: vi.fn(),
    exists: vi.fn(),
    getByCandidateId: vi.fn(),
  },
}));

vi.mock('@/lib/database/repositories/job-applications-repository', () => ({
  jobApplicationsRepository: {
    getByFilter: vi.fn(),
  },
}));

// Mock Firebase Admin Auth (for session validation)
vi.mock('firebase-admin/auth', () => ({
  getAuth: vi.fn(() => ({
    verifyIdToken: vi.fn(),
  })),
}));

// Import mocked modules AFTER vi.mock()
import { searchJobsWithFilters } from '@/lib/meilisearch/job-search';
import { jobsRepository } from '@/lib/database/repositories/jobs-repository';
import { candidateSavedJobsRepository } from '@/lib/database/repositories/candidate-saved-jobs-repository';
import { jobApplicationsRepository } from '@/lib/database/repositories/job-applications-repository';

// Import the module we'll create
// Note: This will fail initially (RED phase) because the module doesn't exist yet
// We'll implement it after writing these tests
import {
  searchPublicJobs,
  getPublicJobById,
  getSimilarJobs,
  saveJob,
  unsaveJob,
  getSavedJobs,
} from '@/domains/jobs/services/server/actions/jobsmarket/public-jobs';

describe('searchPublicJobs', () => {
  const mockSearchParams: JobSearchParams = {
    q: 'developer',
    locations: ['bangkok'],
    types: ['fulltime'],
    page: 1,
    pageSize: 20,
  };

  const mockJobCard: JobCardData = {
    uid: 'job-123',
    title: 'Software Developer',
    companyId: 'company-456',
    companyName: 'Tech Corp',
    companyLogo: 'https://example.com/logo.png',
    minSalary: 30000,
    maxSalary: 50000,
    isNegotiable: false,
    workLocationText: 'Bangkok',
    employmentText: 'Full-time',
    experienceText: '1-3 years',
    createdAt: Date.now(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Happy Path', () => {
    it('should return MeiliSearch results on success', async () => {
      const mockMeiliResponse = {
        jobs: [mockJobCard],
        totalCount: 1,
        totalPages: 1,
        currentPage: 1,
        processingTime: 50,
      };

      vi.mocked(searchJobsWithFilters).mockResolvedValue(mockMeiliResponse);

      const result = await searchPublicJobs(mockSearchParams);

      expect(result.success).toBe(true);
      expect(result.data?.jobs).toEqual([mockJobCard]);
      expect(result.data?.isFallback).toBe(false);
      expect(result.error).toBeUndefined();
    });

    it('should handle empty results', async () => {
      const mockEmptyResponse = {
        jobs: [],
        totalCount: 0,
        totalPages: 0,
        currentPage: 1,
        processingTime: 30,
      };

      vi.mocked(searchJobsWithFilters).mockResolvedValue(mockEmptyResponse);

      const result = await searchPublicJobs(mockSearchParams);

      expect(result.success).toBe(true);
      expect(result.data?.jobs).toEqual([]);
      expect(result.data?.totalCount).toBe(0);
    });

    it('should handle search without query (browse)', async () => {
      const browseParams: JobSearchParams = {
        page: 1,
        pageSize: 20,
      };

      const mockResponse = {
        jobs: [mockJobCard],
        totalCount: 100,
        totalPages: 5,
        currentPage: 1,
        processingTime: 45,
      };

      vi.mocked(searchJobsWithFilters).mockResolvedValue(mockResponse);

      const result = await searchPublicJobs(browseParams);

      expect(result.success).toBe(true);
      expect(result.data?.jobs).toHaveLength(1);
    });
  });

  describe('Timeout and Fallback', () => {
    it('should fall back to Firestore on MeiliSearch timeout', async () => {
      vi.mocked(searchJobsWithFilters).mockRejectedValue(new Error('MeiliSearch timeout'));

      // Mock Firestore fallback (will be implemented in the actual function)
      vi.mocked(jobsRepository.getByFilter).mockResolvedValue([
        {
          uid: mockJobCard.uid,
          title: mockJobCard.title,
          companyId: mockJobCard.companyId,
          companyName: mockJobCard.companyName,
          companyLogo: mockJobCard.companyLogo,
          minSalary: mockJobCard.minSalary,
          maxSalary: mockJobCard.maxSalary,
          isNegotiable: mockJobCard.isNegotiable,
          workLocationText: mockJobCard.workLocationText,
          employmentText: mockJobCard.employmentText,
          experienceText: mockJobCard.experienceText,
          createdAt: mockJobCard.createdAt,
          isActive: true,
          jobStatus: 'published',
          province: 'bangkok',
          employment: 'fulltime',
        } as any,
      ]);

      const result = await searchPublicJobs(mockSearchParams);

      expect(result.success).toBe(true);
      expect(result.data?.isFallback).toBe(true);
      expect(result.data?.jobs).toHaveLength(1);
    });

    it('should return error when both MeiliSearch and Firestore fail', async () => {
      vi.mocked(searchJobsWithFilters).mockRejectedValue(new Error('MeiliSearch timeout'));
      vi.mocked(jobsRepository.getByFilter).mockRejectedValue(new Error('Firestore error'));

      const result = await searchPublicJobs(mockSearchParams);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.data).toBeUndefined();
    });
  });

  describe('Filter Application', () => {
    it('should apply all filters correctly', async () => {
      const complexParams: JobSearchParams = {
        q: 'engineer',
        locations: ['bangkok', 'chiang-mai'],
        types: ['fulltime', 'parttime'],
        salaryMin: 30000,
        salaryMax: 80000,
        education: ['bachelor', 'master'],
        experience: '1-3',
        remote: 'hybrid',
        sort: 'salary_desc',
        page: 2,
        pageSize: 10,
      };

      const mockResponse = {
        jobs: [mockJobCard],
        totalCount: 50,
        totalPages: 5,
        currentPage: 2,
        processingTime: 75,
      };

      vi.mocked(searchJobsWithFilters).mockResolvedValue(mockResponse);

      const result = await searchPublicJobs(complexParams);

      expect(result.success).toBe(true);
      expect(searchJobsWithFilters).toHaveBeenCalledWith(complexParams);
    });

    it('should handle pagination correctly', async () => {
      const paginationParams: JobSearchParams = {
        page: 3,
        pageSize: 15,
      };

      const mockResponse = {
        jobs: Array(15).fill(mockJobCard),
        totalCount: 100,
        totalPages: 7,
        currentPage: 3,
        processingTime: 60,
      };

      vi.mocked(searchJobsWithFilters).mockResolvedValue(mockResponse);

      const result = await searchPublicJobs(paginationParams);

      expect(result.success).toBe(true);
      expect(result.data?.currentPage).toBe(3);
      expect(result.data?.totalPages).toBe(7);
    });
  });
});

describe('getPublicJobById', () => {
  const mockJobId = 'job-123';
  const mockJobDetail: JobDetailData = {
    uid: mockJobId,
    title: 'Software Developer',
    companyId: 'company-456',
    companyName: 'Tech Corp',
    companyLogo: 'https://example.com/logo.png',
    minSalary: 30000,
    maxSalary: 50000,
    isNegotiable: false,
    workLocationText: 'Bangkok',
    employmentText: 'Full-time',
    experienceText: '1-3 years',
    educationLevelText: ['Bachelor\'s Degree'],
    jobDescriptionDetails: '<p>Job description</p>',
    qualificationDetails: '<p>Qualifications</p>',
    benefitsDetails: '<p>Benefits</p>',
    phone: '02-123-4567',
    email: 'hr@techcorp.com',
    postStartDate: Date.now(),
    postExpiryDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
    jobStatus: 'published',
    isActive: true,
    positions: 2,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return job detail when job exists and is active', async () => {
    vi.mocked(jobsRepository.getById).mockResolvedValue(mockJobDetail as any);

    const result = await getPublicJobById(mockJobId);

    expect(result).toEqual(mockJobDetail);
    expect(jobsRepository.getById).toHaveBeenCalledWith(mockJobId);
  });

  it('should return null when job does not exist', async () => {
    vi.mocked(jobsRepository.getById).mockResolvedValue(null);

    const result = await getPublicJobById('non-existent-job');

    expect(result).toBeNull();
  });

  it('should return null when job is inactive', async () => {
    const inactiveJob = { ...mockJobDetail, isActive: false };
    vi.mocked(jobsRepository.getById).mockResolvedValue(inactiveJob as any);

    const result = await getPublicJobById(mockJobId);

    expect(result).toBeNull();
  });

  it('should return null when job status is not published/ontimer', async () => {
    const draftJob = { ...mockJobDetail, jobStatus: 'draft' as const };
    vi.mocked(jobsRepository.getById).mockResolvedValue(draftJob as any);

    const result = await getPublicJobById(mockJobId);

    expect(result).toBeNull();
  });
});

describe('getSimilarJobs', () => {
  const mockJobId = 'job-123';
  const mockSimilarJob: JobCardData = {
    uid: 'job-456',
    title: 'Senior Developer',
    companyId: 'company-789',
    companyName: 'Another Tech Co',
    companyLogo: 'https://example.com/logo2.png',
    minSalary: 40000,
    maxSalary: 70000,
    isNegotiable: true,
    workLocationText: 'Bangkok',
    employmentText: 'Full-time',
    experienceText: '3-5 years',
    createdAt: Date.now(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return similar jobs based on job function and industry', async () => {
    vi.mocked(searchJobsWithFilters).mockResolvedValue({
      jobs: [mockSimilarJob],
      totalCount: 1,
      totalPages: 1,
      currentPage: 1,
      processingTime: 40,
    });

    const result = await getSimilarJobs(mockJobId, 5);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(mockSimilarJob);
  });

  it('should exclude the current job from results', async () => {
    const similarJobs = [mockSimilarJob];
    vi.mocked(searchJobsWithFilters).mockResolvedValue({
      jobs: similarJobs,
      totalCount: 1,
      totalPages: 1,
      currentPage: 1,
      processingTime: 40,
    });

    const result = await getSimilarJobs(mockJobId, 5);

    expect(result.every(job => job.uid !== mockJobId)).toBe(true);
  });

  it('should respect the limit parameter', async () => {
    const manyJobs = Array(10).fill(mockSimilarJob).map((job, i) => ({ ...job, uid: `job-${i}` }));
    vi.mocked(searchJobsWithFilters).mockResolvedValue({
      jobs: manyJobs.slice(0, 3),
      totalCount: 10,
      totalPages: 1,
      currentPage: 1,
      processingTime: 50,
    });

    const result = await getSimilarJobs(mockJobId, 3);

    expect(result).toHaveLength(3);
  });

  it('should return empty array when no similar jobs found', async () => {
    vi.mocked(searchJobsWithFilters).mockResolvedValue({
      jobs: [],
      totalCount: 0,
      totalPages: 0,
      currentPage: 1,
      processingTime: 30,
    });

    const result = await getSimilarJobs(mockJobId, 5);

    expect(result).toEqual([]);
  });
});

describe('saveJob', () => {
  const mockSaveParams: SaveJobParams = {
    candidateId: 'candidate-123',
    jobId: 'job-456',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Happy Path', () => {
    it('should create saved job for valid candidate', async () => {
      vi.mocked(jobsRepository.getById).mockResolvedValue({ isActive: true, jobStatus: 'published' } as any);
      vi.mocked(candidateSavedJobsRepository.exists).mockResolvedValue(false);
      vi.mocked(candidateSavedJobsRepository.create).mockResolvedValue({
        uid: `${mockSaveParams.candidateId}_${mockSaveParams.jobId}`,
        candidateId: mockSaveParams.candidateId,
        jobId: mockSaveParams.jobId,
        savedAt: Date.now(),
        createdBy: mockSaveParams.candidateId,
        updatedBy: mockSaveParams.candidateId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      const result = await saveJob(mockSaveParams);

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
      expect(candidateSavedJobsRepository.create).toHaveBeenCalledWith(
        mockSaveParams.candidateId,
        mockSaveParams.jobId
      );
    });

    it('should be idempotent (no error if already saved)', async () => {
      vi.mocked(jobsRepository.getById).mockResolvedValue({ isActive: true, jobStatus: 'published' } as any);
      vi.mocked(candidateSavedJobsRepository.exists).mockResolvedValue(true);

      const result = await saveJob(mockSaveParams);

      expect(result.success).toBe(true);
      expect(candidateSavedJobsRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('Validation', () => {
    it('should reject when job does not exist', async () => {
      vi.mocked(jobsRepository.getById).mockResolvedValue(null);

      const result = await saveJob(mockSaveParams);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(candidateSavedJobsRepository.create).not.toHaveBeenCalled();
    });

    it('should reject when job is inactive', async () => {
      vi.mocked(jobsRepository.getById).mockResolvedValue({ isActive: false, jobStatus: 'published' } as any);

      const result = await saveJob(mockSaveParams);

      expect(result.success).toBe(false);
      expect(result.error).toContain('not available');
    });

    it('should reject when job is not published', async () => {
      vi.mocked(jobsRepository.getById).mockResolvedValue({ isActive: true, jobStatus: 'draft' } as any);

      const result = await saveJob(mockSaveParams);

      expect(result.success).toBe(false);
      expect(result.error).toContain('not available');
    });

    it('should reject empty candidateId', async () => {
      const invalidParams: SaveJobParams = {
        candidateId: '',
        jobId: 'job-456',
      };

      const result = await saveJob(invalidParams);

      expect(result.success).toBe(false);
      expect(result.error).toContain('candidate');
    });

    it('should reject empty jobId', async () => {
      const invalidParams: SaveJobParams = {
        candidateId: 'candidate-123',
        jobId: '',
      };

      const result = await saveJob(invalidParams);

      expect(result.success).toBe(false);
      expect(result.error).toContain('job');
    });
  });
});

describe('unsaveJob', () => {
  const mockUnsaveParams: SaveJobParams = {
    candidateId: 'candidate-123',
    jobId: 'job-456',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should delete saved job when it exists', async () => {
    vi.mocked(candidateSavedJobsRepository.delete).mockResolvedValue(true);

    const result = await unsaveJob(mockUnsaveParams);

    expect(result.success).toBe(true);
    expect(candidateSavedJobsRepository.delete).toHaveBeenCalledWith(
      mockUnsaveParams.candidateId,
      mockUnsaveParams.jobId
    );
  });

  it('should be idempotent (no error if not saved)', async () => {
    vi.mocked(candidateSavedJobsRepository.delete).mockResolvedValue(false);

    const result = await unsaveJob(mockUnsaveParams);

    expect(result.success).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should reject empty candidateId', async () => {
    const invalidParams: SaveJobParams = {
      candidateId: '',
      jobId: 'job-456',
    };

    const result = await unsaveJob(invalidParams);

    expect(result.success).toBe(false);
    expect(result.error).toContain('candidate');
  });

  it('should reject empty jobId', async () => {
    const invalidParams: SaveJobParams = {
      candidateId: 'candidate-123',
      jobId: '',
    };

    const result = await unsaveJob(invalidParams);

    expect(result.success).toBe(false);
    expect(result.error).toContain('job');
  });
});

describe('getSavedJobs', () => {
  const mockCandidateId = 'candidate-123';
  const mockSavedJobItem: SavedJobItem = {
    job: {
      uid: 'job-456',
      title: 'Software Developer',
      companyId: 'company-789',
      companyName: 'Tech Corp',
      companyLogo: 'https://example.com/logo.png',
      minSalary: 30000,
      maxSalary: 50000,
      isNegotiable: false,
      workLocationText: 'Bangkok',
      employmentText: 'Full-time',
      experienceText: '1-3 years',
      createdAt: Date.now(),
    },
    savedAt: Date.now(),
    hasApplication: false,
    jobAvailability: 'available',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return all saved jobs with metadata', async () => {
    vi.mocked(candidateSavedJobsRepository.getByCandidateId).mockResolvedValue([
      {
        uid: 'candidate-123_job-456',
        candidateId: mockCandidateId,
        jobId: 'job-456',
        savedAt: Date.now(),
        createdBy: mockCandidateId,
        updatedBy: mockCandidateId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ]);

    vi.mocked(jobsRepository.getById).mockResolvedValue({
      uid: 'job-456',
      title: 'Software Developer',
      companyId: 'company-789',
      companyName: 'Tech Corp',
      companyLogo: 'https://example.com/logo.png',
      minSalary: 30000,
      maxSalary: 50000,
      isNegotiable: false,
      workLocationText: 'Bangkok',
      employmentText: 'Full-time',
      experienceText: '1-3 years',
      createdAt: Date.now(),
      isActive: true,
      jobStatus: 'published',
    } as any);

    // Mock job applications repository
    vi.mocked(jobApplicationsRepository.getByFilter).mockResolvedValue([]);

    const result = await getSavedJobs(mockCandidateId);

    expect(result).toHaveLength(1);
    expect(result[0].job.uid).toBe('job-456');
    expect(result[0].jobAvailability).toBe('available');
  });

  it('should determine job availability correctly', async () => {
    vi.mocked(candidateSavedJobsRepository.getByCandidateId).mockResolvedValue([
      {
        uid: 'candidate-123_job-expired',
        candidateId: mockCandidateId,
        jobId: 'job-expired',
        savedAt: Date.now(),
        createdBy: mockCandidateId,
        updatedBy: mockCandidateId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ]);

    vi.mocked(jobsRepository.getById).mockResolvedValue({
      uid: 'job-expired',
      isActive: false,
      jobStatus: 'closed',
    } as any);

    // Mock job applications repository
    vi.mocked(jobApplicationsRepository.getByFilter).mockResolvedValue([]);

    const result = await getSavedJobs(mockCandidateId);

    expect(result[0].jobAvailability).toBe('closed');
  });

  it('should return empty array when no saved jobs', async () => {
    vi.mocked(candidateSavedJobsRepository.getByCandidateId).mockResolvedValue([]);

    const result = await getSavedJobs(mockCandidateId);

    expect(result).toEqual([]);
  });

  it('should handle deleted jobs gracefully', async () => {
    vi.mocked(candidateSavedJobsRepository.getByCandidateId).mockResolvedValue([
      {
        uid: 'candidate-123_job-deleted',
        candidateId: mockCandidateId,
        jobId: 'job-deleted',
        savedAt: Date.now(),
        createdBy: mockCandidateId,
        updatedBy: mockCandidateId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ]);

    vi.mocked(jobsRepository.getById).mockResolvedValue(null);

    // Mock job applications repository
    vi.mocked(jobApplicationsRepository.getByFilter).mockResolvedValue([]);

    const result = await getSavedJobs(mockCandidateId);

    expect(result).toHaveLength(1);
    expect(result[0].jobAvailability).toBe('not_found');
  });
});
