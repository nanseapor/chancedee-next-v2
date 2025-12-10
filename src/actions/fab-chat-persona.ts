"use server";

import getCandidateDataWithToken from "@/actions/candidate-data";
import getUserDataWithToken from "@/actions/user-data";
import { DEFAULT_CANDIDATE_DATA } from "@/constant/candidateConstants";
import {
  createCandidateDataProps,
  updateCandidateDataProps,
} from "@/lib/database/repositories/web-candidate-data-props";
import { updateUserDataProps } from "@/lib/database/repositories/web-user-data-props";
import { getFirebaseAdminAuth } from "@/lib/firebase-admin";
import { PersonaCheckResult, PersonaData } from "@/types/persona.types";


/**
 * Check if user has completed persona information for FAB chat
 */
export async function checkUserPersona(
  idToken: string,
): Promise<PersonaCheckResult> {
  try {
    const user = await getFirebaseAdminAuth().verifyIdToken(idToken);
    if (!user) {
      return { isComplete: false, missingFields: ["authentication"] };
    }

    // Fetch user account and candidate information in parallel
    // Using functions that handle seeding if data not found
    const [userData, candidateInfo] = await Promise.all([
      getUserDataWithToken(idToken),
      getCandidateDataWithToken(idToken),
    ]);

    const missingFields: string[] = [];
    const currentData: PersonaData = {};

    // Check career level (from candidate_information)
    if (!candidateInfo) {
      missingFields.push("careerLevel");
    } else {
      currentData.careerLevel = candidateInfo?.preference?.experience;
    }

    // Check birthdate (from candidate_information)
    if (!candidateInfo?.birthdate) {
      missingFields.push("birthdate");
    } else {
      currentData.birthdate = candidateInfo.birthdate;
    }

    if (!candidateInfo?.educations || !Array.isArray(candidateInfo.educations) || candidateInfo.educations.length === 0) {
      missingFields.push("educationLevel");
    } else {
      currentData.educationLevel = candidateInfo.educations;
    }



    // Check gender (from user_accounts)
    if (!userData?.gender) {
      missingFields.push("gender");
    } else {
      currentData.gender = userData.gender;
    }

    // Check consent (from user_accounts) - must be explicitly true
    if (userData?.isPolicyAccepted !== true) {
      missingFields.push("isConsent");
    } else {
      currentData.isConsent = userData.isPolicyAccepted;
    }

    return {
      isComplete: missingFields.length === 0,
      missingFields,
      currentData,
    };
  } catch (error) {
    console.error("Error checking user persona:", error);
    return { isComplete: false, missingFields: ["error"] };
  }
}

/**
 * Save user persona data for FAB chat
 */
export async function saveUserPersona(
  idToken: string,
  personaData: PersonaData,
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getFirebaseAdminAuth().verifyIdToken(idToken);
    if (!user) {
      return { success: false, error: "Authentication failed" };
    }

    const uid = user.uid;

    // Validate that all required fields are provided
    if (
      !personaData.careerLevel ||
      !personaData.birthdate ||
      !personaData.gender ||
      !personaData.educationLevel ||
      !Array.isArray(personaData.educationLevel) ||
      personaData.educationLevel.length === 0 ||
      !personaData.isConsent
    ) {
      console.error("❌ Incomplete persona data received:", {
        careerLevel: !!personaData.careerLevel,
        birthdate: !!personaData.birthdate,
        gender: !!personaData.gender,
        educationLevel: !!personaData.educationLevel && Array.isArray(personaData.educationLevel) && personaData.educationLevel.length > 0,
        isConsent: !!personaData.isConsent,
      });
      return {
        success: false,
        error: "กรุณากรอกข้อมูลให้ครบถ้วน (ระดับประสบการณ์, วันเกิด, เพศ, การศึกษา, และยอมรับข้อตกลง)",
      };
    }

    // Get existing data - using functions that handle seeding if data not found
    const [userData, candidateInfo] = await Promise.all([
      getUserDataWithToken(idToken),
      getCandidateDataWithToken(idToken),
    ]);

    if (!userData) {
      return {
        success: false,
        error: "Failed to retrieve or create user data",
      };
    }

    // Update both user_accounts and candidate_information in parallel
    // No need for conditional checks since we've validated all fields exist
    console.log("💾 Updating user_accounts with:", {
      gender: personaData.gender,
      isPolicyAccepted: personaData.isConsent,
    });

    const updatePromises: Promise<any>[] = [
      // Update gender in user_accounts
      updateUserDataProps(uid, {
        ...userData,
        gender: personaData.gender,
        isPolicyAccepted: personaData.isConsent,
      }),
    ];

    // Update or create candidate_information
    if (candidateInfo) {
      updatePromises.push(
        updateCandidateDataProps(uid, {
          ...candidateInfo,
          preference: {
            ...candidateInfo.preference,
            experience: personaData.careerLevel,
          },
          educations: personaData.educationLevel,
          birthdate: personaData.birthdate,
        }),
      );
    } else {
      updatePromises.push(
        createCandidateDataProps({
          ...DEFAULT_CANDIDATE_DATA,
          preference: {
            experience: personaData.careerLevel,
          },
          educations: personaData.educationLevel,
          birthdate: personaData.birthdate,
        }),
      );
    }

    const results = await Promise.all(updatePromises);
    console.log("✅ Update complete. Results:", JSON.stringify(results, null, 2));

    // Wait a bit for Firestore to flush the write
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Verify the data was saved by reading it back
    const verifyUserData = await getUserDataWithToken(idToken);
    console.log("🔍 Verification read - isPolicyAccepted:", verifyUserData?.isPolicyAccepted);
    console.log("🔍 Full verification data:", JSON.stringify({
      gender: verifyUserData?.gender,
      isPolicyAccepted: verifyUserData?.isPolicyAccepted,
      careerLevel: verifyUserData,
    }, null, 2));

    if (verifyUserData?.isPolicyAccepted !== true) {
      console.error("❌ VERIFICATION FAILED: isPolicyAccepted is not true after save!");
      return { success: false, error: "ข้อมูลการยอมรับข้อตกลงไม่ถูกบันทึก กรุณาลองอีกครั้ง" };
    }

    return { success: true };
  } catch (error) {
    console.error("Error saving user persona:", error);
    return { success: false, error: "Failed to save persona data" };
  }
}
