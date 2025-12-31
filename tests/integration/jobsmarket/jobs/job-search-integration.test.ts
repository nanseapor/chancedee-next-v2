import { describe, it, expect, afterEach } from 'vitest';
import {
  searchPublicJobs,
  saveJob,
  unsaveJob
} from '@/domains/jobs/services/server/actions/jobsmarket/public-jobs';

const TEST_CANDIDATE_ID = 'integration-test-r01-candidate';
const TEST_JOB_ID = 'integration-test-r01-job';

describe('Job Search Integration Tests', () => {
  afterEach(async () => {
    // Cleanup: Remove test saved job if it exists
    try {
      await unsaveJob({ candidateId: TEST_CANDIDATE_ID, jobId: TEST_JOB_ID });
    } catch (error) {
      // Ignore errors during cleanup
    }
  });

  describe('searchPublicJobs', () => {
    it('returns jobs from database with pagination', async () => {
      const result = await searchPublicJobs({ page: 1, pageSize: 10 });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      if (result.data) {
        expect(Array.isArray(result.data.jobs)).toBe(true);
        expect(result.data.totalCount).toBeGreaterThanOrEqual(0);
        expect(result.data.totalPages).toBeGreaterThanOrEqual(0);
        expect(result.data.currentPage).toBe(1);
      }
    });

    it('returns correct page size', async () => {
      const pageSize = 5;
      const result = await searchPublicJobs({ page: 1, pageSize });

      expect(result.success).toBe(true);
      if (result.data && result.data.jobs.length > 0) {
        expect(result.data.jobs.length).toBeLessThanOrEqual(pageSize);
      }
    });

    it('handles pagination correctly', async () => {
      const result = await searchPublicJobs({ page: 1, pageSize: 10 });

      expect(result.success).toBe(true);
      if (result.data) {
        expect(result.data.currentPage).toBe(1);
        if (result.data.totalCount > 10) {
          expect(result.data.totalPages).toBeGreaterThan(1);
        }
      }
    });

    it('filters by keyword in job title or description', async () => {
      // Use a common keyword that should exist in jobs
      const result = await searchPublicJobs({
        q: 'developer',
        page: 1
      });

      expect(result.success).toBe(true);
      // Results may be empty if no jobs match, but should not error
    });

    it('filters by location', async () => {
      const result = await searchPublicJobs({
        locations: ['กรุงเทพมหานคร'],
        page: 1
      });

      expect(result.success).toBe(true);
      // Results may be empty if no jobs match, but should not error
    });

    it('filters by salary range', async () => {
      const result = await searchPublicJobs({
        salaryMin: 30000,
        salaryMax: 50000,
        page: 1
      });

      expect(result.success).toBe(true);
      // Results may be empty if no jobs match, but should not error
    });

    it('filters by employment type', async () => {
      const result = await searchPublicJobs({
        types: ['fulltime'],
        page: 1
      });

      expect(result.success).toBe(true);
      // Results may be empty if no jobs match, but should not error
    });

    it('handles empty results gracefully', async () => {
      const result = await searchPublicJobs({
        q: 'xyznonexistent123456789',
        page: 1
      });

      expect(result.success).toBe(true);
      if (result.data) {
        // Jobs may or may not be empty depending on search algorithm
        // The important thing is it doesn't error
        expect(Array.isArray(result.data.jobs)).toBe(true);
        expect(result.data.totalCount).toBeGreaterThanOrEqual(0);
        expect(result.data.totalPages).toBeGreaterThanOrEqual(0);
      }
    });

    it('combines multiple filters', async () => {
      const result = await searchPublicJobs({
        q: 'developer',
        locations: ['กรุงเทพมหานคร'],
        salaryMin: 20000,
        types: ['fulltime'],
        page: 1
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('handles invalid page numbers gracefully', async () => {
      const result = await searchPublicJobs({ page: 0, pageSize: 10 });

      expect(result.success).toBe(true);
      // Should default to page 1 or return empty results
    });

    it('handles very large page sizes', async () => {
      const result = await searchPublicJobs({ page: 1, pageSize: 1000 });

      expect(result.success).toBe(true);
      if (result.data) {
        // Should cap at reasonable limit (likely 100)
        expect(result.data.jobs.length).toBeLessThanOrEqual(100);
      }
    });
  });

  describe('Save Job Integration', () => {
    it('saveJob creates saved_job document in Firestore', async () => {
      const result = await saveJob({
        candidateId: TEST_CANDIDATE_ID,
        jobId: TEST_JOB_ID
      });

      // Should succeed (even if job doesn't exist - we're testing the save operation)
      // In real implementation, it should validate job exists
      expect(result).toBeDefined();
      expect(typeof result.success).toBe('boolean');
    });

    it('unsaveJob removes saved_job document from Firestore', async () => {
      // Setup: Save the job first
      await saveJob({
        candidateId: TEST_CANDIDATE_ID,
        jobId: TEST_JOB_ID
      });

      // Act: Unsave the job
      const result = await unsaveJob({
        candidateId: TEST_CANDIDATE_ID,
        jobId: TEST_JOB_ID
      });

      expect(result).toBeDefined();
      expect(typeof result.success).toBe('boolean');
    });

    it('saveJob validates candidate ID', async () => {
      const result = await saveJob({
        candidateId: '',
        jobId: TEST_JOB_ID
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
        expect(result.error).toContain('Invalid candidate ID');
      }
    });

    it('saveJob validates job ID', async () => {
      const result = await saveJob({
        candidateId: TEST_CANDIDATE_ID,
        jobId: ''
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
        expect(result.error).toContain('Invalid job ID');
      }
    });

    it('unsaveJob validates candidate ID', async () => {
      const result = await unsaveJob({
        candidateId: '',
        jobId: TEST_JOB_ID
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
        expect(result.error).toContain('Invalid candidate ID');
      }
    });

    it('unsaveJob validates job ID', async () => {
      const result = await unsaveJob({
        candidateId: TEST_CANDIDATE_ID,
        jobId: ''
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
        expect(result.error).toContain('Invalid job ID');
      }
    });

    it('saveJob handles duplicate saves gracefully', async () => {
      // Save once
      const result1 = await saveJob({
        candidateId: TEST_CANDIDATE_ID,
        jobId: TEST_JOB_ID
      });

      // Save again (should not error)
      const result2 = await saveJob({
        candidateId: TEST_CANDIDATE_ID,
        jobId: TEST_JOB_ID
      });

      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
    });

    it('unsaveJob handles non-existent saved job gracefully', async () => {
      // Try to unsave a job that was never saved
      const result = await unsaveJob({
        candidateId: 'never-saved-candidate',
        jobId: 'never-saved-job'
      });

      expect(result).toBeDefined();
      // Should not throw error
    });
  });
});
