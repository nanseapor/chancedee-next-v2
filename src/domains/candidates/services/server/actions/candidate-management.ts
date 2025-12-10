"use server";

import { authenticateToken } from "@/domains/authentication/services/server/core/auth-engine";
import {
  getCandidateDataPropsById,
  updateCandidateDataProps,
} from "@/lib/database/repositories/web-candidate-data-props";
import type { candidateDataProps } from "@/types/candidate.types";

export const CandidateAccountGet = async (uid: string) => {
  try {
    const candidateParams = await getCandidateDataPropsById(uid);
    return candidateParams ? JSON.stringify(candidateParams) : null;
  } catch (e) {
    console.error(" candidate: ", e);
    return null;
  }
};

export const CandidatePersonalInfoUpdate = async (
  token: string,
  uid: string,
  candidateDataProps: candidateDataProps,
) => {
  try {
    const auth = await authenticateToken(token, { includeProfile: false });
    if (!auth) {
      throw new Error("Token validation failed");
    }

    if (auth.user.uid === uid) {
      const docResult = await CandidateAccountSet(uid, candidateDataProps);
      console.log("Document candidate written with ID: ", uid);

      return docResult;
    } else {
      throw new Error("Token not match with uid");
    }
  } catch (e) {
    console.error("Error update candidate document: ", e);
    throw e;
  }
};

// This is update existing document with overwrite
export const CandidateAccountSet = async (
  uid: string,
  candidateDataProps: candidateDataProps,
) => {
  try {
    updateCandidateDataProps(uid, candidateDataProps);
    return "success";
  } catch (e) {
    console.error("Error adding document: ", e);
    return JSON.stringify(e);
  }
};
