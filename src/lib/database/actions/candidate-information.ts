"use server";

import { Filter } from "firebase-admin/firestore";

import { FirebaseCandidateData } from "@/types/candidate.types";

import { candidateInformationRepository } from "../repositories/candidate-information-repository";

const webCandidateInformationGetById = async (uid: string) => {
  try {
    return await candidateInformationRepository.getById(uid);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

const webCandidateInformationGetByFilter = async (filter?: Filter) => {
  try {
    return await candidateInformationRepository.getByFilter(filter);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

const webCandidateInformationCreate = async (
  payload: Omit<FirebaseCandidateData, "uid" | "createdAt" | "updatedAt">,
  actorId: string,
  uid?: string
) => {
  try {
    const fullPayload: FirebaseCandidateData = {
      ...payload,
      uid: uid || "",
      createdAt: 0,
      updatedAt: 0,
    };
    return await candidateInformationRepository.create(fullPayload, actorId, uid);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

const webCandidateInformationUpdate = async (
  payload: Omit<FirebaseCandidateData, "uid" | "createdAt" | "updatedAt">,
  actorId: string,
  uid: string
) => {
  try {
    const fullPayload: FirebaseCandidateData = {
      ...payload,
      uid,
      createdAt: 0,
      updatedAt: 0,
    };
    return await candidateInformationRepository.update(uid, fullPayload, actorId);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

export {
  webCandidateInformationCreate,
  webCandidateInformationGetByFilter,
  webCandidateInformationGetById,
  webCandidateInformationUpdate
};
