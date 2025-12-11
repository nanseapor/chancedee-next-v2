import "server-only";

import { Filter } from "firebase-admin/firestore";

import { calWorkHistory } from "@/lib/utils/shared/calculate-work-experience";
import { PerformanceMonitor } from "@/lib/utils/performance-monitor";
import {
  fetchDataByFilter
} from "@/lib/utils/shared/utils";
import { userDataProps } from "@/types/auth.types";
import {
  candidateDataProps,
  FirebaseCandidateData,
} from "@/types/candidate.types";

import {
  webCandidateInformationCreate,
  webCandidateInformationGetByFilter,
  webCandidateInformationGetById,
  webCandidateInformationUpdate,
} from "../actions/candidate-information";
import {
  webCandidatePreferenceCreate,
  webCandidatePreferenceGetByFilter,
  webCandidatePreferenceGetById,
  webCandidatePreferenceUpdate,
} from "../actions/candidate-preference";
import {
  webCandidateReferralCreate,
  webCandidateReferralGetByFilter,
  webCandidateReferralGetById,
  webCandidateReferralUpdate,
} from "../actions/candidate-referral";
import { webCandidateScreeningGetById } from "../actions/candidate-screening";

import { getUserDataPropsById } from "./web-user-data-props";

export const getCandidateDataPropsById = async (uid: string) => {
  return PerformanceMonitor.measure(
    `getCandidateDataPropsById(${uid})`,
    async () => {
      const [
        candidateInformation,
        candidatePreference,
        candidateReferral,
        candidateScreening,
      ] = await Promise.all([
        webCandidateInformationGetById(uid),
        webCandidatePreferenceGetById(uid),
        webCandidateReferralGetById(uid),
        webCandidateScreeningGetById(uid),
      ]);

      if (candidateInformation) {
        const candidate: candidateDataProps = {
          ...candidateInformation,
          lastActive: candidateScreening?.lastActive || Date.now(),
          flagCount: candidateScreening?.flagCount || -1,
          profileStatus: candidateScreening?.profileStatus,
          preference: candidatePreference || undefined,
          referral: candidateReferral || undefined,
          createdAt: candidateInformation.createdAt,
          createdBy: candidateInformation.createdBy,
          updatedAt: candidateInformation.updatedAt,
          updatedBy: candidateInformation.updatedBy,
        };
        return candidate;
      } else {
        console.error(
          "Fetching candidate:",
          "Failed to get candidate data properties by ID: ",
          uid
        );
        return null;
      }
    }
  );
};

export const getCandidateDataPropsByFilter = async (props?: {
  informationFilter?: Filter;
  preferenceFilter?: Filter;
  referralFilter?: Filter;
  addressFilter?: Filter;
  contactFilter?: Filter;
}) => {
  // Helper function to fetch data by filter
  const [
    candidateInformationList,
    candidatePreferenceList,
    candidateReferralList,
  ] = await Promise.all([
    fetchDataByFilter(
      props?.informationFilter,
      webCandidateInformationGetByFilter
    ),
    fetchDataByFilter(
      props?.preferenceFilter,
      webCandidatePreferenceGetByFilter
    ),
    fetchDataByFilter(
      props?.referralFilter,
      webCandidateReferralGetByFilter
    ),
  ]);

  // INTERSECTION LOGIC: Only include UIDs that match ALL provided filters
  const uidSets: Set<string>[] = [];

  // CRITICAL FIX: If a filter is provided, we MUST add its result set (even if empty/null)
  // This ensures proper intersection: if any filter returns no results, final result is empty
  if (props?.informationFilter) {
    uidSets.push(new Set(candidateInformationList?.map(c => c.createdBy).filter(Boolean) as string[] || []));
  }
  if (props?.preferenceFilter) {
    uidSets.push(new Set(candidatePreferenceList?.map(c => c.createdBy).filter(Boolean) as string[] || []));
  }
  if (props?.referralFilter) {
    uidSets.push(new Set(candidateReferralList?.map(c => c.createdBy).filter(Boolean) as string[] || []));
  }

  // If no filters provided, return empty array
  if (uidSets.length === 0) {
    return [];
  }

  // Find intersection: UIDs present in ALL sets
  const uniqueCandidateList = Array.from(uidSets[0]).filter(uid =>
    uidSets.every(set => set.has(uid))
  );

  // Fetch all candidate data in parallel
  const candidateDataPropsList = await Promise.all(
    uniqueCandidateList.map((uid) => getCandidateDataPropsById(uid))
  );

  return candidateDataPropsList.filter(
    (item) => item !== null
  ) as candidateDataProps[];
};

export const createCandidateDataProps = async (
  candidate: candidateDataProps
): Promise<void> => {
  const {
    preference,
    educations,
    works,
    skills,
    languages,
    licenses,
    referral,
    ...information
  } = candidate;

  if (!information.uid) {
    throw new Error("Candidate UID is required");
  }

  const informationToWrite: Omit<FirebaseCandidateData, "uid" | "createdAt" | "updatedAt"> = {
    ...information,
    experienceYears: calWorkHistory(works).workYear,
  };

  // Execute all creates in parallel for efficiency
  await Promise.all([
    webCandidateInformationCreate(informationToWrite, information.uid, information.uid),
    preference ? webCandidatePreferenceCreate(preference, information.uid, information.uid) : Promise.resolve(),
    referral ? webCandidateReferralCreate(referral, information.uid, information.uid) : Promise.resolve(),
  ]);
};

export const updateCandidateDataProps = async (
  uid: string,
  candidate: candidateDataProps
): Promise<void> => {
  const {
    preference,
    referral,
    ...information
  } = candidate;

  if (!uid) {
    throw new Error("Candidate UID is required for update");
  }

  if (!information.uid) {
    information.uid = uid;
  }

  information.email = information.email || "";
  information.phone = information.phone || "";

  const informationToWrite: Omit<FirebaseCandidateData, "uid" | "createdAt" | "updatedAt"> = {
    ...information,
    experienceYears: calWorkHistory(information.works).workYear,
  };

  // Execute all updates in parallel for efficiency
  await Promise.all([
    webCandidateInformationUpdate(informationToWrite, information.uid, uid),
    preference ? webCandidatePreferenceUpdate(preference, information.uid, uid) : Promise.resolve(),
    referral ? webCandidateReferralUpdate(referral, information.uid, uid) : Promise.resolve(),
  ]);
};

// Note: ListCandidateSearch has been moved to @/domains/search/services/server/actions/candidate-list-search
// Please update your imports to use the new location