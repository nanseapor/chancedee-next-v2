/**
 * Export all test factories
 *
 * Usage:
 * import { createTestCandidate, InterviewScenarios } from '../helpers/factories';
 */

// Candidate factory
export {
  createTestCandidate,
  CandidateVariants,
  type CreateTestCandidateOptions,
  type TestCandidate,
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

// Interview scenario factory
export {
  createTestInterviewScenario,
  InterviewScenarios,
  type CreateTestInterviewScenarioOptions,
  type TestInterviewScenario,
} from "./interview-factory";

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
