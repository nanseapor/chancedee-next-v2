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
  /** Interview status */
  interviewStatus?: "pending" | "confirmed" | "cancelled" | "rescheduled" | "completed";
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
    companyId: companyRef,
    title: "ตำแหน่งทดสอบสัมภาษณ์",
    titleEN: "Test Interview Position",
    description: "รายละเอียดตำแหน่งทดสอบ",
    status: "published",
    isActive: true,
    employmentType: "full-time",
    workModel: "onsite",
    minSalary: 30000,
    maxSalary: 60000,
    location: "กรุงเทพมหานคร",
    companyName: company.companyId,
    isTestAccount: true,
    testName: options.testName,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  // 4. Create application
  const applicationId = generateTestId("app");
  const applicationRef = testDb.collection("job_applications").doc(applicationId);
  const appStatus = options.applicationStatus || mapInterviewToAppStatus(options.interviewStatus || "pending");

  await applicationRef.set({
    uid: applicationId,
    jobId: jobRef,
    candidateId: candidateRef,
    companyId: companyRef,
    status: appStatus,
    candidateName: `${candidate.email.split("@")[0]}`,
    companyName: "บริษัททดสอบ จำกัด",
    jobTitle: "ตำแหน่งทดสอบสัมภาษณ์",
    isActive: true,
    isTestAccount: true,
    testName: options.testName,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  // 5. Create chat room
  const chatRoomId = generateTestId("chat");
  const chatRef = testDb.collection("chats").doc(chatRoomId);

  await chatRef.set({
    uid: chatRoomId,
    candidateId: candidateRef,
    companyId: companyRef,
    applicationId: applicationRef,
    jobId: jobRef,
    candidateName: "ทดสอบ ผู้สมัคร",
    companyName: "บริษัททดสอบ จำกัด",
    jobTitle: "ตำแหน่งทดสอบสัมภาษณ์",
    lastMessageText: null,
    lastMessageTime: null,
    unreadCountCandidate: 0,
    unreadCountCompany: 0,
    isActive: true,
    isTestAccount: true,
    testName: options.testName,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  // 6. Create interview
  const interviewId = generateTestId("intv");
  const interviewRef = testDb.collection("job_interviews").doc(interviewId);
  const interviewDate = options.interviewDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
  const interviewStatus = options.interviewStatus || "pending";
  const channel = options.channel || "online";

  await interviewRef.set({
    uid: interviewId,
    jobId: jobRef,
    applicationId: applicationRef,
    candidateId: candidateRef,
    companyId: companyRef,
    chatId: chatRef,
    candidateName: "ทดสอบ ผู้สมัคร",
    companyName: "บริษัททดสอบ จำกัด",
    status: interviewStatus,
    channel,
    appointment: toTimestamp(interviewDate).toMillis(),
    from: "10:00",
    to: "11:00",
    location: channel === "onsite" ? "123 Test Building, Bangkok" : "",
    meetingLink: channel === "online" ? "https://meet.google.com/test-meeting" : "",
    note: "Test interview for E2E testing",
    isCancel: interviewStatus === "cancelled",
    isAccepted: interviewStatus === "confirmed",
    isTestAccount: true,
    testName: options.testName,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    createdBy: companyRef,
    updatedBy: companyRef,
  });

  // 7. Update application with interview reference
  await applicationRef.update({
    interviewId: interviewRef,
  });

  // 8. Update chat room with interview reference
  await chatRef.update({
    interviewId: interviewRef,
  });

  // 9. Create interview message in chat
  const messageRef = testDb.collection("messages").doc();
  await messageRef.set({
    uid: messageRef.id,
    roomId: chatRef,
    senderId: companyRef,
    senderName: "บริษัททดสอบ จำกัด",
    senderRole: "company",
    type: "interview",
    text: "นัดสัมภาษณ์",
    interviewId: interviewRef,
    avatar: "",
    unread: [candidateRef],
    isTestAccount: true,
    timestamp: Date.now(),
    createdAt: Date.now(),
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
      interviewStatus: "pending",
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
      interviewStatus: "pending",
      testName: "confirm-no-reward",
    }),

  /**
   * Candidate can decline interview
   * - Interview status: pending
   */
  decline: () =>
    createTestInterviewScenario({
      interviewStatus: "pending",
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
   * - Interview status: pending
   */
  cancelPending: () =>
    createTestInterviewScenario({
      interviewStatus: "pending",
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
   * - Interview status: pending
   */
  reschedulePending: () =>
    createTestInterviewScenario({
      interviewStatus: "pending",
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
   * - Interview status: pending
   * - Channel: onsite
   */
  onsite: () =>
    createTestInterviewScenario({
      interviewStatus: "pending",
      channel: "onsite",
      testName: "onsite-interview",
    }),

  /**
   * Online interview scenario
   * - Interview status: pending
   * - Channel: online
   */
  online: () =>
    createTestInterviewScenario({
      interviewStatus: "pending",
      channel: "online",
      testName: "online-interview",
    }),
};
