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
  const userRef = testDb.collection("user_accounts").doc(userRecord.uid);
  await userRef.set({
    uid: userRecord.uid,
    email,
    firstnameTH: "ผู้จัดการ",
    lastnameTH: "ทดสอบ",
    info: {
      uid: userRecord.uid,
      roles: ["company"],
      companyId,
      isOnboarded: true,
    },
    isActive: true,
    isPolicyAccepted: true,
    isTestAccount: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  // 4. Create company_information document
  const companyRef = testDb.collection("company_information").doc(companyId);
  await companyRef.set({
    uid: companyId,
    userId: userRef,
    email,
    companyName: options.companyName || "บริษัททดสอบ จำกัด",
    companyNameEN: options.companyNameEN || "Test Company Ltd.",
    status: options.status || "approved",
    isActive: true,
    isTestAccount: true,
    // Company profile fields
    industry: "เทคโนโลยี",
    companySize: "50-100",
    description: "Test company for E2E testing",
    address: "123 Test Street, Bangkok",
    province: "กรุงเทพมหานคร",
    district: "วัฒนา",
    subDistrict: "คลองตันเหนือ",
    postCode: "10110",
    phone: "021234567",
    createdAt: Date.now(),
    updatedAt: Date.now(),
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
    companyId: companyRef,
    title: `ตำแหน่งทดสอบ ${index + 1}`,
    titleEN: `Test Position ${index + 1}`,
    description: `รายละเอียดตำแหน่งงานทดสอบ ${index + 1}`,
    requirements: "ไม่มีข้อกำหนดพิเศษ",
    status: "published",
    isActive: true,
    // Job details
    employmentType: "full-time",
    workModel: "onsite",
    experienceLevel: "mid",
    minSalary: 30000 + index * 10000,
    maxSalary: 50000 + index * 10000,
    location: "กรุงเทพมหานคร",
    skills: ["JavaScript", "TypeScript"],
    // Company info (denormalized)
    companyName: "บริษัททดสอบ จำกัด",
    companyLogo: null,
    // Test marker
    isTestAccount: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    publishedAt: Date.now(),
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
    companyId: companyRef,
    title,
    titleEN: "Test Position",
    description: "รายละเอียดตำแหน่งงานทดสอบ",
    requirements: "ไม่มีข้อกำหนดพิเศษ",
    status: options.status || "published",
    isActive: options.status === "published",
    employmentType: "full-time",
    workModel: "onsite",
    experienceLevel: "mid",
    minSalary: 30000,
    maxSalary: 60000,
    location: "กรุงเทพมหานคร",
    skills: ["JavaScript", "TypeScript"],
    companyName: options.companyName || "บริษัททดสอบ จำกัด",
    companyLogo: null,
    isTestAccount: true,
    testName: options.testName,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    publishedAt: options.status === "published" ? Date.now() : null,
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
