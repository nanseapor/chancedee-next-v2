/**
 * Integration Tests for consent-records actions
 * Tests GDPR consent management including versioning, policy updates, and audit trail
 */

import { describe, it, expect, afterEach } from "vitest";
import {
  webConsentRecordCreate,
  webConsentRecordGetById,
  webConsentRecordGetByFilter,
  webConsentRecordUpdate,
  webConsentRecordDelete,
  webConsentRecordGetLatestByUserId,
  webConsentRecordGetLatestBySessionId,
  webConsentRecordGetHistoryByUserId,
  webConsentRecordCreateVersion,
  webConsentRecordWithdrawAll,
  webConsentRecordIsValid,
  webConsentRecordGetExpiredByPolicy,
} from "@/lib/database/actions/consent-records";
import { COOKIE_POLICY_VERSION } from "@/types/consent.types";
import { generateTestId, cleanupTestData, getTestActorId, createWhereFilter } from "../test-utils";

describe("consent-records actions (integration)", () => {
  const testIds: string[] = [];
  const actorId = getTestActorId();

  afterEach(async () => {
    for (const id of testIds) {
      await cleanupTestData("consent_records", id);
    }
    testIds.length = 0;
  });

  it("should create and read consent record", async () => {
    const testId = generateTestId("consent");
    testIds.push(testId);

    const userId = generateTestId("user");

    // Create
    const createdId = await webConsentRecordCreate(
      {
        uid: testId,
        userId,
        ipHash: "hash_123",
        userAgent: "Mozilla/5.0",
        policyVersion: COOKIE_POLICY_VERSION,
        preferences: {
          essential: true,
          analytics: true,
          marketing: false,
          functional: true,
        },
        consentMethod: "banner",
        isActive: true,
        versionNumber: 1,
        changeReason: "initial_consent",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      actorId,
      testId
    );

    expect(createdId).toBe(testId);

    // Read
    const retrieved = await webConsentRecordGetById(testId);

    expect(retrieved).toBeDefined();
    expect(retrieved?.uid).toBe(testId);
    expect(retrieved?.userId).toBe(userId);
    expect(retrieved?.preferences.essential).toBe(true);
    expect(retrieved?.preferences.analytics).toBe(true);
    expect(retrieved?.preferences.marketing).toBe(false);
    expect(retrieved?.isActive).toBe(true);
  }, 30000);

  it("should update consent record", async () => {
    const testId = generateTestId("consent");
    testIds.push(testId);

    const userId = generateTestId("user");

    // Create
    await webConsentRecordCreate(
      {
        uid: testId,
        userId,
        ipHash: "hash_123",
        userAgent: "Mozilla/5.0",
        policyVersion: COOKIE_POLICY_VERSION,
        preferences: {
          essential: true,
          analytics: false,
          marketing: false,
          functional: false,
        },
        consentMethod: "banner",
        isActive: true,
        versionNumber: 1,
        changeReason: "initial_consent",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      actorId,
      testId
    );

    // Update
    await webConsentRecordUpdate(
      testId,
      {
        preferences: {
          essential: true,
          analytics: true,
          marketing: true,
          functional: true,
        },
      },
      actorId
    );

    // Read
    const retrieved = await webConsentRecordGetById(testId);

    expect(retrieved?.preferences.analytics).toBe(true);
    expect(retrieved?.preferences.marketing).toBe(true);
  }, 30000);

  it("should get latest consent by user ID", async () => {
    const userId = generateTestId("user");

    // Create multiple consent records
    const testId1 = generateTestId("consent_old");
    testIds.push(testId1);
    await webConsentRecordCreate(
      {
        uid: testId1,
        userId,
        ipHash: "hash_old",
        userAgent: "Mozilla/5.0",
        policyVersion: COOKIE_POLICY_VERSION,
        preferences: {
          essential: true,
          analytics: false,
          marketing: false,
          functional: false,
        },
        consentMethod: "banner",
        isActive: false, // Old consent, deactivated
        versionNumber: 1,
        changeReason: "initial_consent",
        createdAt: Date.now() - 86400000, // Yesterday
        updatedAt: Date.now() - 86400000,
      },
      actorId,
      testId1
    );

    const testId2 = generateTestId("consent_latest");
    testIds.push(testId2);
    await webConsentRecordCreate(
      {
        uid: testId2,
        userId,
        ipHash: "hash_new",
        userAgent: "Mozilla/5.0",
        policyVersion: COOKIE_POLICY_VERSION,
        preferences: {
          essential: true,
          analytics: true,
          marketing: true,
          functional: true,
        },
        consentMethod: "settings_page",
        isActive: true, // Latest active consent
        versionNumber: 2,
        changeReason: "user_update",
        parentConsentId: testId1,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      actorId,
      testId2
    );

    // Get latest
    const latest = await webConsentRecordGetLatestByUserId(userId);

    expect(latest).toBeDefined();
    expect(latest?.uid).toBe(testId2);
    expect(latest?.versionNumber).toBe(2);
    expect(latest?.preferences.analytics).toBe(true);
  }, 30000);

  it("should get latest consent by session ID", async () => {
    const sessionId = generateTestId("session");

    const testId = generateTestId("consent");
    testIds.push(testId);

    // Create consent for anonymous session
    await webConsentRecordCreate(
      {
        uid: testId,
        sessionId,
        ipHash: "hash_anon",
        userAgent: "Mozilla/5.0",
        policyVersion: COOKIE_POLICY_VERSION,
        preferences: {
          essential: true,
          analytics: false,
          marketing: false,
          functional: false,
        },
        consentMethod: "banner",
        isActive: true,
        versionNumber: 1,
        changeReason: "initial_consent",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      actorId,
      testId
    );

    // Get latest by session
    const latest = await webConsentRecordGetLatestBySessionId(sessionId);

    expect(latest).toBeDefined();
    expect(latest?.uid).toBe(testId);
    expect(latest?.sessionId).toBe(sessionId);
  }, 30000);

  it("should get consent history for user", async () => {
    const userId = generateTestId("user");

    // Create multiple versions
    const testId1 = generateTestId("consent_v1");
    testIds.push(testId1);
    await webConsentRecordCreate(
      {
        uid: testId1,
        userId,
        ipHash: "hash_1",
        userAgent: "Mozilla/5.0",
        policyVersion: COOKIE_POLICY_VERSION,
        preferences: {
          essential: true,
          analytics: false,
          marketing: false,
          functional: false,
        },
        consentMethod: "banner",
        isActive: false,
        versionNumber: 1,
        changeReason: "initial_consent",
        createdAt: Date.now() - 172800000, // 2 days ago
        updatedAt: Date.now() - 172800000,
      },
      actorId,
      testId1
    );

    const testId2 = generateTestId("consent_v2");
    testIds.push(testId2);
    await webConsentRecordCreate(
      {
        uid: testId2,
        userId,
        ipHash: "hash_2",
        userAgent: "Mozilla/5.0",
        policyVersion: COOKIE_POLICY_VERSION,
        preferences: {
          essential: true,
          analytics: true,
          marketing: false,
          functional: false,
        },
        consentMethod: "settings_page",
        isActive: false,
        versionNumber: 2,
        changeReason: "user_update",
        parentConsentId: testId1,
        createdAt: Date.now() - 86400000, // Yesterday
        updatedAt: Date.now() - 86400000,
      },
      actorId,
      testId2
    );

    const testId3 = generateTestId("consent_v3");
    testIds.push(testId3);
    await webConsentRecordCreate(
      {
        uid: testId3,
        userId,
        ipHash: "hash_3",
        userAgent: "Mozilla/5.0",
        policyVersion: COOKIE_POLICY_VERSION,
        preferences: {
          essential: true,
          analytics: true,
          marketing: true,
          functional: true,
        },
        consentMethod: "settings_page",
        isActive: true,
        versionNumber: 3,
        changeReason: "user_update",
        parentConsentId: testId2,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      actorId,
      testId3
    );

    // Get history
    const history = await webConsentRecordGetHistoryByUserId(userId);

    expect(history).toBeDefined();
    expect(history.length).toBe(3);
    expect(history[0]?.versionNumber).toBe(3); // Most recent first
    expect(history[2]?.versionNumber).toBe(1); // Oldest last
  }, 30000);

  it("should create new consent version with audit trail", async () => {
    const userId = generateTestId("user");

    // Create initial consent
    const testId1 = generateTestId("consent_initial");
    testIds.push(testId1);
    await webConsentRecordCreate(
      {
        uid: testId1,
        userId,
        ipHash: "hash_initial",
        userAgent: "Mozilla/5.0",
        policyVersion: COOKIE_POLICY_VERSION,
        preferences: {
          essential: true,
          analytics: false,
          marketing: false,
          functional: false,
        },
        consentMethod: "banner",
        isActive: true,
        versionNumber: 1,
        changeReason: "initial_consent",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      actorId,
      testId1
    );

    // Create new version (this will deactivate the old one)
    const newConsent = await webConsentRecordCreateVersion(
      {
        essential: true,
        analytics: true,
        marketing: true,
        functional: true,
      },
      userId,
      undefined,
      "Mozilla/5.0",
      "hash_new",
      "user_update",
      actorId
    );

    testIds.push(newConsent.uid);

    // Verify new version
    expect(newConsent.versionNumber).toBe(2);
    expect(newConsent.parentConsentId).toBe(testId1);
    expect(newConsent.preferences.analytics).toBe(true);
    expect(newConsent.previousPreferences?.analytics).toBe(false);

    // Verify old version is deactivated
    const oldConsent = await webConsentRecordGetById(testId1);
    expect(oldConsent?.isActive).toBe(false);
  }, 30000);

  it("should withdraw all consent", async () => {
    const userId = generateTestId("user");

    // Create initial consent with all permissions
    const testId = generateTestId("consent_all");
    testIds.push(testId);
    await webConsentRecordCreate(
      {
        uid: testId,
        userId,
        ipHash: "hash_all",
        userAgent: "Mozilla/5.0",
        policyVersion: COOKIE_POLICY_VERSION,
        preferences: {
          essential: true,
          analytics: true,
          marketing: true,
          functional: true,
        },
        consentMethod: "banner",
        isActive: true,
        versionNumber: 1,
        changeReason: "initial_consent",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      actorId,
      testId
    );

    // Withdraw all
    const withdrawnConsent = await webConsentRecordWithdrawAll(
      userId,
      undefined,
      "Mozilla/5.0",
      "hash_withdrawn",
      actorId
    );

    testIds.push(withdrawnConsent.uid);

    // Verify withdrawal - should only have essential
    expect(withdrawnConsent.preferences.essential).toBe(true);
    expect(withdrawnConsent.preferences.analytics).toBe(false);
    expect(withdrawnConsent.preferences.marketing).toBe(false);
    expect(withdrawnConsent.preferences.functional).toBe(false);
  }, 30000);

  it("should validate consent record", async () => {
    const userId = generateTestId("user");

    // Valid consent
    const validConsent = {
      uid: generateTestId("consent_valid"),
      userId,
      ipHash: "hash",
      userAgent: "Mozilla/5.0",
      policyVersion: COOKIE_POLICY_VERSION,
      preferences: {
        essential: true,
        analytics: true,
        marketing: false,
        functional: false,
      },
      consentMethod: "banner" as const,
      isActive: true,
      versionNumber: 1,
      changeReason: "initial_consent" as const,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    expect(webConsentRecordIsValid(validConsent)).toBe(true);

    // Invalid - not active
    const inactiveConsent = { ...validConsent, isActive: false };
    expect(webConsentRecordIsValid(inactiveConsent)).toBe(false);

    // Invalid - expired (over 1 year old)
    const expiredConsent = {
      ...validConsent,
      createdAt: Date.now() - (366 * 24 * 60 * 60 * 1000),
    };
    expect(webConsentRecordIsValid(expiredConsent)).toBe(false);

    // Invalid - null
    expect(webConsentRecordIsValid(null)).toBe(false);
  }, 30000);

  it("should filter consent records by policy version", async () => {
    const testId = generateTestId("consent");
    testIds.push(testId);

    const userId = generateTestId("user");

    // Create consent with specific policy version
    await webConsentRecordCreate(
      {
        uid: testId,
        userId,
        ipHash: "hash",
        userAgent: "Mozilla/5.0",
        policyVersion: COOKIE_POLICY_VERSION,
        preferences: {
          essential: true,
          analytics: true,
          marketing: false,
          functional: false,
        },
        consentMethod: "banner",
        isActive: true,
        versionNumber: 1,
        changeReason: "initial_consent",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      actorId,
      testId
    );

    // Filter by policy version
    const results = await webConsentRecordGetByFilter(
      createWhereFilter("policy_version", "==", COOKIE_POLICY_VERSION)
    );

    expect(results).toBeDefined();
    const testRecord = results.find(r => r.uid === testId);
    expect(testRecord).toBeDefined();
    expect(testRecord?.policyVersion).toBe(COOKIE_POLICY_VERSION);
  }, 30000);

  it("should delete consent record", async () => {
    const testId = generateTestId("consent");
    testIds.push(testId);

    const userId = generateTestId("user");

    // Create
    await webConsentRecordCreate(
      {
        uid: testId,
        userId,
        ipHash: "hash",
        userAgent: "Mozilla/5.0",
        policyVersion: COOKIE_POLICY_VERSION,
        preferences: {
          essential: true,
          analytics: false,
          marketing: false,
          functional: false,
        },
        consentMethod: "banner",
        isActive: true,
        versionNumber: 1,
        changeReason: "initial_consent",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      actorId,
      testId
    );

    // Verify it exists
    let retrieved = await webConsentRecordGetById(testId);
    expect(retrieved).toBeDefined();

    // Delete
    await webConsentRecordDelete(testId, actorId);

    // Verify it's deleted
    retrieved = await webConsentRecordGetById(testId);
    expect(retrieved).toBeNull();
  }, 30000);
});
