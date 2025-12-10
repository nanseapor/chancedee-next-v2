"use client";
import { z } from "zod";

export const JobPostSchema1 = z.object({
  companyId: z.string(),
  companyName: z.string(),
  // jobIndustry: z
  //   .string({ required_error: "กรุณาเลือกข้อมูล" })
  //   .min(1, { message: "กรุณากรอกข้อมูล" }),
  title: z.string().min(1, { message: "กรุณากรอกข้อมูล" }).max(200),
  jobFunction: z
    .string({ required_error: "กรุณาเลือกข้อมูล" })
    .min(1, { message: "กรุณากรอกข้อมูล" }),
  // highlights: string;
  // Basic job information only in step 1
  // Salary and employment moved to step 2 (JobTermsSchema)
  // Experience, workDays moved to step 2 (JobPostSchema2)
  // Location info in step 3 (JobPostSchema3)
  // Preview in step 4
  // Other fields removed for now
});

export const JobPostSchema2 = z.object({
  // Experience and work days moved from schema 1
  experience: z
    .string({
      required_error: "กรุณาเลือกระดับการจ้างงาน",
      invalid_type_error: "กรุณาเลือกระดับการจ้างงาน",
    })
    .min(1, { message: "กรุณาเลือกช่องทางการสัมภาษณ์" }),
  workDays: z.string().min(1, { message: "กรุณาเลือกวันทำงาน" }),
  // Job details and requirements
  jobDescriptionDetails: z
    .string({
      required_error: "กรุณากรอกข้อมูล",
      invalid_type_error: "กรุณากรอกข้อมูล",
    })
    .min(1, { message: "กรุณากรอกข้อมูล" }),
  qualificationDetails: z
    .string({
      required_error: "กรุณากรอกข้อมูล",
      invalid_type_error: "กรุณากรอกข้อมูล",
    })
    .min(1, { message: "กรุณากรอกข้อมูล" }),
  benefitsDetails: z.string().optional(),
  educationLevel: z
    .array(z.number())
    .min(1, { message: "กรุณาเลือกข้อมูลอย่างน้อย 1 รายการ" })
    .refine((data) => {
      console.log("Education array => ", data);
      if (data.length > 0) {
        return true;
      }
    }),
});

export const JobPostSchema3 = z.object({
  workLocation: z.string().min(1, { message: "กรุณากรอกข้อมูล" }),
  address: z
    .object({
      addressLine1: z.string({
        description: "ที่อยู่",
        required_error: "กรุณากรอกที่อยู่",
        invalid_type_error: "กรุณากรอกที่อยู่",
      }),
      subDistrict: z
        .string({
          required_error: "กรุณาระบุตำบล",
          invalid_type_error: "กรุณาระบุตำบล",
        })
        .min(1, { message: "กรุณาระบุตำบล" }),
      district: z
        .string({
          required_error: "กรุณากรอกอำเภอ",
          invalid_type_error: "กรุณากรอกอำเภอ",
        })
        .min(1, { message: "กรุณากรอกข้อมูล" }),
      province: z
        .string({
          required_error: "กรุณากรอกจังหวัด",
          invalid_type_error: "กรุณากรอกจังหวัด",
        })
        .min(1, { message: "กรุณากรอกจังหวัด" }),
      postCode: z
        .string({
          required_error: "กรุณากรอกรหัสไปรษณีย์",
          invalid_type_error: "กรุณากรอกรหัสไปรษณีย์",
        })
        .min(1, { message: "กรุณากรอกรหัสไปรษณีย์" }),
    })
    .superRefine((data, ctx) => {
      if (
        !data.addressLine1 ||
        !data.district ||
        !data.postCode ||
        !data.province ||
        !data.subDistrict
      ) {
        ctx.addIssue({
          code: "custom",
          message: "กรุณากรอกข้อมูลให้ครบ",
        });
      } else {
        const addressLine1 = z
          .string({
            description: "ที่อยู่",
            required_error: "กรุณากรอกที่อยู่",
            invalid_type_error: "กรุณากรอกที่อยู่",
          })
          .min(1, { message: "กรุณากรอกที่อยู่" })
          .max(500, { message: "กรุณากรอกน้อยกว่า 500 ตัวอักษร" })
          .safeParse(data.addressLine1);
        if (!addressLine1.success) {
          addressLine1.error.issues.forEach((issue) => {
            console.log("addressLine1.error.issues", issue.message);
            ctx.addIssue({
              code: "custom",
              message: issue.message,
            });
          });
        }
        const subDistrict = z
          .string({
            required_error: "กรุณาระบุตำบล",
            invalid_type_error: "กรุณาระบุตำบล",
          })
          .min(1, { message: "กรุณาระบุตำบล" })
          .safeParse(data.subDistrict);
        if (!subDistrict.success) {
          subDistrict.error.issues.forEach((issue) => {
            console.log("subDistrict.error.issues", issue.message);
            ctx.addIssue({
              code: "custom",
              message: issue.message,
            });
          });
        }
        const district = z
          .string({
            required_error: "กรุณากรอกอำเภอ",
            invalid_type_error: "กรุณากรอกอำเภอ",
          })
          .min(1, { message: "กรุณากรอกข้อมูล" })
          .safeParse(data.district);
        if (!district.success) {
          district.error.issues.forEach((issue) => {
            console.log("district.error.issues", issue.message);
            ctx.addIssue({
              code: "custom",
              message: issue.message,
            });
          });
        }
        const province = z
          .string({
            required_error: "กรุณากรอกจังหวัด",
            invalid_type_error: "กรุณากรอกจังหวัด",
          })
          .min(1, { message: "กรุณากรอกจังหวัด" })
          .safeParse(data.province);
        if (!province.success) {
          province.error.issues.forEach((issue) => {
            console.log("province.error.issues", issue.message);
            ctx.addIssue({
              code: "custom",
              message: issue.message,
            });
          });
        }
        const postCode = z
          .string({
            required_error: "กรุณากรอกรหัสไปรษณีย์",
            invalid_type_error: "กรุณากรอกรหัสไปรษณีย์",
          })
          .min(1, { message: "กรุณากรอกรหัสไปรษณีย์" })
          .safeParse(data.postCode);
        if (!postCode.success) {
          postCode.error.issues.forEach((issue) => {
            console.log("postCode.error.issues", issue.message);
            ctx.addIssue({
              code: "custom",
              message: issue.message,
            });
          });
        }
      }
    }),
  travelMode: z.string().min(1, { message: "กรุณาเลือกข้อมูล" }).default("other"),
  travelStation: z.string().min(1, { message: "ข้อมูลไม่ถูกต้อง" }).default("ไม่ระบุ"),
});

export const JobPostSchema5 = z
  .object({
    publishType: z.string().min(1, { message: "กรุณาเลือกข้อมูล" }),
    isActive: z.boolean().optional(),
    jobStatus: z.string().optional(),
    postStartDate: z.number().optional(),
    postExpiryDate: z.number().optional(),
  })
  .refine(
    (data) => {
      if (data.isActive && !data.jobStatus) {
        console.log("data.isActive", data.isActive, data.jobStatus);
        return false;
      }
      return true;
    },
    {
      message: "ข้อมูลไม่ถูกต้อง",
      path: ["jobStatus"],
    },
  )
  .refine(
    (data) => {
      if (data.publishType === "ontimer") {
        try {
          console.log("data.postStartDate", data.postStartDate);
          console.log("data.postExpiryDate", data.postExpiryDate);
          if (!data.postStartDate || !data.postExpiryDate) {
            return false;
          }
          const startDate = new Date(data.postStartDate);
          const expiryDate = new Date(data.postExpiryDate);
          if (!startDate || !expiryDate) {
            console.log("startDate", startDate, "expiryDate", expiryDate);
            return false;
          }
          if (startDate > expiryDate) {
            console.log(
              "startDate",
              startDate,
              "expiryDate",
              expiryDate,
              startDate > expiryDate,
            );
            return false;
          }
        } catch (err) {
          console.error(err);
          return false;
        }
      }
      return true;
    },
    {
      message: "วันที่ไม่ถูกต้อง",
      path: ["postStartDate"],
    },
  );

// New 6-step schemas for improved information architecture
export const RequirementsSchema = z.object({
  // Step 2: Requirements (experience level, education level)
  experience: z
    .string({
      required_error: "กรุณาเลือกระดับประสบการณ์",
      invalid_type_error: "กรุณาเลือกระดับประสบการณ์",
    })
    .min(1, { message: "กรุณาเลือกระดับประสบการณ์" }),
  educationLevel: z
    .array(z.number())
    .min(1, { message: "กรุณาเลือกข้อมูลอย่างน้อย 1 รายการ" })
    .refine((data) => {
      console.log("Education array => ", data);
      if (data.length > 0) {
        return true;
      }
    }),
});

export const QualificationsSchema = z.object({
  // Step 3: Qualifications (qualification details, job description)
  qualificationDetails: z
    .string({
      required_error: "กรุณากรอกข้อมูล",
      invalid_type_error: "กรุณากรอกข้อมูล",
    })
    .min(1, { message: "กรุณากรอกข้อมูล" }),
  jobDescriptionDetails: z
    .string({
      required_error: "กรุณากรอกข้อมูล",
      invalid_type_error: "กรุณากรอกข้อมูล",
    })
    .min(1, { message: "กรุณากรอกข้อมูล" }),
});

export const TermsBenefitsSchema = z.object({
  // Step 4: Terms & Benefits (salary, work days, benefits)
  minSalary: z.number().min(1, { message: "กรุณาระบุเงินเดือน" }),
  maxSalary: z.number().min(1, { message: "กรุณาระบุเงินเดือน" }),
  isNegotiable: z.boolean().optional(),
  employment: z.string().min(1, { message: "กรุณาเลือกประเภทการจ้างงาน" }),
  workDays: z.string().min(1, { message: "กรุณาเลือกวันทำงาน" }),
  benefitsDetails: z.string().optional(),
});

// Step 5: Working Location (JobPostSchema3 - unchanged)
// Step 6: Preview & Publish (JobPostSchema5 - unchanged)

// Export inferred types for job posting steps
export type JobPostStep1Data = z.infer<typeof JobPostSchema1>;
export type JobPostStep2Data = z.infer<typeof JobPostSchema2>;
export type JobPostStep3Data = z.infer<typeof JobPostSchema3>;
export type JobPostStep5Data = z.infer<typeof JobPostSchema5>;

// New 6-step schema types
export type RequirementsData = z.infer<typeof RequirementsSchema>;
export type QualificationsData = z.infer<typeof QualificationsSchema>;
export type TermsBenefitsData = z.infer<typeof TermsBenefitsSchema>;
