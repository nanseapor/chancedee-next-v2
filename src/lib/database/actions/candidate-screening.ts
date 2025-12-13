"use server";

import { Filter } from "firebase-admin/firestore";
import { FirebaseCandidateScreeningData } from "@/types/candidate-screening.types";
import { candidateScreeningRepository } from "../repositories/candidate-screening-repository";

const webCandidateScreeningGetById = async (uid: string) => {
  try {
    return await candidateScreeningRepository.getById(uid);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

const webCandidateScreeningGetByFilter = async (filter?: Filter) => {
  try {
    return await candidateScreeningRepository.getByFilter(filter);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

const webCandidateScreeningCreate = async (
  payload: Omit<FirebaseCandidateScreeningData, "uid" | "createdAt" | "updatedAt">,
  actorId: string,
  uid?: string
) => {
  try {
    const fullPayload: FirebaseCandidateScreeningData = {
      uid: uid || "",
      ...payload,
      createdAt: 0,
      updatedAt: 0,
    };
    return await candidateScreeningRepository.create(fullPayload, actorId, uid);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

const webCandidateScreeningUpdate = async (
  payload: Omit<FirebaseCandidateScreeningData, "uid" | "createdAt" | "updatedAt">,
  actorId: string,
  uid: string
) => {
  try {
    // Construct full payload with uid for repository
    const fullPayload: FirebaseCandidateScreeningData = {
      uid,
      ...payload,
      createdAt: 0, // Will be preserved by repository
      updatedAt: 0, // Will be set by repository
    };
    return await candidateScreeningRepository.update(uid, fullPayload, actorId);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

export {
  webCandidateScreeningCreate,
  webCandidateScreeningGetByFilter,
  webCandidateScreeningGetById,
  webCandidateScreeningUpdate
};
