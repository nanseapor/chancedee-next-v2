"use server";
import { Filter, Query, Timestamp } from "firebase-admin/firestore";

import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";
import { userTransferProps } from "@/types/auth.types";

import { FirebaseUserTransferType } from "../schemas/user-transfer.schema";

const webUserTransferGetById = async (uid: string) => {
  try {
    const UserTransferRef = getFirebaseAdminFirestore()
      .collection("user_accounts")
      .doc(uid);
    const UserTransferSnap = await UserTransferRef.get();
    if (UserTransferSnap.exists) {
      const firebaseUserTransfer =
        UserTransferSnap.data() as FirebaseUserTransferType;
      const data: userTransferProps = {
        uid: UserTransferRef.id,
        targetCompany: firebaseUserTransfer.target_company || "",
        requestTimestamp:
          firebaseUserTransfer.request_timestamp?.toMillis() || Date.now(),
        transferApproved: firebaseUserTransfer.transfer_approved || false
};
      return data;
    } else {
      return null;
    }
  } catch (e) {
    const error = e as Error;
    console.error("Read user_accounts transfer error as", e)
    throw error;
  }
}

const webUserTransferGetByFilter = async (filter?: Filter) => {
  try {
    const UserTransferRef =
      getFirebaseAdminFirestore().collection("user_accounts");
    let UserTransferQuery = UserTransferRef as Query;
    if (filter) UserTransferQuery = UserTransferRef.where(filter);
    const UserTransferSnap = await UserTransferQuery.get();
    if (!UserTransferSnap.empty) {
      const lists = UserTransferSnap.docs.map((doc) => {
        const firebaseUserTransfer = doc.data() as FirebaseUserTransferType;
        const data: userTransferProps = {
          uid: doc.id,
          targetCompany: firebaseUserTransfer.target_company || "",
          requestTimestamp:
            firebaseUserTransfer.request_timestamp?.toMillis() || Date.now(),
          transferApproved: firebaseUserTransfer.transfer_approved || false
};
        return data;
      });
      return lists;
    } else {
      return null;
    }
  } catch (e) {
    const error = e as Error;
    console.error("Read user_accounts transfer error as", e)
    throw error;
  }
}

const webUserTransferCreate = async (
  payload: userTransferProps,
  actorId: string,
  uid?: string
) => {
  try {
    const UserTransferRef = uid
      ? getFirebaseAdminFirestore().collection("user_accounts").doc(uid)
      : getFirebaseAdminFirestore().collection("user_accounts").doc();

    const dataToWrite: FirebaseUserTransferType = {
      uid: payload.uid,
      target_company: payload.targetCompany,
      request_timestamp: Timestamp.fromMillis(payload.requestTimestamp),
      transfer_approved: payload.transferApproved,
      created_by: actorId,
      created_at: Timestamp.now(),
      updated_by: actorId,
      updated_at: Timestamp.now()
};
    await UserTransferRef.set(dataToWrite, { merge: true });
    return UserTransferRef.id;
  } catch (e) {
    const error = e as Error;
    throw error;
  }
}

const webUserTransferUpdate = async (
  payload: userTransferProps,
  actorId: string,
  uid: string
) => {
  try {
    const UserTransferRef = getFirebaseAdminFirestore()
      .collection("user_accounts")
      .doc(uid);
    const prevDataSnap = await UserTransferRef.get();
    const dataToWrite: FirebaseUserTransferType = {
      uid: payload.uid,
      target_company: payload.targetCompany,
      request_timestamp: Timestamp.fromMillis(payload.requestTimestamp),
      transfer_approved: payload.transferApproved,
      created_by: prevDataSnap.data()?.created_by || actorId,
      created_at: prevDataSnap.createTime || Timestamp.now(),
      updated_by: actorId,
      updated_at: Timestamp.now()
};
    await UserTransferRef.set(dataToWrite, { merge: true });
    return UserTransferRef.id;
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

export {
  webUserTransferCreate,
  webUserTransferGetByFilter,
  webUserTransferGetById,
  webUserTransferUpdate
};
