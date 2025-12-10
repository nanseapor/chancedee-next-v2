"use server";

import { Filter } from "firebase-admin/firestore";

import { contact } from "@/types/database.types";

import { contactRepository } from "../repositories/contact-repository";

const webContactGetById = async (uid: string) => {
  try {
    return await contactRepository.getById(uid);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

const webContactGetByFilter = async (filter?: Filter) => {
  try {
    return await contactRepository.getByFilter(filter);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

const webContactCreate = async (
  payload: Omit<contact, "uid" | "createdAt" | "updatedAt">,
  actorId: string,
  uid?: string
) => {
  try {
    const contactData: contact = {
      ...payload,
      uid: uid || "",
    };
    return await contactRepository.create(contactData, actorId, uid);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

const webContactUpdate = async (
  payload: Omit<contact, "uid" | "createdAt" | "updatedAt">,
  actorId: string,
  uid: string
) => {
  try {
    const contactData: contact = {
      ...payload,
      uid,
    };
    return await contactRepository.update(uid, contactData, actorId);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

export {
  webContactCreate,
  webContactGetByFilter,
  webContactGetById,
  webContactUpdate
};

