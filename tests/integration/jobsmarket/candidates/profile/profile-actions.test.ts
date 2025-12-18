import { describe, it, expect } from "vitest";
import {
  webCandidateSaveWorkExperience,
  webCandidateSaveEducation,
  webCandidateSaveSkills,
  webCandidateSaveAboutMe,
  webCandidateInformationGetById,
} from "@/lib/database/actions/candidate-information";

/**
 * CAND-R02 Batch 5A: Profile Actions Integration Tests
 *
 * Tests CRUD operations for:
 * - Work experience
 * - Education
 * - Skills and languages
 * - About me section
 */

describe("Profile Edit Actions", () => {
  const TEST_UID = "bywpdkLOSTWjvV8JhhQL6LNditJ3";
  const ACTOR_ID = TEST_UID;

  it("should save and retrieve work experience", async () => {
    const works = [
      {
        company: "Test Company A",
        position: "Senior Developer",
        job_industry: "IT",
        job_function: "Development",
        start_month: 1,
        start_year: 2021,
        end_month: 6,
        end_year: 2023,
        is_current: false,
        salary: 60000,
        note: "Backend development",
      },
      {
        company: "Test Company B",
        position: "Lead Engineer",
        start_month: 7,
        start_year: 2023,
        is_current: true,
        salary: 75000,
      },
    ];

    // Save work experience
    await webCandidateSaveWorkExperience(TEST_UID, works, ACTOR_ID);

    // Retrieve and verify
    const result = await webCandidateInformationGetById(TEST_UID);
    expect(result).toBeDefined();
    expect(result.works).toBeDefined();
    expect(result.works!.length).toBe(2);

    const savedWork = result.works!.find((w) => w.company === "Test Company A");
    expect(savedWork).toBeDefined();
    expect(savedWork!.jobTitle).toBe("Senior Developer");
    expect(savedWork!.salary).toBe(60000);
    expect(savedWork!.isCurrent).toBe(false);

    const currentWork = result.works!.find((w) => w.company === "Test Company B");
    expect(currentWork).toBeDefined();
    expect(currentWork!.isCurrent).toBe(true);
  });

  it("should save and retrieve education with proper level mapping", async () => {
    const educations = [
      {
        institution: "University of Testing",
        level: 1, // Bachelor
        level_label: "Bachelor's Degree",
        faculty: "Computer Science",
        start_year: 2015,
        end_year: 2019,
        gpa: "3.75",
        highlights: "Dean's List",
      },
      {
        institution: "Graduate School",
        level: 2, // Master
        level_label: "Master's Degree",
        faculty: "Software Engineering",
        start_year: 2019,
        end_year: 2021,
        gpa: "3.90",
      },
    ];

    // Save education
    await webCandidateSaveEducation(TEST_UID, educations, ACTOR_ID);

    // Retrieve and verify
    const result = await webCandidateInformationGetById(TEST_UID);
    expect(result).toBeDefined();
    expect(result.educations).toBeDefined();
    expect(result.educations!.length).toBe(2);

    const bachelor = result.educations!.find(
      (e) => e.institution === "University of Testing"
    );
    expect(bachelor).toBeDefined();
    expect(bachelor!.educationLevel).toBe(1);
    expect(bachelor!.major).toBe("Computer Science");
    expect(bachelor!.gpax).toBe("3.75");

    const master = result.educations!.find(
      (e) => e.institution === "Graduate School"
    );
    expect(master).toBeDefined();
    expect(master!.educationLevel).toBe(2);
  });

  it("should save and retrieve skills and languages", async () => {
    const skillsData = {
      skills: [
        {
          name: "TypeScript",
          level: "expert",
          is_certified: false,
        },
        {
          name: "Python",
          level: "intermediate",
          is_certified: true,
          certificate_name: "Python Certified",
          certificate_score: "95",
        },
      ],
      languages: [
        {
          name: "Thai",
          level: "native",
          is_certified: false,
        },
        {
          name: "Japanese",
          level: "intermediate",
          is_certified: true,
          certificate_name: "JLPT N3",
          certificate_score: "120",
        },
      ],
    };

    // Save skills and languages
    await webCandidateSaveSkills(TEST_UID, skillsData, ACTOR_ID);

    // Retrieve and verify
    const result = await webCandidateInformationGetById(TEST_UID);
    expect(result).toBeDefined();
    expect(result.skills).toBeDefined();
    expect(result.languages).toBeDefined();

    // Verify skills
    expect(result.skills!.length).toBe(2);
    const tsSkill = result.skills!.find((s) => s.skillName === "TypeScript");
    expect(tsSkill).toBeDefined();
    expect(tsSkill!.expertiseLevel).toBe("expert");
    expect(tsSkill!.isCertified).toBe(false);

    const pythonSkill = result.skills!.find((s) => s.skillName === "Python");
    expect(pythonSkill).toBeDefined();
    expect(pythonSkill!.isCertified).toBe(true);
    expect(pythonSkill!.skillCertifiedScore).toBe("95");

    // Verify languages
    expect(result.languages!.length).toBe(2);
    const japanese = result.languages!.find((l) => l.languageName === "Japanese");
    expect(japanese).toBeDefined();
    expect(japanese!.isCertified).toBe(true);
    expect(japanese!.languageCertifiedScore).toBe("120");
  });

  it("should save and retrieve about me section", async () => {
    const aboutData = {
      about_me:
        "Passionate software engineer with 5+ years of experience in full-stack development. Specialized in React and Node.js.",
      area_of_expertise: "Full-stack Development, Cloud Architecture, DevOps",
      achievement:
        "Led team to deliver major project 2 months ahead of schedule. Reduced deployment time by 60%.",
    };

    // Save about me
    await webCandidateSaveAboutMe(TEST_UID, aboutData, ACTOR_ID);

    // Retrieve and verify
    const result = await webCandidateInformationGetById(TEST_UID);
    expect(result).toBeDefined();
    expect(result.aboutMe).toBe(aboutData.about_me);
    expect(result.areaOfExpertise).toBe(aboutData.area_of_expertise);
    expect(result.achievement).toBe(aboutData.achievement);
  });

  it("should update existing work experience (edit operation)", async () => {
    // First save
    const initialWorks = [
      {
        company: "Initial Company",
        position: "Junior Developer",
        start_month: 1,
        start_year: 2020,
        is_current: true,
        salary: 30000,
      },
    ];
    await webCandidateSaveWorkExperience(TEST_UID, initialWorks, ACTOR_ID);

    // Update with new data
    const updatedWorks = [
      {
        company: "Updated Company",
        position: "Senior Developer",
        start_month: 1,
        start_year: 2020,
        is_current: false,
        end_month: 12,
        end_year: 2023,
        salary: 55000,
        note: "Promoted to senior",
      },
    ];
    await webCandidateSaveWorkExperience(TEST_UID, updatedWorks, ACTOR_ID);

    // Verify update
    const result = await webCandidateInformationGetById(TEST_UID);
    expect(result).toBeDefined();
    expect(result.works).toBeDefined();
    expect(result.works!.length).toBe(1);
    expect(result.works![0].company).toBe("Updated Company");
    expect(result.works![0].jobTitle).toBe("Senior Developer");
    expect(result.works![0].salary).toBe(55000);
  });

  it("should delete work experience (by saving empty array)", async () => {
    // Clear all work experience
    await webCandidateSaveWorkExperience(TEST_UID, [], ACTOR_ID);

    // Verify deletion
    const result = await webCandidateInformationGetById(TEST_UID);
    expect(result).toBeDefined();
    expect(result.works).toBeDefined();
    expect(result.works!.length).toBe(0);
  });
});
