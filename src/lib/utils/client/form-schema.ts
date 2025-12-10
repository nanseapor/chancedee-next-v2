import * as z from "zod";

import { PHONE_REGEX_THAI } from "@/constant/constant";

export const profileSchema = z.object({
  firstname: z.string().min(1, { message: "ข้อมูลไม่ถูกต้อง" }),
  lastname: z.string().min(1, { message: "ข้อมูลไม่ถูกต้อง" }),
  email: z.string().email({ message: "ข้อมูลไม่ถูกต้อง" }),
  contactno: z
    .string({ required_error: "กรุณาเลือกข้อมูล" })
    .min(1, { message: "กรุณากรอกข้อมูล" })
    .regex(PHONE_REGEX_THAI, "หมายเลขโทรศัพท์ไม่ถูกต้อง"),
  jobTitle: z
    .string()
    .min(2, {
      message: "ชื่อตำแหน่งงานต้องมีความยาวอย่างน้อย 2 ตัวอักษร",
    })
    .max(100, {
      message: "ชื่อตำแหน่งงานต้องมีความยาวไม่เกิน 100 ตัวอักษร",
    }),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
