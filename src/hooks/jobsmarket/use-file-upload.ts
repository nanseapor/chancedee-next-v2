"use client";

import { useState } from "react";
import { jobsmarketStorageService } from "@/lib/jobsmarket/services/storage-service";

/**
 * CAND-R02 Batch 4B: File Upload Hook
 *
 * Provides file upload functionality with:
 * - Progress tracking (0-100)
 * - Error handling
 * - Loading states
 * - File type validation
 */
export function useFileUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  /**
   * Uploads a document file
   * @param uid - User ID
   * @param file - File to upload
   * @returns Promise with download URL
   */
  const uploadDocument = async (uid: string, file: File): Promise<string> => {
    setIsUploading(true);
    setProgress(0);
    setError(null);

    try {
      const url = await jobsmarketStorageService.uploadDocument(
        uid,
        file,
        (progressValue) => {
          setProgress(progressValue);
        }
      );
      setIsUploading(false);
      setProgress(100);
      return url;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการอัปโหลด";
      setError(errorMessage);
      setIsUploading(false);
      setProgress(0);
      throw err;
    }
  };

  /**
   * Uploads a profile photo
   * @param uid - User ID
   * @param file - Image file to upload
   * @returns Promise with download URL
   */
  const uploadPhoto = async (uid: string, file: File): Promise<string> => {
    setIsUploading(true);
    setProgress(0);
    setError(null);

    try {
      const url = await jobsmarketStorageService.uploadProfilePhoto(
        uid,
        file,
        (progressValue) => {
          setProgress(progressValue);
        }
      );
      setIsUploading(false);
      setProgress(100);
      return url;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการอัปโหลด";
      setError(errorMessage);
      setIsUploading(false);
      setProgress(0);
      throw err;
    }
  };

  /**
   * Deletes a file
   * @param path - Full storage path
   */
  const deleteFile = async (path: string): Promise<void> => {
    setError(null);
    try {
      await jobsmarketStorageService.deleteFile(path);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการลบไฟล์";
      setError(errorMessage);
      throw err;
    }
  };

  /**
   * Validates a document file
   */
  const validateDocument = (file: File) => {
    return jobsmarketStorageService.validateDocument(file);
  };

  /**
   * Validates a photo file
   */
  const validatePhoto = (file: File) => {
    return jobsmarketStorageService.validatePhoto(file);
  };

  /**
   * Resets the upload state
   */
  const reset = () => {
    setIsUploading(false);
    setProgress(0);
    setError(null);
  };

  return {
    uploadDocument,
    uploadPhoto,
    deleteFile,
    validateDocument,
    validatePhoto,
    isUploading,
    progress,
    error,
    reset,
  };
}
