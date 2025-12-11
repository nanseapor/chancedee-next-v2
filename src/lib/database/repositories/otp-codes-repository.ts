import "server-only";

import { Timestamp } from "firebase-admin/firestore";

import { FirebaseOTPData } from "@/types/auth.types";
import { FirebaseOTPCodesType } from "../schemas/otp-codes.schema";
import { extractTimestamp } from "../utils/firebase-utils";
import { createRepository } from "./repository-factory";
import { IRepository } from "./interfaces/repository.interface";

/**
 * Transform Firebase model to App model
 */
function transformToAppModel(
  firebaseModel: FirebaseOTPCodesType,
  createTime?: number,
  updateTime?: number
): FirebaseOTPData {
  return {
    uid: firebaseModel.uid || "",
    email: firebaseModel.email,
    otpCode: firebaseModel.otp_code,
    refCode: firebaseModel.ref_code,
    createDate: extractTimestamp(firebaseModel.createDate),
    status: firebaseModel.status || undefined,
  };
}

/**
 * Transform App model to Firebase model
 */
function transformToFirebaseModel(
  appModel: FirebaseOTPData,
  actorId: string,
  isUpdate = false
): FirebaseOTPCodesType {
  return {
    uid: appModel.uid || "",
    email: appModel.email,
    otp_code: appModel.otpCode,
    ref_code: appModel.refCode,
    createDate: Timestamp.fromMillis(appModel.createDate),
    status: appModel.status || null,
  };
}

/**
 * OTP Codes Repository
 *
 * Now uses standard createRepository pattern for consistency.
 */
export const otpCodesRepository: IRepository<FirebaseOTPData> = createRepository<
  FirebaseOTPData,
  FirebaseOTPCodesType
>(
  'otp_codes',
  transformToAppModel,
  transformToFirebaseModel
);
