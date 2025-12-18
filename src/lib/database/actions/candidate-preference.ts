"use server";

import { Filter } from "firebase-admin/firestore";
import { candidatePreferences } from "@/types/candidate.types";
import { candidatePreferenceRepository } from "../repositories/candidate-preference-repository";

const webCandidatePreferenceGetById = async (uid: string) => {
  try {
    return await candidatePreferenceRepository.getById(uid);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

const webCandidatePreferenceGetByFilter = async (filter?: Filter) => {
  try {
    return await candidatePreferenceRepository.getByFilter(filter);
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
    return await candidatePreferenceRepository.create(payload, actorId, uid);
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
    return await candidatePreferenceRepository.update(uid, payload, actorId);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

/**
 * CAND-R02: Save job preferences (Step 5 / Preferences section)
 * Saves or updates candidate job preferences
 */
const webCandidateSavePreferences = async (
  uid: string,
  data: {
    job_types: string[];
    positions: string[];
    job_functions?: string[];
    job_industries?: string[];
    salary_min: number;
    salary_max: number;
    is_negotiable: boolean;
    locations: string[];
    work_mode?: 'onsite' | 'hybrid' | 'remote' | 'any';
    availability: 'immediately' | '2_weeks' | '1_month' | '2_months_plus';
    expected_start_date?: number;
    i_am?: string;
    i_am_looking_for?: string[];
    i_values?: string[];
    headlines?: string;
  },
  actorId: string
) => {
  try {
    // Get existing preference
    const existing = await candidatePreferenceRepository.getById(uid);

    // Build payload
    const payload: candidatePreferences = {
      uid,
      myPreferredJobs: data.job_types,
      preferredPosition: data.positions.join(', '), // Legacy field
      jobFunction: data.job_functions,
      jobIndustry: data.job_industries,
      expectedSalary: data.salary_min, // Using min as expected
      isNegotiable: data.is_negotiable,
      jobLocation: data.locations.join(', '), // Legacy field
      employment: data.work_mode,
      overheadDays: data.availability,
      expectedStartDate: data.expected_start_date,
      iAm: data.i_am,
      iAmLookingFor: data.i_am_looking_for,
      iValues: data.i_values,
      headlines: data.headlines,
      createdAt: existing?.createdAt || 0,
      updatedAt: 0,
    };

    // Update or create
    if (existing) {
      return await candidatePreferenceRepository.update(uid, payload, actorId);
    } else {
      return await candidatePreferenceRepository.create(payload, actorId, uid);
    }
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

export {
  webCandidatePreferenceCreate,
  webCandidatePreferenceGetByFilter,
  webCandidatePreferenceGetById,
  webCandidatePreferenceUpdate,
  webCandidateSavePreferences,
};
