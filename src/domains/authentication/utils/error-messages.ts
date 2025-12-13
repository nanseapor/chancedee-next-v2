/**
 * Thai Error Message Utilities
 * Per AUTH-R00 Cross-Cutting Infrastructure
 *
 * Maps error codes to Thai messages for jobsmarket authentication flows
 * Extends existing auth-errors.ts with Thai localization
 */

export interface ThaiErrorMessage {
  code: string;
  message: string; // Thai
  recoveryAction?: "retry" | "wait" | "login" | "contact";
}

/**
 * Thai error messages for OTP-related errors
 * Per BLS-01 §3.3, §3.4
 */
export const OTP_ERROR_MESSAGES: Record<string, ThaiErrorMessage> = {
  OTP_NOT_FOUND: {
    code: "OTP_NOT_FOUND",
    message: "ไม่พบรหัส OTP",
    recoveryAction: "retry",
  },
  OTP_ALREADY_USED: {
    code: "OTP_ALREADY_USED",
    message: "รหัส OTP ถูกใช้งานแล้ว",
    recoveryAction: "retry",
  },
  OTP_EXPIRED: {
    code: "OTP_EXPIRED",
    message: "รหัส OTP หมดอายุ",
    recoveryAction: "retry",
  },
  INVALID_OTP: {
    code: "INVALID_OTP",
    message: "รหัส OTP ไม่ถูกต้อง",
    recoveryAction: "retry",
  },
  OTP_RATE_LIMITED: {
    code: "OTP_RATE_LIMITED",
    message: "กรุณารอสักครู่ก่อนขอรหัสใหม่",
    recoveryAction: "wait",
  },
  OTP_SEND_FAILED: {
    code: "OTP_SEND_FAILED",
    message: "ส่งรหัส OTP ไม่สำเร็จ กรุณาลองใหม่",
    recoveryAction: "retry",
  },
};

/**
 * Thai error messages for authentication errors
 * Complements AUTH_ERROR_CODES from auth-errors.ts
 */
export const AUTH_ERROR_MESSAGES: Record<string, ThaiErrorMessage> = {
  // Email/Account errors
  INVALID_EMAIL: {
    code: "INVALID_EMAIL",
    message: "รูปแบบอีเมลไม่ถูกต้อง",
    recoveryAction: "retry",
  },
  EMAIL_IN_USE: {
    code: "EMAIL_IN_USE",
    message: "อีเมลนี้ถูกใช้งานแล้ว",
    recoveryAction: "login",
  },
  EMAIL_NOT_VERIFIED: {
    code: "EMAIL_NOT_VERIFIED",
    message: "กรุณายืนยันอีเมลก่อนดำเนินการต่อ",
    recoveryAction: "contact",
  },
  ACCOUNT_NOT_FOUND: {
    code: "ACCOUNT_NOT_FOUND",
    message: "ไม่พบบัญชีผู้ใช้",
    recoveryAction: "retry",
  },
  ACCOUNT_INACTIVE: {
    code: "ACCOUNT_INACTIVE",
    message: "บัญชีนี้ถูกระงับการใช้งาน",
    recoveryAction: "contact",
  },
  ACCOUNT_DELETED: {
    code: "ACCOUNT_DELETED",
    message: "บัญชีนี้ถูกลบแล้ว",
    recoveryAction: "contact",
  },

  // Session errors
  SESSION_REQUIRED: {
    code: "SESSION_REQUIRED",
    message: "กรุณาเข้าสู่ระบบ",
    recoveryAction: "login",
  },
  SESSION_EXPIRED: {
    code: "SESSION_EXPIRED",
    message: "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่",
    recoveryAction: "login",
  },
  UNAUTHENTICATED: {
    code: "UNAUTHENTICATED",
    message: "กรุณาเข้าสู่ระบบ",
    recoveryAction: "login",
  },
  INVALID_SESSION: {
    code: "INVALID_SESSION",
    message: "เซสชันไม่ถูกต้อง กรุณาเข้าสู่ระบบใหม่",
    recoveryAction: "login",
  },

  // Token errors
  TOKEN_INVALID: {
    code: "TOKEN_INVALID",
    message: "โทเค็นไม่ถูกต้อง",
    recoveryAction: "login",
  },
  TOKEN_EXPIRED: {
    code: "TOKEN_EXPIRED",
    message: "โทเค็นหมดอายุ",
    recoveryAction: "login",
  },
  TOKEN_REVOKED: {
    code: "TOKEN_REVOKED",
    message: "โทเค็นถูกเพิกถอน",
    recoveryAction: "login",
  },

  // Authorization errors
  INSUFFICIENT_ROLES: {
    code: "INSUFFICIENT_ROLES",
    message: "คุณไม่มีสิทธิ์เข้าถึงส่วนนี้",
    recoveryAction: "contact",
  },
  ACCESS_DENIED: {
    code: "ACCESS_DENIED",
    message: "การเข้าถึงถูกปฏิเสธ",
    recoveryAction: "contact",
  },
  COMPANY_MISMATCH: {
    code: "COMPANY_MISMATCH",
    message: "คุณไม่สามารถเข้าถึงข้อมูลบริษัทนี้ได้",
    recoveryAction: "contact",
  },

  // Rate limiting
  RATE_LIMITED: {
    code: "RATE_LIMITED",
    message: "กรุณารอสักครู่ก่อนลองใหม่",
    recoveryAction: "wait",
  },
  TOO_MANY_REQUESTS: {
    code: "TOO_MANY_REQUESTS",
    message: "มีการร้องขอมากเกินไป กรุณาลองใหม่ในภายหลัง",
    recoveryAction: "wait",
  },

  // Network/System errors
  NETWORK_ERROR: {
    code: "NETWORK_ERROR",
    message: "เชื่อมต่อไม่สำเร็จ กรุณาตรวจสอบอินเทอร์เน็ต",
    recoveryAction: "retry",
  },
  SERVER_ERROR: {
    code: "SERVER_ERROR",
    message: "เกิดข้อผิดพลาดของเซิร์ฟเวอร์",
    recoveryAction: "retry",
  },
  UNKNOWN_ERROR: {
    code: "UNKNOWN_ERROR",
    message: "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ",
    recoveryAction: "retry",
  },
};

/**
 * Firebase Auth error code mapping
 * Maps Firebase error codes to application error codes
 * Per AUTH-R00 Appendix A.1
 */
export const FIREBASE_ERROR_MAP: Record<string, string> = {
  // Authentication errors
  "auth/invalid-email": "INVALID_EMAIL",
  "auth/user-disabled": "ACCOUNT_INACTIVE",
  "auth/user-not-found": "ACCOUNT_NOT_FOUND",
  "auth/wrong-password": "INVALID_CREDENTIALS",
  "auth/invalid-credential": "INVALID_CREDENTIALS",

  // Registration errors
  "auth/email-already-in-use": "EMAIL_IN_USE",
  "auth/weak-password": "WEAK_PASSWORD",
  "auth/operation-not-allowed": "OPERATION_NOT_ALLOWED",

  // Token/Session errors
  "auth/id-token-expired": "TOKEN_EXPIRED",
  "auth/id-token-revoked": "TOKEN_REVOKED",
  "auth/session-cookie-expired": "SESSION_EXPIRED",
  "auth/session-cookie-revoked": "SESSION_EXPIRED",
  "auth/requires-recent-login": "SESSION_EXPIRED",

  // Rate limiting
  "auth/too-many-requests": "TOO_MANY_REQUESTS",

  // Network
  "auth/network-request-failed": "NETWORK_ERROR",

  // OAuth
  "auth/popup-blocked": "POPUP_BLOCKED",
  "auth/popup-closed-by-user": "POPUP_CLOSED",
  "auth/account-exists-with-different-credential":
    "ACCOUNT_EXISTS_DIFFERENT_PROVIDER",

  // Other
  "auth/invalid-verification-code": "INVALID_OTP",
  "auth/invalid-verification-id": "INVALID_OTP",
  "auth/code-expired": "OTP_EXPIRED",
};

/**
 * Get Thai error message for any error code
 *
 * @param code - Error code (app code, Firebase code, or OTP code)
 * @returns Thai error message object
 */
export function getThaiErrorMessage(code: string): ThaiErrorMessage {
  // Check OTP errors first
  if (OTP_ERROR_MESSAGES[code]) {
    return OTP_ERROR_MESSAGES[code];
  }

  // Check auth errors
  if (AUTH_ERROR_MESSAGES[code]) {
    return AUTH_ERROR_MESSAGES[code];
  }

  // Check if it's a Firebase error code
  const appCode = FIREBASE_ERROR_MAP[code];
  if (appCode && AUTH_ERROR_MESSAGES[appCode]) {
    return AUTH_ERROR_MESSAGES[appCode];
  }

  // Default unknown error
  return (
    AUTH_ERROR_MESSAGES.UNKNOWN_ERROR || {
      code: "UNKNOWN_ERROR",
      message: "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ",
      recoveryAction: "retry" as const,
    }
  );
}

/**
 * Map Firebase error code to application error code
 *
 * @param firebaseCode - Firebase Auth error code (e.g., "auth/invalid-email")
 * @returns Application error code (e.g., "INVALID_EMAIL")
 */
export function mapFirebaseErrorCode(firebaseCode: string): string {
  return FIREBASE_ERROR_MAP[firebaseCode] || "UNKNOWN_ERROR";
}

/**
 * Get Thai error message directly from Firebase error code
 *
 * @param firebaseCode - Firebase Auth error code
 * @returns Thai error message object
 */
export function getFirebaseErrorMessage(
  firebaseCode: string
): ThaiErrorMessage {
  const appCode = mapFirebaseErrorCode(firebaseCode);
  return getThaiErrorMessage(appCode);
}
