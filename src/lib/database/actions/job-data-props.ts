"use server";

import { Filter } from "firebase-admin/firestore";
import { jobDataProps } from "@/types/job.types";

import {
  getJobDataPropsById as _getJobDataPropsById,
  getJobDataPropsByIds as _getJobDataPropsByIds,
  getJobDataPropsByFilter as _getJobDataPropsByFilter,
  createJobDataProps as _createJobDataProps,
  updateJobDataProps as _updateJobDataProps,
} from "../repositories/web-job-data-props";

export const webJobDataPropsGetById = async (uid: string) => {
  try {
    return await _getJobDataPropsById(uid);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

export const webJobDataPropsGetByIds = async (uids: string[]) => {
  try {
    return await _getJobDataPropsByIds(uids);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

export const webJobDataPropsGetByFilter = async (props?: {
  jobFilter?: Filter;
  companyFilter?: Filter;
}) => {
  try {
    return await _getJobDataPropsByFilter(props);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

export const webJobDataPropsCreate = async (data: jobDataProps) => {
  try {
    return await _createJobDataProps(data);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

export const webJobDataPropsUpdate = async (uid: string, data: jobDataProps) => {
  try {
    return await _updateJobDataProps(uid, data);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};
