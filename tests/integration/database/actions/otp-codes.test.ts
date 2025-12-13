/**
 * Integration Tests for otp-codes actions
 * Tests OTP generation, verification, and expiration handling
 */

import { describe, it, expect, afterEach } from "vitest";
import {
  webOTPCodesCreate,
  webOTPCodesGetById,
  webOTPCodesGetByFilter,
  webOTPCodesUpdate,
  webOTPCodeDelete,
} from "@/lib/database/actions/otp-codes";
import { generateTestId, cleanupTestData, getTestActorId, createWhereFilter } from "../test-utils";

describe("otp-codes actions (integration)", () => {
  const testIds: string[] = [];
  const actorId = getTestActorId();

  afterEach(async () => {
    for (const id of testIds) {
      await cleanupTestData("otp_codes", id);
    }
    testIds.length = 0;
  });

  it("should create and read OTP code", async () => {
    const testId = generateTestId("otp");
    testIds.push(testId);

    const email = `test_${testId}@example.com`;
    const otpCode = "123456";
    const refCode = "REF123";

    // Create
    const createdId = await webOTPCodesCreate(
      {
        uid: testId,
        email,
        otpCode,
        refCode,
        createDate: Date.now(),
        status: "pending",
        createdBy: actorId,
        updatedBy: actorId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      testId,
      actorId
    );

    expect(createdId).toBe(testId);

    // Read
    const retrieved = await webOTPCodesGetById(testId);

    expect(retrieved).toBeDefined();
    expect(retrieved?.uid).toBe(testId);
    expect(retrieved?.email).toBe(email);
    expect(retrieved?.otpCode).toBe(otpCode);
    expect(retrieved?.refCode).toBe(refCode);
    expect(retrieved?.status).toBe("pending");
  }, 30000);

  it("should update OTP code after verification", async () => {
    const testId = generateTestId("otp");
    testIds.push(testId);

    const email = `test_${testId}@example.com`;
    const otpCode = "654321";
    const refCode = "REF654";

    // Create
    await webOTPCodesCreate(
      {
        uid: testId,
        email,
        otpCode,
        refCode,
        createDate: Date.now(),
        status: "pending",
        createdBy: actorId,
        updatedBy: actorId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      testId,
      actorId
    );

    // Update - mark as verified
    await webOTPCodesUpdate(
      {
        uid: testId,
        email,
        otpCode,
        refCode,
        createDate: Date.now(),
        status: "verified",
        createdBy: actorId,
        updatedBy: actorId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      testId,
      actorId
    );

    // Read
    const retrieved = await webOTPCodesGetById(testId);

    expect(retrieved?.status).toBe("verified");
  }, 30000);

  it("should track expired OTP codes", async () => {
    const testId = generateTestId("otp");
    testIds.push(testId);

    const email = `test_${testId}@example.com`;
    const otpCode = "111111";
    const refCode = "REF111";

    // Create
    await webOTPCodesCreate(
      {
        uid: testId,
        email,
        otpCode,
        refCode,
        createDate: Date.now() - 600000, // 10 minutes ago
        status: "pending",
        createdBy: actorId,
        updatedBy: actorId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      testId,
      actorId
    );

    // Update to expired
    await webOTPCodesUpdate(
      {
        uid: testId,
        email,
        otpCode,
        refCode,
        createDate: Date.now() - 600000,
        status: "expired",
        createdBy: actorId,
        updatedBy: actorId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      testId,
      actorId
    );

    // Read
    const retrieved = await webOTPCodesGetById(testId);

    expect(retrieved?.status).toBe("expired");
  }, 30000);

  it("should filter OTP codes by email", async () => {
    const testId = generateTestId("otp");
    testIds.push(testId);

    const uniqueEmail = `filter_${testId}@example.com`;

    // Create
    await webOTPCodesCreate(
      {
        uid: testId,
        email: uniqueEmail,
        otpCode: "999999",
        refCode: "REF999",
        createDate: Date.now(),
        status: "pending",
        createdBy: actorId,
        updatedBy: actorId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      testId,
      actorId
    );

    // Filter
    const results = await webOTPCodesGetByFilter(
      createWhereFilter("email", "==", uniqueEmail)
    );

    expect(results).toBeDefined();
    expect(results?.length).toBeGreaterThan(0);
    const testRecord = results!.find(r => r.uid === testId);
    expect(testRecord).toBeDefined();
    expect(testRecord?.email).toBe(uniqueEmail);
  }, 30000);

  it("should filter verified OTP codes", async () => {
    const testId = generateTestId("otp");
    testIds.push(testId);

    const email = `verified_${testId}@example.com`;

    // Create verified OTP
    await webOTPCodesCreate(
      {
        uid: testId,
        email,
        otpCode: "777777",
        refCode: "REF777",
        createDate: Date.now(),
        status: "verified",
        createdBy: actorId,
        updatedBy: actorId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      testId,
      actorId
    );

    // Filter
    const results = await webOTPCodesGetByFilter(
      createWhereFilter("status", "==", "verified")
    );

    expect(results).toBeDefined();
    const testRecord = results!.find(r => r.uid === testId);
    expect(testRecord).toBeDefined();
    expect(testRecord?.status).toBe("verified");
  }, 30000);

  it("should filter pending OTP codes", async () => {
    const testId = generateTestId("otp");
    testIds.push(testId);

    const email = `pending_${testId}@example.com`;

    // Create pending OTP
    await webOTPCodesCreate(
      {
        uid: testId,
        email,
        otpCode: "888888",
        refCode: "REF888",
        createDate: Date.now(),
        status: "pending",
        createdBy: actorId,
        updatedBy: actorId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      testId,
      actorId
    );

    // Filter
    const results = await webOTPCodesGetByFilter(
      createWhereFilter("status", "==", "pending")
    );

    expect(results).toBeDefined();
    const testRecord = results!.find(r => r.uid === testId);
    expect(testRecord).toBeDefined();
    expect(testRecord?.status).toBe("pending");
  }, 30000);

  it("should handle OTP expiration based on createDate", async () => {
    const testId = generateTestId("otp");
    testIds.push(testId);

    const email = `expired_${testId}@example.com`;
    const oldCreateDate = Date.now() - 3600000; // 1 hour ago

    // Create expired OTP
    await webOTPCodesCreate(
      {
        uid: testId,
        email,
        otpCode: "000000",
        refCode: "REF000",
        createDate: oldCreateDate,
        status: "pending",
        createdBy: actorId,
        updatedBy: actorId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      testId,
      actorId
    );

    // Read
    const retrieved = await webOTPCodesGetById(testId);

    expect(retrieved).toBeDefined();
    expect(retrieved?.createDate).toBeLessThan(Date.now());
  }, 30000);

  it("should delete OTP code", async () => {
    const testId = generateTestId("otp");
    testIds.push(testId);

    const email = `delete_${testId}@example.com`;

    // Create
    await webOTPCodesCreate(
      {
        uid: testId,
        email,
        otpCode: "555555",
        refCode: "REF555",
        createDate: Date.now(),
        status: "pending",
        createdBy: actorId,
        updatedBy: actorId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      testId,
      actorId
    );

    // Verify it exists
    let retrieved = await webOTPCodesGetById(testId);
    expect(retrieved).toBeDefined();

    // Delete
    await webOTPCodeDelete(testId);

    // Verify it's deleted
    retrieved = await webOTPCodesGetById(testId);
    expect(retrieved).toBeNull();
  }, 30000);

  it("should handle multiple OTP codes for same email", async () => {
    const email = `multi_${generateTestId("email")}@example.com`;
    const createdIds: string[] = [];

    // Create 3 OTP codes for the same email
    for (let i = 0; i < 3; i++) {
      const testId = generateTestId(`otp_${i}`);
      testIds.push(testId);
      createdIds.push(testId);

      await webOTPCodesCreate(
        {
          uid: testId,
          email,
          otpCode: `${i}${i}${i}${i}${i}${i}`,
          refCode: `REF${i}${i}${i}`,
          createDate: Date.now() + (i * 1000),
          status: i === 2 ? "verified" : "pending", // Only last one is verified
          createdBy: actorId,
          updatedBy: actorId,
          createdAt: Date.now() + (i * 1000),
          updatedAt: Date.now() + (i * 1000),
        },
        testId,
        actorId
      );
    }

    // Filter by email
    const results = await webOTPCodesGetByFilter(
      createWhereFilter("email", "==", email)
    );

    expect(results).toBeDefined();
    const emailRecords = results!.filter(r => r.email === email);
    expect(emailRecords.length).toBeGreaterThanOrEqual(3);

    // Verify we can find all our test records
    for (const id of createdIds) {
      const record = results!.find(r => r.uid === id);
      expect(record).toBeDefined();
    }
  }, 30000);

  it("should filter OTP codes by ref code", async () => {
    const testId = generateTestId("otp");
    testIds.push(testId);

    const email = `reftest_${testId}@example.com`;
    const refCode = `UNIQUEREF${testId}`;

    // Create OTP with unique ref code
    await webOTPCodesCreate(
      {
        uid: testId,
        email,
        otpCode: "444444",
        refCode,
        createDate: Date.now(),
        status: "pending",
        createdBy: actorId,
        updatedBy: actorId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      testId,
      actorId
    );

    // Filter by ref code
    const results = await webOTPCodesGetByFilter(
      createWhereFilter("ref_code", "==", refCode)
    );

    expect(results).toBeDefined();
    const testRecord = results!.find(r => r.uid === testId);
    expect(testRecord).toBeDefined();
    expect(testRecord?.refCode).toBe(refCode);
  }, 30000);
});
