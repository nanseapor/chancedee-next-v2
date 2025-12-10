import { Timestamp, DocumentReference, Filter } from "firebase-admin/firestore";

import { extractDocumentIdOptional, extractTimestamp } from "@/lib/database/utils/firebase-utils";

import { ConsentRecordFirebaseType, ConsentRecordAppType } from "../schemas/consent-records.schema";

import { createRepository } from "./repository-factory";

/**
 * Transform Firebase model to App model
 * Converts snake_case Firebase fields to camelCase TypeScript fields
 * Transforms Timestamps to numbers for client consumption
 */
function transformToAppModel(
  firebaseModel: ConsentRecordFirebaseType,
  createTime?: number,
  updateTime?: number
): ConsentRecordAppType {
  return {
    uid: firebaseModel.uid || "", // Placeholder, should always have value from Firestore
    userId: firebaseModel.user_id,
    sessionId: firebaseModel.session_id,
    ipHash: firebaseModel.ip_hash,
    userAgent: firebaseModel.user_agent,
    policyVersion: firebaseModel.policy_version,
    preferences: {
      essential: firebaseModel.preferences.essential,
      analytics: firebaseModel.preferences.analytics,
      marketing: firebaseModel.preferences.marketing,
      functional: firebaseModel.preferences.functional,
    },
    consentMethod: firebaseModel.consent_method,
    withdrawalDate: firebaseModel.withdrawal_date 
      ? extractTimestamp(firebaseModel.withdrawal_date)
      : undefined,
    isActive: firebaseModel.is_active,
    parentConsentId: firebaseModel.parent_consent_id,
    versionNumber: firebaseModel.version_number,
    changeReason: firebaseModel.change_reason,
    previousPreferences: firebaseModel.previous_preferences ? {
      essential: firebaseModel.previous_preferences.essential,
      analytics: firebaseModel.previous_preferences.analytics,
      marketing: firebaseModel.previous_preferences.marketing,
      functional: firebaseModel.previous_preferences.functional,
    } : undefined,
    createdBy: extractDocumentIdOptional(firebaseModel.created_by),
    updatedBy: extractDocumentIdOptional(firebaseModel.updated_by),
    createdAt: createTime || extractTimestamp(firebaseModel.created_at),
    updatedAt: updateTime || extractTimestamp(firebaseModel.updated_at),
  };
}

/**
 * Transform App model to Firebase model
 * Converts camelCase TypeScript fields to snake_case Firebase fields
 * Transforms numbers to Timestamps for Firestore storage
 */
function transformToFirebaseModel(
  appModel: ConsentRecordAppType,
  actorId: string,
  isUpdate = false
): ConsentRecordFirebaseType {
  return {
    uid: appModel.uid || "", // Will be overwritten by createDocument() with actual Firestore ID
    user_id: appModel.userId,
    session_id: appModel.sessionId,
    ip_hash: appModel.ipHash,
    user_agent: appModel.userAgent,
    policy_version: appModel.policyVersion,
    preferences: {
      essential: appModel.preferences.essential,
      analytics: appModel.preferences.analytics,
      marketing: appModel.preferences.marketing,
      functional: appModel.preferences.functional,
    },
    consent_method: appModel.consentMethod,
    withdrawal_date: appModel.withdrawalDate 
      ? Timestamp.fromMillis(appModel.withdrawalDate)
      : undefined,
    is_active: appModel.isActive,
    parent_consent_id: appModel.parentConsentId,
    version_number: appModel.versionNumber,
    change_reason: appModel.changeReason,
    previous_preferences: appModel.previousPreferences ? {
      essential: appModel.previousPreferences.essential,
      analytics: appModel.previousPreferences.analytics,
      marketing: appModel.previousPreferences.marketing,
      functional: appModel.previousPreferences.functional,
    } : undefined,
    created_by: null, // DocumentReference will be set by firebase-utils layer
    updated_by: null, // DocumentReference will be set by firebase-utils layer
    created_at: Timestamp.fromMillis(appModel.createdAt),
    updated_at: Timestamp.fromMillis(appModel.updatedAt),
  };
}

/**
 * Repository for consent records using the factory pattern
 * Provides CRUD operations with automatic model transformations
 */
export const consentRecordsRepository = createRepository<ConsentRecordAppType, ConsentRecordFirebaseType>(
  'consent_records',
  transformToAppModel,
  transformToFirebaseModel
);

/**
 * Specialized repository methods for consent-specific operations
 */
export const consentRecordsRepositoryExtended = {
  ...consentRecordsRepository,

  /**
   * Get active consent records for a specific user
   * @param userId - User ID to filter by
   * @returns Array of active consent records
   */
  async getActiveByUserId(userId: string): Promise<ConsentRecordAppType[]> {
    const filter = {
      where: [
        ['user_id', '==', userId],
        ['is_active', '==', true]
      ]
    };
    const result = await consentRecordsRepository.getByFilter(filter);
    return result || [];
  },

  /**
   * Get consent history for a user (all versions)
   * @param userId - User ID to get history for
   * @returns Array of all consent records (active and inactive)
   */
  async getHistoryByUserId(userId: string): Promise<ConsentRecordAppType[]> {
    const filter = {
      where: [['user_id', '==', userId]],
      orderBy: [['created_at', 'desc']]
    };
    const result = await consentRecordsRepository.getByFilter(filter);
    return result || [];
  },

  /**
   * Get active consent records by session ID (for anonymous users)
   * @param sessionId - Session ID to filter by
   * @returns Array of active consent records
   */
  async getActiveBySessionId(sessionId: string): Promise<ConsentRecordAppType[]> {
    const filter = {
      where: [
        ['session_id', '==', sessionId],
        ['is_active', '==', true]
      ]
    };
    const result = await consentRecordsRepository.getByFilter(filter);
    return result || [];
  },

  /**
   * Get latest active consent for user or session
   * @param userId - User ID (optional)
   * @param sessionId - Session ID (optional)
   * @returns Latest active consent record or null
   */
  async getLatestActive(userId?: string, sessionId?: string): Promise<ConsentRecordAppType | null> {
    if (!userId && !sessionId) {
      throw new Error('Either userId or sessionId must be provided');
    }

    const whereConditions: [string, '==' | '!=' | '<' | '<=' | '>' | '>=' | 'in' | 'not-in', any][] = [['is_active', '==', true]];
    
    if (userId) {
      whereConditions.push(['user_id', '==', userId]);
    } else if (sessionId) {
      whereConditions.push(['session_id', '==', sessionId]);
    }

    const filter = {
      where: whereConditions,
      orderBy: [['created_at', 'desc']],
      limit: 1
    };

    const results = await consentRecordsRepository.getByFilter(filter as Filter);
    return (results && results.length > 0) ? results[0] : null;
  },

  /**
   * Deactivate all existing consent records for a user/session
   * Used before creating a new consent version
   * @param userId - User ID (optional)
   * @param sessionId - Session ID (optional)
   * @param actorId - ID of the actor performing the action
   */
  async deactivateExisting(userId?: string, sessionId?: string, actorId: string = 'system'): Promise<void> {
    const existing = userId 
      ? await this.getActiveByUserId(userId)
      : sessionId 
        ? await this.getActiveBySessionId(sessionId)
        : [];

    const deactivatePromises = existing.map(record => 
      consentRecordsRepository.update(record.uid, {
        isActive: false,
        withdrawalDate: Date.now()
      } as ConsentRecordAppType, actorId)
    );

    await Promise.all(deactivatePromises);
  }
};

export default consentRecordsRepositoryExtended;