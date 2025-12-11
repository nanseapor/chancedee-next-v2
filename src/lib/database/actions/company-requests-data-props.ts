"use server";

import { FirebaseCompanyAccountRequests } from "@/types/admin.types";
import { address, contact } from "@/types/database.types";

import {
  createCompanyRequestWithRelations as _createCompanyRequestWithRelations,
  getCompanyRequestWithRelations as _getCompanyRequestWithRelations,
} from "../repositories/web-company-requests-data-props";

export const webCompanyRequestWithRelationsCreate = async (
  payload: FirebaseCompanyAccountRequests,
  actorId: string,
  addressData?: Partial<address>,
  contactData?: Partial<contact>,
  uid?: string
) => {
  try {
    return await _createCompanyRequestWithRelations(payload, actorId, addressData, contactData, uid);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

export const webCompanyRequestWithRelationsGet = async (uid: string) => {
  try {
    return await _getCompanyRequestWithRelations(uid);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};
