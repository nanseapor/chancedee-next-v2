/**
 * Integration Tests for candidate-related actions
 * Tests screening, preference, and referral actions
 */

import { describe, it, expect, afterEach } from "vitest";
import {
  webCandidateScreeningCreate,
  webCandidateScreeningGetById,
  webCandidateScreeningGetByFilter,
  webCandidateScreeningUpdate,
} from "@/lib/database/actions/candidate-screening";
import {
  webCandidatePreferenceCreate,
  webCandidatePreferenceGetById,
  webCandidatePreferenceUpdate,
} from "@/lib/database/actions/candidate-preference";
import {
  webCandidateReferralCreate,
  webCandidateReferralGetById,
  webCandidateReferralUpdate,
} from "@/lib/database/actions/candidate-referral";
import { generateTestId, cleanupTestData, getTestActorId, createWhereFilter } from "../test-utils";

describe("candidate-screening actions (integration)", () => {
  const testIds: string[] = [];
  const actorId = getTestActorId();

  afterEach(async () => {
    for (const id of testIds) {
      await cleanupTestData("candidate_information", id);
    }
    testIds.length = 0;
  });

  it("should create, update and read candidate screening data", async () => {
    const testId = generateTestId("candidate_screening");
    testIds.push(testId);

    // Create
    await webCandidateScreeningCreate(
      {
        flagCount: 0,
        riskScore: 50,
        lastActive: Date.now(),
        profileStatus: "pending",
        emailVerification: false,
        phoneVerification: false,
        identityVerification: false,
      },
      actorId,
      testId
    );

    // Update
    await webCandidateScreeningUpdate(
      {
        flagCount: 0,
        riskScore: 50,
        lastActive: Date.now(),
        profileStatus: "verified",
        emailVerification: true,
        phoneVerification: true,
        identityVerification: false,
      },
      actorId,
      testId
    );

    // Read
    const retrieved = await webCandidateScreeningGetById(testId);

    expect(retrieved).toBeDefined();
    expect(retrieved?.uid).toBe(testId);
    expect(retrieved?.flagCount).toBe(0);
    expect(retrieved?.profileStatus).toBe("verified");
    expect(retrieved?.emailVerification).toBe(true);
  });

  it("should filter by profile status", async () => {
    const testId = generateTestId("candidate_screening");
    testIds.push(testId);

    // Create first
    await webCandidateScreeningCreate(
      {
        flagCount: 0,
        riskScore: 10,
        lastActive: Date.now(),
        profileStatus: "flagged",
        emailVerification: true,
        phoneVerification: false,
        identityVerification: false,
      },
      actorId,
      testId
    );

    const results = await webCandidateScreeningGetByFilter(
      createWhereFilter("profile_status", "==", "flagged")
    );

    expect(results).toBeDefined();
    const testRecord = results!.find(r => r.uid === testId);
    expect(testRecord).toBeDefined();
    expect(testRecord?.profileStatus).toBe("flagged");
  });
});

describe("candidate-preference actions (integration)", () => {
  const testIds: string[] = [];
  const actorId = getTestActorId();

  afterEach(async () => {
    for (const id of testIds) {
      await cleanupTestData("candidate_information", id);
    }
    testIds.length = 0;
  });

  it("should create and read candidate preferences", async () => {
    const testId = generateTestId("candidate_pref");
    testIds.push(testId);

    // Create
    const createdId = await webCandidatePreferenceCreate(
      {
        uid: testId,
        iAm: "Full-stack developer",
        iAmLookingFor: ["Remote work", "Flexible hours"],
        iValues: ["Work-life balance"],
        myPreferredJobs: ["Software Engineer"],
        myValues: ["Innovation"],
        preferredCompany: "Tech startup",
        preferredPosition: "Senior Developer",
        jobFunction: ["Engineering"],
        jobType: "Full-time",
        jobLocation: "Bangkok",
        expectedSalary: 80000,
        isNegotiable: true,
        headlines: "Experienced developer",
        overheadDays: "1 month",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      actorId,
      testId
    );

    expect(createdId).toBe(testId);

    // Read
    const retrieved = await webCandidatePreferenceGetById(testId);

    expect(retrieved).toBeDefined();
    expect(retrieved?.uid).toBe(testId);
    expect(retrieved?.iAm).toBe("Full-stack developer");
    expect(retrieved?.expectedSalary).toBe(80000);
    expect(retrieved?.isNegotiable).toBe(true);
  });

  it("should update candidate preferences", async () => {
    const testId = generateTestId("candidate_pref");
    testIds.push(testId);

    // Create
    await webCandidatePreferenceCreate(
      {
        uid: testId,
        iAm: "Developer",
        jobType: "Full-time",
        expectedSalary: 60000,
        isNegotiable: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      actorId,
      testId
    );

    // Update
    await webCandidatePreferenceUpdate(
      {
        uid: testId,
        iAm: "Senior Developer",
        jobType: "Full-time",
        expectedSalary: 100000,
        isNegotiable: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      actorId,
      testId
    );

    // Read
    const retrieved = await webCandidatePreferenceGetById(testId);

    expect(retrieved?.iAm).toBe("Senior Developer");
    expect(retrieved?.expectedSalary).toBe(100000);
    expect(retrieved?.isNegotiable).toBe(true);
  });
});

describe("candidate-referral actions (integration)", () => {
  const testIds: string[] = [];
  const actorId = getTestActorId();

  afterEach(async () => {
    for (const id of testIds) {
      await cleanupTestData("candidate_referral", id);
    }
    testIds.length = 0;
  });

  it("should create and read candidate referral", async () => {
    const testId = generateTestId("candidate_ref");
    testIds.push(testId);

    const referCode = `REF${Date.now()}`;

    // Create
    const createdId = await webCandidateReferralCreate(
      {
        uid: testId,
        referBy: "user_123",
        referLink: `https://example.com/ref/${referCode}`,
        referredList: ["user_456", "user_789"],
        referCode,
        referDate: Date.now(),
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
    const retrieved = await webCandidateReferralGetById(testId);

    expect(retrieved).toBeDefined();
    expect(retrieved?.uid).toBe(testId);
    expect(retrieved?.referCode).toBe(referCode);
    expect(retrieved?.referredList).toEqual(["user_456", "user_789"]);
  });

  it("should update candidate referral", async () => {
    const testId = generateTestId("candidate_ref");
    testIds.push(testId);

    const referCode = `REF${Date.now()}`;

    // Create
    await webCandidateReferralCreate(
      {
        uid: testId,
        referCode,
        referredList: [],
        createdBy: actorId,
        updatedBy: actorId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      actorId,
      testId
    );

    // Update with new referrals
    await webCandidateReferralUpdate(
      {
        uid: testId,
        referCode,
        referredList: ["user_111", "user_222", "user_333"],
        createdBy: actorId,
        updatedBy: actorId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      actorId,
      testId
    );

    // Read
    const retrieved = await webCandidateReferralGetById(testId);

    expect(retrieved?.referredList?.length).toBe(3);
    expect(retrieved?.referredList).toContain("user_111");
  });
});
