"use server";

import { Filter } from "firebase-admin/firestore";
import { userDataProps } from "@/types/auth.types";

import {
  getUserDataPropsById as _getUserDataPropsById,
  getUserDataPropsByFilter as _getUserDataPropsByFilter,
  createUserDataProps as _createUserDataProps,
  updateUserDataProps as _updateUserDataProps,
} from "../repositories/web-user-data-props";

export const webUserDataPropsGetById = async (uid: string) => {
  try {
    return await _getUserDataPropsById(uid);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

export const webUserDataPropsGetByFilter = async (props?: {
  userDataFilter?: Filter;
  userInfoFilter?: Filter;
  userTransferFilter?: Filter;
}) => {
  try {
    return await _getUserDataPropsByFilter(props);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

export const webUserDataPropsCreate = async (data: userDataProps) => {
  try {
    return await _createUserDataProps(data);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

export const webUserDataPropsUpdate = async (uid: string, data: userDataProps) => {
  try {
    return await _updateUserDataProps(uid, data);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};
