"use server";

import { FieldValue } from "firebase-admin/firestore";

import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";
import type { CompanyActionResult } from "./admin-company-actions.types";

// Re-export type for consumers
export type { CompanyActionResult } from "./admin-company-actions.types";

import { requireAdminAuth } from "./admin-auth";

/**
 * Admin Company Actions
 * Per ADM-R02 Company Management RIS §3.3 Company Actions
 *
 * Server actions for approving, rejecting, suspending,
 * and reactivating companies.
 */

/**
 * Approve a pending company
 *
 * @param companyId - The company ID to approve
 * @returns Success or error result
 *
 * Transitions: pending → approved
 */
export async function approveCompany(
  companyId: string
): Promise<CompanyActionResult> {
  try {
    const admin = await requireAdminAuth();

    const db = getFirebaseAdminFirestore();
    const companyRef = db.collection("company_information").doc(companyId);
    const companyDoc = await companyRef.get();

    if (!companyDoc.exists) {
      return { success: false, error: "Company not found" };
    }

    const data = companyDoc.data()!;
    const currentStatus = data.status;

    if (currentStatus !== "pending") {
      return {
        success: false,
        error: "Company must be in pending status to approve",
      };
    }

    await companyRef.update({
      status: "approved",
      approved_at: FieldValue.serverTimestamp(),
      approved_by: admin.userId,
      updated_at: FieldValue.serverTimestamp(),
    });

    console.log("[Admin Company Action] approve:", {
      companyId,
      adminId: admin.userId,
      previousStatus: currentStatus,
      newStatus: "approved",
    });

    return { success: true };
  } catch (error) {
    console.error("[Admin Company Action] Error approving company:", error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: "Failed to approve company" };
  }
}

/**
 * Reject a pending company
 *
 * @param companyId - The company ID to reject
 * @param reason - The reason for rejection (required)
 * @returns Success or error result
 *
 * Transitions: pending → rejected
 */
export async function rejectCompany(
  companyId: string,
  reason: string
): Promise<CompanyActionResult> {
  try {
    const admin = await requireAdminAuth();

    if (!reason || reason.trim() === "") {
      return { success: false, error: "Rejection reason is required" };
    }

    const db = getFirebaseAdminFirestore();
    const companyRef = db.collection("company_information").doc(companyId);
    const companyDoc = await companyRef.get();

    if (!companyDoc.exists) {
      return { success: false, error: "Company not found" };
    }

    const data = companyDoc.data()!;
    const currentStatus = data.status;

    if (currentStatus !== "pending") {
      return {
        success: false,
        error: "Company must be in pending status to reject",
      };
    }

    await companyRef.update({
      status: "rejected",
      rejection_reason: reason.trim(),
      rejected_at: FieldValue.serverTimestamp(),
      rejected_by: admin.userId,
      updated_at: FieldValue.serverTimestamp(),
    });

    console.log("[Admin Company Action] reject:", {
      companyId,
      adminId: admin.userId,
      previousStatus: currentStatus,
      newStatus: "rejected",
      reason: reason.trim(),
    });

    return { success: true };
  } catch (error) {
    console.error("[Admin Company Action] Error rejecting company:", error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: "Failed to reject company" };
  }
}

/**
 * Suspend an approved company
 *
 * @param companyId - The company ID to suspend
 * @param reason - The reason for suspension (required)
 * @param duration - Optional suspension duration in days
 * @returns Success or error result
 *
 * Transitions: approved → suspended
 */
export async function suspendCompany(
  companyId: string,
  reason: string,
  duration?: number
): Promise<CompanyActionResult> {
  try {
    const admin = await requireAdminAuth();

    if (!reason || reason.trim() === "") {
      return { success: false, error: "Suspension reason is required" };
    }

    const db = getFirebaseAdminFirestore();
    const companyRef = db.collection("company_information").doc(companyId);
    const companyDoc = await companyRef.get();

    if (!companyDoc.exists) {
      return { success: false, error: "Company not found" };
    }

    const data = companyDoc.data()!;
    const currentStatus = data.status;

    if (currentStatus !== "approved") {
      return {
        success: false,
        error: "Company must be in approved status to suspend",
      };
    }

    const updateData: Record<string, unknown> = {
      status: "suspended",
      suspension_reason: reason.trim(),
      suspended_at: FieldValue.serverTimestamp(),
      suspended_by: admin.userId,
      updated_at: FieldValue.serverTimestamp(),
    };

    if (duration !== undefined && duration > 0) {
      const suspendUntil = new Date();
      suspendUntil.setDate(suspendUntil.getDate() + duration);
      updateData.suspension_until = suspendUntil;
    }

    await companyRef.update(updateData);

    console.log("[Admin Company Action] suspend:", {
      companyId,
      adminId: admin.userId,
      previousStatus: currentStatus,
      newStatus: "suspended",
      reason: reason.trim(),
      duration,
    });

    return { success: true };
  } catch (error) {
    console.error("[Admin Company Action] Error suspending company:", error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: "Failed to suspend company" };
  }
}

/**
 * Reactivate a suspended company
 *
 * @param companyId - The company ID to reactivate
 * @param note - Optional note for reactivation
 * @returns Success or error result
 *
 * Transitions: suspended → approved
 */
export async function reactivateCompany(
  companyId: string,
  note?: string
): Promise<CompanyActionResult> {
  try {
    const admin = await requireAdminAuth();

    const db = getFirebaseAdminFirestore();
    const companyRef = db.collection("company_information").doc(companyId);
    const companyDoc = await companyRef.get();

    if (!companyDoc.exists) {
      return { success: false, error: "Company not found" };
    }

    const data = companyDoc.data()!;
    const currentStatus = data.status;

    if (currentStatus !== "suspended") {
      return {
        success: false,
        error: "Company must be in suspended status to reactivate",
      };
    }

    const updateData: Record<string, unknown> = {
      status: "approved",
      reactivated_at: FieldValue.serverTimestamp(),
      reactivated_by: admin.userId,
      updated_at: FieldValue.serverTimestamp(),
      // Clear suspension fields
      suspension_until: null,
    };

    if (note && note.trim() !== "") {
      updateData.reactivation_note = note.trim();
    }

    await companyRef.update(updateData);

    console.log("[Admin Company Action] reactivate:", {
      companyId,
      adminId: admin.userId,
      previousStatus: currentStatus,
      newStatus: "approved",
      note: note?.trim(),
    });

    return { success: true };
  } catch (error) {
    console.error("[Admin Company Action] Error reactivating company:", error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: "Failed to reactivate company" };
  }
}
