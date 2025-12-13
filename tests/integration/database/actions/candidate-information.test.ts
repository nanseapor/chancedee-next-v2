/**
 * Integration Tests for candidate-information actions
 * Tests candidate profile CRUD operations and filtering
 */

import { describe, it, expect, afterEach } from "vitest";
import {
  webCandidateInformationCreate,
  webCandidateInformationGetById,
  webCandidateInformationGetByFilter,
  webCandidateInformationUpdate,
  webCandidateInformationDelete,
} from "@/lib/database/actions/candidate-information";
import { generateTestId, cleanupTestData, getTestActorId, createWhereFilter } from "../test-utils";

describe("candidate-information actions (integration)", () => {
  const testIds: string[] = [];
  const actorId = getTestActorId();

  afterEach(async () => {
    for (const id of testIds) {
      await cleanupTestData("candidate_information", id);
    }
    testIds.length = 0;
  });

  it("should create and read candidate information", async () => {
    const testId = generateTestId("candidate_info");
    testIds.push(testId);

    // Create - using correct field names from FirebaseCandidateData type
    const createdId = await webCandidateInformationCreate(
      {
        firstnameTH: "สมชาย",
        lastnameTH: "ใจดี",
        nicknameTH: "แชมป์",
        phone: "0812345678",
        email: `candidate_${testId}@example.com`,
        birthdate: Date.now() - (25 * 365 * 24 * 60 * 60 * 1000), // 25 years ago
        nationality: "Thai",
        maritalStatus: "single",
        millitaryStatus: "exempted",
        religion: "buddhist",
        bloodgroup: "A",
        educations: [{
          institution: "มหาวิทยาลัยธรรมศาสตร์",
          educationLevel: 3, // Bachelor's degree
          educationLabel: "ปริญญาตรี",
          major: "วิทยาการคอมพิวเตอร์",
          startYear: 2016,
          endYear: 2020,
          gpax: "3.5",
        }],
        works: [{
          company: "ABC Company",
          jobTitle: "Software Developer",
          startMonth: 1,
          startYear: 2020,
          endMonth: 12,
          endYear: 2021,
          salary: 35000,
          isCurrent: false,
          isNewGraduate: false,
          note: "Develop web applications",
        }],
        skills: [{
          skillName: "JavaScript",
          expertiseLevel: "intermediate",
          isCertified: false,
        }, {
          skillName: "TypeScript",
          expertiseLevel: "intermediate",
          isCertified: false,
        }, {
          skillName: "React",
          expertiseLevel: "advanced",
          isCertified: false,
        }],
        languages: [{
          languageName: "Thai",
          languageLevel: "native",
          isCertified: false,
        }, {
          languageName: "English",
          languageLevel: "intermediate",
          isCertified: false,
        }],
        isActive: true,
        isSearchable: true,
        createdBy: actorId,
        updatedBy: actorId,
      } as any,
      actorId,
      testId
    );

    expect(createdId).toBe(testId);

    // Read
    const retrieved = await webCandidateInformationGetById(testId);

    expect(retrieved).toBeDefined();
    expect(retrieved?.uid).toBe(testId);
    expect(retrieved?.firstnameTH).toBe("สมชาย");
    expect(retrieved?.email).toBe(`candidate_${testId}@example.com`);
    expect(retrieved?.skills?.length).toBe(3);
    expect(retrieved?.educations?.length).toBe(1);
    expect(retrieved?.educations?.[0]?.institution).toBe("มหาวิทยาลัยธรรมศาสตร์");
  }, 30000);

  it("should update candidate information", async () => {
    const testId = generateTestId("candidate_info");
    testIds.push(testId);

    // Create
    await webCandidateInformationCreate(
      {
        firstnameTH: "สมชาย",
        lastnameTH: "ใจดี",
        email: `candidate_${testId}@example.com`,
        skills: [{
          skillName: "JavaScript",
          expertiseLevel: "beginner",
          isCertified: false,
        }],
        isActive: true,
        isSearchable: true,
        createdBy: actorId,
        updatedBy: actorId,
      } as any,
      actorId,
      testId
    );

    // Update
    await webCandidateInformationUpdate(
      {
        firstnameTH: "สมหญิง",
        lastnameTH: "รักษ์ดี",
        email: `updated_candidate_${testId}@example.com`,
        skills: [{
          skillName: "JavaScript",
          expertiseLevel: "intermediate",
          isCertified: false,
        }, {
          skillName: "TypeScript",
          expertiseLevel: "intermediate",
          isCertified: false,
        }, {
          skillName: "React",
          expertiseLevel: "advanced",
          isCertified: false,
        }, {
          skillName: "Node.js",
          expertiseLevel: "advanced",
          isCertified: false,
        }],
        isActive: true,
        isSearchable: true,
        createdBy: actorId,
        updatedBy: actorId,
      } as any,
      actorId,
      testId
    );

    // Read
    const retrieved = await webCandidateInformationGetById(testId);

    expect(retrieved?.firstnameTH).toBe("สมหญิง");
    expect(retrieved?.skills?.length).toBe(4);
    expect(retrieved?.skills?.some(s => s.skillName === "Node.js")).toBe(true);
  }, 30000);

  it("should filter candidates by email", async () => {
    const testId = generateTestId("candidate_info");
    testIds.push(testId);
    const uniqueEmail = `filter_candidate_${testId}@example.com`;

    // Create
    await webCandidateInformationCreate(
      {
        firstnameTH: "ทดสอบ",
        lastnameTH: "ฟิลเตอร์",
        email: uniqueEmail,
        isActive: true,
        isSearchable: true,
        createdBy: actorId,
        updatedBy: actorId,
      } as any,
      actorId,
      testId
    );

    // Filter
    const results = await webCandidateInformationGetByFilter(
      createWhereFilter("email", "==", uniqueEmail)
    );

    expect(results).toBeDefined();
    expect(results?.length).toBeGreaterThan(0);
    const testRecord = results!.find(r => r.uid === testId);
    expect(testRecord).toBeDefined();
    expect(testRecord?.email).toBe(uniqueEmail);
  }, 30000);

  it("should filter candidates by experience years", async () => {
    const testId = generateTestId("candidate_info");
    testIds.push(testId);

    // Create
    await webCandidateInformationCreate(
      {
        firstnameTH: "ทดสอบ",
        lastnameTH: "ประสบการณ์",
        email: `exp_${testId}@example.com`,
        experienceYears: 5,
        isActive: true,
        isSearchable: true,
        createdBy: actorId,
        updatedBy: actorId,
      } as any,
      actorId,
      testId
    );

    // Filter - using experience_years (snake_case for Firestore filter)
    const results = await webCandidateInformationGetByFilter(
      createWhereFilter("experience_years", ">=", 3)
    );

    expect(results).toBeDefined();
    const testRecord = results!.find(r => r.uid === testId);
    expect(testRecord).toBeDefined();
    expect(testRecord?.experienceYears).toBeGreaterThanOrEqual(3);
  }, 30000);

  it("should filter active candidates", async () => {
    const testId = generateTestId("candidate_info");
    testIds.push(testId);

    // Create
    await webCandidateInformationCreate(
      {
        firstnameTH: "ทดสอบ",
        lastnameTH: "ใช้งาน",
        email: `active_${testId}@example.com`,
        isActive: true,
        isSearchable: true,
        createdBy: actorId,
        updatedBy: actorId,
      } as any,
      actorId,
      testId
    );

    // Filter - using is_active (snake_case for Firestore filter)
    const results = await webCandidateInformationGetByFilter(
      createWhereFilter("is_active", "==", true)
    );

    expect(results).toBeDefined();
    const testRecord = results!.find(r => r.uid === testId);
    expect(testRecord).toBeDefined();
    expect(testRecord?.isActive).toBe(true);
  }, 30000);

  it("should handle non-existent candidate gracefully", async () => {
    const nonExistentId = generateTestId("nonexistent");

    const result = await webCandidateInformationGetById(nonExistentId);
    expect(result).toBeNull();
  }, 30000);

  it("should delete candidate information", async () => {
    const testId = generateTestId("candidate_info");
    testIds.push(testId);

    // Create
    await webCandidateInformationCreate(
      {
        firstnameTH: "ลบ",
        lastnameTH: "ทิ้ง",
        email: `delete_${testId}@example.com`,
        isActive: true,
        isSearchable: true,
        createdBy: actorId,
        updatedBy: actorId,
      } as any,
      actorId,
      testId
    );

    // Verify it exists
    let retrieved = await webCandidateInformationGetById(testId);
    expect(retrieved).toBeDefined();

    // Delete
    await webCandidateInformationDelete(testId);

    // Verify it's deleted
    retrieved = await webCandidateInformationGetById(testId);
    expect(retrieved).toBeNull();
  }, 30000);

  it("should create candidate with complex nested data", async () => {
    const testId = generateTestId("candidate_complex");
    testIds.push(testId);

    // Create with multiple education and work experience entries
    await webCandidateInformationCreate(
      {
        firstnameTH: "สมบูรณ์",
        lastnameTH: "ข้อมูล",
        email: `complex_${testId}@example.com`,
        educations: [
          {
            institution: "จุฬาลงกรณ์มหาวิทยาลัย",
            educationLevel: 3,
            educationLabel: "ปริญญาตรี",
            major: "วิศวกรรมคอมพิวเตอร์",
            startYear: 2014,
            endYear: 2018,
            gpax: "3.8",
          },
          {
            institution: "MIT",
            educationLevel: 4,
            educationLabel: "ปริญญาโท",
            major: "Computer Science",
            startYear: 2018,
            endYear: 2020,
            gpax: "3.9",
          },
        ],
        works: [
          {
            company: "Tech Startup A",
            jobTitle: "Junior Developer",
            startMonth: 1,
            startYear: 2020,
            endMonth: 12,
            endYear: 2021,
            salary: 30000,
            isCurrent: false,
            isNewGraduate: false,
            note: "Frontend development",
          },
          {
            company: "Big Tech Company",
            jobTitle: "Senior Developer",
            startMonth: 1,
            startYear: 2022,
            salary: 80000,
            isCurrent: true,
            isNewGraduate: false,
            note: "Full-stack development and team lead",
          },
        ],
        skills: [{
          skillName: "JavaScript",
          expertiseLevel: "expert",
          isCertified: false,
        }, {
          skillName: "TypeScript",
          expertiseLevel: "expert",
          isCertified: false,
        }, {
          skillName: "React",
          expertiseLevel: "expert",
          isCertified: false,
        }, {
          skillName: "Node.js",
          expertiseLevel: "expert",
          isCertified: false,
        }, {
          skillName: "Docker",
          expertiseLevel: "advanced",
          isCertified: true,
          skillCertifiedName: "Docker Certified Associate",
        }, {
          skillName: "Kubernetes",
          expertiseLevel: "intermediate",
          isCertified: false,
        }],
        languages: [{
          languageName: "Thai",
          languageLevel: "native",
          isCertified: false,
        }, {
          languageName: "English",
          languageLevel: "advanced",
          isCertified: true,
          languageCertifiedName: "TOEIC",
          languageCertifiedScore: "850",
        }, {
          languageName: "Chinese",
          languageLevel: "beginner",
          isCertified: false,
        }],
        experienceYears: 4,
        isActive: true,
        isSearchable: true,
        createdBy: actorId,
        updatedBy: actorId,
      } as any,
      actorId,
      testId
    );

    // Read
    const retrieved = await webCandidateInformationGetById(testId);

    expect(retrieved?.educations?.length).toBe(2);
    expect(retrieved?.works?.length).toBe(2);
    expect(retrieved?.skills?.length).toBe(6);
    expect(retrieved?.languages?.length).toBe(3);
    expect(retrieved?.works?.[1]?.isCurrent).toBe(true);
    expect(retrieved?.experienceYears).toBe(4);
  }, 30000);
});
