import * as z from "zod";

import { PASSWORD_REGEX, PHONE_REGEX_THAI } from "@/constants/constant";
import { emailSchema } from "@/lib/validations/email";

const passwordSchema = z
  .string({
    required_error: "Hasło jest wymagane",
    invalid_type_error: "Nieprawidłowy typ danych",
  })
  .min(8, {
    message: "Hasło musi się składać z przynajmniej 8 znaków",
  })
  .max(256, {
    message: "Hasło nie może mieć więcej ni 256 znaków",
  });

export const signUpWithPasswordSchema = z.object({
  password: z
    .object({
      password: z
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
    .refine(({ password, confirmPassword }) => password === confirmPassword, {
      message: "รหัสผ่านไม่ตรงกัน",
      path: ["confirmPassword"],
    }),
});

export const signInWithPasswordSchema = z.object({
  email: emailSchema,
  password: z.string({
    required_error: "Password is required",
    invalid_type_error: "Password must be a string",
  }),
});

export const passwordResetSchema = z.object({
  email: emailSchema,
});

export const passwordUpdateSchema = z
  .object({
    password: passwordSchema.regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/,
      {
        message:
          "Hasło musi mieć od 8 do 256 znaków, zawierać przynajmniej jedną wielką literę, jedną małą literę, jedną liczbę, oraz jedną znak specjalny",
      },
    ),
    confirmPassword: z.string(),
  })
  .refine((schema) => schema.password === schema.confirmPassword, {
    message: "Podane hasła są różne",
    path: ["confirmPassword"],
  });

export const passwordUpdateSchemaExtended = z
  .object({
    password: passwordSchema.regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/,
      {
        message:
          "Password must contain at least 8 characters, including one uppercase, one lowercase, one number and one special character",
      },
    ),
    confirmPassword: z.string(),
    resetPasswordToken: z
      .string({
        required_error: "Reset password token is required",
        invalid_type_error: "Reset password token must be a string",
      })
      .min(16)
      .max(256),
  })
  .refine((schema) => schema.password === schema.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const emailVerificationSchema = z.object({
  email: emailSchema,
});

export type SignUpWithPasswordFormInput = z.infer<
  typeof signUpWithPasswordSchema
>;

export type SignInWithPasswordFormInput = z.infer<
  typeof signInWithPasswordSchema
>;

export type PasswordResetFormInput = z.infer<typeof passwordResetSchema>;

export type PasswordUpdateFormInput = z.infer<typeof passwordUpdateSchema>;

export type PasswordUpdateFormInputExtended = z.infer<
  typeof passwordUpdateSchemaExtended
>;

export type EmailVerificationFormInput = z.infer<
  typeof emailVerificationSchema
>;

// ==========================================
// THAI INTERFACE SCHEMAS (from legacy-auth)
// ==========================================

// Thai login schema (consolidated from legacy-auth)
export const LoginSchema = z.object({
  email: z
    .string({ required_error: "กรุณาเลือกข้อมูล" })
    .min(1, { message: "กรุณากรอกข้อมูล" })
    .email("รูปแบบอีเมลไม่ถูกต้อง"),
  password: z
    .string({ required_error: "กรุณาเลือกข้อมูล" })
    .min(1, { message: "กรุณากรอกข้อมูล" })
    .max(50),
});

// Thai registration schema (consolidated from legacy-auth)
export const RegisterSchema = z
  .object({
    email: z
      .string({ required_error: "กรุณาเลือกข้อมูล" })
      .min(1, { message: "กรุณากรอกข้อมูล" })
      .email("รูปแบบอีเมลไม่ถูกต้อง"),
    password: z
      .string({ required_error: "กรุณาเลือกข้อมูล" })
      .regex(
        PASSWORD_REGEX,
        "พาสเวิร์ดต้องเป็นภาษาอังกฤษอย่างน้อย 8 ตัวอักษร ประกอบด้วยตัวเลข ตัวพิมพ์ใหญ่ ตัวพิมพ์เล็ก อักขระพิเศษ และไม่มีช่องว่าง",
      )
      .max(50, { message: "ระบบรองรับพาสเวิร์ดมีขนาดไม่เกิน 50 ตัวอักษร" }),
    confirmPassword: z
      .string({ required_error: "กรุณาเลือกข้อมูล" })
      .regex(
        PASSWORD_REGEX,
        "พาสเวิร์ดต้องเป็นภาษาอังกฤษอย่างน้อย 8 ตัวอักษร ประกอบด้วยตัวเลข ตัวพิมพ์ใหญ่ ตัวพิมพ์เล็ก อักขระพิเศษ และไม่มีช่องว่าง",
      )
      .max(50, { message: "ระบบรองรับพาสเวิร์ดมีขนาดไม่เกิน 50 ตัวอักษร" }),
  })
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: "custom",
        message: "รหัสผ่านไม่ตรงกัน",
      });
    }
  });

// Thai change password schema (consolidated from legacy-auth)
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
        });
      }
    }),
});

// Thai password reset schema (consolidated from legacy-auth)
export const ResetSchema = z.object({
  email: z
    .string({ required_error: "กรุณาเลือกข้อมูล" })
    .min(1, { message: "กรุณากรอกข้อมูล" })
    .email("รูปแบบอีเมลไม่ถูกต้อง"),
});

// English signup schema (consolidated from legacy-auth)
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
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).*$/,
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

// Company registration schema (consolidated from legacy-auth)
export const CompanySchema = z.object({
  companyName: z
    .string({ required_error: "กรุณาเลือกข้อมูล" })
    .min(1, { message: "กรุณากรอกข้อมูล" })
    .max(50),
  companyNumber: z
    .string({ required_error: "กรุณาเลือกข้อมูล" })
    .regex(/^[0-9]*$/, { message: "กรุณากรอกตัวเลขเท่านั้น" })
    .min(1, { message: "กรุณากรอกข้อมูล" })
    .max(13, { message: "ความยาวหมายเลขบริษัทไม่ถูกต้อง" }),
  natureOfBusiness: z
    .string({ required_error: "กรุณาเลือกข้อมูล" })
    .min(1, { message: "กรุณากรอกข้อมูล" })
    .max(50),
  contact: z.string({ required_error: "กรุณาเลือกข้อมูล" }),
  firstNameTH: z
    .string({ required_error: "กรุณาเลือกข้อมูล" })
    .min(1, { message: "กรุณากรอกข้อมูล" })
    .max(50),
  lastNameTH: z
    .string({ required_error: "กรุณาเลือกข้อมูล" })
    .min(1, { message: "กรุณากรอกข้อมูล" })
    .max(50),
  phoneNumber: z
    .string({ required_error: "กรุณาเลือกข้อมูล" })
    .min(1, { message: "กรุณากรอกข้อมูล" })
    .regex(PHONE_REGEX_THAI, "หมายเลขโทรศัพท์ไม่ถูกต้อง")
    .max(10, { message: "ความยาวหมายเลขโทรศัพท์ไม่ถูกต้อง" }),
  password: z
    .string({ required_error: "กรุณาเลือกข้อมูล" })
    .min(1, { message: "กรุณากรอกข้อมูล" })
    .regex(
      PASSWORD_REGEX,
      "พาสเวิร์ดต้องเป็นภาษาอังกฤษอย่างน้อย 8 ตัวอักษร ประกอบด้วยตัวเลข ตัวพิมพ์ใหญ่ ตัวพิมพ์เล็ก อักขระพิเศษ และไม่มีช่องว่าง",
    )
    .max(50, { message: "ระบบรองรับพาสเวิร์ดมีขนาดไม่เกิน 50 ตัวอักษร" }),
  email: z
    .string({ required_error: "กรุณาเลือกข้อมูล" })
    .min(1, { message: "กรุณากรอกข้อมูล" })
    .email("รูปแบบอีเมลไม่ถูกต้อง"),
});

// Staff registration schema (consolidated from legacy-auth)
export const StaffSchema = z.object({
  firstNameTH: z
    .string({ required_error: "กรุณาเลือกข้อมูล" })
    .min(1, { message: "กรุณากรอกข้อมูล" })
    .max(50),
  lastNameTH: z
    .string({ required_error: "กรุณาเลือกข้อมูล" })
    .min(1, { message: "กรุณากรอกข้อมูล" })
    .max(50),
  mobileNumber: z
    .string({ required_error: "กรุณาเลือกข้อมูล" })
    .min(1, { message: "กรุณากรอกข้อมูล" })
    .regex(PHONE_REGEX_THAI, "หมายเลขโทรศัพท์ไม่ถูกต้อง")
    .max(10, { message: "ความยาวหมายเลขโทรศัพท์ไม่ถูกต้อง" }),
  email: z
    .string({ required_error: "กรุณาเลือกข้อมูล" })
    .min(1, { message: "กรุณากรอกข้อมูล" })
    .email("รูปแบบอีเมลไม่ถูกต้อง"),
  password: z
    .string({ required_error: "กรุณาเลือกข้อมูล" })
    .min(1, { message: "กรุณากรอกข้อมูล" })
    .regex(
      PASSWORD_REGEX,
      "พาสเวิร์ดต้องเป็นภาษาอังกฤษอย่างน้อย 8 ตัวอักษร ประกอบด้วยตัวเลข ตัวพิมพ์ใหญ่ ตัวพิมพ์เล็ก อักขระพิเศษ และไม่มีช่องว่าง",
    )
    .max(50, { message: "ระบบรองรับพาสเวิร์ดมีขนาดไม่เกิน 50 ตัวอักษร" }),
  companyName: z
    .string({ required_error: "กรุณาเลือกบริษัท" })
    .min(1, { message: "กรุณาเลือกบริษัท" }),
  note: z.string({ required_error: "กรุณาเลือกข้อมูล" }).optional(),
});

// Account transfer schema (consolidated from legacy-auth)
export const AccountTransferSchema = z.object({
  desitnationCompany: z.string({ required_error: "กรุณาเลือกข้อมูล" }),
});

// ==========================================
// CONSOLIDATED TYPE EXPORTS
// ==========================================

// Legacy types from legacy-auth.ts
export type SignUpValues = z.infer<typeof signUpSchema>;
export type ChangePasswordTypes = z.infer<typeof ChangePasswordSchema>;
