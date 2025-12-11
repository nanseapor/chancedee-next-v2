"use server";
import { Filter, Query, Timestamp } from "firebase-admin/firestore";

import { getFirebaseAdminFirestore } from "@/lib/firebase/firebase-admin";
import { FirebaseCandidateScreeningData } from "@/types/candidate-screening.types";

import { FirebaseCandidateScreeningType } from "../schemas/candidate-screening.schema";


const webCandidateScreeningGetById = async (uid: string) => {
  try {
    const CandidateScreeningRef = getFirebaseAdminFirestore()
      .collection("candidate_information")
      .doc(uid);
    const CandidateScreeningSnap = await CandidateScreeningRef.get();
    if (CandidateScreeningSnap.exists) {
      const firebaseCandidateScreening =
        CandidateScreeningSnap.data() as FirebaseCandidateScreeningType;
      const data: FirebaseCandidateScreeningData = {
        uid: firebaseCandidateScreening.uid,
        flagCount: firebaseCandidateScreening.flag_count || -1,
        riskScore: firebaseCandidateScreening.risk_score || -1,
        lastActive: firebaseCandidateScreening.last_active?.toMillis() || Date.now(),
        profileStatus: firebaseCandidateScreening.profile_status || "unverified",
        emailVerification: firebaseCandidateScreening.email_verification || false,
        phoneVerification: firebaseCandidateScreening.phone_verification || false,
        identityVerification: firebaseCandidateScreening.identity_verification || false,
        createdBy: firebaseCandidateScreening.created_by?.id,
        updatedBy: firebaseCandidateScreening.updated_by?.id,
        createdAt: CandidateScreeningSnap.createTime?.toMillis() || 0,
        updatedAt: CandidateScreeningSnap.updateTime?.toMillis() || 0
};
      // Remove fields with undefined values
      return data;
    } else {
      return null;
    }
  } catch (e) {
    const error = e as Error;
    throw error;
  }
}

const webCandidateScreeningGetByFilter = async (filter?: Filter) => {
  try {
    const CandidateScreeningRef = getFirebaseAdminFirestore().collection(
      "candidate_information"
    );
    let CandidateScreeningQuery = CandidateScreeningRef as Query;
    if (filter)
      CandidateScreeningQuery = CandidateScreeningRef.where(filter);
    const CandidateScreeningSnap = await CandidateScreeningQuery.get();
    if (!CandidateScreeningSnap.empty) {
      const lists = CandidateScreeningSnap.docs.map((doc) => {
        const firebaseCandidateScreening =
          doc.data() as FirebaseCandidateScreeningType;
        const data: FirebaseCandidateScreeningData = {
          uid: firebaseCandidateScreening.uid,
          flagCount: firebaseCandidateScreening.flag_count || -1,
          riskScore: firebaseCandidateScreening.risk_score || -1,
          lastActive: firebaseCandidateScreening.last_active?.toMillis() || Date.now(),
          profileStatus: firebaseCandidateScreening.profile_status || "unverified",
          emailVerification: firebaseCandidateScreening.email_verification || false,
          phoneVerification: firebaseCandidateScreening.phone_verification || false,
          identityVerification: firebaseCandidateScreening.identity_verification || false,
          createdBy: firebaseCandidateScreening.created_by?.id,
          updatedBy: firebaseCandidateScreening.updated_by?.id,
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

const webCandidateScreeningUpdate = async (
  payload: Omit<FirebaseCandidateScreeningData, "uid" | "createdAt" | "updatedAt">,
  actorId: string,
  uid: string
) => {
  try {
    const actorRef = getFirebaseAdminFirestore().collection("user_accounts").doc(actorId);
    const CandidateScreeningRef = getFirebaseAdminFirestore()
      .collection("candidate_information")
      .doc(uid);
    const prevDataSnap = await CandidateScreeningRef.get();
    const dataToWrite: FirebaseCandidateScreeningType = {
      uid: CandidateScreeningRef.id,
      flag_count: payload.flagCount || -1,
      risk_score: payload.riskScore || -1,
      last_active: payload.lastActive ? Timestamp.fromMillis(payload.lastActive) : Timestamp.now(),
      profile_status: payload.profileStatus || "unverified",
      email_verification: payload.emailVerification || false,
      phone_verification: payload.phoneVerification || false,
      identity_verification: payload.identityVerification || false,
      created_by: prevDataSnap.data()?.created_by || actorRef,
      created_at: prevDataSnap.createTime || Timestamp.now(),
      updated_by: actorRef,
      updated_at: Timestamp.now()
};
    await CandidateScreeningRef.set(dataToWrite, { merge: true });
    return CandidateScreeningRef.id;
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

export {
  webCandidateScreeningGetByFilter,
  webCandidateScreeningGetById,
  webCandidateScreeningUpdate
};
