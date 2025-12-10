"use server";

import { Filter } from "firebase-admin/firestore";

import { FirebaseOTPData } from "@/types/auth.types";

import { otpCodesRepository } from "../repositories/otp-codes-repository";

const webOTPCodesGetById = async (uid: string) => {
  try {
    return await otpCodesRepository.getById(uid);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

const webOTPCodesGetByFilter = async (filter?: Filter) => {
  try {
    return await otpCodesRepository.getByFilter(filter);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

const webOTPCodesCreate = async (payload: FirebaseOTPData, uid?: string) => {
  try {
    return await otpCodesRepository.create(payload, "system", uid);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

const webOTPCodesUpdate = async (payload: FirebaseOTPData, uid: string) => {
  try {
    return await otpCodesRepository.update(uid, payload, "system");
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

export {
  webOTPCodesCreate,
  webOTPCodesGetByFilter,
  webOTPCodesGetById,
  webOTPCodesUpdate,
};
