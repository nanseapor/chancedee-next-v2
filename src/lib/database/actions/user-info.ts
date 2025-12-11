"use server";
import { FieldValue, Filter, Query, Timestamp } from "firebase-admin/firestore";

import { getFirebaseAdminFirestore } from "@/lib/firebase/firebase-admin";
import { userInfoProps } from "@/types/auth.types";

import { FirebaseUserInfoType } from "../schemas/user-info.schema";

const webUserInfoGetById = async (uid: string) => {
  try {
    const UserInfoRef = getFirebaseAdminFirestore()
      .collection("user_accounts")
      .doc(uid);
    const UserInfoSnap = await UserInfoRef.get();
    if (UserInfoSnap.exists) {
      const firebaseUserInfo = UserInfoSnap.data() as FirebaseUserInfoType;
      const data: userInfoProps = {
        uid: UserInfoRef.id,
        roles: firebaseUserInfo.roles || [],
        companyId: firebaseUserInfo.company_id?.id,
        currentStep: firebaseUserInfo.current_step,
        currentStepName: firebaseUserInfo.current_step_name,
        remark: firebaseUserInfo.remark
};
      return data;
    } else {
      return null;
    }
  } catch (e) {
    const error = e as Error;
    console.error("Read user_accounts info error as", e)
    throw error;
  }
}

const webUserInfoGetByFilter = async (filter?: Filter) => {
  try {
    const UserInfoRef = getFirebaseAdminFirestore().collection("user_accounts");
    let UserInfoQuery = UserInfoRef as Query;
    if (filter) UserInfoQuery = UserInfoRef.where(filter);
    const UserInfoSnap = await UserInfoQuery.get();
    if (!UserInfoSnap.empty) {
      const lists = UserInfoSnap.docs.map((doc) => {
        const firebaseUserInfo = doc.data() as FirebaseUserInfoType;
        const data: userInfoProps = {
          uid: doc.id,
          roles: firebaseUserInfo.roles || [],
          companyId: firebaseUserInfo.company_id?.id,
          currentStep: firebaseUserInfo.current_step,
          currentStepName: firebaseUserInfo.current_step_name,
          remark: firebaseUserInfo.remark
};
        return data;
      });
      return lists;
    } else {
      return null;
    }
  } catch (e) {
    const error = e as Error;
    console.error("Read user_accounts info error as", e)
    throw error;
  }
}

const webUserInfoCreate = async (
  payload: userInfoProps,
  actorId: string,
  uid?: string
) => {
  try {
    const UserInfoRef = uid
      ? getFirebaseAdminFirestore().collection("user_accounts").doc(uid)
      : getFirebaseAdminFirestore().collection("user_accounts").doc();
      const companyRef = payload.companyId ? getFirebaseAdminFirestore()
      .collection("company_information").doc(payload.companyId) : undefined;

    const dataToWrite: FirebaseUserInfoType = {
      uid: UserInfoRef.id,
      created_by: actorId,
      created_at: Timestamp.now(),
      updated_by: actorId,
      updated_at: Timestamp.now(),
      roles: payload.roles || [],
      company_id: companyRef,
      current_step: payload.currentStep,
      current_step_name: payload.currentStepName,
      remark: payload.remark
};
    // console.warn("User Info dataToWrite", dataToWrite);
    await UserInfoRef.set(dataToWrite, { merge: true });
    return UserInfoRef.id;
  } catch (e) {
    console.error("Error adding document user permission: ", e);
    const error = e as Error;
    throw error;
  }
}

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
    const UserInfoRef = getFirebaseAdminFirestore()
      .collection("user_accounts")
      .doc(uid);

    console.log('📍 [webUserInfoUpdate] Firestore path:', UserInfoRef.path);

    const prevDataSnap = await UserInfoRef.get();
    console.log('📊 [webUserInfoUpdate] Previous data exists:', prevDataSnap.exists);

    const companyRef = payload.companyId ? getFirebaseAdminFirestore()
    .collection("company_information").doc(payload.companyId) : undefined;

    const dataToWrite: FirebaseUserInfoType = {
      uid: UserInfoRef.id,
      created_by: prevDataSnap.data()?.created_by || actorId,
      created_at: prevDataSnap.createTime || Timestamp.now(),
      updated_by: actorId,
      updated_at: Timestamp.now(),
      roles: payload.roles || [],
      company_id: companyRef,
      current_step: payload.currentStep,
      current_step_name: payload.currentStepName,
      remark: payload.remark
};

    console.log('💾 [webUserInfoUpdate] Writing to Firestore:', {
      path: UserInfoRef.path,
      roles: dataToWrite.roles,
      updated_by: dataToWrite.updated_by
    });

    await UserInfoRef.set(dataToWrite, { merge: true });

    console.log('✅ [webUserInfoUpdate] Firestore write completed');

    return UserInfoRef.id;
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
}

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
    console.error("Error adding role to user: ", e);
    throw e;
  }
};

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
    console.error("Error removing role from user: ", e);
    throw e;
  }
};

export {
  addRoleToUser,
  removeRoleFromUser,
  webUserInfoCreate,
  webUserInfoGetByFilter,
  webUserInfoGetById,
  webUserInfoUpdate
};
