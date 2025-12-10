/**
 * Resume Builder Types
 *
 * TypeScript type definitions for the Resume Builder AI feature
 * Compatible with both chat interface and Chancedee API
 */

// Re-export Chancedee API types for consistency
export type {
  PersonalInfo,
  Experience,
  Education,
  Project,
  Certification,
  Language,
  ChancedeeUserData,
  TemplateType,
  ChancedeeOptions,
  ChancedeeRequest,
  ChancedeeResponse,
  TokenUsage,
  ChancedeeMetadata,
  ChancedeeApiError,
} from "@/lib/chancedee-api";

// Chat-specific types
export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  attachments?: Attachment[];
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url?: string;
  content?: string;
}

// Resume data structure for chat interface
export interface ResumeData {
  personalInfo?: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    position?: string;
  };
  summary?: string;
  experience?: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate?: string;
    current?: boolean;
    description: string;
    achievements?: string[];
  }>;
  education?: Array<{
    institution: string;
    degree: string;
    field: string;
    graduationDate: string;
    gpa?: number;
    honors?: string;
  }>;
  skills?: string[];
  projects?: Array<{
    name: string;
    description: string;
    technologies: string[];
    url?: string;
    startDate?: string;
    endDate?: string;
  }>;
  certifications?: Array<{
    name: string;
    issuer: string;
    date: string;
    expiryDate?: string;
    credentialId?: string;
  }>;
  languages?: Array<{
    language: string;
    proficiency: "beginner" | "intermediate" | "advanced" | "native";
  }>;
}

// Template information
export interface TemplateInfo {
  id: string;
  name: string;
  category: "fresh-graduate" | "professional";
  description: string;
  features: string[];
  preview?: string;
}

// Chat state management
export interface ChatState {
  messages: Message[];
  isTyping: boolean;
  isGenerating: boolean;
  resumeData: ResumeData;
  selectedTemplate?: string;
  generatedResume?: {
    htmlContent: string;
    templateUsed: string;
    templateName: string;
    generatedAt: string;
    conversationId: string;
  };
}

// Hook return types
export interface UseChanceedeChatReturn {
  messages: Message[];
  isLoading: boolean;
  isGenerating: boolean;
  resumeData: ResumeData;
  selectedTemplate?: string;
  generatedResume?: ChatState["generatedResume"];
  sendMessage: (content: string, attachments?: File[]) => Promise<void>;
  clearChat: () => void;
  selectTemplate: (templateId: string) => void;
  generateResume: () => Promise<void>;
  updateResumeData: (data: Partial<ResumeData>) => void;
  error?: string;
  // New properties for API integration
  apiStatus?: "loading" | "connected" | "error";
  templates?: Record<string, any>;
  userData?: Record<string, any>;
  exportData?: () => any;
  importData?: (data: any) => boolean;
  refreshTemplates?: () => Promise<void>;
  checkApiHealth?: () => Promise<void>;
}

// Component prop types
export interface ChatAreaProps {
  messages: Message[];
  isTyping: boolean;
}

export interface ChatMessageProps {
  message: Message;
}

export interface InputAreaProps {
  onSendMessage: (content: string, attachments?: File[]) => Promise<void>;
  onClearChat: () => void;
  disabled?: boolean;
  allowFileUpload?: boolean;
}

export interface ResumePreviewProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  resumeData: ResumeData;
  generatedResume?: ChatState["generatedResume"];
  onGenerateResume?: () => Promise<void>;
  isGenerating?: boolean;
  error?: string;
}

export interface HeaderProps {
  onPreviewToggle: () => void;
  selectedTemplate?: string;
  onTemplateSelect?: (templateId: string) => void;
}

export interface TemplateSelectorProps {
  selectedTemplate?: string;
  onTemplateSelect: (templateId: string) => void;
  templates: TemplateInfo[] | Record<string, any>;
  disabled?: boolean;
}

// Data extraction and validation
export interface DataExtractionResult {
  extractedData: Partial<ResumeData>;
  confidence: number;
  fields: Array<{
    field: string;
    value: any;
    confidence: number;
  }>;
}

export interface ValidationResult {
  valid: boolean;
  errors: Array<{
    field: string;
    message: string;
  }>;
  warnings: Array<{
    field: string;
    message: string;
  }>;
}

// API integration helpers
export interface ChatToChancedeeMapper {
  mapResumeDataToUserData: (
    resumeData: ResumeData,
  ) => import("@/lib/chancedee-api").ChancedeeUserData;
  extractDataFromMessages: (messages: Message[]) => DataExtractionResult;
  validateUserData: (data: Partial<ResumeData>) => ValidationResult;
}

// Error types
export interface ResumeBuilderError {
  type: "validation" | "api" | "chat" | "file" | "generation";
  message: string;
  details?: any;
  field?: string;
}

// File upload types
export interface FileUploadProgress {
  file: File;
  progress: number;
  status: "pending" | "uploading" | "completed" | "error";
  error?: string;
}

export interface FileUploadState {
  uploads: FileUploadProgress[];
  isUploading: boolean;
}

// Settings and preferences
export interface ResumeBuilderSettings {
  language: "th" | "en";
  autoSave: boolean;
  templatePreference?: string;
  chatHistory: boolean;
  fileUploadEnabled: boolean;
}

// Analytics and tracking
export interface ResumeBuilderAnalytics {
  sessionId: string;
  startTime: Date;
  messagesCount: number;
  templatesViewed: string[];
  resumesGenerated: number;
  completionSteps: Array<{
    step: string;
    timestamp: Date;
    data?: any;
  }>;
}
