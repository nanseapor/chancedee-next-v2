// Main renderer
export { MessageRenderer } from "./message-renderer";

// Individual message components (for custom usage)
export { TextMessageComponent } from "./text-message";
export { QuickReplyMessageComponent } from "./quick-reply-message";
export { AuthMessageComponent } from "./auth-message";
export { PersonalInfoFormMessageComponent } from "./personal-info-form-message";
export { EducationFormMessageComponent } from "./education-form-message";
export { WorkExperienceFormMessageComponent } from "./work-experience-form-message";
export { RichCardMessageComponent } from "./rich-card-message";
export { ListMessageComponent } from "./list-message";
export { ProgressMessageComponent } from "./progress-message";
export { ResumePreviewMessageComponent } from "./resume-preview-message";
export { ConfirmationMessageComponent } from "./confirmation-message";
export { TypingIndicatorMessageComponent } from "./typing-indicator-message";
export { ErrorMessageComponent } from "./error-message";
export { PDPAConsentMessageComponent } from "./pdpa-consent-message";
export { HighestEducationInputMessageComponent } from "./highest-education-input-message";

// Shared components
export { BotAvatar } from "./shared/bot-avatar";
export { UserAvatar } from "./shared/user-avatar";
export { TypingDots } from "./shared/typing-dots";

// Types
export type * from "@/types/ai-message.types";
