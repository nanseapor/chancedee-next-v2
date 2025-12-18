"use server";

import { FieldValue, Filter } from "firebase-admin/firestore";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";
import { userInfoProps } from "@/types/auth.types";
import { userInfoRepository } from "../repositories/user-info-repository";

const webUserInfoGetById = async (uid: string) => {
  try {
    return await userInfoRepository.getById(uid);
  } catch (e) {
    const error = e as Error;
    console.error("Read user_accounts info error:", error);
    throw error;
  }
};

const webUserInfoGetByFilter = async (filter?: Filter) => {
  try {
    return await userInfoRepository.getByFilter(filter);
  } catch (e) {
    const error = e as Error;
    console.error("Read user_accounts info error:", error);
    throw error;
  }
};

const webUserInfoCreate = async (
  payload: userInfoProps,
  actorId: string,
  uid?: string
) => {
  try {
    return await userInfoRepository.create(payload, actorId, uid);
  } catch (e) {
    console.error("Error adding document user permission:", e);
    const error = e as Error;
    throw error;
  }
};

const webUserInfoUpdate = async (
  payload: userInfoProps,
  actorId: string,
  uid: string
) => {
  console.log('🔷 [webUserInfoUpdate] START', {
    uid,
    actorId,
    payloadUid: payload.uid,
    roles: payload.roles
  });

  try {
    console.log('📍 [webUserInfoUpdate] Using repository for update');

    const result = await userInfoRepository.update(uid, payload, actorId);

    console.log('✅ [webUserInfoUpdate] Repository update completed');

    return result;
  } catch (e) {
    const error = e as Error;
    console.error('❌ [webUserInfoUpdate] FAILED:', {
      uid,
      actorId,
      error: {
        message: error.message,
        stack: error.stack
      }
    });
    throw error;
  }
};

/**
 * SPECIALIZED OPERATION: Add role to user
 * Uses Firestore arrayUnion for atomic array operation
 * This is NOT standard CRUD and is kept separate from repository pattern
 */
const addRoleToUser = async (uid: string, roleId: string) => {
  try {
    const UserInfoRef = getFirebaseAdminFirestore()
      .collection("user_accounts")
      .doc(uid);
    await UserInfoRef.update({
      roles: FieldValue.arrayUnion(roleId),
      updated_by: uid,
      updated_at: new Date()
    });
  } catch (e) {
    console.error("Error adding role to user:", e);
    throw e;
  }
};

/**
 * SPECIALIZED OPERATION: Remove role from user
 * Uses Firestore arrayRemove for atomic array operation
 * This is NOT standard CRUD and is kept separate from repository pattern
 */
const removeRoleFromUser = async (uid: string, roleId: string) => {
  try {
    const UserInfoRef = getFirebaseAdminFirestore()
      .collection("user_accounts")
      .doc(uid);
    await UserInfoRef.update({
      roles: FieldValue.arrayRemove(roleId),
      updated_by: uid,
      updated_at: new Date()
    });
  } catch (e) {
    console.error("Error removing role from user:", e);
    throw e;
  }
};

/**
 * CAND-R02: Set isOnboarded flag in user_info
 * Sets is_onboarded to true in user_accounts collection
 */
const webUserInfoSetIsOnboarded = async (
  uid: string,
  value: boolean,
  actorId: string
) => {
  try {
    // Get existing user info
    const existing = await userInfoRepository.getById(uid);

    if (!existing) {
      throw new Error("User info not found");
    }

    // Merge with existing data
    const payload: userInfoProps = {
      ...existing,
      isOnboarded: value,
    };

    return await userInfoRepository.update(uid, payload, actorId);
  } catch (e) {
    const error = e as Error;
    console.error("Error setting isOnboarded:", error);
    throw error;
  }
};

export {
  addRoleToUser,
  removeRoleFromUser,
  webUserInfoCreate,
  webUserInfoGetByFilter,
  webUserInfoGetById,
  webUserInfoUpdate,
  webUserInfoSetIsOnboarded,
};
