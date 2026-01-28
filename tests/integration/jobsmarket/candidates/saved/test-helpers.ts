/**
 * CAND-R05: Integration Test Helper Functions
 *
 * Provides test data setup and cleanup for saved jobs integration tests.
 */

import { getFirebaseAdminFirestore } from '@/lib/firebase/admin';

/**
 * Create a minimal test company in Firebase
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
 * Create a minimal test job in Firebase jobs collection
 * This is specifically for testing saved jobs functionality
 */
export async function createTestJob(
  jobId: string,
  companyId: string,
  title: string,
  options?: {
    companyName?: string;
    companyLogo?: string;
    location?: string;
    minSalary?: number;
    maxSalary?: number;
    isActive?: boolean;
    jobStatus?: 'draft' | 'published' | 'ontimer' | 'unpublished' | 'closed';
  }
): Promise<void> {
  const db = getFirebaseAdminFirestore();
  const companyRef = db.collection('company_information').doc(companyId);

  await db.collection('jobs').doc(jobId).set({
    uid: jobId,
    title: title,
    company_id: companyId,
    company_ref: companyRef,
    company_name: options?.companyName || 'Test Company',
    company_logo: options?.companyLogo || '',
    work_location: options?.location || 'Bangkok',
    min_salary: options?.minSalary,
    max_salary: options?.maxSalary,
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
}

/**
 * Delete test job from Firebase jobs collection
 */
export async function deleteTestJob(jobId: string): Promise<void> {
  const db = getFirebaseAdminFirestore();
  await db.collection('jobs').doc(jobId).delete();
}
