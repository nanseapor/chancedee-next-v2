/**
 * API Client for ChanceDee Resume Builder
 * Integrates with the new Cloud Run backend service
 */

// API Configuration
export const API_CONFIG = {
  API_BASE:
    "https://resume-builder-agent-gen1-1023714844724.asia-southeast1.run.app",
  VERSION: "4.3.0-centralized",
  APPROACH: "client-controlled",
  TIMEOUT: 30000, // 30 seconds
  MAX_RETRIES: 3,
} as const;

// Template Configuration
export const TEMPLATES = {
  "fresh-graduate-academic": {
    name: "Fresh Graduate - Academic Focus",
    category: "fresh-graduate",
    description: "สำหรับ Fresh Graduate ที่เน้นผลการเรียนและไม่มีประสบการณ์การทำงานมาก",
  },
  "fresh-graduate-liberal": {
    name: "Fresh Graduate - Liberal Arts",
    category: "fresh-graduate",
    description: "สำหรับ Fresh Graduate สายศิลปศาสตร์ที่เน้นกิจกรรมและ Leadership",
  },
  "fresh-graduate-project": {
    name: "Fresh Graduate - Project Based",
    category: "fresh-graduate",
    description: "สำหรับ Fresh Graduate ที่มีโปรเจคต์และประสบการณ์ฝึกงาน",
  },
  "career-up-it": {
    name: "Career Up - IT Professional",
    category: "professional",
    description: "สำหรับผู้เชี่ยวชาญด้าน IT ที่ต้องการเลื่อนตำแหน่ง",
  },
  "career-up-business": {
    name: "Career Up - Business Professional",
    category: "professional",
    description: "สำหรับผู้เชี่ยวชาญด้านธุรกิจที่ต้องการเลื่อนตำแหน่ง",
  },
} as const;

// Type definitions
export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  metadata?: {
    tokenUsage?: TokenUsage;
    extractedData?: Record<string, any>;
    error?: boolean;
  };
}

export interface TokenUsage {
  prompt: number;
  completion: number;
  total: number;
}

export interface UserData {
  name?: string;
  email?: string;
  phone?: string;
  position?: string;
  gpa?: string;
  university?: string;
  major?: string;
  graduationYear?: string;
  skills?: string[];
  projects?: string[];
  experience?: string[];
  certifications?: string[];
  languages?: string[];
  [key: string]: any;
}

export interface Template {
  name: string;
  category: "fresh-graduate" | "professional";
  description: string;
}

// API Request/Response types
export interface HealthResponse {
  status: "healthy" | "unhealthy";
  model?: string;
  platform?: string;
  configuration?: {
    configurationCentralized: boolean;
  };
  timestamp: string;
}

export interface ChatRequest {
  message: string;
  conversationHistory: Array<{
    role: "user" | "assistant" | "system";
    content: string;
  }>;
  userData: UserData;
  templateType?: string;
  sessionId: string;
  clientInfo: {
    version: string;
    approach: string;
    userAgent: string;
    timestamp: number;
    timezone: string;
    screen: {
      width: number;
      height: number;
    };
  };
}

export interface ChatResponse {
  success: boolean;
  message: string;
  extractedData?: Record<string, any>;
  updatedUserData?: UserData;
  metadata?: {
    tokenUsage?: TokenUsage;
  };
  error?: string;
}

export interface GenerateResumeRequest {
  conversationHistory: Array<{
    role: "user" | "assistant" | "system";
    content: string;
  }>;
  userData: UserData;
  templateType: string;
  sessionId: string;
}

export interface GenerateResumeResponse {
  success: boolean;
  data: {
    htmlContent: string;
    templateName: string;
    templateUsed: string;
    approach: string;
    configuration: string;
    conversationLength: number;
    tokenUsage: TokenUsage;
    metadata: {
      generationTime: number;
    };
  };
  error?: string;
}

export interface TemplatesResponse {
  success: boolean;
  templates: Record<string, Template>;
  summary: {
    total: number;
    cached: number;
  };
  bucket: string;
  configuration: string;
  error?: string;
}

// Error types
export interface APIError {
  type: "network" | "server" | "validation" | "timeout";
  message: string;
  code?: number;
  details?: any;
}

export class APIErrorHandler {
  static handle(error: any): APIError {
    // Network errors
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      return {
        type: "network",
        message:
          "Network connection failed. Please check your internet connection.",
      };
    }

    // Timeout errors
    if (error.name === "AbortError") {
      return {
        type: "timeout",
        message: "Request timed out. Please try again.",
      };
    }

    // Server errors
    if (error.status >= 500) {
      return {
        type: "server",
        message: "Server error. Please try again later.",
        code: error.status,
      };
    }

    // Validation errors
    if (error.status >= 400 && error.status < 500) {
      return {
        type: "validation",
        message: error.message || "Request validation failed.",
        code: error.status,
      };
    }

    // Default error
    return {
      type: "network",
      message: error.message || "An unexpected error occurred.",
    };
  }
}

// Utility functions
function createAbortController(timeoutMs: number): AbortController {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), timeoutMs);
  return controller;
}

function generateSessionId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const userAgent = navigator.userAgent
    .substring(0, 20)
    .replace(/[^a-zA-Z0-9]/g, "");
  return `client_${timestamp}_${userAgent}_${random}`;
}

function getClientInfo() {
  return {
    version: API_CONFIG.VERSION,
    approach: API_CONFIG.APPROACH,
    userAgent: navigator.userAgent,
    timestamp: Date.now(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    screen: {
      width: screen.width,
      height: screen.height,
    },
  };
}

// Retry logic with exponential backoff
async function retryRequest<T>(
  requestFn: () => Promise<T>,
  maxRetries: number = API_CONFIG.MAX_RETRIES,
  baseDelay = 1000,
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error as Error;

      // Don't retry on validation errors
      if (
        error instanceof Error &&
        "status" in error &&
        (error as any).status >= 400 &&
        (error as any).status < 500
      ) {
        throw error;
      }

      if (attempt === maxRetries) {
        throw error;
      }

      // Exponential backoff
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

// API Client functions
export const apiClient = {
  /**
   * Check API health status
   */
  async checkHealth(): Promise<HealthResponse> {
    const controller = createAbortController(API_CONFIG.TIMEOUT);

    try {
      const response = await retryRequest(async () => {
        const res = await fetch(`${API_CONFIG.API_BASE}/health`, {
          signal: controller.signal,
        });

        if (!res.ok) {
          const error = new Error(`Health check failed: ${res.status}`) as any;
          error.status = res.status;
          throw error;
        }

        return res.json();
      });

      return response;
    } catch (error) {
      const apiError = APIErrorHandler.handle(error);
      throw new Error(apiError.message);
    }
  },

  /**
   * Send chat message and receive AI response
   */
  async sendChatMessage(
    message: string,
    conversationHistory: ChatMessage[],
    userData: UserData,
    templateType?: string,
    sessionId?: string,
  ): Promise<ChatResponse> {
    const controller = createAbortController(API_CONFIG.TIMEOUT);

    try {
      const response = await retryRequest(async () => {
        const res = await fetch(`${API_CONFIG.API_BASE}/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message,
            conversationHistory: conversationHistory.map((msg) => ({
              role: msg.role,
              content: msg.content,
            })),
            userData,
            templateType,
            sessionId: sessionId || generateSessionId(),
            clientInfo: getClientInfo(),
          } as ChatRequest),
          signal: controller.signal,
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          const error = new Error(
            errorData.error || `Chat API error: ${res.status}`,
          ) as any;
          error.status = res.status;
          throw error;
        }

        return res.json();
      });

      return response;
    } catch (error) {
      const apiError = APIErrorHandler.handle(error);
      throw new Error(apiError.message);
    }
  },

  /**
   * Generate resume from conversation and user data
   */
  async generateResume(
    conversationHistory: ChatMessage[],
    userData: UserData,
    templateType: string,
    sessionId?: string,
  ): Promise<GenerateResumeResponse> {
    const controller = createAbortController(API_CONFIG.TIMEOUT);

    try {
      const response = await retryRequest(async () => {
        const res = await fetch(`${API_CONFIG.API_BASE}/generate-resume`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            conversationHistory: conversationHistory.map((msg) => ({
              role: msg.role,
              content: msg.content,
            })),
            userData,
            templateType,
            sessionId: sessionId || generateSessionId(),
          } as GenerateResumeRequest),
          signal: controller.signal,
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          const error = new Error(
            errorData.error || `Resume generation error: ${res.status}`,
          ) as any;
          error.status = res.status;
          throw error;
        }

        return res.json();
      });

      return response;
    } catch (error) {
      const apiError = APIErrorHandler.handle(error);
      throw new Error(apiError.message);
    }
  },

  /**
   * Get available resume templates
   */
  async getTemplates(): Promise<TemplatesResponse> {
    const controller = createAbortController(API_CONFIG.TIMEOUT);

    try {
      const response = await retryRequest(async () => {
        const res = await fetch(`${API_CONFIG.API_BASE}/templates`, {
          signal: controller.signal,
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          const error = new Error(
            errorData.error || `Templates API error: ${res.status}`,
          ) as any;
          error.status = res.status;
          throw error;
        }

        return res.json();
      });

      return response;
    } catch (error) {
      const apiError = APIErrorHandler.handle(error);
      throw new Error(apiError.message);
    }
  },

  /**
   * Refresh templates cache
   */
  async refreshTemplates(): Promise<TemplatesResponse> {
    const controller = createAbortController(API_CONFIG.TIMEOUT);

    try {
      const response = await retryRequest(async () => {
        const res = await fetch(`${API_CONFIG.API_BASE}/templates/refresh`, {
          method: "POST",
          signal: controller.signal,
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          const error = new Error(
            errorData.error || `Template refresh error: ${res.status}`,
          ) as any;
          error.status = res.status;
          throw error;
        }

        return res.json();
      });

      return response;
    } catch (error) {
      const apiError = APIErrorHandler.handle(error);
      throw new Error(apiError.message);
    }
  },

  /**
   * Debug: Basic API test
   */
  async testBasicAPI(): Promise<any> {
    const controller = createAbortController(API_CONFIG.TIMEOUT);

    try {
      const response = await retryRequest(async () => {
        const res = await fetch(`${API_CONFIG.API_BASE}/debug/basic-test`, {
          signal: controller.signal,
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          const error = new Error(
            errorData.error || `Debug API error: ${res.status}`,
          ) as any;
          error.status = res.status;
          throw error;
        }

        return res.json();
      });

      return response;
    } catch (error) {
      const apiError = APIErrorHandler.handle(error);
      throw new Error(apiError.message);
    }
  },

  /**
   * Debug: Check configuration
   */
  async checkConfig(): Promise<any> {
    const controller = createAbortController(API_CONFIG.TIMEOUT);

    try {
      const response = await retryRequest(async () => {
        const res = await fetch(`${API_CONFIG.API_BASE}/debug/config`, {
          signal: controller.signal,
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          const error = new Error(
            errorData.error || `Config check error: ${res.status}`,
          ) as any;
          error.status = res.status;
          throw error;
        }

        return res.json();
      });

      return response;
    } catch (error) {
      const apiError = APIErrorHandler.handle(error);
      throw new Error(apiError.message);
    }
  },
};

// Export utilities
export { generateSessionId, getClientInfo };
