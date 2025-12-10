import type { MasterJobApplicationStatuses } from "@/constant/application";

import type { userDataProps } from "./auth.types";
import type { candidateDataProps } from "./candidate.types";
import type {
  IBaseDatabaseInterface,
  address,
  contact,
} from "./database.types";
import type { jobApplicationData } from "./job-application.types";
import type { IJobReturnData } from "./job.types";

export interface FirebaseJobInterviewData extends IBaseDatabaseInterface {
  uid: string;
  jobId: string;
  jobTitle?: string;
  candidateId: string;
  companyId: string;
  candidateName: string;
  companyName: string;
  applicationId: string;
  channel: string;
  status: MasterJobApplicationStatuses;
  appointment: number;
  from: string;
  to: string;
  location: string;
  room?: string;
  note?: string;
  isCancel?: boolean;
  cancelReason?: string;
  isAccepted: boolean;
  rejectFeedback?: string;
}

export interface jobInterviewData extends IBaseDatabaseInterface {
  uid: string;
  jobId: string;
  candidateId: string;
  companyId: string;
  candidateName: string;
  companyName: string;
  applicationId: string;
  channel: string;
  status: MasterJobApplicationStatuses;
  address?: address;
  contact: contact;
  appointment: number;
  from: string;
  to: string;
  location: string;
  room?: string;
  note?: string;
  isCancel: boolean;
  cancelReason: string;
  isAccepted: boolean;
  rejectFeedback?: string;
}

export type interviewConsolidatedDataProps = {
  id: string;
  application: jobApplicationData;
  job: IJobReturnData;
  resume: candidateDataProps;
  info: userDataProps;
};

export type interviewEventData = {
  uid: string;
  name: string;
  from: string;
  to: string;
  location: string;
  room?: string;
  note?: string;
  channel: string;
  time: string;
  title: string;
  date: Date;
  status: MasterJobApplicationStatuses;
  hr: string;
  address?: address;
  contact: contact;
  data: interviewConsolidatedDataProps;
  cancelReason?: string;
};

export interface AppointmentData {
  uid: string;
  applicationId: string;
  appointment: Date;
  candidateId: string;
  candidateName?: string;
  channel: string; // "online" | "onsite"
  companyId: string;
  companyName: string;
  from: Date;
  to: Date;
  jobId: string;
  jobTitle?: string;
  location: string;
  note?: string;
  status: MasterJobApplicationStatuses;
  room?: string;
}
