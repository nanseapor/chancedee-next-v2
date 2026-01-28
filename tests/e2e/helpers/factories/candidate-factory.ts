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

/**
 * Profile completeness levels
 */
export type ProfileLevel = "minimal" | "basic" | "standard" | "complete";

/**
 * Profile level configurations
 */
export const PROFILE_LEVELS: Record<ProfileLevel, {
  hasBasicInfo: boolean;
  hasPersonalDetails: boolean;
  hasEducation: boolean;
  hasWorkExperience: boolean;
  hasDocuments: boolean;
  profileCompletion: number;
}> = {
  minimal: {
    // Just registered - only email
    hasBasicInfo: false,
    hasPersonalDetails: false,
    hasEducation: false,
    hasWorkExperience: false,
    hasDocuments: false,
    profileCompletion: 10,
  },
  basic: {
    // Filled basic info
    hasBasicInfo: true,        // name, phone
    hasPersonalDetails: false,
    hasEducation: false,
    hasWorkExperience: false,
    hasDocuments: false,
    profileCompletion: 30,
  },
  standard: {
    // Typical user
    hasBasicInfo: true,
    hasPersonalDetails: true,  // birthdate, address
    hasEducation: true,        // 1 entry
    hasWorkExperience: false,
    hasDocuments: false,
    profileCompletion: 60,
  },
  complete: {
    // Fully filled
    hasBasicInfo: true,
    hasPersonalDetails: true,
    hasEducation: true,
    hasWorkExperience: true,
    hasDocuments: true,
    profileCompletion: 100,
  },
};

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
  /** @deprecated Use profileLevel instead */
  withCompleteProfile?: boolean;
  /** Profile completeness level (overrides withCompleteProfile) */
  profileLevel?: ProfileLevel;
  /** Number of work experience entries to create (overrides profileLevel setting) */
  withWorkExperience?: number;
  /** Number of education entries to create (overrides profileLevel setting) */
  withEducation?: number;
  /** Whether to create resume document */
  withResume?: boolean;
  /** Email verified status */
  emailVerified?: boolean;
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
  /** Profile completion percentage */
  profileCompletion: number;
  /** Work experience entry IDs (for data-testid selectors) */
  workExperienceIds: string[];
  /** Education entry IDs (for data-testid selectors) */
  educationIds: string[];
  /** Document IDs (for data-testid selectors) */
  documentIds: string[];
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

  // Determine profile level (profileLevel takes precedence over deprecated withCompleteProfile)
  const profileLevel: ProfileLevel = options.profileLevel
    || (options.withCompleteProfile ? "complete" : "minimal");
  const levelConfig = PROFILE_LEVELS[profileLevel];

  // Track created IDs for test selectors
  const workExperienceIds: string[] = [];
  const educationIds: string[] = [];
  const documentIds: string[] = [];

  // 1. Create Firebase Auth user first (we'll use the UID as candidateId)
  // This matches the production behavior where candidateId === Firebase Auth UID
  const userRecord = await testAuth.createUser({
    email,
    password,
    emailVerified: options.emailVerified ?? true, // Skip email verification for tests by default
    displayName: `${options.firstnameTH || "ทดสอบ"} ${options.lastnameTH || "ผู้สมัคร"}`,
  });

  // Use Firebase Auth UID as candidateId (matches production behavior)
  const candidateId = userRecord.uid;

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
  const isOnboarded = profileLevel === "complete" || profileLevel === "standard";
  const userRef = testDb.collection("user_accounts").doc(userRecord.uid);
  await userRef.set({
    uid: userRecord.uid,
    email,
    first_name_th: options.firstnameTH || "ทดสอบ",
    last_name_th: options.lastnameTH || "ผู้สมัคร",
    roles: ["candidate"],
    is_onboarded: isOnboarded,
    is_active: true,
    is_policy_accepted: true,
    is_test_account: true,
    created_at: now(),
    updated_at: now(),
    created_by: userRecord.uid,
    updated_by: userRecord.uid,
  });

  // 4. Create candidate_information document
  const candidateRef = testDb.collection("candidate_information").doc(candidateId);
  const candidateData: Record<string, unknown> = {
    uid: candidateId,
    user_id: userRef,
    email,
    first_name_th: options.firstnameTH || "ทดสอบ",
    last_name_th: options.lastnameTH || "ผู้สมัคร",
    is_first_interviewer_rewarded: options.isFirstInterviewerRewarded ?? false,
    is_first_applicantion_rewarded: options.isFirstApplicantionRewarded ?? false,
    is_new_user_rewarded: false,
    is_onboarded: isOnboarded,
    is_resume_completed: levelConfig.hasDocuments,
    is_verified: false,
    is_preference_set: profileLevel === "complete",
    is_active: true,
    is_searchable: profileLevel === "complete",
    is_test_account: true,
    created_at: now(),
    updated_at: now(),
    created_by: userRef,
    updated_by: userRef,
  };

  // Add basic info (name, phone) for basic level and above
  if (levelConfig.hasBasicInfo) {
    Object.assign(candidateData, {
      phone_number: "0891234567",
    });
  }

  // Add personal details (birthdate, address) for standard level and above
  if (levelConfig.hasPersonalDetails) {
    Object.assign(candidateData, {
      birthdate: toTimestamp(new Date("1995-01-15")),
      gender: "male",
      title_prefix: "mr",
      address_line_1: "123 Test Street",
      province: "กรุงเทพมหานคร",
      district: "วัฒนา",
      sub_district: "คลองตันเหนือ",
      post_code: "10110",
      about_me: "Test candidate profile for E2E testing",
    });
  }

  // Determine number of education entries to create
  const educationCount = options.withEducation ?? (levelConfig.hasEducation ? 1 : 0);
  if (educationCount > 0) {
    const educations = [];
    for (let i = 0; i < educationCount; i++) {
      const eduId = generateTestId("edu");
      educationIds.push(eduId);
      educations.push({
        id: eduId,
        institution: `Test University ${i + 1}`,
        major: i === 0 ? "Computer Science" : `Test Major ${i + 1}`,
        education_level: 4,
        education_label: "ปริญญาตรี",
        start_year: 2013 - i * 4,
        end_year: 2017 - i * 4,
        gpax: "3.50",
      });
    }
    candidateData.educations = educations;
  }

  // Determine number of work experience entries to create
  const workCount = options.withWorkExperience ?? (levelConfig.hasWorkExperience ? 1 : 0);
  if (workCount > 0) {
    const works = [];
    candidateData.experience_years = workCount * 2; // Approximate years
    for (let i = 0; i < workCount; i++) {
      const workId = generateTestId("work");
      workExperienceIds.push(workId);
      works.push({
        id: workId,
        company: `Test Company ${i + 1}`,
        job_title: i === 0 ? "Software Developer" : `Test Position ${i + 1}`,
        salary: 50000 + i * 10000,
        start_month: 1,
        start_year: 2018 + i * 2,
        is_current: i === 0,
        is_new_graduate: false,
      });
    }
    candidateData.works = works;
  }

  // Add preference for complete level
  if (profileLevel === "complete") {
    candidateData.preference = {
      expected_salary: 60000,
      is_negotiable: true,
      overhead_days: "30",
      employment: "full-time",
    };
  }

  await candidateRef.set(candidateData);

  // 5. Create resume document if requested or if profile level requires it
  if (options.withResume || levelConfig.hasDocuments) {
    const docId = generateTestId("doc");
    documentIds.push(docId);

    // Create a document record in the candidate's documents subcollection
    const docRef = candidateRef.collection("documents").doc(docId);
    await docRef.set({
      id: docId,
      type: "resume",
      name: "test-resume.pdf",
      url: `https://storage.example.com/test/${candidateId}/${docId}.pdf`,
      mime_type: "application/pdf",
      size: 12345,
      is_test_document: true,
      created_at: now(),
      updated_at: now(),
    });
  }

  // 6. Generate custom token for programmatic sign-in
  const customToken = await testAuth.createCustomToken(userRecord.uid);

  return {
    uid: userRecord.uid,
    email,
    password,
    candidateId,
    customToken,
    profileCompletion: levelConfig.profileCompletion,
    workExperienceIds,
    educationIds,
    documentIds,
  };
}

/**
 * Predefined candidate variants for common test scenarios
 */
export const CandidateVariants = {
  /** Just registered - only email, no profile data */
  minimal: () => createTestCandidate({ profileLevel: "minimal" }),

  /** Basic info filled - name and phone only */
  basic: () => createTestCandidate({ profileLevel: "basic" }),

  /** Standard profile - basic + personal + education */
  standard: () => createTestCandidate({ profileLevel: "standard" }),

  /** Fully completed profile - all fields filled */
  complete: () => createTestCandidate({ profileLevel: "complete" }),

  /** Candidate with multiple work experiences */
  experienced: () =>
    createTestCandidate({
      profileLevel: "complete",
      withWorkExperience: 3,
      testName: "experienced-candidate",
    }),

  /** Candidate with multiple education entries */
  multiEducation: () =>
    createTestCandidate({
      profileLevel: "complete",
      withEducation: 2,
      testName: "multi-education-candidate",
    }),

  /** Candidate eligible for first interview reward */
  firstInterviewEligible: () =>
    createTestCandidate({
      isFirstInterviewerRewarded: false,
      profileLevel: "complete",
      testName: "first-interview-eligible",
    }),

  /** Candidate who already received first interview reward */
  firstInterviewClaimed: () =>
    createTestCandidate({
      isFirstInterviewerRewarded: true,
      profileLevel: "complete",
      testName: "first-interview-claimed",
    }),

  /** Candidate eligible for first application reward */
  firstApplicationEligible: () =>
    createTestCandidate({
      isFirstApplicantionRewarded: false,
      profileLevel: "complete",
      testName: "first-application-eligible",
    }),

  /** Fresh graduate with no work experience */
  freshGraduate: () =>
    createTestCandidate({
      profileLevel: "standard",
      withWorkExperience: 0,
      testName: "fresh-graduate",
    }),
};

/**
 * Multi-role user options
 */
export interface CreateTestMultiRoleUserOptions extends CreateTestCandidateOptions {
  /** Company ID to associate with employer role */
  companyId?: string;
  /** Whether to grant admin privileges */
  isAdmin?: boolean;
}

/**
 * Multi-role user result
 */
export interface TestMultiRoleUser extends TestCandidate {
  /** Company ID if employer role is granted */
  companyId: string | null;
  /** Roles assigned to this user */
  roles: string[];
}

/**
 * Create a test user with both candidate and employer roles
 *
 * Used for testing role switching and multi-role permissions.
 *
 * @example
 * const user = await createTestMultiRoleUser({
 *   companyId: company.companyId,
 *   testName: 'multi-role-test',
 * });
 */
export async function createTestMultiRoleUser(
  options: CreateTestMultiRoleUserOptions = {}
): Promise<TestMultiRoleUser> {
  // First create a candidate
  const candidate = await createTestCandidate({
    ...options,
    profileLevel: options.profileLevel || "complete",
  });

  // Update the user to have multiple roles
  const roles = ["candidate"];
  if (options.companyId) {
    roles.push("employer");
  }
  if (options.isAdmin) {
    roles.push("admin");
  }

  // Update user_accounts with additional roles
  const userRef = testDb.collection("user_accounts").doc(candidate.uid);
  await userRef.update({
    roles,
    company_id: options.companyId ? docRef("company_information", options.companyId) : null,
    updated_at: now(),
  });

  // Update custom claims to include all roles
  const existingClaims = (await testAuth.getUser(candidate.uid)).customClaims || {};
  await testAuth.setCustomUserClaims(candidate.uid, {
    ...existingClaims,
    roles,
    companyId: options.companyId || null,
    isAdmin: options.isAdmin || false,
  });

  return {
    ...candidate,
    companyId: options.companyId || null,
    roles,
  };
}
