import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  webJobApplicationGetByCandidate,
  webJobApplicationWithdraw,
  webJobApplicationCreate,
  webJobApplicationGetById,
} from '@/lib/database/actions/job-applications';
import { WITHDRAWABLE_STATUSES } from '@/lib/database/actions/job-applications.constants';
import {
  generateTestId,
  cleanupTestData,
  getTestActorId,
} from '../../../../integration/database/test-utils';

describe('CAND-R04: Job Application Actions', () => {
  const testIds: { collection: string; id: string }[] = [];
  const actorId = getTestActorId();

  // Generate unique test IDs per test run to avoid collision
  const TEST_CANDIDATE_ID = generateTestId('candidate');
  const TEST_JOB_ID = generateTestId('job');
  const TEST_COMPANY_ID = generateTestId('company');

  /**
   * Helper to create a test application
   */
  async function createTestApplication(
    status: string = 'applied',
    overrides: Partial<{
      candidateId: string;
      jobId: string;
      companyId: string;
    }> = {}
  ): Promise<string> {
    const appId = generateTestId('app');
    testIds.push({ collection: 'web_job_applications', id: appId });

    await webJobApplicationCreate(
      {
        candidateId: overrides.candidateId ?? TEST_CANDIDATE_ID,
        jobId: overrides.jobId ?? TEST_JOB_ID,
        companyId: overrides.companyId ?? TEST_COMPANY_ID,
        status,
        jobTitle: 'Test Job Title',
        companyName: 'Test Company',
      } as any,
      actorId,
      appId
    );

    return appId;
  }

  afterEach(async () => {
    // Cleanup all test data
    for (const item of testIds) {
      await cleanupTestData(item.collection, item.id);
    }
    testIds.length = 0;
  });

  describe('webJobApplicationGetByCandidate', () => {
    it('should return empty array when candidate has no applications', async () => {
      const result = await webJobApplicationGetByCandidate('non-existent-candidate');

      expect(result).toEqual([]);
    });

    it('should return all applications for a candidate', async () => {
      // Create 3 test applications
      await createTestApplication('applied');
      await createTestApplication('read');
      await createTestApplication('accepted');

      const result = await webJobApplicationGetByCandidate(TEST_CANDIDATE_ID);

      expect(result).toHaveLength(3);
      expect(result.every(app => app.candidateId === TEST_CANDIDATE_ID)).toBe(true);
    });

    it('should include joined job and company data', async () => {
      const appId = await createTestApplication('applied');

      const result = await webJobApplicationGetByCandidate(TEST_CANDIDATE_ID);
      const app = result.find(a => a.uid === appId);

      expect(app).toBeDefined();
      expect(app!.jobTitle).toBeDefined();
      expect(app!.companyName).toBeDefined();
      // jobIsActive should have a value (true or false, not undefined)
      expect(typeof app!.jobIsActive).toBe('boolean');
    });

    it('should sort applications by createdAt descending (newest first)', async () => {
      // Use a unique candidate ID for this test to avoid interference from other tests
      const sortTestCandidateId = generateTestId('candidate-sort');

      // Create applications with slight delay to ensure different timestamps
      await createTestApplication('applied', { candidateId: sortTestCandidateId });
      await new Promise(resolve => setTimeout(resolve, 100));
      await createTestApplication('read', { candidateId: sortTestCandidateId });
      await new Promise(resolve => setTimeout(resolve, 100));
      await createTestApplication('accepted', { candidateId: sortTestCandidateId });

      const result = await webJobApplicationGetByCandidate(sortTestCandidateId);

      expect(result).toHaveLength(3);
      // Verify descending order
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i].createdAt).toBeGreaterThanOrEqual(result[i + 1].createdAt);
      }
    });

    it('should handle missing job/company gracefully with fallbacks', async () => {
      // Create application with non-existent job/company IDs
      const appId = generateTestId('app');
      testIds.push({ collection: 'web_job_applications', id: appId });

      await webJobApplicationCreate(
        {
          candidateId: TEST_CANDIDATE_ID,
          jobId: 'non-existent-job',
          companyId: 'non-existent-company',
          status: 'applied',
          companyName: 'Fallback Company',
        } as any,
        actorId,
        appId
      );

      const result = await webJobApplicationGetByCandidate(TEST_CANDIDATE_ID);
      const app = result.find(a => a.uid === appId);

      expect(app).toBeDefined();
      // companyName should use fallback from application record (stored in Firestore)
      expect(app!.companyName).toBe('Fallback Company');
      // jobTitle is not stored, so it will use the final fallback
      expect(app!.jobTitle).toBe('ไม่ระบุตำแหน่ง');
    });
  });

  describe('webJobApplicationWithdraw', () => {
    it.each(WITHDRAWABLE_STATUSES)(
      'should successfully withdraw application in "%s" status',
      async (status) => {
        const appId = await createTestApplication(status);

        await webJobApplicationWithdraw(appId, TEST_CANDIDATE_ID);

        const updated = await webJobApplicationGetById(appId);
        expect(updated?.status).toBe('withdraw');
      }
    );

    it('should reject withdrawal for non-withdrawable statuses', async () => {
      const appId = await createTestApplication('rejected');

      await expect(
        webJobApplicationWithdraw(appId, TEST_CANDIDATE_ID)
      ).rejects.toThrow(/cannot withdraw/i);

      // Verify status unchanged
      const unchanged = await webJobApplicationGetById(appId);
      expect(unchanged?.status).toBe('rejected');
    });

    it('should reject withdrawal by non-owner', async () => {
      const appId = await createTestApplication('applied');

      await expect(
        webJobApplicationWithdraw(appId, 'different-user-id')
      ).rejects.toThrow(/owner/i);

      // Verify status unchanged
      const unchanged = await webJobApplicationGetById(appId);
      expect(unchanged?.status).toBe('applied');
    });

    it('should reject withdrawal for non-existent application', async () => {
      await expect(
        webJobApplicationWithdraw('non-existent-app', TEST_CANDIDATE_ID)
      ).rejects.toThrow(/not found/i);
    });

    it('should update updatedAt timestamp on withdrawal', async () => {
      const appId = await createTestApplication('applied');
      const before = await webJobApplicationGetById(appId);

      // Small delay to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 100));

      await webJobApplicationWithdraw(appId, TEST_CANDIDATE_ID);

      const after = await webJobApplicationGetById(appId);
      expect(after?.updatedAt).toBeGreaterThan(before!.updatedAt);
    });
  });

  describe('webJobApplicationWithdraw - non-withdrawable statuses', () => {
    const NON_WITHDRAWABLE = ['rejected', 'declined', 'withdraw', 'closed', 'systemclosed', 'cancelled'];

    it.each(NON_WITHDRAWABLE)(
      'should reject withdrawal for "%s" status',
      async (status) => {
        const appId = await createTestApplication(status);

        await expect(
          webJobApplicationWithdraw(appId, TEST_CANDIDATE_ID)
        ).rejects.toThrow(/cannot withdraw/i);
      }
    );
  });
});
