"use server";

import { Filter } from "firebase-admin/firestore";
import { candidateReferral } from "@/types/candidate.types";
import { candidateReferralRepository } from "../repositories/candidate-referral-repository";

const webCandidateReferralGetById = async (uid: string) => {
  try {
    return await candidateReferralRepository.getById(uid);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

const webCandidateReferralGetByFilter = async (filter?: Filter) => {
  try {
    return await candidateReferralRepository.getByFilter(filter);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

const webCandidateReferralCreate = async (
  payload: candidateReferral,
  actorId: string,
  uid?: string
) => {
  try {
    return await candidateReferralRepository.create(payload, actorId, uid);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

const webCandidateReferralUpdate = async (
  payload: candidateReferral,
  actorId: string,
  uid: string
) => {
  try {
    return await candidateReferralRepository.update(uid, payload, actorId);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

export {
  webCandidateReferralCreate,
  webCandidateReferralGetByFilter,
  webCandidateReferralGetById,
  webCandidateReferralUpdate
};
