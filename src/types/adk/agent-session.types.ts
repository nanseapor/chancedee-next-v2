import type { Timestamp } from "firebase-admin/firestore";
import type { ChatMessage } from "@/types/ai-message.types";

/**
 * Agent type identifier
 */
export type AgentType = "consulting" | "resume-creation";

/**
 * Session status
 */
export type SessionStatus = "active" | "completed" | "abandoned" | "error";

/**
 * Consulting context - information gathered during career consultation
 * This context is passed as prompt to Resume Agent when user switches
 */
export interface ConsultingContext {
  careerGoals?: string;
  currentSituation?: string;
  challenges?: string[];
  recommendations?: string[];
  agreedToCreateResume?: boolean;
  summary?: string; // Summary to pass to Resume Agent
}

/**
 * Resume creation progress tracking
 */
export interface ResumeProgress {
  completedSections: ResumeSectionType[];
  currentSection?: ResumeSectionType;
  lastUpdated: Timestamp | number;
}

/**
 * Resume section types for progress tracking
 */
export type ResumeSectionType =
  | "personal_info"
  | "education"
  | "work_experience"
  | "skills"
  | "languages"
  | "licenses"
  | "additional_info";

/**
 * PDF generation metadata
 */
export interface PdfGenerationMetadata {
  template: "template1" | "template2" | "template3";
  privacyMode: boolean;
  regenerationCount: number;
  generatedAt?: Timestamp | number;
  pdfUrl?: string;
}

/**
 * Token usage tracking (cap at 100k per session)
 */
export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  maxTokens: 100000;
  lastUpdated: Timestamp | number;
}

/**
 * Session metadata
 */
export interface SessionMetadata {
  createdAt: Timestamp | number;
  lastUpdated: Timestamp | number;
  totalMessages: number;
  handoffTimestamp?: Timestamp | number;
  lastActiveAgent: AgentType;
  tokenUsage: TokenUsage;
  userAgent?: string;
  ipAddress?: string;
}

/**
 * Main ADK session interface
 * Stored in Firestore at: /users/{userId}/adkSessions/{sessionId}
 *
 * Note: We don't store full resumeData here, only progress tracking.
 * Actual resume data is saved directly to /candidateInformation/{userId}
 */
export interface AdkSession {
  sessionId: string;
  userId: string;
  currentAgent: AgentType;
  status: SessionStatus;

  // Context from consulting agent (passed in prompt to resume agent)
  consultingContext?: ConsultingContext;

  // Progress tracking (which sections are completed)
  progress?: ResumeProgress;

  // Message history (limited to last 10 messages for context window)
  messages: ChatMessage[];

  // PDF generation metadata
  pdfGeneration?: PdfGenerationMetadata;

  // Session metadata
  metadata: SessionMetadata;
}

/**
 * Session creation parameters
 */
export interface CreateSessionParams {
  userId: string;
  initialAgent?: AgentType;
  userAgent?: string;
  ipAddress?: string;
}

/**
 * Session update parameters
 */
export interface UpdateSessionParams {
  sessionId: string;
  userId: string;
  updates: Partial<AdkSession>;
}

/**
 * Agent handoff parameters
 */
export interface AgentHandoffParams {
  sessionId: string;
  userId: string;
  fromAgent: AgentType;
  toAgent: AgentType;
  context?: string; // Summary to pass to new agent
}

/**
 * Message append parameters
 */
export interface AppendMessageParams {
  sessionId: string;
  userId: string;
  message: ChatMessage;
}

/**
 * Resume progress update parameters
 */
export interface UpdateResumeProgressParams {
  sessionId: string;
  userId: string;
  section: ResumeSectionType;
  completed: boolean;
}

/**
 * Token usage update parameters
 */
export interface UpdateTokenUsageParams {
  sessionId: string;
  userId: string;
  inputTokens: number;
  outputTokens: number;
}
