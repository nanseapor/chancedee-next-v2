import * as z from "zod";

export const hourSchema = z
  .string({
    required_error: "กรุณาเลือกเวลา",
    invalid_type_error: "กรุณาเลือกเวลา",
  })
  .regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/, {
    message: "กรุณาเลือกเวลา",
  });

const statusSchema = z
  .enum(["Opened", "Closed"], {
    required_error: "กรุณาเลือกสถานะ",
    invalid_type_error: "กรุณาเลือกสถานะ",
  })
  .default("Opened");

export const businessHoursSchema = z.object({
  mondayStatus: statusSchema,
  tuesdayStatus: statusSchema,
  wednesdayStatus: statusSchema,
  thursdayStatus: statusSchema,
  fridayStatus: statusSchema,
  saturdayStatus: statusSchema,
  sundayStatus: statusSchema,
  mondayOpening: hourSchema,
  tuesdayOpening: hourSchema,
  wednesdayOpening: hourSchema,
  thursdayOpening: hourSchema,
  fridayOpening: hourSchema,
  saturdayOpening: hourSchema,
  sundayOpening: hourSchema,
  mondayClosing: hourSchema,
  tuesdayClosing: hourSchema,
  wednesdayClosing: hourSchema,
  thursdayClosing: hourSchema,
  fridayClosing: hourSchema,
  saturdayClosing: hourSchema,
  sundayClosing: hourSchema,
});
