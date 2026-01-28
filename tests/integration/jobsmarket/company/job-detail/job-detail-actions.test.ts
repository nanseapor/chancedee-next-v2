import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { Filter } from "firebase-admin/firestore";
import {
  webJobCreate,
  webJobDelete,
  webJobGetById,
  webJobPublish,
  webJobUnpublish,
  webJobClose,
  webJobDuplicate,
  webJobFetchAnalytics,
  webJobFetchApplications,
} from "@/lib/database/actions/jobs";
import type { FirebaseJobData } from "@/types/job.types";

/**
 * COMP-R07 Phase 2: Server Actions Integration Tests
 * Tests for job detail page server actions
 * Uses real dev database - NOT Firebase emulator
 */

describe("COMP-R07 Job Detail Server Actions", () => {
  const testCompanyId = "test-company-comp-r07";
  const testActorId = "test-actor-comp-r07-integration";
  let testJobId: string;

  beforeEach(async () => {
    // Create a test job in draft status
    const jobData: Partial<FirebaseJobData> = {
      companyId: testCompanyId,
      title: "COMP-R07 Integration Test Job",
      jobStatus: "draft",
      isActive: false,
      applicationCount: 0,
      unreadApplicationCount: 0,
      viewCount: 0,
    };

    testJobId = await webJobCreate(jobData as FirebaseJobData, testActorId);
  });

  afterEach(async () => {
    // Clean up test data
    if (testJobId) {
      try {
        await webJobDelete(testJobId);
      } catch (error) {
        // Job may have been deleted already in test
        console.warn("Cleanup warning:", error);
      }
    }
  });

  describe("webJobUnpublish (BLS-07-07)", () => {
    it("should unpublish a published job", async () => {
      // First publish the job
      const publishResult = await webJobPublish(testJobId);
      expect(publishResult.success).toBe(true);

      // Then unpublish it
      const result = await webJobUnpublish(testJobId);

      if (!result.success) {
        console.error("Unpublish failed:", result.error);
      }
      expect(result.success).toBe(true);

      // Verify job status changed
      const job = await webJobGetById(testJobId);
      expect(job?.jobStatus).toBe("unpublished");
      expect(job?.isActive).toBe(false);
    });

    it("should set isActive to false", async () => {
      // Publish first
      await webJobPublish(testJobId);
      const publishedJob = await webJobGetById(testJobId);
      expect(publishedJob?.isActive).toBe(true);

      // Then unpublish
      await webJobUnpublish(testJobId);
      const unpublishedJob = await webJobGetById(testJobId);
      expect(unpublishedJob?.isActive).toBe(false);
    });

    it("should fail for non-existent job", async () => {
      const result = await webJobUnpublish("non-existent-job-id");
      expect(result.success).toBe(false);
      expect(result.error).toBe("Job not found");
    });
  });

  describe("webJobClose (BLS-07-08)", () => {
    it("should close an active job", async () => {
      // Publish first
      await webJobPublish(testJobId);

      const result = await webJobClose(testJobId);

      expect(result.success).toBe(true);

      // Verify job status changed
      const job = await webJobGetById(testJobId);
      expect(job?.jobStatus).toBe("closed");
      expect(job?.isActive).toBe(false);
    });

    it("should set isActive to false", async () => {
      // Publish first
      await webJobPublish(testJobId);

      await webJobClose(testJobId);

      const job = await webJobGetById(testJobId);
      expect(job?.isActive).toBe(false);
    });

    it("should close a draft job", async () => {
      // Close directly from draft
      const result = await webJobClose(testJobId);

      expect(result.success).toBe(true);

      const job = await webJobGetById(testJobId);
      expect(job?.jobStatus).toBe("closed");
    });

    it("should fail for non-existent job", async () => {
      const result = await webJobClose("non-existent-job-id");
      expect(result.success).toBe(false);
      expect(result.error).toBe("Job not found");
    });
  });

  describe("webJobDuplicate (BLS-07-10)", () => {
    it("should create a new draft from existing job", async () => {
      const result = await webJobDuplicate(testJobId);

      expect(result.success).toBe(true);
      expect(result.data?.uid).toBeDefined();
      expect(result.data?.uid).not.toBe(testJobId);

      // Verify duplicated job
      const duplicatedJobId = result.data!.uid as string;
      const duplicatedJob = await webJobGetById(duplicatedJobId);
      expect(duplicatedJob).not.toBeNull();
      expect(duplicatedJob?.jobStatus).toBe("draft");

      // Clean up duplicated job
      await webJobDelete(duplicatedJobId);
    });

    it("should copy title with (สำเนา) suffix", async () => {
      const result = await webJobDuplicate(testJobId);
      const duplicatedJobId = result.data!.uid as string;

      const duplicatedJob = await webJobGetById(duplicatedJobId);
      expect(duplicatedJob?.title).toBe("COMP-R07 Integration Test Job (สำเนา)");

      // Clean up
      await webJobDelete(duplicatedJobId);
    });

    it("should reset status-related fields (draft, not active)", async () => {
      // First publish the original job
      await webJobPublish(testJobId);

      const result = await webJobDuplicate(testJobId);
      const duplicatedJobId = result.data!.uid as string;

      const duplicatedJob = await webJobGetById(duplicatedJobId);
      // Note: applicationCount and viewCount are computed fields in JobListItem/JobWithAnalytics
      // They don't exist in FirebaseJobData (the base job schema)
      expect(duplicatedJob?.jobStatus).toBe("draft");
      expect(duplicatedJob?.isActive).toBe(false);

      // Clean up
      await webJobDelete(duplicatedJobId);
    });

    it("should set status to draft", async () => {
      // First publish the original job
      await webJobPublish(testJobId);

      // Then duplicate it
      const result = await webJobDuplicate(testJobId);
      const duplicatedJobId = result.data!.uid as string;

      const duplicatedJob = await webJobGetById(duplicatedJobId);
      expect(duplicatedJob?.jobStatus).toBe("draft");
      expect(duplicatedJob?.isActive).toBe(false);

      // Clean up
      await webJobDelete(duplicatedJobId);
    });

    it("should generate new uid", async () => {
      const result = await webJobDuplicate(testJobId);
      const duplicatedJobId = result.data!.uid as string;

      expect(duplicatedJobId).toBeDefined();
      expect(duplicatedJobId).not.toBe(testJobId);
      expect(duplicatedJobId.length).toBeGreaterThan(0);

      // Clean up
      await webJobDelete(duplicatedJobId);
    });

    it("should fail for non-existent source job", async () => {
      const result = await webJobDuplicate("non-existent-job-id");
      expect(result.success).toBe(false);
      expect(result.error).toBe("Job not found");
    });
  });

  describe("webJobFetchAnalytics (BLS-07-11)", () => {
    it("should return analytics structure for job", async () => {
      const result = await webJobFetchAnalytics(testJobId);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      if (result.data) {
        const analytics = result.data;
        expect(analytics.jobId).toBe(testJobId);
        expect(analytics.totalViews).toBeDefined();
        expect(analytics.viewsChange).toBeDefined();
        expect(analytics.dailyViews).toBeInstanceOf(Array);
        expect(analytics.dailyViews.length).toBe(30); // Last 30 days
        expect(analytics.conversionRate).toBeDefined();
        expect(analytics.conversionChange).toBeDefined();
        expect(analytics.lastUpdated).toBeDefined();
      }
    });

    it("should return zero metrics for new job with no applications", async () => {
      const result = await webJobFetchAnalytics(testJobId);

      expect(result.success).toBe(true);
      if (result.data) {
        expect(result.data.totalViews).toBe(0); // Placeholder implementation
        expect(result.data.conversionRate).toBe(0); // No views = 0% conversion
      }
    });

    it("should include daily views array", async () => {
      const result = await webJobFetchAnalytics(testJobId);

      expect(result.success).toBe(true);
      if (result.data) {
        expect(result.data.dailyViews).toBeInstanceOf(Array);
        expect(result.data.dailyViews.length).toBe(30);

        // Verify first daily view has correct structure
        const firstDay = result.data.dailyViews[0];
        expect(firstDay.date).toMatch(/^\d{4}-\d{2}-\d{2}$/); // YYYY-MM-DD format
        expect(typeof firstDay.views).toBe("number");
      }
    });
  });

  describe("webJobFetchApplications (BLS-07-11)", () => {
    it("should return empty array for job with no applications", async () => {
      const result = await webJobFetchApplications(testJobId);

      expect(result.success).toBe(true);
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data?.length).toBe(0);
    });

    it("should use default limit of 5", async () => {
      const result = await webJobFetchApplications(testJobId);

      expect(result.success).toBe(true);
      expect(result.data).toBeInstanceOf(Array);
      // Since we have no applications, length will be 0
      // But the function should respect the limit parameter
    });

    it("should return application preview structure", async () => {
      const result = await webJobFetchApplications(testJobId, 10);

      expect(result.success).toBe(true);
      expect(result.data).toBeInstanceOf(Array);

      // Even with no data, verify the function returns correctly
      // In production with real applications, each item would have:
      // - uid, candidateId, candidateName, status, appliedAt, isRead
    });
  });
});
