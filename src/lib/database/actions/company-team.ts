"use server";

import { Filter, FieldValue } from "firebase-admin/firestore";

import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";
import { verifySessionCookie } from "@/utils/auth";
import {
  CompanyRole,
  hasPermission,
  ROLE_LABELS,
} from "@/types/jobsmarket/company/roles";
import type { TeamMember } from "@/types/jobsmarket/company/team";
import type { TeamActionResult, PendingEmployee } from "./company-team.types";

// Re-export types for consumers
export type { TeamActionResult, PendingEmployee } from "./company-team.types";

// ============================================================
// Internal Helpers
// ============================================================

/**
 * Authenticate current user and check company membership + permission
 */
async function requireCompanyAuth(
  companyId: string,
  requiredPermission?: "manage_team" | "company_settings"
): Promise<{
  userId: string;
  email: string;
  role: CompanyRole;
}> {
  // Verify session
  const decodedClaims = await verifySessionCookie();
  if (!decodedClaims) {
    throw new Error("Unauthorized: No valid session");
  }

  const userId = decodedClaims.uid;

  // Get user data
  const db = getFirebaseAdminFirestore();
  const userDoc = await db.collection("user_accounts").doc(userId).get();

  if (!userDoc.exists) {
    throw new Error("Unauthorized: User not found");
  }

  const userData = userDoc.data();
  const userCompanyId = userData?.company_id?.id;

  // Check company membership
  if (userCompanyId !== companyId) {
    throw new Error("Forbidden: User does not belong to this company");
  }

  // Get role from roles array - find first matching company role
  const roles: string[] = userData?.roles || [];
  let role: CompanyRole = "viewer";

  // Priority: admin > hr_manager > recruiter > interviewer > viewer
  if (roles.includes("admin")) role = "admin";
  else if (roles.includes("hr_manager")) role = "hr_manager";
  else if (roles.includes("recruiter")) role = "recruiter";
  else if (roles.includes("interviewer")) role = "interviewer";
  else if (roles.includes("viewer")) role = "viewer";

  // Check permission if required
  if (requiredPermission && !hasPermission(role, requiredPermission)) {
    throw new Error(
      `Forbidden: ${requiredPermission} permission required (you are ${ROLE_LABELS[role]})`
    );
  }

  return {
    userId,
    email: decodedClaims.email || "",
    role,
  };
}

/**
 * Count admins in company
 */
async function countCompanyAdmins(companyId: string): Promise<number> {
  const db = getFirebaseAdminFirestore();
  const companyRef = db.collection("company_information").doc(companyId);

  const snapshot = await db
    .collection("user_accounts")
    .where("company_id", "==", companyRef)
    .where("roles", "array-contains", "admin")
    .get();

  return snapshot.size;
}

/**
 * Check if application is expired (> 7 days)
 */
function isApplicationExpired(requestTimestamp: number): boolean {
  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
  return Date.now() - requestTimestamp > SEVEN_DAYS_MS;
}

// ============================================================
// Read Actions
// ============================================================

/**
 * Get all team members for a company
 */
export async function getCompanyTeam(
  companyId: string
): Promise<TeamActionResult<TeamMember[]>> {
  try {
    await requireCompanyAuth(companyId);

    const db = getFirebaseAdminFirestore();
    const companyRef = db.collection("company_information").doc(companyId);

    const snapshot = await db
      .collection("user_accounts")
      .where("company_id", "==", companyRef)
      .get();

    const members: TeamMember[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      const roles: string[] = data.roles || [];

      // Determine primary role
      let role: CompanyRole = "viewer";
      if (roles.includes("admin")) role = "admin";
      else if (roles.includes("hr_manager")) role = "hr_manager";
      else if (roles.includes("recruiter")) role = "recruiter";
      else if (roles.includes("interviewer")) role = "interviewer";

      return {
        uid: doc.id,
        displayName:
          data.display_name ||
          `${data.first_name_th || ""} ${data.last_name_th || ""}`.trim() ||
          data.email ||
          "Unknown",
        email: data.email || "",
        avatarUrl: data.avatar_url,
        role,
        status: "active" as const,
        joinedAt: data.joined_at?.toMillis() || data.created_at?.toMillis() || Date.now(),
        invitedBy: data.invited_by,
        lastActiveAt: data.last_active_at?.toMillis(),
      };
    });

    // Sort: admins first, then by name
    members.sort((a, b) => {
      if (a.role === "admin" && b.role !== "admin") return -1;
      if (a.role !== "admin" && b.role === "admin") return 1;
      return a.displayName.localeCompare(b.displayName, "th");
    });

    return { success: true, data: members };
  } catch (error) {
    console.error("[Team Action] Error getting team:", error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: "Failed to get team members" };
  }
}

/**
 * Get pending employee applications for a company
 */
export async function getPendingEmployees(
  companyId: string
): Promise<TeamActionResult<PendingEmployee[]>> {
  try {
    await requireCompanyAuth(companyId);

    const db = getFirebaseAdminFirestore();
    const companyRef = db.collection("company_information").doc(companyId);

    // Query users who have requested to join this company
    const snapshot = await db
      .collection("user_accounts")
      .where("target_company", "==", companyRef)
      .where("transfer_approved", "==", false)
      .get();

    const pending: PendingEmployee[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      const requestTimestamp =
        data.request_timestamp?.toMillis() || Date.now();

      return {
        uid: doc.id,
        email: data.email || "",
        displayName:
          data.display_name ||
          `${data.first_name_th || ""} ${data.last_name_th || ""}`.trim() ||
          data.email ||
          "Unknown",
        avatarUrl: data.avatar_url,
        requestTimestamp,
        isExpired: isApplicationExpired(requestTimestamp),
      };
    });

    // Sort by request timestamp (newest first)
    pending.sort((a, b) => b.requestTimestamp - a.requestTimestamp);

    return { success: true, data: pending };
  } catch (error) {
    console.error("[Team Action] Error getting pending employees:", error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: "Failed to get pending applications" };
  }
}

// ============================================================
// Write Actions
// ============================================================

/**
 * Accept a pending employee application (COMP-014)
 */
export async function acceptNewEmployee(
  companyId: string,
  targetUserId: string
): Promise<TeamActionResult> {
  try {
    const auth = await requireCompanyAuth(companyId, "manage_team");

    if (!targetUserId || targetUserId.trim() === "") {
      return { success: false, error: "User ID is required" };
    }

    const db = getFirebaseAdminFirestore();
    const userRef = db.collection("user_accounts").doc(targetUserId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return { success: false, error: "User not found" };
    }

    const userData = userDoc.data();
    const companyRef = db.collection("company_information").doc(companyId);

    // Verify user is pending for this company
    if (
      userData?.target_company?.id !== companyId ||
      userData?.transfer_approved === true
    ) {
      return {
        success: false,
        error: "User is not pending for this company",
      };
    }

    // Update user to be company member

    await userRef.update({
      company_id: companyRef,
      roles: FieldValue.arrayUnion("company", "viewer"),
      target_company: FieldValue.delete(),
      transfer_approved: true,
      joined_at: FieldValue.serverTimestamp(),
      invited_by: auth.userId,
      updated_by: auth.userId,
      updated_at: FieldValue.serverTimestamp(),
    });

    console.log("[Team Action] acceptNewEmployee:", {
      companyId,
      targetUserId,
      acceptedBy: auth.userId,
    });

    return { success: true };
  } catch (error) {
    console.error("[Team Action] Error accepting employee:", error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: "Failed to accept employee" };
  }
}

/**
 * Reject a pending employee application (COMP-015)
 */
export async function rejectNewEmployee(
  companyId: string,
  targetUserId: string
): Promise<TeamActionResult> {
  try {
    const auth = await requireCompanyAuth(companyId, "manage_team");

    if (!targetUserId || targetUserId.trim() === "") {
      return { success: false, error: "User ID is required" };
    }

    const db = getFirebaseAdminFirestore();
    const userRef = db.collection("user_accounts").doc(targetUserId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return { success: false, error: "User not found" };
    }

    const userData = userDoc.data();

    // Verify user is pending for this company
    if (
      userData?.target_company?.id !== companyId ||
      userData?.transfer_approved === true
    ) {
      return {
        success: false,
        error: "User is not pending for this company",
      };
    }

    // Clear transfer request and reset to candidate
    await userRef.update({
      target_company: FieldValue.delete(),
      request_timestamp: FieldValue.delete(),
      transfer_approved: FieldValue.delete(),
      roles: ["candidate"],
      updated_by: auth.userId,
      updated_at: FieldValue.serverTimestamp(),
    });

    console.log("[Team Action] rejectNewEmployee:", {
      companyId,
      targetUserId,
      rejectedBy: auth.userId,
    });

    return { success: true };
  } catch (error) {
    console.error("[Team Action] Error rejecting employee:", error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: "Failed to reject employee" };
  }
}

/**
 * Change an employee's role (COMP-016)
 */
export async function toggleEmployeeRole(
  companyId: string,
  targetUserId: string,
  newRole: CompanyRole
): Promise<TeamActionResult> {
  try {
    const auth = await requireCompanyAuth(companyId, "manage_team");

    if (!targetUserId || targetUserId.trim() === "") {
      return { success: false, error: "User ID is required" };
    }

    // Cannot change own role
    if (targetUserId === auth.userId) {
      return { success: false, error: "Cannot change your own role" };
    }

    const db = getFirebaseAdminFirestore();
    const companyRef = db.collection("company_information").doc(companyId);
    const userRef = db.collection("user_accounts").doc(targetUserId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return { success: false, error: "User not found" };
    }

    const userData = userDoc.data();

    // Verify user is a company member
    if (userData?.company_id?.id !== companyId) {
      return {
        success: false,
        error: "User is not a member of this company",
      };
    }

    // Check if demoting last admin
    const currentRoles: string[] = userData?.roles || [];
    const isCurrentlyAdmin = currentRoles.includes("admin");
    const isDemotingFromAdmin = isCurrentlyAdmin && newRole !== "admin";

    if (isDemotingFromAdmin) {
      const adminCount = await countCompanyAdmins(companyId);
      if (adminCount <= 1) {
        return {
          success: false,
          error: "Cannot demote last admin. Promote another member first.",
        };
      }
    }

    // Build new roles array
    const companyRoles: CompanyRole[] = [
      "admin",
      "hr_manager",
      "recruiter",
      "interviewer",
      "viewer",
    ];
    const newRoles = currentRoles.filter(
      (r) => !companyRoles.includes(r as CompanyRole) && r !== "company"
    );
    newRoles.push("company", newRole);

    await userRef.update({
      roles: newRoles,
      updated_by: auth.userId,
      updated_at: FieldValue.serverTimestamp(),
    });

    console.log("[Team Action] toggleEmployeeRole:", {
      companyId,
      targetUserId,
      newRole,
      changedBy: auth.userId,
    });

    return { success: true };
  } catch (error) {
    console.error("[Team Action] Error changing role:", error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: "Failed to change role" };
  }
}

/**
 * Remove an employee from the company (COMP-017)
 */
export async function removeEmployee(
  companyId: string,
  targetUserId: string
): Promise<TeamActionResult> {
  try {
    const auth = await requireCompanyAuth(companyId, "manage_team");

    if (!targetUserId || targetUserId.trim() === "") {
      return { success: false, error: "User ID is required" };
    }

    // Cannot remove self
    if (targetUserId === auth.userId) {
      return { success: false, error: "Cannot remove yourself from company" };
    }

    const db = getFirebaseAdminFirestore();
    const userRef = db.collection("user_accounts").doc(targetUserId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return { success: false, error: "User not found" };
    }

    const userData = userDoc.data();

    // Verify user is a company member
    if (userData?.company_id?.id !== companyId) {
      return {
        success: false,
        error: "User is not a member of this company",
      };
    }

    // Check if removing last admin
    const currentRoles: string[] = userData?.roles || [];
    const isAdmin = currentRoles.includes("admin");

    if (isAdmin) {
      const adminCount = await countCompanyAdmins(companyId);
      if (adminCount <= 1) {
        return {
          success: false,
          error: "Cannot remove last admin. Promote another member first.",
        };
      }
    }

    // Remove from company
    await userRef.update({
      company_id: FieldValue.delete(),
      roles: ["candidate"],
      updated_by: auth.userId,
      updated_at: FieldValue.serverTimestamp(),
    });

    console.log("[Team Action] removeEmployee:", {
      companyId,
      targetUserId,
      removedBy: auth.userId,
    });

    return { success: true };
  } catch (error) {
    console.error("[Team Action] Error removing employee:", error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: "Failed to remove employee" };
  }
}
