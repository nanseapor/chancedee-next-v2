/**
 * Integration Tests for CAND-R03: Candidate Settings
 * Tests webCandidateUpdateSettings and webCandidateSetIsSearchable server actions
 *
 * These tests verify actual database interactions with real Firebase dev database
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  webCandidateUpdateSettings,
  webCandidateSetIsSearchable,
  webCandidateInformationGetById,
  webCandidateSavePersonalInfo,
} from "@/lib/database/actions/candidate-information";
import {
  generateTestId,
  cleanupTestData,
  getTestActorId,
} from "../../../integration/database/test-utils";

describe("CAND-R03 Candidate Settings (integration)", () => {
  const testIds: string[] = [];
  const actorId = getTestActorId();

  /**
   * Helper: Create a minimal candidate for settings tests
   */
  async function createTestCandidate(testId: string) {
    await webCandidateSavePersonalInfo(
      testId,
      {
        title_prefix: "mr",
        first_name_th: "ทดสอบ",
        last_name_th: "การตั้งค่า",
        email: `settings_${testId}@example.com`,
        phone_number: "0899999999",
        birthdate: "1995-01-01",
        province: "กรุงเทพมหานคร",
      },
      actorId
    );
  }

  afterEach(async () => {
    for (const id of testIds) {
      await cleanupTestData("candidate_information", id);
    }
    testIds.length = 0;
  });

  describe("webCandidateUpdateSettings", () => {
    it("should update autoAttachCoverLetter field to true", async () => {
      const testId = generateTestId("settings_attach_cover");
      testIds.push(testId);

      await createTestCandidate(testId);

      // Update setting
      await webCandidateUpdateSettings(
        testId,
        { autoAttachCoverLetter: true },
        actorId
      );

      // Verify update
      const retrieved = await webCandidateInformationGetById(testId);
      expect(retrieved).toBeDefined();
      expect(retrieved?.autoAttachCoverLetter).toBe(true);
    }, 30000);

    it("should update autoAttachCoverLetter field to false", async () => {
      const testId = generateTestId("settings_no_cover");
      testIds.push(testId);

      await createTestCandidate(testId);

      // First enable, then disable
      await webCandidateUpdateSettings(
        testId,
        { autoAttachCoverLetter: true },
        actorId
      );
      await webCandidateUpdateSettings(
        testId,
        { autoAttachCoverLetter: false },
        actorId
      );

      // Verify disabled
      const retrieved = await webCandidateInformationGetById(testId);
      expect(retrieved?.autoAttachCoverLetter).toBe(false);
    }, 30000);

    it("should update defaultCoverLetter field with text content", async () => {
      const testId = generateTestId("settings_cover_text");
      testIds.push(testId);

      await createTestCandidate(testId);

      const coverLetterText =
        "เรียนคุณผู้จัดการฝ่ายทรัพยากรบุคคล\n\nผม/ดิฉัน มีความสนใจในตำแหน่งนี้เป็นอย่างยิ่ง";

      await webCandidateUpdateSettings(
        testId,
        {
          autoAttachCoverLetter: true,
          defaultCoverLetter: coverLetterText,
        },
        actorId
      );

      const retrieved = await webCandidateInformationGetById(testId);
      expect(retrieved?.defaultCoverLetter).toBe(coverLetterText);
    }, 30000);

    it("should update defaultCoverLetter to empty string", async () => {
      const testId = generateTestId("settings_empty_cover");
      testIds.push(testId);

      await createTestCandidate(testId);

      // First set text
      await webCandidateUpdateSettings(
        testId,
        { defaultCoverLetter: "Some text" },
        actorId
      );

      // Then clear it
      await webCandidateUpdateSettings(
        testId,
        { defaultCoverLetter: "" },
        actorId
      );

      const retrieved = await webCandidateInformationGetById(testId);
      expect(retrieved?.defaultCoverLetter).toBe("");
    }, 30000);

    it("should handle long cover letter text (2000 characters)", async () => {
      const testId = generateTestId("settings_long_cover");
      testIds.push(testId);

      await createTestCandidate(testId);

      const longText = "ก".repeat(2000);

      await webCandidateUpdateSettings(
        testId,
        { defaultCoverLetter: longText },
        actorId
      );

      const retrieved = await webCandidateInformationGetById(testId);
      expect(retrieved?.defaultCoverLetter).toBe(longText);
      expect(retrieved?.defaultCoverLetter?.length).toBe(2000);
    }, 30000);

    it("should update emailJobRecommendations field to true", async () => {
      const testId = generateTestId("settings_email_on");
      testIds.push(testId);

      await createTestCandidate(testId);

      await webCandidateUpdateSettings(
        testId,
        { emailJobRecommendations: true },
        actorId
      );

      const retrieved = await webCandidateInformationGetById(testId);
      expect(retrieved?.emailJobRecommendations).toBe(true);
    }, 30000);

    it("should update emailJobRecommendations field to false", async () => {
      const testId = generateTestId("settings_email_off");
      testIds.push(testId);

      await createTestCandidate(testId);

      // Enable then disable
      await webCandidateUpdateSettings(
        testId,
        { emailJobRecommendations: true },
        actorId
      );
      await webCandidateUpdateSettings(
        testId,
        { emailJobRecommendations: false },
        actorId
      );

      const retrieved = await webCandidateInformationGetById(testId);
      expect(retrieved?.emailJobRecommendations).toBe(false);
    }, 30000);

    it("should update multiple fields at once", async () => {
      const testId = generateTestId("settings_multi");
      testIds.push(testId);

      await createTestCandidate(testId);

      const updates = {
        isSearchable: true,
        autoAttachCoverLetter: true,
        defaultCoverLetter: "Multi-field test cover letter",
        emailJobRecommendations: false,
      };

      await webCandidateUpdateSettings(testId, updates, actorId);

      const retrieved = await webCandidateInformationGetById(testId);
      expect(retrieved?.isSearchable).toBe(true);
      expect(retrieved?.autoAttachCoverLetter).toBe(true);
      expect(retrieved?.defaultCoverLetter).toBe(
        "Multi-field test cover letter"
      );
      expect(retrieved?.emailJobRecommendations).toBe(false);
    }, 30000);

    it("should preserve existing personal info when updating settings", async () => {
      const testId = generateTestId("settings_preserve");
      testIds.push(testId);

      await createTestCandidate(testId);

      // Get original data
      const original = await webCandidateInformationGetById(testId);
      expect(original?.firstnameTH).toBe("ทดสอบ");

      // Update settings only
      await webCandidateUpdateSettings(
        testId,
        { emailJobRecommendations: true },
        actorId
      );

      // Verify personal info preserved
      const updated = await webCandidateInformationGetById(testId);
      expect(updated?.firstnameTH).toBe("ทดสอบ");
      expect(updated?.lastnameTH).toBe("การตั้งค่า");
      expect(updated?.email).toBe(`settings_${testId}@example.com`);
      expect(updated?.emailJobRecommendations).toBe(true);
    }, 30000);

    it("should handle partial updates without affecting other settings", async () => {
      const testId = generateTestId("settings_partial");
      testIds.push(testId);

      await createTestCandidate(testId);

      // Set initial state
      await webCandidateUpdateSettings(
        testId,
        {
          autoAttachCoverLetter: true,
          defaultCoverLetter: "Initial letter",
          emailJobRecommendations: true,
        },
        actorId
      );

      // Update only one field
      await webCandidateUpdateSettings(
        testId,
        { emailJobRecommendations: false },
        actorId
      );

      // Verify other fields unchanged
      const retrieved = await webCandidateInformationGetById(testId);
      expect(retrieved?.autoAttachCoverLetter).toBe(true);
      expect(retrieved?.defaultCoverLetter).toBe("Initial letter");
      expect(retrieved?.emailJobRecommendations).toBe(false);
    }, 30000);

    it("should throw error for non-existent candidate", async () => {
      const fakeId = generateTestId("fake_candidate");

      await expect(
        webCandidateUpdateSettings(
          fakeId,
          { emailJobRecommendations: true },
          actorId
        )
      ).rejects.toThrow("Candidate information not found");
    }, 30000);

    it("should handle rapid successive updates", async () => {
      const testId = generateTestId("settings_rapid");
      testIds.push(testId);

      await createTestCandidate(testId);

      // Simulate rapid toggle clicks
      await Promise.all([
        webCandidateUpdateSettings(
          testId,
          { emailJobRecommendations: true },
          actorId
        ),
        webCandidateUpdateSettings(
          testId,
          { autoAttachCoverLetter: true },
          actorId
        ),
      ]);

      const retrieved = await webCandidateInformationGetById(testId);
      expect(retrieved?.emailJobRecommendations).toBe(true);
      expect(retrieved?.autoAttachCoverLetter).toBe(true);
    }, 30000);
  });

  describe("webCandidateSetIsSearchable (CAND-R02 integration)", () => {
    it("should update isSearchable to true", async () => {
      const testId = generateTestId("searchable_on");
      testIds.push(testId);

      await createTestCandidate(testId);

      await webCandidateSetIsSearchable(testId, true, actorId);

      const retrieved = await webCandidateInformationGetById(testId);
      expect(retrieved?.isSearchable).toBe(true);
    }, 30000);

    it("should update isSearchable to false", async () => {
      const testId = generateTestId("searchable_off");
      testIds.push(testId);

      await createTestCandidate(testId);

      // Enable then disable
      await webCandidateSetIsSearchable(testId, true, actorId);
      await webCandidateSetIsSearchable(testId, false, actorId);

      const retrieved = await webCandidateInformationGetById(testId);
      expect(retrieved?.isSearchable).toBe(false);
    }, 30000);

    it("should preserve settings when updating isSearchable", async () => {
      const testId = generateTestId("searchable_preserve");
      testIds.push(testId);

      await createTestCandidate(testId);

      // Set settings first
      await webCandidateUpdateSettings(
        testId,
        {
          autoAttachCoverLetter: true,
          defaultCoverLetter: "Test letter",
          emailJobRecommendations: true,
        },
        actorId
      );

      // Update isSearchable
      await webCandidateSetIsSearchable(testId, true, actorId);

      // Verify settings preserved
      const retrieved = await webCandidateInformationGetById(testId);
      expect(retrieved?.isSearchable).toBe(true);
      expect(retrieved?.autoAttachCoverLetter).toBe(true);
      expect(retrieved?.defaultCoverLetter).toBe("Test letter");
      expect(retrieved?.emailJobRecommendations).toBe(true);
    }, 30000);
  });

  describe("Combined Settings Workflows", () => {
    it("should handle complete settings configuration flow", async () => {
      const testId = generateTestId("settings_complete");
      testIds.push(testId);

      await createTestCandidate(testId);

      // Step 1: Enable profile visibility
      await webCandidateSetIsSearchable(testId, true, actorId);

      // Step 2: Configure cover letter
      await webCandidateUpdateSettings(
        testId,
        {
          autoAttachCoverLetter: true,
          defaultCoverLetter: "Complete workflow cover letter",
        },
        actorId
      );

      // Step 3: Enable email notifications
      await webCandidateUpdateSettings(
        testId,
        { emailJobRecommendations: true },
        actorId
      );

      // Verify all settings
      const retrieved = await webCandidateInformationGetById(testId);
      expect(retrieved?.isSearchable).toBe(true);
      expect(retrieved?.autoAttachCoverLetter).toBe(true);
      expect(retrieved?.defaultCoverLetter).toBe(
        "Complete workflow cover letter"
      );
      expect(retrieved?.emailJobRecommendations).toBe(true);
    }, 30000);

    it("should handle settings reset flow", async () => {
      const testId = generateTestId("settings_reset");
      testIds.push(testId);

      await createTestCandidate(testId);

      // Set all settings
      await webCandidateUpdateSettings(
        testId,
        {
          isSearchable: true,
          autoAttachCoverLetter: true,
          defaultCoverLetter: "To be reset",
          emailJobRecommendations: true,
        },
        actorId
      );

      // Reset all settings
      await webCandidateSetIsSearchable(testId, false, actorId);
      await webCandidateUpdateSettings(
        testId,
        {
          autoAttachCoverLetter: false,
          defaultCoverLetter: "",
          emailJobRecommendations: false,
        },
        actorId
      );

      // Verify all reset
      const retrieved = await webCandidateInformationGetById(testId);
      expect(retrieved?.isSearchable).toBe(false);
      expect(retrieved?.autoAttachCoverLetter).toBe(false);
      expect(retrieved?.defaultCoverLetter).toBe("");
      expect(retrieved?.emailJobRecommendations).toBe(false);
    }, 30000);
  });

  describe("Edge Cases", () => {
    it("should handle Thai Unicode characters in cover letter", async () => {
      const testId = generateTestId("settings_thai");
      testIds.push(testId);

      await createTestCandidate(testId);

      const thaiText = `เรียน คุณผู้จัดการฝ่ายทรัพยากรบุคคล

ผม/ดิฉัน มีความสนใจในตำแหน่งที่เปิดรับสมัคร
และเชื่อว่าทักษะและประสบการณ์ของผม/ดิฉัน
จะเป็นประโยชน์ต่อบริษัท 🙏`;

      await webCandidateUpdateSettings(
        testId,
        { defaultCoverLetter: thaiText },
        actorId
      );

      const retrieved = await webCandidateInformationGetById(testId);
      expect(retrieved?.defaultCoverLetter).toBe(thaiText);
    }, 30000);

    it("should handle special characters in cover letter", async () => {
      const testId = generateTestId("settings_special");
      testIds.push(testId);

      await createTestCandidate(testId);

      const specialText = `Line 1\n\nLine 2\t\tTab\nLine 3 with "quotes" and 'apostrophes'`;

      await webCandidateUpdateSettings(
        testId,
        { defaultCoverLetter: specialText },
        actorId
      );

      const retrieved = await webCandidateInformationGetById(testId);
      expect(retrieved?.defaultCoverLetter).toBe(specialText);
    }, 30000);

    it("should handle undefined optional fields gracefully", async () => {
      const testId = generateTestId("settings_undefined");
      testIds.push(testId);

      await createTestCandidate(testId);

      // Update with empty object (no fields defined)
      await webCandidateUpdateSettings(testId, {}, actorId);

      const retrieved = await webCandidateInformationGetById(testId);
      expect(retrieved).toBeDefined();
    }, 30000);
  });
});
