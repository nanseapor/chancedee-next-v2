"use client";

import { useState, useCallback, useRef } from "react";

import { sendAttachment } from "@/lib/database/actions/chat-messages";
import { jobsmarketStorageService } from "@/lib/jobsmarket/services/storage-service";

interface UseChatFileUploadOptions {
  roomId: string;
  maxSize?: number; // bytes
}

interface FilePreview {
  file: File;
  url: string;
  type: "image" | "file";
}

interface UseChatFileUploadReturn {
  isUploading: boolean;
  progress: number;
  error: string | null;
  preview: FilePreview | null;
  upload: (file: File) => Promise<{ messageId: string } | null>;
  cancel: () => void;
  reset: () => void;
  selectFile: (file: File) => boolean;
  clearPreview: () => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];

const ALLOWED_DOCUMENT_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
];

/**
 * Hook for handling file uploads in chat
 * Per CHAT-R02 RIS
 */
export function useChatFileUpload({
  roomId,
  maxSize = MAX_FILE_SIZE,
}: UseChatFileUploadOptions): UseChatFileUploadReturn {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<FilePreview | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Validate file before upload
   */
  const validateFile = useCallback(
    (file: File): string | null => {
      // Check size
      if (file.size > maxSize) {
        return `ไฟล์มีขนาดใหญ่เกิน ${Math.round(maxSize / 1024 / 1024)}MB`;
      }

      // Check type
      const isImage = file.type.startsWith("image/");
      if (isImage) {
        const validation = jobsmarketStorageService.validatePhoto(file);
        if (!validation.isValid) {
          return validation.error || "ประเภทไฟล์ไม่รองรับ";
        }
      } else {
        const validation = jobsmarketStorageService.validateDocument(file);
        if (!validation.isValid) {
          return validation.error || "ประเภทไฟล์ไม่รองรับ";
        }
      }

      return null;
    },
    [maxSize]
  );

  /**
   * Select and preview a file
   */
  const selectFile = useCallback(
    (file: File): boolean => {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return false;
      }

      setError(null);

      const isImage = file.type.startsWith("image/");
      const url = isImage ? URL.createObjectURL(file) : "";

      setPreview({
        file,
        url,
        type: isImage ? "image" : "file",
      });

      return true;
    },
    [validateFile]
  );

  /**
   * Clear the current preview
   */
  const clearPreview = useCallback(() => {
    if (preview?.url) {
      URL.revokeObjectURL(preview.url);
    }
    setPreview(null);
    setError(null);
    setProgress(0);
  }, [preview]);

  /**
   * Upload the file
   */
  const upload = useCallback(
    async (file: File): Promise<{ messageId: string } | null> => {
      // Validate first
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return null;
      }

      setIsUploading(true);
      setProgress(0);
      setError(null);

      abortControllerRef.current = new AbortController();

      try {
        const isImage = file.type.startsWith("image/");
        const type = isImage ? "image" : "file";

        // Upload to storage
        const uploadResult = await jobsmarketStorageService.uploadDocument(
          roomId,
          file,
          (progressValue) => {
            setProgress(progressValue);
          }
        );

        // Check if cancelled
        if (abortControllerRef.current?.signal.aborted) {
          throw new Error("UPLOAD_CANCELLED");
        }

        setProgress(90);

        // Create message record
        const result = await sendAttachment({
          roomId,
          fileUrl: uploadResult,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          type: type as "image" | "file",
        });

        setProgress(100);
        clearPreview();

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "อัปโหลดล้มเหลว";
        setError(errorMessage);
        return null;
      } finally {
        setIsUploading(false);
        abortControllerRef.current = null;
      }
    },
    [roomId, validateFile, clearPreview]
  );

  /**
   * Cancel ongoing upload
   */
  const cancel = useCallback(() => {
    abortControllerRef.current?.abort();
    clearPreview();
    setIsUploading(false);
    setProgress(0);
  }, [clearPreview]);

  /**
   * Reset all state
   */
  const reset = useCallback(() => {
    cancel();
    setError(null);
  }, [cancel]);

  return {
    isUploading,
    progress,
    error,
    preview,
    upload,
    cancel,
    reset,
    selectFile,
    clearPreview,
  };
}
