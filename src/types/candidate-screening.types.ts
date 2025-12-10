import type { IBaseDatabaseInterface } from "./database.types";

export type activityTypes =
  | "login"
  | "application"
  | "profile_update"
  | "resume_update"
  | "flag"
  | "suspension";
export type contentSeverity = "low" | "medium" | "high";
export type flagStatus = "pending" | "reviewed" | "cleared";
export type suspensionStatus = "active" | "expired";
export type profileVerificationStatus =
  | "verified"
  | "unverified"
  | "flagged"
  | "suspended";

export interface FirebaseCandidateScreeningData extends IBaseDatabaseInterface {
  uid: string;
  lastActive?: number;
  profileStatus?: profileVerificationStatus;
  flagCount?: number;
  emailVerification?: boolean;
  phoneVerification?: boolean;
  identityVerification?: boolean;
  riskScore?: number;
}

export interface FirebaseSuspensionRecords extends IBaseDatabaseInterface {
  date: string;
  reason: string;
  duration: string;
  adminId: string;
  adminName: string;
  status: suspensionStatus;
}

export interface FirebaseActivityLogs extends IBaseDatabaseInterface {
  type?: activityTypes;
  description?: string;
  timestamp?: string;
  ipAddress?: string;
  location?: string;
  deviceInfo?: string;
}

export interface FirebaseContentFlags extends IBaseDatabaseInterface {
  section: string;
  content: string;
  reason: string;
  severity: contentSeverity;
  date: string;
  status: flagStatus;
  reviewedBy?: string;
}

export interface CandidateScreeningData {
  id: string;
  lastActive: string;
  profileStatus: profileVerificationStatus;
  flagCount: number;
  suspensionHistory?: SuspensionRecord[];
  verificationStatus?: {
    email: boolean;
    phone: boolean;
    identity: boolean;
  };
  riskScore?: number;
  resumeFlags?: ContentFlag[];
  applicationFlags?: ContentFlag[];
  activityLogs?: ActivityLog[];
}

export interface SuspensionRecord {
  date: string;
  reason: string;
  duration: string;
  adminId: string;
  adminName: string;
  status: suspensionStatus;
}

export interface ContentFlag {
  id: string;
  section: string;
  content: string;
  reason: string;
  severity: contentSeverity;
  date: string;
  status: flagStatus;
  reviewedBy?: string;
}

export interface ActivityLog {
  id: string;
  type: activityTypes;
  description: string;
  timestamp: string;
  ipAddress?: string;
  location?: string;
  deviceInfo?: string;
}
