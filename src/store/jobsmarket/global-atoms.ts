"use client";

import { atom } from "jotai";

/**
 * Global atoms for jobsmarket subdomain
 * These atoms are used across multiple domains (auth, navigation, shells)
 * Per AUTH-R01 Implementation Plan §3.1
 */

/**
 * User role types in jobsmarket
 * - candidate: Job seeker
 * - company: Employer/recruiter
 */
export type JobsmarketRole = "candidate" | "company";

/**
 * Session state for the current user
 * Per AUTH-R00 cross-cutting RIS
 */
export type SessionState =
  | "loading"        // Initial check in progress
  | "unauthenticated" // No valid session
  | "authenticated"   // Valid session exists
  | "expired";        // Session expired, needs refresh

/**
 * Active role for multi-role users
 * Used by shells and navigation to determine which dashboard to show
 * Persisted to localStorage on change
 */
export const activeRoleAtom = atom<JobsmarketRole | null>(null);

/**
 * Current session state
 * Used by auth guards and navigation components
 */
export const sessionStateAtom = atom<SessionState>("loading");

/**
 * User ID from authenticated session
 * Populated after successful authentication
 */
export const authenticatedUserIdAtom = atom<string | null>(null);

/**
 * Global authentication error
 * Per AUTH-R00 §4
 *
 * Used for:
 * - Session expiry modals (can happen on any page)
 * - OTP errors during registration
 * - API call failures across routes
 */
export interface AuthError {
  code: string;
  message: string; // Thai error message
  recoveryAction?: "retry" | "wait" | "login" | "contact";
}

export const authErrorAtom = atom<AuthError | null>(null);
