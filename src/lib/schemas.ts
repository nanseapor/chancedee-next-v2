import { PASSWORD_REGEX } from "@/constant/constant";
import * as z from "zod";

export const signUpSchema = z
  .object({
    email: z.string().email({
      message: "Please enter a valid email address.",
    }),
    password: z
      .string()
      .min(8, {
        message: "Password must be at least 8 characters long.",
      })
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).*$/,
        {
          message:
            "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
        },
      ),
    passwordConfirmation: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords do not match",
    path: ["passwordConfirmation"],
  });

export type SignUpValues = z.infer<typeof signUpSchema>;

export const ChangePasswordSchema = z.object({
  email: z
    .string({ required_error: "กรุณาเลือกข้อมูล" })
    .min(1, { message: "กรุณากรอกข้อมูล" })
    .email("รูปแบบอีเมลไม่ถูกต้อง"),
  password: z
    .object({
      oldPassword: z
        .string({ required_error: "กรุณากรอกข้อมูล" })
        .regex(
          PASSWORD_REGEX,
          "พาสเวิร์ดต้องเป็นภาษาอังกฤษอย่างน้อย 8 ตัวอักษร ประกอบด้วยตัวเลข ตัวพิมพ์ใหญ่ ตัวพิมพ์เล็ก อักขระพิเศษ และไม่มีช่องว่าง",
        )
        .max(50, { message: "ระบบรองรับพาสเวิร์ดมีขนาดไม่เกิน 50 ตัวอักษร" }),
      newPassword: z
        .string({ required_error: "กรุณากรอกข้อมูล" })
        .regex(
          PASSWORD_REGEX,
          "พาสเวิร์ดต้องเป็นภาษาอังกฤษอย่างน้อย 8 ตัวอักษร ประกอบด้วยตัวเลข ตัวพิมพ์ใหญ่ ตัวพิมพ์เล็ก อักขระพิเศษ และไม่มีช่องว่าง",
        )
        .max(50, { message: "ระบบรองรับพาสเวิร์ดมีขนาดไม่เกิน 50 ตัวอักษร" }),
      confirmPassword: z
        .string({ required_error: "กรุณากรอกข้อมูล" })
        .regex(
          PASSWORD_REGEX,
          "พาสเวิร์ดต้องเป็นภาษาอังกฤษอย่างน้อย 8 ตัวอักษร ประกอบด้วยตัวเลข ตัวพิมพ์ใหญ่ ตัวพิมพ์เล็ก อักขระพิเศษ และไม่มีช่องว่าง",
        )
        .max(50, { message: "ระบบรองรับพาสเวิร์ดมีขนาดไม่เกิน 50 ตัวอักษร" }),
    })
    .superRefine(({ confirmPassword, newPassword }, ctx) => {
      if (confirmPassword !== newPassword) {
        ctx.addIssue({
          code: "custom",
          message: "รหัสผ่านไม่ตรงกัน",
          path: ["confirmPassword"],
        });
      }
    }),
});

export type ChangePasswordTypes = z.infer<typeof ChangePasswordSchema>;
