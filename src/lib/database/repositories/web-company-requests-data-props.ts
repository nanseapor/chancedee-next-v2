import "server-only";


import { FirebaseCompanyAccountRequests } from "@/types/admin.types";
import { address, contact } from "@/types/database.types";

import {
  webAddressCreate,
  webAddressGetById,
} from "../actions/address";
import {
  webCompanyRequestsCreate as webCompanyRequestsCreateBase,
  webCompanyRequestsGetById,
} from "../actions/company-requests";
import {
  webContactCreate,
  webContactGetById,
} from "../actions/contact";

/**
 * Creates a complete company request with all related documents
 * (company_information, address, contact collections)
 *
 * This is used during company registration to ensure all three collections
 * are created atomically before any update operations are performed.
 */
export const createCompanyRequestWithRelations = async (
  payload: FirebaseCompanyAccountRequests,
  actorId: string,
  addressData?: Partial<address>,
  contactData?: Partial<contact>,
  uid?: string
): Promise<string> => {
  // Step 1: Create the base company request document in company_information collection
  const companyRequestId = await webCompanyRequestsCreateBase(
    payload,
    actorId,
    uid
  );

  // Step 2: Create placeholder address document if it doesn't exist
  const existingAddress = await webAddressGetById(companyRequestId);
  if (!existingAddress) {
    const addressToCreate: address = {
      uid: companyRequestId,
      province: addressData?.province || payload.country || "",
      district: addressData?.district || "",
      subDistrict: addressData?.subDistrict || "",
      postCode: addressData?.postCode || "",
      addressLine1: addressData?.addressLine1 || "",
      addressLine2: addressData?.addressLine2 || "",
      createdBy: actorId,
      createdAt: Date.now(),
      updatedBy: actorId,
      updatedAt: Date.now(),
    };
    await webAddressCreate(addressToCreate, actorId, companyRequestId);
  }

  // Step 3: Create placeholder contact document if it doesn't exist
  const existingContact = await webContactGetById(companyRequestId);
  if (!existingContact) {
    const contactToCreate: contact = {
      uid: companyRequestId,
      email: contactData?.email || payload.email || "",
      phone: contactData?.phone || "",
      website: contactData?.website || "",
      facebook: contactData?.facebook || "",
      line: contactData?.line || "",
    };
    await webContactCreate(contactToCreate, actorId, companyRequestId);
  }

  return companyRequestId;
};

/**
 * Gets a complete company request with all related documents
 */
export const getCompanyRequestWithRelations = async (
  uid: string
): Promise<{
  companyRequest: FirebaseCompanyAccountRequests | null;
  address: address | null;
  contact: contact | null;
}> => {
  const [companyRequest, address, contact] = await Promise.all([
    webCompanyRequestsGetById(uid),
    webAddressGetById(uid),
    webContactGetById(uid),
  ]);

  return {
    companyRequest,
    address,
    contact,
  };
};
