/**
 * Email Notification Types
 * Extracted from email-notifications.ts for Next.js 15+ compatibility
 */

/**
 * Unified email data structure per BLS-11-06
 */
export interface UnifiedEmailData {
  candidateName: string;
  subject: string;
  date?: string;
  emailTitle: string;
  greeting: string;
  mainMessage: string;
  statusBadge?: { icon: string; text: string };
  infoItems?: Array<{ label: string; value: string }>;
  nextSteps?: string[];
  actionButtons?: Array<{ text: string; url: string }>;
  highlightMessage?: string;
}

/**
 * Notification types for email categorization
 */
export type NotificationType =
  | "application_received"
  | "application_accepted"
  | "application_rejected"
  | "interview_scheduled"
  | "interview_rescheduled"
  | "interview_cancelled"
  | "interview_confirmed"
  | "interview_declined"
  | "offer_sent"
  | "company_approved";

/**
 * Input for sendEmailNotification
 */
export interface SendEmailNotificationInput {
  email: string;
  emailData: UnifiedEmailData;
  notificationType: NotificationType;
}

/**
 * Result for sendEmailNotification
 */
export interface SendEmailNotificationResult {
  success: boolean;
  error?: "INVALID_EMAIL" | "INVALID_DATA" | "NETWORK_ERROR" | "SEND_FAILED";
  messageId?: string;
}
