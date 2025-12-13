"use server";

import { Filter } from "firebase-admin/firestore";
import { candidatePreferences } from "@/types/candidate.types";
import { candidatePreferenceRepository } from "../repositories/candidate-preference-repository";

const webCandidatePreferenceGetById = async (uid: string) => {
  try {
    return await candidatePreferenceRepository.getById(uid);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

const webCandidatePreferenceGetByFilter = async (filter?: Filter) => {
  try {
    return await candidatePreferenceRepository.getByFilter(filter);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

const webCandidatePreferenceCreate = async (
  payload: candidatePreferences,
  actorId: string,
  uid?: string
) => {
  try {
    return await candidatePreferenceRepository.create(payload, actorId, uid);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

const webCandidatePreferenceUpdate = async (
  payload: candidatePreferences,
  actorId: string,
  uid: string
) => {
  try {
    return await candidatePreferenceRepository.update(uid, payload, actorId);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

export {
  webCandidatePreferenceCreate,
  webCandidatePreferenceGetByFilter,
  webCandidatePreferenceGetById,
  webCandidatePreferenceUpdate
};
