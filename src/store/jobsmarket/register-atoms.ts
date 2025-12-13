/**
 * Registration Flow Atoms
 * Per AUTH-R02 Implementation Plan Section 3.2
 *
 * State management for /auth/register route
 */

import { atom } from "jotai";

/**
 * Registration page state machine
 * Aligned with RIS AUTH-R02 §6.1 and §6.2 state diagrams
 */
export type RegisterPageState =
  | "role_select" // Initial: show role cards
  | "auth_form" // Email/password/Google form
  | "sending_otp" // OTP being sent
  | "otp_verify" // Verify 6-digit OTP
  | "create_password" // Set password (email flow)
  | "google_auth" // OAuth popup in progress
  | "creating_firebase" // Firebase Auth user creation
  | "creating_session" // Session cookie creation
  | "creating_account" // Firestore docs creation
  | "company_details" // Company step 2 form (company only)
  | "uploading_doc" // Document upload in progress
  | "submitting_request" // Company request submission
  | "pending" // Success - pending approval
  | "success" // Success - redirect to dashboard
  | "error"; // Error state

export const registerPageStateAtom = atom<RegisterPageState>("role_select");

/**
 * Selected role (candidate or company)
 */
export const selectedRoleAtom = atom<"candidate" | "company" | null>(null);

/**
 * Company registration mode
 * Mode A: Create new company
 * Mode B: Join existing company
 */
export const companyModeAtom = atom<"new" | "join">("new");

/**
 * Current wizard step (for company flow)
 * Step 1: Auth form (email → OTP → password)
 * Step 2: Company details (Mode A or Mode B)
 * Step 3: Pending confirmation
 */
export const wizardStepAtom = atom<number>(1);

/**
 * OTP verification state
 * Per BLS-01 §3.3 - 60 second cooldown
 */
export interface OTPState {
  refCode: string;
  cooldownSeconds: number;
  attemptCount: number;
  verified: boolean;
}

export const otpStateAtom = atom<OTPState>({
  refCode: "",
  cooldownSeconds: 0,
  attemptCount: 0,
  verified: false,
});

/**
 * Error state
 */
export interface RegisterError {
  code: string;
  message: string;
  field?: string;
}

export const registerErrorAtom = atom<RegisterError | null>(null);

/**
 * Form data persistence
 */
export const emailAtom = atom<string>("");
export const passwordAtom = atom<string>("");
export const confirmPasswordAtom = atom<string>("");
export const termsAcceptedAtom = atom<boolean>(false);
export const employerTermsAcceptedAtom = atom<boolean>(false); // Company only

/**
 * Email existence check result
 */
export interface EmailExistsResult {
  exists: boolean;
  roles?: string[];
  method?: "email" | "google";
}

export const emailExistsResultAtom = atom<EmailExistsResult | null>(null);

/**
 * Loading state
 */
export const isLoadingAtom = atom<boolean>(false);

/**
 * Referral code from query parameter
 */
export const referralCodeAtom = atom<string>("");

/**
 * Company search state (Mode B)
 */
export interface CompanySearchResult {
  uid: string;
  companyName: string;
  companyNameEn?: string;
  companyLogo?: string;
  industry: string;
}

export const companySearchQueryAtom = atom<string>("");
export const companySearchResultsAtom = atom<CompanySearchResult[]>([]);
export const selectedCompanyAtom = atom<CompanySearchResult | null>(null);

/**
 * File upload state
 */
export const uploadedFileAtom = atom<File | null>(null); // Company doc (Mode A)
export const nameCardFileAtom = atom<File | null>(null); // Name card (Mode B)
export const uploadProgressAtom = atom<number>(0);
