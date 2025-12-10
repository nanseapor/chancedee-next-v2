"use client";

import type { Message, UseGeneralChatReturn } from "@/types/chat";
import { useCallback, useState } from "react";

export function useGeneralChat(): UseGeneralChatReturn {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "สวัสดีครับ! ผมเป็น AI Assistant ที่พร้อมจะช่วยเหลือคุณในเรื่องต่างๆ\n\nคุณสามารถถามคำถามหรือปรึกษาเรื่องใดก็ได้ครับ",
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return;

      setIsLoading(true);
      setError(undefined);

      // Add user message
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content: content.trim(),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);

      try {
        // Call mock API endpoint
        const response = await fetch("/api/ai-assistant/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: content.trim(),
            conversationHistory: messages,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to get response from AI");
        }

        const data = await response.json();

        // Add AI response
        const aiMessage: Message = {
          id: `ai-${Date.now()}`,
          role: "assistant",
          content: data.response,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, aiMessage]);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "เกิดข้อผิดพลาด";
        setError(errorMessage);

        // Add error message
        const errorAiMessage: Message = {
          id: `ai-error-${Date.now()}`,
          role: "assistant",
          content: `ขออภัยครับ เกิดข้อผิดพลาด: ${errorMessage}\n\nกรุณาลองใหม่อีกครั้ง`,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, errorAiMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [messages],
  );

  const clearChat = useCallback(() => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content:
          "สวัสดีครับ! ผมเป็น AI Assistant ที่พร้อมจะช่วยเหลือคุณในเรื่องต่างๆ\n\nคุณสามารถถามคำถามหรือปรึกษาเรื่องใดก็ได้ครับ",
        timestamp: new Date(),
      },
    ]);
    setError(undefined);
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    clearChat,
    error,
  };
}
