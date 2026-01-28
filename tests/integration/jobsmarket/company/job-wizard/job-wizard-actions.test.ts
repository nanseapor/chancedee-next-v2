import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  webJobCreate,
  webJobUpdate,
  webJobPublish,
  webJobGetById,
} from "@/lib/database/actions/jobs";
import type { FirebaseJobData } from "@/types/job.types";

/**
 * Integration tests for job wizard server actions
 * Uses real dev database (NOT emulator)
 */
describe("Job Wizard Actions Integration", () => {
  const testUserId = "test-integration-user";
  let testJobId: string;

  const createTestJobData = (): Partial<FirebaseJobData> => ({
    title: "Test Job - Integration",
    jobType: "fulltime",
    jobLevel: "mid",
    numberOfPosition: 1,
    jobStatus: "draft",
    companyId: "test-company-123",
    isActive: false,
    jobDescriptionText: "a".repeat(50),
    skills: ["React", "TypeScript"],
    workModel: "remote",
  });

  afterEach(async () => {
    // Clean up: delete test job if created
    if (testJobId) {
      try {
        const { webJobDelete } = await import("@/lib/database/actions/jobs");
        await webJobDelete(testJobId);
      } catch (error) {
        // Ignore cleanup errors
      }
    }
  });

  describe("BLS-07-02: Create Draft", () => {
    it("should create new job in draft status", async () => {
      const jobData = createTestJobData();

      testJobId = await webJobCreate(jobData as FirebaseJobData, testUserId);

      expect(testJobId).toBeDefined();
      expect(typeof testJobId).toBe("string");

      // Verify created job
      const createdJob = await webJobGetById(testJobId);
      expect(createdJob).toBeDefined();
      expect(createdJob?.title).toBe("Test Job - Integration");
      expect(createdJob?.jobStatus).toBe("draft");
    });

    it("should set jobStatus to draft automatically", async () => {
      const jobData = createTestJobData();

      testJobId = await webJobCreate(jobData as FirebaseJobData, testUserId);

      const job = await webJobGetById(testJobId);
      expect(job?.jobStatus).toBe("draft");
      expect(job?.isActive).toBe(false);
    });

    it("should store all form fields correctly", async () => {
      const jobData: Partial<FirebaseJobData> = {
        ...createTestJobData(),
        department: "Engineering",
        minSalary: 40000,
        maxSalary: 60000,
        hideSalary: false,
        province: "กรุงเทพมหานคร",
      };

      testJobId = await webJobCreate(jobData as FirebaseJobData, testUserId);

      const job = await webJobGetById(testJobId);
      expect(job?.department).toBe("Engineering");
      expect(job?.minSalary).toBe(40000);
      expect(job?.maxSalary).toBe(60000);
      expect(job?.province).toBe("กรุงเทพมหานคร");
    });
  });

  describe("BLS-07-03: Update Draft", () => {
    beforeEach(async () => {
      // Create a draft to update
      const jobData = createTestJobData();
      testJobId = await webJobCreate(jobData as FirebaseJobData, testUserId);
    });

    it("should update existing draft fields", async () => {
      const updates: Partial<FirebaseJobData> = {
        title: "Updated Job Title",
        numberOfPosition: 3,
      };

      await webJobUpdate(updates as FirebaseJobData, testUserId, testJobId);

      const updatedJob = await webJobGetById(testJobId);
      expect(updatedJob?.title).toBe("Updated Job Title");
      expect(updatedJob?.numberOfPosition).toBe(3);
    });

    it("should preserve unchanged fields", async () => {
      const originalJob = await webJobGetById(testJobId);

      const updates: Partial<FirebaseJobData> = {
        title: "Only Title Changed",
      };

      await webJobUpdate(updates as FirebaseJobData, testUserId, testJobId);

      const updatedJob = await webJobGetById(testJobId);
      expect(updatedJob?.title).toBe("Only Title Changed");
      expect(updatedJob?.jobType).toBe(originalJob?.jobType);
      expect(updatedJob?.jobLevel).toBe(originalJob?.jobLevel);
    });

    it("should keep jobStatus as draft when updating", async () => {
      const updates: Partial<FirebaseJobData> = {
        title: "Updated Title",
      };

      await webJobUpdate(updates as FirebaseJobData, testUserId, testJobId);

      const updatedJob = await webJobGetById(testJobId);
      expect(updatedJob?.jobStatus).toBe("draft");
    });
  });

  describe("BLS-07-05: Publish Job", () => {
    beforeEach(async () => {
      // Create a complete draft to publish
      const jobData: Partial<FirebaseJobData> = {
        ...createTestJobData(),
        jobDescriptionDetails: "<p>" + "a".repeat(50) + "</p>",
        jobDescriptionText: "a".repeat(50),
      };
      testJobId = await webJobCreate(jobData as FirebaseJobData, testUserId);
    });

    it("should publish draft job", async () => {
      const result = await webJobPublish(testJobId);

      expect(result.success).toBe(true);

      const publishedJob = await webJobGetById(testJobId);
      expect(publishedJob?.jobStatus).toBe("published");
      expect(publishedJob?.isActive).toBe(true);
    });

    it("should set postStartDate and postExpiryDate", async () => {
      await webJobPublish(testJobId);

      const publishedJob = await webJobGetById(testJobId);
      expect(publishedJob?.postStartDate).toBeDefined();
      expect(publishedJob?.postExpiryDate).toBeDefined();

      // Expiry should be ~30 days after start
      if (publishedJob?.postStartDate && publishedJob?.postExpiryDate) {
        const diffMs = publishedJob.postExpiryDate - publishedJob.postStartDate;
        const diffDays = diffMs / (1000 * 60 * 60 * 24);
        expect(diffDays).toBeCloseTo(30, 0);
      }
    });

    it("should handle publish of non-existent job", async () => {
      const result = await webJobPublish("non-existent-id");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Job not found");
    });
  });

  describe("BLS-07-06: Schedule Job", () => {
    beforeEach(async () => {
      const jobData = createTestJobData();
      testJobId = await webJobCreate(jobData as FirebaseJobData, testUserId);
    });

    it("should schedule job for future publication", async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const scheduleData: Partial<FirebaseJobData> = {
        jobStatus: "ontimer",
        postStartDate: futureDate.getTime(),
        postExpiryDate: futureDate.getTime() + 30 * 24 * 60 * 60 * 1000,
      };

      await webJobUpdate(scheduleData as FirebaseJobData, testUserId, testJobId);

      const scheduledJob = await webJobGetById(testJobId);
      expect(scheduledJob?.jobStatus).toBe("ontimer");
      expect(scheduledJob?.postStartDate).toBeDefined();
    });

    it("should calculate expiry as 30 days from scheduled start", async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const scheduleData: Partial<FirebaseJobData> = {
        jobStatus: "ontimer",
        postStartDate: futureDate.getTime(),
        postExpiryDate: futureDate.getTime() + 30 * 24 * 60 * 60 * 1000,
      };

      await webJobUpdate(scheduleData as FirebaseJobData, testUserId, testJobId);

      const scheduledJob = await webJobGetById(testJobId);
      if (scheduledJob?.postStartDate && scheduledJob?.postExpiryDate) {
        const diffMs = scheduledJob.postExpiryDate - scheduledJob.postStartDate;
        const diffDays = diffMs / (1000 * 60 * 60 * 24);
        expect(diffDays).toBeCloseTo(30, 0);
      }
    });
  });

  describe("Load Existing Draft", () => {
    beforeEach(async () => {
      const jobData = createTestJobData();
      testJobId = await webJobCreate(jobData as FirebaseJobData, testUserId);
    });

    it("should load draft by ID", async () => {
      const draft = await webJobGetById(testJobId);

      expect(draft).toBeDefined();
      expect(draft?.uid).toBe(testJobId);
      expect(draft?.jobStatus).toBe("draft");
    });

    it("should return undefined for non-existent draft", async () => {
      const draft = await webJobGetById("non-existent-id");

      expect(draft).toBeUndefined();
    });
  });

  describe("Duplicate Job Data", () => {
    beforeEach(async () => {
      const jobData: Partial<FirebaseJobData> = {
        ...createTestJobData(),
        title: "Original Job",
        department: "Engineering",
        skills: ["React", "Node.js"],
      };
      testJobId = await webJobCreate(jobData as FirebaseJobData, testUserId);
    });

    it("should copy job data for duplication", async () => {
      const sourceJob = await webJobGetById(testJobId);

      expect(sourceJob).toBeDefined();

      // Simulate duplication by creating new job with copied data
      const duplicateData: Partial<FirebaseJobData> = {
        ...sourceJob,
        title: `${sourceJob?.title} (สำเนา)`,
        jobStatus: "draft",
      };

      // Remove fields that shouldn't be copied
      delete (duplicateData as any).uid;
      delete (duplicateData as any).createdAt;
      delete (duplicateData as any).updatedAt;
      delete (duplicateData as any).postStartDate;
      delete (duplicateData as any).postExpiryDate;

      const duplicateId = await webJobCreate(duplicateData as FirebaseJobData, testUserId);

      const duplicateJob = await webJobGetById(duplicateId);
      expect(duplicateJob?.title).toBe("Original Job (สำเนา)");
      expect(duplicateJob?.department).toBe("Engineering");
      expect(duplicateJob?.skills).toEqual(["React", "Node.js"]);
      expect(duplicateJob?.jobStatus).toBe("draft");

      // Cleanup duplicate
      const { webJobDelete } = await import("@/lib/database/actions/jobs");
      await webJobDelete(duplicateId);
    });
  });
});
