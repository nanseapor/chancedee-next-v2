import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { webCandidateSavedJobsGet } from '@/lib/database/actions/candidate-saved';
import { candidateSavedJobsRepository } from '@/lib/database/repositories/candidate-saved-jobs-repository';
import { jobsRepository } from '@/lib/database/repositories/jobs-repository';
import {
  generateTestId,
  cleanupMultipleTestData,
  getTestActorId,
} from '../../../../integration/database/test-utils';
import {
  createTestCompany,
  deleteTestCompany,
  createTestJob,
  deleteTestJob,
} from './test-helpers';

describe('CAND-R05: Saved Jobs Actions - Integration', () => {
  const testIds: Array<{ collection: string; docId: string }> = [];
  const actorId = getTestActorId();

  const TEST_CANDIDATE_ID = generateTestId('candidate');
  const TEST_JOB_ID_1 = generateTestId('job');
  const TEST_JOB_ID_2 = generateTestId('job');
  const TEST_COMPANY_ID = generateTestId('company');

  afterEach(async () => {
    await cleanupMultipleTestData(testIds);
    testIds.length = 0;
  });

  describe('webCandidateSavedJobsGet', () => {
    it('should return saved jobs with job details', async () => {
      // 1. Create test company
      await createTestCompany(TEST_COMPANY_ID, 'Test Company');
      testIds.push({ collection: 'company_information', docId: TEST_COMPANY_ID });

      // 2. Create test job
      await createTestJob(TEST_JOB_ID_1, TEST_COMPANY_ID, 'Software Engineer', {
        companyName: 'Test Company',
        companyLogo: 'https://example.com/logo.png',
        location: 'Bangkok',
        minSalary: 50000,
        maxSalary: 80000,
        isActive: true,
        jobStatus: 'published',
      });
      testIds.push({ collection: 'jobs', docId: TEST_JOB_ID_1 });

      // 3. Create saved job record
      await candidateSavedJobsRepository.create(TEST_CANDIDATE_ID, TEST_JOB_ID_1);
      testIds.push({ collection: 'candidate_saved_jobs', docId: `${TEST_CANDIDATE_ID}_${TEST_JOB_ID_1}` });

      // 4. Call the action
      const result = await webCandidateSavedJobsGet({ candidateId: TEST_CANDIDATE_ID });

      // 5. Assert
      expect(result.success).toBe(true);
      expect(result.savedJobs).toHaveLength(1);
      expect(result.savedJobs![0].job.uid).toBe(TEST_JOB_ID_1);
      expect(result.savedJobs![0].job.title).toBe('Software Engineer');
      expect(result.savedJobs![0].job.companyId).toBe(TEST_COMPANY_ID);
      expect(result.savedJobs![0].job.companyName).toBe('Test Company');
      expect(result.savedJobs![0].job.workLocation).toBe('Bangkok');
      expect(result.savedJobs![0].job.minSalary).toBe(50000);
      expect(result.savedJobs![0].job.maxSalary).toBe(80000);
      expect(result.savedJobs![0].job.isActive).toBe(true);
      expect(result.savedJobs![0].job.jobStatus).toBe('published');
    });

    it('should return empty array when candidate has no saved jobs', async () => {
      const result = await webCandidateSavedJobsGet({ candidateId: TEST_CANDIDATE_ID });

      expect(result.success).toBe(true);
      expect(result.savedJobs).toEqual([]);
    });

    it('should handle missing jobs gracefully (filter out deleted jobs)', async () => {
      // Create saved job record pointing to non-existent job
      await candidateSavedJobsRepository.create(TEST_CANDIDATE_ID, 'non-existent-job');
      testIds.push({ collection: 'candidate_saved_jobs', docId: `${TEST_CANDIDATE_ID}_non-existent-job` });

      const result = await webCandidateSavedJobsGet({ candidateId: TEST_CANDIDATE_ID });

      expect(result.success).toBe(true);
      expect(result.savedJobs).toEqual([]); // Should filter out null jobs
    });
  });
});
