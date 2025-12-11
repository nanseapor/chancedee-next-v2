"use server";
import { Filter, Query, Timestamp } from "firebase-admin/firestore";

import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";
import { IJobOfferData, IOfferReturnData } from "@/types/job.types";

import { FirebaseJobOfferType } from "../schemas/job-offers.schema";


const webJobOfferGetByFilter = async (filter?: Filter) => {
  try {
    const JobOfferRef = getFirebaseAdminFirestore().collection("job_offers");
    let JobOfferQuery = JobOfferRef as Query;
    if (filter) {
      JobOfferQuery = JobOfferRef.where(filter);
    }
    const JobOfferSnap = await JobOfferQuery.get();
    if (!JobOfferSnap.empty) {
      const lists = JobOfferSnap.docs.map((doc) => {
        const firebaseJobOffer = doc.data() as FirebaseJobOfferType;
        const data: IOfferReturnData = {
          uid: firebaseJobOffer.uid,
          jobId: firebaseJobOffer.job_id,
          candidateId: firebaseJobOffer.candidate_id,
          offerCount: firebaseJobOffer.offer_count,
          isApplied: firebaseJobOffer.is_applied || false,
          isActive: firebaseJobOffer.is_active,
          note: firebaseJobOffer.note || ""
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

const webJobOfferCreate = async (
  payload: IJobOfferData,
  actorId: string,
  uid?: string
) => {
  try {
    const actorRef = getFirebaseAdminFirestore().collection("user_accounts").doc(actorId);
    const JobOfferRef = uid
      ? getFirebaseAdminFirestore().collection("job_offers").doc(uid)
      : getFirebaseAdminFirestore().collection("job_offers").doc();

    const dataToWrite: FirebaseJobOfferType = {
      job_id: payload.jobId,
      candidate_id: payload.candidateId,
      offer_count: payload.offerCount,
      is_applied: payload.isApplied,
      is_active: payload.isActive,
      note: payload.note,
      uid: JobOfferRef.id,
      created_by: actorRef,
      created_at: Timestamp.now(),
      updated_by: actorRef,
      updated_at: Timestamp.now()
};
    await JobOfferRef.set(dataToWrite, { merge: true });
    return JobOfferRef.id;
  } catch (e) {
    const error = e as Error;
    throw error;
  }
}

const webJobOfferUpdate = async (
  payload: IJobOfferData,
  actorId: string,
  uid: string
) => {
  try {
    const actorRef = getFirebaseAdminFirestore().collection("user_accounts").doc(actorId);
    const JobOfferRef = getFirebaseAdminFirestore()
      .collection("job_offers")
      .doc(uid);
    const prevDataSnap = await JobOfferRef.get();
    const dataToWrite: FirebaseJobOfferType = {
      job_id: payload.jobId,
      candidate_id: payload.candidateId,
      offer_count: payload.offerCount,
      is_applied: payload.isApplied,
      is_active: payload.isActive,
      note: payload.note,
      uid: JobOfferRef.id,
      created_by: prevDataSnap.data()?.created_by || actorRef,
      created_at: prevDataSnap.createTime || Timestamp.now(),
      updated_by: actorRef,
      updated_at: Timestamp.now()
};
    await JobOfferRef.set(dataToWrite, { merge: true });
    return JobOfferRef.id;
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

export {
  webJobOfferCreate,
  webJobOfferGetByFilter,
  webJobOfferUpdate
};
