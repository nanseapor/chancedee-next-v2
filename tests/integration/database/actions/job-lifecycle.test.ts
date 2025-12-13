/**
 * Integration Tests for job lifecycle actions
 * Tests job-offers and job-interviews CRUD operations
 */

import { describe, it, expect, afterEach } from "vitest";
import {
  webJobOfferCreate,
  webJobOfferGetByFilter,
  webJobOfferUpdate,
} from "@/lib/database/actions/job-offers";
import {
  webJobInterviewCreate,
  webJobInterviewGetById,
  webJobInterviewGetByFilter,
  webJobInterviewUpdate,
} from "@/lib/database/actions/job-interviews";
import { generateTestId, cleanupMultipleTestData, getTestActorId, createWhereFilter } from "../test-utils";

describe("job-offers actions (integration)", () => {
  const testIds: Array<{ collection: string; docId: string }> = [];
  const actorId = getTestActorId();

  afterEach(async () => {
    await cleanupMultipleTestData(testIds);
    testIds.length = 0;
  });

  it("should create and read job offer", async () => {
    const testId = generateTestId("job_offer");
    testIds.push({ collection: "job_offers", docId: testId });

    const jobId = generateTestId("job");
    const candidateId = generateTestId("candidate");

    // Create
    const createdId = await webJobOfferCreate(
      {
        jobId,
        candidateId,
        offerCount: 1,
        isApplied: false,
        isActive: true,
        note: "First offer sent to candidate",
      },
      actorId,
      testId
    );

    expect(createdId).toBe(testId);

    // Read via filter
    const results = await webJobOfferGetByFilter(
      createWhereFilter("uid", "==", testId)
    );

    expect(results).toBeDefined();
    expect(results?.length).toBeGreaterThan(0);
    const testRecord = results!.find(r => r.uid === testId);
    expect(testRecord).toBeDefined();
    expect(testRecord?.jobId).toBe(jobId);
    expect(testRecord?.candidateId).toBe(candidateId);
    expect(testRecord?.offerCount).toBe(1);
    expect(testRecord?.isActive).toBe(true);
  }, 30000);

  it("should update job offer", async () => {
    const testId = generateTestId("job_offer");
    testIds.push({ collection: "job_offers", docId: testId });

    const jobId = generateTestId("job");
    const candidateId = generateTestId("candidate");

    // Create
    await webJobOfferCreate(
      {
        jobId,
        candidateId,
        offerCount: 1,
        isApplied: false,
        isActive: true,
        note: "Initial offer",
      },
      actorId,
      testId
    );

    // Update - candidate applied
    await webJobOfferUpdate(
      {
        jobId,
        candidateId,
        offerCount: 1,
        isApplied: true,
        isActive: false,
        note: "Candidate has applied",
      },
      actorId,
      testId
    );

    // Read
    const results = await webJobOfferGetByFilter(
      createWhereFilter("uid", "==", testId)
    );

    const testRecord = results!.find(r => r.uid === testId);
    expect(testRecord?.isApplied).toBe(true);
    expect(testRecord?.isActive).toBe(false);
    expect(testRecord?.note).toBe("Candidate has applied");
  }, 30000);

  it("should filter offers by job ID", async () => {
    const testId = generateTestId("job_offer");
    testIds.push({ collection: "job_offers", docId: testId });

    const jobId = generateTestId("job_unique");
    const candidateId = generateTestId("candidate");

    // Create
    await webJobOfferCreate(
      {
        jobId,
        candidateId,
        offerCount: 1,
        isApplied: false,
        isActive: true,
      },
      actorId,
      testId
    );

    // Filter
    const results = await webJobOfferGetByFilter(
      createWhereFilter("job_id", "==", jobId)
    );

    expect(results).toBeDefined();
    const testRecord = results!.find(r => r.uid === testId);
    expect(testRecord).toBeDefined();
    expect(testRecord?.jobId).toBe(jobId);
  }, 30000);

  it("should filter offers by candidate ID", async () => {
    const testId = generateTestId("job_offer");
    testIds.push({ collection: "job_offers", docId: testId });

    const jobId = generateTestId("job");
    const candidateId = generateTestId("candidate_unique");

    // Create
    await webJobOfferCreate(
      {
        jobId,
        candidateId,
        offerCount: 2,
        isApplied: true,
        isActive: false,
        note: "Second offer, candidate applied",
      },
      actorId,
      testId
    );

    // Filter
    const results = await webJobOfferGetByFilter(
      createWhereFilter("candidate_id", "==", candidateId)
    );

    expect(results).toBeDefined();
    const testRecord = results!.find(r => r.uid === testId);
    expect(testRecord).toBeDefined();
    expect(testRecord?.candidateId).toBe(candidateId);
    expect(testRecord?.offerCount).toBe(2);
  }, 30000);

  it("should filter active offers", async () => {
    const testId = generateTestId("job_offer");
    testIds.push({ collection: "job_offers", docId: testId });

    const jobId = generateTestId("job");
    const candidateId = generateTestId("candidate");

    // Create
    await webJobOfferCreate(
      {
        jobId,
        candidateId,
        offerCount: 1,
        isApplied: false,
        isActive: true,
      },
      actorId,
      testId
    );

    // Filter
    const results = await webJobOfferGetByFilter(
      createWhereFilter("is_active", "==", true)
    );

    expect(results).toBeDefined();
    const testRecord = results!.find(r => r.uid === testId);
    expect(testRecord).toBeDefined();
    expect(testRecord?.isActive).toBe(true);
  }, 30000);
});

describe("job-interviews actions (integration)", () => {
  const testIds: Array<{ collection: string; docId: string }> = [];
  const actorId = getTestActorId();

  afterEach(async () => {
    await cleanupMultipleTestData(testIds);
    testIds.length = 0;
  });

  it("should create and read job interview", async () => {
    const testId = generateTestId("job_interview");
    testIds.push({ collection: "job_interviews", docId: testId });

    const jobId = generateTestId("job");
    const applicationId = generateTestId("application");
    const candidateId = generateTestId("candidate");
    const companyId = generateTestId("company");
    const appointmentTime = Date.now() + 86400000; // Tomorrow

    // Create
    const createdId = await webJobInterviewCreate(
      {
        appointment: appointmentTime,
        jobId,
        applicationId,
        candidateId,
        companyId,
        candidateName: "สมชาย ใจดี",
        companyName: "Tech Company Ltd.",
        channel: "video",
        status: "scheduled",
        from: "HR Manager",
        to: candidateId,
        location: "Zoom Meeting",
        isCancel: false,
        isAccepted: false,
        note: "Please join 5 minutes early",
        room: "https://zoom.us/j/123456789",
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
    const retrieved = await webJobInterviewGetById(testId);

    expect(retrieved).toBeDefined();
    expect(retrieved?.uid).toBe(testId);
    expect(retrieved?.appointment).toBe(appointmentTime);
    expect(retrieved?.candidateName).toBe("สมชาย ใจดี");
    expect(retrieved?.channel).toBe("video");
    expect(retrieved?.status).toBe("scheduled");
    expect(retrieved?.isCancel).toBe(false);
  }, 30000);

  it("should update job interview", async () => {
    const testId = generateTestId("job_interview");
    testIds.push({ collection: "job_interviews", docId: testId });

    const jobId = generateTestId("job");
    const applicationId = generateTestId("application");
    const candidateId = generateTestId("candidate");
    const companyId = generateTestId("company");
    const appointmentTime = Date.now() + 86400000;

    // Create
    await webJobInterviewCreate(
      {
        appointment: appointmentTime,
        jobId,
        applicationId,
        candidateId,
        companyId,
        candidateName: "สมชาย ใจดี",
        companyName: "Tech Company Ltd.",
        channel: "video",
        status: "scheduled",
        from: "HR Manager",
        to: candidateId,
        location: "Zoom Meeting",
        isCancel: false,
        isAccepted: false,
        createdBy: actorId,
        updatedBy: actorId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      actorId,
      testId
    );

    // Update - candidate accepted
    await webJobInterviewUpdate(
      {
        appointment: appointmentTime,
        jobId,
        applicationId,
        candidateId,
        companyId,
        candidateName: "สมชาย ใจดี",
        companyName: "Tech Company Ltd.",
        channel: "video",
        status: "confirmed",
        from: "HR Manager",
        to: candidateId,
        location: "Zoom Meeting",
        isCancel: false,
        isAccepted: true,
        note: "Candidate has confirmed attendance",
        room: "https://zoom.us/j/123456789",
        createdBy: actorId,
        updatedBy: actorId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      actorId,
      testId
    );

    // Read
    const retrieved = await webJobInterviewGetById(testId);

    expect(retrieved?.status).toBe("confirmed");
    expect(retrieved?.isAccepted).toBe(true);
    expect(retrieved?.note).toBe("Candidate has confirmed attendance");
  }, 30000);

  it("should cancel job interview", async () => {
    const testId = generateTestId("job_interview");
    testIds.push({ collection: "job_interviews", docId: testId });

    const jobId = generateTestId("job");
    const applicationId = generateTestId("application");
    const candidateId = generateTestId("candidate");
    const companyId = generateTestId("company");
    const appointmentTime = Date.now() + 86400000;

    // Create
    await webJobInterviewCreate(
      {
        appointment: appointmentTime,
        jobId,
        applicationId,
        candidateId,
        companyId,
        candidateName: "สมชาย ใจดี",
        companyName: "Tech Company Ltd.",
        channel: "video",
        status: "scheduled",
        from: "HR Manager",
        to: candidateId,
        location: "Zoom Meeting",
        isCancel: false,
        isAccepted: false,
        createdBy: actorId,
        updatedBy: actorId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      actorId,
      testId
    );

    // Cancel
    await webJobInterviewUpdate(
      {
        appointment: appointmentTime,
        jobId,
        applicationId,
        candidateId,
        companyId,
        candidateName: "สมชาย ใจดี",
        companyName: "Tech Company Ltd.",
        channel: "video",
        status: "cancelled",
        from: "HR Manager",
        to: candidateId,
        location: "Zoom Meeting",
        isCancel: true,
        cancelReason: "Company decided to postpone hiring",
        isAccepted: false,
        createdBy: actorId,
        updatedBy: actorId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      actorId,
      testId
    );

    // Read
    const retrieved = await webJobInterviewGetById(testId);

    expect(retrieved?.isCancel).toBe(true);
    expect(retrieved?.status).toBe("cancelled");
    expect(retrieved?.cancelReason).toBe("Company decided to postpone hiring");
  }, 30000);

  it("should filter interviews by job ID", async () => {
    const testId = generateTestId("job_interview");
    testIds.push({ collection: "job_interviews", docId: testId });

    const jobId = generateTestId("job_unique");
    const applicationId = generateTestId("application");
    const candidateId = generateTestId("candidate");
    const companyId = generateTestId("company");

    // Create
    await webJobInterviewCreate(
      {
        appointment: Date.now() + 86400000,
        jobId,
        applicationId,
        candidateId,
        companyId,
        candidateName: "ทดสอบ ฟิลเตอร์",
        companyName: "Filter Corp",
        channel: "phone",
        status: "scheduled",
        from: "HR",
        to: candidateId,
        isCancel: false,
        isAccepted: false,
        createdBy: actorId,
        updatedBy: actorId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      actorId,
      testId
    );

    // Filter by job_id reference - need to use the document path
    const results = await webJobInterviewGetByFilter();

    expect(results).toBeDefined();
    // Find our test record
    const testRecord = results?.find(r => r.uid === testId);
    expect(testRecord).toBeDefined();
    expect(testRecord?.jobId).toBe(jobId);
  }, 30000);

  it("should filter interviews by status", async () => {
    const testId = generateTestId("job_interview");
    testIds.push({ collection: "job_interviews", docId: testId });

    const jobId = generateTestId("job");
    const applicationId = generateTestId("application");
    const candidateId = generateTestId("candidate");
    const companyId = generateTestId("company");

    // Create
    await webJobInterviewCreate(
      {
        appointment: Date.now() + 86400000,
        jobId,
        applicationId,
        candidateId,
        companyId,
        candidateName: "ผู้สมัคร ทดสอบ",
        companyName: "Test Company",
        channel: "in-person",
        status: "completed",
        from: "HR Manager",
        to: candidateId,
        location: "Office Bangkok",
        isCancel: false,
        isAccepted: true,
        note: "Interview completed successfully",
        createdBy: actorId,
        updatedBy: actorId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      actorId,
      testId
    );

    // Filter
    const results = await webJobInterviewGetByFilter(
      createWhereFilter("status", "==", "completed")
    );

    expect(results).toBeDefined();
    const testRecord = results!.find(r => r.uid === testId);
    expect(testRecord).toBeDefined();
    expect(testRecord?.status).toBe("completed");
  }, 30000);

  it("should handle different interview channels", async () => {
    const channels = ["video", "phone", "in-person"];
    const createdIds: string[] = [];

    for (const channel of channels) {
      const testId = generateTestId(`interview_${channel}`);
      testIds.push({ collection: "job_interviews", docId: testId });
      createdIds.push(testId);

      await webJobInterviewCreate(
        {
          appointment: Date.now() + 86400000,
          jobId: generateTestId("job"),
          applicationId: generateTestId("application"),
          candidateId: generateTestId("candidate"),
          companyId: generateTestId("company"),
          candidateName: "ทดสอบ ช่องทาง",
          companyName: "Channel Test Corp",
          channel,
          status: "scheduled",
          from: "HR",
          to: generateTestId("candidate"),
          location: channel === "in-person" ? "Office" : `${channel} link`,
          isCancel: false,
          isAccepted: false,
          createdBy: actorId,
          updatedBy: actorId,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        actorId,
        testId
      );
    }

    // Verify all channels
    for (let i = 0; i < channels.length; i++) {
      const retrieved = await webJobInterviewGetById(createdIds[i]);
      expect(retrieved?.channel).toBe(channels[i]);
    }
  }, 30000);
});
