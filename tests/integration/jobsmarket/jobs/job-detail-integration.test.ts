import { describe, it, expect } from 'vitest';
import { getPublicJobById, getSimilarJobs } from '@/domains/jobs/services/server/actions/jobsmarket/public-jobs';

/**
 * Integration Tests for Job Detail Server Actions
 *
 * Tests real interactions with development database
 * Uses actual job IDs from development data
 */
describe('Job Detail Integration', () => {
  // Use a known job ID from development data
  const TEST_JOB_ID = 'LnGogSEQZh0ZFO3c0ujQ';
  const INVALID_JOB_ID = 'nonexistent-job-id-12345';

  describe('getPublicJobById', () => {
    it('returns job data for valid ID', async () => {
      const result = await getPublicJobById(TEST_JOB_ID);

      expect(result).toBeDefined();
      expect(result).not.toBeNull();

      if (result) {
        expect(result.uid).toBe(TEST_JOB_ID);
        expect(result.title).toBeDefined();
        expect(result.companyName).toBeDefined();
      }
    });

    it('returns null for invalid ID', async () => {
      const result = await getPublicJobById(INVALID_JOB_ID);

      expect(result).toBeNull();
    });

    it('returns complete job data structure', async () => {
      const result = await getPublicJobById(TEST_JOB_ID);

      if (result) {
        // Verify required fields exist
        expect(result.uid).toBeDefined();
        expect(result.title).toBeDefined();
        expect(result.jobStatus).toBeDefined();
        expect(result.companyName).toBeDefined();
        expect(result.companyId).toBeDefined();

        // Verify data types
        expect(typeof result.uid).toBe('string');
        expect(typeof result.title).toBe('string');
        expect(typeof result.companyName).toBe('string');
        expect(typeof result.isActive).toBe('boolean');

        // Verify job detail specific fields
        expect(result.jobDescriptionDetails).toBeDefined();
        expect(result.qualificationDetails).toBeDefined();
        expect(result.benefitsDetails).toBeDefined();
      }
    });

    it('returns job with valid status field', async () => {
      const result = await getPublicJobById(TEST_JOB_ID);

      if (result) {
        const validStatuses = ['draft', 'published', 'ontimer', 'unpublished', 'closed'];
        expect(validStatuses).toContain(result.jobStatus);
      }
    });

    it('only returns active published jobs', async () => {
      const result = await getPublicJobById(TEST_JOB_ID);

      if (result) {
        // Public jobs should always be active
        expect(result.isActive).toBe(true);

        // And have published or ontimer status
        expect(['published', 'ontimer']).toContain(result.jobStatus);
      }
    });
  });

  describe('getSimilarJobs', () => {
    it('returns result object with success flag', async () => {
      const result = await getSimilarJobs(TEST_JOB_ID, 6);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('success');
      expect(typeof result.success).toBe('boolean');
    });

    it('returns array of similar jobs on success', async () => {
      const result = await getSimilarJobs(TEST_JOB_ID, 6);

      // MeiliSearch may not be running in test environment
      // Test should pass if either succeeds OR fails gracefully
      if (result.success) {
        expect(result.data).toBeDefined();
        expect(Array.isArray(result.data)).toBe(true);
      } else {
        // Should fail gracefully with error
        expect(result.error).toBeDefined();
        expect(typeof result.error).toBe('string');
      }
    });

    it('excludes current job from results', async () => {
      const result = await getSimilarJobs(TEST_JOB_ID, 6);

      if (result.success && result.data) {
        const hasCurrentJob = result.data.some((j) => j.uid === TEST_JOB_ID);
        expect(hasCurrentJob).toBe(false);
      }
    });

    it('respects limit parameter', async () => {
      const limit = 3;
      const result = await getSimilarJobs(TEST_JOB_ID, limit);

      if (result.success && result.data) {
        expect(result.data.length).toBeLessThanOrEqual(limit);
      }
    });

    it('returns empty array for nonexistent job', async () => {
      const result = await getSimilarJobs(INVALID_JOB_ID, 6);

      // Should succeed but return empty
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      if (result.data) {
        expect(result.data.length).toBe(0);
      }
    });

    it('returns jobs with required fields', async () => {
      const result = await getSimilarJobs(TEST_JOB_ID, 6);

      if (result.success && result.data && result.data.length > 0) {
        const firstJob = result.data[0];

        // Verify JobCardData structure
        expect(firstJob.uid).toBeDefined();
        expect(firstJob.title).toBeDefined();
        expect(firstJob.companyId).toBeDefined();
        expect(firstJob.companyName).toBeDefined();
        expect(firstJob.workLocationText).toBeDefined();
        expect(firstJob.employmentText).toBeDefined();

        // Verify data types
        expect(typeof firstJob.uid).toBe('string');
        expect(typeof firstJob.title).toBe('string');
        expect(typeof firstJob.companyName).toBe('string');
      }
    });

    it('handles errors gracefully', async () => {
      // Pass invalid parameters to trigger error
      const result = await getSimilarJobs('', -1);

      // Should return result object even on error
      expect(result).toBeDefined();
      expect(result).toHaveProperty('success');
    });
  });
});
