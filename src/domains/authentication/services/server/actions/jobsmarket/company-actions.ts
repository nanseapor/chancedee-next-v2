/**
 * Company Registration Server Actions
 * Per AUTH-R02 Implementation Plan Section 2.3
 * Per BLS-01 §3.2 Data Effects (Company Flow Mode A & B)
 *
 * Handles company account creation for both modes:
 * - Mode A: Create new company
 * - Mode B: Join existing company
 */

"use server";

import { headers } from "next/headers";
import { generateDocumentId } from "@/lib/database/utils/firebase-utils";
import { login } from "@/domains/authentication/services/server/actions/session";
import { webUserAccountCreate } from "@/lib/database/actions/user-accounts";
import { webUserInfoCreate } from "@/lib/database/actions/user-info";
import { webCompanyInformationCreate } from "@/lib/database/actions/company-information";
import { webConsentRecordCreate } from "@/lib/database/actions/consent-records";

/**
 * Create company account - Mode A (Create New Company)
 * Per BLS-01 §3.2 Company Mode A Steps 5-9
 *
 * IMPORTANT: User gets roles ['company', 'admin', 'pending']
 * They will become company admin when approved by platform
 */
export async function createCompanyAccountModeA(data: {
  firebaseUid: string;
  email: string;
  displayName?: string;
  companyData: {
    companyName: string;
    companyNameEn?: string;
    taxId: string;
    industry: string;
    employeeCount: string;
    address: string;
    province: string;
    district: string;
    postalCode: string;
    phone: string;
    website?: string;
    description: string;
    companyLogoUrl?: string;
    documentUrl: string; // Required: uploaded company document
  };
}): Promise<{ success: boolean; companyId?: string; error?: string }> {
  try {
    const clientIP = (await headers()).get("x-forwarded-for") || "unknown";
    const userAgent = (await headers()).get("user-agent") || "";

    // Step 5: Create company_information document (pending approval)
    const companyId = generateDocumentId("company_information");

    // Map employeeCount to company size enum (S/M/L)
    let companySize: "S" | "M" | "L" | undefined;
    if (data.companyData.employeeCount) {
      const count = parseInt(data.companyData.employeeCount);
      if (count < 50) companySize = "S";
      else if (count < 200) companySize = "M";
      else companySize = "L";
    }

    await webCompanyInformationCreate({
      uid: companyId,
      companyName: data.companyData.companyName,
      shortDescription: data.companyData.description,
      shortDescriptionText: data.companyData.description,
      industry: data.companyData.industry,
      overview: data.companyData.description,
      overviewText: data.companyData.description,
      taxId: data.companyData.taxId,
      website: data.companyData.website || "",
      coverPhoto: "",
      profilePhoto: data.companyData.companyLogoUrl || "",
      videoLink: "",
      companySize: companySize,
      travelMode: "",
      travelStation: "",
      benefitsDetails: "",
      benefitsText: "",
      mapLocation: "",
      status: "pending", // Pending platform admin approval
      isActive: false, // Hidden until approved
      staff: [],
      createdBy: data.firebaseUid,
      createdAt: Date.now(),
      updatedBy: data.firebaseUid,
      updatedAt: Date.now(),
    }, data.firebaseUid, companyId);

    // Step 6: Create user_accounts with company admin roles (pending)
    await webUserAccountCreate({
      uid: data.firebaseUid,
      email: data.email,
      firstnameTH: data.displayName || "",
      lastnameTH: "",
      nicknameTH: "",
      gender: "",
      phone: "",
      isPolicyAccepted: true,
      isActive: true,
      serviceTypes: "company",
      citizenId: "",
      avatarURL: "",
      jobTitle: "",
      status: "pending",
      createdBy: data.firebaseUid,
      updatedBy: data.firebaseUid,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }, data.firebaseUid, data.firebaseUid);

    // Step 6b: Create user_info document with roles and transfer
    await webUserInfoCreate({
      uid: data.firebaseUid,
      roles: ["company", "admin", "pending"], // Mode A: Will be company admin
      companyId: companyId,
      currentStep: 0,
      currentStepName: "pending_approval",
      remark: `Pending platform admin approval for new company: ${data.companyData.companyName}`,
    }, data.firebaseUid, data.firebaseUid);

    // Step 7: Create consent_records
    await webConsentRecordCreate({
      uid: generateDocumentId("consent_records"),
      userId: data.firebaseUid,
      sessionId: undefined,
      ipHash: hashIp(clientIP).substring(0, 16),
      userAgent: userAgent,
      policyVersion: "2.0",
      versionNumber: 1,
      preferences: {
        essential: true,
        analytics: true,
        marketing: true,
        functional: true,
      },
      consentMethod: "banner",
      changeReason: "initial",
      isActive: true,
      createdBy: data.firebaseUid,
      createdAt: Date.now(),
      updatedBy: data.firebaseUid,
      updatedAt: Date.now(),
    }, data.firebaseUid);

    // Step 8: Send notification to platform admins
    await sendPlatformAdminNotification({
      type: "company-registration-pending",
      companyId,
      companyName: data.companyData.companyName,
      taxId: data.companyData.taxId,
      requestorEmail: data.email,
    });

    // Step 9: Create session cookie
    const sessionResult = await login(data.firebaseUid);
    if (!sessionResult.success) {
      return {
        success: false,
        error: "ไม่สามารถสร้าง session ได้",
      };
    }

    return { success: true, companyId };
  } catch (error) {
    console.error("Error creating company account (Mode A):", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "เกิดข้อผิดพลาด",
    };
  }
}

/**
 * Create company account - Mode B (Join Existing Company)
 * Per BLS-01 §3.2 Company Mode B Steps 4-7
 *
 * IMPORTANT: User gets roles ['candidate', 'pending']
 * They will become staff member when approved by company admin
 */
export async function createCompanyAccountModeB(data: {
  firebaseUid: string;
  email: string;
  displayName?: string;
  selectedCompanyId: string;
  nameCardUrl: string; // Required: uploaded name card
}): Promise<{ success: boolean; error?: string }> {
  try {
    const clientIP = (await headers()).get("x-forwarded-for") || "unknown";
    const userAgent = (await headers()).get("user-agent") || "";

    // Step 4: Create user_accounts with candidate + pending roles
    await webUserAccountCreate({
      uid: data.firebaseUid,
      email: data.email,
      firstnameTH: data.displayName || "",
      lastnameTH: "",
      nicknameTH: "",
      gender: "",
      phone: "",
      isPolicyAccepted: true,
      isActive: true,
      serviceTypes: "candidate",
      citizenId: "",
      avatarURL: "",
      jobTitle: "",
      status: "pending",
      createdBy: data.firebaseUid,
      updatedBy: data.firebaseUid,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }, data.firebaseUid, data.firebaseUid);

    // Step 4b: Create user_info document with roles and transfer
    await webUserInfoCreate({
      uid: data.firebaseUid,
      roles: ["candidate", "pending"], // Mode B: Will be staff member (NOT admin)
      companyId: data.selectedCompanyId,
      currentStep: 0,
      currentStepName: "pending_company_approval",
      remark: `Pending company admin approval. Name card: ${data.nameCardUrl}`,
    }, data.firebaseUid, data.firebaseUid);

    // Step 5: Create consent_records
    await webConsentRecordCreate({
      uid: generateDocumentId("consent_records"),
      userId: data.firebaseUid,
      sessionId: undefined,
      ipHash: hashIp(clientIP).substring(0, 16),
      userAgent: userAgent,
      policyVersion: "2.0",
      versionNumber: 1,
      preferences: {
        essential: true,
        analytics: true,
        marketing: true,
        functional: true,
      },
      consentMethod: "banner",
      changeReason: "initial",
      isActive: true,
      createdBy: data.firebaseUid,
      createdAt: Date.now(),
      updatedBy: data.firebaseUid,
      updatedAt: Date.now(),
    }, data.firebaseUid);

    // Step 6: Send notification to company admin
    await sendCompanyAdminNotification({
      type: "staff-join-request",
      companyId: data.selectedCompanyId,
      requestorEmail: data.email,
      requestorName: data.displayName || data.email,
      nameCardUrl: data.nameCardUrl,
    });

    // Step 7: Create session cookie
    const sessionResult = await login(data.firebaseUid);
    if (!sessionResult.success) {
      return {
        success: false,
        error: "ไม่สามารถสร้าง session ได้",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Error creating company account (Mode B):", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "เกิดข้อผิดพลาด",
    };
  }
}

/**
 * Hash IP address for privacy compliance
 * Per PDPA requirements - only store hashed IP
 */
function hashIp(ip: string): string {
  // Simple hash for demonstration - use crypto.createHash('sha256') in production
  let hash = 0;
  for (let i = 0; i < ip.length; i++) {
    const char = ip.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(16, "0");
}

/**
 * Send notification to platform admins
 * Per BLS-01 §3.2 - Platform admin notification for Mode A
 */
async function sendPlatformAdminNotification(data: {
  type: "company-registration-pending";
  companyId: string;
  companyName: string;
  taxId: string;
  requestorEmail: string;
}): Promise<void> {
  // TODO: Implement email notification using SendGrid
  // Template: company-registration-pending
  // To: process.env.PLATFORM_ADMIN_EMAILS
  console.log("Platform admin notification:", data);
}

/**
 * Send notification to company admin
 * Per BLS-01 §3.2 - Company admin notification for Mode B
 */
async function sendCompanyAdminNotification(data: {
  type: "staff-join-request";
  companyId: string;
  requestorEmail: string;
  requestorName: string;
  nameCardUrl: string;
}): Promise<void> {
  // TODO: Implement email notification using SendGrid
  // Template: staff-join-request
  // To: company admins from company_information.admin_emails
  console.log("Company admin notification:", data);
}
