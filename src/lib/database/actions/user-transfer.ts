"use server";

import { Filter } from "firebase-admin/firestore";
import { userTransferProps } from "@/types/auth.types";
import { userTransferRepository } from "../repositories/user-transfer-repository";

const webUserTransferGetById = async (uid: string) => {
  try {
    return await userTransferRepository.getById(uid);
  } catch (e) {
    const error = e as Error;
    console.error("Read user_accounts transfer error:", error);
    throw error;
  }
};

const webUserTransferGetByFilter = async (filter?: Filter) => {
  try {
    return await userTransferRepository.getByFilter(filter);
  } catch (e) {
    const error = e as Error;
    console.error("Read user_accounts transfer by filter error:", error);
    throw error;
  }
};

const webUserTransferCreate = async (
  payload: userTransferProps,
  actorId: string,
  uid?: string
) => {
  try {
    return await userTransferRepository.create(payload, actorId, uid);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

const webUserTransferUpdate = async (
  payload: userTransferProps,
  actorId: string,
  uid: string
) => {
  try {
    return await userTransferRepository.update(uid, payload, actorId);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

export {
  webUserTransferCreate,
  webUserTransferGetByFilter,
  webUserTransferGetById,
  webUserTransferUpdate
};
