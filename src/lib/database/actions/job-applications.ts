"use server";

import { Filter } from "firebase-admin/firestore";

import { MasterJobApplicationStatuses } from "@/constants/application";
import { jobApplicationData } from "@/types/job-application.types";
import { convertStatusToEnum, JobApplicationData } from "@/lib/database/schemas/job-applications.schema";

import { jobApplicationsRepository } from "../repositories/job-applications-repository";
import { jobsRepository } from "../repositories/jobs-repository";

// Convert legacy jobApplicationData to new JobApplicationData schema
function convertLegacyToNewJobApplicationData(legacy: jobApplicationData): JobApplicationData {
  return {
    ...legacy,
    status: legacy.status, // The enum values should be the same
    createdAt: legacy.createdAt || 0, // Ensure required field is present
    updatedAt: legacy.updatedAt || 0, // Ensure required field is present
  };
}

const webJobApplicationGetById = async (uid: string) => {
  try {
    const application = await jobApplicationsRepository.getById(uid);
    if (!application) {
      return null;
    }
    
    // Validate status
    if (!Object.values(MasterJobApplicationStatuses).includes(application.status as MasterJobApplicationStatuses)) {
      throw new Error("Enum status not matched, data is corrupted");
    }
    
    // Fetch job title separately to maintain interface compatibility
    let jobTitle: string | undefined;
    if (application.jobId) {
      const job = await jobsRepository.getById(application.jobId);
      jobTitle = job?.title;
    }
    
    return {
      ...application,
      jobTitle,
    };
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

const webJobApplicationGetByFilter = async (filter?: Filter) => {
  try {
    const applications = await jobApplicationsRepository.getByFilter(filter);
    if (!applications) {
      // console.warn("webJobApplicationGetByFilter is empty");
      // If no applications found, return empty array instead of null
      return null;
    }
    
    // Fetch job titles for all applications in parallel
    const applicationsWithJobTitles = await Promise.all(
      applications.map(async (application) => {
        // Validate status
        if (!Object.values(MasterJobApplicationStatuses).includes(application.status as MasterJobApplicationStatuses)) {
          throw new Error("Enum status not matched, data is corrupted");
        }
        
        // Fetch job title separately to maintain interface compatibility
        let jobTitle: string | undefined;
        if (application.jobId) {
          const job = await jobsRepository.getById(application.jobId);
          jobTitle = job?.title;
        }
        
        return {
          ...application,
          jobTitle,
        };
      })
    );
    
    return applicationsWithJobTitles;
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

const webJobApplicationCreate = async (
  payload: jobApplicationData,
  actorId: string,
  uid?: string
) => {
  try {
    return await jobApplicationsRepository.create(convertLegacyToNewJobApplicationData(payload), actorId, uid);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

const webJobApplicationUpdate = async (
  payload: jobApplicationData,
  actorId: string,
  uid: string
) => {
  try {
    return await jobApplicationsRepository.update(uid, convertLegacyToNewJobApplicationData(payload), actorId);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};


const webJobApplicationDelete = async (uid: string) => {
  try {
    return await jobApplicationsRepository.delete(uid);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

export {
  webJobApplicationCreate,
  webJobApplicationDelete,
  webJobApplicationGetByFilter,
  webJobApplicationGetById,
  webJobApplicationUpdate
};

