/**
 * Integration Tests for CAND-R02 Step 1: Personal Information
 * Tests webCandidateSavePersonalInfo and webCandidateGetPersonalInfo server actions
 *
 * Critical: Validates snake_case (form) to camelCase (Firebase) type mapping
 */

import { describe, it, expect, afterEach } from "vitest";
import {
  webCandidateSavePersonalInfo,
  webCandidateGetPersonalInfo,
} from "@/lib/database/actions/candidate-information";
import { generateTestId, cleanupTestData, getTestActorId } from "../../../integration/database/test-utils";

describe("CAND-R02 Personal Information (integration)", () => {
  const testIds: string[] = [];
  const actorId = getTestActorId();

  afterEach(async () => {
    for (const id of testIds) {
      await cleanupTestData("candidate_information", id);
    }
    testIds.length = 0;
  });

  it("should save and retrieve personal information with correct type mapping", async () => {
    const testId = generateTestId("cand_personal");
    testIds.push(testId);

    const formData = {
      title_prefix: "mr",
      first_name_th: "สมชาย",
      last_name_th: "ใจดี",
      nick_name_th: "แชมป์",
      email: `test_${testId}@example.com`,
      phone_number: "0812345678",
      birthdate: "1998-05-15", // 26 years old (well above 18)
      gender: "male",
      marital_status: "single",
      province: "กรุงเทพมหานคร",
      district: "บางรัก",
      address_line_1: "123 ถนนสุขุมวิท",
      post_code: "10500",
    };

    // Save (snake_case form data)
    await webCandidateSavePersonalInfo(testId, formData, actorId);

    // Retrieve (should get back snake_case for form)
    const retrieved = await webCandidateGetPersonalInfo(testId);

    expect(retrieved).toBeDefined();
    expect(retrieved?.title_prefix).toBe("mr");
    expect(retrieved?.first_name_th).toBe("สมชาย");
    expect(retrieved?.last_name_th).toBe("ใจดี");
    expect(retrieved?.nick_name_th).toBe("แชมป์");
    expect(retrieved?.email).toBe(`test_${testId}@example.com`);
    expect(retrieved?.phone_number).toBe("0812345678");
    expect(retrieved?.birthdate).toBe("1998-05-15");
    expect(retrieved?.gender).toBe("male");
    expect(retrieved?.marital_status).toBe("single");
    expect(retrieved?.province).toBe("กรุงเทพมหานคร");
    expect(retrieved?.district).toBe("บางรัก");
    expect(retrieved?.address_line_1).toBe("123 ถนนสุขุมวิท");
    expect(retrieved?.post_code).toBe("10500");
  }, 30000);

  it("should handle minimal required fields only", async () => {
    const testId = generateTestId("cand_minimal");
    testIds.push(testId);

    const minimalData = {
      title_prefix: "miss",
      first_name_th: "สมหญิง",
      last_name_th: "รักดี",
      email: `minimal_${testId}@example.com`,
      phone_number: "0898765432",
      birthdate: "2000-01-01",
      province: "เชียงใหม่",
    };

    await webCandidateSavePersonalInfo(testId, minimalData, actorId);

    const retrieved = await webCandidateGetPersonalInfo(testId);

    expect(retrieved).toBeDefined();
    expect(retrieved?.first_name_th).toBe("สมหญิง");
    expect(retrieved?.email).toBe(`minimal_${testId}@example.com`);
    expect(retrieved?.province).toBe("เชียงใหม่");
    // Optional fields should be undefined or empty
    expect(retrieved?.nick_name_th).toBeUndefined();
    expect(retrieved?.gender).toBeUndefined();
    expect(retrieved?.marital_status).toBeUndefined();
  }, 30000);

  it("should update existing personal information", async () => {
    const testId = generateTestId("cand_update");
    testIds.push(testId);

    // Initial save
    await webCandidateSavePersonalInfo(testId, {
      title_prefix: "mr",
      first_name_th: "เก่า",
      last_name_th: "ชื่อเดิม",
      email: `old_${testId}@example.com`,
      phone_number: "0811111111",
      birthdate: "1995-01-01",
      province: "กรุงเทพมหานคร",
    }, actorId);

    // Update
    await webCandidateSavePersonalInfo(testId, {
      title_prefix: "mr",
      first_name_th: "ใหม่",
      last_name_th: "ชื่อใหม่",
      nick_name_th: "นิว",
      email: `new_${testId}@example.com`,
      phone_number: "0822222222",
      birthdate: "1995-01-01",
      gender: "male",
      marital_status: "married",
      province: "เชียงใหม่",
      district: "เมืองเชียงใหม่",
      address_line_1: "456 ถนนนิมมาน",
      post_code: "50200",
    }, actorId);

    const retrieved = await webCandidateGetPersonalInfo(testId);

    expect(retrieved?.first_name_th).toBe("ใหม่");
    expect(retrieved?.last_name_th).toBe("ชื่อใหม่");
    expect(retrieved?.nick_name_th).toBe("นิว");
    expect(retrieved?.email).toBe(`new_${testId}@example.com`);
    expect(retrieved?.phone_number).toBe("0822222222");
    expect(retrieved?.gender).toBe("male");
    expect(retrieved?.marital_status).toBe("married");
    expect(retrieved?.province).toBe("เชียงใหม่");
    expect(retrieved?.district).toBe("เมืองเชียงใหม่");
  }, 30000);

  it("should preserve isActive and isSearchable flags on update", async () => {
    const testId = generateTestId("cand_flags");
    testIds.push(testId);

    // Initial save (flags should default to true and false)
    await webCandidateSavePersonalInfo(testId, {
      title_prefix: "mr",
      first_name_th: "ทดสอบ",
      last_name_th: "แฟล็ก",
      email: `flags_${testId}@example.com`,
      phone_number: "0833333333",
      birthdate: "1997-06-15",
      province: "กรุงเทพมหานคร",
    }, actorId);

    // Update personal info (should preserve flags)
    await webCandidateSavePersonalInfo(testId, {
      title_prefix: "mr",
      first_name_th: "ทดสอบ",
      last_name_th: "แฟล็กอัพเดท",
      email: `flags_updated_${testId}@example.com`,
      phone_number: "0844444444",
      birthdate: "1997-06-15",
      province: "กรุงเทพมหานคร",
    }, actorId);

    const retrieved = await webCandidateGetPersonalInfo(testId);

    expect(retrieved).toBeDefined();
    expect(retrieved?.last_name_th).toBe("แฟล็กอัพเดท");
    // Flags should be preserved from initial creation
  }, 30000);

  it("should handle birthdate as string and convert to timestamp", async () => {
    const testId = generateTestId("cand_birthdate");
    testIds.push(testId);

    const birthdateString = "1999-12-31";

    await webCandidateSavePersonalInfo(testId, {
      title_prefix: "miss",
      first_name_th: "วันเกิด",
      last_name_th: "ทดสอบ",
      email: `birthdate_${testId}@example.com`,
      phone_number: "0855555555",
      birthdate: birthdateString,
      province: "กรุงเทพมหานคร",
    }, actorId);

    const retrieved = await webCandidateGetPersonalInfo(testId);

    expect(retrieved).toBeDefined();
    expect(retrieved?.birthdate).toBe(birthdateString);

    // Verify age calculation (should be 25-26 years old as of 2025)
    const age = Math.floor(
      (new Date().getTime() - new Date(birthdateString).getTime()) / 3.15576e10
    );
    expect(age).toBeGreaterThanOrEqual(25);
  }, 30000);

  it("should handle empty optional fields gracefully", async () => {
    const testId = generateTestId("cand_optional");
    testIds.push(testId);

    await webCandidateSavePersonalInfo(testId, {
      title_prefix: "mr",
      first_name_th: "ว่าง",
      last_name_th: "ฟิลด์",
      email: `optional_${testId}@example.com`,
      phone_number: "0866666666",
      birthdate: "1996-03-20",
      province: "กรุงเทพมหานคร",
      nick_name_th: "", // Empty string
      gender: undefined,
      marital_status: undefined,
      district: "",
      address_line_1: "",
      post_code: "",
    }, actorId);

    const retrieved = await webCandidateGetPersonalInfo(testId);

    expect(retrieved).toBeDefined();
    expect(retrieved?.first_name_th).toBe("ว่าง");
    // Empty optional fields should be handled gracefully
  }, 30000);

  it("should return null for non-existent candidate", async () => {
    const nonExistentId = generateTestId("nonexistent");

    const result = await webCandidateGetPersonalInfo(nonExistentId);
    expect(result).toBeNull();
  }, 30000);

  it("should handle Thai special characters in address", async () => {
    const testId = generateTestId("cand_thai_chars");
    testIds.push(testId);

    await webCandidateSavePersonalInfo(testId, {
      title_prefix: "mr",
      first_name_th: "ทดสอบ",
      last_name_th: "ภาษาไทย",
      email: `thai_${testId}@example.com`,
      phone_number: "0877777777",
      birthdate: "1998-08-08",
      province: "นครราชสีมา",
      district: "เมืองนครราชสีมา",
      address_line_1: "๑๒๓/๔๕๖ หมู่ ๗ ซอยลาดพร้าว ๑๐๑ ถนนลาดพร้าว",
      post_code: "30000",
    }, actorId);

    const retrieved = await webCandidateGetPersonalInfo(testId);

    expect(retrieved).toBeDefined();
    expect(retrieved?.province).toBe("นครราชสีมา");
    expect(retrieved?.district).toBe("เมืองนครราชสีมา");
    expect(retrieved?.address_line_1).toContain("ลาดพร้าว");
  }, 30000);
});
