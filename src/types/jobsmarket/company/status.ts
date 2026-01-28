/**
 * COMP-R00: Company Status Types
 *
 * Defines company approval status and membership status
 */

/**
 * Company approval/registration status
 * Matches existing status field in company_information collection
 */
export type CompanyStatus = "pending" | "approved" | "rejected" | "suspended";

/**
 * Company membership status for a user
 */
export type MembershipStatus =
  | "active" // Current active member
  | "invited" // Invited but not yet accepted
  | "removed"; // Previously a member, now removed

/**
 * Status display configuration
 */
export const COMPANY_STATUS_CONFIG: Record<
  CompanyStatus,
  {
    label: string;
    color: "green" | "yellow" | "red" | "gray";
    description: string;
  }
> = {
  pending: {
    label: "รอการอนุมัติ",
    color: "yellow",
    description: "บริษัทของคุณอยู่ระหว่างการตรวจสอบ",
  },
  approved: {
    label: "อนุมัติแล้ว",
    color: "green",
    description: "บริษัทพร้อมใช้งาน",
  },
  rejected: {
    label: "ไม่อนุมัติ",
    color: "red",
    description: "การสมัครถูกปฏิเสธ",
  },
  suspended: {
    label: "ถูกระงับ",
    color: "red",
    description: "บริษัทถูกระงับชั่วคราว",
  },
} as const;
