import * as z from "zod";

import { MasterJobApplicationStatuses } from "@/constant/application";

import { convertLocalToUTC } from "../utils/shared/date-utils";

export const bookingSchema = z
  .object({
    uid: z.string().optional(),
    type: z
      .enum(["Interview", "Call"], {
        required_error: "กรุณาเลือกประเภทการสัมภาษณ์",
        invalid_type_error: "กรุณาเลือกประเภทการสัมภาษณ์",
      })
      .default("Interview"),
    application: z.string(),
    date: z.coerce.date({
      errorMap: (issue, { defaultError }) => ({
        message: issue.code === "invalid_date" ? "กรุณาเลือกวันที่" : defaultError,
      }),
    }),
    room: z.string().optional(),
    hr: z.string(),
    location: z.string(),
    note: z.string().optional(),
    channel: z.string(),
    from: z
      .string({
        required_error: "กรุณาเลือกเวลาเริ่มต้น",
        invalid_type_error: "กรุณาเลือกเวลาเริ่มต้น",
      })
      .regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/, {
        message: "กรุณาเลือกเวลาเริ่มต้น",
      }),
    to: z
      .string({
        required_error: "กรุณาเลือกเวลาสิ้นสุด",
        invalid_type_error: "กรุณาเลือกเวลาสิ้นสุด",
      })
      .regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/, {
        message: "กรุณาเลือกเวลาสิ้นสุด",
      }),
    message: z.string().optional(),
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
      .optional()
      .superRefine((data, ctx) => {
        if (!data) {
          return;
        }
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

    // rodo: z
    //   .boolean({
    //     required_error: "Zgoda na przetwarzanie danych jest wymagana",
    //     invalid_type_error: "Nieprawidłowy typ danych",
    //   })
    //   .default(false)
    //   .refine((value) => value === true, {
    //     message: "Zgoda na przetwarzanie danych jest wymagana",
    //   }),
    status: z
      .enum([
        MasterJobApplicationStatuses.scheduled,
        MasterJobApplicationStatuses.confirmed,
        MasterJobApplicationStatuses.declined,
        MasterJobApplicationStatuses.cancelled,
      ])
      .default(MasterJobApplicationStatuses.scheduled),
    cancelReason: z.string().optional(),
  })
  .refine(
    (partialInput) => {
      if (!partialInput.from || !partialInput.to) {
        return false;
      }
      const date = new Date();
      const from = partialInput.from;
      const to = partialInput.to;
      const fromDate = convertLocalToUTC(date, from);
      const toDate = convertLocalToUTC(date, to);
      if (fromDate && toDate) {
        return fromDate < toDate;
      } else {
        return false;
      }
    },
    {
      path: ["to"],
      message: "เวลาเริ่มต้นต้องน้อยกว่าเวลาสิ้นสุด",
    },
  );

export const filterBookingsSchema = z.object({});

export const getBookingSchema = z.object({
  id: z.number(),
});

export const getBookingsSchema = z.object({});
