/**
 * Integration Tests for user-info actions
 * Tests CRUD operations and specialized array operations
 */

import { describe, it, expect, afterEach } from "vitest";
import {
  webUserInfoCreate,
  webUserInfoGetById,
  webUserInfoGetByFilter,
  webUserInfoUpdate,
  addRoleToUser,
  removeRoleFromUser,
} from "@/lib/database/actions/user-info";
import { generateTestId, cleanupTestData, getTestActorId, createWhereFilter } from "../test-utils";

describe("user-info actions (integration)", () => {
  const testIds: string[] = [];
  const actorId = getTestActorId();

  afterEach(async () => {
    for (const id of testIds) {
      await cleanupTestData("user_accounts", id);
    }
    testIds.length = 0;
  });

  it("should create and read user info", async () => {
    const testId = generateTestId("user_info");
    testIds.push(testId);

    // Create
    const createdId = await webUserInfoCreate(
      {
        uid: testId,
        roles: ["candidate"],
        companyId: undefined,
        currentStep: 0,
        currentStepName: "initial",
        remark: "Test user",
      },
      actorId,
      testId
    );

    expect(createdId).toBe(testId);

    // Read
    const retrieved = await webUserInfoGetById(testId);

    expect(retrieved).toBeDefined();
    expect(retrieved?.uid).toBe(testId);
    expect(retrieved?.roles).toEqual(["candidate"]);
    expect(retrieved?.currentStep).toBe(0);
    expect(retrieved?.remark).toBe("Test user");
  });

  it("should update user info", async () => {
    const testId = generateTestId("user_info");
    testIds.push(testId);

    // Create
    await webUserInfoCreate(
      {
        uid: testId,
        roles: ["candidate"],
        currentStep: 0,
        currentStepName: "initial",
      },
      actorId,
      testId
    );

    // Update
    await webUserInfoUpdate(
      {
        uid: testId,
        roles: ["candidate", "admin"],
        currentStep: 1,
        currentStepName: "verified",
        remark: "Updated user",
      },
      actorId,
      testId
    );

    // Read
    const retrieved = await webUserInfoGetById(testId);

    expect(retrieved?.roles).toContain("admin");
    expect(retrieved?.currentStep).toBe(1);
    expect(retrieved?.currentStepName).toBe("verified");
  });

  it("should add role to user (array union operation)", async () => {
    const testId = generateTestId("user_info");
    testIds.push(testId);

    // Create with initial role
    await webUserInfoCreate(
      {
        uid: testId,
        roles: ["candidate"],
        currentStep: 0,
      },
      actorId,
      testId
    );

    // Add new role using specialized operation
    await addRoleToUser(testId, "company");

    // Read
    const retrieved = await webUserInfoGetById(testId);

    expect(retrieved?.roles).toContain("candidate");
    expect(retrieved?.roles).toContain("company");
    expect(retrieved?.roles?.length).toBe(2);
  });

  it("should remove role from user (array remove operation)", async () => {
    const testId = generateTestId("user_info");
    testIds.push(testId);

    // Create with multiple roles
    await webUserInfoCreate(
      {
        uid: testId,
        roles: ["candidate", "company", "admin"],
        currentStep: 0,
      },
      actorId,
      testId
    );

    // Remove a role using specialized operation
    await removeRoleFromUser(testId, "company");

    // Read
    const retrieved = await webUserInfoGetById(testId);

    expect(retrieved?.roles).toContain("candidate");
    expect(retrieved?.roles).toContain("admin");
    expect(retrieved?.roles).not.toContain("company");
    expect(retrieved?.roles?.length).toBe(2);
  });

  it("should filter user info by role", async () => {
    const testId1 = generateTestId("user_info");
    const testId2 = generateTestId("user_info");
    testIds.push(testId1, testId2);

    // Create users with different roles
    await webUserInfoCreate(
      {
        uid: testId1,
        roles: ["candidate"],
        currentStep: 0,
      },
      actorId,
      testId1
    );

    await webUserInfoCreate(
      {
        uid: testId2,
        roles: ["company"],
        currentStep: 0,
      },
      actorId,
      testId2
    );

    // Filter by role (note: array-contains query)
    const results = await webUserInfoGetByFilter(
      createWhereFilter("roles", "array-contains", "candidate")
    );

    expect(results).toBeDefined();
    const testRecord = results!.find(r => r.uid === testId1);
    expect(testRecord).toBeDefined();
  });
});
