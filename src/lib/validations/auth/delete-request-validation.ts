import { z } from "zod";

// Thai phone number regex
const PHONE_REGEX_THAI = /^(\+66|66|0)(\d{8,9})$/;

/**
 * Form validation schema for delete request input
 * Includes validation messages for user interface
 */
export const DeleteRequestFormSchema = z.object({
  documentCode: z.string(),
  email: z
    .string({ required_error: "กรุณาเลือกข้อมูล" })
    .min(1, { message: "กรุณากรอกข้อมูล" })
    .email("รูปแบบอีเมลไม่ถูกต้อง"),
  phoneNumber: z
    .string({ required_error: "กรุณาเลือกข้อมูล" })
    .min(1, { message: "กรุณากรอกข้อมูล" })
    .regex(PHONE_REGEX_THAI, "หมายเลขโทรศัพท์ไม่ถูกต้อง"),
  firstNameTH: z.string().min(1, { message: "กรุณากรอกข้อมูล" }).max(50),
  lastNameTH: z.string().min(1, { message: "กรุณากรอกข้อมูล" }).max(50),
  status: z.string(),
});

// Export inferred types
export type DeleteRequestFormData = z.infer<typeof DeleteRequestFormSchema>;
