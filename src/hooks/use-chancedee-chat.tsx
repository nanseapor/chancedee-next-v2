"use client";

import {
  CONFIG,
  ClientConversationManager,
} from "@/lib/client-conversation-manager";
import type {
  Message,
  ResumeData,
  UseChanceedeChatReturn,
} from "@/types/resume";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * useChancedeeChat - Exact implementation from prototype
 * Based on chancedee_web_prototype.html v4.3.0
 */

// Convert between our Message type and the manager's format
function convertFromManager(managerMessage: any): Message {
  return {
    id: `${Date.now()}-${Math.random()}`,
    role: managerMessage.role,
    content: managerMessage.content,
    timestamp: new Date(managerMessage.timestamp),
    attachments: managerMessage.metadata?.attachments,
  };
}

export function useChancedeeChat(): UseChanceedeChatReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>(
    "fresh-graduate-project",
  );
  const [generatedResume, setGeneratedResume] =
    useState<UseChanceedeChatReturn["generatedResume"]>();
  const [error, setError] = useState<string>();

  // New state for API integration
  const [apiStatus, setApiStatus] = useState<"loading" | "connected" | "error">(
    "loading",
  );
  const [templates, setTemplates] = useState<Record<string, any>>(
    CONFIG.TEMPLATES,
  );
  const [userData, setUserData] = useState<any>({});
  const [resumeData, setResumeData] = useState<ResumeData>({});

  const conversationManagerRef = useRef<ClientConversationManager | null>(null);

  // Initialize conversation manager
  useEffect(() => {
    const manager = new ClientConversationManager();
    conversationManagerRef.current = manager;

    // Load existing data
    const existingHistory = manager.conversationHistory;
    const existingUserData = manager.userData;
    const existingTemplate = manager.templateType;
    const existingResume = manager.lastResumeHTML;

    if (existingHistory.length > 0) {
      setMessages(existingHistory.map(convertFromManager));
      setUserData(existingUserData);

      if (existingTemplate) {
        setSelectedTemplate(existingTemplate);
      }

      if (existingResume) {
        setGeneratedResume({
          htmlContent: existingResume,
          templateUsed: existingTemplate || "fresh-graduate-project",
          templateName:
            CONFIG.TEMPLATES[existingTemplate as keyof typeof CONFIG.TEMPLATES]
              ?.name || "Fresh Graduate - Project Based",
          generatedAt: new Date().toISOString(),
          conversationId: manager.sessionId,
        });
      }
    } else {
      // Add welcome message if no existing conversation
      const welcomeMessage = {
        role: "assistant" as const,
        content:
          "สวัสดีครับ! ผมเป็น AI ที่จะช่วยคุณสร้าง Resume ที่ดูเป็นมืออาชีพ\n\nเริ่มต้นด้วยการแนะนำตัวและบอกตำแหน่งที่สนใจได้เลยครับ",
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
        // Handle file attachments if any
        if (attachments && attachments.length > 0) {
          // For now, just add attachment info to the message
          const attachmentInfo = attachments
            .map(
              (file) =>
                `📎 ${file.name} (${file.type}, ${Math.round(file.size / 1024)}KB)`,
            )
            .join("\n");

          content = `${content}\n\n${attachmentInfo}`;
        }

        // Use the manager's sendMessage method (exact prototype logic)
        const response = await manager.sendMessage(
          content.trim(),
          selectedTemplate,
        );

        if (response.success) {
          // Update local state from manager
          setMessages(manager.conversationHistory.map(convertFromManager));
          setUserData(manager.userData);

          // Create simple resume data for backward compatibility
          setResumeData({
            personalInfo: {
              name: manager.userData.name || "",
              email: manager.userData.email || "",
              phone: manager.userData.phone || "",
              position: manager.userData.position || "",
            },
            skills: [],
            experience: [],
            education: [],
            projects: [],
            certifications: [],
            languages: [],
          });
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
        "สวัสดีครับ! ผมเป็น AI ที่จะช่วยคุณสร้าง Resume ที่ดูเป็นมืออาชีพ\n\nเริ่มต้นด้วยการแนะนำตัวและบอกตำแหน่งที่สนใจได้เลยครับ",
      timestamp: new Date().toISOString(),
      metadata: {},
    };

    manager.addMessage("assistant", welcomeMessage.content, {});

    // Update local state
    setMessages(manager.conversationHistory.map(convertFromManager));
    setResumeData({});
    setUserData({});
    setSelectedTemplate("fresh-graduate-project");
    setGeneratedResume(undefined);
    setError(undefined);
  }, []);

  const selectTemplate = useCallback((templateId: string) => {
    const manager = conversationManagerRef.current;
    if (!manager) return;

    setSelectedTemplate(templateId);
    manager.setTemplateType(templateId);

    // Add AI message about template selection
    const templateMessage = `เยี่ยมครับ! ได้เลือก Template "${CONFIG.TEMPLATES[templateId as keyof typeof CONFIG.TEMPLATES]?.name || templateId}" แล้ว ตอนนี้ข้อมูลครบถ้วนแล้ว สามารถสร้าง Resume ได้เลย`;

    manager.addMessage("assistant", templateMessage, {
      templateType: templateId,
    });

    // Update local state
    setMessages(manager.conversationHistory.map(convertFromManager));
  }, []);

  const generateResume = useCallback(async () => {
    if (!selectedTemplate) {
      setError("กรุณาเลือก Template ก่อน");
      return;
    }

    const manager = conversationManagerRef.current;
    if (!manager) return;

    if (
      manager.conversationHistory.filter((m) => m.role === "user").length < 1
    ) {
      setError("กรุณาแชทให้ข้อมูลก่อนสร้าง Resume");
      return;
    }

    setIsGenerating(true);
    setError(undefined);

    try {
      // Use the manager's generateResume method (exact prototype logic)
      // Log creation time instead of using timeout
      const startTime = Date.now();
      console.log("Starting resume generation at:", new Date().toISOString());

      const response = await manager.generateResume();

      const endTime = Date.now();
      const creationTime = endTime - startTime;
      console.log(
        `Resume generation completed in ${creationTime}ms (${(creationTime / 1000).toFixed(2)}s)`,
      );
      console.log("Resume generation finished at:", new Date().toISOString());

      if (response.success && response.data) {
        const resumeResult = {
          htmlContent: response.data.htmlContent,
          templateUsed: response.data.templateUsed,
          templateName: response.data.templateName,
          generatedAt: new Date().toISOString(),
          conversationId: manager.sessionId,
        };

        setGeneratedResume(resumeResult);

        // Add success message
        const successMessage =
          "Resume สร้างสำเร็จแล้วครับ! สามารถดูตัวอย่างและดาวน์โหลดได้ในหน้า Preview";
        manager.addMessage("assistant", successMessage, {
          resumeGenerated: true,
        });

        // Update local state
        setMessages(manager.conversationHistory.map(convertFromManager));
      } else {
        throw new Error(response.error || "ไม่สามารถสร้าง Resume ได้");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการสร้าง Resume";
      setError(errorMessage);

      const errorChatMessage = `ขออภัยครับ ${errorMessage} กรุณาลองใหม่อีกครั้ง`;

      if (manager) {
        manager.addMessage("assistant", errorChatMessage, { error: true });
        setMessages(manager.conversationHistory.map(convertFromManager));
      }
    } finally {
      setIsGenerating(false);
    }
  }, [selectedTemplate]);

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

      if (manager.lastResumeHTML) {
        setGeneratedResume({
          htmlContent: manager.lastResumeHTML,
          templateUsed: manager.templateType || "fresh-graduate-project",
          templateName:
            CONFIG.TEMPLATES[
              manager.templateType as keyof typeof CONFIG.TEMPLATES
            ]?.name || "Fresh Graduate - Project Based",
          generatedAt: new Date().toISOString(),
          conversationId: manager.sessionId,
        });
      }
    }
    return success;
  }, []);

  const refreshTemplates = useCallback(async () => {
    // Templates are static from CONFIG in prototype
    setTemplates(CONFIG.TEMPLATES);
  }, []);

  return {
    messages,
    isLoading,
    isGenerating,
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
  };
}
