import "server-only";

import { Timestamp } from "firebase-admin/firestore";

import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";
import { FirebaseCandidateData } from "@/types/candidate.types";
import { validateCriticalFields } from "@/lib/database/utils/selective-validation";
import { extractDocumentIdOptional, extractTimestamp } from "@/lib/database/utils/firebase-utils";

import { FirebaseCandidateInformationType } from "../schemas/candidate-information.schema";

import { createRepository } from "./repository-factory";
import { IRepository } from "./interfaces/repository.interface";

// Transform Firebase model to App model with validation
function transformToAppModel(
  firebaseModel: FirebaseCandidateInformationType,
  createTime?: number,
  updateTime?: number
): FirebaseCandidateData {
  // Use shared utilities for consistent Firebase object transformations
  const createdById = extractDocumentIdOptional(firebaseModel.created_by);
  const updatedById = extractDocumentIdOptional(firebaseModel.updated_by);
  const createdAtTime = createTime || extractTimestamp(firebaseModel.created_at);
  const updatedAtTime = updateTime || extractTimestamp(firebaseModel.updated_at);

  const appModel: FirebaseCandidateData = {
    uid: firebaseModel.uid || "", // Placeholder, should always have value from Firestore
    resumePhotoURL: firebaseModel.resume_photo_url,
    titlePrefix: firebaseModel.title_prefix,
    firstnameTH: firebaseModel.first_name_th,
    lastnameTH: firebaseModel.last_name_th,
    nicknameTH: firebaseModel.nick_name_th,
    email: firebaseModel.email,
    phone: firebaseModel.phone_number,
    gender: firebaseModel.gender,
    addressLine1: firebaseModel.address_line_1,
    addressLine2: firebaseModel.address_line_2,
    district: firebaseModel.district,
    subDistrict: firebaseModel.sub_district,
    postCode: firebaseModel.post_code,
    province: firebaseModel.province,
    aboutMe: firebaseModel.about_me,
    achievement: firebaseModel.achievement,
    areaOfExpertise: firebaseModel.area_of_expertise,
    bloodgroup: firebaseModel.bloodgroup,
    birthplace: firebaseModel.birthplace,
    birthdate: firebaseModel.birthdate?.toMillis(),
    religion: firebaseModel.religion,
    nationality: firebaseModel.nationality,
    race: firebaseModel.race,
    height: firebaseModel.height,
    weight: firebaseModel.weight,
    maritalStatus: firebaseModel.marital_status,
    millitaryStatus: firebaseModel.millitary_status,
    lineId: firebaseModel.line_id,
    hasCar: firebaseModel.has_car,
    hasMotorcycle: firebaseModel.has_motorcycle,
    educations: firebaseModel.educations?.map(edu => ({
      institution: edu.institution,
      major: edu.major,
      minor: edu.minor,
      educationLevel: edu.education_level,
      educationLabel: edu.education_label,
      startYear: edu.start_year,
      endYear: edu.end_year,
      gpax: edu.gpax,
      highlights: edu.highlights,
      note: edu.note,
    })),
    skills: firebaseModel.skills?.map(skill => ({
      skillName: skill.skill_name,
      expertiseLevel: skill.expertise_level,
      isCertified: skill.is_certified,
      skillCertifiedName: skill.skill_certified_name,
      skillCertifiedScore: skill.skill_certified_score,
    })),
    languages: firebaseModel.languages?.map(lang => ({
      languageName: lang.language_name,
      languageLevel: lang.language_level,
      isCertified: lang.is_certified,
      languageCertifiedName: lang.language_certified_name,
      languageCertifiedScore: lang.language_certified_score,
    })),
    licenses: firebaseModel.licenses?.map(license => ({
      certificateName: license.certificate_name,
      certifiedDate: extractTimestamp(license.certified_date),
      score: license.score,
      note: license.note,
    })),
    works: firebaseModel.works?.map(work => ({
      company: work.company,
      jobIndustry: work.job_industry,
      jobFunction: work.job_function,
      jobTitle: work.job_title,
      experienceYears: work.experience_years,
      salary: work.salary,
      careerLevel: work.career_level,
      startMonth: work.start_month,
      startYear: work.start_year,
      endMonth: work.end_month,
      endYear: work.end_year,
      note: work.note,
      isCurrent: work.is_current,
      isNewGraduate: work.is_new_graduate,
    })),
    experienceYears: firebaseModel.experience_years,
    isActive: firebaseModel.is_active,
    isSearchable: firebaseModel.is_searchable,
    status: firebaseModel.status,
    createdBy: createdById,
    updatedBy: updatedById,
    createdAt: createdAtTime,
    updatedAt: updatedAtTime,
    isOnboarded: firebaseModel.is_onboarded || false,
    isVerified: firebaseModel.is_verified || false,
    isPreferenceSet: firebaseModel.is_preference_set || false,
    isFirstApplicantionRewarded: firebaseModel.is_first_applicantion_rewarded || false,
    isFirstInterviewerRewarded: firebaseModel.is_first_interviewer_rewarded || false,
    isNewUserRewarded: firebaseModel.is_new_user_rewarded || false,
    isResumeCompleted: firebaseModel.is_resume_completed || false,
  };

  // Validate critical fields to ensure they are serializable
  try {
    // Note: We run validation but don't await it to avoid affecting performance
    // This will log any critical validation errors
    validateCriticalFields('candidate_information', appModel, {
      type: 'app',
      throwOnCriticalError: false,
      logWarnings: true,
    }).catch((error) => {
      console.error('🚨 Candidate information critical field validation failed:', error);
    });
  } catch (error) {
    console.error('🚨 Error during candidate information validation:', error);
  }

  return appModel;
}

// Transform App model to Firebase model
function transformToFirebaseModel(
  appModel: FirebaseCandidateData,
  actorId: string,
  isUpdate = false
): FirebaseCandidateInformationType {
  const creatorRef = getFirebaseAdminFirestore()
    .collection("user_accounts")
    .doc(isUpdate && appModel.createdBy ? appModel.createdBy : actorId);
  const updatorRef = getFirebaseAdminFirestore()
    .collection("user_accounts")
    .doc(actorId);

  return {
    uid: appModel.uid || "", // Will be overwritten by createDocument() with actual Firestore ID
    resume_photo_url: appModel.resumePhotoURL,
    title_prefix: appModel.titlePrefix,
    first_name_th: appModel.firstnameTH,
    last_name_th: appModel.lastnameTH,
    nick_name_th: appModel.nicknameTH,
    email: appModel.email,
    phone_number: appModel.phone,
    gender: appModel.gender,
    address_line_1: appModel.addressLine1,
    address_line_2: appModel.addressLine2,
    district: appModel.district,
    sub_district: appModel.subDistrict,
    post_code: appModel.postCode,
    province: appModel.province,
    about_me: appModel.aboutMe,
    achievement: appModel.achievement,
    area_of_expertise: appModel.areaOfExpertise,
    bloodgroup: appModel.bloodgroup,
    birthplace: appModel.birthplace,
    birthdate: (appModel.birthdate !== undefined && appModel.birthdate !== null && !isNaN(appModel.birthdate)) ? Timestamp.fromMillis(appModel.birthdate) : undefined,
    religion: appModel.religion,
    nationality: appModel.nationality,
    race: appModel.race,
    height: appModel.height,
    weight: appModel.weight,
    marital_status: appModel.maritalStatus,
    millitary_status: appModel.millitaryStatus,
    line_id: appModel.lineId,
    has_car: appModel.hasCar,
    has_motorcycle: appModel.hasMotorcycle,
    educations: appModel.educations?.map(edu => ({
      institution: edu.institution,
      major: edu.major,
      minor: edu.minor,
      education_level: edu.educationLevel,
      education_label: edu.educationLabel,
      start_year: edu.startYear,
      end_year: edu.endYear,
      gpax: edu.gpax,
      highlights: edu.highlights,
      note: edu.note,
    })),
    skills: appModel.skills?.map(skill => ({
      skill_name: skill.skillName,
      expertise_level: skill.expertiseLevel,
      is_certified: skill.isCertified,
      skill_certified_name: skill.skillCertifiedName,
      skill_certified_score: skill.skillCertifiedScore,
    })),
    languages: appModel.languages?.map(lang => ({
      language_name: lang.languageName,
      language_level: lang.languageLevel,
      is_certified: lang.isCertified,
      language_certified_name: lang.languageCertifiedName,
      language_certified_score: lang.languageCertifiedScore,
    })),
    licenses: appModel.licenses?.map(license => ({
      certificate_name: license.certificateName,
      certified_date: license.certifiedDate,
      score: license.score,
      note: license.note,
    })),
    works: appModel.works?.map(work => ({
      company: work.company,
      job_industry: work.jobIndustry,
      job_function: work.jobFunction,
      job_title: work.jobTitle,
      experience_years: work.experienceYears,
      salary: work.salary,
      career_level: work.careerLevel,
      start_month: work.startMonth,
      start_year: work.startYear,
      end_month: work.endMonth,
      end_year: work.endYear,
      note: work.note,
      is_current: work.isCurrent,
      is_new_graduate: work.isNewGraduate,
    })),
    experience_years: appModel.experienceYears,
    is_active: appModel.isActive,
    is_searchable: appModel.isSearchable,
    status: appModel.status,
    created_by: creatorRef,
    updated_by: updatorRef,
    created_at: Timestamp.now(),
    updated_at: Timestamp.now(),
    is_onboarded: appModel.isOnboarded || false,
    is_verified: appModel.isVerified || false,
    is_preference_set: appModel.isPreferenceSet || false,
    is_first_applicantion_rewarded: appModel.isFirstApplicantionRewarded || false,
    is_first_interviewer_rewarded: appModel.isFirstInterviewerRewarded || false,
    is_new_user_rewarded: appModel.isNewUserRewarded || false,
    is_resume_completed: appModel.isResumeCompleted || false,
  };
}

// Create and export the repository
export const candidateInformationRepository: IRepository<FirebaseCandidateData> = createRepository<FirebaseCandidateData, FirebaseCandidateInformationType>(
  'candidate_information',
  transformToAppModel,
  transformToFirebaseModel
);