/**
 * Integration Tests: Public Jobs Server Actions
 *
 * Tests server actions with REAL database interactions.
 * These tests verify actual database state changes.
 *
 * CRITICAL: These tests use the REAL dev database (not Firebase emulator)
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { saveJob, unsaveJob, getSavedJobs } from '@/domains/jobs/services/server/actions/jobsmarket/public-jobs';
import { candidateSavedJobsRepository } from '@/lib/database/repositories/candidate-saved-jobs-repository';

// Use test fixtures - create before, cleanup after
const TEST_CANDIDATE_ID = 'integration-test-candidate';
const TEST_JOB_ID = 'integration-test-job';

describe('Public Jobs Integration Tests', () => {
  afterEach(async () => {
    // Cleanup: Remove any test data
    await candidateSavedJobsRepository.delete(TEST_CANDIDATE_ID, TEST_JOB_ID);
    await candidateSavedJobsRepository.delete(TEST_CANDIDATE_ID, 'job-1');
    await candidateSavedJobsRepository.delete(TEST_CANDIDATE_ID, 'job-2');
  });

  describe('saveJob', () => {
    it('creates document in Firestore', async () => {
      const result = await saveJob({
        candidateId: TEST_CANDIDATE_ID,
        jobId: TEST_JOB_ID,
      });

      expect(result.success).toBe(true);

      // VERIFY DATABASE STATE
      const exists = await candidateSavedJobsRepository.exists(
        TEST_CANDIDATE_ID,
        TEST_JOB_ID
      );
      expect(exists).toBe(true);
    });

    it('is idempotent - second save does not error', async () => {
      await saveJob({ candidateId: TEST_CANDIDATE_ID, jobId: TEST_JOB_ID });
      const result = await saveJob({ candidateId: TEST_CANDIDATE_ID, jobId: TEST_JOB_ID });

      expect(result.success).toBe(true);

      // Should still only have one record
      const records = await candidateSavedJobsRepository.getByCandidateId(TEST_CANDIDATE_ID);
      const matchingRecords = records.filter(r => r.jobId === TEST_JOB_ID);
      expect(matchingRecords.length).toBe(1);
    });
  });

  describe('unsaveJob', () => {
    it('deletes document from Firestore', async () => {
      // Setup: Create a saved job first
      await candidateSavedJobsRepository.create(TEST_CANDIDATE_ID, TEST_JOB_ID);

      const result = await unsaveJob({
        candidateId: TEST_CANDIDATE_ID,
        jobId: TEST_JOB_ID,
      });

      expect(result.success).toBe(true);

      // VERIFY DATABASE STATE
      const exists = await candidateSavedJobsRepository.exists(
        TEST_CANDIDATE_ID,
        TEST_JOB_ID
      );
      expect(exists).toBe(false);
    });

    it('is idempotent - unsave non-existent does not error', async () => {
      const result = await unsaveJob({
        candidateId: TEST_CANDIDATE_ID,
        jobId: 'non-existent-job',
      });

      expect(result.success).toBe(true);
    });
  });

  describe('getSavedJobs', () => {
    it('returns saved jobs with metadata', async () => {
      // Setup: Create some saved jobs
      await candidateSavedJobsRepository.create(TEST_CANDIDATE_ID, TEST_JOB_ID);

      const result = await getSavedJobs(TEST_CANDIDATE_ID);

      expect(result.length).toBeGreaterThanOrEqual(1);
      const savedJob = result.find(j => j.job?.uid === TEST_JOB_ID);
      expect(savedJob).toBeDefined();
      expect(savedJob?.savedAt).toBeDefined();
    });

    it('returns empty array for candidate with no saved jobs', async () => {
      const result = await getSavedJobs('candidate-with-no-saves');

      expect(result).toEqual([]);
    });
  });

  describe('Repository direct operations', () => {
    it('create generates correct composite ID', async () => {
      const saved = await candidateSavedJobsRepository.create(
        TEST_CANDIDATE_ID,
        TEST_JOB_ID
      );

      expect(saved.uid).toBe(`${TEST_CANDIDATE_ID}_${TEST_JOB_ID}`);
      expect(saved.candidateId).toBe(TEST_CANDIDATE_ID);
      expect(saved.jobId).toBe(TEST_JOB_ID);
    });

    it('getByCandidateId returns all saved jobs for candidate', async () => {
      await candidateSavedJobsRepository.create(TEST_CANDIDATE_ID, 'job-1');
      await candidateSavedJobsRepository.create(TEST_CANDIDATE_ID, 'job-2');

      const results = await candidateSavedJobsRepository.getByCandidateId(TEST_CANDIDATE_ID);

      expect(results.length).toBeGreaterThanOrEqual(2);
    });

    it('delete returns true when document exists', async () => {
      // Setup
      await candidateSavedJobsRepository.create(TEST_CANDIDATE_ID, TEST_JOB_ID);

      // Delete
      const deleted = await candidateSavedJobsRepository.delete(TEST_CANDIDATE_ID, TEST_JOB_ID);

      expect(deleted).toBe(true);

      // Verify
      const exists = await candidateSavedJobsRepository.exists(TEST_CANDIDATE_ID, TEST_JOB_ID);
      expect(exists).toBe(false);
    });

    it('delete returns false when document does not exist', async () => {
      const deleted = await candidateSavedJobsRepository.delete('non-existent-candidate', 'non-existent-job');

      expect(deleted).toBe(false);
    });

    it('exists returns false for non-existent saved job', async () => {
      const exists = await candidateSavedJobsRepository.exists('non-existent-candidate', 'non-existent-job');

      expect(exists).toBe(false);
    });
  });
});
