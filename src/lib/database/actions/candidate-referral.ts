"use server";
import { Filter, Query, Timestamp } from "firebase-admin/firestore";

import { getFirebaseAdminFirestore } from "@/lib/firebase/firebase-admin";
import { candidateReferral } from "@/types/candidate.types";

import { FirebaseCandidateReferralType } from "../schemas/candidate-referral.schema";

const webCandidateReferralGetById = async (uid: string) => {
  try {
    const CandidateReferralRef = getFirebaseAdminFirestore()
      .collection("candidate_referral")
      .doc(uid);
    const CandidateReferralSnap = await CandidateReferralRef.get();
    if (CandidateReferralSnap.exists) {
      const firebaseCandidateReferral =
        CandidateReferralSnap.data() as FirebaseCandidateReferralType;
      const data: candidateReferral = {
        uid: firebaseCandidateReferral.uid,
        referBy: firebaseCandidateReferral.refer_by,
        referLink: firebaseCandidateReferral.refer_link,
        referredList: firebaseCandidateReferral.referred_list,
        referCode: firebaseCandidateReferral.refer_code,
        referDate: firebaseCandidateReferral.refer_date?.toMillis(),
        createdBy: firebaseCandidateReferral.created_by?.id,
        updatedBy: firebaseCandidateReferral.updated_by?.id,
        createdAt: CandidateReferralSnap.createTime?.toMillis() || 0,
        updatedAt: CandidateReferralSnap.updateTime?.toMillis() || 0
};
      return data;
    } else {
      return null;
    }
  } catch (e) {
    const error = e as Error;
    throw error;
  }
}

const webCandidateReferralGetByFilter = async (filter?: Filter) => {
  try {
    const CandidateReferralRef =
      getFirebaseAdminFirestore().collection("candidate_referral");
    let CandidateReferralQuery = CandidateReferralRef as Query;
    if (filter) CandidateReferralQuery = CandidateReferralRef.where(filter);
    const CandidateReferralSnap = await CandidateReferralQuery.get();
    if (!CandidateReferralSnap.empty) {
      const lists = CandidateReferralSnap.docs.map((doc) => {
        const firebaseCandidateReferral =
          doc.data() as FirebaseCandidateReferralType;
        const data: candidateReferral = {
          uid: firebaseCandidateReferral.uid,
          referBy: firebaseCandidateReferral.refer_by,
          referLink: firebaseCandidateReferral.refer_link,
          referredList: firebaseCandidateReferral.referred_list,
          referCode: firebaseCandidateReferral.refer_code,
          referDate: firebaseCandidateReferral.refer_date?.toMillis(),
          createdBy: firebaseCandidateReferral.created_by?.id,
          updatedBy: firebaseCandidateReferral.updated_by?.id,
          createdAt: doc.createTime?.toMillis() || 0,
          updatedAt: doc.updateTime?.toMillis() || 0
};
        return data;
      });
      return lists;
    } else {
      return null;
    }
  } catch (e) {
    const error = e as Error;
    throw error;
  }
}

const webCandidateReferralCreate = async (
  payload: candidateReferral,
  actorId: string,
  uid?: string
) => {
  try {
    const actorRef = getFirebaseAdminFirestore().collection("user_accounts").doc(actorId);
    const CandidateReferralRef = uid
      ? getFirebaseAdminFirestore().collection("candidate_referral").doc(uid)
      : getFirebaseAdminFirestore().collection("candidate_referral").doc();
    const dataToWrite: FirebaseCandidateReferralType = {
      refer_code: payload.referCode,
      refer_link: payload.referLink,
      refer_by: payload.referBy,
      referred_list: payload.referredList
        ? payload.referredList?.map((item) => item)
        : [],
      refer_date: payload.referDate
        ? Timestamp.fromMillis(payload.referDate)
        : undefined,
      uid: CandidateReferralRef.id,
      created_by: actorRef,
      created_at: Timestamp.now(),
      updated_by: actorRef,
      updated_at: Timestamp.now()
};
    await CandidateReferralRef.set(dataToWrite, { merge: true });
    return CandidateReferralRef.id;
  } catch (e) {
    const error = e as Error;
    throw error;
  }
}

const webCandidateReferralUpdate = async (
  payload: candidateReferral,
  actorId: string,
  uid: string
) => {
  try {
    const actorRef = getFirebaseAdminFirestore().collection("user_accounts").doc(actorId);
    const CandidateReferralRef = getFirebaseAdminFirestore()
      .collection("candidate_referral")
      .doc(uid);
    const prevDataSnap = await CandidateReferralRef.get();
    const dataToWrite: FirebaseCandidateReferralType = {
      refer_code: payload.referCode,
      refer_link: payload.referLink,
      refer_by: payload.referBy,
      referred_list: payload.referredList
        ? payload.referredList?.map((item) => item)
        : [],
      refer_date: payload.referDate
        ? Timestamp.fromMillis(payload.referDate)
        : undefined,
      uid: CandidateReferralRef.id,
      created_by: prevDataSnap.data()?.created_by || actorRef,
      created_at: prevDataSnap.createTime || Timestamp.now(),
      updated_by: actorRef,
      updated_at: Timestamp.now()
};
    await CandidateReferralRef.set(dataToWrite, { merge: true });
    return CandidateReferralRef.id;
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

export {
  webCandidateReferralCreate,
  webCandidateReferralGetByFilter,
  webCandidateReferralGetById,
  webCandidateReferralUpdate
};
