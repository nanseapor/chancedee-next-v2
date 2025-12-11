"use server";

import { Filter } from "firebase-admin/firestore";
import { companyDataProps } from "@/types/company.types";

import {
  getCompanyDataPropsById as _getCompanyDataPropsById,
  getCompanyDataPropsByFilter as _getCompanyDataPropsByFilter,
  createCompanyDataProps as _createCompanyDataProps,
  updateCompanyDataProps as _updateCompanyDataProps,
} from "../repositories/web-company-data-props";

export const webCompanyDataPropsGetById = async (uid: string) => {
  try {
    return await _getCompanyDataPropsById(uid);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

export const webCompanyDataPropsGetByFilter = async (props?: {
  companyFilter?: Filter;
  addressFilter?: Filter;
  contactFilter?: Filter;
}) => {
  try {
    return await _getCompanyDataPropsByFilter(props);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

export const webCompanyDataPropsCreate = async (data: companyDataProps) => {
  try {
    return await _createCompanyDataProps(data);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

export const webCompanyDataPropsUpdate = async (uid: string, data: companyDataProps) => {
  try {
    return await _updateCompanyDataProps(uid, data);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};
