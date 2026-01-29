"use server";

import { Filter } from "firebase-admin/firestore";

import { FirebaseCandidateData } from "@/types/candidate.types";

import { candidateInformationRepository } from "../repositories/candidate-information-repository";

const webCandidateInformationGetById = async (uid: string) => {
  try {
    return await candidateInformationRepository.getById(uid);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

const webCandidateInformationGetByFilter = async (filter?: Filter) => {
  try {
    return await candidateInformationRepository.getByFilter(filter);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

const webCandidateInformationCreate = async (
  payload: Omit<FirebaseCandidateData, "uid" | "createdAt" | "updatedAt">,
  actorId: string,
  uid?: string
) => {
  try {
    const fullPayload: FirebaseCandidateData = {
      ...payload,
      uid: uid || "",
      createdAt: 0,
      updatedAt: 0,
    };
    return await candidateInformationRepository.create(fullPayload, actorId, uid);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

const webCandidateInformationUpdate = async (
  payload: Omit<FirebaseCandidateData, "uid" | "createdAt" | "updatedAt">,
  actorId: string,
  uid: string
) => {
  try {
    const fullPayload: FirebaseCandidateData = {
      ...payload,
      uid,
      createdAt: 0,
      updatedAt: 0,
    };
    return await candidateInformationRepository.update(uid, fullPayload, actorId);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};


const webCandidateInformationDelete = async (uid: string) => {
  try {
    return await candidateInformationRepository.delete(uid);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

/**
 * CAND-R02: Save personal information (Step 1)
 * Partial update for profile creation wizard
 */
const webCandidateSavePersonalInfo = async (
  uid: string,
  data: {
    title_prefix?: string;
    first_name_th: string;
    last_name_th: string;
    nick_name_th?: string;
    email: string;
    phone_number?: string;
    phone?: string;
    birthdate?: string;
    gender?: string;
    marital_status?: string;
    province: string;
    district?: string;
    sub_district?: string;
    address_line_1?: string;
    post_code?: string;
  },
  actorId: string
) => {
  try {
    // Get existing record
    const existing = await candidateInformationRepository.getById(uid);

    // Convert birthdate string to Timestamp (if provided)
    const birthdateTimestamp = data.birthdate ? new Date(data.birthdate).getTime() : undefined;

    // Support both phone_number and phone field names
    const phoneNumber = data.phone_number || data.phone;

    // Merge with existing data
    const payload: FirebaseCandidateData = {
      ...(existing || {}),
      uid,
      titlePrefix: data.title_prefix,
      firstnameTH: data.first_name_th,
      lastnameTH: data.last_name_th,
      nicknameTH: data.nick_name_th,
      email: data.email,
      phone: phoneNumber,
      birthdate: birthdateTimestamp,
      gender: data.gender,
      maritalStatus: data.marital_status,
      province: data.province,
      district: data.district,
      addressLine1: data.address_line_1,
      postCode: data.post_code,
      isActive: existing?.isActive ?? true,
      isSearchable: existing?.isSearchable ?? false,
      createdAt: existing?.createdAt || 0,
      updatedAt: 0,
    };

    // Update or create
    if (existing) {
      return await candidateInformationRepository.update(uid, payload, actorId);
    } else {
      return await candidateInformationRepository.create(payload, actorId, uid);
    }
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

/**
 * CAND-R02: Get personal information for wizard
 */
const webCandidateGetPersonalInfo = async (uid: string) => {
  try {
    const data = await candidateInformationRepository.getById(uid);

    if (!data) {
      return null;
    }

    // Convert Timestamp to ISO string for form
    const birthdate = data.birthdate
      ? new Date(data.birthdate * 1000).toISOString().split('T')[0]
      : undefined;

    return {
      title_prefix: data.titlePrefix,
      first_name_th: data.firstnameTH,
      last_name_th: data.lastnameTH,
      nick_name_th: data.nicknameTH,
      email: data.email,
      phone_number: data.phone,
      birthdate,
      gender: data.gender,
      marital_status: data.maritalStatus,
      province: data.province,
      district: data.district,
      address_line_1: data.addressLine1,
      post_code: data.postCode,
    };
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

/**
 * CAND-R02: Save work experience (Step 2 / Work section)
 * Saves work history array to candidate_information.works
 */
const webCandidateSaveWorkExperience = async (
  uid: string,
  works: Array<{
    company: string;
    position: string;
    job_industry?: string;
    job_function?: string;
    start_month: number;
    start_year: number;
    end_month?: number;
    end_year?: number;
    is_current: boolean;
    salary?: number;
    note?: string;
  }>,
  actorId: string
) => {
  try {
    // Get existing record
    const existing = await candidateInformationRepository.getById(uid);

    if (!existing) {
      throw new Error("Candidate information not found");
    }

    // Transform works to Firebase format
    const transformedWorks = works.map(work => ({
      company: work.company,
      jobIndustry: work.job_industry,
      jobFunction: work.job_function,
      jobTitle: work.position,
      salary: work.salary || 0,
      startMonth: work.start_month,
      startYear: work.start_year,
      endMonth: work.end_month,
      endYear: work.end_year,
      isCurrent: work.is_current,
      isNewGraduate: false,
      note: work.note,
    }));

    // Merge with existing data
    const payload: FirebaseCandidateData = {
      ...existing,
      works: transformedWorks,
      updatedAt: 0,
    };

    return await candidateInformationRepository.update(uid, payload, actorId);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

/**
 * CAND-R02: Save education (Step 3 / Education section)
 * Saves education history array to candidate_information.educations
 */
const webCandidateSaveEducation = async (
  uid: string,
  educations: Array<{
    institution: string;
    level: number;
    level_label: string;
    faculty: string;
    minor?: string;
    start_year?: number;
    end_year: number;
    gpa?: string;
    highlights?: string;
  }>,
  actorId: string
) => {
  try {
    // Get existing record
    const existing = await candidateInformationRepository.getById(uid);

    if (!existing) {
      throw new Error("Candidate information not found");
    }

    // Transform educations to Firebase format
    const transformedEducations = educations.map(edu => ({
      institution: edu.institution,
      major: edu.faculty,
      minor: edu.minor,
      educationLevel: edu.level,
      educationLabel: edu.level_label,
      startYear: edu.start_year || edu.end_year - 4, // Estimate if not provided
      endYear: edu.end_year,
      gpax: edu.gpa || "",
      highlights: edu.highlights,
      note: "",
    }));

    // Merge with existing data
    const payload: FirebaseCandidateData = {
      ...existing,
      educations: transformedEducations,
      updatedAt: 0,
    };

    return await candidateInformationRepository.update(uid, payload, actorId);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

/**
 * CAND-R02: Save skills and languages (Step 4 / Skills section)
 * Saves skills and languages arrays to candidate_information
 */
const webCandidateSaveSkills = async (
  uid: string,
  data: {
    skills: Array<{
      name: string;
      level?: string;
      is_certified?: boolean;
      certificate_name?: string;
      certificate_score?: string;
    }>;
    languages: Array<{
      name: string;
      level: string;
      is_certified?: boolean;
      certificate_name?: string;
      certificate_score?: string;
    }>;
  },
  actorId: string
) => {
  try {
    // Get existing record
    const existing = await candidateInformationRepository.getById(uid);

    if (!existing) {
      throw new Error("Candidate information not found");
    }

    // Transform skills to Firebase format
    const transformedSkills = data.skills.map(skill => ({
      skillName: skill.name,
      expertiseLevel: skill.level || "",
      isCertified: skill.is_certified || false,
      skillCertifiedName: skill.certificate_name,
      skillCertifiedScore: skill.certificate_score,
    }));

    // Transform languages to Firebase format
    const transformedLanguages = data.languages.map(lang => ({
      languageName: lang.name,
      languageLevel: lang.level,
      isCertified: lang.is_certified || false,
      languageCertifiedName: lang.certificate_name,
      languageCertifiedScore: lang.certificate_score,
    }));

    // Merge with existing data
    const payload: FirebaseCandidateData = {
      ...existing,
      skills: transformedSkills,
      languages: transformedLanguages,
      updatedAt: 0,
    };

    return await candidateInformationRepository.update(uid, payload, actorId);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

/**
 * CAND-R02: Save about me section
 * Updates about_me and area_of_expertise fields
 */
const webCandidateSaveAboutMe = async (
  uid: string,
  data: {
    about_me?: string;
    area_of_expertise?: string;
    achievement?: string;
  },
  actorId: string
) => {
  try {
    // Get existing record
    const existing = await candidateInformationRepository.getById(uid);

    if (!existing) {
      throw new Error("Candidate information not found");
    }

    // Merge with existing data
    const payload: FirebaseCandidateData = {
      ...existing,
      aboutMe: data.about_me,
      areaOfExpertise: data.area_of_expertise,
      achievement: data.achievement,
      updatedAt: 0,
    };

    return await candidateInformationRepository.update(uid, payload, actorId);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

/**
 * CAND-R02: Set isOnboarded flag
 * Sets is_onboarded to true in candidate_information
 * Note: Also needs to be set in user_info collection (handled separately)
 */
const webCandidateSetIsOnboarded = async (
  uid: string,
  value: boolean,
  actorId: string
) => {
  try {
    // Get existing record
    const existing = await candidateInformationRepository.getById(uid);

    if (!existing) {
      throw new Error("Candidate information not found");
    }

    // Merge with existing data
    const payload: FirebaseCandidateData = {
      ...existing,
      isOnboarded: value,
      updatedAt: 0,
    };

    return await candidateInformationRepository.update(uid, payload, actorId);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

/**
 * CAND-R02: Toggle isSearchable flag
 * Sets is_searchable in candidate_information
 */
const webCandidateSetIsSearchable = async (
  uid: string,
  value: boolean,
  actorId: string
) => {
  try {
    // Get existing record
    const existing = await candidateInformationRepository.getById(uid);

    if (!existing) {
      throw new Error("Candidate information not found");
    }

    // Merge with existing data
    const payload: FirebaseCandidateData = {
      ...existing,
      isSearchable: value,
      updatedAt: 0,
    };

    return await candidateInformationRepository.update(uid, payload, actorId);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

/**
 * CAND-R02 Batch 4B: Save profile photo URL
 * Updates resume_photo_url in candidate_information
 */
const webCandidateSaveProfilePhoto = async (
  uid: string,
  photoUrl: string,
  actorId: string
) => {
  try {
    // Get existing record
    const existing = await candidateInformationRepository.getById(uid);

    if (!existing) {
      throw new Error("Candidate information not found");
    }

    // Merge with existing data
    const payload: FirebaseCandidateData = {
      ...existing,
      resumePhotoURL: photoUrl,
      updatedAt: 0,
    };

    return await candidateInformationRepository.update(uid, payload, actorId);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

/**
 * CAND-R03: Update candidate settings
 * Partial update for settings page - supports multiple fields at once
 */
const webCandidateUpdateSettings = async (
  uid: string,
  settings: {
    isSearchable?: boolean;
    autoAttachCoverLetter?: boolean;
    defaultCoverLetter?: string;
    emailJobRecommendations?: boolean;
  },
  actorId: string
) => {
  try {
    // Get existing record
    const existing = await candidateInformationRepository.getById(uid);

    if (!existing) {
      throw new Error("Candidate information not found");
    }

    // Merge with existing data
    const payload: FirebaseCandidateData = {
      ...existing,
      ...(settings.isSearchable !== undefined && { isSearchable: settings.isSearchable }),
      ...(settings.autoAttachCoverLetter !== undefined && { autoAttachCoverLetter: settings.autoAttachCoverLetter }),
      ...(settings.defaultCoverLetter !== undefined && { defaultCoverLetter: settings.defaultCoverLetter }),
      ...(settings.emailJobRecommendations !== undefined && { emailJobRecommendations: settings.emailJobRecommendations }),
      updatedAt: 0,
    };

    return await candidateInformationRepository.update(uid, payload, actorId);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

export {
  webCandidateInformationCreate,
  webCandidateInformationDelete,
  webCandidateInformationGetByFilter,
  webCandidateInformationGetById,
  webCandidateInformationUpdate,
  webCandidateSavePersonalInfo,
  webCandidateGetPersonalInfo,
  webCandidateSaveWorkExperience,
  webCandidateSaveEducation,
  webCandidateSaveSkills,
  webCandidateSaveAboutMe,
  webCandidateSetIsOnboarded,
  webCandidateSetIsSearchable,
  webCandidateSaveProfilePhoto,
  webCandidateUpdateSettings,
};
