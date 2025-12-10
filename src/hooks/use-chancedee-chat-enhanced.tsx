/**
 * Enhanced ChanceDee Chat Hook with useSWR Resume Generation
 * Combines chat functionality with improved resume generation state management
 */

import { ClientConversationManager } from "@/lib/client-conversation-manager";
import { CONFIG } from "@/lib/client-conversation-manager";
import type {
  Message,
  ResumeData,
  UseChanceedeChatReturn,
} from "@/types/resume";
import { useCallback, useEffect, useRef, useState } from "react";
import { useResumeGeneration } from "./use-resume-generation";

// Convert manager message to UI message format
const convertFromManager = (managerMessage: any): Message => {
  return {
    id: `${Date.now()}-${Math.random()}`,
    role: managerMessage.role,
    content: managerMessage.content,
    timestamp: new Date(managerMessage.timestamp),
    attachments: managerMessage.metadata?.attachments,
  };
};

export function useChancedeeChat(): UseChanceedeChatReturn & {
  // Enhanced resume generation state
  resumeGeneration: {
    isGenerating: boolean;
    generationProgress:
      | "idle"
      | "starting"
      | "generating"
      | "success"
      | "error";
    creationTime: number | null;
    canGenerate: boolean;
    hasResult: boolean;
    retryGeneration: () => Promise<void>;
    clearResult: () => void;
  };
} {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>(
    "fresh-graduate-project",
  );
  const [resumeData, setResumeData] = useState<ResumeData>({});
  const [error, setError] = useState<string>();

  // New state for API integration
  const [apiStatus, setApiStatus] = useState<"loading" | "connected" | "error">(
    "loading",
  );
  const [templates, setTemplates] = useState<Record<string, any>>(
    CONFIG.TEMPLATES,
  );
  const [userData, setUserData] = useState<any>({});

  const conversationManagerRef = useRef<ClientConversationManager | null>(null);

  // Enhanced resume generation with useSWR
  const resumeGeneration = useResumeGeneration(
    conversationManagerRef.current,
    selectedTemplate,
    {
      onStart: () => {
        console.log("Resume generation started");
        setError(undefined);
      },
      onSuccess: (result) => {
        console.log("Resume generation successful:", result);
        // Update messages to include the success message
        const manager = conversationManagerRef.current;
        if (manager) {
          setMessages(manager.conversationHistory.map(convertFromManager));
        }
      },
      onError: (error) => {
        console.error("Resume generation failed:", error);
        setError(error.message);
        // Update messages to include the error message
        const manager = conversationManagerRef.current;
        if (manager) {
          setMessages(manager.conversationHistory.map(convertFromManager));
        }
      },
      onComplete: () => {
        console.log("Resume generation completed");
      },
      retryOnError: false,
      maxRetries: 0,
    },
  );

  // Initialize conversation manager
  useEffect(() => {
    const manager = new ClientConversationManager();
    conversationManagerRef.current = manager;

    // Load existing conversation if available
    if (manager.conversationHistory.length === 0) {
      const welcomeMessage = {
        role: "assistant" as const,
        content:
          "สวัสดีครับ! ผมเป็น AI ที่จะช่วยคุณสร้าง Resume ที่ดูเป็นมืออาชีพ\\n\\nเริ่มต้นด้วยการแนะนำตัวและบอกตำแหน่งที่สนใจได้เลยครับ",
        timestamp: new Date().toISOString(),
        metadata: {},
      };

      manager.addMessage("assistant", welcomeMessage.content, {});
      setMessages([convertFromManager(welcomeMessage)]);
    }

    // Set up listener for updates
    const updateListener = () => {
      setMessages(manager.conversationHistory.map(convertFromManager));
      setUserData(manager.userData);
      if (manager.templateType) {
        setSelectedTemplate(manager.templateType);
      }
    };

    manager.addListener(updateListener);

    // Check API health
    checkApiHealth();

    return () => {
      manager.removeListener(updateListener);
      manager.destroy();
    };
  }, []);

  const checkApiHealth = async () => {
    try {
      const manager = conversationManagerRef.current;
      if (!manager) return;

      const health = await manager.checkHealth();
      setApiStatus(health.status === "healthy" ? "connected" : "error");
    } catch (error) {
      setApiStatus("error");
      console.error("API health check failed:", error);
    }
  };

  const sendMessage = useCallback(
    async (content: string, attachments?: File[]) => {
      if (!content.trim()) return;

      const manager = conversationManagerRef.current;
      if (!manager) return;

      setIsLoading(true);
      setError(undefined);

      try {
        const response = await manager.sendMessage(content, selectedTemplate);

        if (response.success) {
          // Update local state
          setMessages(manager.conversationHistory.map(convertFromManager));
          setUserData(manager.userData);

          // Update resume data from extracted user data
          if (manager.userData) {
            setResumeData(manager.userData);
          }
        } else {
          setError(response.error || "เกิดข้อผิดพลาด");
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "เกิดข้อผิดพลาด";
        setError(errorMessage);
        console.error("Send message error:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [selectedTemplate],
  );

  const clearChat = useCallback(() => {
    const manager = conversationManagerRef.current;
    if (!manager) return;

    manager.clearConversation();

    // Add welcome message
    const welcomeMessage = {
      role: "assistant" as const,
      content:
        "สวัสดีครับ! ผมเป็น AI ที่จะช่วยคุณสร้าง Resume ที่ดูเป็นมืออาชีพ\\n\\nเริ่มต้นด้วยการแนะนำตัวและบอกตำแหน่งที่สนใจได้เลยครับ",
      timestamp: new Date().toISOString(),
      metadata: {},
    };

    manager.addMessage("assistant", welcomeMessage.content, {});

    // Update local state
    setMessages(manager.conversationHistory.map(convertFromManager));
    setResumeData({});
    setUserData({});
    setSelectedTemplate("fresh-graduate-project");
    setError(undefined);

    // Clear resume generation state
    resumeGeneration.clearResult();
  }, [resumeGeneration]);

  const selectTemplate = useCallback((templateId: string) => {
    const manager = conversationManagerRef.current;
    if (!manager) return;

    setSelectedTemplate(templateId);

    // Update manager template
    manager.templateType = templateId;
    manager.saveToStorage();
  }, []);

  // Enhanced generateResume that uses the new hook
  const generateResume = useCallback(async () => {
    try {
      await resumeGeneration.generateResume();
    } catch (error) {
      console.error("Generate resume error:", error);
      setError(
        error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการสร้าง Resume",
      );
    }
  }, [resumeGeneration]);

  const updateResumeData = useCallback((data: Partial<ResumeData>) => {
    setResumeData((prev) => ({ ...prev, ...data }));
  }, []);

  // Export additional functions for debugging and data management
  const exportData = useCallback(() => {
    const manager = conversationManagerRef.current;
    return manager?.exportData();
  }, []);

  const importData = useCallback((data: any) => {
    const manager = conversationManagerRef.current;
    if (!manager) return false;

    const success = manager.importData(data);
    if (success) {
      // Update local state
      setMessages(manager.conversationHistory.map(convertFromManager));
      setUserData(manager.userData);

      if (manager.templateType) {
        setSelectedTemplate(manager.templateType);
      }

      // Update resume data
      if (manager.userData) {
        setResumeData(manager.userData);
      }

      if (manager.lastResumeHTML) {
        // Note: This will be handled by the new resume generation hook
        // We can trigger a refresh of the resume generation state here if needed
      }
    }
    return success;
  }, []);

  const refreshTemplates = useCallback(async () => {
    // Templates are static from CONFIG in prototype
    setTemplates(CONFIG.TEMPLATES);
  }, []);

  // Convert resume generation result to legacy format for compatibility
  const generatedResume = resumeGeneration.data
    ? {
        htmlContent: resumeGeneration.data.htmlContent,
        templateUsed: resumeGeneration.data.templateUsed,
        templateName: resumeGeneration.data.templateName,
        generatedAt: resumeGeneration.data.generatedAt,
        conversationId: resumeGeneration.data.conversationId,
      }
    : undefined;

  return {
    messages,
    isLoading,
    isGenerating: resumeGeneration.isGenerating,
    resumeData,
    selectedTemplate,
    generatedResume,
    sendMessage,
    clearChat,
    selectTemplate,
    generateResume,
    updateResumeData,
    error,
    // New properties for API integration
    apiStatus,
    templates,
    userData,
    exportData,
    importData,
    refreshTemplates,
    checkApiHealth,

    // Enhanced resume generation state
    resumeGeneration: {
      isGenerating: resumeGeneration.isGenerating,
      generationProgress: resumeGeneration.generationProgress,
      creationTime: resumeGeneration.creationTime,
      canGenerate: resumeGeneration.canGenerate,
      hasResult: resumeGeneration.hasResult,
      retryGeneration: resumeGeneration.retryGeneration,
      clearResult: resumeGeneration.clearResult,
    },
  };
}

export default useChancedeeChat;
