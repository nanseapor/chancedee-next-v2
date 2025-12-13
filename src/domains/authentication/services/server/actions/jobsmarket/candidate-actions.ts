/**
 * Candidate Registration Server Actions
 * Per AUTH-R02 Implementation Plan Section 2.3
 * Per BLS-01 §3.2 Data Effects (Candidate Flow)
 *
 * Handles candidate account creation for both Google OAuth and Email/Password flows
 */

"use server";

import { headers } from "next/headers";
import { generateDocumentId } from "@/lib/database/utils/firebase-utils";
import { login } from "@/domains/authentication/services/server/actions/session";
import { webUserAccountCreate } from "@/lib/database/actions/user-accounts";
import { webUserInfoCreate } from "@/lib/database/actions/user-info";
import { webCandidateInformationCreate } from "@/lib/database/actions/candidate-information";
import { webConsentRecordCreate } from "@/lib/database/actions/consent-records";

/**
 * Create candidate account (Email/Password flow)
 * Per BLS-01 §3.2 Candidate Email Flow Steps 5-9
 */
export async function createCandidateAccountEmail(data: {
  firebaseUid: string;
  email: string;
  displayName?: string;
  referralCode?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const clientIP = (await headers()).get("x-forwarded-for") || "unknown";
    const userAgent = (await headers()).get("user-agent") || "";

    // Step 5: Create user_accounts document
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
      status: "active",
      createdBy: data.firebaseUid,
      updatedBy: data.firebaseUid,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }, data.firebaseUid, data.firebaseUid);

    // Step 5b: Create user_info document with roles
    await webUserInfoCreate({
      uid: data.firebaseUid,
      roles: ["candidate"],
      currentStep: 0,
      currentStepName: "email_verified",
    }, data.firebaseUid, data.firebaseUid);

    // Step 6: Create candidate_information document
    await webCandidateInformationCreate({
      resumePhotoURL: "",
      firstnameTH: "",
      lastnameTH: "",
      nicknameTH: "",
      email: data.email,
      phone: "",
      addressLine1: "",
      addressLine2: "",
      subDistrict: "",
      district: "",
      province: "",
      postCode: "",
      birthdate: 0,
      bloodgroup: "",
      birthplace: "",
      religion: "",
      nationality: "",
      race: "",
      height: 0,
      weight: 0,
      maritalStatus: "",
      millitaryStatus: "",
      lineId: "",
      aboutMe: "",
      areaOfExpertise: "",
      achievement: "",
      hasCar: false,
      hasMotorcycle: false,
      isActive: true,
      isSearchable: true,
    }, data.firebaseUid, data.firebaseUid);

    // Step 7: Create wallets document with signup bonus
    // TODO: Implement wallet creation when wallet actions are available
    // await webWalletsCreate({
    //   uid: generateDocumentId("wallets"),
    //   user_id: data.firebaseUid,
    //   total_coins: 100, // BLS-01 §6 Sign-up bonus
    //   available_coins: 100,
    //   reserved_coins: 0,
    //   total_earned: 100,
    //   total_spent: 0,
    //   created_at: Timestamp.now(),
    //   updated_at: Timestamp.now(),
    // });

    // Step 8: Create consent_records document
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

    // Step 9: Create session cookie
    const sessionResult = await login(data.firebaseUid);
    if (!sessionResult.success) {
      return {
        success: false,
        error: "ไม่สามารถสร้าง session ได้",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Error creating candidate account (email):", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "เกิดข้อผิดพลาด",
    };
  }
}

/**
 * Create candidate account (Google OAuth flow)
 * Per BLS-01 §3.2 Candidate Google Flow Steps 4-9
 */
export async function createCandidateAccountGoogle(data: {
  firebaseUid: string;
  email: string;
  displayName: string;
  photoUrl?: string;
  referralCode?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const clientIP = (await headers()).get("x-forwarded-for") || "unknown";
    const userAgent = (await headers()).get("user-agent") || "";

    // Step 4: Create user_accounts document
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
      avatarURL: data.photoUrl || "",
      jobTitle: "",
      status: "active",
      createdBy: data.firebaseUid,
      updatedBy: data.firebaseUid,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }, data.firebaseUid, data.firebaseUid);

    // Step 4b: Create user_info document with roles
    await webUserInfoCreate({
      uid: data.firebaseUid,
      roles: ["candidate"],
      currentStep: 0,
      currentStepName: "oauth_verified",
    }, data.firebaseUid, data.firebaseUid);

    // Step 5: Create candidate_information document
    await webCandidateInformationCreate({
      resumePhotoURL: data.photoUrl || "",
      firstnameTH: "",
      lastnameTH: "",
      nicknameTH: "",
      email: data.email,
      phone: "",
      addressLine1: "",
      addressLine2: "",
      subDistrict: "",
      district: "",
      province: "",
      postCode: "",
      birthdate: 0,
      bloodgroup: "",
      birthplace: "",
      religion: "",
      nationality: "",
      race: "",
      height: 0,
      weight: 0,
      maritalStatus: "",
      millitaryStatus: "",
      lineId: "",
      aboutMe: "",
      areaOfExpertise: "",
      achievement: "",
      hasCar: false,
      hasMotorcycle: false,
      isActive: true,
      isSearchable: true,
    }, data.firebaseUid, data.firebaseUid);

    // Step 6: Create wallets document with signup bonus
    // TODO: Implement wallet creation when wallet actions are available
    // await webWalletsCreate({
    //   uid: generateDocumentId("wallets"),
    //   user_id: data.firebaseUid,
    //   total_coins: 100, // BLS-01 §6 Sign-up bonus
    //   available_coins: 100,
    //   reserved_coins: 0,
    //   total_earned: 100,
    //   total_spent: 0,
    //   created_at: Timestamp.now(),
    //   updated_at: Timestamp.now(),
    // });

    // Step 7: Create consent_records document
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

    // Step 8: Create session cookie
    const sessionResult = await login(data.firebaseUid);
    if (!sessionResult.success) {
      return {
        success: false,
        error: "ไม่สามารถสร้าง session ได้",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Error creating candidate account (Google):", error);
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
