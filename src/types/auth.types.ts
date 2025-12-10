import type { DecodedIdToken } from "firebase-admin/auth";

import type { IBaseDatabaseInterface } from "./database.types";

/**
 * Core authentication result type returned by the unified auth system
 */
export interface AuthResult {
  user: DecodedIdToken; // Firebase user claims and tokens
  profile?: userDataProps; // Full user profile from database (optional)
  method: "session" | "token"; // Authentication method used
}

/**
 * Authentication options for configuring auth behavior
 */
export interface AuthOptions {
  includeProfile?: boolean; // Whether to fetch full user profile from database
  requireRoles?: string[]; // Required user roles for authorization
  requireVerification?: boolean; // Require email verification
  allowInactive?: boolean; // Allow inactive users (default: false)
}

/**
 * Authentication method type
 */
export type AuthMethod = "session" | "token" | "auto";

/**
 * Enhanced authentication options with additional UI/UX settings
 */
export interface EnhancedAuthOptions extends AuthOptions {
  redirectTo?: string; // Redirect URL for unauthenticated users
  method?: AuthMethod; // Preferred authentication method
  errorHandler?: (error: Error) => void; // Custom error handler
}

/**
 * Authentication error code type
 */
export type AuthErrorCode =
  | "session-required"
  | "token-invalid"
  | "token-expired"
  | "token-revoked"
  | "email-not-verified"
  | "account-inactive"
  | "insufficient-roles"
  | "access-denied"
  | "company-mismatch"
  | "resource-forbidden";

export type userInfoProps = {
  uid: string;
  roles: string[];
  companyId?: string;
  currentStep?: number;
  currentStepName?: string;
  remark?: string;
};

export type userTransferProps = {
  uid: string;
  targetCompany: string;
  requestTimestamp: number;
  transferApproved: boolean;
};

export interface FirebaseUserDataProps extends IBaseDatabaseInterface {
  uid: string;
  avatarURL?: string;
  firstnameTH?: string;
  lastnameTH?: string;
  nicknameTH?: string;
  email?: string;
  phone?: string;
  gender?: string;
  isActive: boolean;
  isPolicyAccepted?: boolean;
  serviceTypes?: string;
  citizenId?: string;
  jobTitle?: string;
  status?: string;
}

export interface userDataProps extends IBaseDatabaseInterface {
  uid: string;
  avatarURL?: string;
  firstnameTH?: string;
  lastnameTH?: string;
  nicknameTH?: string;
  firstnameEN?: string;
  lastnameEN?: string;
  nicknameEN?: string;
  gender?: string;
  email?: string;
  phone?: string;
  info: userInfoProps;
  transfer?: userTransferProps;
  isActive: boolean;
  isPolicyAccepted?: boolean;
  serviceTypes?: string;
  citizenId?: string;
  jobTitle?: string;
  status?: string;
}

export type DeleteAccountProps = {
  documentCode: string;
  firstNameTH: string;
  lastNameTH: string;
  phoneNumber: string;
  email: string;
  status: string;
  attachedFiles: string[];
  createAt?: number;
  updateAt?: number;
  createdBy?: string;
  updatedBy?: string;
};

export type SupportTicketProps = {
  documentCode: string;
  firstNameTH: string;
  lastNameTH: string;
  phoneNumber: string;
  email: string;
  note?: string;
  status: string;
  attachedFiles: string[];
  createAt?: number;
  updateAt?: number;
  createdBy?: string;
  updatedBy?: string;
};

export interface FirebaseOTPData {
  uid: string;
  email: string;
  otpCode: string;
  refCode: string;
  createDate: number;
  status?: string;
}
