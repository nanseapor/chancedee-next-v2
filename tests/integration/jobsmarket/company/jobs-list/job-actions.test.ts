import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  webJobPublish,
  webJobUnpublish,
  webJobClose,
  webJobDelete,
  webJobDuplicate,
} from '@/lib/database/actions/jobs';

/**
 * Integration tests for job management server actions
 * Uses real dev database - NOT Firebase emulator
 */

describe('Job Actions Integration', () => {
  const testCompanyId = 'test-company-integration';
  let testJobId: string;

  beforeEach(async () => {
    // Create a test job in draft status
    const { webJobCreate } = await import('@/lib/database/actions/jobs');
    const result = await webJobCreate({
      companyId: testCompanyId,
      title: 'Integration Test Job',
      jobStatus: 'draft',
      isActive: false,
      applicationCount: 0,
      unreadApplicationCount: 0,
      viewCount: 0,
    });
    testJobId = result.data!.uid;
  });

  afterEach(async () => {
    // Clean up test data
    if (testJobId) {
      const { webJobDelete } = await import('@/lib/database/actions/jobs');
      await webJobDelete(testJobId);
    }
  });

  it('webJobPublish transitions job from draft to published', async () => {
    const result = await webJobPublish(testJobId);

    expect(result.success).toBe(true);

    // Verify job status changed in database
    const { webJobGetById } = await import('@/lib/database/actions/jobs');
    const job = await webJobGetById(testJobId);
    expect(job.data?.jobStatus).toBe('published');
    expect(job.data?.isActive).toBe(true);
  });

  it('webJobUnpublish transitions job from published to unpublished', async () => {
    // First publish the job
    await webJobPublish(testJobId);

    // Then unpublish it
    const result = await webJobUnpublish(testJobId);

    expect(result.success).toBe(true);

    // Verify job status changed
    const { webJobGetById } = await import('@/lib/database/actions/jobs');
    const job = await webJobGetById(testJobId);
    expect(job.data?.jobStatus).toBe('unpublished');
    expect(job.data?.isActive).toBe(false);
  });

  it('webJobClose transitions job to closed status', async () => {
    // Publish first (can only close published/unpublished jobs)
    await webJobPublish(testJobId);

    const result = await webJobClose(testJobId);

    expect(result.success).toBe(true);

    // Verify job status changed
    const { webJobGetById } = await import('@/lib/database/actions/jobs');
    const job = await webJobGetById(testJobId);
    expect(job.data?.jobStatus).toBe('closed');
    expect(job.data?.isActive).toBe(false);
  });

  it('webJobDelete removes job only if draft with no applications', async () => {
    const result = await webJobDelete(testJobId);

    expect(result.success).toBe(true);

    // Verify job is deleted
    const { webJobGetById } = await import('@/lib/database/actions/jobs');
    const job = await webJobGetById(testJobId);
    expect(job.data).toBeNull();

    testJobId = ''; // Prevent cleanup from trying to delete again
  });

  it('webJobDuplicate creates copy of job in draft status', async () => {
    const result = await webJobDuplicate(testJobId);

    expect(result.success).toBe(true);
    expect(result.data?.uid).toBeDefined();
    expect(result.data?.uid).not.toBe(testJobId);

    // Verify duplicated job
    const { webJobGetById } = await import('@/lib/database/actions/jobs');
    const duplicatedJob = await webJobGetById(result.data!.uid);
    expect(duplicatedJob.data?.title).toBe('Integration Test Job (สำเนา)');
    expect(duplicatedJob.data?.jobStatus).toBe('draft');
    expect(duplicatedJob.data?.applicationCount).toBe(0);

    // Clean up duplicated job
    const { webJobDelete } = await import('@/lib/database/actions/jobs');
    await webJobDelete(result.data!.uid);
  });
});
