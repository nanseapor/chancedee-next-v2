"use server";

import { Filter } from "firebase-admin/firestore";
import { FirebaseCompanyAccountRequests } from "@/types/admin.types";
import { companyRequestsRepository } from "../repositories/company-requests-repository";

// This is experimental, using same collection as company information
// The data will stay and traceable to which company got approved at what time.
// This allows company profile edit even when the company is not approved.

const webCompanyRequestsGetById = async (uid: string) => {
  try {
    return await companyRequestsRepository.getById(uid);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

const webCompanyRequestsGetByFilter = async (filter?: Filter) => {
  try {
    return await companyRequestsRepository.getByFilter(filter);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

const webCompanyRequestsCreate = async (
  payload: FirebaseCompanyAccountRequests,
  actorId: string,
  uid?: string
) => {
  try {
    return await companyRequestsRepository.create(payload, actorId, uid);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

const webCompanyRequestsUpdate = async (
  payload: FirebaseCompanyAccountRequests,
  actorId: string,
  uid: string
) => {
  try {
    return await companyRequestsRepository.update(uid, payload, actorId);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

export {
  webCompanyRequestsCreate,
  webCompanyRequestsGetByFilter,
  webCompanyRequestsGetById,
  webCompanyRequestsUpdate
};
