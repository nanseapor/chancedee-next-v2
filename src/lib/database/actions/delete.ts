"use server";
import { Filter, Query, Timestamp } from "firebase-admin/firestore";

import { getFirebaseAdminFirestore } from "@/lib/firebase-admin";
import { DeleteAccountProps } from "@/types/auth.types";

import { FirebaseDeleteRequestType } from "../schemas/delete.schema";


const webDeleteRequestGetByFilter = async (filter?: Filter) => {
  try {
    const DeleteRequestRef = getFirebaseAdminFirestore().collection("delete");
    let DeleteRequestQuery = DeleteRequestRef as Query;
    if (filter) DeleteRequestQuery = DeleteRequestRef.where(filter);
    const DeleteRequestSnap = await DeleteRequestQuery.get();
    if (!DeleteRequestSnap.empty) {
      const lists = DeleteRequestSnap.docs.map((doc) => {
        const firebaseDeleteRequest = doc.data() as FirebaseDeleteRequestType;
        const data: DeleteAccountProps = {
          documentCode: firebaseDeleteRequest.document_code,
          firstNameTH: firebaseDeleteRequest.first_name_th,
          lastNameTH: firebaseDeleteRequest.last_name_th,
          phoneNumber: firebaseDeleteRequest.phone_number,
          email: firebaseDeleteRequest.email,
          status: firebaseDeleteRequest.status,
          attachedFiles: firebaseDeleteRequest.attached_files,
          createAt: firebaseDeleteRequest.created_at.toMillis(),
          createdBy: firebaseDeleteRequest.created_by?.id,
          updateAt: firebaseDeleteRequest.updated_at.toMillis(),
          updatedBy: firebaseDeleteRequest.updated_by?.id,
        };
        return data;
      });
      return lists;
    } else {
      return null;
    }
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

const webDeleteRequestCreate = async (
  payload: DeleteAccountProps,
  actorId: string,
  uid?: string
) => {
  try {
    const actorRef = getFirebaseAdminFirestore().collection("user_accounts").doc(actorId);
    const DeleteRequestRef = uid
      ? getFirebaseAdminFirestore().collection("delete").doc(uid)
      : getFirebaseAdminFirestore().collection("delete").doc();

    const dataToWrite: FirebaseDeleteRequestType = {
      uid: DeleteRequestRef.id,
      document_code: payload.documentCode,
      created_by: actorRef,
      created_at: Timestamp.now(),
      updated_by: actorRef,
      updated_at: Timestamp.now(),
      first_name_th: payload.firstNameTH,
      last_name_th: payload.lastNameTH,
      phone_number: payload.phoneNumber,
      email: payload.email,
      status: payload.status,
      attached_files: payload.attachedFiles,
    };
    await DeleteRequestRef.set(dataToWrite, { merge: true });
    return DeleteRequestRef.id;
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};


export {
    webDeleteRequestCreate,
    webDeleteRequestGetByFilter
};

