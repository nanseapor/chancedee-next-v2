/**
 * Factory for creating complete interview test scenarios
 * Creates: Company + Candidate + Job + Application + Chat + Interview
 *
 * IMPORTANT: No cleanup per test. All accounts marked with isTestAccount.
 * Run cleanup script when data grows large or schema changes.
 */

import {
  testDb,
  generateTestId,
  toTimestamp,
  now,
} from "../firebase-admin-test";
import {
  createTestCandidate,
  type TestCandidate,
  type CreateTestCandidateOptions,
} from "./candidate-factory";
import {
  createTestCompany,
  createTestJob,
  type TestCompany,
  type CreateTestCompanyOptions,
} from "./company-factory";

export interface CreateTestInterviewScenarioOptions {
  /** Options for candidate creation */
  candidateOptions?: CreateTestCandidateOptions;
  /** Options for company creation */
  companyOptions?: CreateTestCompanyOptions;
  /** Interview status - note: use "scheduled" for pending interviews that can be confirmed */
  interviewStatus?: "scheduled" | "pending" | "confirmed" | "cancelled" | "rescheduled" | "completed" | "declined";
  /** Application status (defaults to interviewStatus) */
  applicationStatus?: string;
  /** Interview date (defaults to 7 days from now) */
  interviewDate?: Date;
  /** Interview channel */
  channel?: "online" | "onsite";
  /** Test name for traceability */
  testName?: string;
}

export interface TestInterviewScenario {
  /** Created candidate */
  candidate: TestCandidate;
  /** Created company */
  company: TestCompany;
  /** Job ID */
  jobId: string;
  /** Application ID */
  applicationId: string;
  /** Chat room ID */
  chatRoomId: string;
  /** Interview ID */
  interviewId: string;
}

/**
 * Create a complete interview scenario with all dependencies
 *
 * This creates:
 * 1. A company account
 * 2. A candidate account
 * 3. A job posting
 * 4. A job application
 * 5. A chat room between candidate and company
 * 6. An interview in the specified status
 * 7. An interview message in the chat
 *
 * @example
 * // Create scenario for testing interview confirmation
 * const scenario = await createTestInterviewScenario({
 *   candidateOptions: { isFirstInterviewerRewarded: false },
 *   interviewStatus: 'pending',
 *   testName: 'confirm-interview-test',
 * });
 *
 * // Sign in as candidate
 * await signInWithCustomToken(page, scenario.candidate.customToken);
 *
 * // Navigate to chat room
 * await page.goto(`/jobsmarket/chat/${scenario.chatRoomId}`);
 */
export async function createTestInterviewScenario(
  options: CreateTestInterviewScenarioOptions = {}
): Promise<TestInterviewScenario> {
  // 1. Create company
  const company = await createTestCompany({
    ...options.companyOptions,
    testName: options.testName,
  });

  // 2. Create candidate
  const candidate = await createTestCandidate({
    withCompleteProfile: true,
    ...options.candidateOptions,
    testName: options.testName,
  });

  // 3. Create job
  const jobId = generateTestId("job");
  const jobRef = testDb.collection("jobs").doc(jobId);
  const companyRef = testDb.collection("company_information").doc(company.companyId);
  const candidateRef = testDb.collection("candidate_information").doc(candidate.candidateId);

  await jobRef.set({
    uid: jobId,
    company_id: companyRef,
    title: "ตำแหน่งทดสอบสัมภาษณ์",
    title_en: "Test Interview Position",
    description: "รายละเอียดตำแหน่งทดสอบ",
    status: "published",
    is_active: true,
    employment_type: "full-time",
    work_model: "onsite",
    min_salary: 30000,
    max_salary: 60000,
    location: "กรุงเทพมหานคร",
    company_name: "บริษัททดสอบ จำกัด",
    is_test_account: true,
    test_name: options.testName,
    created_at: now(),
    updated_at: now(),
    created_by: null,
    updated_by: null,
  });

  // 4. Create application
  const applicationId = generateTestId("app");
  const applicationRef = testDb.collection("job_applications").doc(applicationId);
  const appStatus = options.applicationStatus || mapInterviewToAppStatus(options.interviewStatus || "pending");

  await applicationRef.set({
    uid: applicationId,
    job_id: jobRef,
    candidate_id: candidateRef,
    company_id: companyRef,
    status: appStatus,
    candidate_name: `${candidate.email.split("@")[0]}`,
    company_name: "บริษัททดสอบ จำกัด",
    job_title: "ตำแหน่งทดสอบสัมภาษณ์",
    is_active: true,
    is_test_account: true,
    test_name: options.testName,
    created_at: now(),
    updated_at: now(),
    created_by: null,
    updated_by: null,
  });

  // 5. Create chat room
  const chatRoomId = generateTestId("chat");
  const chatRef = testDb.collection("chats").doc(chatRoomId);

  // Create HR reference (using company user_accounts document)
  const hrRef = testDb.collection("user_accounts").doc(company.uid);

  await chatRef.set({
    uid: chatRoomId,
    candidate_id: candidateRef,
    company_id: companyRef,
    application_id: applicationRef,
    job_id: jobRef,
    responsible_hr_id: hrRef,
    responsible_hr_name: "ผู้จัดการทดสอบ",
    candidate_name: "ทดสอบ ผู้สมัคร",
    company_name: "บริษัททดสอบ จำกัด",
    job_title: "ตำแหน่งทดสอบสัมภาษณ์",
    last_message_text: null,
    last_message_time: null,
    status: "active",
    timestamp: now(),
    is_test_account: true,
    test_name: options.testName,
    created_at: now(),
    updated_at: now(),
    created_by: hrRef,
    updated_by: hrRef,
  });

  // 6. Create interview
  const interviewId = generateTestId("intv");
  const interviewRef = testDb.collection("job_interviews").doc(interviewId);
  const interviewDate = options.interviewDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
  const interviewStatus = options.interviewStatus || "scheduled";
  const channel = options.channel || "online";

  await interviewRef.set({
    uid: interviewId,
    job_id: jobRef,
    application_id: applicationRef,
    candidate_id: candidateRef,
    company_id: companyRef,
    chat_id: chatRef,
    candidate_name: "ทดสอบ ผู้สมัคร",
    company_name: "บริษัททดสอบ จำกัด",
    status: interviewStatus,
    channel,
    appointment: toTimestamp(interviewDate),
    from: "10:00",
    to: "11:00",
    location: channel === "onsite" ? "123 Test Building, Bangkok" : "",
    room: channel === "online" ? "https://meet.google.com/test-meeting" : "",
    note: "Test interview for E2E testing",
    is_cancel: interviewStatus === "cancelled",
    is_accepted: interviewStatus === "confirmed",
    is_test_account: true,
    test_name: options.testName,
    created_at: now(),
    updated_at: now(),
    created_by: companyRef,
    updated_by: companyRef,
  });

  // 7. Update application with interview reference
  await applicationRef.update({
    interview_id: interviewRef,
  });

  // 8. Update chat room with interview reference
  await chatRef.update({
    interview_id: interviewRef,
  });

  // 9. Create interview message in chat
  // Note: interview_id is stored as a string, not a DocumentReference
  // This matches the schema in messages.schema.ts (line 49: z.string().optional())
  const messageRef = testDb.collection("messages").doc();
  await messageRef.set({
    uid: messageRef.id,
    room_id: chatRef,
    sender_id: companyRef,
    sender_name: "บริษัททดสอบ จำกัด",
    sender_role: "company",
    type: "interview",
    message: "นัดสัมภาษณ์",
    interview_id: interviewId, // Store as string, not DocumentReference
    sender_avatar: "",
    unread: [candidate.candidateId],
    is_test_account: true,
    timestamp: now(),
    created_at: now(),
    updated_at: now(),
    created_by: companyRef,
    updated_by: companyRef,
  });

  return {
    candidate,
    company,
    jobId,
    applicationId,
    chatRoomId,
    interviewId,
  };
}

/**
 * Map interview status to application status
 */
function mapInterviewToAppStatus(interviewStatus: string): string {
  const mapping: Record<string, string> = {
    pending: "scheduled",
    confirmed: "confirmed",
    cancelled: "cancelled",
    rescheduled: "rescheduled",
    completed: "completed",
  };
  return mapping[interviewStatus] || "scheduled";
}

/**
 * Options for creating application scenario (without interview)
 */
export interface CreateTestApplicationScenarioOptions {
  /** Options for candidate creation */
  candidateOptions?: CreateTestCandidateOptions;
  /** Options for company creation */
  companyOptions?: CreateTestCompanyOptions;
  /** Application status */
  applicationStatus?: "applied" | "reviewing" | "shortlisted" | "rejected" | "withdrawn";
  /** Whether to create a chat room */
  withChatRoom?: boolean;
  /** Test name for traceability */
  testName?: string;
}

/**
 * Result of application scenario creation
 */
export interface TestApplicationScenario {
  /** Created candidate */
  candidate: TestCandidate;
  /** Created company */
  company: TestCompany;
  /** Job ID */
  jobId: string;
  /** Application ID */
  applicationId: string;
  /** Chat room ID (if created) */
  chatRoomId: string | null;
}

/**
 * Create an application scenario without interview
 *
 * This creates:
 * 1. A company account
 * 2. A candidate account
 * 3. A job posting
 * 4. A job application
 * 5. (Optional) A chat room
 *
 * Use this for testing application lists, filtering, status changes etc.
 * Use createTestInterviewScenario for interview-related tests.
 *
 * @example
 * const scenario = await createTestApplicationScenario({
 *   applicationStatus: 'reviewing',
 *   withChatRoom: true,
 *   testName: 'application-filter-test',
 * });
 *
 * // Use IDs for precise element selection
 * await page.getByTestId(`application-card-${scenario.applicationId}`).click();
 */
export async function createTestApplicationScenario(
  options: CreateTestApplicationScenarioOptions = {}
): Promise<TestApplicationScenario> {
  // 1. Create company
  const company = await createTestCompany({
    ...options.companyOptions,
    testName: options.testName,
  });

  // 2. Create candidate
  const candidate = await createTestCandidate({
    profileLevel: "complete",
    ...options.candidateOptions,
    testName: options.testName,
  });

  // 3. Create job
  const jobId = generateTestId("job");
  const jobRef = testDb.collection("jobs").doc(jobId);
  const companyRef = testDb.collection("company_information").doc(company.companyId);
  const candidateRef = testDb.collection("candidate_information").doc(candidate.candidateId);

  await jobRef.set({
    uid: jobId,
    company_id: companyRef,
    title: "ตำแหน่งทดสอบใบสมัคร",
    title_en: "Test Application Position",
    description: "รายละเอียดตำแหน่งทดสอบ",
    status: "published",
    is_active: true,
    employment_type: "full-time",
    work_model: "onsite",
    min_salary: 30000,
    max_salary: 60000,
    location: "กรุงเทพมหานคร",
    company_name: company.email.split("@")[0] || "บริษัททดสอบ จำกัด",
    is_test_account: true,
    test_name: options.testName,
    created_at: now(),
    updated_at: now(),
    created_by: null,
    updated_by: null,
  });

  // 4. Create application
  const applicationId = generateTestId("app");
  const applicationRef = testDb.collection("job_applications").doc(applicationId);
  const status = options.applicationStatus || "applied";

  await applicationRef.set({
    uid: applicationId,
    job_id: jobRef,
    candidate_id: candidateRef,
    company_id: companyRef,
    status,
    candidate_name: "ทดสอบ ผู้สมัคร",
    company_name: "บริษัททดสอบ จำกัด",
    job_title: "ตำแหน่งทดสอบใบสมัคร",
    is_active: true,
    is_test_account: true,
    test_name: options.testName,
    created_at: now(),
    updated_at: now(),
    created_by: null,
    updated_by: null,
  });

  // 5. Create chat room if requested
  let chatRoomId: string | null = null;
  if (options.withChatRoom) {
    chatRoomId = generateTestId("chat");
    const chatRef = testDb.collection("chats").doc(chatRoomId);
    const hrRef = testDb.collection("user_accounts").doc(company.uid);

    await chatRef.set({
      uid: chatRoomId,
      candidate_id: candidateRef,
      company_id: companyRef,
      application_id: applicationRef,
      job_id: jobRef,
      responsible_hr_id: hrRef,
      responsible_hr_name: "ผู้จัดการทดสอบ",
      candidate_name: "ทดสอบ ผู้สมัคร",
      company_name: "บริษัททดสอบ จำกัด",
      job_title: "ตำแหน่งทดสอบใบสมัคร",
      last_message_text: null,
      last_message_time: null,
      status: "active",
      timestamp: now(),
      is_test_account: true,
      test_name: options.testName,
      created_at: now(),
      updated_at: now(),
      created_by: hrRef,
      updated_by: hrRef,
    });
  }

  return {
    candidate,
    company,
    jobId,
    applicationId,
    chatRoomId,
  };
}

/**
 * Valid application statuses matching MasterJobApplicationStatuses enum
 * @see src/constants/application.ts
 */
export type ValidApplicationStatus =
  | "applied"    // สมัครใหม่ (new)
  | "read"       // เปิดอ่านแล้ว
  | "accepted"   // รอนัดสัมภาษณ์
  | "rejected"   // ถูกปฏิเสธ
  | "scheduled"  // นัดสัมภาษณ์
  | "confirmed"  // ยืนยันสัมภาษณ์
  | "declined"   // ปฏิเสธสัมภาษณ์
  | "withdraw"   // ยกเลิกการสมัคร
  | "cancelled"  // ยกเลิกการนัดสัมภาษณ์
  | "closed"     // ปิดรับสมัคร
  | "systemclosed"; // ปิดโดยระบบ

/**
 * Create multiple application scenarios in bulk
 * Returns all IDs for use in tests
 *
 * @example
 * const { candidate, applications } = await createBulkApplicationScenarios({
 *   count: 5,
 *   statuses: ['applied', 'read', 'accepted', 'rejected', 'withdraw'],
 * });
 *
 * // Test filtering
 * await page.getByTestId('filter-rejected').click();
 * await expect(page.getByTestId(`application-card-${applications[3].applicationId}`)).toBeVisible();
 */
export interface CreateBulkApplicationOptions {
  /** Number of applications to create */
  count: number;
  /** Statuses for each application (cycles if shorter than count) */
  statuses?: ValidApplicationStatus[];
  /** Options for the shared candidate */
  candidateOptions?: CreateTestCandidateOptions;
  /** Test name for traceability */
  testName?: string;
}

export interface BulkApplicationResult {
  /** The shared candidate */
  candidate: TestCandidate;
  /** Array of application scenarios */
  applications: Array<{
    company: TestCompany;
    jobId: string;
    applicationId: string;
    status: ValidApplicationStatus;
  }>;
}

export async function createBulkApplicationScenarios(
  options: CreateBulkApplicationOptions
): Promise<BulkApplicationResult> {
  // Create one candidate for all applications
  const candidate = await createTestCandidate({
    profileLevel: "complete",
    ...options.candidateOptions,
    testName: options.testName,
  });

  const statuses = options.statuses && options.statuses.length > 0 ? options.statuses : ["applied"] as const;
  const applications: BulkApplicationResult["applications"] = [];

  for (let i = 0; i < options.count; i++) {
    const status = statuses[i % statuses.length] ?? "applied";

    // Create company
    const company = await createTestCompany({
      testName: `${options.testName}-${i}`,
    });

    // Create job
    const jobId = generateTestId("job");
    const jobRef = testDb.collection("jobs").doc(jobId);
    const companyRef = testDb.collection("company_information").doc(company.companyId);
    const candidateRef = testDb.collection("candidate_information").doc(candidate.candidateId);

    await jobRef.set({
      uid: jobId,
      company_id: companyRef,
      title: `ตำแหน่งทดสอบ ${i + 1}`,
      title_en: `Test Position ${i + 1}`,
      description: `รายละเอียดตำแหน่ง ${i + 1}`,
      status: "published",
      is_active: true,
      employment_type: "full-time",
      work_model: "onsite",
      min_salary: 30000 + i * 5000,
      max_salary: 50000 + i * 5000,
      location: "กรุงเทพมหานคร",
      company_name: `บริษัททดสอบ ${i + 1} จำกัด`,
      is_test_account: true,
      test_name: options.testName,
      created_at: now(),
      updated_at: now(),
      created_by: null,
      updated_by: null,
    });

    // Create application
    const applicationId = generateTestId("app");
    const applicationRef = testDb.collection("job_applications").doc(applicationId);

    await applicationRef.set({
      uid: applicationId,
      job_id: jobRef,
      candidate_id: candidateRef,
      company_id: companyRef,
      status,
      candidate_name: "ทดสอบ ผู้สมัคร",
      company_name: `บริษัททดสอบ ${i + 1} จำกัด`,
      job_title: `ตำแหน่งทดสอบ ${i + 1}`,
      is_active: true,
      is_test_account: true,
      test_name: options.testName,
      created_at: now(),
      updated_at: now(),
      created_by: null,
      updated_by: null,
    });

    applications.push({
      company,
      jobId,
      applicationId,
      status,
    });
  }

  return {
    candidate,
    applications,
  };
}

/**
 * Predefined interview scenarios for common test cases
 */
export const InterviewScenarios = {
  /**
   * Candidate can confirm interview and receive first interview reward
   * - Interview status: pending
   * - Candidate: hasn't received first interview reward
   */
  confirmWithReward: () =>
    createTestInterviewScenario({
      candidateOptions: {
        isFirstInterviewerRewarded: false,
        withCompleteProfile: true,
      },
      interviewStatus: "scheduled",
      testName: "confirm-with-reward",
    }),

  /**
   * Candidate can confirm interview but won't receive reward (already claimed)
   * - Interview status: pending
   * - Candidate: already received first interview reward
   */
  confirmNoReward: () =>
    createTestInterviewScenario({
      candidateOptions: {
        isFirstInterviewerRewarded: true,
        withCompleteProfile: true,
      },
      interviewStatus: "scheduled",
      testName: "confirm-no-reward",
    }),

  /**
   * Candidate can decline interview
   * - Interview status: scheduled
   */
  decline: () =>
    createTestInterviewScenario({
      interviewStatus: "scheduled",
      testName: "decline-interview",
    }),

  /**
   * Company can cancel a confirmed interview
   * - Interview status: confirmed
   */
  cancelConfirmed: () =>
    createTestInterviewScenario({
      interviewStatus: "confirmed",
      testName: "cancel-confirmed",
    }),

  /**
   * Company can cancel a pending interview
   * - Interview status: scheduled
   */
  cancelPending: () =>
    createTestInterviewScenario({
      interviewStatus: "scheduled",
      testName: "cancel-pending",
    }),

  /**
   * Company can reschedule a declined interview
   * - Interview status: rescheduled
   */
  rescheduleDeclined: () =>
    createTestInterviewScenario({
      interviewStatus: "rescheduled",
      testName: "reschedule-declined",
    }),

  /**
   * Company can reschedule a pending interview
   * - Interview status: scheduled
   */
  reschedulePending: () =>
    createTestInterviewScenario({
      interviewStatus: "scheduled",
      testName: "reschedule-pending",
    }),

  /**
   * View completed interview (no actions available)
   * - Interview status: completed
   */
  completed: () =>
    createTestInterviewScenario({
      interviewStatus: "completed",
      testName: "completed-interview",
    }),

  /**
   * Onsite interview scenario
   * - Interview status: scheduled
   * - Channel: onsite
   */
  onsite: () =>
    createTestInterviewScenario({
      interviewStatus: "scheduled",
      channel: "onsite",
      testName: "onsite-interview",
    }),

  /**
   * Online interview scenario
   * - Interview status: scheduled
   * - Channel: online
   */
  online: () =>
    createTestInterviewScenario({
      interviewStatus: "scheduled",
      channel: "online",
      testName: "online-interview",
    }),
};
