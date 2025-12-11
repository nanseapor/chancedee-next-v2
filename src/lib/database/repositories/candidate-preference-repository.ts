import "server-only";

import { Timestamp } from "firebase-admin/firestore";

import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";
import { candidatePreferences } from "@/types/candidate.types";

import { FirebaseCandidatePreferenceType } from "../schemas/candidate-preference.schema";
import { toFirebaseTimestamp, toMillis } from "../utils/data-mapper";

import { createRepository } from "./repository-factory";
import { IRepository } from "./interfaces/repository.interface";

// Transform Firebase model to App model
function transformToAppModel(
  firebaseModel: FirebaseCandidatePreferenceType,
  createTime?: number,
  updateTime?: number
): candidatePreferences {
  return {
    uid: firebaseModel.uid || "", // Placeholder, should always have value from Firestore
    iAm: firebaseModel.i_am,
    iAmLookingFor: firebaseModel.i_amLooking_for,
    iValues: firebaseModel.i_values,
    myPreferredJobs: firebaseModel.my_preferred_jobs,
    myValues: firebaseModel.my_values,
    preferredCompany: firebaseModel.preferred_company,
    preferredPosition: firebaseModel.preferred_position,
    expectedSalary: firebaseModel.expected_salary,
    isNegotiable: firebaseModel.is_negotiable,
    headlines: firebaseModel.headlines,
    overheadDays: firebaseModel.overhead_days,
    expectedStartDate: toMillis(firebaseModel.expected_start_date),
    jobLocation: firebaseModel.job_location,
    jobType: firebaseModel.job_type,
    jobFunction: firebaseModel.job_function,
    jobIndustry: firebaseModel.job_industry,
    experience: firebaseModel.experience,
    employment: firebaseModel.employment_status,
    createdBy: firebaseModel.created_by?.id,
    updatedBy: firebaseModel.updated_by?.id,
    createdAt: createTime || 0,
    updatedAt: updateTime || 0,
  };
}

// Transform App model to Firebase model
function transformToFirebaseModel(
  appModel: candidatePreferences,
  actorId: string,
  isUpdate = false
): FirebaseCandidatePreferenceType {
  const creatorRef = getFirebaseAdminFirestore()
    .collection("user_accounts")
    .doc(isUpdate && appModel.createdBy ? appModel.createdBy : actorId);
  const updatorRef = getFirebaseAdminFirestore()
    .collection("user_accounts")
    .doc(actorId);

  return {
    uid: appModel.uid || "", // Will be overwritten by createDocument() with actual Firestore ID
    i_am: appModel.iAm,
    i_amLooking_for: appModel.iAmLookingFor,
    i_values: appModel.iValues,
    my_preferred_jobs: appModel.myPreferredJobs,
    my_values: appModel.myValues,
    preferred_company: appModel.preferredCompany,
    preferred_position: appModel.preferredPosition,
    expected_salary: appModel.expectedSalary,
    is_negotiable: appModel.isNegotiable,
    headlines: appModel.headlines,
    overhead_days: appModel.overheadDays,
    expected_start_date: appModel.expectedStartDate ? toFirebaseTimestamp(appModel.expectedStartDate) : undefined,
    job_location: appModel.jobLocation,
    job_type: appModel.jobType,
    job_function: appModel.jobFunction,
    job_industry: appModel.jobIndustry,
    experience: appModel.experience,
    employment_status: appModel.employment,
    created_by: creatorRef,
    updated_by: updatorRef,
    created_at: Timestamp.now(),
    updated_at: Timestamp.now(),
  };
}

// Create and export the repository
export const candidatePreferenceRepository: IRepository<candidatePreferences> = createRepository<candidatePreferences, FirebaseCandidatePreferenceType>(
  'candidate_preference',
  transformToAppModel,
  transformToFirebaseModel
);