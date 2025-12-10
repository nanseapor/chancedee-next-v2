import { Timestamp } from "firebase-admin/firestore";

import { extractTimestamp } from "@/lib/database/utils/firebase-utils";
import { FirebaseOTPData } from "@/types/auth.types";

import { FirebaseOTPCodesType } from "../schemas/otp-codes.schema";


// Note: OTP codes don't use standard baseType, so we need a custom implementation
// Transform Firebase model to App model
function transformToAppModel(
  firebaseModel: FirebaseOTPCodesType,
  createTime?: number,
  updateTime?: number
): FirebaseOTPData {
  return {
    uid: firebaseModel.uid || "", // Placeholder, should always have value from Firestore
    email: firebaseModel.email,
    otpCode: firebaseModel.otp_code,
    refCode: firebaseModel.ref_code,
    createDate: extractTimestamp(firebaseModel.createDate),
    status: firebaseModel.status || undefined,
  };
}

// Transform App model to Firebase model
function transformToFirebaseModel(
  appModel: FirebaseOTPData,
  docId: string, // use docRef id as uid
  isUpdate = false
): FirebaseOTPCodesType {
  return {
    uid: docId,
    email: appModel.email,
    otp_code: appModel.otpCode,
    ref_code: appModel.refCode,
    createDate: Timestamp.fromMillis(appModel.createDate),
    status: appModel.status || null,
  };
}

// Create custom repository for OTP codes (doesn't follow standard baseType)
export const otpCodesRepository = {
  async getById(id: string): Promise<FirebaseOTPData | null> {
    const { getDocumentById } = await import("../utils/firebase-utils");
    const firebaseModel = await getDocumentById<FirebaseOTPCodesType>('otp_codes', id);
    
    if (!firebaseModel) {
      return null;
    }
    
    return transformToAppModel(
      firebaseModel,
      (firebaseModel as any)._createTime,
      (firebaseModel as any)._updateTime
    );
  },

  async getByFilter(filter?: {
    where?: [string, '==' | '!=' | '<' | '<=' | '>' | '>=' | 'in' | 'not-in', any][];
    orderBy?: [string, 'asc' | 'desc'][];
    limit?: number;
  }): Promise<FirebaseOTPData[] | null> {
    const { getDocumentsByFilter } = await import("../utils/firebase-utils");
    const firebaseModels = await getDocumentsByFilter<FirebaseOTPCodesType>('otp_codes', filter);
    
    if (!firebaseModels) {
      return null;
    }
    
    return firebaseModels.map(model =>
      transformToAppModel(
        model,
        (model as any)._createTime,
        (model as any)._updateTime
      )
    );
  },

  async create(model: FirebaseOTPData, actorId?: string, id?: string): Promise<string> {
    const { getFirebaseAdminFirestore } = await import("@/lib/firebase-admin");
    const docRef = id
      ? getFirebaseAdminFirestore().collection('otp_codes').doc(id)
      : getFirebaseAdminFirestore().collection('otp_codes').doc();
    
    const firebaseModel = transformToFirebaseModel({
      ...model, uid: docRef.id
    }, docRef.id);
    await docRef.set(firebaseModel);
    return docRef.id;
  },

  async update(id: string, model: FirebaseOTPData, actorId?: string): Promise<string> {
    const { getFirebaseAdminFirestore } = await import("@/lib/firebase-admin");
    const docRef = getFirebaseAdminFirestore().collection('otp_codes').doc(id);
    
    const firebaseModel = transformToFirebaseModel({
      ...model, uid: docRef.id
    }, docRef.id, true);
    await docRef.set(firebaseModel, { merge: true });
    return docRef.id;
  },

  async delete(id: string): Promise<void> {
    const { getFirebaseAdminFirestore } = await import("@/lib/firebase-admin");
    const docRef = getFirebaseAdminFirestore().collection('otp_codes').doc(id);
    await docRef.delete();
  },

  async deleteByFilter(field: string, value: string): Promise<boolean> {
    const { getFirebaseAdminFirestore } = await import("@/lib/firebase-admin");
    const query = getFirebaseAdminFirestore().collection('otp_codes').where(field, "==", value);
    const snapshot = await query.get();
    
    const deletePromises = snapshot.docs.map(doc => doc.ref.delete());
    await Promise.all(deletePromises);
    
    return true;
  },

  generateId(): string {
    const { getFirebaseAdminFirestore } = require("@/lib/firebase-admin");
    return getFirebaseAdminFirestore().collection('otp_codes').doc().id;
  }
};