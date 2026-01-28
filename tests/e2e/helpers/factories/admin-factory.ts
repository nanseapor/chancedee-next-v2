/**
 * Factory for creating test admin accounts and pending companies for admin testing
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

// ============================================================================
// Admin User Factory
// ============================================================================

export interface CreateTestAdminOptions {
  /** Custom email (auto-generated if not provided) */
  email?: string;
  /** Password (default: TestPassword123!) */
  password?: string;
  /** Admin display name */
  displayName?: string;
  /** Test name for traceability */
  testName?: string;
  /** Variant identifier */
  variant?: string;
}

export interface TestAdmin {
  /** Firebase Auth UID */
  uid: string;
  /** Login email */
  email: string;
  /** Login password */
  password: string;
  /** Custom token for programmatic sign-in */
  customToken: string;
}

/**
 * Create a test platform admin account with Firebase Auth and Firestore data
 *
 * Admin users have the 'chancedee' role which grants platform admin access.
 *
 * @example
 * // Create basic admin
 * const admin = await createTestAdmin();
 *
 * @example
 * // Create admin with custom name
 * const admin = await createTestAdmin({
 *   displayName: 'Test Admin',
 *   testName: 'company-approval-test',
 * });
 */
export async function createTestAdmin(
  options: CreateTestAdminOptions = {}
): Promise<TestAdmin> {
  const email = options.email || generateTestEmail("admin");
  const password = options.password || "TestPassword123!";

  // 1. Create Firebase Auth user
  const userRecord = await testAuth.createUser({
    email,
    password,
    emailVerified: true,
    displayName: options.displayName || "Platform Admin",
  });

  // 2. Set custom claims (IMPORTANT: marks as test account)
  const claims: TestAccountClaims & { role: string } = {
    isTestAccount: true,
    testSuite: "e2e",
    createdAt: Date.now(),
    testName: options.testName,
    variant: options.variant,
    role: "chancedee",
  };

  await testAuth.setCustomUserClaims(userRecord.uid, claims);

  // 3. Create user_accounts document with chancedee role
  const userRef = testDb.collection("user_accounts").doc(userRecord.uid);
  await userRef.set({
    uid: userRecord.uid,
    email,
    first_name_th: "แอดมิน",
    last_name_th: "ทดสอบ",
    first_name_en: "Admin",
    last_name_en: "Test",
    // User info fields - IMPORTANT: roles includes 'chancedee' for platform admin
    roles: ["chancedee"],
    is_onboarded: true,
    is_active: true,
    is_policy_accepted: true,
    is_test_account: true,
    created_at: now(),
    updated_at: now(),
    created_by: userRecord.uid,
    updated_by: userRecord.uid,
  });

  // 4. Generate custom token for programmatic sign-in
  const customToken = await testAuth.createCustomToken(userRecord.uid);

  return {
    uid: userRecord.uid,
    email,
    password,
    customToken,
  };
}

// ============================================================================
// Pending Company Factory (for admin approval testing)
// ============================================================================

export interface CreateTestPendingCompanyOptions {
  /** Custom email (auto-generated if not provided) */
  email?: string;
  /** Password (default: TestPassword123!) */
  password?: string;
  /** Thai company name */
  companyName?: string;
  /** English company name */
  companyNameEN?: string;
  /** Industry category */
  industry?: string;
  /** Company status (default: pending) */
  status?: "pending" | "approved" | "rejected" | "suspended";
  /** Test name for traceability */
  testName?: string;
  /** Variant identifier */
  variant?: string;
}

export interface TestPendingCompany {
  /** Firebase Auth UID (company admin user) */
  uid: string;
  /** Login email */
  email: string;
  /** Login password */
  password: string;
  /** company_information document ID */
  companyId: string;
  /** Company name (Thai) */
  companyName: string;
  /** Company status */
  status: "pending" | "approved" | "rejected" | "suspended";
  /** Custom token for programmatic sign-in */
  customToken: string;
  /** Registration timestamp */
  registeredAt: number;
}

/**
 * Create a test company with pending status for admin approval testing
 *
 * @example
 * // Create pending company for approval test
 * const company = await createTestPendingCompany();
 *
 * @example
 * // Create suspended company for reactivation test
 * const company = await createTestPendingCompany({
 *   status: 'suspended',
 *   testName: 'reactivation-test',
 * });
 */
export async function createTestPendingCompany(
  options: CreateTestPendingCompanyOptions = {}
): Promise<TestPendingCompany> {
  const email = options.email || generateTestEmail("pending-company");
  const password = options.password || "TestPassword123!";
  const companyId = generateTestId("comp");
  const companyName = options.companyName || "บริษัทรออนุมัติ จำกัด";
  const status = options.status || "pending";
  const registeredAt = Date.now();

  // 1. Create Firebase Auth user
  const userRecord = await testAuth.createUser({
    email,
    password,
    emailVerified: true,
    displayName: companyName,
  });

  // 2. Set custom claims (IMPORTANT: marks as test account)
  const claims: TestAccountClaims & { role: string; companyId: string } = {
    isTestAccount: true,
    testSuite: "e2e",
    createdAt: registeredAt,
    testName: options.testName,
    variant: options.variant,
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
    last_name_th: "รออนุมัติ",
    // User info fields - company role with pending status
    roles: ["company", "pending"],
    company_id: companyRef,
    is_onboarded: false,
    is_active: true,
    is_policy_accepted: true,
    is_test_account: true,
    created_at: now(),
    updated_at: now(),
    created_by: userRecord.uid,
    updated_by: userRecord.uid,
  });

  // 4. Create company_information document with status
  await companyRef.set({
    uid: companyId,
    user_id: userRef,
    email,
    company_name: companyName,
    company_name_en: options.companyNameEN || "Pending Company Ltd.",
    tax_id: `TEST${Date.now()}`,
    status,
    is_active: status !== "suspended",
    is_test_account: true,
    // Company profile fields
    industry: options.industry || "เทคโนโลยี",
    company_size: "S",
    short_description: `บริษัททดสอบสถานะ ${status}`,
    overview: `บริษัททดสอบสำหรับการทดสอบระบบอนุมัติ สถานะ: ${status}`,
    address: "456 Pending Street, Bangkok",
    province: "กรุงเทพมหานคร",
    district: "ปทุมวัน",
    sub_district: "ปทุมวัน",
    post_code: "10330",
    phone: "029876543",
    // Metadata
    created_at: now(),
    updated_at: now(),
    created_by: userRef,
    updated_by: userRef,
    // For rejected/suspended, add reason
    ...(status === "rejected" && {
      rejection_reason: "Test rejection reason",
      rejected_at: now(),
      rejected_by: userRef,
    }),
    ...(status === "suspended" && {
      suspension_reason: "Test suspension reason",
      suspended_at: now(),
      suspended_by: userRef,
    }),
  });

  // 5. Generate custom token for programmatic sign-in
  const customToken = await testAuth.createCustomToken(userRecord.uid);

  return {
    uid: userRecord.uid,
    email,
    password,
    companyId,
    companyName,
    status,
    customToken,
    registeredAt,
  };
}

// ============================================================================
// Predefined Admin Variants
// ============================================================================

export const AdminVariants = {
  /** Basic platform admin */
  basic: () => createTestAdmin(),

  /** Admin for company approval tests */
  forCompanyApproval: (testName?: string) =>
    createTestAdmin({ testName: testName || "company-approval" }),
};

// ============================================================================
// Predefined Company Status Variants (for admin testing)
// ============================================================================

export const AdminCompanyVariants = {
  /** Pending company awaiting approval */
  pending: (testName?: string) =>
    createTestPendingCompany({ status: "pending", testName }),

  /** Approved company */
  approved: (testName?: string) =>
    createTestPendingCompany({ status: "approved", testName }),

  /** Rejected company */
  rejected: (testName?: string) =>
    createTestPendingCompany({ status: "rejected", testName }),

  /** Suspended company */
  suspended: (testName?: string) =>
    createTestPendingCompany({ status: "suspended", testName }),

  /** Create multiple pending companies for list testing */
  bulkPending: async (count: number, testName?: string) => {
    const companies: TestPendingCompany[] = [];
    for (let i = 0; i < count; i++) {
      const company = await createTestPendingCompany({
        companyName: `บริษัทรออนุมัติ ${i + 1} จำกัด`,
        status: "pending",
        testName: testName || "bulk-pending",
        variant: `pending-${i + 1}`,
      });
      companies.push(company);
    }
    return companies;
  },

  /** Create companies with mixed statuses for filter testing */
  mixedStatuses: async (testName?: string) => {
    const pending = await createTestPendingCompany({
      companyName: "บริษัทรออนุมัติ จำกัด",
      status: "pending",
      testName,
      variant: "mixed-pending",
    });
    const approved = await createTestPendingCompany({
      companyName: "บริษัทอนุมัติแล้ว จำกัด",
      status: "approved",
      testName,
      variant: "mixed-approved",
    });
    const rejected = await createTestPendingCompany({
      companyName: "บริษัทถูกปฏิเสธ จำกัด",
      status: "rejected",
      testName,
      variant: "mixed-rejected",
    });
    const suspended = await createTestPendingCompany({
      companyName: "บริษัทถูกระงับ จำกัด",
      status: "suspended",
      testName,
      variant: "mixed-suspended",
    });

    return { pending, approved, rejected, suspended };
  },
};
