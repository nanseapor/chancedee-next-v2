"use server";

import { Filter } from "firebase-admin/firestore";

import { FirebaseCompanyData } from "@/types/company.types";

import { companyInformationRepository } from "../repositories/company-information-repository";

const webCompanyInformationGetById = async (uid: string) => {
  try {
    return await companyInformationRepository.getById(uid);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

const webCompanyInformationGetByFilter = async (filter?: Filter) => {
  try {
    return await companyInformationRepository.getByFilter(filter);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

const webCompanyInformationGenerateId = async () => {
  try {
    return await companyInformationRepository.generateId();
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

const webCompanyInformationCreate = async (
  payload: FirebaseCompanyData,
  actorId: string,
  uid?: string
) => {
  try {
    return await companyInformationRepository.create(payload, actorId, uid);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

const webCompanyInformationUpdate = async (
  payload: FirebaseCompanyData,
  actorId: string,
  uid: string
) => {
  try {
    return await companyInformationRepository.update(uid, payload, actorId);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

export {
  webCompanyInformationCreate,
  webCompanyInformationGenerateId,
  webCompanyInformationGetByFilter,
  webCompanyInformationGetById,
  webCompanyInformationUpdate
};

