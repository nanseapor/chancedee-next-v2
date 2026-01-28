/**
 * Factory for creating test company accounts
 *
 * IMPORTANT: No cleanup per test. All accounts marked with isTestAccount claim.
 * Run cleanup script when data grows large or schema changes.
 */

import {
  testAuth,
  testDb,
  generateTestEmail,
  generateTestId,
  now,
  type TestAccountClaims,
} from "../firebase-admin-test";

export interface CreateTestCompanyOptions {
  /** Custom email (auto-generated if not provided) */
  email?: string;
  /** Password (default: TestPassword123!) */
  password?: string;
  /** Thai company name */
  companyName?: string;
  /** English company name */
  companyNameEN?: string;
  /** Company approval status */
  status?: "pending" | "approved" | "rejected";
  /** Number of published jobs to create */
  withPublishedJobs?: number;
  /** Test name for traceability */
  testName?: string;
  /** Variant identifier */
  variant?: string;
}

export interface TestCompany {
  /** Firebase Auth UID */
  uid: string;
  /** Login email */
  email: string;
  /** Login password */
  password: string;
  /** company_information document ID */
  companyId: string;
  /** Custom token for programmatic sign-in */
  customToken: string;
  /** List of created job IDs (if withPublishedJobs was set) */
  jobIds: string[];
}

/**
 * Create a test company account with Firebase Auth and Firestore data
 *
 * @example
 * // Create basic approved company
 * const company = await createTestCompany();
 *
 * @example
 * // Create company with 3 published jobs
 * const company = await createTestCompany({
 *   withPublishedJobs: 3,
 *   testName: 'job-list-test',
 * });
 *
 * @example
 * // Create pending company
 * const company = await createTestCompany({
 *   status: 'pending',
 * });
 */
export async function createTestCompany(
  options: CreateTestCompanyOptions = {}
): Promise<TestCompany> {
  const email = options.email || generateTestEmail("company");
  const password = options.password || "TestPassword123!";
  const companyId = generateTestId("comp");

  // 1. Create Firebase Auth user
  const userRecord = await testAuth.createUser({
    email,
    password,
    emailVerified: true,
    displayName: options.companyName || "บริษัททดสอบ จำกัด",
  });

  // 2. Set custom claims (IMPORTANT: marks as test account)
  const claims: TestAccountClaims & { role: string; companyId: string } = {
    isTestAccount: true,
    testSuite: "e2e",
    createdAt: Date.now(),
    testName: options.testName,
    variant: options.variant,
    role: "company",
    companyId,
  };

  await testAuth.setCustomUserClaims(userRecord.uid, claims);

  // 3. Create user_accounts document
  // Note: company_id must be a DocumentReference, roles at root level
  const userRef = testDb.collection("user_accounts").doc(userRecord.uid);
  const companyRef = testDb.collection("company_information").doc(companyId);
  await userRef.set({
    uid: userRecord.uid,
    email,
    first_name_th: "ผู้จัดการ",
    last_name_th: "ทดสอบ",
    // User info fields (at root level, not nested)
    // Admin user needs "admin" role for team management permissions
    roles: ["company", "admin"],
    company_id: companyRef,  // Must be DocumentReference for .id extraction
    is_onboarded: true,
    is_active: true,
    is_policy_accepted: true,
    is_test_account: true,
    created_at: now(),
    updated_at: now(),
    created_by: userRecord.uid,
    updated_by: userRecord.uid,
  });

  // 4. Create company_information document (companyRef already created above)
  await companyRef.set({
    uid: companyId,
    user_id: userRef,
    email,
    company_name: options.companyName || "บริษัททดสอบ จำกัด",
    company_name_en: options.companyNameEN || "Test Company Ltd.",
    tax_id: "1234567890123",
    status: options.status || "approved",
    is_active: true,
    is_test_account: true,
    // Company profile fields
    industry: "เทคโนโลยี",
    company_size: "M",
    short_description: "Test company for E2E testing",
    overview: "Test company for E2E testing",
    address: "123 Test Street, Bangkok",
    province: "กรุงเทพมหานคร",
    district: "วัฒนา",
    sub_district: "คลองตันเหนือ",
    post_code: "10110",
    phone: "021234567",
    created_at: now(),
    updated_at: now(),
    created_by: userRef,
    updated_by: userRef,
  });

  // 5. Create published jobs if requested
  const jobIds: string[] = [];
  if (options.withPublishedJobs && options.withPublishedJobs > 0) {
    for (let i = 0; i < options.withPublishedJobs; i++) {
      const jobId = await createTestJobForCompany(companyRef, companyId, i);
      jobIds.push(jobId);
    }
  }

  // 6. Generate custom token for programmatic sign-in
  const customToken = await testAuth.createCustomToken(userRecord.uid);

  return {
    uid: userRecord.uid,
    email,
    password,
    companyId,
    customToken,
    jobIds,
  };
}

/**
 * Create a test job for a company
 */
async function createTestJobForCompany(
  companyRef: FirebaseFirestore.DocumentReference,
  companyId: string,
  index: number
): Promise<string> {
  const jobId = generateTestId("job");
  const jobRef = testDb.collection("jobs").doc(jobId);

  await jobRef.set({
    uid: jobId,
    company_id: companyRef,
    title: `ตำแหน่งทดสอบ ${index + 1}`,
    title_en: `Test Position ${index + 1}`,
    description: `รายละเอียดตำแหน่งงานทดสอบ ${index + 1}`,
    requirements: "ไม่มีข้อกำหนดพิเศษ",
    status: "published",
    is_active: true,
    // Job details
    employment_type: "full-time",
    work_model: "onsite",
    experience_level: "mid",
    min_salary: 30000 + index * 10000,
    max_salary: 50000 + index * 10000,
    location: "กรุงเทพมหานคร",
    skills: ["JavaScript", "TypeScript"],
    // Company info (denormalized)
    company_name: "บริษัททดสอบ จำกัด",
    company_logo: null,
    // Test marker
    is_test_account: true,
    created_at: now(),
    updated_at: now(),
    published_at: now(),
    created_by: null,
    updated_by: null,
  });

  return jobId;
}

/**
 * Create a standalone test job (for specific job-related tests)
 */
export interface CreateTestJobOptions {
  /** Company ID (required) */
  companyId: string;
  /** Company name */
  companyName?: string;
  /** Job title */
  title?: string;
  /** Job status */
  status?: "draft" | "published" | "closed";
  /** Test name for traceability */
  testName?: string;
}

export interface TestJob {
  /** Job document ID */
  jobId: string;
  /** Job title */
  title: string;
}

export async function createTestJob(options: CreateTestJobOptions): Promise<TestJob> {
  const jobId = generateTestId("job");
  const jobRef = testDb.collection("jobs").doc(jobId);
  const companyRef = testDb.collection("company_information").doc(options.companyId);
  const title = options.title || "ตำแหน่งทดสอบ";

  await jobRef.set({
    uid: jobId,
    company_id: companyRef,
    title,
    title_en: "Test Position",
    description: "รายละเอียดตำแหน่งงานทดสอบ",
    requirements: "ไม่มีข้อกำหนดพิเศษ",
    status: options.status || "published",
    is_active: options.status === "published",
    employment_type: "full-time",
    work_model: "onsite",
    experience_level: "mid",
    min_salary: 30000,
    max_salary: 60000,
    location: "กรุงเทพมหานคร",
    skills: ["JavaScript", "TypeScript"],
    company_name: options.companyName || "บริษัททดสอบ จำกัด",
    company_logo: null,
    is_test_account: true,
    test_name: options.testName,
    created_at: now(),
    updated_at: now(),
    published_at: options.status === "published" ? now() : null,
    created_by: null,
    updated_by: null,
  });

  return { jobId, title };
}

/**
 * Predefined company variants for common test scenarios
 */
export const CompanyVariants = {
  /** Basic approved company */
  basic: () => createTestCompany(),

  /** Approved company with profile */
  approved: () => createTestCompany({ status: "approved" }),

  /** Pending approval company */
  pending: () => createTestCompany({ status: "pending" }),

  /** Company with 3 published jobs */
  withJobs: () => createTestCompany({ withPublishedJobs: 3 }),

  /** Company with specific number of jobs */
  withJobCount: (count: number) => createTestCompany({ withPublishedJobs: count }),
};

/**
 * Setup options for E2E tests - extended interface for public profile tests
 */
export interface SetupTestCompanyOptions {
  /** Company approval status */
  status?: "pending" | "approved" | "rejected" | "suspended";
  /** Is company active */
  isActive?: boolean;
  /** Create jobs for the company */
  withJobs?: boolean;
  /** Number of jobs to create */
  jobCount?: number;
  /** Company has logo */
  hasLogo?: boolean;
  /** Company industry */
  industry?: string;
  /** Company website */
  website?: string;
  /** Company address */
  address?: {
    address?: string;
    province?: string;
    district?: string;
    subDistrict?: string;
    postalCode?: string;
  };
  /** Test name for traceability */
  testName?: string;
}

export interface SetupTestCompanyResult {
  /** Company ID */
  companyId: string;
  /** Job IDs if created */
  jobIds: string[];
  /** Cleanup function */
  cleanup: () => Promise<void>;
}

/**
 * Setup a test company for E2E tests with cleanup
 * Extended version of createTestCompany with additional fields for public profile tests
 */
export async function setupTestCompany(
  options: SetupTestCompanyOptions = {}
): Promise<SetupTestCompanyResult> {
  const companyId = generateTestId("comp");
  const email = generateTestEmail("company");

  // 1. Create Firebase Auth user
  const userRecord = await testAuth.createUser({
    email,
    password: "TestPassword123!",
    emailVerified: true,
    displayName: "บริษัททดสอบ จำกัด",
  });

  // 2. Set custom claims
  const claims: TestAccountClaims & { role: string; companyId: string } = {
    isTestAccount: true,
    testSuite: "e2e",
    createdAt: Date.now(),
    testName: options.testName,
    role: "company",
    companyId,
  };
  await testAuth.setCustomUserClaims(userRecord.uid, claims);

  // 3. Create user_accounts document
  const userRef = testDb.collection("user_accounts").doc(userRecord.uid);
  const companyRef = testDb.collection("company_information").doc(companyId);
  await userRef.set({
    uid: userRecord.uid,
    email,
    first_name_th: "ผู้จัดการ",
    last_name_th: "ทดสอบ",
    roles: ["company", "admin"],
    company_id: companyRef,
    is_onboarded: true,
    is_active: true,
    is_policy_accepted: true,
    is_test_account: true,
    created_at: now(),
    updated_at: now(),
    created_by: userRecord.uid,
    updated_by: userRecord.uid,
  });

  // 4. Create company_information document with extended fields
  await companyRef.set({
    uid: companyId,
    user_id: userRef,
    email,
    company_name: "บริษัททดสอบ จำกัด",
    company_name_en: "Test Company Ltd.",
    tax_id: "1234567890123",
    status: options.status || "approved",
    is_active: options.isActive !== false, // default true
    is_test_account: true,
    // Profile fields
    industry: options.industry || "เทคโนโลยี",
    company_size: "M",
    short_description: "Test company for E2E testing",
    overview: "<p>Test company overview</p>",
    benefits_details: "<ul><li>Health Insurance</li></ul>",
    // Logo
    profile_photo: options.hasLogo ? "https://example.com/logo.png" : null,
    cover_photo: null,
    // Contact
    website: options.website || null,
    map_location: "https://maps.google.com/?q=Bangkok",
    travel_mode: "BTS",
    travel_station: "สถานีอโศก",
    // Address
    address: options.address?.address || "123 Test Street",
    province: options.address?.province || "กรุงเทพมหานคร",
    district: options.address?.district || "วัฒนา",
    sub_district: options.address?.subDistrict || "คลองตันเหนือ",
    post_code: options.address?.postalCode || "10110",
    phone: "021234567",
    created_at: now(),
    updated_at: now(),
    created_by: userRef,
    updated_by: userRef,
  });

  // 5. Create jobs if requested
  const jobIds: string[] = [];
  const jobCount = options.withJobs ? (options.jobCount || 1) : 0;
  for (let i = 0; i < jobCount; i++) {
    const jobId = generateTestId("job");
    const jobRef = testDb.collection("jobs").doc(jobId);
    await jobRef.set({
      uid: jobId,
      company_id: companyRef,
      companyId: companyId,
      companyName: "บริษัททดสอบ จำกัด",
      companyLogo: options.hasLogo ? "https://example.com/logo.png" : null,
      title: `ตำแหน่งทดสอบ ${i + 1}`,
      title_en: `Test Position ${i + 1}`,
      description: `รายละเอียดตำแหน่งงานทดสอบ ${i + 1}`,
      requirements: "ไม่มีข้อกำหนดพิเศษ",
      jobStatus: "published",
      isActive: true,
      employment: "Full-time",
      workModel: "onsite",
      experience: "2-5 ปี",
      experienceText: "2-5 ปี",
      minSalary: 30000 + i * 10000,
      maxSalary: 50000 + i * 10000,
      isNegotiable: false,
      workLocation: "กรุงเทพมหานคร",
      skills: ["JavaScript", "TypeScript"],
      is_test_account: true,
      createdAt: Date.now() - i * 86400000, // Stagger creation dates
      updatedAt: Date.now(),
      publishedAt: Date.now(),
    });
    jobIds.push(jobId);
  }

  // 6. Return result with cleanup function
  return {
    companyId,
    jobIds,
    cleanup: async () => {
      // Delete jobs
      for (const jobId of jobIds) {
        await testDb.collection("jobs").doc(jobId).delete();
      }
      // Delete company
      await companyRef.delete();
      // Delete user account
      await userRef.delete();
      // Delete auth user
      await testAuth.deleteUser(userRecord.uid);
    },
  };
}

/**
 * Cleanup function for compatibility (cleanup is returned from setupTestCompany)
 * @deprecated Use the cleanup function returned from setupTestCompany instead
 */
export async function cleanupTestCompany(companyId: string): Promise<void> {
  // This is a fallback - prefer using the cleanup function from setupTestCompany
  const companyRef = testDb.collection("company_information").doc(companyId);
  const companyDoc = await companyRef.get();

  if (companyDoc.exists) {
    // Try to get user ID and delete associated data
    const data = companyDoc.data();
    if (data?.user_id) {
      const userId = typeof data.user_id === "string" ? data.user_id : data.user_id.id;
      await testDb.collection("user_accounts").doc(userId).delete();
      try {
        await testAuth.deleteUser(userId);
      } catch {
        // User might not exist
      }
    }

    // Delete jobs
    const jobsSnapshot = await testDb
      .collection("jobs")
      .where("companyId", "==", companyId)
      .get();
    for (const doc of jobsSnapshot.docs) {
      await doc.ref.delete();
    }

    // Delete company
    await companyRef.delete();
  }
}
