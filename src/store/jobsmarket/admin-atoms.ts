"use client";

import { atom } from "jotai";

/**
 * Admin-related atoms for platform administration
 * Per ADM-R00 Cross-Cutting RIS
 */

/**
 * User roles from user_accounts document
 * Used for authorization checks across the admin panel
 */
export const userRolesAtom = atom<string[] | null>(null);

/**
 * Admin statistics for sidebar badges
 * { pendingCompanies, pendingCandidates, pendingJobs }
 */
export interface AdminStats {
  pendingCompanies: number;
  pendingCandidates: number;
  pendingJobs: number;
}

export const adminStatsAtom = atom<AdminStats | null>(null);

/**
 * Admin loading state
 * Used to show loading indicators while fetching admin data
 */
export const adminStatsLoadingAtom = atom<boolean>(false);
