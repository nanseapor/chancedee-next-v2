/**
 * Job Form Validation
 * Validation utilities for COMP-R06: Job Creation Wizard
 */

import type {
  JobFormData,
  StepValidation,
  FieldValidation,
} from "@/types/jobsmarket/job-wizard.types";

/**
 * Validate job title
 * - Required
 * - Min 5 chars, max 100 chars
 */
export function validateTitle(title: string): FieldValidation {
  if (!title || title.trim().length === 0) {
    return {
      isValid: false,
      error: "กรุณากรอกชื่อตำแหน่งงาน",
    };
  }

  const trimmed = title.trim();
  if (trimmed.length < 5 || trimmed.length > 100) {
    return {
      isValid: false,
      error: "กรุณากรอกชื่อตำแหน่งงาน (5-100 ตัวอักษร)",
    };
  }

  return { isValid: true };
}

/**
 * Validate salary range
 * - Both optional
 * - Must be positive
 * - Max >= min
 */
export function validateSalaryRange(
  minSalary?: number,
  maxSalary?: number
): FieldValidation {
  // Both empty is OK
  if (minSalary === undefined && maxSalary === undefined) {
    return { isValid: true };
  }

  // Check for negative values
  if (minSalary !== undefined && minSalary < 0) {
    return {
      isValid: false,
      error: "เงินเดือนต้องเป็นจำนวนบวก",
    };
  }

  if (maxSalary !== undefined && maxSalary < 0) {
    return {
      isValid: false,
      error: "เงินเดือนต้องเป็นจำนวนบวก",
    };
  }

  // If both provided, max must be >= min
  if (
    minSalary !== undefined &&
    maxSalary !== undefined &&
    maxSalary < minSalary
  ) {
    return {
      isValid: false,
      error: "เงินเดือนสูงสุดต้องมากกว่าต่ำสุด",
    };
  }

  return { isValid: true };
}

/**
 * Strip HTML tags from string
 */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

/**
 * Validate job description
 * - Required
 * - Min 50 chars (plain text after stripping HTML)
 */
export function validateDescription(description: string): FieldValidation {
  if (!description || description.trim().length === 0) {
    return {
      isValid: false,
      error: "กรุณากรอกรายละเอียดงาน",
    };
  }

  const plainText = stripHtml(description).trim();
  if (plainText.length < 50) {
    return {
      isValid: false,
      error: "กรุณากรอกรายละเอียดงาน (อย่างน้อย 50 ตัวอักษร)",
    };
  }

  return { isValid: true };
}

/**
 * Validate skills array
 * - Required
 * - Min 1 skill (after filtering empty strings)
 */
export function validateSkills(skills: string[]): FieldValidation {
  const validSkills = skills.filter((s) => s.trim().length > 0);

  if (validSkills.length === 0) {
    return {
      isValid: false,
      error: "กรุณาระบุทักษะที่ต้องการอย่างน้อย 1 รายการ",
    };
  }

  return { isValid: true };
}

/**
 * Validate work location
 * - workModel required
 * - province required if onsite or hybrid
 */
export function validateWorkLocation(
  workModel?: "onsite" | "hybrid" | "remote",
  province?: string
): FieldValidation {
  if (!workModel) {
    return {
      isValid: false,
      error: "กรุณาเลือกรูปแบบการทำงาน",
    };
  }

  // Province required for onsite and hybrid
  if ((workModel === "onsite" || workModel === "hybrid") && !province) {
    return {
      isValid: false,
      error: "กรุณาเลือกจังหวัด",
    };
  }

  return { isValid: true };
}

/**
 * Validate Step 1: Basic Information
 */
export function validateStep1(formData: JobFormData): StepValidation {
  const errors: Record<string, string> = {};

  // Title
  const titleValidation = validateTitle(formData.title);
  if (!titleValidation.isValid && titleValidation.error) {
    errors.title = titleValidation.error;
  }

  // Job Type
  if (!formData.jobType) {
    errors.jobType = "กรุณาเลือกประเภทการจ้างงาน";
  }

  // Job Level
  if (!formData.jobLevel) {
    errors.jobLevel = "กรุณาเลือกระดับตำแหน่ง";
  }

  // Number of Positions
  if (!formData.numberOfPosition || formData.numberOfPosition < 1) {
    errors.numberOfPosition = "กรุณาระบุจำนวนตำแหน่งที่รับ";
  }

  // Salary Range (optional but must be valid if provided)
  const salaryValidation = validateSalaryRange(
    formData.minSalary,
    formData.maxSalary
  );
  if (!salaryValidation.isValid && salaryValidation.error) {
    errors.salary = salaryValidation.error;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate Step 2: Job Details
 */
export function validateStep2(formData: JobFormData): StepValidation {
  const errors: Record<string, string> = {};

  // Job Description
  if (formData.jobDescriptionDetails) {
    const descValidation = validateDescription(formData.jobDescriptionDetails);
    if (!descValidation.isValid && descValidation.error) {
      errors.jobDescriptionDetails = descValidation.error;
    }
  } else {
    errors.jobDescriptionDetails = "กรุณากรอกรายละเอียดงาน";
  }

  // Skills
  const skillsValidation = validateSkills(formData.skills);
  if (!skillsValidation.isValid && skillsValidation.error) {
    errors.skills = skillsValidation.error;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate Step 3: Work Location
 */
export function validateStep3(formData: JobFormData): StepValidation {
  const errors: Record<string, string> = {};

  // Work Model and Province
  const locationValidation = validateWorkLocation(
    formData.workModel,
    formData.province
  );
  if (!locationValidation.isValid && locationValidation.error) {
    if (locationValidation.error.includes("รูปแบบการทำงาน")) {
      errors.workModel = locationValidation.error;
    } else {
      errors.province = locationValidation.error;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate entire form (all steps)
 */
export function validateAllSteps(formData: JobFormData): StepValidation {
  const step1 = validateStep1(formData);
  const step2 = validateStep2(formData);
  const step3 = validateStep3(formData);

  const allErrors = {
    ...step1.errors,
    ...step2.errors,
    ...step3.errors,
  };

  return {
    isValid: Object.keys(allErrors).length === 0,
    errors: allErrors,
  };
}
