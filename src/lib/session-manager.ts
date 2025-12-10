/**
 * Session Manager for ChanceDee Resume Builder
 * Handles client-side session management and data persistence
 */

import type { ChatMessage, UserData } from "./api-client";

// Storage Configuration
export const STORAGE_CONFIG = {
  STORAGE_KEY: "chancedee_conversation_v4",
  VERSION: "4.3.0-centralized",
  APPROACH: "client-controlled",
  MAX_CONVERSATION_LENGTH: 50,
  MAX_STORAGE_SIZE: 10 * 1024 * 1024, // 10MB
  AUTO_SAVE_INTERVAL: 30000, // 30 seconds
} as const;

// Session data structure
export interface SessionData {
  sessionId: string;
  conversationHistory: ChatMessage[];
  userData: UserData;
  templateType?: string;
  lastResumeHTML?: string;
  metadata: {
    version: string;
    approach: string;
    createdAt: string;
    lastUpdated: string;
    messageCount: number;
    dataFieldCount: number;
    hasResume: boolean;
  };
}

// Storage statistics
export interface StorageStats {
  totalSize: number;
  maxSize: number;
  usagePercent: number;
  messages: number;
  dataFields: number;
  hasResume: boolean;
  resumeSize: number;
  lastUpdated: string;
}

// Session manager class
export class SessionManager {
  private sessionId: string;
  private autoSaveInterval: NodeJS.Timeout | null = null;
  private data: SessionData;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.data = this.createEmptySession();
    this.loadFromStorage();
    this.startAutoSave();

    console.log("🔐 Session initialized:", this.sessionId);
  }

  /**
   * Generate a unique session ID
   */
  generateSessionId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const userAgent =
      typeof navigator !== "undefined"
        ? navigator.userAgent.substring(0, 20).replace(/[^a-zA-Z0-9]/g, "")
        : "server";
    return `client_${timestamp}_${userAgent}_${random}`;
  }

  /**
   * Create empty session data
   */
  private createEmptySession(): SessionData {
    return {
      sessionId: this.sessionId,
      conversationHistory: [],
      userData: {},
      templateType: undefined,
      lastResumeHTML: undefined,
      metadata: {
        version: STORAGE_CONFIG.VERSION,
        approach: STORAGE_CONFIG.APPROACH,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        messageCount: 0,
        dataFieldCount: 0,
        hasResume: false,
      },
    };
  }

  /**
   * Update session metadata
   */
  private updateMetadata(): void {
    this.data.metadata = {
      ...this.data.metadata,
      lastUpdated: new Date().toISOString(),
      messageCount: this.data.conversationHistory.length,
      dataFieldCount: Object.keys(this.data.userData).length,
      hasResume: !!this.data.lastResumeHTML,
    };
  }

  /**
   * Add message to conversation history
   */
  addMessage(message: ChatMessage): void {
    this.data.conversationHistory.push(message);

    // Limit conversation length
    if (
      this.data.conversationHistory.length >
      STORAGE_CONFIG.MAX_CONVERSATION_LENGTH
    ) {
      this.data.conversationHistory = this.data.conversationHistory.slice(
        -STORAGE_CONFIG.MAX_CONVERSATION_LENGTH,
      );
    }

    this.updateMetadata();
  }

  /**
   * Update user data
   */
  updateUserData(newData: UserData): void {
    this.data.userData = { ...this.data.userData, ...newData };
    this.updateMetadata();
  }

  /**
   * Set template type
   */
  setTemplateType(templateType: string): void {
    this.data.templateType = templateType;
    this.updateMetadata();
  }

  /**
   * Set generated resume HTML
   */
  setResumeHTML(html: string): void {
    this.data.lastResumeHTML = html;
    this.updateMetadata();
  }

  /**
   * Get session ID
   */
  getSessionId(): string {
    return this.sessionId;
  }

  /**
   * Get conversation history
   */
  getConversationHistory(): ChatMessage[] {
    return [...this.data.conversationHistory];
  }

  /**
   * Get user data
   */
  getUserData(): UserData {
    return { ...this.data.userData };
  }

  /**
   * Get template type
   */
  getTemplateType(): string | undefined {
    return this.data.templateType;
  }

  /**
   * Get resume HTML
   */
  getResumeHTML(): string | undefined {
    return this.data.lastResumeHTML;
  }

  /**
   * Get session metadata
   */
  getMetadata(): SessionData["metadata"] {
    return { ...this.data.metadata };
  }

  /**
   * Save data to localStorage
   */
  saveToStorage(): void {
    if (typeof window === "undefined") return;

    try {
      this.updateMetadata();
      const dataString = JSON.stringify(this.data);

      // Check size limit
      if (dataString.length > STORAGE_CONFIG.MAX_STORAGE_SIZE) {
        console.warn("⚠️ Data size exceeds limit, trimming conversation...");
        this.data.conversationHistory =
          this.data.conversationHistory.slice(-20);
        this.updateMetadata();
        return this.saveToStorage(); // Recursive call with trimmed data
      }

      localStorage.setItem(STORAGE_CONFIG.STORAGE_KEY, dataString);
      console.log("💾 Session data saved successfully");
    } catch (error) {
      console.error("💥 Storage error:", error);
    }
  }

  /**
   * Load data from localStorage
   */
  loadFromStorage(): void {
    if (typeof window === "undefined") return;

    try {
      const stored = localStorage.getItem(STORAGE_CONFIG.STORAGE_KEY);
      if (stored) {
        const parsedData = JSON.parse(stored) as SessionData;

        // Validate data structure
        if (
          parsedData.conversationHistory &&
          Array.isArray(parsedData.conversationHistory)
        ) {
          this.data = {
            ...this.data,
            conversationHistory: parsedData.conversationHistory,
            userData: parsedData.userData || {},
            templateType: parsedData.templateType,
            lastResumeHTML: parsedData.lastResumeHTML,
            metadata: parsedData.metadata || this.data.metadata,
          };

          console.log("📚 Session data loaded successfully");
          console.log(
            `📊 Loaded ${this.data.conversationHistory.length} messages`,
          );
        }
      }
    } catch (error) {
      console.error("💥 Load error:", error);
    }
  }

  /**
   * Clear all session data
   */
  clearAll(): void {
    this.data = this.createEmptySession();

    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_CONFIG.STORAGE_KEY);
    }

    console.log("🗑️ Session data cleared");
  }

  /**
   * Export session data
   */
  exportData(): SessionData & { exportedAt: string } {
    this.updateMetadata();
    return {
      ...this.data,
      exportedAt: new Date().toISOString(),
    };
  }

  /**
   * Import session data
   */
  importData(data: SessionData): boolean {
    try {
      // Validate imported data
      if (
        !data.conversationHistory ||
        !Array.isArray(data.conversationHistory)
      ) {
        throw new Error("Invalid conversation history");
      }

      this.data = {
        ...this.data,
        conversationHistory: data.conversationHistory,
        userData: data.userData || {},
        templateType: data.templateType,
        lastResumeHTML: data.lastResumeHTML,
        metadata: data.metadata || this.data.metadata,
      };

      this.updateMetadata();
      this.saveToStorage();

      console.log("📥 Session data imported successfully");
      return true;
    } catch (error) {
      console.error("💥 Import error:", error);
      return false;
    }
  }

  /**
   * Get storage statistics
   */
  getStorageStats(): StorageStats {
    const dataString = JSON.stringify(this.data);

    return {
      totalSize: dataString.length,
      maxSize: STORAGE_CONFIG.MAX_STORAGE_SIZE,
      usagePercent: Math.round(
        (dataString.length / STORAGE_CONFIG.MAX_STORAGE_SIZE) * 100,
      ),
      messages: this.data.conversationHistory.length,
      dataFields: Object.keys(this.data.userData).length,
      hasResume: !!this.data.lastResumeHTML,
      resumeSize: this.data.lastResumeHTML
        ? this.data.lastResumeHTML.length
        : 0,
      lastUpdated: this.data.metadata.lastUpdated,
    };
  }

  /**
   * Start auto-save interval
   */
  private startAutoSave(): void {
    if (typeof window === "undefined") return;

    this.autoSaveInterval = setInterval(() => {
      this.saveToStorage();
    }, STORAGE_CONFIG.AUTO_SAVE_INTERVAL);
  }

  /**
   * Stop auto-save and cleanup
   */
  destroy(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
    }

    // Final save
    this.saveToStorage();

    console.log("🔚 Session manager destroyed");
  }

  /**
   * Check if storage is available
   */
  static isStorageAvailable(): boolean {
    if (typeof window === "undefined") return false;

    try {
      const testKey = "chancedee_storage_test";
      const testValue = "test";

      localStorage.setItem(testKey, testValue);
      const retrieved = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);

      return retrieved === testValue;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get browser storage quota info
   */
  static async getStorageQuota(): Promise<{
    quota: number;
    usage: number;
    usagePercent: number;
  } | null> {
    if (
      typeof window === "undefined" ||
      !("storage" in navigator) ||
      !("estimate" in navigator.storage)
    ) {
      return null;
    }

    try {
      const estimate = await navigator.storage.estimate();
      return {
        quota: estimate.quota || 0,
        usage: estimate.usage || 0,
        usagePercent:
          estimate.quota && estimate.usage
            ? Math.round((estimate.usage / estimate.quota) * 100)
            : 0,
      };
    } catch (error) {
      console.error("Storage quota check failed:", error);
      return null;
    }
  }

  /**
   * Test storage functionality
   */
  static testStorage(): {
    available: boolean;
    error?: string;
    testSize?: number;
  } {
    if (typeof window === "undefined") {
      return { available: false, error: "Window not available" };
    }

    try {
      const testKey = "chancedee_storage_test_" + Date.now();
      const testData = {
        test: "data",
        timestamp: Date.now(),
        version: STORAGE_CONFIG.VERSION,
        approach: STORAGE_CONFIG.APPROACH,
        largeData: "x".repeat(1000), // 1KB test data
      };

      // Test write
      const testString = JSON.stringify(testData);
      localStorage.setItem(testKey, testString);

      // Test read
      const retrieved = localStorage.getItem(testKey);
      const parsed = JSON.parse(retrieved || "{}");

      // Test delete
      localStorage.removeItem(testKey);

      // Verify data integrity
      const matches = JSON.stringify(testData) === JSON.stringify(parsed);

      return {
        available: matches,
        testSize: testString.length,
        error: matches ? undefined : "Data integrity check failed",
      };
    } catch (error) {
      return {
        available: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}

// Export singleton instance
export const sessionManager = new SessionManager();

// Export for testing
export default SessionManager;
