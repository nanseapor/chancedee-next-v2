/**
 * CAND-R05: E2E Test Helpers for Saved Jobs
 *
 * Provides test data setup and cleanup for E2E tests
 */

import { getFirebaseAdminFirestore } from '@/lib/firebase/admin';

/**
 * Seed a saved job for a candidate
 * Creates both the job record and saved job record
 */
export async function seedSavedJob(
  candidateId: string,
  options?: {
    jobId?: string;
    title?: string;
    companyName?: string;
    isActive?: boolean;
    jobStatus?: 'draft' | 'published' | 'ontimer' | 'unpublished' | 'closed';
  }
): Promise<{ jobId: string; savedJobId: string }> {
  const db = getFirebaseAdminFirestore();

  // Generate unique job ID
  const jobId = options?.jobId || `test-job-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  const companyId = `test-company-${Date.now()}`;

  // Create minimal company record (if needed)
  const companyRef = db.collection('company_information').doc(companyId);
  await companyRef.set({
    uid: companyId,
    name: options?.companyName || 'Test Company',
    display_name: options?.companyName || 'Test Company',
    created_at: new Date(),
    updated_at: new Date(),
    created_by: db.collection('user_accounts').doc('system'),
    updated_by: db.collection('user_accounts').doc('system'),
  });

  // Create minimal job record
  await db.collection('jobs').doc(jobId).set({
    uid: jobId,
    title: options?.title || 'Test Job Title',
    company_id: companyId,
    company_ref: companyRef,
    company_name: options?.companyName || 'Test Company',
    company_logo: '',
    work_location: 'Bangkok',
    min_salary: 30000,
    max_salary: 50000,
    is_active: options?.isActive ?? true,
    job_status: options?.jobStatus || 'published',
    is_negotiable: false,
    is_online_interview: false,
    phone: '0123456789',
    email: 'test@example.com',
    created_at: new Date(),
    updated_at: new Date(),
    created_by: db.collection('user_accounts').doc('system'),
    updated_by: db.collection('user_accounts').doc('system'),
  });

  // Create saved job record
  const savedJobId = `${candidateId}_${jobId}`;
  await db.collection('candidate_saved_jobs').doc(savedJobId).set({
    candidate_id: candidateId,
    job_id: jobId,
    saved_at: Date.now(),
    created_at: new Date(),
    updated_at: new Date(),
    created_by: db.collection('user_accounts').doc(candidateId),
    updated_by: db.collection('user_accounts').doc(candidateId),
  });

  return { jobId, savedJobId };
}

/**
 * Clean up test saved job and job data
 */
export async function cleanupSavedJob(jobId: string, candidateId: string): Promise<void> {
  const db = getFirebaseAdminFirestore();

  try {
    // Get job's company_id first
    const jobDoc = await db.collection('jobs').doc(jobId).get();
    const companyId = jobDoc.data()?.company_id;

    // Delete saved job record
    const savedJobId = `${candidateId}_${jobId}`;
    await db.collection('candidate_saved_jobs').doc(savedJobId).delete();

    // Delete job record
    await db.collection('jobs').doc(jobId).delete();

    // Delete company record if it exists
    if (companyId) {
      await db.collection('company_information').doc(companyId).delete();
    }
  } catch (error) {
    console.warn(`Failed to cleanup saved job ${jobId}:`, error);
  }
}

/**
 * Clean up multiple saved jobs
 */
export async function cleanupMultipleSavedJobs(jobIds: string[], candidateId: string): Promise<void> {
  await Promise.all(jobIds.map(jobId => cleanupSavedJob(jobId, candidateId)));
}
