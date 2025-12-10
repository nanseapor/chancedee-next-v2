export { MockConsultingAgent } from "./mock-consulting-agent";
export { MockResumeAgent } from "./mock-resume-agent";

/**
 * Check if mock ADK should be used
 */
export function useMockAdk(): boolean {
  return process.env.USE_MOCK_ADK === "true";
}

/**
 * Get ADK service URL
 */
export function getAdkServiceUrl(): string {
  return process.env.ADK_SERVICE_URL || "https://adk-service.run.app";
}
