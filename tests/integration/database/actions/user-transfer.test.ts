/**
 * Integration Tests for user-transfer actions
 * Tests the complete write-read cycle through repositories
 */

import { describe, it, expect, afterEach } from "vitest";
import {
  webUserTransferCreate,
  webUserTransferGetById,
  webUserTransferGetByFilter,
  webUserTransferUpdate,
} from "@/lib/database/actions/user-transfer";
import { generateTestId, cleanupTestData, getTestActorId, createWhereFilter } from "../test-utils";

describe("user-transfer actions (integration)", () => {
  const testIds: string[] = [];
  const actorId = getTestActorId();

  afterEach(async () => {
    // Cleanup all test data
    for (const id of testIds) {
      await cleanupTestData("user_accounts", id);
    }
    testIds.length = 0;
  });

  it("should create and read a user transfer record", async () => {
    const testId = generateTestId("user_transfer");
    testIds.push(testId);

    // Create
    const createdId = await webUserTransferCreate(
      {
        uid: testId,
        targetCompany: "company_123",
        requestTimestamp: Date.now(),
        transferApproved: false,
      },
      actorId,
      testId
    );

    expect(createdId).toBe(testId);

    // Read
    const retrieved = await webUserTransferGetById(testId);

    expect(retrieved).toBeDefined();
    expect(retrieved?.uid).toBe(testId);
    expect(retrieved?.targetCompany).toBe("company_123");
    expect(retrieved?.transferApproved).toBe(false);
  });

  it("should update a user transfer record", async () => {
    const testId = generateTestId("user_transfer");
    testIds.push(testId);

    // Create
    await webUserTransferCreate(
      {
        uid: testId,
        targetCompany: "company_123",
        requestTimestamp: Date.now(),
        transferApproved: false,
      },
      actorId,
      testId
    );

    // Update
    await webUserTransferUpdate(
      {
        uid: testId,
        targetCompany: "company_456",
        requestTimestamp: Date.now(),
        transferApproved: true,
      },
      actorId,
      testId
    );

    // Read
    const retrieved = await webUserTransferGetById(testId);

    expect(retrieved?.targetCompany).toBe("company_456");
    expect(retrieved?.transferApproved).toBe(true);
  });

  it("should filter user transfer records", async () => {
    const testId1 = generateTestId("user_transfer");
    const testId2 = generateTestId("user_transfer");
    testIds.push(testId1, testId2);

    const targetCompany = `test_company_${Date.now()}`;

    // Create multiple records with same target company
    await webUserTransferCreate(
      {
        uid: testId1,
        targetCompany,
        requestTimestamp: Date.now(),
        transferApproved: false,
      },
      actorId,
      testId1
    );

    await webUserTransferCreate(
      {
        uid: testId2,
        targetCompany,
        requestTimestamp: Date.now(),
        transferApproved: true,
      },
      actorId,
      testId2
    );

    // Filter by target company
    const results = await webUserTransferGetByFilter(
      createWhereFilter("target_company", "==", targetCompany)
    );

    expect(results).toBeDefined();
    expect(results!.length).toBeGreaterThanOrEqual(2);

    const testRecords = results!.filter(r => r.uid === testId1 || r.uid === testId2);
    expect(testRecords.length).toBe(2);
  });

  it("should return null for non-existent record", async () => {
    const nonExistentId = generateTestId("nonexistent");

    const result = await webUserTransferGetById(nonExistentId);

    expect(result).toBeNull();
  });
});
