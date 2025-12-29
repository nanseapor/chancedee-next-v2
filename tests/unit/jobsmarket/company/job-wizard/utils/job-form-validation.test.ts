import { describe, it, expect } from "vitest";
import {
  validateStep1,
  validateStep2,
  validateStep3,
  validateTitle,
  validateSalaryRange,
  validateDescription,
  validateSkills,
  validateWorkLocation,
} from "@/lib/jobsmarket/company/job-form-validation";

describe("job-form-validation", () => {
  describe("validateTitle", () => {
    it("should require title", () => {
      const result = validateTitle("");

      expect(result.isValid).toBe(false);
      expect(result.error).toBe("กรุณากรอกชื่อตำแหน่งงาน");
    });

    it("should reject title shorter than 5 characters", () => {
      const result = validateTitle("Test");

      expect(result.isValid).toBe(false);
      expect(result.error).toBe("กรุณากรอกชื่อตำแหน่งงาน (5-100 ตัวอักษร)");
    });

    it("should reject title longer than 100 characters", () => {
      const longTitle = "a".repeat(101);
      const result = validateTitle(longTitle);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe("กรุณากรอกชื่อตำแหน่งงาน (5-100 ตัวอักษร)");
    });

    it("should accept valid title", () => {
      const result = validateTitle("Frontend Developer");

      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should accept title exactly 5 characters", () => {
      const result = validateTitle("TestJ");

      expect(result.isValid).toBe(true);
    });

    it("should accept title exactly 100 characters", () => {
      const title = "a".repeat(100);
      const result = validateTitle(title);

      expect(result.isValid).toBe(true);
    });
  });

  describe("validateSalaryRange", () => {
    it("should allow empty salary fields", () => {
      const result = validateSalaryRange(undefined, undefined);

      expect(result.isValid).toBe(true);
    });

    it("should allow only min salary", () => {
      const result = validateSalaryRange(30000, undefined);

      expect(result.isValid).toBe(true);
    });

    it("should allow only max salary", () => {
      const result = validateSalaryRange(undefined, 50000);

      expect(result.isValid).toBe(true);
    });

    it("should reject negative min salary", () => {
      const result = validateSalaryRange(-1000, undefined);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe("เงินเดือนต้องเป็นจำนวนบวก");
    });

    it("should reject negative max salary", () => {
      const result = validateSalaryRange(undefined, -5000);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe("เงินเดือนต้องเป็นจำนวนบวก");
    });

    it("should reject max salary less than min salary", () => {
      const result = validateSalaryRange(50000, 30000);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe("เงินเดือนสูงสุดต้องมากกว่าต่ำสุด");
    });

    it("should accept max salary equal to min salary", () => {
      const result = validateSalaryRange(40000, 40000);

      expect(result.isValid).toBe(true);
    });

    it("should accept valid salary range", () => {
      const result = validateSalaryRange(30000, 50000);

      expect(result.isValid).toBe(true);
    });
  });

  describe("validateDescription", () => {
    it("should require description", () => {
      const result = validateDescription("");

      expect(result.isValid).toBe(false);
      expect(result.error).toBe("กรุณากรอกรายละเอียดงาน");
    });

    it("should reject description shorter than 50 characters", () => {
      const shortDesc = "This is too short";
      const result = validateDescription(shortDesc);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe("กรุณากรอกรายละเอียดงาน (อย่างน้อย 50 ตัวอักษร)");
    });

    it("should accept description exactly 50 characters", () => {
      const desc = "a".repeat(50);
      const result = validateDescription(desc);

      expect(result.isValid).toBe(true);
    });

    it("should accept valid description", () => {
      const desc =
        "We are looking for an experienced developer to join our team...";
      const result = validateDescription(desc);

      expect(result.isValid).toBe(true);
    });

    it("should strip HTML tags before counting characters", () => {
      const htmlDesc = "<p>Short text</p>"; // Less than 50 without tags
      const result = validateDescription(htmlDesc);

      expect(result.isValid).toBe(false);
    });

    it("should accept HTML content with sufficient text", () => {
      const htmlDesc = `<p>${"a".repeat(50)}</p>`;
      const result = validateDescription(htmlDesc);

      expect(result.isValid).toBe(true);
    });
  });

  describe("validateSkills", () => {
    it("should require at least one skill", () => {
      const result = validateSkills([]);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe("กรุณาระบุทักษะที่ต้องการอย่างน้อย 1 รายการ");
    });

    it("should accept single skill", () => {
      const result = validateSkills(["React"]);

      expect(result.isValid).toBe(true);
    });

    it("should accept multiple skills", () => {
      const result = validateSkills(["React", "TypeScript", "Node.js"]);

      expect(result.isValid).toBe(true);
    });

    it("should trim and filter empty skills", () => {
      const result = validateSkills(["React", "  ", "", "TypeScript"]);

      // Should validate only non-empty skills
      expect(result.isValid).toBe(true);
    });

    it("should reject all empty skills", () => {
      const result = validateSkills(["  ", "", "   "]);

      expect(result.isValid).toBe(false);
    });
  });

  describe("validateWorkLocation", () => {
    it("should require workModel", () => {
      const result = validateWorkLocation(undefined, undefined);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe("กรุณาเลือกรูปแบบการทำงาน");
    });

    it("should require province for onsite work", () => {
      const result = validateWorkLocation("onsite", undefined);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe("กรุณาเลือกจังหวัด");
    });

    it("should require province for hybrid work", () => {
      const result = validateWorkLocation("hybrid", undefined);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe("กรุณาเลือกจังหวัด");
    });

    it("should not require province for remote work", () => {
      const result = validateWorkLocation("remote", undefined);

      expect(result.isValid).toBe(true);
    });

    it("should accept onsite with province", () => {
      const result = validateWorkLocation("onsite", "กรุงเทพมหานคร");

      expect(result.isValid).toBe(true);
    });

    it("should accept hybrid with province", () => {
      const result = validateWorkLocation("hybrid", "เชียงใหม่");

      expect(result.isValid).toBe(true);
    });
  });

  describe("validateStep1", () => {
    const validStep1Data = {
      title: "Frontend Developer",
      jobType: "fulltime" as const,
      jobLevel: "mid",
      numberOfPosition: 1,
      hideSalary: false,
      skills: [],
      workModel: undefined,
    };

    it("should validate all required fields", () => {
      const result = validateStep1({
        title: "",
        jobType: undefined,
        jobLevel: undefined,
        numberOfPosition: 1,
        hideSalary: false,
        skills: [],
        workModel: undefined,
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.title).toBeDefined();
      expect(result.errors.jobType).toBeDefined();
      expect(result.errors.jobLevel).toBeDefined();
    });

    it("should pass with all required fields filled", () => {
      const result = validateStep1(validStep1Data);

      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors).length).toBe(0);
    });

    it("should validate salary range if provided", () => {
      const result = validateStep1({
        ...validStep1Data,
        minSalary: 50000,
        maxSalary: 30000, // Invalid: max < min
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.salary).toBeDefined();
    });

    it("should require numberOfPosition to be at least 1", () => {
      const result = validateStep1({
        ...validStep1Data,
        numberOfPosition: 0,
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.numberOfPosition).toBe("กรุณาระบุจำนวนตำแหน่งที่รับ");
    });
  });

  describe("validateStep2", () => {
    const validStep2Data = {
      title: "Test",
      jobDescriptionDetails: "a".repeat(50),
      skills: ["React"],
      jobType: "fulltime" as const,
      jobLevel: "mid",
      numberOfPosition: 1,
      hideSalary: false,
      workModel: undefined,
    };

    it("should validate required description and skills", () => {
      const result = validateStep2({
        title: "",
        jobDescriptionDetails: "",
        skills: [],
        jobType: undefined,
        jobLevel: undefined,
        numberOfPosition: 1,
        hideSalary: false,
        workModel: undefined,
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.jobDescriptionDetails).toBeDefined();
      expect(result.errors.skills).toBeDefined();
    });

    it("should pass with valid description and skills", () => {
      const result = validateStep2(validStep2Data);

      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors).length).toBe(0);
    });

    it("should allow empty optional fields", () => {
      const result = validateStep2({
        ...validStep2Data,
        jobResponsibilitiesDetails: undefined,
        jobRequirementsDetails: undefined,
        benefits: undefined,
      });

      expect(result.isValid).toBe(true);
    });
  });

  describe("validateStep3", () => {
    const validStep3Data = {
      title: "Test",
      workModel: "remote" as const,
      jobType: "fulltime" as const,
      jobLevel: "mid",
      numberOfPosition: 1,
      hideSalary: false,
      skills: [],
    };

    it("should validate workModel is provided", () => {
      const result = validateStep3({
        title: "",
        workModel: undefined,
        jobType: undefined,
        jobLevel: undefined,
        numberOfPosition: 1,
        hideSalary: false,
        skills: [],
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.workModel).toBeDefined();
    });

    it("should pass for remote work without province", () => {
      const result = validateStep3(validStep3Data);

      expect(result.isValid).toBe(true);
    });

    it("should require province for onsite work", () => {
      const result = validateStep3({
        ...validStep3Data,
        workModel: "onsite",
        province: undefined,
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.province).toBeDefined();
    });

    it("should pass for onsite with province", () => {
      const result = validateStep3({
        ...validStep3Data,
        workModel: "onsite",
        province: "กรุงเทพมหานคร",
      });

      expect(result.isValid).toBe(true);
    });
  });
});
