import type {
  IBaseDatabaseInterface,
  address,
  contact,
} from "./database.types";

/**
 * @typedef {Object} FirebaseCompanyData - Company profile information
 * @param {string} [uid] - The unique user ID of the company (optional).
 * @param {string} companyName - The name of the company.
 * @param {string} shortDescription - A short description of the company.
 * @param {string} industry - The industry in which the company operates.
 * @param {string} overview - A detailed overview of the company.
 * @param {string} taxId - The company's tax identification number.
 * @param {string} website - The company's website URL.
 * @param {string} coverPhoto - The URL of the company's cover photo.
 * @param {string} profilePhoto - The URL of the company's profile photo.
 * @param {string} videoLink - A link to the company's video.
 * @param {string} [companySize] - The size of the company (optional).
 * @param {string} travelMethod - The company's preferred method of travel.
 * @param {string[]} railStation - A list of rail stations near the company.
 * @param {string} travelMode - The mode of travel (e.g., car, bike).
 * @param {string} travelStation - The nearest travel station to the company.
 * @param {string} mapLocation - The company's map location (e.g., Google Maps link).
 * @param {boolean} isActive - Whether the company profile is active.
 * @param {string[]} staff - A list of the company's staff members.
 */
export interface FirebaseCompanyData extends IBaseDatabaseInterface {
  uid: string;
  companyName: string;
  shortDescription?: string;
  shortDescriptionText?: string;
  industry?: string;
  overview?: string;
  overviewText?: string;
  taxId: string;
  website?: string;
  coverPhoto?: string;
  profilePhoto?: string;
  videoLink?: string;
  companySize?: "S" | "M" | "L";
  travelMode?: string;
  travelStation?: string;
  benefitsDetails?: string;
  benefitsText?: string;
  mapLocation?: string;
  status: "pending" | "approved" | "rejected" | "suspended";
  isActive: boolean;
  staff?: string[];
}

/**
 * @typedef {Object} companyDataProps - Company profile information (Full)
 * @param {string} [uid] - The unique user ID of the company (optional).
 * @param {string} companyName - The name of the company.
 * @param {string} shortDescription - A short description of the company.
 * @param {string} industry - The industry in which the company operates.
 * @param {address} address - The company's address, referenced from the address collection.
 * @param {string} overview - A detailed overview of the company.
 * @param {string} taxId - The company's tax identification number.
 * @param {string} website - The company's website URL.
 * @param {string} coverPhoto - The URL of the company's cover photo.
 * @param {string} profilePhoto - The URL of the company's profile photo.
 * @param {string} videoLink - A link to the company's video.
 * @param {string} [companySize] - The size of the company (optional).
 * @param {contact} contact - The company's contact information.
 * @param {string} benefitsDetails - A list of company benefits (optional).
 * @param {string} travelMethod - The company's preferred method of travel.
 * @param {string[]} railStation - A list of rail stations near the company.
 * @param {string} travelMode - The mode of travel (e.g., car, bike).
 * @param {string} travelStation - The nearest travel station to the company.
 * @param {string} mapLocation - The company's map location (e.g., Google Maps link).
 * @param {boolean} isActive - Whether the company profile is active.
 * @param {string[]} staff - A list of the company's staff members.
 */
export interface companyDataProps extends IBaseDatabaseInterface {
  uid: string;
  companyName: string;
  shortDescription?: string;
  industry?: string;
  address?: address;
  overview?: string;
  taxId: string;
  website?: string;
  coverPhoto?: string;
  profilePhoto?: string;
  videoLink?: string;
  companySize?: "S" | "M" | "L";
  contact?: contact;
  benefitsDetails?: string;
  travelMode?: string;
  travelStation?: string;
  mapLocation?: string;
  isActive: boolean;
  status: "pending" | "approved" | "rejected" | "suspended";
  staff?: string[];
  approvedBy?: string;
  approvedAt?: number;
  deletedBy?: string;
  deletedAt?: number;
}

/**
 * @typedef {Object} CompanyEmployeeType - Information about a company employee
 * @param {string} id - The unique identifier for the employee.
 * @param {string} email - The employee's email address?.
 * @param {string} phone - The employee's phone number.
 * @param {string} avatar - The URL of the employee's avatar or profile picture.
 * @param {string} firstnameTh - The employee's first name in Thai.
 * @param {string} firstnameEn - The employee's first name in English.
 * @param {string} lastnameTh - The employee's last name in Thai.
 * @param {string} lastnameEn - The employee's last name in English.
 * @param {string} lineId - The employee's Line ID (social messaging app identifier).
 * @param {string} role - The employee's role or job position in the company.
 * @param {string} status - The employment status of the employee (e.g., active, inactive).
 * @param {string} remark - Additional remarks or comments about the employee.
 * @param {string} companyId - The ID of the company the employee is associated with.
 */
export interface CompanyEmployeeType {
  id: string;
  email: string;
  phone: string;
  avatar: string;
  firstnameTh: string;
  firstnameEn: string;
  lastnameTh: string;
  lastnameEn: string;
  lineId: string;
  role: string;
  status: string;
  remark: string;
  companyId: string;
}

export interface CompanyVerificationType {
  certificateData: File | null;
}

export interface CompanyEmployee {
  name: string;
  role: string;
  status: string;
  joinedDate: string;
}

export interface CompanyJob {
  title: string;
  postedDate: string;
  status: string;
  applications: number;
}

export interface ActivityLog {
  type: "job" | "flag" | "update" | "employee";
  title: string;
  timestamp: string;
  icon?: string;
}

export interface FlaggedContent {
  title: string;
  date: string;
  content: string;
  reason: string;
}
