"use server";

import { Timestamp } from "firebase-admin/firestore";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";
import type { AwardRewardResult } from "./wallet-rewards.types";

// Re-export type for consumers
export type { AwardRewardResult } from "./wallet-rewards.types";

/**
 * Wallet Rewards Server Actions
 *
 * @specification BLS-10-03, BLS-10-04, BLS-10-05
 *
 * These functions handle automatic coin rewards for:
 * - Signup bonus (BLS-10-03)
 * - Referral bonus (BLS-10-04)
 * - First application reward (BLS-10-05)
 * - First interview reward (BLS-10-05)
 */

// Constants
const SIGNUP_BONUS_AMOUNT = 100;
const REFERRAL_BONUS_AMOUNT = 100;
const FIRST_APPLICATION_BONUS_AMOUNT = 100;
const FIRST_INTERVIEW_BONUS_AMOUNT = 100;
const SYSTEM_OWNER = "chancedee";

/**
 * BLS-10-03: awardSignupBonus
 *
 * Award 100 coins when a new candidate completes registration.
 * This is idempotent - if already awarded, returns success with alreadyAwarded flag.
 *
 * @param userId - The user ID to award the signup bonus to
 * @returns AwardRewardResult
 */
export async function awardSignupBonus(
  userId: string
): Promise<AwardRewardResult> {
  // Input validation
  if (!userId || userId.trim() === "") {
    return { success: false, error: "INVALID_USER_ID" };
  }

  try {
    const db = getFirebaseAdminFirestore();

    // Check if signup bonus already awarded
    const existingTxQuery = await db
      .collection("wallet_transactions")
      .where("transaction_receiver", "==", userId)
      .where("transaction_origin", "==", "signup_reward")
      .get();

    if (!existingTxQuery.empty) {
      return { success: true, alreadyAwarded: true };
    }

    // Award bonus using transaction for atomicity
    const transactionId = await db.runTransaction(async (t) => {
      const pocketRef = db.collection("coin").doc(userId);
      const pocketDoc = await t.get(pocketRef);

      // Create or update pocket
      const currentBalance = pocketDoc.exists
        ? (pocketDoc.data()?.balance ?? 0)
        : 0;
      const currentLatest = pocketDoc.exists
        ? (pocketDoc.data()?.latest ?? [])
        : [];

      const newTransactionRef = db.collection("wallet_transactions").doc();

      // Create transaction record
      t.set(newTransactionRef, {
        uid: newTransactionRef.id,
        transaction_owner: SYSTEM_OWNER,
        transaction_receiver: userId,
        transaction_origin: "signup_reward",
        transaction_type: "deposit",
        transaction_amount: SIGNUP_BONUS_AMOUNT,
        transaction_currency: "coin",
        transaction_time: Timestamp.now(),
        remark: "โบนัสสมัครสมาชิก",
        created_at: Timestamp.now(),
        updated_at: Timestamp.now(),
      });

      // Update pocket balance
      const newLatest = [newTransactionRef.id, ...currentLatest].slice(0, 10);
      t.set(
        pocketRef,
        {
          uid: userId,
          currency: "coin",
          balance: currentBalance + SIGNUP_BONUS_AMOUNT,
          latest: newLatest,
          created_at: pocketDoc.exists
            ? pocketDoc.data()?.created_at
            : Timestamp.now(),
          updated_at: Timestamp.now(),
        },
        { merge: true }
      );

      return newTransactionRef.id;
    });

    return { success: true, transactionId };
  } catch (error) {
    console.error("Error awarding signup bonus:", error);
    return { success: false, error: "NETWORK_ERROR" };
  }
}

/**
 * BLS-10-04: awardReferralBonus
 *
 * Award 100 coins to BOTH the new user and the referrer when a referral code is used.
 * This is idempotent for the new user - checks if they've already received referral bonus.
 *
 * @param newUserId - The new user ID who used the referral code
 * @param referrerId - The referrer's user ID
 * @returns AwardRewardResult
 */
export async function awardReferralBonus(
  newUserId: string,
  referrerId: string
): Promise<AwardRewardResult> {
  // Input validation
  if (!newUserId || newUserId.trim() === "") {
    return { success: false, error: "INVALID_USER_ID" };
  }
  if (!referrerId || referrerId.trim() === "") {
    return { success: false, error: "INVALID_USER_ID" };
  }

  // Prevent self-referral
  if (newUserId === referrerId) {
    return { success: true, alreadyAwarded: true };
  }

  try {
    const db = getFirebaseAdminFirestore();

    // Check if new user already received referral bonus
    const existingTxQuery = await db
      .collection("wallet_transactions")
      .where("transaction_receiver", "==", newUserId)
      .where("transaction_origin", "==", "referral_received")
      .get();

    if (!existingTxQuery.empty) {
      return { success: true, alreadyAwarded: true };
    }

    // Award bonus to both users using transaction for atomicity
    await db.runTransaction(async (t) => {
      // Award to new user (referral_received)
      const newUserPocketRef = db.collection("coin").doc(newUserId);
      const newUserPocketDoc = await t.get(newUserPocketRef);
      const newUserBalance = newUserPocketDoc.exists
        ? (newUserPocketDoc.data()?.balance ?? 0)
        : 0;
      const newUserLatest = newUserPocketDoc.exists
        ? (newUserPocketDoc.data()?.latest ?? [])
        : [];

      const newUserTxRef = db.collection("wallet_transactions").doc();
      t.set(newUserTxRef, {
        uid: newUserTxRef.id,
        transaction_owner: SYSTEM_OWNER,
        transaction_receiver: newUserId,
        transaction_origin: "referral_received",
        transaction_type: "deposit",
        transaction_amount: REFERRAL_BONUS_AMOUNT,
        transaction_currency: "coin",
        transaction_time: Timestamp.now(),
        remark: "โบนัสจากรหัสแนะนำ",
        created_at: Timestamp.now(),
        updated_at: Timestamp.now(),
      });

      t.set(
        newUserPocketRef,
        {
          uid: newUserId,
          currency: "coin",
          balance: newUserBalance + REFERRAL_BONUS_AMOUNT,
          latest: [newUserTxRef.id, ...newUserLatest].slice(0, 10),
          created_at: newUserPocketDoc.exists
            ? newUserPocketDoc.data()?.created_at
            : Timestamp.now(),
          updated_at: Timestamp.now(),
        },
        { merge: true }
      );

      // Award to referrer (referral_given)
      const referrerPocketRef = db.collection("coin").doc(referrerId);
      const referrerPocketDoc = await t.get(referrerPocketRef);
      const referrerBalance = referrerPocketDoc.exists
        ? (referrerPocketDoc.data()?.balance ?? 0)
        : 0;
      const referrerLatest = referrerPocketDoc.exists
        ? (referrerPocketDoc.data()?.latest ?? [])
        : [];

      const referrerTxRef = db.collection("wallet_transactions").doc();
      t.set(referrerTxRef, {
        uid: referrerTxRef.id,
        transaction_owner: SYSTEM_OWNER,
        transaction_receiver: referrerId,
        transaction_origin: "referral_given",
        transaction_type: "deposit",
        transaction_amount: REFERRAL_BONUS_AMOUNT,
        transaction_currency: "coin",
        transaction_time: Timestamp.now(),
        remark: "แนะนำสมาชิกใหม่",
        created_at: Timestamp.now(),
        updated_at: Timestamp.now(),
      });

      t.set(
        referrerPocketRef,
        {
          uid: referrerId,
          currency: "coin",
          balance: referrerBalance + REFERRAL_BONUS_AMOUNT,
          latest: [referrerTxRef.id, ...referrerLatest].slice(0, 10),
          created_at: referrerPocketDoc.exists
            ? referrerPocketDoc.data()?.created_at
            : Timestamp.now(),
          updated_at: Timestamp.now(),
        },
        { merge: true }
      );
    });

    return { success: true };
  } catch (error) {
    console.error("Error awarding referral bonus:", error);
    return { success: false, error: "NETWORK_ERROR" };
  }
}

/**
 * BLS-10-05: awardFirstApplicationReward
 *
 * Award 100 coins when a candidate's first application is accepted.
 * Checks candidate's isFirstApplicantionRewarded flag for idempotency.
 *
 * @param candidateId - The candidate ID to award the bonus to
 * @returns AwardRewardResult
 */
export async function awardFirstApplicationReward(
  candidateId: string
): Promise<AwardRewardResult> {
  // Input validation
  if (!candidateId || candidateId.trim() === "") {
    return { success: false, error: "INVALID_USER_ID" };
  }

  try {
    const db = getFirebaseAdminFirestore();

    // Check if already rewarded using candidate flag
    const candidateRef = db.collection("candidate_information").doc(candidateId);
    const candidateDoc = await candidateRef.get();

    if (!candidateDoc.exists) {
      return { success: false, error: "USER_NOT_FOUND" };
    }

    const candidateData = candidateDoc.data();
    if (candidateData?.isFirstApplicantionRewarded === true) {
      return { success: true, alreadyAwarded: true };
    }

    // Award bonus using transaction for atomicity
    const transactionId = await db.runTransaction(async (t) => {
      // Re-check flag in transaction
      const candidateDocInTx = await t.get(candidateRef);
      if (candidateDocInTx.data()?.isFirstApplicantionRewarded === true) {
        throw new Error("ALREADY_AWARDED");
      }

      const pocketRef = db.collection("coin").doc(candidateId);
      const pocketDoc = await t.get(pocketRef);

      const currentBalance = pocketDoc.exists
        ? (pocketDoc.data()?.balance ?? 0)
        : 0;
      const currentLatest = pocketDoc.exists
        ? (pocketDoc.data()?.latest ?? [])
        : [];

      const newTransactionRef = db.collection("wallet_transactions").doc();

      // Create transaction record
      t.set(newTransactionRef, {
        uid: newTransactionRef.id,
        transaction_owner: SYSTEM_OWNER,
        transaction_receiver: candidateId,
        transaction_origin: "first_application_reward",
        transaction_type: "deposit",
        transaction_amount: FIRST_APPLICATION_BONUS_AMOUNT,
        transaction_currency: "coin",
        transaction_time: Timestamp.now(),
        remark: "โบนัสสมัครงานครั้งแรก",
        created_at: Timestamp.now(),
        updated_at: Timestamp.now(),
      });

      // Update pocket balance
      const newLatest = [newTransactionRef.id, ...currentLatest].slice(0, 10);
      t.set(
        pocketRef,
        {
          uid: candidateId,
          currency: "coin",
          balance: currentBalance + FIRST_APPLICATION_BONUS_AMOUNT,
          latest: newLatest,
          created_at: pocketDoc.exists
            ? pocketDoc.data()?.created_at
            : Timestamp.now(),
          updated_at: Timestamp.now(),
        },
        { merge: true }
      );

      // Set flag to prevent duplicate award
      t.update(candidateRef, {
        isFirstApplicantionRewarded: true,
        updated_at: Timestamp.now(),
      });

      return newTransactionRef.id;
    });

    return { success: true, transactionId };
  } catch (error) {
    if ((error as Error).message === "ALREADY_AWARDED") {
      return { success: true, alreadyAwarded: true };
    }
    console.error("Error awarding first application reward:", error);
    return { success: false, error: "NETWORK_ERROR" };
  }
}

/**
 * BLS-10-05: awardFirstInterviewReward
 *
 * Award 100 coins when a candidate confirms their first interview.
 * Checks candidate's isFirstInterviewerRewarded flag for idempotency.
 *
 * @param candidateId - The candidate ID to award the bonus to
 * @returns AwardRewardResult
 */
export async function awardFirstInterviewReward(
  candidateId: string
): Promise<AwardRewardResult> {
  // Input validation
  if (!candidateId || candidateId.trim() === "") {
    return { success: false, error: "INVALID_USER_ID" };
  }

  try {
    const db = getFirebaseAdminFirestore();

    // Check if already rewarded using candidate flag
    const candidateRef = db.collection("candidate_information").doc(candidateId);
    const candidateDoc = await candidateRef.get();

    if (!candidateDoc.exists) {
      return { success: false, error: "USER_NOT_FOUND" };
    }

    const candidateData = candidateDoc.data();
    if (candidateData?.isFirstInterviewerRewarded === true) {
      return { success: true, alreadyAwarded: true };
    }

    // Award bonus using transaction for atomicity
    const transactionId = await db.runTransaction(async (t) => {
      // Re-check flag in transaction
      const candidateDocInTx = await t.get(candidateRef);
      if (candidateDocInTx.data()?.isFirstInterviewerRewarded === true) {
        throw new Error("ALREADY_AWARDED");
      }

      const pocketRef = db.collection("coin").doc(candidateId);
      const pocketDoc = await t.get(pocketRef);

      const currentBalance = pocketDoc.exists
        ? (pocketDoc.data()?.balance ?? 0)
        : 0;
      const currentLatest = pocketDoc.exists
        ? (pocketDoc.data()?.latest ?? [])
        : [];

      const newTransactionRef = db.collection("wallet_transactions").doc();

      // Create transaction record
      t.set(newTransactionRef, {
        uid: newTransactionRef.id,
        transaction_owner: SYSTEM_OWNER,
        transaction_receiver: candidateId,
        transaction_origin: "first_interview_reward",
        transaction_type: "deposit",
        transaction_amount: FIRST_INTERVIEW_BONUS_AMOUNT,
        transaction_currency: "coin",
        transaction_time: Timestamp.now(),
        remark: "โบนัสสัมภาษณ์ครั้งแรก",
        created_at: Timestamp.now(),
        updated_at: Timestamp.now(),
      });

      // Update pocket balance
      const newLatest = [newTransactionRef.id, ...currentLatest].slice(0, 10);
      t.set(
        pocketRef,
        {
          uid: candidateId,
          currency: "coin",
          balance: currentBalance + FIRST_INTERVIEW_BONUS_AMOUNT,
          latest: newLatest,
          created_at: pocketDoc.exists
            ? pocketDoc.data()?.created_at
            : Timestamp.now(),
          updated_at: Timestamp.now(),
        },
        { merge: true }
      );

      // Set flag to prevent duplicate award
      t.update(candidateRef, {
        isFirstInterviewerRewarded: true,
        updated_at: Timestamp.now(),
      });

      return newTransactionRef.id;
    });

    return { success: true, transactionId };
  } catch (error) {
    if ((error as Error).message === "ALREADY_AWARDED") {
      return { success: true, alreadyAwarded: true };
    }
    console.error("Error awarding first interview reward:", error);
    return { success: false, error: "NETWORK_ERROR" };
  }
}
