/**
 * Factory for creating test candidate accounts
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
  toTimestamp,
  docRef,
  type TestAccountClaims,
} from "../firebase-admin-test";

export interface CreateTestCandidateOptions {
  /** Custom email (auto-generated if not provided) */
  email?: string;
  /** Password (default: TestPassword123!) */
  password?: string;
  /** Thai first name */
  firstnameTH?: string;
  /** Thai last name */
  lastnameTH?: string;
  /** Whether first interview reward already received */
  isFirstInterviewerRewarded?: boolean;
  /** Whether first application reward already received */
  isFirstApplicantionRewarded?: boolean;
  /** Create with complete profile */
  withCompleteProfile?: boolean;
  /** Test name for traceability */
  testName?: string;
  /** Variant identifier */
  variant?: string;
}

export interface TestCandidate {
  /** Firebase Auth UID */
  uid: string;
  /** Login email */
  email: string;
  /** Login password */
  password: string;
  /** candidate_information document ID */
  candidateId: string;
  /** Custom token for programmatic sign-in */
  customToken: string;
}

/**
 * Create a test candidate account with Firebase Auth and Firestore data
 *
 * @example
 * // Create basic candidate
 * const candidate = await createTestCandidate();
 *
 * @example
 * // Create candidate who hasn't received first interview reward
 * const candidate = await createTestCandidate({
 *   isFirstInterviewerRewarded: false,
 *   testName: 'first-interview-reward-test',
 * });
 *
 * @example
 * // Create candidate with complete profile
 * const candidate = await createTestCandidate({
 *   withCompleteProfile: true,
 * });
 */
export async function createTestCandidate(
  options: CreateTestCandidateOptions = {}
): Promise<TestCandidate> {
  const email = options.email || generateTestEmail("candidate");
  const password = options.password || "TestPassword123!";
  const candidateId = generateTestId("cand");

  // 1. Create Firebase Auth user
  const userRecord = await testAuth.createUser({
    email,
    password,
    emailVerified: true, // Skip email verification for tests
    displayName: `${options.firstnameTH || "ทดสอบ"} ${options.lastnameTH || "ผู้สมัคร"}`,
  });

  // 2. Set custom claims (IMPORTANT: marks as test account)
  const claims: TestAccountClaims & { role: string; candidateId: string } = {
    isTestAccount: true,
    testSuite: "e2e",
    createdAt: Date.now(),
    testName: options.testName,
    variant: options.variant,
    role: "candidate",
    candidateId,
  };

  await testAuth.setCustomUserClaims(userRecord.uid, claims);

  // 3. Create user_accounts document
  const userRef = testDb.collection("user_accounts").doc(userRecord.uid);
  await userRef.set({
    uid: userRecord.uid,
    email,
    firstnameTH: options.firstnameTH || "ทดสอบ",
    lastnameTH: options.lastnameTH || "ผู้สมัคร",
    info: {
      uid: userRecord.uid,
      roles: ["candidate"],
      isOnboarded: options.withCompleteProfile || false,
    },
    isActive: true,
    isPolicyAccepted: true,
    isTestAccount: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  // 4. Create candidate_information document
  const candidateRef = testDb.collection("candidate_information").doc(candidateId);
  const candidateData: Record<string, unknown> = {
    uid: candidateId,
    userId: userRef,
    email,
    firstnameTH: options.firstnameTH || "ทดสอบ",
    lastnameTH: options.lastnameTH || "ผู้สมัคร",
    isFirstInterviewerRewarded: options.isFirstInterviewerRewarded ?? false,
    isFirstApplicantionRewarded: options.isFirstApplicantionRewarded ?? false,
    isNewUserRewarded: false,
    isOnboarded: options.withCompleteProfile || false,
    isResumeCompleted: options.withCompleteProfile || false,
    isVerified: false,
    isPreferenceSet: options.withCompleteProfile || false,
    isActive: true,
    isSearchable: options.withCompleteProfile || false,
    isTestAccount: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  // Add complete profile fields if requested
  if (options.withCompleteProfile) {
    Object.assign(candidateData, {
      phone: "0891234567",
      birthdate: toTimestamp(new Date("1995-01-15")).toMillis(),
      gender: "male",
      titlePrefix: "mr",
      addressLine1: "123 Test Street",
      province: "กรุงเทพมหานคร",
      district: "วัฒนา",
      subDistrict: "คลองตันเหนือ",
      postCode: "10110",
      aboutMe: "Test candidate profile for E2E testing",
      experienceYears: 3,
      educations: [
        {
          institution: "Test University",
          major: "Computer Science",
          educationLevel: 4,
          educationLabel: "ปริญญาตรี",
          startYear: 2013,
          endYear: 2017,
          gpax: "3.50",
        },
      ],
      works: [
        {
          company: "Test Company",
          jobTitle: "Software Developer",
          salary: 50000,
          startMonth: 1,
          startYear: 2018,
          isCurrent: true,
          isNewGraduate: false,
        },
      ],
      preference: {
        expectedSalary: 60000,
        isNegotiable: true,
        overheadDays: "30",
        employment: "full-time",
      },
    });
  }

  await candidateRef.set(candidateData);

  // 5. Generate custom token for programmatic sign-in
  const customToken = await testAuth.createCustomToken(userRecord.uid);

  return {
    uid: userRecord.uid,
    email,
    password,
    candidateId,
    customToken,
  };
}

/**
 * Predefined candidate variants for common test scenarios
 */
export const CandidateVariants = {
  /** Basic candidate with minimal data */
  basic: () => createTestCandidate(),

  /** Candidate with complete profile */
  complete: () => createTestCandidate({ withCompleteProfile: true }),

  /** Candidate eligible for first interview reward */
  firstInterviewEligible: () =>
    createTestCandidate({
      isFirstInterviewerRewarded: false,
      withCompleteProfile: true,
      testName: "first-interview-eligible",
    }),

  /** Candidate who already received first interview reward */
  firstInterviewClaimed: () =>
    createTestCandidate({
      isFirstInterviewerRewarded: true,
      withCompleteProfile: true,
      testName: "first-interview-claimed",
    }),

  /** Candidate eligible for first application reward */
  firstApplicationEligible: () =>
    createTestCandidate({
      isFirstApplicantionRewarded: false,
      withCompleteProfile: true,
      testName: "first-application-eligible",
    }),
};
