import type {
  BaseAppType,
  BaseFirebaseType,
} from "@/lib/database/schemas/base.schema";
import type { Timestamp } from "firebase-admin/firestore";

export interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

export type ConsentMethod =
  | "banner"
  | "settings_page"
  | "api"
  | "policy_update";
export type ChangeReason =
  | "initial"
  | "user_update"
  | "policy_change"
  | "withdrawal"
  | "expiry";

export interface ConsentRecordFirebaseType extends BaseFirebaseType {
  user_id?: string;
  session_id?: string;
  ip_hash: string;
  user_agent: string;
  policy_version: string;
  preferences: CookiePreferences;
  consent_method: ConsentMethod;
  withdrawal_date?: Timestamp | null;
  is_active: boolean;
  parent_consent_id?: string;
  version_number: number;
  change_reason: ChangeReason;
  previous_preferences?: CookiePreferences;
}

export interface ConsentRecordAppType extends BaseAppType {
  userId?: string;
  sessionId?: string;
  ipHash: string;
  userAgent: string;
  policyVersion: string;
  preferences: CookiePreferences;
  consentMethod: ConsentMethod;
  withdrawalDate?: number;
  isActive: boolean;
  parentConsentId?: string;
  versionNumber: number;
  changeReason: ChangeReason;
  previousPreferences?: CookiePreferences;
}

export interface ConsentUpdateRequest {
  preferences: CookiePreferences;
  sessionId?: string;
  changeReason?: ChangeReason;
}

export interface ConsentHistoryItem {
  id: string;
  timestamp: number;
  preferences: CookiePreferences;
  changeReason: ChangeReason;
  policyVersion: string;
  isActive: boolean;
}

// Constants
export const COOKIE_POLICY_VERSION = "2.0";
export const CONSENT_COOKIE_NAME = "gdpr_consent";
export const CONSENT_EXPIRY_DAYS = 365;

// Default preferences
export const DEFAULT_PREFERENCES: CookiePreferences = {
  essential: true, // Always true - required for site functionality
  analytics: false,
  marketing: false,
  functional: false,
};

// Cookie category descriptions for UI
export const COOKIE_CATEGORIES = {
  essential: {
    name: "คุกกี้จำเป็น",
    description: "จำเป็นสำหรับการทำงานพื้นฐานของเว็บไซต์ ไม่สามารถปิดได้",
    examples: ["การเข้าสู่ระบบ", "ตะกร้าสินค้า", "การรักษาความปลอดภัย"],
    retention: "ตลอดการใช้งาน",
  },
  analytics: {
    name: "คุกกี้วิเคราะห์",
    description: "ช่วยวิเคราะห์การใช้งานเว็บไซต์เพื่อปรับปรุงประสบการณ์",
    examples: ["Google Analytics", "การติดตามหน้าเว็บ", "สถิติการใช้งาน"],
    retention: "30 วัน",
  },
  marketing: {
    name: "คุกกี้การตลาด",
    description: "ใช้แสดงโฆษณาที่เกี่ยวข้องและติดตามประสิทธิภาพโฆษณา",
    examples: ["Facebook Pixel", "Google Ads", "โฆษณาเฉพาะบุคคล"],
    retention: "90 วัน",
  },
  functional: {
    name: "คุกกี้การทำงาน",
    description: "เพิ่มฟีเจอร์เสริมเช่นแชท การตั้งค่าส่วนบุคคล",
    examples: ["วิดเจ็ตแชท", "การตั้งค่าภาษา", "ธีมเว็บไซต์"],
    retention: "1 ปี",
  },
} as const;
