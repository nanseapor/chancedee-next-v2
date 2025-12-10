/**
 * ClientConversationManager - Exact implementation from prototype
 * Based on chancedee_web_prototype.html v4.3.0
 */

interface ConversationMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  metadata?: any;
}

interface ClientInfo {
  version: string;
  approach: string;
  userAgent: string;
  timestamp: number;
  timezone: string;
  screen: {
    width: number;
    height: number;
  };
}

interface ChatResponse {
  success: boolean;
  message: string;
  updatedUserData?: any;
  metadata?: {
    tokenUsage?: any;
    extractedData?: any;
  };
  error?: string;
}

interface ResumeResponse {
  success: boolean;
  data?: {
    htmlContent: string;
    templateUsed: string;
    templateName: string;
  };
  error?: string;
}

const CONFIG = {
  API_BASE:
    "https://resume-builder-agent-gen1-1023714844724.asia-southeast1.run.app",
  VERSION: "4.3.0-centralized",
  APPROACH: "client-controlled",
  STORAGE_KEY: "chancedee_conversation_v4",
  MAX_CONVERSATION_LENGTH: 50,
  MAX_STORAGE_SIZE: 10 * 1024 * 1024, // 10MB
  AUTO_SAVE_INTERVAL: 30000, // 30 seconds

  TEMPLATES: {
    "fresh-graduate-academic": {
      name: "Fresh Graduate - Academic Focus",
      category: "fresh-graduate",
      description:
        "สำหรับ Fresh Graduate ที่เน้นผลการเรียนและไม่มีประสบการณ์การทำงานมาก",
    },
    "fresh-graduate-project": {
      name: "Fresh Graduate - Project Based",
      category: "fresh-graduate",
      description: "สำหรับ Fresh Graduate ที่เน้นโปรเจคและงานที่เคยทำ",
    },
    "experienced-professional": {
      name: "Experienced Professional",
      category: "experienced",
      description: "สำหรับผู้ที่มีประสบการณ์การทำงานแล้ว",
    },
    "career-changer": {
      name: "Career Changer",
      category: "career-change",
      description: "สำหรับผู้ที่ต้องการเปลี่ยนสายอาชีพ",
    },
    "executive-manager": {
      name: "Executive/Manager",
      category: "executive",
      description: "สำหรับผู้บริหารและผู้จัดการ",
    },
  },
};

export class ClientConversationManager {
  public sessionId: string;
  public conversationHistory: ConversationMessage[] = [];
  public userData: any = {};
  public templateType: string | null = null;
  public lastResumeHTML: string | null = null;
  public metadata: any;

  private listeners: Array<() => void> = [];
  private autoSaveInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.metadata = {
      version: CONFIG.VERSION,
      approach: CONFIG.APPROACH,
      createdAt: new Date().toISOString(),
      lastUpdated: null,
    };

    this.loadFromStorage();
    this.startAutoSave();
  }

  private generateSessionId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `client_${timestamp}_server_${random}`;
  }

  private updateMetadata(): void {
    this.metadata.lastUpdated = new Date().toISOString();
    this.metadata.messageCount = this.conversationHistory.length;
    this.metadata.userDataKeys = Object.keys(this.userData).length;
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (error) {
        console.error("Error in listener:", error);
      }
    });
  }

  public addListener(listener: () => void): void {
    this.listeners.push(listener);
  }

  public removeListener(listener: () => void): void {
    this.listeners = this.listeners.filter((l) => l !== listener);
  }

  public addMessage(
    role: "user" | "assistant" | "system",
    content: string,
    metadata: any = {},
  ): ConversationMessage {
    const message: ConversationMessage = {
      role,
      content,
      timestamp: new Date().toISOString(),
      metadata,
    };

    this.conversationHistory.push(message);

    // Limit conversation length
    if (this.conversationHistory.length > CONFIG.MAX_CONVERSATION_LENGTH) {
      this.conversationHistory = this.conversationHistory.slice(
        -CONFIG.MAX_CONVERSATION_LENGTH,
      );
    }

    this.updateMetadata();
    this.saveToStorage();
    this.notifyListeners();

    return message;
  }

  public async sendMessage(
    message: string,
    templateType: string | null = null,
  ): Promise<ChatResponse> {
    // Add user message to local history
    this.addMessage("user", message, { templateType });

    // Set template if provided
    if (templateType) {
      this.setTemplateType(templateType);
    }

    try {
      // Clean conversation history for API (exclude the last message we just added)
      const cleanHistory = this.conversationHistory.slice(0, -1).map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await fetch(`${CONFIG.API_BASE}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: message,
          conversationHistory: cleanHistory,
          userData: this.userData,
          templateType: this.templateType,
          sessionId: this.sessionId,
          clientInfo: {
            version: CONFIG.VERSION,
            approach: CONFIG.APPROACH,
            userAgent: navigator.userAgent,
            timestamp: Date.now(),
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            screen: {
              width: screen.width,
              height: screen.height,
            },
          } as ClientInfo,
        }),
      });

      const data: ChatResponse = await response.json();

      if (data.success) {
        // Add assistant response to local history
        this.addMessage("assistant", data.message, {
          tokenUsage: data.metadata?.tokenUsage,
          extractedData: data.metadata?.extractedData,
        });

        // Update user data with extracted info
        if (data.updatedUserData) {
          this.updateUserData(data.updatedUserData);
        }

        return data;
      } else {
        throw new Error(data.error || "Unknown error");
      }
    } catch (error) {
      console.error("💥 Send message error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      this.addMessage("system", `❌ Error: ${errorMessage}`, { error: true });
      throw error;
    }
  }

  public async generateResume(
    manualUserData: any = null,
  ): Promise<ResumeResponse> {
    const dataToUse = manualUserData || this.userData;

    try {
      // Clean conversation history for API
      const cleanHistory = this.conversationHistory.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await fetch(`${CONFIG.API_BASE}/generate-resume`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversationHistory: cleanHistory,
          userData: dataToUse,
          templateType: this.templateType || "fresh-graduate-project",
          sessionId: this.sessionId,
        }),
      });

      const data: ResumeResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Resume generation failed");
      }

      // Store the HTML for download/copy
      if (data.data?.htmlContent) {
        this.lastResumeHTML = data.data.htmlContent;
        this.updateMetadata();
        this.saveToStorage();
      }

      return data;
    } catch (error) {
      console.error("💥 Resume generation error:", error);
      throw error;
    }
  }

  public updateUserData(newData: any): void {
    this.userData = { ...this.userData, ...newData };
    this.updateMetadata();
    this.saveToStorage();
    this.notifyListeners();
  }

  public setTemplateType(templateType: string): void {
    this.templateType = templateType;
    this.updateMetadata();
    this.saveToStorage();
    this.notifyListeners();
  }

  public clearConversation(): void {
    this.conversationHistory = [];
    this.userData = {};
    this.templateType = null;
    this.lastResumeHTML = null;
    this.updateMetadata();
    this.saveToStorage();
    this.notifyListeners();
  }

  public saveToStorage(): void {
    try {
      const data = this.exportData();
      const dataString = JSON.stringify(data);

      // Check size limit
      if (dataString.length > CONFIG.MAX_STORAGE_SIZE) {
        console.warn("⚠️ Data size exceeds limit, trimming conversation...");
        this.conversationHistory = this.conversationHistory.slice(-20);
        return this.saveToStorage(); // Recursive call with trimmed data
      }

      localStorage.setItem(CONFIG.STORAGE_KEY, dataString);
    } catch (error) {
      console.error("💥 Storage error:", error);
    }
  }

  public loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(CONFIG.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);

        // Load data
        this.conversationHistory = data.conversationHistory || [];
        this.userData = data.userData || {};
        this.templateType = data.templateType || null;
        this.lastResumeHTML = data.lastResumeHTML || null;
        this.metadata = data.metadata || this.metadata;

        this.notifyListeners();
      }
    } catch (error) {
      console.error("💥 Load error:", error);
    }
  }

  public exportData(): any {
    return {
      sessionId: this.sessionId,
      conversationHistory: this.conversationHistory,
      userData: this.userData,
      templateType: this.templateType,
      lastResumeHTML: this.lastResumeHTML,
      metadata: this.metadata,
    };
  }

  public importData(data: any): boolean {
    try {
      this.conversationHistory = data.conversationHistory || [];
      this.userData = data.userData || {};
      this.templateType = data.templateType || null;
      this.lastResumeHTML = data.lastResumeHTML || null;
      this.metadata = data.metadata || this.metadata;

      this.saveToStorage();
      this.notifyListeners();
      return true;
    } catch (error) {
      console.error("💥 Import error:", error);
      return false;
    }
  }

  public async checkHealth(): Promise<any> {
    try {
      const response = await fetch(`${CONFIG.API_BASE}/health`);
      return await response.json();
    } catch (error) {
      console.error("💥 Health check error:", error);
      throw error;
    }
  }

  private startAutoSave(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }

    this.autoSaveInterval = setInterval(() => {
      this.saveToStorage();
    }, CONFIG.AUTO_SAVE_INTERVAL);
  }

  public destroy(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }
    this.listeners = [];
  }
}

export { CONFIG };
