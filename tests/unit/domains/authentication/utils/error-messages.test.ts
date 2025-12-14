import { describe, it, expect } from "vitest";
import {
  OTP_ERROR_MESSAGES,
  AUTH_ERROR_MESSAGES,
  FIREBASE_ERROR_MAP,
  getThaiErrorMessage,
  mapFirebaseErrorCode,
  getFirebaseErrorMessage,
  type ThaiErrorMessage,
} from "@/domains/authentication/utils/error-messages";

describe("Error Messages Utilities", () => {
  describe("OTP_ERROR_MESSAGES", () => {
    it("should have OTP_NOT_FOUND message", () => {
      expect(OTP_ERROR_MESSAGES.OTP_NOT_FOUND).toBeDefined();
      expect(OTP_ERROR_MESSAGES.OTP_NOT_FOUND.code).toBe("OTP_NOT_FOUND");
      expect(OTP_ERROR_MESSAGES.OTP_NOT_FOUND.message).toBe("ไม่พบรหัส OTP");
      expect(OTP_ERROR_MESSAGES.OTP_NOT_FOUND.recoveryAction).toBe("retry");
    });

    it("should have OTP_ALREADY_USED message", () => {
      expect(OTP_ERROR_MESSAGES.OTP_ALREADY_USED).toBeDefined();
      expect(OTP_ERROR_MESSAGES.OTP_ALREADY_USED.code).toBe("OTP_ALREADY_USED");
      expect(OTP_ERROR_MESSAGES.OTP_ALREADY_USED.recoveryAction).toBe("retry");
    });

    it("should have OTP_EXPIRED message", () => {
      expect(OTP_ERROR_MESSAGES.OTP_EXPIRED).toBeDefined();
      expect(OTP_ERROR_MESSAGES.OTP_EXPIRED.code).toBe("OTP_EXPIRED");
      expect(OTP_ERROR_MESSAGES.OTP_EXPIRED.recoveryAction).toBe("retry");
    });

    it("should have INVALID_OTP message", () => {
      expect(OTP_ERROR_MESSAGES.INVALID_OTP).toBeDefined();
      expect(OTP_ERROR_MESSAGES.INVALID_OTP.code).toBe("INVALID_OTP");
      expect(OTP_ERROR_MESSAGES.INVALID_OTP.recoveryAction).toBe("retry");
    });

    it("should have OTP_RATE_LIMITED message", () => {
      expect(OTP_ERROR_MESSAGES.OTP_RATE_LIMITED).toBeDefined();
      expect(OTP_ERROR_MESSAGES.OTP_RATE_LIMITED.code).toBe("OTP_RATE_LIMITED");
      expect(OTP_ERROR_MESSAGES.OTP_RATE_LIMITED.recoveryAction).toBe("wait");
    });

    it("should have OTP_SEND_FAILED message", () => {
      expect(OTP_ERROR_MESSAGES.OTP_SEND_FAILED).toBeDefined();
      expect(OTP_ERROR_MESSAGES.OTP_SEND_FAILED.code).toBe("OTP_SEND_FAILED");
      expect(OTP_ERROR_MESSAGES.OTP_SEND_FAILED.recoveryAction).toBe("retry");
    });

    it("should have Thai messages for all OTP errors", () => {
      Object.values(OTP_ERROR_MESSAGES).forEach((error) => {
        expect(error.message).toBeTruthy();
        expect(error.message).toMatch(/[\u0E00-\u0E7F]/); // Thai Unicode range
      });
    });
  });

  describe("AUTH_ERROR_MESSAGES", () => {
    describe("Email/Account errors", () => {
      it("should have INVALID_EMAIL message", () => {
        expect(AUTH_ERROR_MESSAGES.INVALID_EMAIL).toBeDefined();
        expect(AUTH_ERROR_MESSAGES.INVALID_EMAIL.code).toBe("INVALID_EMAIL");
        expect(AUTH_ERROR_MESSAGES.INVALID_EMAIL.recoveryAction).toBe("retry");
      });

      it("should have EMAIL_IN_USE message", () => {
        expect(AUTH_ERROR_MESSAGES.EMAIL_IN_USE).toBeDefined();
        expect(AUTH_ERROR_MESSAGES.EMAIL_IN_USE.recoveryAction).toBe("login");
      });

      it("should have EMAIL_NOT_VERIFIED message", () => {
        expect(AUTH_ERROR_MESSAGES.EMAIL_NOT_VERIFIED).toBeDefined();
        expect(AUTH_ERROR_MESSAGES.EMAIL_NOT_VERIFIED.recoveryAction).toBe(
          "contact"
        );
      });

      it("should have ACCOUNT_NOT_FOUND message", () => {
        expect(AUTH_ERROR_MESSAGES.ACCOUNT_NOT_FOUND).toBeDefined();
        expect(AUTH_ERROR_MESSAGES.ACCOUNT_NOT_FOUND.recoveryAction).toBe(
          "retry"
        );
      });

      it("should have ACCOUNT_INACTIVE message", () => {
        expect(AUTH_ERROR_MESSAGES.ACCOUNT_INACTIVE).toBeDefined();
        expect(AUTH_ERROR_MESSAGES.ACCOUNT_INACTIVE.recoveryAction).toBe(
          "contact"
        );
      });

      it("should have ACCOUNT_DELETED message", () => {
        expect(AUTH_ERROR_MESSAGES.ACCOUNT_DELETED).toBeDefined();
        expect(AUTH_ERROR_MESSAGES.ACCOUNT_DELETED.recoveryAction).toBe(
          "contact"
        );
      });
    });

    describe("Session errors", () => {
      it("should have SESSION_REQUIRED message", () => {
        expect(AUTH_ERROR_MESSAGES.SESSION_REQUIRED).toBeDefined();
        expect(AUTH_ERROR_MESSAGES.SESSION_REQUIRED.recoveryAction).toBe(
          "login"
        );
      });

      it("should have SESSION_EXPIRED message", () => {
        expect(AUTH_ERROR_MESSAGES.SESSION_EXPIRED).toBeDefined();
        expect(AUTH_ERROR_MESSAGES.SESSION_EXPIRED.recoveryAction).toBe(
          "login"
        );
      });

      it("should have UNAUTHENTICATED message", () => {
        expect(AUTH_ERROR_MESSAGES.UNAUTHENTICATED).toBeDefined();
        expect(AUTH_ERROR_MESSAGES.UNAUTHENTICATED.recoveryAction).toBe(
          "login"
        );
      });

      it("should have INVALID_SESSION message", () => {
        expect(AUTH_ERROR_MESSAGES.INVALID_SESSION).toBeDefined();
        expect(AUTH_ERROR_MESSAGES.INVALID_SESSION.recoveryAction).toBe(
          "login"
        );
      });
    });

    describe("Token errors", () => {
      it("should have TOKEN_INVALID message", () => {
        expect(AUTH_ERROR_MESSAGES.TOKEN_INVALID).toBeDefined();
        expect(AUTH_ERROR_MESSAGES.TOKEN_INVALID.recoveryAction).toBe("login");
      });

      it("should have TOKEN_EXPIRED message", () => {
        expect(AUTH_ERROR_MESSAGES.TOKEN_EXPIRED).toBeDefined();
        expect(AUTH_ERROR_MESSAGES.TOKEN_EXPIRED.recoveryAction).toBe("login");
      });

      it("should have TOKEN_REVOKED message", () => {
        expect(AUTH_ERROR_MESSAGES.TOKEN_REVOKED).toBeDefined();
        expect(AUTH_ERROR_MESSAGES.TOKEN_REVOKED.recoveryAction).toBe("login");
      });
    });

    describe("Authorization errors", () => {
      it("should have INSUFFICIENT_ROLES message", () => {
        expect(AUTH_ERROR_MESSAGES.INSUFFICIENT_ROLES).toBeDefined();
        expect(AUTH_ERROR_MESSAGES.INSUFFICIENT_ROLES.recoveryAction).toBe(
          "contact"
        );
      });

      it("should have ACCESS_DENIED message", () => {
        expect(AUTH_ERROR_MESSAGES.ACCESS_DENIED).toBeDefined();
        expect(AUTH_ERROR_MESSAGES.ACCESS_DENIED.recoveryAction).toBe(
          "contact"
        );
      });

      it("should have COMPANY_MISMATCH message", () => {
        expect(AUTH_ERROR_MESSAGES.COMPANY_MISMATCH).toBeDefined();
        expect(AUTH_ERROR_MESSAGES.COMPANY_MISMATCH.recoveryAction).toBe(
          "contact"
        );
      });
    });

    describe("Rate limiting errors", () => {
      it("should have RATE_LIMITED message", () => {
        expect(AUTH_ERROR_MESSAGES.RATE_LIMITED).toBeDefined();
        expect(AUTH_ERROR_MESSAGES.RATE_LIMITED.recoveryAction).toBe("wait");
      });

      it("should have TOO_MANY_REQUESTS message", () => {
        expect(AUTH_ERROR_MESSAGES.TOO_MANY_REQUESTS).toBeDefined();
        expect(AUTH_ERROR_MESSAGES.TOO_MANY_REQUESTS.recoveryAction).toBe(
          "wait"
        );
      });
    });

    describe("Network/System errors", () => {
      it("should have NETWORK_ERROR message", () => {
        expect(AUTH_ERROR_MESSAGES.NETWORK_ERROR).toBeDefined();
        expect(AUTH_ERROR_MESSAGES.NETWORK_ERROR.recoveryAction).toBe("retry");
      });

      it("should have SERVER_ERROR message", () => {
        expect(AUTH_ERROR_MESSAGES.SERVER_ERROR).toBeDefined();
        expect(AUTH_ERROR_MESSAGES.SERVER_ERROR.recoveryAction).toBe("retry");
      });

      it("should have UNKNOWN_ERROR message", () => {
        expect(AUTH_ERROR_MESSAGES.UNKNOWN_ERROR).toBeDefined();
        expect(AUTH_ERROR_MESSAGES.UNKNOWN_ERROR.recoveryAction).toBe("retry");
      });
    });

    it("should have Thai messages for all auth errors", () => {
      Object.values(AUTH_ERROR_MESSAGES).forEach((error) => {
        expect(error.message).toBeTruthy();
        expect(error.message).toMatch(/[\u0E00-\u0E7F]/); // Thai Unicode range
      });
    });

    it("should have valid recovery actions", () => {
      const validActions = ["retry", "wait", "login", "contact"];
      Object.values(AUTH_ERROR_MESSAGES).forEach((error) => {
        if (error.recoveryAction) {
          expect(validActions).toContain(error.recoveryAction);
        }
      });
    });
  });

  describe("FIREBASE_ERROR_MAP", () => {
    it("should map Firebase authentication errors", () => {
      expect(FIREBASE_ERROR_MAP["auth/invalid-email"]).toBe("INVALID_EMAIL");
      expect(FIREBASE_ERROR_MAP["auth/user-disabled"]).toBe("ACCOUNT_INACTIVE");
      expect(FIREBASE_ERROR_MAP["auth/user-not-found"]).toBe(
        "ACCOUNT_NOT_FOUND"
      );
      expect(FIREBASE_ERROR_MAP["auth/wrong-password"]).toBe(
        "INVALID_CREDENTIALS"
      );
      expect(FIREBASE_ERROR_MAP["auth/invalid-credential"]).toBe(
        "INVALID_CREDENTIALS"
      );
    });

    it("should map Firebase registration errors", () => {
      expect(FIREBASE_ERROR_MAP["auth/email-already-in-use"]).toBe(
        "EMAIL_IN_USE"
      );
      expect(FIREBASE_ERROR_MAP["auth/weak-password"]).toBe("WEAK_PASSWORD");
      expect(FIREBASE_ERROR_MAP["auth/operation-not-allowed"]).toBe(
        "OPERATION_NOT_ALLOWED"
      );
    });

    it("should map Firebase token/session errors", () => {
      expect(FIREBASE_ERROR_MAP["auth/id-token-expired"]).toBe("TOKEN_EXPIRED");
      expect(FIREBASE_ERROR_MAP["auth/id-token-revoked"]).toBe("TOKEN_REVOKED");
      expect(FIREBASE_ERROR_MAP["auth/session-cookie-expired"]).toBe(
        "SESSION_EXPIRED"
      );
      expect(FIREBASE_ERROR_MAP["auth/session-cookie-revoked"]).toBe(
        "SESSION_EXPIRED"
      );
      expect(FIREBASE_ERROR_MAP["auth/requires-recent-login"]).toBe(
        "SESSION_EXPIRED"
      );
    });

    it("should map Firebase rate limiting errors", () => {
      expect(FIREBASE_ERROR_MAP["auth/too-many-requests"]).toBe(
        "TOO_MANY_REQUESTS"
      );
    });

    it("should map Firebase network errors", () => {
      expect(FIREBASE_ERROR_MAP["auth/network-request-failed"]).toBe(
        "NETWORK_ERROR"
      );
    });

    it("should map Firebase OAuth errors", () => {
      expect(FIREBASE_ERROR_MAP["auth/popup-blocked"]).toBe("POPUP_BLOCKED");
      expect(FIREBASE_ERROR_MAP["auth/popup-closed-by-user"]).toBe(
        "POPUP_CLOSED"
      );
      expect(
        FIREBASE_ERROR_MAP["auth/account-exists-with-different-credential"]
      ).toBe("ACCOUNT_EXISTS_DIFFERENT_PROVIDER");
    });

    it("should map Firebase OTP errors", () => {
      expect(FIREBASE_ERROR_MAP["auth/invalid-verification-code"]).toBe(
        "INVALID_OTP"
      );
      expect(FIREBASE_ERROR_MAP["auth/invalid-verification-id"]).toBe(
        "INVALID_OTP"
      );
      expect(FIREBASE_ERROR_MAP["auth/code-expired"]).toBe("OTP_EXPIRED");
    });
  });

  describe("getThaiErrorMessage", () => {
    it("should return OTP error message for OTP codes", () => {
      const message = getThaiErrorMessage("OTP_NOT_FOUND");
      expect(message.code).toBe("OTP_NOT_FOUND");
      expect(message.message).toBe("ไม่พบรหัส OTP");
      expect(message.recoveryAction).toBe("retry");
    });

    it("should return auth error message for auth codes", () => {
      const message = getThaiErrorMessage("INVALID_EMAIL");
      expect(message.code).toBe("INVALID_EMAIL");
      expect(message.message).toBe("รูปแบบอีเมลไม่ถูกต้อง");
      expect(message.recoveryAction).toBe("retry");
    });

    it("should map Firebase codes and return Thai messages", () => {
      const message = getThaiErrorMessage("auth/invalid-email");
      expect(message.code).toBe("INVALID_EMAIL");
      expect(message.message).toBe("รูปแบบอีเมลไม่ถูกต้อง");
    });

    it("should return UNKNOWN_ERROR for unmapped codes", () => {
      const message = getThaiErrorMessage("SOME_RANDOM_ERROR");
      expect(message.code).toBe("UNKNOWN_ERROR");
      expect(message.message).toBe("เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ");
      expect(message.recoveryAction).toBe("retry");
    });

    it("should prioritize OTP errors over auth errors", () => {
      const message = getThaiErrorMessage("OTP_EXPIRED");
      expect(message.code).toBe("OTP_EXPIRED");
      expect(message.message).toBe("รหัส OTP หมดอายุ");
    });

    it("should handle session errors", () => {
      const message = getThaiErrorMessage("SESSION_EXPIRED");
      expect(message.code).toBe("SESSION_EXPIRED");
      expect(message.recoveryAction).toBe("login");
    });

    it("should handle rate limit errors", () => {
      const message = getThaiErrorMessage("RATE_LIMITED");
      expect(message.code).toBe("RATE_LIMITED");
      expect(message.recoveryAction).toBe("wait");
    });
  });

  describe("mapFirebaseErrorCode", () => {
    it("should map known Firebase codes to app codes", () => {
      expect(mapFirebaseErrorCode("auth/invalid-email")).toBe("INVALID_EMAIL");
      expect(mapFirebaseErrorCode("auth/user-not-found")).toBe(
        "ACCOUNT_NOT_FOUND"
      );
      expect(mapFirebaseErrorCode("auth/email-already-in-use")).toBe(
        "EMAIL_IN_USE"
      );
    });

    it("should return UNKNOWN_ERROR for unmapped codes", () => {
      expect(mapFirebaseErrorCode("auth/some-unknown-error")).toBe(
        "UNKNOWN_ERROR"
      );
      expect(mapFirebaseErrorCode("completely-invalid")).toBe("UNKNOWN_ERROR");
    });

    it("should handle all mapped Firebase auth errors", () => {
      const firebaseCodes = [
        "auth/invalid-email",
        "auth/user-disabled",
        "auth/user-not-found",
        "auth/wrong-password",
        "auth/invalid-credential",
      ];

      firebaseCodes.forEach((code) => {
        const appCode = mapFirebaseErrorCode(code);
        expect(appCode).not.toBe("UNKNOWN_ERROR");
        expect(appCode).toBeTruthy();
      });
    });
  });

  describe("getFirebaseErrorMessage", () => {
    it("should return Thai message for Firebase auth errors", () => {
      const message = getFirebaseErrorMessage("auth/invalid-email");
      expect(message.code).toBe("INVALID_EMAIL");
      expect(message.message).toBe("รูปแบบอีเมลไม่ถูกต้อง");
      expect(message.recoveryAction).toBe("retry");
    });

    it("should return Thai message for Firebase session errors", () => {
      const message = getFirebaseErrorMessage("auth/session-cookie-expired");
      expect(message.code).toBe("SESSION_EXPIRED");
      expect(message.message).toContain("เซสชันหมดอายุ");
      expect(message.recoveryAction).toBe("login");
    });

    it("should return UNKNOWN_ERROR for unmapped Firebase codes", () => {
      const message = getFirebaseErrorMessage("auth/unknown-firebase-error");
      expect(message.code).toBe("UNKNOWN_ERROR");
      expect(message.message).toBe("เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ");
    });

    it("should handle Firebase OTP errors", () => {
      const message = getFirebaseErrorMessage("auth/code-expired");
      expect(message.code).toBe("OTP_EXPIRED");
      expect(message.message).toBe("รหัส OTP หมดอายุ");
    });

    it("should handle Firebase network errors", () => {
      const message = getFirebaseErrorMessage("auth/network-request-failed");
      expect(message.code).toBe("NETWORK_ERROR");
      expect(message.recoveryAction).toBe("retry");
    });

    it("should handle Firebase rate limiting", () => {
      const message = getFirebaseErrorMessage("auth/too-many-requests");
      expect(message.code).toBe("TOO_MANY_REQUESTS");
      expect(message.recoveryAction).toBe("wait");
    });
  });

  describe("Type safety", () => {
    it("should have proper ThaiErrorMessage structure for all OTP errors", () => {
      Object.entries(OTP_ERROR_MESSAGES).forEach(([key, value]) => {
        expect(value).toHaveProperty("code");
        expect(value).toHaveProperty("message");
        expect(value.code).toBe(key);
        if (value.recoveryAction) {
          expect(["retry", "wait", "login", "contact"]).toContain(
            value.recoveryAction
          );
        }
      });
    });

    it("should have proper ThaiErrorMessage structure for all auth errors", () => {
      Object.entries(AUTH_ERROR_MESSAGES).forEach(([key, value]) => {
        expect(value).toHaveProperty("code");
        expect(value).toHaveProperty("message");
        expect(value.code).toBe(key);
        if (value.recoveryAction) {
          expect(["retry", "wait", "login", "contact"]).toContain(
            value.recoveryAction
          );
        }
      });
    });
  });
});
