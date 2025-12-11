import "server-only";

import { Filter } from "firebase-admin/firestore";

import { fetchDataByFilter } from "@/lib/utils/shared/utils";
import { convertHtmlToText } from "@/lib/utils/server/text-processing";
import { companyDataProps, FirebaseCompanyData } from "@/types/company.types";

import {
  webAddressCreate,
  webAddressGetByFilter,
  webAddressGetById,
  webAddressUpdate,
} from "../actions/address";
import {
  webCompanyInformationCreate,
  webCompanyInformationGenerateId,
  webCompanyInformationGetByFilter,
  webCompanyInformationGetById,
  webCompanyInformationUpdate,
} from "../actions/company-information";
import {
  webContactCreate,
  webContactGetByFilter,
  webContactGetById,
  webContactUpdate,
} from "../actions/contact";

export const getCompanyDataPropsById = async (uid: string) => {
  const [companyData, address, contact] = await Promise.all([
    webCompanyInformationGetById(uid),
    webAddressGetById(uid),
    webContactGetById(uid),
  ]);

  if (companyData) {
    const company: companyDataProps = {
      ...companyData,
      contact: contact || undefined,
      address: address || undefined,
    };
    return company;
  } else {
    console.error("Useless read: Company data not found for uid:", uid);
    return null;
  }
};

export const getCompanyDataPropsByFilter = async (props?: {
  companyFilter?: Filter;
  addressFilter?: Filter;
  contactFilter?: Filter;
}) => {
  // Helper function to fetch data by filter
  const [companylist, addressList, contactList] = await Promise.all([
    props?.companyFilter
      ? fetchDataByFilter(
        props.companyFilter,
        webCompanyInformationGetByFilter
      )
      : webCompanyInformationGetByFilter(),
    props?.addressFilter
      ? fetchDataByFilter(props.addressFilter, webAddressGetByFilter)
      : webAddressGetByFilter(),
    props?.contactFilter
      ? fetchDataByFilter(props.contactFilter, webContactGetByFilter)
      : webContactGetByFilter(),
  ]);
  const companyDataPropsList = companylist
    ? companylist?.map((company) => {
      if (company) {
        if (company.uid) {
          const contact = contactList?.find(
            (contact) => contact.uid === company.uid
          );
          const address = addressList?.find(
            (address) => address.uid === company.uid
          );
          if (contact && address) {
            const data: companyDataProps = {
              ...company,
              contact: contact || undefined,
              address: address || undefined,
            };
            return data;
          }
        }
      }
      return null;
    })
    : [];

  return companyDataPropsList?.filter((item) => item !== null);
};

export const createCompanyDataProps = async (data: companyDataProps): Promise<void> => {
  const { address, contact, ...companydata } = data;

  const docId = await webCompanyInformationGenerateId();

  if (!companydata.createdBy) {
    throw new Error("No createdBy found for companydata");
  }

  const shortDescriptionText = await convertHtmlToText(
    companydata.shortDescription
  );
  const overviewText = await convertHtmlToText(companydata.overview);
  const benefitsText = await convertHtmlToText(companydata.benefitsDetails);

  const dataToSave: FirebaseCompanyData = {
    ...companydata,
    shortDescriptionText: shortDescriptionText.text,
    overviewText: overviewText.text,
    benefitsText: benefitsText.text,
  };

  // Execute all creates in parallel for efficiency
  await Promise.all([
    webCompanyInformationCreate(dataToSave, companydata.createdBy, docId),
    address ? webAddressCreate(address, companydata.createdBy, docId) : Promise.resolve(),
    contact ? webContactCreate(contact, companydata.createdBy, docId) : Promise.resolve(),
  ]);
};

export const updateCompanyDataProps = async (
  uid: string,
  data: companyDataProps
): Promise<void> => {
  const { address, contact, ...companydata } = data;

  if (!uid) {
    throw new Error("Company UID is required for update");
  }

  if (!companydata.createdBy) {
    throw new Error("No createdBy found for companydata");
  }

  const shortDescriptionText = await convertHtmlToText(
    companydata.shortDescription
  );
  const overviewText = await convertHtmlToText(companydata.overview);
  const benefitsText = await convertHtmlToText(companydata.benefitsDetails);

  const dataToSave: FirebaseCompanyData = {
    ...companydata,
    shortDescriptionText: shortDescriptionText.text,
    overviewText: overviewText.text,
    benefitsText: benefitsText.text,
  };

  // Execute all updates in parallel for efficiency
  await Promise.all([
    webCompanyInformationUpdate(dataToSave, companydata.createdBy, uid),
    address ? webAddressUpdate(address, companydata.createdBy, uid) : Promise.resolve(),
    contact ? webContactUpdate(contact, companydata.createdBy, uid) : Promise.resolve(),
  ]);
};
