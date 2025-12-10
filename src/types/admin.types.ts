import type { DeleteAccountProps, SupportTicketProps } from "./auth.types";
import type { IBaseDatabaseInterface } from "./database.types";

export type RequestStatuses = "pending" | "approved" | "rejected" | "suspended";

/**
 * Interface representing a Firebase company account request.
 * Extends the base database interface.
 *
 * @interface FirebaseCompanyAccountRequests
 * @extends {IBaseDatabaseInterface}
 *
 * @param {string} companyName - The name of the company.
 * @param {string} [companyNumber] - The registration number of the company (optional).
 * @param {string} [natureOfBusiness] - The nature of the business (optional).
 * @param {string} [contact] - The contact information (optional).
 * @param {string} firstNameTH - The first name of the requester in Thai.
 * @param {string} lastNameTH - The last name of the requester in Thai.
 * @param {string} [phoneNumber] - The phone number of the requester (optional).
 * @param {string} email - The email address of the requester.
 * @param {RequestStatuses} status - The status of the request.
 * @param {string} [password] - The password for the account (optional).
 * @param {string} id - The unique identifier for the request.
 * @param {string} companyLogo - The URL or path to the company logo.
 * @param {string} [displayName] - The display name of the company (optional).
 * @param {string} [industry] - The industry in which the company operates (optional).
 * @param {string} country - The country where the company is located.
 * @param {string} companySize - The size of the company.
 */
export interface FirebaseCompanyAccountRequests extends IBaseDatabaseInterface {
  companyName: string;
  companyNumber?: string;
  natureOfBusiness?: string;
  contact?: string;
  firstNameTH: string;
  lastNameTH: string;
  phoneNumber?: string;
  email: string;
  status: RequestStatuses;
  password?: string;
  id: string;
  companyLogo: string;
  displayName?: string;
  industry?: string;
  country: string;
  companySize: string;
  attachedFiles?: string[];
}

export interface ICompanyAccountRequests {
  id: string;
  uid: string;
  companyName: string;
  companyLogo: string;
  companyNumber: string;
  industry?: string;
  country: string;
  companySize: string;
  status?: RequestStatuses;
  attachedFiles?: string[];
}

export type SupportTicketListsProps = SupportTicketProps & {
  id: string;
  time: number;
  status: string;
};

export type DeleteAccountListProps = DeleteAccountProps & {
  id: string;
  time: number;
  status: string;
};

export type SetNotificationPageProps = {
  title: string;
  context: string;
  status: string;
  attachedFiles?: string[];
};

export interface FirebaseAdminInvitation extends IBaseDatabaseInterface {
  code: string;
  timestamp: number;
  isUsed: boolean;
}
