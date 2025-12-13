/**
 * Integration Tests for company-information actions
 * Tests company profile CRUD operations, ID generation, and filtering
 */

import { describe, it, expect, afterEach } from "vitest";
import {
  webCompanyInformationCreate,
  webCompanyInformationGetById,
  webCompanyInformationGetByFilter,
  webCompanyInformationUpdate,
  webCompanyInformationDelete,
  webCompanyInformationGenerateId,
} from "@/lib/database/actions/company-information";
import { generateTestId, cleanupTestData, getTestActorId, createWhereFilter } from "../test-utils";

describe("company-information actions (integration)", () => {
  const testIds: string[] = [];
  const actorId = getTestActorId();

  afterEach(async () => {
    for (const id of testIds) {
      await cleanupTestData("company_information", id);
    }
    testIds.length = 0;
  });

  it("should create and read company information", async () => {
    const testId = generateTestId("company_info");
    testIds.push(testId);

    // Create
    const createdId = await webCompanyInformationCreate(
      {
        uid: testId,
        companyName: "บริษัท ทดสอบ จำกัด",
        taxId: "0123456789012",
        shortDescription: "บริษัทผู้ให้บริการเทคโนโลยี",
        industry: "Technology",
        website: "https://testcompany.com",
        coverPhoto: "https://example.com/cover.png",
        profilePhoto: "https://example.com/logo.png",
        companySize: "M",
        status: "approved",
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
    const retrieved = await webCompanyInformationGetById(testId);

    expect(retrieved).toBeDefined();
    expect(retrieved?.uid).toBe(testId);
    expect(retrieved?.companyName).toBe("บริษัท ทดสอบ จำกัด");
    expect(retrieved?.taxId).toBe("0123456789012");
    expect(retrieved?.companySize).toBe("M");
    expect(retrieved?.status).toBe("approved");
    expect(retrieved?.isActive).toBe(true);
  }, 30000);

  it("should update company information", async () => {
    const testId = generateTestId("company_info");
    testIds.push(testId);

    // Create
    await webCompanyInformationCreate(
      {
        uid: testId,
        companyName: "บริษัท เดิม จำกัด",
        taxId: "0123456789012",
        companySize: "S",
        industry: "Technology",
        status: "pending",
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
    await webCompanyInformationUpdate(
      {
        uid: testId,
        companyName: "บริษัท ใหม่ จำกัด",
        taxId: "0123456789012",
        companySize: "L",
        industry: "E-commerce",
        website: "https://newcompany.com",
        status: "approved",
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
    const retrieved = await webCompanyInformationGetById(testId);

    expect(retrieved?.companyName).toBe("บริษัท ใหม่ จำกัด");
    expect(retrieved?.companySize).toBe("L");
    expect(retrieved?.industry).toBe("E-commerce");
    expect(retrieved?.website).toBe("https://newcompany.com");
    expect(retrieved?.status).toBe("approved");
  }, 30000);

  it("should generate unique company ID", async () => {
    const generatedId1 = await webCompanyInformationGenerateId();
    const generatedId2 = await webCompanyInformationGenerateId();

    expect(generatedId1).toBeDefined();
    expect(generatedId2).toBeDefined();
    expect(generatedId1).not.toBe(generatedId2);
  }, 30000);

  it("should filter companies by industry", async () => {
    const testId = generateTestId("company_info");
    testIds.push(testId);

    // Create
    await webCompanyInformationCreate(
      {
        uid: testId,
        companyName: "บริษัท ฟินเทค จำกัด",
        taxId: "0123456789012",
        industry: "Financial Technology",
        status: "approved",
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
    const results = await webCompanyInformationGetByFilter(
      createWhereFilter("industry", "==", "Financial Technology")
    );

    expect(results).toBeDefined();
    const testRecord = results!.find(r => r.uid === testId);
    expect(testRecord).toBeDefined();
    expect(testRecord?.industry).toBe("Financial Technology");
  }, 30000);

  it("should filter companies by size", async () => {
    const testId = generateTestId("company_info");
    testIds.push(testId);

    // Create
    await webCompanyInformationCreate(
      {
        uid: testId,
        companyName: "บริษัท ใหญ่ จำกัด",
        taxId: "0123456789012",
        companySize: "L",
        industry: "Enterprise",
        status: "approved",
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
    const results = await webCompanyInformationGetByFilter(
      createWhereFilter("company_size", "==", "L")
    );

    expect(results).toBeDefined();
    const testRecord = results!.find(r => r.uid === testId);
    expect(testRecord).toBeDefined();
    expect(testRecord?.companySize).toBe("L");
  }, 30000);

  it("should filter active companies", async () => {
    const testId = generateTestId("company_info");
    testIds.push(testId);

    // Create
    await webCompanyInformationCreate(
      {
        uid: testId,
        companyName: "บริษัท ทำงาน จำกัด",
        taxId: "0123456789012",
        isActive: true,
        industry: "Technology",
        status: "approved",
        createdBy: actorId,
        updatedBy: actorId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      actorId,
      testId
    );

    // Filter
    const results = await webCompanyInformationGetByFilter(
      createWhereFilter("is_active", "==", true)
    );

    expect(results).toBeDefined();
    const testRecord = results!.find(r => r.uid === testId);
    expect(testRecord).toBeDefined();
    expect(testRecord?.isActive).toBe(true);
  }, 30000);

  it("should handle non-existent company gracefully", async () => {
    const nonExistentId = generateTestId("nonexistent");

    const result = await webCompanyInformationGetById(nonExistentId);
    expect(result).toBeNull();
  }, 30000);

  it("should delete company information", async () => {
    const testId = generateTestId("company_info");
    testIds.push(testId);

    // Create
    await webCompanyInformationCreate(
      {
        uid: testId,
        companyName: "บริษัท ลบ จำกัด",
        taxId: "0123456789012",
        industry: "Test",
        status: "pending",
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
    let retrieved = await webCompanyInformationGetById(testId);
    expect(retrieved).toBeDefined();

    // Delete
    await webCompanyInformationDelete(testId);

    // Verify it's deleted
    retrieved = await webCompanyInformationGetById(testId);
    expect(retrieved).toBeNull();
  }, 30000);

  it("should create company with complete profile", async () => {
    const testId = generateTestId("company_complete");
    testIds.push(testId);

    // Create with full details
    await webCompanyInformationCreate(
      {
        uid: testId,
        companyName: "บริษัท สมบูรณ์ จำกัด",
        taxId: "0123456789012",
        shortDescription: "บริษัทที่มีข้อมูลครบถ้วน",
        overview: "ภาพรวมของบริษัทที่ครบถ้วน",
        website: "https://complete.com",
        coverPhoto: "https://example.com/complete-cover.png",
        profilePhoto: "https://example.com/complete-logo.png",
        videoLink: "https://youtube.com/watch?v=example",
        companySize: "L",
        industry: "Technology",
        travelMode: "BTS",
        travelStation: "สยาม",
        benefitsDetails: "ประกันสุขภาพ, โบนัสประจำปี, วันหยุดพักร้อน",
        mapLocation: "https://maps.google.com/?q=13.7563,100.5018",
        status: "approved",
        isActive: true,
        staff: ["staff1", "staff2", "staff3"],
        createdBy: actorId,
        updatedBy: actorId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      actorId,
      testId
    );

    // Read
    const retrieved = await webCompanyInformationGetById(testId);

    expect(retrieved?.companyName).toBe("บริษัท สมบูรณ์ จำกัด");
    expect(retrieved?.taxId).toBe("0123456789012");
    expect(retrieved?.shortDescription).toBe("บริษัทที่มีข้อมูลครบถ้วน");
    expect(retrieved?.overview).toBe("ภาพรวมของบริษัทที่ครบถ้วน");
    expect(retrieved?.companySize).toBe("L");
    expect(retrieved?.benefitsDetails).toBe("ประกันสุขภาพ, โบนัสประจำปี, วันหยุดพักร้อน");
    expect(retrieved?.staff?.length).toBe(3);
    expect(retrieved?.travelMode).toBe("BTS");
    expect(retrieved?.travelStation).toBe("สยาม");
  }, 30000);
});
