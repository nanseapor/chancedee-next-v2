"use server";

import { Filter } from "firebase-admin/firestore";
import { candidateDataProps } from "@/types/candidate.types";

import {
  getCandidateDataPropsById as _getCandidateDataPropsById,
  getCandidateDataPropsByFilter as _getCandidateDataPropsByFilter,
  createCandidateDataProps as _createCandidateDataProps,
  updateCandidateDataProps as _updateCandidateDataProps,
} from "../repositories/web-candidate-data-props";

export const webCandidateDataPropsGetById = async (uid: string) => {
  try {
    return await _getCandidateDataPropsById(uid);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

export const webCandidateDataPropsGetByFilter = async (props?: {
  informationFilter?: Filter;
  preferenceFilter?: Filter;
  referralFilter?: Filter;
  addressFilter?: Filter;
  contactFilter?: Filter;
}) => {
  try {
    return await _getCandidateDataPropsByFilter(props);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

export const webCandidateDataPropsCreate = async (data: candidateDataProps) => {
  try {
    return await _createCandidateDataProps(data);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

export const webCandidateDataPropsUpdate = async (uid: string, data: candidateDataProps) => {
  try {
    return await _updateCandidateDataProps(uid, data);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};
