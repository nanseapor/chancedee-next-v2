/**
 * COMP-R08: Integration Test Helper Functions
 *
 * Provides test data setup and cleanup for integration tests.
 * Creates and manages test data in real Firebase dev database.
 */

import { jobApplicationsRepository } from '@/lib/database/repositories/job-applications-repository';
import { jobsRepository } from '@/lib/database/repositories/jobs-repository';
import { getFirebaseAdminFirestore } from '@/lib/firebase/admin';
import { JobApplicationData } from '@/lib/database/schemas/job-applications.schema';

/**
 * Create a test company in Firebase
 */
export async function createTestCompany(companyId: string, name: string): Promise<void> {
  const db = getFirebaseAdminFirestore();
  await db.collection('company_information').doc(companyId).set({
    uid: companyId,
    name: name,
    display_name: name,
    created_at: new Date(),
    updated_at: new Date(),
    created_by: db.collection('user_accounts').doc('system'),
    updated_by: db.collection('user_accounts').doc('system'),
  });
}

/**
 * Delete test company from Firebase
 */
export async function deleteTestCompany(companyId: string): Promise<void> {
  const db = getFirebaseAdminFirestore();
  await db.collection('company_information').doc(companyId).delete();
}

/**
 * Create a test candidate in Firebase
 */
export async function createTestCandidate(candidateId: string, name: string): Promise<void> {
  const db = getFirebaseAdminFirestore();
  await db.collection('candidate_information').doc(candidateId).set({
    uid: candidateId,
    display_name: name,
    created_at: new Date(),
    updated_at: new Date(),
    created_by: db.collection('user_accounts').doc('system'),
    updated_by: db.collection('user_accounts').doc('system'),
  });
}

/**
 * Delete test candidate from Firebase
 */
export async function deleteTestCandidate(candidateId: string): Promise<void> {
  const db = getFirebaseAdminFirestore();
  await db.collection('candidate_information').doc(candidateId).delete();
}

/**
 * Create a test job in Firebase
 */
export async function createTestJob(jobId: string, companyId: string, title: string): Promise<void> {
  const db = getFirebaseAdminFirestore();
  const companyRef = db.collection('company_information').doc(companyId);

  await db.collection('jobs').doc(jobId).set({
    uid: jobId,
    title: title,
    company_id: companyRef,
    status: 'published',
    created_at: new Date(),
    updated_at: new Date(),
    created_by: db.collection('user_accounts').doc('system'),
    updated_by: db.collection('user_accounts').doc('system'),
  });
}

/**
 * Delete test job from Firebase
 */
export async function deleteTestJob(jobId: string): Promise<void> {
  const db = getFirebaseAdminFirestore();
  await db.collection('jobs').doc(jobId).delete();
}

/**
 * Create a test application in Firebase
 */
export async function createTestApplication(
  applicationId: string,
  companyId: string,
  candidateId: string,
  jobId: string,
  status: 'applied' | 'read' | 'accepted' | 'rejected' = 'applied'
): Promise<void> {
  const db = getFirebaseAdminFirestore();
  const companyRef = db.collection('company_information').doc(companyId);
  const candidateRef = db.collection('candidate_information').doc(candidateId);
  const jobRef = db.collection('jobs').doc(jobId);

  const now = new Date();

  await db.collection('job_applications').doc(applicationId).set({
    uid: applicationId,
    company_id: companyRef,
    candidate_id: candidateRef,
    job_id: jobRef,
    status: status,
    expected_salary: 50000,
    is_negotiable: true,
    overhead_days: 30,
    headlines: 'Test application',
    is_accepter_terms: true,
    applied_count: 1,
    created_at: now,
    updated_at: now,
    created_by: candidateRef,
    updated_by: candidateRef,
  });
}

/**
 * Delete test application from Firebase
 */
export async function deleteTestApplication(applicationId: string): Promise<void> {
  const db = getFirebaseAdminFirestore();
  await db.collection('job_applications').doc(applicationId).delete();
}

/**
 * Get application by ID and return the data
 */
export async function getApplicationById(applicationId: string): Promise<JobApplicationData | null> {
  return await jobApplicationsRepository.getById(applicationId);
}

/**
 * Verify application status in database
 */
export async function verifyApplicationStatus(
  applicationId: string,
  expectedStatus: string
): Promise<boolean> {
  const app = await getApplicationById(applicationId);
  return app?.status === expectedStatus;
}

/**
 * Verify application has chatId
 */
export async function verifyApplicationHasChatId(
  applicationId: string
): Promise<boolean> {
  const app = await getApplicationById(applicationId);
  return !!app?.chatId;
}

/**
 * Verify application has hrId
 */
export async function verifyApplicationHasHrId(
  applicationId: string,
  expectedHrId: string
): Promise<boolean> {
  const app = await getApplicationById(applicationId);
  return app?.hrId === expectedHrId;
}

/**
 * Verify application has reject feedback
 */
export async function verifyApplicationHasRejectFeedback(
  applicationId: string,
  expectedFeedback: string
): Promise<boolean> {
  const app = await getApplicationById(applicationId);
  return app?.rejectFeedback === expectedFeedback;
}

/**
 * Delete all test applications for a company (cleanup helper)
 */
export async function deleteAllTestApplications(companyId: string): Promise<void> {
  const db = getFirebaseAdminFirestore();
  const companyRef = db.collection('company_information').doc(companyId);

  const snapshot = await db.collection('job_applications')
    .where('company_id', '==', companyRef)
    .get();

  const batch = db.batch();
  snapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
  });

  await batch.commit();
}
