/**
 * Test for Chat Implementation
 * Based on prototype logic from chancedee_web_prototype.html
 */

import { ClientConversationManager } from "@/lib/client-conversation-manager";

// Mock localStorage for testing
const mockLocalStorage = {
  data: {} as Record<string, string>,
  getItem: function (key: string) {
    return this.data[key] || null;
  },
  setItem: function (key: string, value: string) {
    this.data[key] = value;
  },
  clear: function () {
    this.data = {};
  },
};

// Mock fetch for testing
global.fetch = jest.fn();

// Mock global objects
Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
  writable: true,
});

Object.defineProperty(window, "screen", {
  value: { width: 1920, height: 1080 },
  writable: true,
});

Object.defineProperty(window, "navigator", {
  value: { userAgent: "test-agent" },
  writable: true,
});

// Mock Intl.DateTimeFormat
Object.defineProperty(Intl, "DateTimeFormat", {
  value: () => ({
    resolvedOptions: () => ({ timeZone: "Asia/Bangkok" }),
  }),
  writable: true,
});

describe("Chat Implementation Test", () => {
  let manager: ClientConversationManager;

  beforeEach(() => {
    // Clear localStorage before each test
    mockLocalStorage.clear();

    // Reset fetch mock
    (global.fetch as jest.Mock).mockClear();

    // Create new manager instance
    manager = new ClientConversationManager();
  });

  afterEach(() => {
    manager.destroy();
  });

  test("should initialize with empty conversation", () => {
    expect(manager.conversationHistory).toEqual([]);
    expect(manager.userData).toEqual({});
    expect(manager.templateType).toBeNull();
    expect(manager.sessionId).toMatch(/^client_\d+_server_\w+$/);
  });

  test("should add messages correctly", () => {
    const message = manager.addMessage(
      "user",
      "Hello, I need help with my resume",
    );

    expect(message.role).toBe("user");
    expect(message.content).toBe("Hello, I need help with my resume");
    expect(message.timestamp).toBeDefined();
    expect(manager.conversationHistory).toHaveLength(1);
    expect(manager.conversationHistory[0]).toEqual(message);
  });

  test("should update user data correctly", () => {
    const testData = {
      name: "John Doe",
      email: "john@example.com",
      position: "Software Engineer",
    };

    manager.updateUserData(testData);

    expect(manager.userData).toEqual(testData);
  });

  test("should save and load from localStorage", () => {
    // Add some test data
    manager.addMessage("user", "Test message");
    manager.updateUserData({ name: "Test User" });
    manager.setTemplateType("fresh-graduate-project");

    // Create new manager to test loading
    const newManager = new ClientConversationManager();

    expect(newManager.conversationHistory).toHaveLength(1);
    expect(newManager.conversationHistory[0].content).toBe("Test message");
    expect(newManager.userData.name).toBe("Test User");
    expect(newManager.templateType).toBe("fresh-graduate-project");

    newManager.destroy();
  });

  test("should handle sendMessage with mocked API response", async () => {
    // Mock successful API response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        success: true,
        message: "สวัสดีครับ! ผมจะช่วยคุณสร้าง Resume ที่ดี",
        updatedUserData: {
          name: "John Doe",
          position: "Software Engineer",
        },
        metadata: {
          tokenUsage: { total: 100 },
        },
      }),
    });

    const response = await manager.sendMessage(
      "Hello, I need help with my resume",
    );

    expect(response.success).toBe(true);
    expect(response.message).toBe("สวัสดีครับ! ผมจะช่วยคุณสร้าง Resume ที่ดี");
    expect(manager.conversationHistory).toHaveLength(2); // user message + assistant response
    expect(manager.userData.name).toBe("John Doe");
    expect(manager.userData.position).toBe("Software Engineer");
  });

  test("should handle generateResume with mocked API response", async () => {
    // Add some conversation history first
    manager.addMessage("user", "I am a software engineer");
    manager.setTemplateType("fresh-graduate-project");

    // Mock successful API response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        success: true,
        data: {
          htmlContent: "<html><body>Test Resume</body></html>",
          templateUsed: "fresh-graduate-project",
          templateName: "Fresh Graduate - Project Based",
        },
      }),
    });

    const response = await manager.generateResume();

    expect(response.success).toBe(true);
    expect(response.data?.htmlContent).toBe(
      "<html><body>Test Resume</body></html>",
    );
    expect(manager.lastResumeHTML).toBe(
      "<html><body>Test Resume</body></html>",
    );
  });

  test("should handle API errors gracefully", async () => {
    // Mock API error
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error("Network error"),
    );

    try {
      await manager.sendMessage("Test message");
      fail("Expected error to be thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toBe("Network error");
    }

    // Should have user message + error message
    expect(manager.conversationHistory).toHaveLength(2);
    expect(manager.conversationHistory[1].role).toBe("system");
    expect(manager.conversationHistory[1].content).toContain(
      "❌ Error: Network error",
    );
  });

  test("should clear conversation correctly", () => {
    // Add some test data
    manager.addMessage("user", "Test message");
    manager.updateUserData({ name: "Test User" });
    manager.setTemplateType("fresh-graduate-project");
    manager.lastResumeHTML = "<html>test</html>";

    manager.clearConversation();

    expect(manager.conversationHistory).toEqual([]);
    expect(manager.userData).toEqual({});
    expect(manager.templateType).toBeNull();
    expect(manager.lastResumeHTML).toBeNull();
  });

  test("should export and import data correctly", () => {
    // Add test data
    manager.addMessage("user", "Test message");
    manager.updateUserData({ name: "Test User" });
    manager.setTemplateType("fresh-graduate-project");

    const exportedData = manager.exportData();

    expect(exportedData.conversationHistory).toHaveLength(1);
    expect(exportedData.userData.name).toBe("Test User");
    expect(exportedData.templateType).toBe("fresh-graduate-project");

    // Create new manager and import data
    const newManager = new ClientConversationManager();
    newManager.clearConversation(); // Start fresh

    const importSuccess = newManager.importData(exportedData);

    expect(importSuccess).toBe(true);
    expect(newManager.conversationHistory).toHaveLength(1);
    expect(newManager.userData.name).toBe("Test User");
    expect(newManager.templateType).toBe("fresh-graduate-project");

    newManager.destroy();
  });

  test("should not process undefined or null experience data", () => {
    // Test with undefined experience
    manager.updateUserData({
      name: "Test User",
      experience: undefined,
    });

    expect(manager.userData.experience).toBeUndefined();

    // Test with null experience
    manager.updateUserData({
      name: "Test User",
      experience: null,
    });

    expect(manager.userData.experience).toBeNull();

    // Test with non-array experience
    manager.updateUserData({
      name: "Test User",
      experience: "Not an array",
    });

    expect(manager.userData.experience).toBe("Not an array");

    // None of these should cause map function errors
    expect(() => {
      const data = manager.exportData();
      expect(data.userData.experience).toBeDefined();
    }).not.toThrow();
  });
});

// Run the tests
console.log("🧪 Running Chat Implementation Tests...");

export default function runTests() {
  // Simplified test runner for demonstration
  const testResults = {
    passed: 0,
    failed: 0,
    errors: [] as string[],
  };

  try {
    // Test 1: Basic initialization
    const manager1 = new ClientConversationManager();
    if (
      manager1.conversationHistory.length === 0 &&
      manager1.userData &&
      manager1.sessionId
    ) {
      testResults.passed++;
      console.log("✅ Test 1 PASSED: Basic initialization");
    } else {
      testResults.failed++;
      testResults.errors.push("Test 1 FAILED: Basic initialization");
    }
    manager1.destroy();

    // Test 2: Add message
    const manager2 = new ClientConversationManager();
    const message = manager2.addMessage("user", "Test message");
    if (
      message.role === "user" &&
      message.content === "Test message" &&
      manager2.conversationHistory.length === 1
    ) {
      testResults.passed++;
      console.log("✅ Test 2 PASSED: Add message");
    } else {
      testResults.failed++;
      testResults.errors.push("Test 2 FAILED: Add message");
    }
    manager2.destroy();

    // Test 3: Update user data without map errors
    const manager3 = new ClientConversationManager();
    manager3.updateUserData({
      name: "Test User",
      experience: "Not an array", // This should not cause map errors
      projects: "Also not an array",
      skills: "Still not an array",
    });

    if (
      manager3.userData.name === "Test User" &&
      manager3.userData.experience === "Not an array"
    ) {
      testResults.passed++;
      console.log("✅ Test 3 PASSED: Update user data without map errors");
    } else {
      testResults.failed++;
      testResults.errors.push(
        "Test 3 FAILED: Update user data without map errors",
      );
    }
    manager3.destroy();

    // Test 4: Export data without map errors
    const manager4 = new ClientConversationManager();
    manager4.updateUserData({
      name: "Test User",
      experience: { not: "an array" }, // Object instead of array
      projects: null, // Null value
      skills: undefined, // Undefined value
    });

    try {
      const exportedData = manager4.exportData();
      if (exportedData.userData.name === "Test User") {
        testResults.passed++;
        console.log("✅ Test 4 PASSED: Export data without map errors");
      } else {
        testResults.failed++;
        testResults.errors.push("Test 4 FAILED: Export data - incorrect data");
      }
    } catch (error) {
      testResults.failed++;
      testResults.errors.push(
        `Test 4 FAILED: Export data threw error: ${error}`,
      );
    }
    manager4.destroy();

    console.log(
      `\n🎯 Test Results: ${testResults.passed} passed, ${testResults.failed} failed`,
    );

    if (testResults.errors.length > 0) {
      console.log("❌ Errors:");
      testResults.errors.forEach((error) => console.log(`  - ${error}`));
    }

    return testResults.failed === 0;
  } catch (error) {
    console.error("💥 Test execution failed:", error);
    return false;
  }
}
