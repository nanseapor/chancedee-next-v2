/**
 * Integration Tests for user-accounts actions
 * Tests user account CRUD operations, filtering, and consolidated fetch
 */

import { describe, it, expect, afterEach } from "vitest";
import {
  webUserAccountCreate,
  webUserAccountGetById,
  webUserAccountGetByFilter,
  webUserAccountUpdate,
  webUserAccountGetCompleteById,
  webUserAccountDelete,
} from "@/lib/database/actions/user-accounts";
import { generateTestId, cleanupTestData, getTestActorId, createWhereFilter } from "../test-utils";

describe("user-accounts actions (integration)", () => {
  const testIds: string[] = [];
  const actorId = getTestActorId();

  afterEach(async () => {
    for (const id of testIds) {
      await cleanupTestData("user_accounts", id);
    }
    testIds.length = 0;
  });

  it("should create and read user account", async () => {
    const testId = generateTestId("user_account");
    testIds.push(testId);

    // Create
    const createdId = await webUserAccountCreate(
      {
        uid: testId,
        email: `test_${testId}@example.com`,
        phone: "0812345678",
        firstnameTH: "สมชาย",
        lastnameTH: "ใจดี",
        nicknameTH: "แชมป์",
        gender: "male",
        isPolicyAccepted: true,
        isActive: true,
        serviceTypes: ["jobseeker"],
        citizenId: "1234567890123",
        status: "active",
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
    const retrieved = await webUserAccountGetById(testId);

    expect(retrieved).toBeDefined();
    expect(retrieved?.uid).toBe(testId);
    expect(retrieved?.email).toBe(`test_${testId}@example.com`);
    expect(retrieved?.firstnameTH).toBe("สมชาย");
    expect(retrieved?.isPolicyAccepted).toBe(true);
    expect(retrieved?.serviceTypes).toEqual(["jobseeker"]);
  }, 30000);

  it("should update user account", async () => {
    const testId = generateTestId("user_account");
    testIds.push(testId);

    // Create
    await webUserAccountCreate(
      {
        uid: testId,
        email: `test_${testId}@example.com`,
        phone: "0812345678",
        firstnameTH: "สมชาย",
        lastnameTH: "ใจดี",
        isPolicyAccepted: true,
        isActive: true,
        serviceTypes: ["jobseeker"],
        status: "active",
        createdBy: actorId,
        updatedBy: actorId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      actorId,
      testId
    );

    // Update
    await webUserAccountUpdate(
      {
        uid: testId,
        email: `updated_${testId}@example.com`,
        phone: "0898765432",
        firstnameTH: "สมหญิง",
        lastnameTH: "รักษ์ดี",
        isPolicyAccepted: true,
        isActive: true,
        serviceTypes: ["jobseeker", "employer"],
        status: "active",
        createdBy: actorId,
        updatedBy: actorId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      actorId,
      testId
    );

    // Read
    const retrieved = await webUserAccountGetById(testId);

    expect(retrieved?.email).toBe(`updated_${testId}@example.com`);
    expect(retrieved?.firstnameTH).toBe("สมหญิง");
    expect(retrieved?.phone).toBe("0898765432");
    expect(retrieved?.serviceTypes).toContain("employer");
  }, 30000);

  it("should filter user accounts by email", async () => {
    const testId = generateTestId("user_account");
    testIds.push(testId);
    const uniqueEmail = `filter_test_${testId}@example.com`;

    // Create
    await webUserAccountCreate(
      {
        uid: testId,
        email: uniqueEmail,
        firstnameTH: "ทดสอบ",
        lastnameTH: "ฟิลเตอร์",
        isPolicyAccepted: true,
        isActive: true,
        serviceTypes: ["jobseeker"],
        status: "active",
        createdBy: actorId,
        updatedBy: actorId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      actorId,
      testId
    );

    // Filter
    const results = await webUserAccountGetByFilter(
      createWhereFilter("email", "==", uniqueEmail)
    );

    expect(results).toBeDefined();
    expect(results?.length).toBeGreaterThan(0);
    const testRecord = results!.find(r => r.uid === testId);
    expect(testRecord).toBeDefined();
    expect(testRecord?.email).toBe(uniqueEmail);
  }, 30000);

  it("should filter user accounts by service type", async () => {
    const testId = generateTestId("user_account");
    testIds.push(testId);

    // Create
    await webUserAccountCreate(
      {
        uid: testId,
        email: `test_${testId}@example.com`,
        firstnameTH: "ทดสอบ",
        lastnameTH: "บริการ",
        isPolicyAccepted: true,
        isActive: true,
        serviceTypes: ["employer"],
        status: "active",
        createdBy: actorId,
        updatedBy: actorId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      actorId,
      testId
    );

    // Filter
    const results = await webUserAccountGetByFilter(
      createWhereFilter("service_types", "array-contains", "employer")
    );

    expect(results).toBeDefined();
    const testRecord = results!.find(r => r.uid === testId);
    expect(testRecord).toBeDefined();
    expect(testRecord?.serviceTypes).toContain("employer");
  }, 30000);

  it("should get complete user data in single query", async () => {
    const testId = generateTestId("user_account");
    testIds.push(testId);

    // Create user with all data
    await webUserAccountCreate(
      {
        uid: testId,
        email: `complete_${testId}@example.com`,
        phone: "0812345678",
        firstnameTH: "สมบูรณ์",
        lastnameTH: "ข้อมูล",
        isPolicyAccepted: true,
        isActive: true,
        serviceTypes: ["jobseeker"],
        status: "active",
        createdBy: actorId,
        updatedBy: actorId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      actorId,
      testId
    );

    // Get complete data
    const completeData = await webUserAccountGetCompleteById(testId);

    expect(completeData).toBeDefined();
    expect(completeData?.userData).toBeDefined();
    expect(completeData?.userInfo).toBeDefined();
    expect(completeData?.userTransfer).toBeDefined();

    expect(completeData?.userData.uid).toBe(testId);
    expect(completeData?.userData.email).toBe(`complete_${testId}@example.com`);
    expect(completeData?.userInfo.uid).toBe(testId);
    expect(completeData?.userTransfer.uid).toBe(testId);
  }, 30000);

  it("should handle non-existent user gracefully", async () => {
    const nonExistentId = generateTestId("nonexistent");

    const result = await webUserAccountGetById(nonExistentId);
    expect(result).toBeNull();

    const completeResult = await webUserAccountGetCompleteById(nonExistentId);
    expect(completeResult).toBeNull();
  }, 30000);

  it("should delete user account", async () => {
    const testId = generateTestId("user_account");
    testIds.push(testId);

    // Create
    await webUserAccountCreate(
      {
        uid: testId,
        email: `delete_${testId}@example.com`,
        firstnameTH: "ลบ",
        lastnameTH: "ทิ้ง",
        isPolicyAccepted: true,
        isActive: true,
        serviceTypes: ["jobseeker"],
        status: "active",
        createdBy: actorId,
        updatedBy: actorId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      actorId,
      testId
    );

    // Verify it exists
    let retrieved = await webUserAccountGetById(testId);
    expect(retrieved).toBeDefined();

    // Delete
    await webUserAccountDelete(testId);

    // Verify it's deleted
    retrieved = await webUserAccountGetById(testId);
    expect(retrieved).toBeNull();
  }, 30000);
});
