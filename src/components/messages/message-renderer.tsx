"use client";

import type { ChatMessage } from "@/types/ai-message.types";
import { TextMessageComponent } from "./text-message";
import { QuickReplyMessageComponent } from "./quick-reply-message";
import { AuthMessageComponent } from "./auth-message";
import { PersonalInfoFormMessageComponent } from "./personal-info-form-message";
import { EducationFormMessageComponent } from "./education-form-message";
import { WorkExperienceFormMessageComponent } from "./work-experience-form-message";
import { RichCardMessageComponent } from "./rich-card-message";
import { ListMessageComponent } from "./list-message";
import { ProgressMessageComponent } from "./progress-message";
import { ResumePreviewMessageComponent } from "./resume-preview-message";
import { ConfirmationMessageComponent } from "./confirmation-message";
import { TypingIndicatorMessageComponent } from "./typing-indicator-message";
import { ErrorMessageComponent } from "./error-message";
import { PDPAConsentMessageComponent } from "./pdpa-consent-message";
import { HighestEducationInputMessageComponent } from "./highest-education-input-message";

interface MessageRendererProps {
  message: ChatMessage;
  isAnimated?: boolean;
}

/**
 * MessageRenderer - Universal component for rendering all message types
 *
 * Usage:
 * ```tsx
 * <MessageRenderer message={chatMessage} isAnimated={true} />
 * ```
 */
export function MessageRenderer({
  message,
  isAnimated = true,
}: MessageRendererProps) {
  switch (message.type) {
    case "text":
      return <TextMessageComponent message={message} isAnimated={isAnimated} />;

    case "quick_reply":
      return (
        <QuickReplyMessageComponent message={message} isAnimated={isAnimated} />
      );

    case "auth":
      return <AuthMessageComponent message={message} isAnimated={isAnimated} />;

    case "personal_info_form":
      return (
        <PersonalInfoFormMessageComponent
          message={message}
          isAnimated={isAnimated}
        />
      );

    case "education_form":
      return (
        <EducationFormMessageComponent
          message={message}
          isAnimated={isAnimated}
        />
      );

    case "work_experience_form":
      return (
        <WorkExperienceFormMessageComponent
          message={message}
          isAnimated={isAnimated}
        />
      );

    case "rich_card":
      return (
        <RichCardMessageComponent message={message} isAnimated={isAnimated} />
      );

    case "list":
      return <ListMessageComponent message={message} isAnimated={isAnimated} />;

    case "progress":
      return (
        <ProgressMessageComponent message={message} isAnimated={isAnimated} />
      );

    case "resume_preview":
      return (
        <ResumePreviewMessageComponent
          message={message}
          isAnimated={isAnimated}
        />
      );

    case "confirmation":
      return (
        <ConfirmationMessageComponent
          message={message}
          isAnimated={isAnimated}
        />
      );

    case "typing":
      return (
        <TypingIndicatorMessageComponent
          message={message}
          isAnimated={isAnimated}
        />
      );

    case "error":
      return <ErrorMessageComponent message={message} isAnimated={isAnimated} />;

    case "pdpa_consent":
      return (
        <PDPAConsentMessageComponent message={message} isAnimated={isAnimated} />
      );

    case "highest_education_input":
      return (
        <HighestEducationInputMessageComponent
          message={message}
          isAnimated={isAnimated}
        />
      );

    default:
      // Exhaustive check - TypeScript will error if we miss a type
      const _exhaustiveCheck: never = message;
      console.error("Unknown message type:", _exhaustiveCheck);
      return null;
  }
}
