"use client";

import { atom } from "jotai";

/**
 * Login-flow-specific atoms for jobsmarket auth
 * Per AUTH-R01 Implementation Plan §3.2, §3.3
 * Aligned with AUTH-R01 RIS §6.1 State Machine
 */

/**
 * Login page state machine
 * Per AUTH-R01 RIS §6.1
 */
export type LoginPageState =
  | "check_auth"      // Initial load - checking existing session
  | "already_auth"    // User has session, redirecting to dashboard
  | "idle"            // Show login form
  | "show_message"    // Show context (e.g., "เข้าสู่ระบบเพื่อดำเนินการต่อ")
  | "authenticating"  // Firebase auth in progress
  | "routing"         // Post-login routing logic
  | "redirecting"     // Navigation happening
  | "error";          // Error state, form re-enabled

/**
 * Login error info structure
 */
export interface LoginError {
  code: string;
  message: string;
}

/**
 * Context message types from ?from query parameter
 * Per AUTH-R01 Implementation Plan §6.1
 */
export type ContextFromType =
  | "session-expired"
  | "registration"
  | "protected"
  | "password-reset";

/**
 * Current login page state
 * Starts with check_auth to verify existing session
 */
export const loginPageStateAtom = atom<LoginPageState>("check_auth");

/**
 * Login error information
 * Populated when loginPageState is 'error'
 */
export const loginErrorAtom = atom<LoginError | null>(null);

/**
 * Terms and conditions checkbox state
 * Must be true before login can proceed
 */
export const termsAcceptedAtom = atom<boolean>(false);

/**
 * Context message from ?from query parameter
 * Used to show relevant message in SHOW_MESSAGE state
 */
export const contextMessageAtom = atom<ContextFromType | null>(null);

/**
 * Redirect URL from ?redirect query parameter
 * Used after successful login
 */
export const redirectUrlAtom = atom<string | null>(null);

/**
 * Preferred login method from ?method query parameter
 * Used to focus Google button or email input
 */
export const preferredMethodAtom = atom<"social" | "email" | null>(null);

/**
 * Context message Thai copy mapping
 * Per AUTH-R01 Implementation Plan §6.2
 */
export const CONTEXT_MESSAGES: Record<ContextFromType, string> = {
  "session-expired": "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่",
  "registration": "สร้างบัญชีสำเร็จ กรุณาเข้าสู่ระบบ",
  "protected": "เข้าสู่ระบบเพื่อดำเนินการต่อ",
  "password-reset": "รีเซ็ตรหัสผ่านสำเร็จ",
};
