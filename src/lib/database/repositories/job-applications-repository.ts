import "server-only";

import { Timestamp, Filter } from "firebase-admin/firestore";

import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";
import { extractDocumentId, extractDocumentIdOptional, extractTimestamp } from "@/lib/database/utils/firebase-utils";

// Import from zod-to-ts schemas instead of old types
import { jobApplicationData } from "@/types/job-application.types";

import { 
  FirebaseJobApplicationType, 
  JobApplicationData,
  JobApplicationStatus,
  convertToLegacyJobApplicationData
} from "../schemas/job-applications.schema";

// Compatibility alias for gradual migration

// Import selective validation utilities
import { validateCriticalFields, ValidationMetrics } from "../utils/selective-validation";

import { createRepository } from "./repository-factory";
import { IRepository } from "./interfaces/repository.interface";

// Transform Firebase model to App model with selective validation (async version)
async function transformToAppModelWithValidation(
  firebaseModel: FirebaseJobApplicationType,
  createTime?: number,
  updateTime?: number
): Promise<JobApplicationData> {
  // Start performance monitoring
  ValidationMetrics.startTimer('job_application_transform');
  
  try {
    // Validate critical fields (status) - this ensures status is safe for UI logic
    await validateCriticalFields<FirebaseJobApplicationType>(
      'job_applications', 
      firebaseModel, 
      { 
        type: 'firebase',
        throwOnCriticalError: true, // Throw if status is invalid
        logWarnings: false // Reduce noise for performance
      }
    );

    return {
      uid: firebaseModel.uid || "", // Placeholder, should always have value from Firestore
      jobId: extractDocumentId(firebaseModel.job_id),
      candidateId: extractDocumentId(firebaseModel.candidate_id),
      hrId: extractDocumentIdOptional(firebaseModel.hr_id),
      companyId: extractDocumentId(firebaseModel.company_id),
      companyName: firebaseModel.company_name,
      chatId: extractDocumentIdOptional(firebaseModel.chat_id),
      status: firebaseModel.status, // Now validated - guaranteed safe for UI logic!
      resumeId: extractDocumentIdOptional(firebaseModel.resume_id),
      expectedSalary: firebaseModel.expected_salary,
      overheadDays: firebaseModel.overhead_days,
      headlines: firebaseModel.headlines,
      isNegotiable: firebaseModel.is_negotiable,
      expectedDate: extractTimestamp(firebaseModel.expected_date),
      rejectFeedback: firebaseModel.reject_feedback,
      isAccepterTerms: firebaseModel.is_accepter_terms,
      appliedCount: firebaseModel.applied_count,
      createdBy: extractDocumentIdOptional(firebaseModel.created_by),
      updatedBy: extractDocumentIdOptional(firebaseModel.updated_by),
      createdAt: createTime || 0,
      updatedAt: updateTime || 0,
    };
  } finally {
    ValidationMetrics.endTimer('job_application_transform');
  }
}

// Synchronous version for backward compatibility (without validation)
function transformToAppModelSync(
  firebaseModel: FirebaseJobApplicationType,
  createTime?: number,
  updateTime?: number
): JobApplicationData {
  return {
    uid: firebaseModel.uid || "", // Placeholder, should always have value from Firestore
    jobId: extractDocumentId(firebaseModel.job_id),
    candidateId: extractDocumentId(firebaseModel.candidate_id),
    hrId: extractDocumentIdOptional(firebaseModel.hr_id),
    companyId: extractDocumentId(firebaseModel.company_id),
    companyName: firebaseModel.company_name,
    chatId: extractDocumentIdOptional(firebaseModel.chat_id),
    status: firebaseModel.status, // Type-safe but not runtime validated
    resumeId: firebaseModel.resume_id?.id,
    expectedSalary: firebaseModel.expected_salary,
    overheadDays: firebaseModel.overhead_days,
    headlines: firebaseModel.headlines,
    isNegotiable: firebaseModel.is_negotiable,
    expectedDate: firebaseModel.expected_date?.toMillis(),
    rejectFeedback: firebaseModel.reject_feedback,
    isAccepterTerms: firebaseModel.is_accepter_terms,
    appliedCount: firebaseModel.applied_count,
    createdBy: extractDocumentIdOptional(firebaseModel.created_by),
    updatedBy: extractDocumentIdOptional(firebaseModel.updated_by),
    createdAt: createTime || 0,
    updatedAt: updateTime || 0,
  };
}

// Transform App model to Firebase model
function transformToFirebaseModel(
  appModel: JobApplicationData,
  actorId: string,
  isUpdate = false
): FirebaseJobApplicationType {
  const creatorRef = getFirebaseAdminFirestore()
    .collection("user_accounts")
    .doc(isUpdate && appModel.createdBy ? appModel.createdBy : actorId);
  const updatorRef = getFirebaseAdminFirestore()
    .collection("user_accounts")
    .doc(actorId);
  const jobRef = getFirebaseAdminFirestore()
    .collection("jobs")
    .doc(appModel.jobId);
  const candidateRef = getFirebaseAdminFirestore()
    .collection("candidate_information")
    .doc(appModel.candidateId);
  const hrRef = appModel.hrId 
    ? getFirebaseAdminFirestore().collection("user_accounts").doc(appModel.hrId) 
    : undefined;
  const companyRef = getFirebaseAdminFirestore()
    .collection("company_information")
    .doc(appModel.companyId);
  const chatRef = appModel.chatId 
    ? getFirebaseAdminFirestore().collection("chats").doc(appModel.chatId) 
    : undefined;
  const resumeRef = appModel.resumeId 
    ? getFirebaseAdminFirestore().collection("candidate_information").doc(appModel.resumeId) 
    : undefined;

  return {
    uid: appModel.uid || "", // Will be overwritten by createDocument() with actual Firestore ID
    created_by: creatorRef,
    created_at: Timestamp.now(),
    updated_by: updatorRef,
    updated_at: Timestamp.now(),
    job_id: jobRef,
    candidate_id: candidateRef,
    hr_id: hrRef,
    company_id: companyRef,
    company_name: appModel.companyName,
    chat_id: chatRef,
    status: appModel.status,
    resume_id: resumeRef,
    expected_salary: appModel.expectedSalary,
    overhead_days: appModel.overheadDays,
    headlines: appModel.headlines,
    is_negotiable: appModel.isNegotiable,
    expected_date: appModel.expectedDate !== undefined 
      ? Timestamp.fromMillis(appModel.expectedDate) 
      : undefined,
    reject_feedback: appModel.rejectFeedback,
    is_accepter_terms: appModel.isAccepterTerms,
    applied_count: appModel.appliedCount,
  };
}

// Create and export the repository using new schema types
export const jobApplicationsRepository: IRepository<JobApplicationData> = createRepository<JobApplicationData, FirebaseJobApplicationType>(
  'job_applications',
  transformToAppModelSync, // Use sync version for repository factory compatibility
  transformToFirebaseModel
);

// Enhanced repository with selective validation for critical operations
export const jobApplicationsRepositoryWithValidation = {
  ...jobApplicationsRepository,
  
  // Enhanced getById with validation
  async getByIdValidated(uid: string): Promise<JobApplicationData | null> {
    const doc = await jobApplicationsRepository.getById(uid);
    if (!doc) return null;
    
    // Re-validate critical fields for this document
    ValidationMetrics.startTimer('job_application_validation');
    try {
      await validateCriticalFields<JobApplicationData>(
        'job_applications',
        doc,
        { 
          type: 'app',
          throwOnCriticalError: true 
        }
      );
      return doc;
    } finally {
      ValidationMetrics.endTimer('job_application_validation');
    }
  },
  
  // Direct Firebase document transformation with validation
  async transformFromFirebaseWithValidation(
    firebaseModel: FirebaseJobApplicationType,
    createTime?: number,
    updateTime?: number
  ): Promise<JobApplicationData> {
    return transformToAppModelWithValidation(firebaseModel, createTime, updateTime);
  }
};

// Export compatibility adapter for gradual migration
export const jobApplicationsRepositoryCompat: IRepository<jobApplicationData> = {
  async getById(id: string): Promise<jobApplicationData | null> {
    const result = await jobApplicationsRepository.getById(id);
    return result ? convertToLegacyJobApplicationData(result) : null;
  },
  
  async getByFilter(filter?: Filter): Promise<jobApplicationData[]> {
    const results = await jobApplicationsRepository.getByFilter(filter);
    return results ? results.map(convertToLegacyJobApplicationData) : [];
  },
  
  async create(model: jobApplicationData, actorId: string, id?: string): Promise<string> {
    // This would need a reverse conversion function for full compatibility
    return jobApplicationsRepository.create(model as JobApplicationData, actorId, id);
  },
  
  async update(id: string, model: jobApplicationData, actorId: string): Promise<string> {
    // This would need a reverse conversion function for full compatibility  
    return jobApplicationsRepository.update(id, model as JobApplicationData, actorId);
  },
  
  async delete(id: string): Promise<void> {
    return jobApplicationsRepository.delete(id);
  },
  
  async deleteByFilter(field: string, value: string): Promise<boolean> {
    return jobApplicationsRepository.deleteByFilter(field, value);
  },
  
  generateId(): string {
    return jobApplicationsRepository.generateId();
  }
};