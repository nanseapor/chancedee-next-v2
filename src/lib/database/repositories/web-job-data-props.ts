import "server-only";

import { Filter } from "firebase-admin/firestore";

import { fetchDataByFilter } from "@/lib/utils/shared/utils";
import { address, contact } from "@/types/database.types";
import { jobDataProps } from "@/types/job.types";

import {
  webJobCreate,
  webJobGenerateId,
  webJobGetByFilter,
  webJobGetById,
  webJobUpdate,
} from "../actions/jobs";

export const getJobDataPropsById = async (uid: string) => {
  const [data] = await Promise.all([webJobGetById(uid)]);

  if (data) {
    const contactData: contact = {
      email: data.email,
      phone: data.phone,
    };
    const addressData: address = {
      addressLine1: data.addressLine1,
      province: data.province,
      district: data.district,
      subDistrict: data.subDistrict,
      postCode: data.postCode,
    };
    const jobItem: jobDataProps = {
      ...data,
      contact: contactData,
      address: addressData,
    };
    return jobItem;
  } else {
    console.error("Fetched jobs:", "Job data not found for uid:", uid);
    return null;
  }
};

export const getJobDataPropsByIds = async (uid: string[]) => {
  const [jobDataPropsBase] = await Promise.all([
    webJobGetByFilter(Filter.where("is_active", "==", true)),
  ]);

  if (jobDataPropsBase) {
    const job = uid?.map((id) => {
      const [data] = [jobDataPropsBase?.find((job) => id === job.uid)];
      if (data) {
        const contactData: contact = {
          email: data.email,
          phone: data.phone,
        };
        const addressData: address = {
          addressLine1: data.addressLine1,
          province: data.province,
          district: data.district,
          subDistrict: data.subDistrict,
          postCode: data.postCode,
        };
        const jobItem: jobDataProps = {
          ...data,
          contact: contactData,
          address: addressData,
        };
        return jobItem;
      }
      return null;
    });
    return job.filter((item) => item !== null) as jobDataProps[];
  } else {
    console.error("Fetched jobs:", "Job data not found for uid:", uid);
    return null;
  }
};

export const getJobDataPropsByFilter = async (props?: {
  jobFilter?: Filter;
  addressFilter?: Filter;
  contactFilter?: Filter;
  benefitFilter?: Filter;
  jobEducationFilter?: Filter;
}) => {
  // NOTE: addressFilter, contactFilter, benefitFilter, jobEducationFilter are not used
  // because job data is consolidated (address and contact are embedded in job document)
  // These parameters are kept for API compatibility but have no effect

  // Fetch data by filter
  const [joblist] = await Promise.all([
    fetchDataByFilter(props?.jobFilter, webJobGetByFilter),
  ]);

  // For jobs, we only filter by jobFilter since all data is in one collection
  // No intersection logic needed as there's only one filter being applied
  const dataList: string[] = [];

  if (joblist) {
    joblist.forEach((job) => {
      if (job.uid) {
        dataList.push(job.uid);
      }
    });
  }

  // If no jobs found, return empty array
  if (dataList.length === 0) {
    return [];
  }

  // Fetch all job data in parallel
  const jobDataPropsPropsList = await Promise.all(
    dataList.map((uid) => getJobDataPropsById(uid))
  );

  console.log("Fetched jobs:", dataList.length);

  return jobDataPropsPropsList.filter(
    (item) => item !== null
  ) as jobDataProps[];
};

export const createJobDataProps = async (data: jobDataProps): Promise<string> => {
  const { address, contact, ...jobdata } = data;

  const docId = await webJobGenerateId();

  if (!jobdata.createdBy) {
    throw new Error("No createdBy found for jobdata");
  }

  if (!address || !contact) {
    throw new Error("No contact or address found for job");
  }

  const jobDataConsolidated = {
    ...jobdata,
    ...address,
    ...contact,
  };

  // Execute job creation
  await webJobCreate(jobDataConsolidated, jobdata.createdBy, docId);

  // Return the generated job ID for the caller
  return docId;
};

export const updateJobDataProps = async (uid: string, data: jobDataProps): Promise<void> => {
  const { address, contact, ...jobdata } = data;

  if (!uid) {
    throw new Error("Job UID is required for update");
  }

  if (!jobdata.createdBy) {
    throw new Error("No createdBy found for jobdata");
  }

  if (!address || !contact) {
    throw new Error("No contact or address found for job");
  }

  const jobDataConsolidated = {
    ...jobdata,
    ...address,
    ...contact,
  };

  // Execute job update
  await webJobUpdate(jobDataConsolidated, jobdata.createdBy, uid);
};
