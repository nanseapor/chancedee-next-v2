"use server";

import { Filter } from "firebase-admin/firestore";

import { address } from "@/types/database.types";

import { addressRepository } from "../repositories/address-repository";

const webAddressGetById = async (uid: string) => {
  try {
    return await addressRepository.getById(uid);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

const webAddressGetByFilter = async (filter?: Filter) => {
  try {
    return await addressRepository.getByFilter(filter);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

const webAddressCreate = async (
  payload: address,
  actorId: string,
  uid?: string
) => {
  try {
    return await addressRepository.create(payload, actorId, uid);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

const webAddressUpdate = async (
  payload: address,
  actorId: string,
  uid: string
) => {
  try {
    return await addressRepository.update(uid, payload, actorId);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

export {
  webAddressCreate,
  webAddressGetByFilter,
  webAddressGetById,
  webAddressUpdate
};

