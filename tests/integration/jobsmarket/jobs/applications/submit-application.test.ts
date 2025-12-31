/**
 * BLS-03-01: Integration tests for submitApplication server action
 * TDD RED Phase - These tests should FAIL until implementation
 *
 * Per BLS-03-01 Assessment Phase 1
 * Target: 9 integration tests with DB state verification
 *
 * CRITICAL: Every test MUST verify database state, not just return values
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { submitApplication } from '@/lib/database/actions/job-applications';
import { jobApplicationsRepository } from '@/lib/database/repositories/job-applications-repository';
import {
  generateTestId,
  cleanupTestData,
  getTestActorId,
} from '../../../../integration/database/test-utils';

describe('BLS-03-01: submitApplication Integration Tests', () => {
  const testIds: { collection: string; id: string }[] = [];
  const actorId = getTestActorId();

  // Test IDs will be generated fresh for each test
  let TEST_CANDIDATE_ID: string;
  let TEST_JOB_ID: string;
  let TEST_COMPANY_ID: string;

  /**
   * Setup: Create test candidate and job in database
   * CRITICAL FIX: Generate unique IDs per test to avoid ALREADY_APPLIED collisions
   */
  beforeEach(async () => {
    // Generate FRESH unique IDs for this specific test
    TEST_CANDIDATE_ID = generateTestId('candidate-submit');
    TEST_JOB_ID = generateTestId('job-submit');
    TEST_COMPANY_ID = generateTestId('company-submit');

    // Use action functions to create test data (per existing integration test pattern)
    const { webCandidateInformationCreate } = await import('@/lib/database/actions/candidate-information');
    const { webJobCreate } = await import('@/lib/database/actions/jobs');

    // Create test candidate using action (minimal fields + isResumeCompleted=true)
    await webCandidateInformationCreate(
      {
        firstnameTH: 'Test',
        lastnameTH: 'Candidate',
        phone: '0812345678',
        email: `test_${TEST_CANDIDATE_ID}@example.com`,
        isResumeCompleted: true, // CRITICAL: Required for submitApplication
      } as any,
      actorId,
      TEST_CANDIDATE_ID
    );
    testIds.push({ collection: 'candidate_information', id: TEST_CANDIDATE_ID });

    // Create test job using action with isActive=true
    await webJobCreate(
      {
        uid: TEST_JOB_ID,
        companyId: TEST_COMPANY_ID,
        companyName: 'Test Company for Submit Application',
        companyLogo: '',
        title: 'Test Job Position',
        isNegotiable: true,
        isOnlineInterview: true,
        jobStatus: 'active',
        isActive: true,
        isAcceptNewGrads: false,
        postExpiryDate: Date.now() + 86400000, // Tomorrow
        createdAt: Date.now(),
        updatedAt: Date.now(),
      } as any,
      actorId,
      TEST_JOB_ID
    );
    testIds.push({ collection: 'jobs', id: TEST_JOB_ID });
  });

  afterEach(async () => {
    // Cleanup all test data
    for (const item of testIds) {
      await cleanupTestData(item.collection, item.id);
    }
    testIds.length = 0;
  });

  /**
   * DATABASE OPERATIONS TESTS (4 tests)
   */
  describe('Database Operations', () => {
    it('should create application record in database', async () => {
      // Arrange
      const input = {
        jobId: TEST_JOB_ID,
        expectedSalary: 50000,
        isNegotiable: true,
        overheadDays: 30 as 0 | 7 | 15 | 30 | 60 | 90,
        headlines: 'Test application',
      };

      // Act
      const result = await submitApplication(input, TEST_CANDIDATE_ID);

      // Debug output
      if (!result.success) {
        console.log('❌ Application failed:', result.error);
      }

      // Assert - Check return value
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      // ✅ CRITICAL: Verify database state
      const dbRecord = await jobApplicationsRepository.getById(result.data!.applicationId);
      expect(dbRecord).not.toBeNull();
      expect(dbRecord!.status).toBe('applied');
      expect(dbRecord!.candidateId).toBe(TEST_CANDIDATE_ID);
      expect(dbRecord!.jobId).toBe(TEST_JOB_ID);
      expect(dbRecord!.companyId).toBe(TEST_COMPANY_ID);

      // Track for cleanup
      testIds.push({ collection: 'web_job_applications', id: result.data!.applicationId });
    });

    it('should set correct status to "applied"', async () => {
      // Arrange
      const input = { jobId: TEST_JOB_ID };

      // Act
      const result = await submitApplication(input, TEST_CANDIDATE_ID);

      // Assert - ✅ Verify DB state
      const dbRecord = await jobApplicationsRepository.getById(result.data!.applicationId);
      expect(dbRecord).not.toBeNull();
      expect(dbRecord!.status).toBe('applied');

      testIds.push({ collection: 'web_job_applications', id: result.data!.applicationId });
    });

    it('should set correct timestamps (createdAt, updatedAt)', async () => {
      // Arrange
      const input = { jobId: TEST_JOB_ID };

      // Act
      const result = await submitApplication(input, TEST_CANDIDATE_ID);

      // Assert - ✅ Verify DB state
      const dbRecord = await jobApplicationsRepository.getById(result.data!.applicationId);

      expect(dbRecord).not.toBeNull();

      // Verify timestamps exist and are valid numbers
      expect(dbRecord!.createdAt).toBeTypeOf('number');
      expect(dbRecord!.updatedAt).toBeTypeOf('number');
      expect(dbRecord!.createdAt).toBeGreaterThan(0);
      expect(dbRecord!.updatedAt).toBeGreaterThan(0);

      // Verify timestamps are recent (within last minute)
      const now = Date.now();
      const oneMinuteAgo = now - 60000;
      expect(dbRecord!.createdAt).toBeGreaterThan(oneMinuteAgo);
      expect(dbRecord!.updatedAt).toBeGreaterThan(oneMinuteAgo);

      // Verify createdAt and updatedAt are the same on creation
      expect(dbRecord!.createdAt).toBe(dbRecord!.updatedAt);

      testIds.push({ collection: 'web_job_applications', id: result.data!.applicationId });
    });

    it('should set correct references (jobId, candidateId, companyId)', async () => {
      // Arrange
      const input = { jobId: TEST_JOB_ID };

      // Act
      const result = await submitApplication(input, TEST_CANDIDATE_ID);

      // Assert - ✅ Verify DB state
      const dbRecord = await jobApplicationsRepository.getById(result.data!.applicationId);

      expect(dbRecord).not.toBeNull();
      expect(dbRecord!.jobId).toBe(TEST_JOB_ID);
      expect(dbRecord!.candidateId).toBe(TEST_CANDIDATE_ID);
      expect(dbRecord!.companyId).toBe(TEST_COMPANY_ID);

      testIds.push({ collection: 'web_job_applications', id: result.data!.applicationId });
    });
  });

  /**
   * DUPLICATE PREVENTION TESTS (2 tests)
   */
  describe('Duplicate Prevention', () => {
    it('should prevent duplicate application for same job', async () => {
      // Arrange - Create first application
      const input = { jobId: TEST_JOB_ID };
      const firstResult = await submitApplication(input, TEST_CANDIDATE_ID);
      expect(firstResult.success).toBe(true);
      testIds.push({ collection: 'web_job_applications', id: firstResult.data!.applicationId });

      // Act - Try to create duplicate
      const secondResult = await submitApplication(input, TEST_CANDIDATE_ID);

      // Assert - Should fail
      expect(secondResult.success).toBe(false);
      expect(secondResult.error).toBe('ALREADY_APPLIED');

      // ✅ Verify DB state - Only one application exists
      const allApps = await jobApplicationsRepository.getByFilter();
      const matchingApps = allApps?.filter(
        app => app.candidateId === TEST_CANDIDATE_ID && app.jobId === TEST_JOB_ID
      );
      expect(matchingApps?.length).toBe(1);
    });

    it('should allow reapply after withdraw', async () => {
      // Arrange - Create application, then withdraw
      const input = { jobId: TEST_JOB_ID };
      const firstResult = await submitApplication(input, TEST_CANDIDATE_ID);
      expect(firstResult.success).toBe(true);
      const firstAppId = firstResult.data!.applicationId;
      testIds.push({ collection: 'web_job_applications', id: firstAppId });

      // Withdraw the application
      await jobApplicationsRepository.update(
        firstAppId,
        {
          uid: firstAppId,
          jobId: TEST_JOB_ID,
          candidateId: TEST_CANDIDATE_ID,
          companyId: TEST_COMPANY_ID,
          companyName: 'Test Company',
          status: 'withdraw',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        actorId
      );

      // Act - Try to reapply
      const secondResult = await submitApplication(input, TEST_CANDIDATE_ID);

      // Assert - Should succeed
      expect(secondResult.success).toBe(true);
      expect(secondResult.data!.applicationId).not.toBe(firstAppId);

      // ✅ Verify DB state - Two applications exist (one withdrawn, one active)
      const allApps = await jobApplicationsRepository.getByFilter();
      const matchingApps = allApps?.filter(
        app => app.candidateId === TEST_CANDIDATE_ID && app.jobId === TEST_JOB_ID
      );
      expect(matchingApps?.length).toBe(2);
      expect(matchingApps?.some(app => app.status === 'withdraw')).toBe(true);
      expect(matchingApps?.some(app => app.status === 'applied')).toBe(true);

      testIds.push({ collection: 'web_job_applications', id: secondResult.data!.applicationId });
    });
  });

  /**
   * FIELD PERSISTENCE TESTS (3 tests)
   */
  describe('Field Persistence', () => {
    it('should persist optional fields (expectedSalary, headlines)', async () => {
      // Arrange
      const input = {
        jobId: TEST_JOB_ID,
        expectedSalary: 75000,
        headlines: 'Very interested in this position',
      };

      // Act
      const result = await submitApplication(input, TEST_CANDIDATE_ID);

      // Assert - ✅ Verify DB state
      const dbRecord = await jobApplicationsRepository.getById(result.data!.applicationId);
      expect(dbRecord).not.toBeNull();
      expect(dbRecord!.expectedSalary).toBe(75000);
      expect(dbRecord!.headlines).toBe('Very interested in this position');

      testIds.push({ collection: 'web_job_applications', id: result.data!.applicationId });
    });

    it('should apply default values (isNegotiable=true, overheadDays=0)', async () => {
      // Arrange - Don't provide optional fields
      const input = { jobId: TEST_JOB_ID };

      // Act
      const result = await submitApplication(input, TEST_CANDIDATE_ID);

      // Assert - ✅ Verify DB state has defaults
      const dbRecord = await jobApplicationsRepository.getById(result.data!.applicationId);
      expect(dbRecord).not.toBeNull();
      expect(dbRecord!.isNegotiable).toBe(true); // Default
      expect(dbRecord!.overheadDays).toBe(0); // Default
      expect(dbRecord!.headlines).toBe(''); // Default

      testIds.push({ collection: 'web_job_applications', id: result.data!.applicationId });
    });

    it('should handle null values correctly (expectedSalary=null)', async () => {
      // Arrange
      const input = {
        jobId: TEST_JOB_ID,
        expectedSalary: null,
      };

      // Act
      const result = await submitApplication(input, TEST_CANDIDATE_ID);

      // Assert - ✅ Verify DB state
      const dbRecord = await jobApplicationsRepository.getById(result.data!.applicationId);
      expect(dbRecord).not.toBeNull();
      expect(dbRecord!.expectedSalary).toBeNull();

      testIds.push({ collection: 'web_job_applications', id: result.data!.applicationId });
    });
  });

  /**
   * ADDITIONAL INTEGRATION SCENARIOS
   */
  describe('Integration Scenarios', () => {
    it('should create application with all fields and verify complete record', async () => {
      // Arrange
      const input = {
        jobId: TEST_JOB_ID,
        expectedSalary: 60000,
        isNegotiable: false,
        overheadDays: 15 as 0 | 7 | 15 | 30 | 60 | 90,
        headlines: 'Complete application test',
      };

      // Act
      const result = await submitApplication(input, TEST_CANDIDATE_ID);

      // Assert - ✅ Comprehensive DB verification
      const dbRecord = await jobApplicationsRepository.getById(result.data!.applicationId);
      expect(dbRecord).not.toBeNull();

      // Verify all fields
      expect(dbRecord!.uid).toBe(result.data!.applicationId);
      expect(dbRecord!.jobId).toBe(TEST_JOB_ID);
      expect(dbRecord!.candidateId).toBe(TEST_CANDIDATE_ID);
      expect(dbRecord!.companyId).toBe(TEST_COMPANY_ID);
      expect(dbRecord!.status).toBe('applied');
      expect(dbRecord!.expectedSalary).toBe(60000);
      expect(dbRecord!.isNegotiable).toBe(false);
      expect(dbRecord!.overheadDays).toBe(15);
      expect(dbRecord!.headlines).toBe('Complete application test');
      expect(dbRecord!.createdAt).toBeGreaterThan(0);
      expect(dbRecord!.updatedAt).toBeGreaterThan(0);

      testIds.push({ collection: 'web_job_applications', id: result.data!.applicationId });
    });
  });
});
