import type { ChatMessage } from "@/types/ai-message.types";

/**
 * ADK Agent request message
 * Sent from Next.js API to ADK Service (Cloud Run)
 */
export interface AdkRequest {
  message: string;
  sessionId: string;
  userId: string;
  context?: AdkContext;
  formData?: unknown; // Form submission data
}

/**
 * ADK Context - passed to agent for conversation context
 */
export interface AdkContext {
  // Last 10 messages for context window
  messageHistory: ChatMessage[];

  // Current agent type
  currentAgent: "consulting" | "resume-creation";

  // Consulting context (for resume agent)
  consultingContext?: {
    careerGoals?: string;
    currentSituation?: string;
    recommendations?: string[];
    summary?: string;
  };

  // Progress tracking (for resume agent)
  progress?: {
    completedSections: string[];
    currentSection?: string;
  };

  // Token usage
  tokenUsage: {
    totalTokens: number;
    maxTokens: number;
  };
}

/**
 * ADK Response message
 * Returned from ADK Service to Next.js API
 */
export interface AdkResponse {
  success: boolean;
  messages: AdkResponseMessage[];
  tokenUsage?: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  error?: string;
}

/**
 * ADK Response message types
 */
export type AdkResponseMessage =
  | AdkTextMessage
  | AdkFormMessage
  | AdkQuickReplyMessage
  | AdkConfirmationMessage
  | AdkProgressMessage
  | AdkHandoffMessage
  | AdkErrorMessage;

/**
 * Text message from ADK
 */
export interface AdkTextMessage {
  type: "text";
  content: string;
}

/**
 * Form message from ADK
 */
export interface AdkFormMessage {
  type: "form";
  formType:
    | "personal_info"
    | "education"
    | "work_experience"
    | "skills"
    | "languages"
    | "licenses";
  title: string;
  subtitle?: string;
  prefillData?: unknown;
  options?: unknown;
}

/**
 * Quick reply message from ADK
 */
export interface AdkQuickReplyMessage {
  type: "quick_reply";
  content: string;
  options: Array<{
    id: string;
    label: string;
    icon?: string;
    value: string;
  }>;
}

/**
 * Confirmation message from ADK
 */
export interface AdkConfirmationMessage {
  type: "confirmation";
  title: string;
  data: Record<string, string | number | boolean | undefined>;
}

/**
 * Progress message from ADK
 */
export interface AdkProgressMessage {
  type: "progress";
  title: string;
  steps: Array<{
    id: string;
    label: string;
    status: "completed" | "current" | "pending";
  }>;
  currentStepIndex: number;
  totalSteps: number;
}

/**
 * Agent handoff message from ADK
 */
export interface AdkHandoffMessage {
  type: "handoff";
  fromAgent: "consulting" | "resume-creation";
  toAgent: "consulting" | "resume-creation";
  context: string;
}

/**
 * Error message from ADK
 */
export interface AdkErrorMessage {
  type: "error";
  title?: string;
  message: string;
  code?: string;
}

/**
 * ADK Stream event
 * For Server-Sent Events (SSE) streaming
 */
export interface AdkStreamEvent {
  event: "message" | "token_usage" | "done" | "error";
  data: unknown;
}
