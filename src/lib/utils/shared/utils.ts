/* eslint-disable @typescript-eslint/no-explicit-any */
import { type ClassValue, clsx } from "clsx";
import type { Filter } from "firebase-admin/firestore";
import type { ReadonlyURLSearchParams } from "next/navigation";
import { twMerge } from "tailwind-merge";

import type { userDataProps } from "@/types/auth.types";
import type { candidateDataProps } from "@/types/candidate.types";
import type { companyDataProps } from "@/types/company.types";
import type { IJobEditType } from "@/types/job.types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toSentenceCase(str: string): string {
  return str
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase());
}

export const createUrl = (
  pathname: string,
  params: URLSearchParams | ReadonlyURLSearchParams,
) => {
  const paramsString = params.toString();
  const queryString = `${paramsString.length ? "?" : ""}${paramsString}`;

  return `${pathname}${queryString}`;
};

export function makeid(length: number) {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

export function makeotp(length: number) {
  let result = "";
  const characters = "0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

export function makeReferralCode(length: number) {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

export function timeAgo(timestamp: number): string {
  const now = new Date();
  const pastDate = new Date(timestamp);
  const diffInSeconds = Math.floor((now.getTime() - pastDate.getTime()) / 1000);

  const secondsInMinute = 60;
  const secondsInHour = 3600;
  const secondsInDay = 86400;
  const secondsInMonth = 2592000; // Approximation: 30 days
  const secondsInYear = 31536000; // Approximation: 365 days

  const interval = diffInSeconds;

  if (interval < secondsInMinute) {
    return `${Math.floor(interval)} วินาทีที่ผ่านมา`;
  } else if (interval < secondsInHour) {
    return `${Math.floor(interval / secondsInMinute)} นาทีที่ผ่านมา`;
  } else if (interval < secondsInDay) {
    return `${Math.floor(interval / secondsInHour)} ชั่วโมงที่ผ่านมา`;
  } else if (interval < secondsInMonth) {
    return `${Math.floor(interval / secondsInDay)} วันที่ผ่านมา`;
  } else if (interval < secondsInYear) {
    return `${Math.floor(interval / secondsInMonth)} เดือนที่ผ่านมา`;
  } else {
    return `${Math.floor(interval / secondsInYear)} ปีที่ผ่านมา`;
  }
}

// Corrected implementation
export const fetchDataByFilter = async <T>(
  filter: Filter | undefined,
  fetchFunction: (filter: Filter) => Promise<T[] | null>,
): Promise<T[] | null> => {
  if (filter) {
    const data = await fetchFunction(filter);
    return data;
  } else {
    return null;
  }
};

// Helper function for updating candidate-related data
export const updateFirebaseItem = async <T>(
  items: T[] | undefined,
  updateFunction: (item: T, createdBy: string, uid: string) => Promise<string>,
  uid: string,
) => {
  if (items) {
    return await Promise.all(
      items.map(
        async (item) =>
          await updateFunction(item, (item as any).createdBy, uid),
      ),
    );
  } else {
    return null;
  }
};

// Helper function for creating candidate-related data
export const createFirebaseItem = async <T>(
  items: T[] | undefined,
  createFunction: (item: T, createdBy: string) => Promise<string>,
) => {
  if (items) {
    return await Promise.all(
      items.map(
        async (item) => await createFunction(item, (item as any).createdBy),
      ),
    );
  } else {
    return null;
  }
};

export const seedUserData = (
  uid: string,
  contact: {
    email: string;
    phone: string;
  },
) => {
  const userParams: userDataProps = {
    uid,
    isActive: true,
    email: contact.email,
    phone: contact.phone,
    info: {
      uid,
      roles: ["candidate"],
      currentStep: 0,
      currentStepName: "waiting",
    },
    status: "active",
    createdBy: uid,
    createdAt: Date.now(),
    updatedBy: uid,
    updatedAt: Date.now(),
  };
  return userParams;
};

export const seedCandidateData = (
  uid: string,
  contact: {
    email: string;
    phone: string;
  },
  referrer?: string,
) => {
  const thisUser: candidateDataProps = {
    uid,
    email: contact.email,
    phone: contact.phone,
    isActive: true,
    isSearchable: false,
    birthdate: Date.now(),
    createdBy: uid,
    createdAt: Date.now(),
    updatedBy: uid,
    updatedAt: Date.now(),
    isNewUserRewarded: false,
    isOnboarded: false,
    isResumeCompleted: false,
    isPreferenceSet: false,
    isVerified: false,
    isFirstApplicantionRewarded: false,
    isFirstInterviewerRewarded: false,
    referral: {
      uid,
      referBy: referrer,
      referDate: referrer ? Date.now() : undefined,
      createdBy: uid,
      createdAt: referrer ? Date.now() : 0,
      updatedBy: uid,
      updatedAt: referrer ? Date.now() : 0,
    },
  };
  return thisUser;
};

export const seedJobData = (companyInfo: companyDataProps) => {
  const jobDataProps: IJobEditType = {
    title: "",
    isActive: true,
    isAcceptNewGrads: false,
    isNegotiable: true,
    isOnlineInterview: false,
    companyId: companyInfo.uid,
    companyName: companyInfo.companyName,
    companyLogo: "",
    interviewChannel: "online",
    employment: "fulltime",
    experience: "newbie",
    workDays: "5",
    educationLevel: [],
    minSalary: 0,
    maxSalary: 50000,
    jobStatus: "draft",
    positions: 1,
    reactivatedCount: 0,
    workLocation: "onsite",
    travelMode: "other",
    travelStation: "รถยนต์ส่วนตัว หรือรถจักรยานยนต์ส่วนตัว",
    postStartDate: new Date().getTime(),
    postExpiryDate: new Date().getTime(),
    contact: companyInfo.contact,
    address: companyInfo.address,
  };
  return jobDataProps;
};
