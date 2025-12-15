/**
 * Resume Generation Hook with useSWR
 * Provides better state management, callbacks, and error handling
 */

import type { ClientConversationManager } from "@/lib/client-conversation-manager";
import { useCallback, useEffect, useRef, useState } from "react";
import useSWR from "swr";

interface ResumeGenerationResult {
  htmlContent: string;
  templateUsed: string;
  templateName: string;
  generatedAt: string;
  conversationId: string;
  creationTime: number; // in milliseconds
}

interface ResumeGenerationOptions {
  onStart?: () => void;
  onSuccess?: (result: ResumeGenerationResult) => void;
  onError?: (error: Error) => void;
  onComplete?: () => void;
  retryOnError?: boolean;
  maxRetries?: number;
}

interface UseResumeGenerationReturn {
  // SWR state
  data: ResumeGenerationResult | undefined;
  error: Error | undefined;
  isLoading: boolean;
  isValidating: boolean;

  // Custom state
  isGenerating: boolean;
  generationProgress: "idle" | "starting" | "generating" | "success" | "error";
  creationTime: number | null;

  // Actions
  generateResume: () => Promise<void>;
  retryGeneration: () => Promise<void>;
  clearResult: () => void;

  // Utilities
  canGenerate: boolean;
  hasResult: boolean;
}

const generateResumeKey = (
  sessionId: string,
  templateId: string,
  messageCount: number,
) => `resume-${sessionId}-${templateId}-${messageCount}`;

const resumeGenerationFetcher = async (
  key: string,
  manager: ClientConversationManager,
  options: ResumeGenerationOptions = {},
): Promise<ResumeGenerationResult> => {
  const { onStart, onSuccess, onError, onComplete } = options;

  try {
    onStart?.();

    const startTime = Date.now();
    console.log("Starting resume generation at:", new Date().toISOString());

    const response = await manager.generateResume();

    const endTime = Date.now();
    const creationTime = endTime - startTime;

    console.log(
      `Resume generation completed in ${creationTime}ms (${(creationTime / 1000).toFixed(2)}s)`,
    );
    console.log("Resume generation finished at:", new Date().toISOString());

    if (!response.success || !response.data) {
      throw new Error(response.error || "ไม่สามารถสร้าง Resume ได้");
    }

    const result: ResumeGenerationResult = {
      htmlContent: response.data.htmlContent,
      templateUsed: response.data.templateUsed,
      templateName: response.data.templateName,
      generatedAt: new Date().toISOString(),
      conversationId: manager.sessionId,
      creationTime,
    };

    onSuccess?.(result);
    return result;
  } catch (error) {
    const errorObj =
      error instanceof Error ? error : new Error("Unknown error occurred");
    onError?.(errorObj);
    throw errorObj;
  } finally {
    onComplete?.();
  }
};

export function useResumeGeneration(
  conversationManager: ClientConversationManager | null,
  selectedTemplate: string,
  options: ResumeGenerationOptions = {},
): UseResumeGenerationReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState<
    "idle" | "starting" | "generating" | "success" | "error"
  >("idle");
  const [creationTime, setCreationTime] = useState<number | null>(null);
  const optionsRef = useRef(options);

  // Update options ref when options change
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  // Generate SWR key based on conversation state
  const messageCount =
    conversationManager?.conversationHistory.filter((m) => m.role === "user")
      .length || 0;
  const swrKey =
    conversationManager && messageCount > 0
      ? generateResumeKey(
          conversationManager.sessionId,
          selectedTemplate,
          messageCount,
        )
      : null;

  // Enhanced options with state management
  const enhancedOptions: ResumeGenerationOptions = {
    ...options,
    onStart: () => {
      setIsGenerating(true);
      setGenerationProgress("starting");
      optionsRef.current.onStart?.();
    },
    onSuccess: (result) => {
      setGenerationProgress("success");
      setCreationTime(result.creationTime);

      // Add success message to conversation
      if (conversationManager) {
        const successMessage =
          "Resume สร้างสำเร็จแล้วครับ! สามารถดูตัวอย่างและดาวน์โหลดได้ในหน้า Preview";
        conversationManager.addMessage("assistant", successMessage, {
          resumeGenerated: true,
        });
      }

      optionsRef.current.onSuccess?.(result);
    },
    onError: (error) => {
      setGenerationProgress("error");

      // Add error message to conversation
      if (conversationManager) {
        const errorMessage = `ขออภัยครับ ${error.message} กรุณาลองใหม่อีกครั้ง`;
        conversationManager.addMessage("assistant", errorMessage, {
          error: true,
        });
      }

      optionsRef.current.onError?.(error);
    },
    onComplete: () => {
      setIsGenerating(false);
      if (generationProgress === "starting") {
        setGenerationProgress("generating");
      }
      optionsRef.current.onComplete?.();
    },
  };

  // useSWR for resume generation
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    swrKey ? [swrKey, conversationManager, enhancedOptions] : null,
    ([key, manager, opts]) =>
      manager
        ? resumeGenerationFetcher(key, manager, opts)
        : Promise.reject(new Error("Manager not available")),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: options.retryOnError ?? false,
      errorRetryCount: options.maxRetries ?? 0,
      errorRetryInterval: 5000,
      onSuccess: (data) => {
        console.log("useSWR onSuccess:", data);
      },
      onError: (error) => {
        console.error("useSWR onError:", error);
      },
    },
  );

  // Manual generation trigger
  const generateResume = useCallback(async () => {
    if (!conversationManager) {
      throw new Error("Conversation manager not available");
    }

    if (!selectedTemplate) {
      throw new Error("กรุณาเลือก Template ก่อน");
    }

    const userMessages = conversationManager.conversationHistory.filter(
      (m) => m.role === "user",
    );
    if (userMessages.length < 1) {
      throw new Error("กรุณาแชทให้ข้อมูลก่อนสร้าง Resume");
    }

    // Trigger SWR mutation
    await mutate();
  }, [conversationManager, selectedTemplate, mutate]);

  // Retry generation
  const retryGeneration = useCallback(async () => {
    setGenerationProgress("idle");
    await generateResume();
  }, [generateResume]);

  // Clear result
  const clearResult = useCallback(() => {
    mutate(undefined, { revalidate: false });
    setGenerationProgress("idle");
    setCreationTime(null);
  }, [mutate]);

  // Computed properties
  const canGenerate = Boolean(
    conversationManager &&
      selectedTemplate &&
      conversationManager.conversationHistory.filter((m) => m.role === "user")
        .length > 0 &&
      !isGenerating,
  );

  const hasResult = Boolean(data);

  return {
    // SWR state
    data,
    error,
    isLoading,
    isValidating,

    // Custom state
    isGenerating,
    generationProgress,
    creationTime,

    // Actions
    generateResume,
    retryGeneration,
    clearResult,

    // Utilities
    canGenerate,
    hasResult,
  };
}

export default useResumeGeneration;
