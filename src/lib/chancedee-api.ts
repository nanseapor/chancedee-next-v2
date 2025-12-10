/**
 * Chancedee API Client
 *
 * TypeScript client for the Chancedee Resume Generation API
 * Based on the Cloud Run Express.js implementation
 */

export interface PersonalInfo {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  position: string;
}

export interface Experience {
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  description: string;
  achievements?: string[];
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  graduationDate: string;
  gpa?: number;
  honors?: string;
}

export interface Project {
  name: string;
  description: string;
  technologies: string[];
  url?: string;
  startDate?: string;
  endDate?: string;
}

export interface Certification {
  name: string;
  issuer: string;
  date: string;
  expiryDate?: string;
  credentialId?: string;
}

export interface Language {
  language: string;
  proficiency: "beginner" | "intermediate" | "advanced" | "native";
}

export interface ChancedeeUserData {
  name: string;
  email: string;
  position: string;
  phone?: string;
  address?: string;
  summary?: string;
  experience?: Experience[];
  education?: Education[];
  skills?: string[];
  projects?: Project[];
  certifications?: Certification[];
  languages?: Language[];
}

export type TemplateType =
  | "fresh-graduate-academic"
  | "fresh-graduate-liberal"
  | "fresh-graduate-project"
  | "career-up-it"
  | "career-up-business";

export interface ChancedeeOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  conversationId?: string;
}

export interface ChancedeeRequest {
  userData: ChancedeeUserData;
  templateType: TemplateType;
  options?: ChancedeeOptions;
}

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export interface ChancedeeMetadata {
  templateCategory: string;
  generationTime: number;
  model: string;
  chancedeeVersion: string;
  platform: string;
}

export interface ChancedeeResponse {
  success: boolean;
  data?: {
    htmlContent: string;
    templateUsed: string;
    templateName: string;
    generatedAt: string;
    conversationId: string;
    tokenUsage: TokenUsage;
    metadata: ChancedeeMetadata;
  };
  error?: string;
  code?: string;
}

export interface ChancedeeHealthResponse {
  status: string;
  timestamp: string;
  version: string;
  configuration?: {
    templatesConfigured: number;
    templatesCached: number;
    guidanceAvailable: number;
    systemPromptsLoaded: boolean;
  };
  environment?: {
    nodeVersion: string;
    hasAnthropicKey: boolean;
    templateBucket: string;
  };
}

export interface ChancedeeApiError extends Error {
  statusCode?: number;
  code?: string;
}

export class ChancedeeApiClient {
  private baseUrl: string;
  private timeout: number;

  constructor(baseUrl: string, timeout = 60000) {
    this.baseUrl = baseUrl.replace(/\/$/, ""); // Remove trailing slash
    this.timeout = timeout;
  }

  /**
   * Generate a resume using the Chancedee API
   */
  async generateResume(request: ChancedeeRequest): Promise<ChancedeeResponse> {
    const validation = this.validateRequest(request);
    if (!validation.valid) {
      throw this.createError(
        validation.error || "Validation failed",
        400,
        "VALIDATION_ERROR",
      );
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      // Always use proxy API to avoid CORS issues
      const apiUrl = "/api/generate-resume";

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const result = await response.json();

      if (!response.ok) {
        throw this.createError(
          result.error || `HTTP ${response.status}`,
          response.status,
          result.code || "HTTP_ERROR",
        );
      }

      return result;
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw this.createError("Request timeout", 408, "TIMEOUT_ERROR");
        }
        throw error;
      }
      throw this.createError("Unknown error occurred", 500, "UNKNOWN_ERROR");
    }
  }

  /**
   * Check API health status
   */
  async healthCheck(): Promise<ChancedeeHealthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw this.createError(
          result.error || `Health check failed: HTTP ${response.status}`,
          response.status,
          "HEALTH_CHECK_ERROR",
        );
      }

      return result;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw this.createError("Health check failed", 500, "HEALTH_CHECK_ERROR");
    }
  }

  /**
   * Get available templates
   */
  getAvailableTemplates(): Array<{
    id: TemplateType;
    name: string;
    category: string;
  }> {
    return [
      {
        id: "fresh-graduate-academic",
        name: "Fresh Graduate - Academic Focus",
        category: "fresh-graduate",
      },
      {
        id: "fresh-graduate-liberal",
        name: "Fresh Graduate - Liberal Arts",
        category: "fresh-graduate",
      },
      {
        id: "fresh-graduate-project",
        name: "Fresh Graduate - Project Based",
        category: "fresh-graduate",
      },
      {
        id: "career-up-it",
        name: "Career Up - IT Professional",
        category: "professional",
      },
      {
        id: "career-up-business",
        name: "Career Up - Business Professional",
        category: "professional",
      },
    ];
  }

  /**
   * Validate request data
   */
  private validateRequest(request: ChancedeeRequest): {
    valid: boolean;
    error?: string;
  } {
    if (!request || typeof request !== "object") {
      return {
        valid: false,
        error: "Request is required and must be an object",
      };
    }

    const { userData, templateType } = request;

    if (!userData || typeof userData !== "object") {
      return {
        valid: false,
        error: "userData is required and must be an object",
      };
    }

    // Required fields validation
    const requiredFields: (keyof ChancedeeUserData)[] = [
      "name",
      "email",
      "position",
    ];
    for (const field of requiredFields) {
      const value = userData[field];
      if (!value || typeof value !== "string" || value.trim() === "") {
        return {
          valid: false,
          error: `userData.${field} is required and must be a non-empty string`,
        };
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      return { valid: false, error: "Invalid email format" };
    }

    // Template validation
    if (!templateType || typeof templateType !== "string") {
      return {
        valid: false,
        error: "templateType is required and must be a string",
      };
    }

    const validTemplates = this.getAvailableTemplates().map((t) => t.id);
    if (!validTemplates.includes(templateType)) {
      return {
        valid: false,
        error: `Invalid template type. Must be one of: ${validTemplates.join(", ")}`,
      };
    }

    return { valid: true };
  }

  /**
   * Create a standardized error object
   */
  private createError(
    message: string,
    statusCode?: number,
    code?: string,
  ): ChancedeeApiError {
    const error = new Error(message) as ChancedeeApiError;
    error.statusCode = statusCode;
    error.code = code;
    return error;
  }
}

/**
 * Default API client instance
 * Uses environment variables for configuration
 */
export function createChancedeeClient(
  baseUrl?: string,
  timeout?: number,
): ChancedeeApiClient {
  const apiUrl = baseUrl || process.env.NEXT_PUBLIC_CHANCEDEE_API_URL;

  if (!apiUrl) {
    // For development, use a placeholder URL that will show proper error messages
    console.warn(
      "Chancedee API URL not configured. Set NEXT_PUBLIC_CHANCEDEE_API_URL environment variable.",
    );
    return new ChancedeeApiClient("https://placeholder-api-url.com", timeout);
  }

  return new ChancedeeApiClient(apiUrl, timeout);
}

/**
 * Utility function to extract structured data from chat messages
 * This helps convert conversational data into ChancedeeUserData format
 */
export function extractUserDataFromMessages(
  messages: Array<{ role: string; content: string }>,
): Partial<ChancedeeUserData> {
  const userData: Partial<ChancedeeUserData> = {};

  // Combine all user messages
  const userText = messages
    .filter((m) => m.role === "user")
    .map((m) => m.content)
    .join(" ");

  // Extract email
  const emailMatch = userText.match(/[\w\.-]+@[\w\.-]+\.\w+/);
  if (emailMatch) {
    userData.email = emailMatch[0];
  }

  // Extract phone
  const phoneMatch = userText.match(
    /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/,
  );
  if (phoneMatch) {
    userData.phone = phoneMatch[0];
  }

  // This is a basic implementation - you may want to use more sophisticated
  // NLP or AI-powered extraction for better results

  return userData;
}
