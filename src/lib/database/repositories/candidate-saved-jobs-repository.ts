import "server-only";

import { Timestamp } from "firebase-admin/firestore";

import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";
import { extractDocumentIdOptional, extractTimestamp } from "@/lib/database/utils/firebase-utils";

import type {
  FirebaseCandidateSavedJobType,
  AppCandidateSavedJobType,
} from "../schemas/candidate-saved-jobs.schema";

import { createRepository } from "./repository-factory";
import type { IRepository } from "./interfaces/repository.interface";

/**
 * Transform Firebase model to App model
 */
function transformToAppModel(
  firebaseModel: FirebaseCandidateSavedJobType,
  createTime?: number,
  updateTime?: number
): AppCandidateSavedJobType {
  return {
    uid: firebaseModel.uid || "",
    candidateId: firebaseModel.candidate_id,
    jobId: firebaseModel.job_id,
    savedAt: extractTimestamp(firebaseModel.saved_at) || 0,
    createdBy: extractDocumentIdOptional(firebaseModel.created_by),
    updatedBy: extractDocumentIdOptional(firebaseModel.updated_by),
    createdAt: createTime || 0,
    updatedAt: updateTime || 0,
  };
}

/**
 * Transform App model to Firebase model
 */
function transformToFirebaseModel(
  appModel: AppCandidateSavedJobType,
  actorId: string,
  isUpdate = false
): FirebaseCandidateSavedJobType {
  const creatorRef = getFirebaseAdminFirestore()
    .collection("user_accounts")
    .doc(isUpdate && appModel.createdBy ? appModel.createdBy : actorId);
  const updatorRef = getFirebaseAdminFirestore()
    .collection("user_accounts")
    .doc(actorId);

  return {
    uid: appModel.uid || "",
    candidate_id: appModel.candidateId,
    job_id: appModel.jobId,
    saved_at: Timestamp.fromMillis(appModel.savedAt),
    created_by: creatorRef,
    created_at: Timestamp.now(),
    updated_by: updatorRef,
    updated_at: Timestamp.now(),
  };
}

/**
 * Create repository instance for candidate_saved_jobs collection
 */
const baseRepository = createRepository<AppCandidateSavedJobType, FirebaseCandidateSavedJobType>(
  "candidate_saved_jobs",
  transformToAppModel,
  transformToFirebaseModel
);

/**
 * Candidate saved jobs repository interface
 * Custom interface for saved jobs operations (does not extend IRepository due to different method signatures)
 */
export interface ICandidateSavedJobsRepository {
  /**
   * Get a saved job by ID
   */
  getById(id: string): Promise<AppCandidateSavedJobType | null>;

  /**
   * Create a new saved job record
   * Uses composite ID: {candidateId}_{jobId} for uniqueness
   */
  create(candidateId: string, jobId: string): Promise<AppCandidateSavedJobType>;

  /**
   * Delete a saved job record
   */
  delete(candidateId: string, jobId: string): Promise<boolean>;

  /**
   * Get all saved jobs for a candidate
   */
  getByCandidateId(candidateId: string): Promise<AppCandidateSavedJobType[]>;

  /**
   * Check if a job is saved by a candidate
   */
  exists(candidateId: string, jobId: string): Promise<boolean>;

  /**
   * Get all saves for a specific job (for analytics)
   */
  getByJobId(jobId: string): Promise<AppCandidateSavedJobType[]>;
}

/**
 * Candidate Saved Jobs Repository
 * Handles CRUD operations for jobs saved/bookmarked by candidates
 */
export const candidateSavedJobsRepository: ICandidateSavedJobsRepository = {
  /**
   * Get a saved job by ID
   * @param id - Composite ID ({candidateId}_{jobId})
   * @returns Saved job record or null if not found
   */
  async getById(id: string): Promise<AppCandidateSavedJobType | null> {
    return await baseRepository.getById(id);
  },

  /**
   * Create a new saved job record
   * @param candidateId - Candidate UID
   * @param jobId - Job UID
   * @returns Created saved job record
   */
  async create(candidateId: string, jobId: string): Promise<AppCandidateSavedJobType> {
    const db = getFirebaseAdminFirestore();
    const compositeId = `${candidateId}_${jobId}`;
    const now = Date.now();

    const appModel: AppCandidateSavedJobType = {
      uid: compositeId,
      candidateId,
      jobId,
      savedAt: now,
      createdBy: candidateId,
      updatedBy: candidateId,
      createdAt: now,
      updatedAt: now,
    };

    const firebaseModel = transformToFirebaseModel(appModel, candidateId, false);

    const docRef = db.collection("candidate_saved_jobs").doc(compositeId);
    await docRef.set(firebaseModel);

    return appModel;
  },

  /**
   * Delete a saved job record
   * @param candidateId - Candidate UID
   * @param jobId - Job UID
   * @returns True if deleted, false if not found
   */
  async delete(candidateId: string, jobId: string): Promise<boolean> {
    const db = getFirebaseAdminFirestore();
    const compositeId = `${candidateId}_${jobId}`;

    const docRef = db.collection("candidate_saved_jobs").doc(compositeId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return false;
    }

    await docRef.delete();
    return true;
  },

  /**
   * Get all saved jobs for a candidate
   * @param candidateId - Candidate UID
   * @returns Array of saved job records
   */
  async getByCandidateId(candidateId: string): Promise<AppCandidateSavedJobType[]> {
    const db = getFirebaseAdminFirestore();
    const querySnapshot = await db
      .collection("candidate_saved_jobs")
      .where("candidate_id", "==", candidateId)
      .orderBy("saved_at", "desc")
      .get();

    return querySnapshot.docs.map((doc) => {
      const data = doc.data() as FirebaseCandidateSavedJobType;
      const createTime = doc.createTime?.toMillis();
      const updateTime = doc.updateTime?.toMillis();
      return transformToAppModel(data, createTime, updateTime);
    });
  },

  /**
   * Check if a job is saved by a candidate
   * @param candidateId - Candidate UID
   * @param jobId - Job UID
   * @returns True if saved, false otherwise
   */
  async exists(candidateId: string, jobId: string): Promise<boolean> {
    const db = getFirebaseAdminFirestore();
    const compositeId = `${candidateId}_${jobId}`;

    const docRef = db.collection("candidate_saved_jobs").doc(compositeId);
    const doc = await docRef.get();

    return doc.exists;
  },

  /**
   * Get all saves for a specific job (for analytics)
   * @param jobId - Job UID
   * @returns Array of saved job records
   */
  async getByJobId(jobId: string): Promise<AppCandidateSavedJobType[]> {
    const db = getFirebaseAdminFirestore();
    const querySnapshot = await db
      .collection("candidate_saved_jobs")
      .where("job_id", "==", jobId)
      .orderBy("saved_at", "desc")
      .get();

    return querySnapshot.docs.map((doc) => {
      const data = doc.data() as FirebaseCandidateSavedJobType;
      const createTime = doc.createTime?.toMillis();
      const updateTime = doc.updateTime?.toMillis();
      return transformToAppModel(data, createTime, updateTime);
    });
  },
};
