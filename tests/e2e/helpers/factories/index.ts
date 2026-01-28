/**
 * Export all test factories
 *
 * Usage:
 * import { createTestCandidate, InterviewScenarios, CandidateVariants } from '../helpers/factories';
 *
 * @example
 * // Create a complete candidate with all IDs for precise element selection
 * const candidate = await CandidateVariants.complete();
 * console.log(candidate.workExperienceIds); // ["work-abc123"]
 * await page.getByTestId(`work-exp-${candidate.workExperienceIds[0]}`).click();
 *
 * @example
 * // Create application scenario for testing
 * const scenario = await createTestApplicationScenario({ applicationStatus: 'reviewing' });
 * await page.getByTestId(`application-card-${scenario.applicationId}`).click();
 */

// Candidate factory
export {
  createTestCandidate,
  createTestMultiRoleUser,
  CandidateVariants,
  PROFILE_LEVELS,
  type ProfileLevel,
  type CreateTestCandidateOptions,
  type TestCandidate,
  type CreateTestMultiRoleUserOptions,
  type TestMultiRoleUser,
} from "./candidate-factory";

// Company factory
export {
  createTestCompany,
  createTestJob,
  CompanyVariants,
  type CreateTestCompanyOptions,
  type TestCompany,
  type CreateTestJobOptions,
  type TestJob,
} from "./company-factory";

// Interview and application scenario factories
export {
  createTestInterviewScenario,
  createTestApplicationScenario,
  createBulkApplicationScenarios,
  InterviewScenarios,
  type CreateTestInterviewScenarioOptions,
  type TestInterviewScenario,
  type CreateTestApplicationScenarioOptions,
  type TestApplicationScenario,
  type CreateBulkApplicationOptions,
  type BulkApplicationResult,
  type ValidApplicationStatus,
} from "./interview-factory";

// Notification factory
export {
  createNotificationScenario,
  createChatMessageScenario,
  NotificationScenarios,
  type CreateNotificationScenarioOptions,
  type NotificationScenarioResult,
  type CreateChatMessageScenarioOptions,
  type ChatMessageScenarioResult,
} from "./notification-factory";

// Wallet factory
export {
  createWalletScenario,
  WalletScenarios,
  cleanupWalletData,
  type WalletTransaction,
  type CreateWalletScenarioOptions,
  type WalletScenarioResult,
} from "./wallet-factory";

// Admin factory
export {
  createTestAdmin,
  createTestPendingCompany,
  AdminVariants,
  AdminCompanyVariants,
  type CreateTestAdminOptions,
  type TestAdmin,
  type CreateTestPendingCompanyOptions,
  type TestPendingCompany,
} from "./admin-factory";

// Re-export utilities from firebase-admin-test
export {
  generateTestEmail,
  generateTestId,
  testAuth,
  testDb,
  testStorage,
  now,
  toTimestamp,
  docRef,
} from "../firebase-admin-test";
