"use server";

import { Filter } from "firebase-admin/firestore";

import { ConsentRecordAppType, CookiePreferences, ChangeReason } from "@/types/consent.types";
import { COOKIE_POLICY_VERSION } from "@/types/consent.types";

import { consentRecordsRepository, consentRecordsRepositoryExtended } from "../repositories/consent-records-repository";

/**
 * Get consent record by ID
 * @param uid - Consent record ID
 * @returns Consent record or null
 */
const webConsentRecordGetById = async (uid: string): Promise<ConsentRecordAppType | null> => {
  try {
    return await consentRecordsRepository.getById(uid);
  } catch (e) {
    const error = e as Error;
    console.error('Failed to get consent record by ID:', error.message);
    throw error;
  }
};

/**
 * Get consent records by filter
 * @param filter - Firestore filter
 * @returns Array of consent records
 */
const webConsentRecordGetByFilter = async (filter?: Filter): Promise<ConsentRecordAppType[]> => {
  try {
    const result = await consentRecordsRepository.getByFilter(filter);
    return result || [];
  } catch (e) {
    const error = e as Error;
    console.error('Failed to get consent records by filter:', error.message);
    throw error;
  }
};

/**
 * Create new consent record
 * @param payload - Consent record data
 * @param actorId - ID of the actor creating the record
 * @param uid - Optional custom ID
 * @returns Created consent record ID
 */
const webConsentRecordCreate = async (
  payload: ConsentRecordAppType,
  actorId: string,
  uid?: string
): Promise<string> => {
  try {
    return await consentRecordsRepository.create(payload, actorId, uid);
  } catch (e) {
    const error = e as Error;
    console.error('Failed to create consent record:', error.message);
    throw error;
  }
};

/**
 * Update existing consent record
 * @param payload - Updated consent record data
 * @param uid - Consent record ID
 * @param actorId - ID of the actor updating the record
 * @returns Updated consent record ID
 */
const webConsentRecordUpdate = async (
  uid: string,
  payload: Partial<ConsentRecordAppType>,
  actorId: string
): Promise<string> => {
  try {
    return await consentRecordsRepository.update(uid, payload as ConsentRecordAppType, actorId);
  } catch (e) {
    const error = e as Error;
    console.error('Failed to update consent record:', error.message);
    throw error;
  }
};

/**
 * Delete consent record (soft delete by deactivating)
 * @param uid - Consent record ID
 * @param actorId - ID of the actor deleting the record
 * @returns Success status
 */
const webConsentRecordDelete = async (uid: string, actorId: string): Promise<boolean> => {
  try {
    await consentRecordsRepository.delete(uid);
    return true;
  } catch (e) {
    const error = e as Error;
    console.error('Failed to delete consent record:', error.message);
    throw error;
  }
};

/**
 * Get latest active consent for user
 * @param userId - User ID
 * @returns Latest active consent record or null
 */
const webConsentRecordGetLatestByUserId = async (userId: string): Promise<ConsentRecordAppType | null> => {
  try {
    return await consentRecordsRepositoryExtended.getLatestActive(userId);
  } catch (e) {
    const error = e as Error;
    console.error('Failed to get latest consent by user ID:', error.message);
    throw error;
  }
};

/**
 * Get latest active consent for session (anonymous users)
 * @param sessionId - Session ID
 * @returns Latest active consent record or null
 */
const webConsentRecordGetLatestBySessionId = async (sessionId: string): Promise<ConsentRecordAppType | null> => {
  try {
    return await consentRecordsRepositoryExtended.getLatestActive(undefined, sessionId);
  } catch (e) {
    const error = e as Error;
    console.error('Failed to get latest consent by session ID:', error.message);
    throw error;
  }
};

/**
 * Get consent history for user
 * @param userId - User ID
 * @returns Array of all consent records for the user
 */
const webConsentRecordGetHistoryByUserId = async (userId: string): Promise<ConsentRecordAppType[]> => {
  try {
    return await consentRecordsRepositoryExtended.getHistoryByUserId(userId);
  } catch (e) {
    const error = e as Error;
    console.error('Failed to get consent history by user ID:', error.message);
    throw error;
  }
};

/**
 * Create new consent version (updates existing consent)
 * Deactivates old consent and creates new version with audit trail
 * @param preferences - New cookie preferences
 * @param userId - User ID (optional)
 * @param sessionId - Session ID (optional)
 * @param userAgent - User agent string
 * @param ipHash - Hashed IP address
 * @param changeReason - Reason for the change
 * @param actorId - ID of the actor creating the record
 * @returns New consent record
 */
const webConsentRecordCreateVersion = async (
  preferences: CookiePreferences,
  userId: string | undefined,
  sessionId: string | undefined,
  userAgent: string,
  ipHash: string,
  changeReason: ChangeReason = 'user_update',
  actorId: string = 'system'
): Promise<ConsentRecordAppType> => {
  try {
    // Get existing active consent
    const existingConsent = userId 
      ? await webConsentRecordGetLatestByUserId(userId)
      : sessionId 
        ? await webConsentRecordGetLatestBySessionId(sessionId)
        : null;

    // Deactivate existing consent records
    await consentRecordsRepositoryExtended.deactivateExisting(userId, sessionId, actorId);

    // Calculate version number
    const versionNumber = existingConsent ? existingConsent.versionNumber + 1 : 1;

    // Create new consent record
    const newConsent: ConsentRecordAppType = {
      uid: crypto.randomUUID(),
      userId,
      sessionId,
      ipHash,
      userAgent,
      policyVersion: COOKIE_POLICY_VERSION,
      preferences,
      consentMethod: 'settings_page',
      isActive: true,
      parentConsentId: existingConsent?.uid,
      versionNumber,
      changeReason,
      previousPreferences: existingConsent?.preferences,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const createdId = await webConsentRecordCreate(newConsent, actorId);
    
    // Return the created record by fetching it back
    const createdRecord = await webConsentRecordGetById(createdId);
    if (!createdRecord) {
      throw new Error('Failed to retrieve created consent record');
    }
    
    return createdRecord;
  } catch (e) {
    const error = e as Error;
    console.error('Failed to create consent version:', error.message);
    throw error;
  }
};

/**
 * Withdraw all consent for user/session
 * Sets all cookies to essential only and marks as withdrawn
 * @param userId - User ID (optional)
 * @param sessionId - Session ID (optional)
 * @param userAgent - User agent string
 * @param ipHash - Hashed IP address
 * @param actorId - ID of the actor performing withdrawal
 * @returns New consent record with withdrawn status
 */
const webConsentRecordWithdrawAll = async (
  userId: string | undefined,
  sessionId: string | undefined,
  userAgent: string,
  ipHash: string,
  actorId: string = 'system'
): Promise<ConsentRecordAppType> => {
  try {
    const essentialOnlyPreferences: CookiePreferences = {
      essential: true,
      analytics: false,
      marketing: false,
      functional: false,
    };

    return await webConsentRecordCreateVersion(
      essentialOnlyPreferences,
      userId,
      sessionId,
      userAgent,
      ipHash,
      'user_update',
      actorId
    );
  } catch (e) {
    const error = e as Error;
    console.error('Failed to withdraw consent:', error.message);
    throw error;
  }
};

/**
 * Check if consent is valid and up-to-date
 * @param consent - Consent record to validate
 * @returns Boolean indicating if consent is valid
 */
const webConsentRecordIsValid = (consent: ConsentRecordAppType | null): boolean => {
  if (!consent || !consent.isActive) {
    return false;
  }

  // Check if policy version matches current version
  if (consent.policyVersion !== COOKIE_POLICY_VERSION) {
    return false;
  }

  // Check if consent is not expired (1 year)
  const oneYearAgo = Date.now() - (365 * 24 * 60 * 60 * 1000);
  if (consent.createdAt < oneYearAgo) {
    return false;
  }

  return true;
};

/**
 * Get active consents that need re-consent due to policy update
 * @param oldPolicyVersion - Previous policy version
 * @returns Array of consent records that need updating
 */
const webConsentRecordGetExpiredByPolicy = async (oldPolicyVersion: string): Promise<ConsentRecordAppType[]> => {
  try {
    const filter = Filter.and(
      Filter.where('policy_version', '==', oldPolicyVersion),
      Filter.where('is_active', '==', true)
    );
    
    return await webConsentRecordGetByFilter(filter);
  } catch (e) {
    const error = e as Error;
    console.error('Failed to get expired consents by policy:', error.message);
    throw error;
  }
};

export {
  webConsentRecordGetById,
  webConsentRecordGetByFilter,
  webConsentRecordCreate,
  webConsentRecordUpdate,
  webConsentRecordDelete,
  webConsentRecordGetLatestByUserId,
  webConsentRecordGetLatestBySessionId,
  webConsentRecordGetHistoryByUserId,
  webConsentRecordCreateVersion,
  webConsentRecordWithdrawAll,
  webConsentRecordIsValid,
  webConsentRecordGetExpiredByPolicy,
};