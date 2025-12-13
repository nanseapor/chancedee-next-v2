/**
 * Integration Tests for jobs and job-applications actions
 * Tests job posting CRUD, job application lifecycle, and filtering
 */

import { describe, it, expect, afterEach } from "vitest";
import {
  webJobCreate,
  webJobGetById,
  webJobGetByFilter,
  webJobUpdate,
  webJobDelete,
  webJobGenerateId,
} from "@/lib/database/actions/jobs";
import {
  webJobApplicationCreate,
  webJobApplicationGetById,
  webJobApplicationGetByFilter,
  webJobApplicationUpdate,
  webJobApplicationDelete,
} from "@/lib/database/actions/job-applications";
import { MasterJobApplicationStatuses } from "@/constants/application";
import { generateTestId, cleanupTestData, cleanupMultipleTestData, getTestActorId, createWhereFilter, createDocRefFilter } from "../test-utils";

describe("jobs actions (integration)", () => {
  const testIds: Array<{ collection: string; docId: string }> = [];
  const actorId = getTestActorId();

  afterEach(async () => {
    await cleanupMultipleTestData(testIds);
    testIds.length = 0;
  });

  it("should create and read job posting", async () => {
    const testId = generateTestId("job");
    testIds.push({ collection: "jobs", docId: testId });

    const companyId = generateTestId("company");

    // Create - using correct schema fields
    const createdId = await webJobCreate(
      {
        uid: testId,
        companyId,
        companyName: "Tech Company Ltd.",
        companyLogo: "https://example.com/logo.png",
        title: "Senior Software Engineer",
        jobDescriptionDetails: "We are looking for an experienced software engineer",
        qualificationDetails: "5+ years experience with TypeScript and React",
        phone: "021234567",
        email: "hr@techcompany.com",
        addressLine1: "123 Tech Street",
        district: "Pathum Wan",
        subDistrict: "Lumphini",
        postCode: "10330",
        province: "Bangkok",
        isNegotiable: true,
        minSalary: 60000,
        maxSalary: 100000,
        positions: 2,
        isOnlineInterview: true,
        isAcceptNewGrads: false,
        jobStatus: "published",
        isActive: true,
        createdBy: actorId,
        updatedBy: actorId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      actorId,
      testId
    );

    expect(createdId).toBe(testId);

    // Read
    const retrieved = await webJobGetById(testId);

    expect(retrieved).toBeDefined();
    expect(retrieved?.uid).toBe(testId);
    expect(retrieved?.title).toBe("Senior Software Engineer");
    expect(retrieved?.minSalary).toBe(60000);
    expect(retrieved?.positions).toBe(2);
    expect(retrieved?.isNegotiable).toBe(true);
    expect(retrieved?.jobStatus).toBe("published");
  }, 30000);

  it("should update job posting", async () => {
    const testId = generateTestId("job");
    testIds.push({ collection: "jobs", docId: testId });

    const companyId = generateTestId("company");

    // Create
    await webJobCreate(
      {
        uid: testId,
        companyId,
        companyName: "Startup Co.",
        companyLogo: "https://example.com/logo.png",
        title: "Junior Developer",
        jobDescriptionDetails: "Entry level position",
        phone: "021234567",
        email: "hr@startup.com",
        addressLine1: "456 Startup Lane",
        district: "Bang Rak",
        subDistrict: "Silom",
        postCode: "10500",
        province: "Bangkok",
        isNegotiable: false,
        minSalary: 30000,
        maxSalary: 40000,
        isOnlineInterview: false,
        isAcceptNewGrads: true,
        jobStatus: "draft",
        isActive: true,
        createdBy: actorId,
        updatedBy: actorId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      actorId,
      testId
    );

    // Update
    await webJobUpdate(
      {
        uid: testId,
        companyId,
        companyName: "Startup Co.",
        companyLogo: "https://example.com/logo.png",
        title: "Mid-Level Developer",
        jobDescriptionDetails: "Looking for mid-level developer",
        phone: "021234567",
        email: "hr@startup.com",
        addressLine1: "456 Startup Lane",
        district: "Bang Rak",
        subDistrict: "Silom",
        postCode: "10500",
        province: "Bangkok",
        isNegotiable: true,
        minSalary: 45000,
        maxSalary: 60000,
        careerLevel: "Mid-Level",
        isOnlineInterview: false,
        isAcceptNewGrads: false,
        jobStatus: "published",
        isActive: true,
        createdBy: actorId,
        updatedBy: actorId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      actorId,
      testId
    );

    // Read
    const retrieved = await webJobGetById(testId);

    expect(retrieved?.title).toBe("Mid-Level Developer");
    expect(retrieved?.minSalary).toBe(45000);
    expect(retrieved?.careerLevel).toBe("Mid-Level");
    expect(retrieved?.jobStatus).toBe("published");
  }, 30000);

  it("should generate unique job ID", async () => {
    const generatedId1 = await webJobGenerateId();
    const generatedId2 = await webJobGenerateId();

    expect(generatedId1).toBeDefined();
    expect(generatedId2).toBeDefined();
    expect(generatedId1).not.toBe(generatedId2);
  }, 30000);

  it("should filter jobs by province", async () => {
    const testId = generateTestId("job");
    testIds.push({ collection: "jobs", docId: testId });

    const companyId = generateTestId("company");

    // Create
    await webJobCreate(
      {
        uid: testId,
        companyId,
        companyName: "Remote Company",
        companyLogo: "https://example.com/logo.png",
        title: "Remote Developer",
        jobDescriptionDetails: "Work from anywhere",
        phone: "021234567",
        email: "hr@remote.com",
        addressLine1: "Remote Office",
        district: "Remote",
        subDistrict: "Remote",
        postCode: "00000",
        province: "Chiang Mai",
        isNegotiable: true,
        isOnlineInterview: true,
        isAcceptNewGrads: true,
        jobStatus: "published",
        isActive: true,
        createdBy: actorId,
        updatedBy: actorId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      actorId,
      testId
    );

    // Filter
    const results = await webJobGetByFilter(
      createWhereFilter("province", "==", "Chiang Mai")
    );

    expect(results).toBeDefined();
    const testRecord = results!.find(r => r.uid === testId);
    expect(testRecord).toBeDefined();
    expect(testRecord?.province).toBe("Chiang Mai");
  }, 30000);

  it("should filter active jobs", async () => {
    const testId = generateTestId("job");
    testIds.push({ collection: "jobs", docId: testId });

    const companyId = generateTestId("company");

    // Create
    await webJobCreate(
      {
        uid: testId,
        companyId,
        companyName: "Active Corp",
        companyLogo: "https://example.com/logo.png",
        title: "Active Position",
        jobDescriptionDetails: "This job is active",
        phone: "021234567",
        email: "hr@active.com",
        addressLine1: "123 Active Street",
        district: "Pathum Wan",
        subDistrict: "Lumphini",
        postCode: "10330",
        province: "Bangkok",
        isNegotiable: false,
        isOnlineInterview: true,
        isAcceptNewGrads: false,
        jobStatus: "published",
        isActive: true,
        createdBy: actorId,
        updatedBy: actorId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      actorId,
      testId
    );

    // Filter
    const results = await webJobGetByFilter(
      createWhereFilter("is_active", "==", true)
    );

    expect(results).toBeDefined();
    const testRecord = results!.find(r => r.uid === testId);
    expect(testRecord).toBeDefined();
    expect(testRecord?.isActive).toBe(true);
  }, 30000);

  it("should delete job posting", async () => {
    const testId = generateTestId("job");
    testIds.push({ collection: "jobs", docId: testId });

    const companyId = generateTestId("company");

    // Create
    await webJobCreate(
      {
        uid: testId,
        companyId,
        companyName: "Delete Corp",
        companyLogo: "https://example.com/logo.png",
        title: "Delete Me",
        jobDescriptionDetails: "This will be deleted",
        phone: "021234567",
        email: "hr@delete.com",
        addressLine1: "123 Delete Street",
        district: "Pathum Wan",
        subDistrict: "Lumphini",
        postCode: "10330",
        province: "Bangkok",
        isNegotiable: false,
        isOnlineInterview: false,
        isAcceptNewGrads: false,
        jobStatus: "draft",
        isActive: true,
        createdBy: actorId,
        updatedBy: actorId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      actorId,
      testId
    );

    // Verify it exists
    let retrieved = await webJobGetById(testId);
    expect(retrieved).toBeDefined();

    // Delete
    await webJobDelete(testId);

    // Verify it's deleted
    retrieved = await webJobGetById(testId);
    expect(retrieved).toBeNull();
  }, 30000);
});

describe("job-applications actions (integration)", () => {
  const testIds: Array<{ collection: string; docId: string }> = [];
  const actorId = getTestActorId();

  afterEach(async () => {
    await cleanupMultipleTestData(testIds);
    testIds.length = 0;
  });

  it("should create and read job application", async () => {
    const testId = generateTestId("job_app");
    testIds.push({ collection: "job_applications", docId: testId });

    const jobId = generateTestId("job");
    const candidateId = generateTestId("candidate");
    const companyId = generateTestId("company");

    // Create
    const createdId = await webJobApplicationCreate(
      {
        uid: testId,
        jobId,
        candidateId,
        companyId,
        companyName: "Tech Company Ltd.",
        status: MasterJobApplicationStatuses.new,
        expectedSalary: 50000,
        overheadDays: 30,
        headlines: "I am interested in this position",
        isNegotiable: true,
        createdBy: actorId,
        updatedBy: actorId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      actorId,
      testId
    );

    expect(createdId).toBe(testId);

    // Read
    const retrieved = await webJobApplicationGetById(testId);

    expect(retrieved).toBeDefined();
    expect(retrieved?.uid).toBe(testId);
    expect(retrieved?.jobId).toBe(jobId);
    expect(retrieved?.candidateId).toBe(candidateId);
    expect(retrieved?.companyId).toBe(companyId);
    expect(retrieved?.status).toBe(MasterJobApplicationStatuses.new);
    expect(retrieved?.expectedSalary).toBe(50000);
  }, 30000);

  it("should update job application status", async () => {
    const testId = generateTestId("job_app");
    testIds.push({ collection: "job_applications", docId: testId });

    const jobId = generateTestId("job");
    const candidateId = generateTestId("candidate");
    const companyId = generateTestId("company");

    // Create
    await webJobApplicationCreate(
      {
        uid: testId,
        jobId,
        candidateId,
        companyId,
        companyName: "Tech Company Ltd.",
        status: MasterJobApplicationStatuses.new,
        createdBy: actorId,
        updatedBy: actorId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      actorId,
      testId
    );

    // Update to ACCEPTED
    await webJobApplicationUpdate(
      {
        uid: testId,
        jobId,
        candidateId,
        companyId,
        companyName: "Tech Company Ltd.",
        status: MasterJobApplicationStatuses.accepted,
        createdBy: actorId,
        updatedBy: actorId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      actorId,
      testId
    );

    // Read
    const retrieved = await webJobApplicationGetById(testId);

    expect(retrieved?.status).toBe(MasterJobApplicationStatuses.accepted);
  }, 30000);

  it("should filter applications by job ID", async () => {
    const testId = generateTestId("job_app");
    testIds.push({ collection: "job_applications", docId: testId });

    const jobId = generateTestId("job_unique");
    const candidateId = generateTestId("candidate");
    const companyId = generateTestId("company");

    // Create
    await webJobApplicationCreate(
      {
        uid: testId,
        jobId,
        candidateId,
        companyId,
        companyName: "Tech Company Ltd.",
        status: MasterJobApplicationStatuses.new,
        createdBy: actorId,
        updatedBy: actorId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      actorId,
      testId
    );

    // Filter - use DocumentReference for job_id field
    const results = await webJobApplicationGetByFilter(
      createDocRefFilter("job_id", "jobs", jobId)
    );

    expect(results).toBeDefined();
    const testRecord = results!.find(r => r.uid === testId);
    expect(testRecord).toBeDefined();
    expect(testRecord?.jobId).toBe(jobId);
  }, 30000);

  it("should filter applications by status", async () => {
    const testId = generateTestId("job_app");
    testIds.push({ collection: "job_applications", docId: testId });

    const jobId = generateTestId("job");
    const candidateId = generateTestId("candidate");
    const companyId = generateTestId("company");

    // Create with SCHEDULED status
    await webJobApplicationCreate(
      {
        uid: testId,
        jobId,
        candidateId,
        companyId,
        companyName: "Tech Company Ltd.",
        status: MasterJobApplicationStatuses.scheduled,
        createdBy: actorId,
        updatedBy: actorId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      actorId,
      testId
    );

    // Filter
    const results = await webJobApplicationGetByFilter(
      createWhereFilter("status", "==", MasterJobApplicationStatuses.scheduled)
    );

    expect(results).toBeDefined();
    const testRecord = results!.find(r => r.uid === testId);
    expect(testRecord).toBeDefined();
    expect(testRecord?.status).toBe(MasterJobApplicationStatuses.scheduled);
  }, 30000);

  it("should filter applications by candidate ID", async () => {
    const testId = generateTestId("job_app");
    testIds.push({ collection: "job_applications", docId: testId });

    const jobId = generateTestId("job");
    const candidateId = generateTestId("candidate_unique");
    const companyId = generateTestId("company");

    // Create
    await webJobApplicationCreate(
      {
        uid: testId,
        jobId,
        candidateId,
        companyId,
        companyName: "Tech Company Ltd.",
        status: MasterJobApplicationStatuses.new,
        createdBy: actorId,
        updatedBy: actorId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      actorId,
      testId
    );

    // Filter - use DocumentReference for candidate_id field
    const results = await webJobApplicationGetByFilter(
      createDocRefFilter("candidate_id", "candidate_information", candidateId)
    );

    expect(results).toBeDefined();
    const testRecord = results!.find(r => r.uid === testId);
    expect(testRecord).toBeDefined();
    expect(testRecord?.candidateId).toBe(candidateId);
  }, 30000);

  it("should delete job application", async () => {
    const testId = generateTestId("job_app");
    testIds.push({ collection: "job_applications", docId: testId });

    const jobId = generateTestId("job");
    const candidateId = generateTestId("candidate");
    const companyId = generateTestId("company");

    // Create
    await webJobApplicationCreate(
      {
        uid: testId,
        jobId,
        candidateId,
        companyId,
        companyName: "Tech Company Ltd.",
        status: MasterJobApplicationStatuses.new,
        createdBy: actorId,
        updatedBy: actorId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      actorId,
      testId
    );

    // Verify it exists
    let retrieved = await webJobApplicationGetById(testId);
    expect(retrieved).toBeDefined();

    // Delete
    await webJobApplicationDelete(testId);

    // Verify it's deleted
    retrieved = await webJobApplicationGetById(testId);
    expect(retrieved).toBeNull();
  }, 30000);
});
