"use server";

import { Filter } from "firebase-admin/firestore";

import { fcmTokenRepository, FCMToken } from "../repositories/fcm-token-repository";

const webFCMTokenGetById = async (uid: string) => {
  try {
    return await fcmTokenRepository.getById(uid);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

const webFCMTokenGetByFilter = async (filter?: Filter) => {
  try {
    return await fcmTokenRepository.getByFilter(filter);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

const webFCMTokenCreate = async (
  payload: {
    fcmToken: string;
    deviceType: string;
    status?: string;
  },
  actorId: string,
  uid?: string
) => {
  try {
    const fcmToken: FCMToken = {
      fcmToken: payload.fcmToken,
      deviceType: payload.deviceType,
      status: payload.status,
    };
    return await fcmTokenRepository.create(fcmToken, actorId, uid);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

const webFCMTokenUpdate = async (
  payload: {
    fcmToken: string;
    deviceType: string;
    status?: string;
  },
  actorId: string,
  uid: string
) => {
  try {
    const fcmToken: FCMToken = {
      fcmToken: payload.fcmToken,
      deviceType: payload.deviceType,
      status: payload.status,
    };
    return await fcmTokenRepository.update(uid, fcmToken, actorId);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

const webFCMTokenDeleteByToken = async (fcmToken: string) => {
  try {
    return await fcmTokenRepository.deleteByFilter("fcm_token", fcmToken);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

export {
  webFCMTokenCreate,
  webFCMTokenDeleteByToken,
  webFCMTokenGetById,
  webFCMTokenGetByFilter,
  webFCMTokenUpdate
};

