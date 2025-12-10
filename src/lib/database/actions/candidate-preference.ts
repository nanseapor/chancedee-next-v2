"use server";
import { Filter, Query, Timestamp } from "firebase-admin/firestore";

import { getFirebaseAdminFirestore } from "@/lib/firebase-admin";
import { candidatePreferences } from "@/types/candidate.types";

import { FirebaseCandidatePreferenceType } from "../schemas/candidate-preference.schema";

const webCandidatePreferenceGetById = async (uid: string) => {
  try {
    const CandidatePreferenceRef = getFirebaseAdminFirestore()
      .collection("candidate_information")
      .doc(uid);
    const CandidatePreferenceSnap = await CandidatePreferenceRef.get();
    if (CandidatePreferenceSnap.exists) {
      const firebaseCandidatePreference =
        CandidatePreferenceSnap.data() as FirebaseCandidatePreferenceType;
      const data: candidatePreferences = {
        uid: firebaseCandidatePreference.uid,
        expectedStartDate:
          firebaseCandidatePreference.expected_start_date?.toMillis(),
        createdAt: CandidatePreferenceSnap.createTime?.toMillis() || 0,
        updatedAt: CandidatePreferenceSnap.updateTime?.toMillis() || 0,
        iAm: firebaseCandidatePreference.i_am || "",
        iAmLookingFor: firebaseCandidatePreference.i_amLooking_for || [],
        iValues: firebaseCandidatePreference.i_values || [],
        myPreferredJobs: firebaseCandidatePreference.my_preferred_jobs || [],
        myValues: firebaseCandidatePreference.my_values || [],
        preferredCompany: firebaseCandidatePreference.preferred_company,
        preferredPosition: firebaseCandidatePreference.preferred_position,
        jobFunction: firebaseCandidatePreference.job_function || [],
        jobType: firebaseCandidatePreference.job_type || "",
        jobLocation: firebaseCandidatePreference.job_location || "",
        expectedSalary: firebaseCandidatePreference.expected_salary || 0,
        isNegotiable: firebaseCandidatePreference.is_negotiable || false,
        headlines: firebaseCandidatePreference.headlines || "",
        overheadDays: firebaseCandidatePreference.overhead_days || "ทันที",
        createdBy: firebaseCandidatePreference.created_by?.id,
        updatedBy: firebaseCandidatePreference.updated_by?.id,
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

const webCandidatePreferenceGetByFilter = async (filter?: Filter) => {
  try {
    const CandidatePreferenceRef = getFirebaseAdminFirestore().collection(
      "candidate_information"
    );
    let CandidatePreferenceQuery = CandidatePreferenceRef as Query;
    if (filter) CandidatePreferenceQuery = CandidatePreferenceRef.where(filter);
    const CandidatePreferenceSnap = await CandidatePreferenceQuery.get();
    if (!CandidatePreferenceSnap.empty) {
      const lists = CandidatePreferenceSnap.docs.map((doc) => {
        const firebaseCandidatePreference =
          doc.data() as FirebaseCandidatePreferenceType;
        const data: candidatePreferences = {
          uid: firebaseCandidatePreference.uid,
          expectedStartDate:
            firebaseCandidatePreference.expected_start_date?.toMillis(),
          createdAt: doc.createTime?.toMillis() || 0,
          updatedAt: doc.updateTime?.toMillis() || 0,
          iAm: firebaseCandidatePreference.i_am || "",
          iAmLookingFor: firebaseCandidatePreference.i_amLooking_for || [],
          iValues: firebaseCandidatePreference.i_values || [],
          myPreferredJobs: firebaseCandidatePreference.my_preferred_jobs || [
          ],
          myValues: firebaseCandidatePreference.my_values || [],
          preferredCompany: firebaseCandidatePreference.preferred_company,
          preferredPosition: firebaseCandidatePreference.preferred_position,
          jobFunction: firebaseCandidatePreference.job_function || [],
          jobType: firebaseCandidatePreference.job_type || "",
          jobLocation: firebaseCandidatePreference.job_location || "",
          expectedSalary: firebaseCandidatePreference.expected_salary || 0,
          isNegotiable: firebaseCandidatePreference.is_negotiable || false,
          headlines: firebaseCandidatePreference.headlines || "",
          overheadDays: firebaseCandidatePreference.overhead_days || "ทันที",
          createdBy: firebaseCandidatePreference.created_by?.id,
          updatedBy: firebaseCandidatePreference.updated_by?.id,
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

const webCandidatePreferenceCreate = async (
  payload: candidatePreferences,
  actorId: string,
  uid?: string
) => {
  try {
    const actorRef = getFirebaseAdminFirestore().collection("user_accounts").doc(actorId);
    const CandidatePreferenceRef = uid
      ? getFirebaseAdminFirestore().collection("candidate_information").doc(uid)
      : getFirebaseAdminFirestore().collection("candidate_information").doc();
    const dataToWrite: FirebaseCandidatePreferenceType = {
      uid: uid || CandidatePreferenceRef.id,
      i_am: payload.iAm,
      i_amLooking_for: payload.iAmLookingFor,
      i_values: payload.iValues,
      my_preferred_jobs: payload.myPreferredJobs,
      my_values: payload.myValues,
      preferred_company: payload.preferredCompany,
      preferred_position: payload.preferredPosition,
      expected_salary: payload.expectedSalary,
      is_negotiable: payload.isNegotiable,
      headlines: payload.headlines,
      overhead_days: payload.overheadDays,
      employment_status: payload.employment,
      experience: payload.experience,
      job_function: payload.jobFunction,
      job_industry: payload.jobIndustry,
      job_type: payload.jobType,
      job_location: payload.jobLocation,
      expected_start_date: payload.expectedStartDate
        ? Timestamp.fromMillis(payload.expectedStartDate)
        : undefined,
      created_by: actorRef,
      created_at: Timestamp.now(),
      updated_by: actorRef,
      updated_at: Timestamp.now(),
    };
    await CandidatePreferenceRef.set(dataToWrite, { merge: true });
    return CandidatePreferenceRef.id;
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

const webCandidatePreferenceUpdate = async (
  payload: candidatePreferences,
  actorId: string,
  uid: string
) => {
  try {
    const actorRef = getFirebaseAdminFirestore().collection("user_accounts").doc(actorId);
    const CandidatePreferenceRef = getFirebaseAdminFirestore()
      .collection("candidate_information")
      .doc(uid);
    const prevDataSnap = await CandidatePreferenceRef.get();
    const dataToWrite: FirebaseCandidatePreferenceType = {
      uid: uid || CandidatePreferenceRef.id,
      i_am: payload.iAm,
      i_amLooking_for: payload.iAmLookingFor,
      i_values: payload.iValues,
      my_preferred_jobs: payload.myPreferredJobs,
      my_values: payload.myValues,
      preferred_company: payload.preferredCompany,
      preferred_position: payload.preferredPosition,
      expected_salary: payload.expectedSalary,
      is_negotiable: payload.isNegotiable,
      headlines: payload.headlines,
      overhead_days: payload.overheadDays,
      employment_status: payload.employment,
      experience: payload.experience,
      job_function: payload.jobFunction,
      job_industry: payload.jobIndustry,
      job_type: payload.jobType,
      job_location: payload.jobLocation,
      expected_start_date: payload.expectedStartDate
        ? Timestamp.fromMillis(payload.expectedStartDate)
        : undefined,
      created_by: prevDataSnap.data()?.created_by || actorRef,
      created_at: prevDataSnap.createTime || Timestamp.now(),
      updated_by: actorRef,
      updated_at: Timestamp.now(),
    };
    await CandidatePreferenceRef.set(dataToWrite, { merge: true });
    return CandidatePreferenceRef.id;
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

export {
    webCandidatePreferenceCreate,
    webCandidatePreferenceGetByFilter,
    webCandidatePreferenceGetById,
    webCandidatePreferenceUpdate
};

