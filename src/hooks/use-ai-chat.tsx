"use client";

import { useFirebaseAuth } from "@/hooks/use-auth";
import { getFirebaseApp } from "@/lib/firebase";
import { getFunctions, httpsCallable } from "firebase/functions";
import { useCallback, useState } from "react";
import useSWR, { mutate } from "swr";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface ChatRequest {
  message: string;
  threadId?: string;
  imageUrl?: string;
  pdfUrl?: string;
  messages?: Array<{
    role: string;
    content: string;
  }>;
}

export interface ChatResponse {
  response: string;
  threadId: string;
}

export interface ChatSession {
  threadId: string;
  messages: Message[];
  lastUpdated: Date;
}

const chatFunction = httpsCallable<ChatRequest, ChatResponse>(
  getFunctions(getFirebaseApp(), "asia-southeast1"),
  "agentForFriday",
);

const generateThreadId = () => crypto.randomUUID();

export function useAIChat(initialThreadId?: string) {
  const { user } = useFirebaseAuth();
  const [currentThreadId, setCurrentThreadId] = useState<string>(
    initialThreadId || generateThreadId(),
  );
  const [isLoading, setIsLoading] = useState(false);

  const sessionKey = `chat-session-${currentThreadId}`;

  const { data: session, error } = useSWR<ChatSession>(
    user ? sessionKey : null,
    () => {
      const stored = localStorage.getItem(sessionKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...parsed,
          messages: parsed.messages.map((msg: any) => ({
            id: msg.id || `msg-${Date.now()}-${Math.random()}`,
            role: msg.role,
            content: msg.content || msg.text, // Support both old and new format
            timestamp: new Date(msg.timestamp),
          })),
          lastUpdated: new Date(parsed.lastUpdated),
        };
      }
      return {
        threadId: currentThreadId,
        messages: [],
        lastUpdated: new Date(),
      };
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );

  const saveSession = useCallback(
    (newSession: ChatSession) => {
      localStorage.setItem(sessionKey, JSON.stringify(newSession));
      mutate(sessionKey, newSession, false);
    },
    [sessionKey],
  );

  const sendMessage = useCallback(
    async (
      message: string,
      files?: File[],
      attachments?: {
        imageUrl?: string;
        pdfUrl?: string;
      },
    ) => {
      if (!user || (!message.trim() && !files?.length) || !session) return;

      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content: message,
        timestamp: new Date(),
      };

      const updatedMessages = [...session.messages, userMessage];
      const tempSession: ChatSession = {
        threadId: currentThreadId,
        messages: updatedMessages,
        lastUpdated: new Date(),
      };

      saveSession(tempSession);
      setIsLoading(true);

      try {
        const requestData: ChatRequest = {
          message: message.trim(),
          threadId: currentThreadId,
          messages: session.messages
            .filter((m) => m.content && m.content.trim().length > 0)
            .map((m) => ({
              role: m.role,
              content: m.content.trim(),
            })),
          ...attachments,
        };

        const result = await chatFunction(requestData);

        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: result.data.response,
          timestamp: new Date(),
        };

        const finalMessages = [...updatedMessages, assistantMessage];
        const finalSession: ChatSession = {
          threadId: result.data.threadId,
          messages: finalMessages,
          lastUpdated: new Date(),
        };

        setCurrentThreadId(result.data.threadId);
        saveSession(finalSession);

        return result.data;
      } catch (error) {
        console.error("Error sending message:", error);

        const errorMessage: Message = {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: "ขออภัย เกิดข้อผิดพลาดในการส่งข้อความ กรุณาลองใหม่อีกครั้ง",
          timestamp: new Date(),
        };

        const errorSession: ChatSession = {
          threadId: currentThreadId,
          messages: [...updatedMessages, errorMessage],
          lastUpdated: new Date(),
        };

        saveSession(errorSession);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [user, session, currentThreadId, saveSession],
  );

  const clearChat = useCallback(() => {
    const newThreadId = generateThreadId();
    setCurrentThreadId(newThreadId);

    const newSession: ChatSession = {
      threadId: newThreadId,
      messages: [],
      lastUpdated: new Date(),
    };

    localStorage.removeItem(sessionKey);
    saveSession(newSession);
  }, [sessionKey, saveSession]);

  const loadChatSession = useCallback((threadId: string) => {
    setCurrentThreadId(threadId);
    const newSessionKey = `chat-session-${threadId}`;
    mutate(newSessionKey);
  }, []);

  const getChatHistory = useCallback(() => {
    const keys = Object.keys(localStorage).filter((key) =>
      key.startsWith("chat-session-"),
    );
    return keys
      .map((key) => {
        const stored = localStorage.getItem(key);
        if (stored) {
          const parsed = JSON.parse(stored);
          return {
            ...parsed,
            messages: parsed.messages.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp),
            })),
            lastUpdated: new Date(parsed.lastUpdated),
          };
        }
        return null;
      })
      .filter(Boolean) as ChatSession[];
  }, []);

  return {
    session,
    threadId: currentThreadId,
    messages: session?.messages || [],
    isLoading,
    error,
    sendMessage,
    clearChat,
    loadChatSession,
    getChatHistory,
  };
}
