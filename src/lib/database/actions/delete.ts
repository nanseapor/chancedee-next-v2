"use server";

import { Filter } from "firebase-admin/firestore";
import { DeleteAccountProps } from "@/types/auth.types";
import { deleteRepository } from "../repositories/delete-repository";

const webDeleteRequestGetByFilter = async (filter?: Filter) => {
  try {
    return await deleteRepository.getByFilter(filter);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

const webDeleteRequestCreate = async (
  payload: DeleteAccountProps,
  actorId: string,
  uid?: string
) => {
  try {
    return await deleteRepository.create(payload, actorId, uid);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

export {
  webDeleteRequestCreate,
  webDeleteRequestGetByFilter
};
