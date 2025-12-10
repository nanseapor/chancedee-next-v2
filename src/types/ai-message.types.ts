import type { educationHistory, workHistory } from "./candidate.types";

/**
 * Message sender type
 */
export type MessageSender = "bot" | "user";

/**
 * Base message interface
 */
export interface BaseMessage {
  id: string;
  sender: MessageSender;
  timestamp: number;
}

/**
 * 1. Text Message - Simple text communication
 */
export interface TextMessage extends BaseMessage {
  type: "text";
  content: string;
}

/**
 * 2. Quick Reply Message - Text with quick action buttons
 */
export interface QuickReplyOption {
  id: string;
  label: string;
  icon?: string;
  value: string;
}

export interface QuickReplyMessage extends BaseMessage {
  type: "quick_reply";
  content: string;
  options: QuickReplyOption[];
  onSelect?: (value: string) => void;
}

/**
 * 3. Authentication Message - Login/Register prompt
 */
export interface AuthMessage extends BaseMessage {
  type: "auth";
  title: string;
  description: string;
  onLogin?: () => void;
  onRegister?: () => void;
}

/**
 * 4. Form Message - Personal Info
 */
export interface PersonalInfoFormData {
  fullName?: string;
  email?: string;
  phone?: string;
}

export interface PersonalInfoFormMessage extends BaseMessage {
  type: "personal_info_form";
  title: string;
  subtitle?: string;
  data?: PersonalInfoFormData;
  onSubmit?: (data: PersonalInfoFormData) => void;
  onSkip?: () => void;
}

/**
 * 5. Form Message - Education
 */
export interface EducationFormMessage extends BaseMessage {
  type: "education_form";
  title: string;
  subtitle?: string;
  data?: educationHistory;
  educationLevelOptions?: Array<{ value: number; label: string }>;
  onSubmit?: (data: educationHistory) => void;
  onSkip?: () => void;
}

/**
 * 6. Form Message - Work Experience
 */
export interface WorkExperienceFormMessage extends BaseMessage {
  type: "work_experience_form";
  title: string;
  subtitle?: string;
  data?: workHistory;
  onSubmit?: (data: workHistory) => void;
  onSkip?: () => void;
}

/**
 * 7. Rich Card Message - Card with image and action
 */
export interface RichCardMessage extends BaseMessage {
  type: "rich_card";
  title: string;
  description: string;
  imageUrl?: string;
  imageEmoji?: string;
  buttonLabel?: string;
  onAction?: () => void;
}

/**
 * 8. List Message - Selectable list items
 */
export interface ListItem {
  id: string;
  title: string;
  subtitle?: string;
  icon?: string;
  value: string;
}

export interface ListMessage extends BaseMessage {
  type: "list";
  title: string;
  items: ListItem[];
  onSelect?: (value: string) => void;
}

/**
 * 9. Progress Indicator Message
 */
export interface ProgressStep {
  id: string;
  label: string;
  status: "completed" | "current" | "pending";
}

export interface ProgressMessage extends BaseMessage {
  type: "progress";
  title: string;
  steps: ProgressStep[];
  currentStepIndex: number;
  totalSteps: number;
}

/**
 * 10. Resume Preview Message
 */
export interface ResumePreviewMessage extends BaseMessage {
  type: "resume_preview";
  title: string;
  subtitle?: string;
  pageCount?: number;
  previewUrl?: string;
  onDownload?: () => void;
  onEdit?: () => void;
}

/**
 * 11. Confirmation Message
 */
export interface ConfirmationData {
  [key: string]: string | number | boolean | undefined;
}

export interface ConfirmationMessage extends BaseMessage {
  type: "confirmation";
  title: string;
  data: ConfirmationData;
  onConfirm?: () => void;
  onEdit?: () => void;
}

/**
 * 12. Typing Indicator Message
 */
export interface TypingIndicatorMessage extends BaseMessage {
  type: "typing";
}

/**
 * 13. Error Message
 */
export interface ErrorMessage extends BaseMessage {
  type: "error";
  title?: string;
  message: string;
  onRetry?: () => void;
}

/**
 * 14. PDPA Consent Form Message
 */
export interface PDPAConsentMessage extends BaseMessage {
  type: "pdpa_consent";
  title: string;
  subtitle?: string;
  content: string;
  consentText: string;
  linkUrl?: string;
  linkText?: string;
  isAccepted?: boolean;
  onAccept?: (accepted: boolean) => void;
  onSubmit?: () => void;
}

/**
 * 15. Highest Education Input Message
 */
export interface HighestEducationInputMessage extends BaseMessage {
  type: "highest_education_input";
  title: string;
  subtitle?: string;
  data?: {
    educationLevel?: string;
    major?: string;
    institution?: string;
  };
  educationLevelOptions?: Array<{ value: string; label: string }>;
  onSubmit?: (data: {
    educationLevel: string;
    major?: string;
    institution?: string;
  }) => void;
}

/**
 * Union type for all message types
 */
export type ChatMessage =
  | TextMessage
  | QuickReplyMessage
  | AuthMessage
  | PersonalInfoFormMessage
  | EducationFormMessage
  | WorkExperienceFormMessage
  | RichCardMessage
  | ListMessage
  | ProgressMessage
  | ResumePreviewMessage
  | ConfirmationMessage
  | TypingIndicatorMessage
  | ErrorMessage
  | PDPAConsentMessage
  | HighestEducationInputMessage;

/**
 * Message renderer props
 */
export interface MessageRendererProps {
  message: ChatMessage;
}
