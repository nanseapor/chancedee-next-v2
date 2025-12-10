"use server";

import { Filter } from "firebase-admin/firestore";

import { FirebaseAdminInvitation } from "@/types/admin.types";

import { adminInviteRepository } from "../repositories/admin-invite-repository";

const webAdminInvitationGetById = async (uid: string) => {
  try {
    return await adminInviteRepository.getById(uid);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

const webAdminInvitationGetByFilter = async (filter?: Filter) => {
  try {
    return await adminInviteRepository.getByFilter(filter);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

const webAdminInvitationCreate = async (
  payload: FirebaseAdminInvitation,
  actorId: string,
  uid?: string
) => {
  try {
    return await adminInviteRepository.create(payload, actorId, uid);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

const webAdminInvitationUpdate = async (
  id: string,
  payload: FirebaseAdminInvitation,
  actorId: string
) => {
  try {
    return await adminInviteRepository.update(id, payload, actorId);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

export {
  webAdminInvitationCreate,
  webAdminInvitationGetByFilter,
  webAdminInvitationGetById,
  webAdminInvitationUpdate
};

