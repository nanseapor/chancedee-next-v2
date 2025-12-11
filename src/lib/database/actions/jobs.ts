"use server";

import { Filter } from "firebase-admin/firestore";

import { FirebaseJobData } from "@/types/job.types";

import { jobsRepository } from "../repositories/jobs-repository";

const webJobGetById = async (uid: string) => {
  try {
    return await jobsRepository.getById(uid);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

const webJobGetByFilter = async (filter?: Filter) => {
  try {
    return await jobsRepository.getByFilter(filter);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

const webJobGenerateId = async () => {
  try {
    return await jobsRepository.generateId();
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

const webJobCreate = async (
  payload: FirebaseJobData,
  actorId: string,
  uid?: string
) => {
  try {
    return await jobsRepository.create(payload, actorId, uid);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

const webJobUpdate = async (
  payload: FirebaseJobData,
  actorId: string,
  uid: string
) => {
  try {
    return await jobsRepository.update(uid, payload, actorId);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

const webJobDelete = async (uid: string) => {
  try {
    return await jobsRepository.delete(uid);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

export {
  webJobCreate,
  webJobDelete,
  webJobGenerateId,
  webJobGetByFilter,
  webJobGetById,
  webJobUpdate
};

