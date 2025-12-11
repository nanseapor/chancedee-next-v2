import "server-only";

import { Timestamp } from "firebase-admin/firestore";

import { getFirebaseAdminFirestore } from "@/lib/firebase/firebase-admin";
import { FirebaseJobData } from "@/types/job.types";
import { extractDocumentIdOptional, extractTimestamp } from "@/lib/database/utils/firebase-utils";

import { FirebaseJobType } from "../schemas/jobs.schema";

import { createRepository } from "./repository-factory";
import { IRepository } from "./interfaces/repository.interface";

// Transform Firebase model to App model
function transformToAppModel(
  firebaseModel: FirebaseJobType,
  createTime?: number,
  updateTime?: number
): FirebaseJobData {
  return {
    uid: firebaseModel.uid || "", // Placeholder, should always have value from Firestore
    companyId: firebaseModel.company_id,
    companyName: firebaseModel.company_name,
    companyLogo: firebaseModel.company_logo,
    interviewChannel: firebaseModel.interview_channel,
    interviewChannelText: firebaseModel.interview_channel_text,
    jobFunction: firebaseModel.job_function,
    jobFunctionText: firebaseModel.job_function_text,
    careerLevel: firebaseModel.career_level,
    careerLevelText: firebaseModel.career_level_text,
    educationLevel: firebaseModel.education_level,
    educationLevelText: firebaseModel.education_level_text,
    title: firebaseModel.title,
    isNegotiable: firebaseModel.is_negotiable,
    minSalary: firebaseModel.min_salary,
    maxSalary: firebaseModel.max_salary,
    positions: firebaseModel.positions,
    workLocation: firebaseModel.work_location,
    workLocationText: firebaseModel.work_location_text,
    isOnlineInterview: firebaseModel.is_online_interview,
    experience: firebaseModel.experience,
    experienceText: firebaseModel.experience_text,
    employment: firebaseModel.employment,
    employmentText: firebaseModel.employment_text,
    isAcceptNewGrads: firebaseModel.is_accept_new_grads,
    travelMode: firebaseModel.travel_mode,
    travelStation: firebaseModel.travel_station,
    jobStatus: firebaseModel.job_status,
    isActive: firebaseModel.is_active,
    reactivatedCount: firebaseModel.reactivated_count,
    workDays: firebaseModel.work_days,
    workDaysText: firebaseModel.work_days_text,
    postStartDate: extractTimestamp(firebaseModel.post_start_date),
    postExpiryDate: extractTimestamp(firebaseModel.post_expiry_date),
    benefitsDetails: firebaseModel.benefits_details,
    benefitsText: firebaseModel.benefits_text,
    jobDescriptionDetails: firebaseModel.job_description_details,
    jobDescriptionText: firebaseModel.job_description_text,
    qualificationDetails: firebaseModel.qualification_details,
    qualificationText: firebaseModel.qualification_text,
    // Contact fields
    phone: firebaseModel.phone,
    email: firebaseModel.email,
    mobile: firebaseModel.mobile,
    facebook: firebaseModel.facebook,
    linkedin: firebaseModel.linkedin,
    twitter: firebaseModel.twitter,
    instagram: firebaseModel.instagram,
    line: firebaseModel.line,
    website: firebaseModel.website,
    // Address fields
    addressLine1: firebaseModel.address_line_1,
    addressLine2: firebaseModel.address_line_2,
    district: firebaseModel.district,
    subDistrict: firebaseModel.sub_district,
    postCode: firebaseModel.post_code,
    province: firebaseModel.province,
    createdBy: extractDocumentIdOptional(firebaseModel.created_by),
    updatedBy: extractDocumentIdOptional(firebaseModel.updated_by),
    createdAt: createTime || 0,
    updatedAt: updateTime || 0,
  };
}

// Transform App model to Firebase model
function transformToFirebaseModel(
  appModel: FirebaseJobData,
  actorId: string,
  isUpdate = false
): FirebaseJobType {
  const creatorRef = getFirebaseAdminFirestore()
    .collection("user_accounts")
    .doc(isUpdate && appModel.createdBy ? appModel.createdBy : actorId);
  const updatorRef = getFirebaseAdminFirestore()
    .collection("user_accounts")
    .doc(actorId);
  const companyRef = getFirebaseAdminFirestore()
    .collection("company_information")
    .doc(appModel.companyId);

  return {
    uid: appModel.uid || "", // Will be overwritten by createDocument() with actual Firestore ID
    created_by: creatorRef,
    created_at: Timestamp.now(),
    updated_by: updatorRef,
    updated_at: Timestamp.now(),
    company_id: appModel.companyId,
    company_ref: companyRef,
    company_name: appModel.companyName,
    company_logo: appModel.companyLogo,
    interview_channel: appModel.interviewChannel,
    interview_channel_text: appModel.interviewChannelText,
    job_function: appModel.jobFunction,
    job_function_text: appModel.jobFunctionText,
    career_level: appModel.careerLevel,
    career_level_text: appModel.careerLevelText,
    education_level: appModel.educationLevel,
    education_level_text: appModel.educationLevelText,
    title: appModel.title,
    is_negotiable: appModel.isNegotiable,
    min_salary: appModel.minSalary,
    max_salary: appModel.maxSalary,
    positions: appModel.positions,
    work_location: appModel.workLocation,
    work_location_text: appModel.workLocationText,
    is_online_interview: appModel.isOnlineInterview,
    experience: appModel.experience,
    experience_text: appModel.experienceText,
    employment: appModel.employment,
    employment_text: appModel.employmentText,
    is_accept_new_grads: appModel.isAcceptNewGrads,
    travel_mode: appModel.travelMode,
    travel_station: appModel.travelStation,
    job_status: appModel.jobStatus,
    is_active: appModel.isActive,
    reactivated_count: appModel.reactivatedCount,
    work_days: appModel.workDays,
    work_days_text: appModel.workDaysText,
    post_start_date: appModel.postStartDate ? Timestamp.fromMillis(appModel.postStartDate) : undefined,
    post_expiry_date: appModel.postExpiryDate ? Timestamp.fromMillis(appModel.postExpiryDate) : undefined,
    benefits_details: appModel.benefitsDetails,
    benefits_text: appModel.benefitsText,
    job_description_details: appModel.jobDescriptionDetails,
    job_description_text: appModel.jobDescriptionText,
    qualification_details: appModel.qualificationDetails,
    qualification_text: appModel.qualificationText,
    // Contact fields
    phone: appModel.phone,
    email: appModel.email,
    mobile: appModel.mobile,
    facebook: appModel.facebook,
    linkedin: appModel.linkedin,
    twitter: appModel.twitter,
    instagram: appModel.instagram,
    line: appModel.line,
    website: appModel.website,
    // Address fields
    address_line_1: appModel.addressLine1,
    address_line_2: appModel.addressLine2,
    district: appModel.district,
    sub_district: appModel.subDistrict,
    post_code: appModel.postCode,
    province: appModel.province,
  };
}

// Create and export the repository
export const jobsRepository: IRepository<FirebaseJobData> = createRepository<FirebaseJobData, FirebaseJobType>(
  'jobs',
  transformToAppModel,
  transformToFirebaseModel
);