"use server";
import { Filter, Query, Timestamp } from "firebase-admin/firestore";

import { getFirebaseAdminFirestore } from "@/lib/firebase-admin";
import { FirebaseJobInterviewData } from "@/types/interview.types";

import { FirebaseJobInterviewType } from "../schemas/job-interviews.schema";

const webJobInterviewGetById = async (uid: string) => {
  try {
    const JobInterviewRef = getFirebaseAdminFirestore()
      .collection("job_interviews")
      .doc(uid);
    const JobInterviewSnap = await JobInterviewRef.get();
    if (JobInterviewSnap.exists) {
      const firebaseJobInterview =
        JobInterviewSnap.data() as FirebaseJobInterviewType;
      const data: FirebaseJobInterviewData = {
        appointment: firebaseJobInterview.appointment.toMillis(),
        createdAt: JobInterviewSnap.createTime?.toMillis() || 0,
        updatedAt: JobInterviewSnap.updateTime?.toMillis() || 0,
        uid: firebaseJobInterview.uid,
        jobId: firebaseJobInterview.job_id?.id,
        applicationId: firebaseJobInterview.application_id?.id,
        candidateId: firebaseJobInterview.candidate_id?.id,
        companyId: firebaseJobInterview.company_id?.id,
        candidateName: firebaseJobInterview.candidate_name,
        companyName: firebaseJobInterview.company_name,
        channel: firebaseJobInterview.channel,
        status: firebaseJobInterview.status as any,
        from: firebaseJobInterview.from,
        to: firebaseJobInterview.to,
        location: firebaseJobInterview.location,
        isCancel: firebaseJobInterview.is_cancel,
        cancelReason: firebaseJobInterview.cancel_reason,
        isAccepted: firebaseJobInterview.is_accepted || false,
        createdBy: firebaseJobInterview.created_by?.id,
        updatedBy: firebaseJobInterview.updated_by?.id,
        note: firebaseJobInterview.note,
        rejectFeedback: firebaseJobInterview.reject_feedback,
        room: firebaseJobInterview.room,
      };
      return data;
    } else {
      return null;
    }
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

const webJobInterviewGetByFilter = async (filter?: Filter) => {
  try {
    const JobInterviewRef =
      getFirebaseAdminFirestore().collection("job_interviews");
    let JobInterviewQuery = JobInterviewRef as Query;
    if (filter) JobInterviewQuery = JobInterviewRef.where(filter);
    const JobInterviewSnap = await JobInterviewQuery.get();
    if (!JobInterviewSnap.empty) {
      const lists = JobInterviewSnap.docs.map((doc) => {
        const firebaseJobInterview = doc.data() as FirebaseJobInterviewType;
        const data: FirebaseJobInterviewData = {
          appointment: firebaseJobInterview.appointment.toMillis(),
          createdAt: doc.createTime?.toMillis() || 0,
          updatedAt: doc.updateTime?.toMillis() || 0,
          uid: firebaseJobInterview.uid,
          jobId: firebaseJobInterview.job_id?.id,
          applicationId: firebaseJobInterview.application_id?.id,
          candidateId: firebaseJobInterview.candidate_id?.id,
          companyId: firebaseJobInterview.company_id?.id,
          candidateName: firebaseJobInterview.candidate_name,
          companyName: firebaseJobInterview.company_name,
          channel: firebaseJobInterview.channel,
          status: firebaseJobInterview.status as any,
          from: firebaseJobInterview.from,
          to: firebaseJobInterview.to,
          location: firebaseJobInterview.location,
          isCancel: firebaseJobInterview.is_cancel,
          cancelReason: firebaseJobInterview.cancel_reason,
          isAccepted: firebaseJobInterview.is_accepted || false,
          createdBy: firebaseJobInterview.created_by?.id,
          updatedBy: firebaseJobInterview.updated_by?.id,
          note: firebaseJobInterview.note,
          rejectFeedback: firebaseJobInterview.reject_feedback,
          room: firebaseJobInterview.room,
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
};

const webJobInterviewCreate = async (
  payload: FirebaseJobInterviewData,
  actorId: string,
  uid?: string
) => {
  try {
    const actorRef = getFirebaseAdminFirestore().collection("user_accounts").doc(actorId);
    const JobInterviewRef = uid
      ? getFirebaseAdminFirestore().collection("job_interviews").doc(uid)
      : getFirebaseAdminFirestore().collection("job_interviews").doc();
    const JobApplicationRef = getFirebaseAdminFirestore().collection("job_applications").doc(payload.applicationId);
    const jobRef = getFirebaseAdminFirestore().collection("jobs").doc(payload.jobId);
    const candidateRef = getFirebaseAdminFirestore().collection("candidate_information").doc(payload.candidateId);
    const companyRef = getFirebaseAdminFirestore().collection("company_information").doc(payload.companyId);

    const dataToWrite: FirebaseJobInterviewType = {
      uid: JobInterviewRef.id,
      created_by: actorRef,
      created_at: Timestamp.now(),
      updated_by: actorRef,
      updated_at: Timestamp.now(),
      appointment: Timestamp.fromMillis(payload.appointment),
      job_id: jobRef,
      application_id: JobApplicationRef,
      candidate_id: candidateRef,
      candidate_name: payload.candidateName,
      company_id: companyRef,
      company_name: payload.companyName,
      channel: payload.channel,
      status: payload.status,
      from: payload.from,
      to: payload.to,
      location: payload.location,
      is_cancel: payload.isCancel,
      cancel_reason: payload.cancelReason,
      is_accepted: payload.isAccepted,
      note: payload.note,
      reject_feedback: payload.rejectFeedback,
      room: payload.room,
    };
    await JobInterviewRef.set(dataToWrite, { merge: true });
    return JobInterviewRef.id;
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

const webJobInterviewUpdate = async (
  payload: FirebaseJobInterviewData,
  actorId: string,
  uid: string
) => {
  try {
    const actorRef = getFirebaseAdminFirestore().collection("user_accounts").doc(actorId);
    const JobInterviewRef = getFirebaseAdminFirestore()
      .collection("job_interviews")
      .doc(uid);

    const JobApplicationRef = getFirebaseAdminFirestore().collection("job_applications").doc(payload.applicationId);
    const jobRef = getFirebaseAdminFirestore().collection("jobs").doc(payload.jobId);
    const candidateRef = getFirebaseAdminFirestore().collection("candidate_information").doc(payload.candidateId);
    const companyRef = getFirebaseAdminFirestore().collection("company_information").doc(payload.companyId);

    const prevDataSnap = await JobInterviewRef.get();
    const dataToWrite: FirebaseJobInterviewType = {
      uid: JobInterviewRef.id,
      created_by: prevDataSnap.data()?.created_by || actorRef,
      created_at: prevDataSnap.createTime || Timestamp.now(),
      updated_by: actorRef,
      updated_at: Timestamp.now(),
      appointment: Timestamp.fromMillis(payload.appointment),
      job_id: jobRef,
      application_id: JobApplicationRef,
      candidate_id: candidateRef,
      candidate_name: payload.candidateName,
      company_id: companyRef,
      company_name: payload.companyName,
      channel: payload.channel,
      status: payload.status,
      from: payload.from,
      to: payload.to,
      location: payload.location,
      is_cancel: payload.isCancel,
      cancel_reason: payload.cancelReason,
      is_accepted: payload.isAccepted,
      note: payload.note,
      reject_feedback: payload.rejectFeedback,
      room: payload.room,
    };
    await JobInterviewRef.set(dataToWrite, { merge: true });
    return JobInterviewRef.id;
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

export {
    webJobInterviewCreate,
    webJobInterviewGetByFilter,
    webJobInterviewGetById,
    webJobInterviewUpdate
};

