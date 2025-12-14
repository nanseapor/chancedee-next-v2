import { describe, it, expect } from "vitest";
import {
  signUpWithPasswordSchema,
  signInWithPasswordSchema,
  passwordResetSchema,
  passwordUpdateSchema,
  passwordUpdateSchemaExtended,
  emailVerificationSchema,
  LoginSchema,
  RegisterSchema,
  ChangePasswordSchema,
  ResetSchema,
  signUpSchema,
  CompanySchema,
  StaffSchema,
  AccountTransferSchema,
} from "@/lib/validations/auth";

describe("Auth Validation Schemas", () => {
  describe("signUpWithPasswordSchema", () => {
    const validPassword = "Test123!@#";

    it("should accept valid password with confirmation", () => {
      const result = signUpWithPasswordSchema.safeParse({
        password: {
          password: validPassword,
          confirmPassword: validPassword,
        },
      });
      expect(result.success).toBe(true);
    });

    it("should reject when passwords do not match", () => {
      const result = signUpWithPasswordSchema.safeParse({
        password: {
          password: validPassword,
          confirmPassword: "Different123!@#",
        },
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("รหัสผ่านไม่ตรงกัน");
      }
    });

    it("should reject password without uppercase", () => {
      const result = signUpWithPasswordSchema.safeParse({
        password: {
          password: "test123!@#",
          confirmPassword: "test123!@#",
        },
      });
      expect(result.success).toBe(false);
    });

    it("should reject password without lowercase", () => {
      const result = signUpWithPasswordSchema.safeParse({
        password: {
          password: "TEST123!@#",
          confirmPassword: "TEST123!@#",
        },
      });
      expect(result.success).toBe(false);
    });

    it("should reject password without numbers", () => {
      const result = signUpWithPasswordSchema.safeParse({
        password: {
          password: "TestABCD!@#",
          confirmPassword: "TestABCD!@#",
        },
      });
      expect(result.success).toBe(false);
    });

    it("should reject password without special characters", () => {
      const result = signUpWithPasswordSchema.safeParse({
        password: {
          password: "Test12345",
          confirmPassword: "Test12345",
        },
      });
      expect(result.success).toBe(false);
    });

    it("should reject password shorter than 8 characters", () => {
      const result = signUpWithPasswordSchema.safeParse({
        password: {
          password: "Ts1!",
          confirmPassword: "Ts1!",
        },
      });
      expect(result.success).toBe(false);
    });

    it("should reject password longer than 50 characters", () => {
      const longPassword = "T".repeat(40) + "est123!@#" + "X".repeat(10);
      const result = signUpWithPasswordSchema.safeParse({
        password: {
          password: longPassword,
          confirmPassword: longPassword,
        },
      });
      expect(result.success).toBe(false);
    });

    it("should reject missing password", () => {
      const result = signUpWithPasswordSchema.safeParse({
        password: {
          confirmPassword: validPassword,
        },
      });
      expect(result.success).toBe(false);
    });

    it("should reject missing confirmPassword", () => {
      const result = signUpWithPasswordSchema.safeParse({
        password: {
          password: validPassword,
        },
      });
      expect(result.success).toBe(false);
    });
  });

  describe("signInWithPasswordSchema", () => {
    it("should accept valid email and password", () => {
      const result = signInWithPasswordSchema.safeParse({
        email: "test@example.com",
        password: "anypassword",
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid email", () => {
      const result = signInWithPasswordSchema.safeParse({
        email: "not-an-email",
        password: "password",
      });
      expect(result.success).toBe(false);
    });

    it("should reject missing email", () => {
      const result = signInWithPasswordSchema.safeParse({
        password: "password",
      });
      expect(result.success).toBe(false);
    });

    it("should reject missing password", () => {
      const result = signInWithPasswordSchema.safeParse({
        email: "test@example.com",
      });
      expect(result.success).toBe(false);
    });

    it("should reject non-string password", () => {
      const result = signInWithPasswordSchema.safeParse({
        email: "test@example.com",
        password: 12345,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("passwordResetSchema", () => {
    it("should accept valid email", () => {
      const result = passwordResetSchema.safeParse({
        email: "test@example.com",
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid email", () => {
      const result = passwordResetSchema.safeParse({
        email: "invalid",
      });
      expect(result.success).toBe(false);
    });

    it("should reject missing email", () => {
      const result = passwordResetSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe("passwordUpdateSchema", () => {
    const validPassword = "Test123!@#Ab";

    it("should accept valid password update", () => {
      const result = passwordUpdateSchema.safeParse({
        password: validPassword,
        confirmPassword: validPassword,
      });
      expect(result.success).toBe(true);
    });

    it("should reject when passwords do not match", () => {
      const result = passwordUpdateSchema.safeParse({
        password: validPassword,
        confirmPassword: "Different123!@#",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Podane hasła są różne");
      }
    });

    it("should reject password without required complexity", () => {
      const result = passwordUpdateSchema.safeParse({
        password: "simple",
        confirmPassword: "simple",
      });
      expect(result.success).toBe(false);
    });

    it("should reject password shorter than 8 characters", () => {
      const result = passwordUpdateSchema.safeParse({
        password: "T1!a",
        confirmPassword: "T1!a",
      });
      expect(result.success).toBe(false);
    });

    it("should reject password longer than 256 characters", () => {
      // Create a password > 256 chars that meets complexity requirements
      const longPassword = "Test123!@#Ab" + "x".repeat(250);
      expect(longPassword.length).toBeGreaterThan(256);
      const result = passwordUpdateSchema.safeParse({
        password: longPassword,
        confirmPassword: longPassword,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("passwordUpdateSchemaExtended", () => {
    const validPassword = "Test123!@#Ab";
    const validToken = "a".repeat(32);

    it("should accept valid password update with token", () => {
      const result = passwordUpdateSchemaExtended.safeParse({
        password: validPassword,
        confirmPassword: validPassword,
        resetPasswordToken: validToken,
      });
      expect(result.success).toBe(true);
    });

    it("should reject when passwords do not match", () => {
      const result = passwordUpdateSchemaExtended.safeParse({
        password: validPassword,
        confirmPassword: "Different123!@#",
        resetPasswordToken: validToken,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Passwords do not match");
      }
    });

    it("should reject token shorter than 16 characters", () => {
      const result = passwordUpdateSchemaExtended.safeParse({
        password: validPassword,
        confirmPassword: validPassword,
        resetPasswordToken: "short",
      });
      expect(result.success).toBe(false);
    });

    it("should reject token longer than 256 characters", () => {
      const result = passwordUpdateSchemaExtended.safeParse({
        password: validPassword,
        confirmPassword: validPassword,
        resetPasswordToken: "a".repeat(300),
      });
      expect(result.success).toBe(false);
    });

    it("should reject missing token", () => {
      const result = passwordUpdateSchemaExtended.safeParse({
        password: validPassword,
        confirmPassword: validPassword,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("emailVerificationSchema", () => {
    it("should accept valid email", () => {
      const result = emailVerificationSchema.safeParse({
        email: "test@example.com",
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid email", () => {
      const result = emailVerificationSchema.safeParse({
        email: "invalid",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("LoginSchema (Thai)", () => {
    it("should accept valid login credentials", () => {
      const result = LoginSchema.safeParse({
        email: "test@example.com",
        password: "password123",
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid email", () => {
      const result = LoginSchema.safeParse({
        email: "not-email",
        password: "password",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("รูปแบบอีเมลไม่ถูกต้อง");
      }
    });

    it("should reject empty email", () => {
      const result = LoginSchema.safeParse({
        email: "",
        password: "password",
      });
      expect(result.success).toBe(false);
    });

    it("should reject empty password", () => {
      const result = LoginSchema.safeParse({
        email: "test@example.com",
        password: "",
      });
      expect(result.success).toBe(false);
    });

    it("should reject password longer than 50 characters", () => {
      const result = LoginSchema.safeParse({
        email: "test@example.com",
        password: "a".repeat(51),
      });
      expect(result.success).toBe(false);
    });
  });

  describe("RegisterSchema (Thai)", () => {
    const validPassword = "Test123!@#";

    it("should accept valid registration", () => {
      const result = RegisterSchema.safeParse({
        email: "test@example.com",
        password: validPassword,
        confirmPassword: validPassword,
      });
      expect(result.success).toBe(true);
    });

    it("should reject when passwords do not match", () => {
      const result = RegisterSchema.safeParse({
        email: "test@example.com",
        password: validPassword,
        confirmPassword: "Different123!@#",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("รหัสผ่านไม่ตรงกัน");
      }
    });

    it("should reject invalid password format", () => {
      const result = RegisterSchema.safeParse({
        email: "test@example.com",
        password: "simple",
        confirmPassword: "simple",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("ChangePasswordSchema (Thai)", () => {
    const validPassword = "Test123!@#";

    it("should accept valid password change", () => {
      const result = ChangePasswordSchema.safeParse({
        email: "test@example.com",
        password: {
          oldPassword: validPassword,
          newPassword: "NewPass123!@#",
          confirmPassword: "NewPass123!@#",
        },
      });
      expect(result.success).toBe(true);
    });

    it("should reject when new passwords do not match", () => {
      const result = ChangePasswordSchema.safeParse({
        email: "test@example.com",
        password: {
          oldPassword: validPassword,
          newPassword: "NewPass123!@#",
          confirmPassword: "Different123!@#",
        },
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("รหัสผ่านไม่ตรงกัน");
      }
    });

    it("should reject invalid old password format", () => {
      const result = ChangePasswordSchema.safeParse({
        email: "test@example.com",
        password: {
          oldPassword: "simple",
          newPassword: validPassword,
          confirmPassword: validPassword,
        },
      });
      expect(result.success).toBe(false);
    });

    it("should reject invalid new password format", () => {
      const result = ChangePasswordSchema.safeParse({
        email: "test@example.com",
        password: {
          oldPassword: validPassword,
          newPassword: "simple",
          confirmPassword: "simple",
        },
      });
      expect(result.success).toBe(false);
    });
  });

  describe("ResetSchema (Thai)", () => {
    it("should accept valid email", () => {
      const result = ResetSchema.safeParse({
        email: "test@example.com",
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid email", () => {
      const result = ResetSchema.safeParse({
        email: "invalid",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("signUpSchema (English)", () => {
    const validPassword = "Test123!@#";

    it("should accept valid signup", () => {
      const result = signUpSchema.safeParse({
        email: "test@example.com",
        password: validPassword,
        passwordConfirmation: validPassword,
      });
      expect(result.success).toBe(true);
    });

    it("should reject when passwords do not match", () => {
      const result = signUpSchema.safeParse({
        email: "test@example.com",
        password: validPassword,
        passwordConfirmation: "Different123!@#",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Passwords do not match");
      }
    });

    it("should reject password without uppercase", () => {
      const result = signUpSchema.safeParse({
        email: "test@example.com",
        password: "test123!@#",
        passwordConfirmation: "test123!@#",
      });
      expect(result.success).toBe(false);
    });

    it("should reject password shorter than 8 characters", () => {
      const result = signUpSchema.safeParse({
        email: "test@example.com",
        password: "Ts1!",
        passwordConfirmation: "Ts1!",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("at least 8 characters");
      }
    });
  });

  describe("CompanySchema", () => {
    const validCompany = {
      companyName: "Test Company",
      companyNumber: "1234567890123",
      natureOfBusiness: "Technology",
      contact: "contact@test.com",
      firstNameTH: "สมชาย",
      lastNameTH: "ใจดี",
      phoneNumber: "0812345678",
      password: "Test123!@#",
      email: "company@test.com",
    };

    it("should accept valid company registration", () => {
      const result = CompanySchema.safeParse(validCompany);
      expect(result.success).toBe(true);
    });

    it("should reject invalid company number (non-numeric)", () => {
      const result = CompanySchema.safeParse({
        ...validCompany,
        companyNumber: "123abc456",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("กรุณากรอกตัวเลขเท่านั้น");
      }
    });

    it("should reject company number longer than 13 characters", () => {
      const result = CompanySchema.safeParse({
        ...validCompany,
        companyNumber: "12345678901234",
      });
      expect(result.success).toBe(false);
    });

    it("should reject invalid Thai phone number", () => {
      const result = CompanySchema.safeParse({
        ...validCompany,
        phoneNumber: "1234567890",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("หมายเลขโทรศัพท์ไม่ถูกต้อง");
      }
    });

    it("should reject phone number longer than 10 digits", () => {
      const result = CompanySchema.safeParse({
        ...validCompany,
        phoneNumber: "08123456789",
      });
      expect(result.success).toBe(false);
    });

    it("should reject invalid password", () => {
      const result = CompanySchema.safeParse({
        ...validCompany,
        password: "simple",
      });
      expect(result.success).toBe(false);
    });

    it("should reject missing required fields", () => {
      const result = CompanySchema.safeParse({
        companyName: "Test",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("StaffSchema", () => {
    const validStaff = {
      firstNameTH: "สมชาย",
      lastNameTH: "ใจดี",
      mobileNumber: "0812345678",
      email: "staff@test.com",
      password: "Test123!@#",
      companyName: "Test Company",
    };

    it("should accept valid staff registration", () => {
      const result = StaffSchema.safeParse(validStaff);
      expect(result.success).toBe(true);
    });

    it("should accept valid staff with optional note", () => {
      const result = StaffSchema.safeParse({
        ...validStaff,
        note: "Test note",
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid mobile number", () => {
      const result = StaffSchema.safeParse({
        ...validStaff,
        mobileNumber: "1234567890",
      });
      expect(result.success).toBe(false);
    });

    it("should reject invalid email", () => {
      const result = StaffSchema.safeParse({
        ...validStaff,
        email: "not-email",
      });
      expect(result.success).toBe(false);
    });

    it("should reject invalid password", () => {
      const result = StaffSchema.safeParse({
        ...validStaff,
        password: "simple",
      });
      expect(result.success).toBe(false);
    });

    it("should reject missing company name", () => {
      const { companyName, ...rest } = validStaff;
      const result = StaffSchema.safeParse(rest);
      expect(result.success).toBe(false);
    });
  });

  describe("AccountTransferSchema", () => {
    it("should accept valid destination company", () => {
      const result = AccountTransferSchema.safeParse({
        desitnationCompany: "New Company Ltd",
      });
      expect(result.success).toBe(true);
    });

    it("should reject missing destination company", () => {
      const result = AccountTransferSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });
});
