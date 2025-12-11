import type { MasterJobApplicationStatuses } from "@/constants/application";
import type { LanguageRecord } from "@/lib/validations/candidates/languages-validation";
import type { LicenseRecord } from "@/lib/validations/candidates/licenses-validation";
import type { SkillRecord } from "@/lib/validations/candidates/skills-validation";

import type { userDataProps } from "./auth.types";
import type {
    ContentFlag,
    SuspensionRecord,
    profileVerificationStatus,
} from "./candidate-screening.types";
import type { ActivityLog, companyDataProps } from "./company.types";
import type { IBaseDatabaseInterface, address } from "./database.types";
import type {
    jobApplicationData,
    jobApplicationReturnData,
} from "./job-application.types";
import type {
    IJobPostFilterTypeV3,
    IJobReturnData,
    jobDataProps,
} from "./job.types";

/**
 * @typedef {Object} workHistory - Work history details for a candidate
 * @param {string} company - The name of the company.
 * @param {string} jobIndustry - The industry the job belongs to.
 * @param {string} jobFunction - The function or department of the job.
 * @param {string} jobTitle - The title of the job position.
 * @param {number} experienceYears - Number of years of experience in the role.
 * @param {number[]} salary - An array representing salary history or values.
 * @param {string} careerLevel - The candidate's career level.
 * @param {number} startMonth - The starting month of the job.
 * @param {number} startYear - The starting year of the job.
 * @param {number} endMonth - The ending month of the job.
 * @param {number} endYear - The ending year of the job.
 * @param {string} note - Additional notes about the job.
 * @param {boolean} isCurrent - Whether the job is the candidate's current role.
 * @param {boolean} isNewGraduate - Whether the candidate is a new graduate.
 */
export interface workHistory {
  company: string;
  jobIndustry?: string;
  jobFunction?: string;
  jobTitle: string;
  experienceYears?: number;
  salary: number;
  careerLevel?: string;
  startMonth: number;
  startYear: number;
  endMonth?: number;
  endYear?: number;
  note?: string;
  isCurrent: boolean;
  isNewGraduate: boolean;
}

/**
 * @typedef {Object} educationHistory - Education details for a candidate
 * @param {string} institution - The institution or university name.
 * @param {string} major - The major field of study.
 * @param {string} minor - The minor field of study (optional).
 * @param {string} qualification - The qualification or degree obtained.
 * @param {number} startYear - The starting year of the education.
 * @param {number} endYear - The ending year of the education.
 * @param {string} gpax - Grade Point Average (GPA).
 * @param {string} highlights - Highlights or achievements during education.
 * @param {string} note - Additional notes about the education.
 */
export interface educationHistory {
  institution: string;
  major?: string;
  minor?: string;
  educationLevel: number;
  educationLabel: string;
  startYear: number;
  endYear: number;
  gpax: string;
  highlights?: string;
  note?: string;
}

/**
 * @typedef {Object} candidateSkills - Skills information for a candidate
 * @param {string} skillName - The name of the skill.
 * @param {string} expertiseLevel - The level of expertise in the skill.
 * @param {boolean} [isCertified] - Whether the skill is certified (optional).
 * @param {string} [skillCertifiedScore] - Certified score for the skill (optional).
 * @param {string} [skillCertifiedName] - The name of the certification (optional).
 * @param {number} [expiryDate] - Expiry date of the certification, if any (optional).
 */
export interface candidateSkills {
  skillName: string;
  expertiseLevel: string;
  isCertified: boolean;
  skillCertifiedScore?: string;
  skillCertifiedName?: string;
  expiryDate?: number;
}

/**
 * @typedef {Object} candidateLanguages - Language proficiency information for a candidate
 * @param {string} languageName - The name of the language.
 * @param {string} languageLevel - The level of proficiency in the language.
 * @param {boolean} [isCertified] - Whether the language skill is certified (optional).
 * @param {string} [languageCertifiedScore] - Certified score for the language (optional).
 * @param {string} [languageCertifiedName] - The name of the language certification (optional).
 * @param {number} [expiryDate] - Expiry date of the certification, if any (optional).
 */
export interface candidateLanguages {
  languageName: string;
  languageLevel: string;
  isCertified: boolean;
  languageCertifiedScore?: string;
  languageCertifiedName?: string;
  expiryDate?: number;
}

/**
 * @typedef {Object} candidateLicenses - License and certification information for a candidate
 * @param {string} [certificateName] - The name of the certificate or license (optional).
 * @param {string} [score] - The score achieved in the certification (optional).
 * @param {string} [certifiedDate] - The date when the certificate was issued (optional).
 * @param {number} [expiryDate] - Expiry date of the certification, if any (optional).
 */
export interface candidateLicenses {
  certificateName: string;
  certifiedDate: number;
  score?: string;
  expiryDate?: number;
}

/**
 * @typedef {Object} candidateReferral - Referral information for a candidate
 * @param {string} referCode - The referral code.
 * @param {string} [referLink] - The link for the referral (optional).
 * @param {string} [referBy] - The person who referred the candidate (optional).
 * @param {number} [referDate] - The date when the referral was made (optional).
 * @param {string[]} [referredList] - List of candidates referred (optional).
 */
export interface candidateReferral extends IBaseDatabaseInterface {
  referCode?: string;
  referLink?: string;
  referBy?: string;
  referDate?: number;
  referredList?: string[];
}

/**
 * @typedef {Object} candidatePreferences - Preferences for job search and candidate details
 * @param {string} iAm - The candidate's self-identified role (from dropdown).
 * @param {string[]} iAmLookingFor - The roles the candidate is looking for.
 * @param {string[]} iValues - Values the candidate considers important.
 * @param {string[]} myPreferredJobs - The candidate's preferred job types.
 * @param {string[]} myValues - The candidate's personal values.
 * @param {string} preferredCompany - The candidate's preferred company (currently unused).
 * @param {string} preferredPosition - The candidate's preferred job position (currently unused).
 * @param {number} expectedSalary - The candidate's expected salary.
 * @param {boolean} isNegotiable - Whether the salary is negotiable.
 * @param {string} headlines - A note to the company or potential employer.
 * @param {string} overheadDays - Notice period for availability (0: immediate, 30: 30 days, etc.).
 * @param {number} expectedStartDate - The expected start date (if overheadDays = 365).
 * @param {string} [jobType] - The type of job the candidate is seeking (optional).
 * @param {string} [jobFunction] - The function or department of the job (optional).
 * @param {string} [jobIndustry] - The industry the job belongs to (optional).
 * @param {string} [experience] - The candidate's experience level (optional).
 * @param {string} [employment] - The candidate's preferred employment type (optional).
 */
export interface candidatePreferences extends IBaseDatabaseInterface {
  iAm?: string;
  iAmLookingFor?: string[];
  iValues?: string[];
  myPreferredJobs?: string[];
  myValues?: string[];
  preferredCompany?: string;
  preferredPosition?: string;
  expectedSalary?: number;
  isNegotiable?: boolean;
  headlines?: string;
  overheadDays?: string;
  expectedStartDate?: number;
  jobType?: string;
  jobFunction?: string[];
  jobIndustry?: string[];
  jobLocation?: string;
  experience?: string;
  employment?: string;
}

/**
 * @typedef {Object} FirebaseCandidateData - Comprehensive data about a candidate
 * @param {string} uid - The candidate's unique user ID.
 * @param {string} birthdate - The candidate's birthdate.
 * @param {string} bloodgroup - The candidate's blood group.
 * @param {string} birthplace - The candidate's birthplace.
 * @param {string} religion - The candidate's religion.
 * @param {string} nationality - The candidate's nationality.
 * @param {string} race - The candidate's race.
 * @param {number} height - The candidate's height.
 * @param {number} weight - The candidate's weight.
 * @param {string} maritalStatus - The candidate's marital status.
 * @param {string} millitaryStatus - The candidate's military service status.
 * @param {string} lineId - The candidate's Line ID.
 * @param {string} aboutMe - A brief description of the candidate.
 * @param {string} areaOfExpertise - The candidate's area of expertise.
 * @param {string} achievement - The candidate's key achievements.
 * @param {boolean} hasCar - Whether the candidate has a car.
 * @param {boolean} hasMotorcycle - Whether the candidate has a motorcycle.
 * @param {boolean} isActive - Whether the candidate is currently active.
 * @param {boolean} isSearchable - Whether the candidate is searchable by employers.
 */
export interface FirebaseCandidateData extends IBaseDatabaseInterface {
  uid: string;
  resumePhotoURL?: string;
  firstnameTH?: string;
  lastnameTH?: string;
  nicknameTH?: string;
  email?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  subDistrict?: string;
  district?: string;
  province?: string;
  postCode?: string;
  birthdate?: number;
  bloodgroup?: string;
  birthplace?: string;
  religion?: string;
  nationality?: string;
  race?: string;
  height?: number;
  weight?: number;
  maritalStatus?: string;
  millitaryStatus?: string;
  lineId?: string;
  aboutMe?: string;
  areaOfExpertise?: string;
  achievement?: string;
  hasCar?: boolean;
  hasMotorcycle?: boolean;
  educations?: educationHistory[];
  works?: workHistory[];
  skills?: SkillRecord[];
  languages?: LanguageRecord[];
  licenses?: LicenseRecord[];
  referral?: candidateReferral;
  experienceYears?: number;
  isActive: boolean;
  isSearchable: boolean;
  status?: string;
  isNewUserRewarded?: boolean;
  isOnboarded?: boolean;
  isResumeCompleted?: boolean;
  isVerified?: boolean;
  isPreferenceSet?: boolean;
  isFirstApplicantionRewarded?: boolean;
  isFirstInterviewerRewarded?: boolean;
}

/**
 * @typedef {Object} candidateDataProps - Comprehensive data about a candidate
 * @param {string} uid - The candidate's unique user ID.
 * @param {string} birthdate - The candidate's birthdate.
 * @param {string} bloodgroup - The candidate's blood group.
 * @param {string} birthplace - The candidate's birthplace.
 * @param {string} religion - The candidate's religion.
 * @param {string} nationality - The candidate's nationality.
 * @param {string} race - The candidate's race.
 * @param {number} height - The candidate's height.
 * @param {number} weight - The candidate's weight.
 * @param {string} maritalStatus - The candidate's marital status.
 * @param {string} millitaryStatus - The candidate's military service status.
 * @param {contact} contact - The candidate's contact information (referenced from the contact collection).
 * @param {string} lineId - The candidate's Line ID.
 * @param {address} address - The candidate's address (referenced from the address collection).
 * @param {workHistory[]} [works] - List of the candidate's work history.
 * @param {educationHistory[]} [education] - List of the candidate's education history.
 * @param {candidateSkills[]} [skills] - List of the candidate's skills.
 * @param {candidateLanguages[]} [languages] - List of the candidate's languages.
 * @param {candidateLicenses[]} [licenses] - List of the candidate's licenses and certifications.
 * @param {string} aboutMe - A brief description of the candidate.
 * @param {string} areaOfExpertise - The candidate's area of expertise.
 * @param {string} achievement - The candidate's key achievements.
 * @param {boolean} hasCar - Whether the candidate has a car.
 * @param {boolean} hasMotorcycle - Whether the candidate has a motorcycle.
 * @param {candidateReferral} referral - Referral information (referenced from the referral collection).
 * @param {boolean} isActive - Whether the candidate is currently active.
 * @param {boolean} isSearchable - Whether the candidate is searchable by employers.
 * @param {candidatePreferences} preference - The candidate's job preferences.
 */
export interface candidateDataProps extends IBaseDatabaseInterface {
  resumePhotoURL?: string;
  firstnameTH?: string;
  lastnameTH?: string;
  nicknameTH?: string;
  birthdate?: number;
  email?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  subDistrict?: string;
  district?: string;
  province?: string;
  postCode?: string;
  works?: workHistory[];
  educations?: educationHistory[];
  skills?: candidateSkills[];
  languages?: candidateLanguages[];
  licenses?: candidateLicenses[];
  nationality?: string;
  aboutMe?: string;
  areaOfExpertise?: string;
  achievement?: string;
  hasCar?: boolean;
  hasMotorcycle?: boolean;
  referral?: candidateReferral;
  isActive: boolean;
  isSearchable: boolean;
  preference?: candidatePreferences;
  status?: string;
  lastActive?: number;
  profileStatus?: profileVerificationStatus;
  experienceYears?: number;
  flagCount?: number;
  suspensionHistory?: SuspensionRecord[];
  verificationStatus?: {
    email: boolean;
    phone: boolean;
    identity: boolean;
  };
  riskScore?: number;
  resumeFlags?: ContentFlag[];
  applicationFlags?: ContentFlag[];
  activityLogs?: ActivityLog[];
  isNewUserRewarded?: boolean;
  isOnboarded?: boolean;
  isResumeCompleted?: boolean;
  isVerified?: boolean;
  isPreferenceSet?: boolean;
  isFirstApplicantionRewarded?: boolean;
  isFirstInterviewerRewarded?: boolean;
}

// export interface ICandidateFilterType {
//   page: number;
//   pageSize: number;
//   jobId?: string | string[];
//   keyword?: string | string[];
//   jobIndustries?: string | string[];
//   jobTypes?: string | string[];
//   jobFunctions?: string | string[];
//   educationLevels?: string | string[];
//   experienceYears?: string | string[];
//   workdays?: string | string[];
//   mrtStations?: string | string[];
//   locations?: string | string[];
//   minSalary?: string | string[];
//   maxSalary?: string | string[];
//   languages?: string | string[];
//   skills?: string | string[];
// }

export interface ICandidateSearchFilterType {
  page: number;
  pageSize?: number;
  jobId?: string | string[] | undefined;
  keyword?: string | string[] | undefined;
  educationLevels?: string | string[] | undefined;
  experienceYears?: string | string[] | undefined;
  province?: string | string[] | undefined;
  district?: string | string[] | undefined;
  status?: string | string[] | undefined;
  minSalary?: string | string[] | undefined;
  maxSalary?: string | string[] | undefined;
}
export interface ICandidateFilterTypeV2 {
  keyword?: string | string[];
  candidateId?: string | string[];
  jobIndustries?: string | string[];
  jobTypes?: string | string[];
  jobFunctions?: string | string[];
  educationLevels?: string | string[];
  workdays?: string | string[];
  mrtStations?: string | string[];
  locations?: string | string[];
  minSalary?: string | string[];
  maxSalary?: string | string[];
  languages?: string | string[];
  skills?: string | string[];
  page: number;
  pageSize: number;
}

// export interface ICandidateSearchFilterType extends ICandidateFilterTypeV2 {
//   preference?: {
//     iAm?: string | string[];
//     iAmLookingFor?: string | string[];
//     iValues?: string | string[];
//     myPreferredJobs?: string | string[];
//     myValues?: string | string[];
//     preferredCompany?: string | string[];
//     preferredPosition?: string | string[];
//     expectedSalary?: string | string[];
//     isNegotiable?: boolean;
//     headlines?: string | string[];
//     overheadDays?: string | string[];
//     expectedStartDate?: string | string[];
//     experience?: string | string[];
//     employment?: string | string[];
//   };
//   address?: {
//     province?: string | string[];
//     district?: string | string[];
//   };
// }

export type candidateListProps = {
  id: string;
  name: string;
  data: {
    userInfo: userDataProps;
    candidateInfo: candidateDataProps;
  };
};

export interface ICandidateListProps {
  listCandidates: candidateListProps[];
  selectJobApply: string;
  companyId: string;
  filterParams: IJobPostFilterTypeV3;
  jobs: string;
}

export interface ICandiateSearchResume {
  id: string;
  name: string;
  avatarURL: string | null;
  age: string;
  branch: string;
  date: Date;
  aboutMe?: string;
  educationLevel: string;
  position: string;
  previouslyWorked: string;
  experienceYears: number;
  businessDomain: string;
  address: address;
  resumeStatus: MasterJobApplicationStatuses;
  resumeScore: string;
  salary: string;
  university: string;
  expectdSalary: string;
  candidateInfo: candidateDataProps;
  userInfo: userDataProps;
  applicationInfo?: jobApplicationData;
  jobInfo?: jobDataProps;
}

export interface ICandidateSearchListData {
  id: string;
  data: {
    application: string;
    candidateInfo: string;
    userInfo: string;
  };
}

export interface ICandidateSearchListProps {
  companyId: string;
  jobId: string;
  applicationId: string;
  jobInfo: IJobReturnData;
  companyInfo: companyDataProps;
  jobApp: jobApplicationReturnData;
}

export interface ICandidateListByJobsProps {
  companyId: string;
  totalPages: number;
}

export type EditModalString =
  | "ข้อมูลพื้นฐาน"
  | "Areas of Expertise"
  | "Achievements"
  | "ทักษะ (Skill)"
  | "เกี่ยวกับฉัน (About me)"
  | "ประวัติการศึกษา (Education)"
  | "ประสบการณ์การทำงาน (Work Experience)"
  | "ยืนยันตัวตน"
  | "";
