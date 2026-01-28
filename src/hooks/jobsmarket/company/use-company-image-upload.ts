"use client";

import { useState, useCallback } from "react";
import {
  uploadCompanyLogo,
  uploadCompanyCover,
  UploadResult,
} from "@/lib/database/actions/company-settings";
import { jobsmarketStorageService } from "@/lib/jobsmarket/services/storage-service";

// ============================================
// Types
// ============================================

interface UseCompanyImageUploadReturn {
  // Logo state
  logoProgress: number;
  logoError: string | null;
  isUploadingLogo: boolean;

  // Cover state
  coverProgress: number;
  coverError: string | null;
  isUploadingCover: boolean;

  // Actions
  uploadLogo: (file: File) => Promise<UploadResult>;
  uploadCover: (file: File) => Promise<UploadResult>;
  reset: () => void;
}

// ============================================
// Hook
// ============================================

export function useCompanyImageUpload(
  companyId: string
): UseCompanyImageUploadReturn {
  // Logo state
  const [logoProgress, setLogoProgress] = useState(0);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  // Cover state
  const [coverProgress, setCoverProgress] = useState(0);
  const [coverError, setCoverError] = useState<string | null>(null);
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  const uploadLogo = useCallback(
    async (file: File): Promise<UploadResult> => {
      setLogoError(null);
      setLogoProgress(0);
      setIsUploadingLogo(true);

      try {
        // Validate file first
        const validation = jobsmarketStorageService.validatePhoto(file);

        if (!validation.isValid) {
          const errorMsg = validation.error || "Invalid file type";
          setLogoError(errorMsg);
          setIsUploadingLogo(false);
          return { success: false, error: errorMsg };
        }

        // Simulate progress (in real implementation, this would be actual upload progress)
        setLogoProgress(30);

        const result = await uploadCompanyLogo(companyId, file);

        if (result.success) {
          setLogoProgress(100);
        } else {
          setLogoError(result.error || "Upload failed");
        }

        setIsUploadingLogo(false);
        return result;
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : "Upload failed";
        setLogoError(errorMsg);
        setIsUploadingLogo(false);
        return { success: false, error: errorMsg };
      }
    },
    [companyId]
  );

  const uploadCover = useCallback(
    async (file: File): Promise<UploadResult> => {
      setCoverError(null);
      setCoverProgress(0);
      setIsUploadingCover(true);

      try {
        // Validate file first
        const validation = jobsmarketStorageService.validatePhoto(file);

        if (!validation.isValid) {
          const errorMsg = validation.error || "Invalid file type";
          setCoverError(errorMsg);
          setIsUploadingCover(false);
          return { success: false, error: errorMsg };
        }

        // Simulate progress
        setCoverProgress(30);

        const result = await uploadCompanyCover(companyId, file);

        if (result.success) {
          setCoverProgress(100);
        } else {
          setCoverError(result.error || "Upload failed");
        }

        setIsUploadingCover(false);
        return result;
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : "Upload failed";
        setCoverError(errorMsg);
        setIsUploadingCover(false);
        return { success: false, error: errorMsg };
      }
    },
    [companyId]
  );

  const reset = useCallback(() => {
    setLogoProgress(0);
    setLogoError(null);
    setIsUploadingLogo(false);
    setCoverProgress(0);
    setCoverError(null);
    setIsUploadingCover(false);
  }, []);

  return {
    logoProgress,
    logoError,
    isUploadingLogo,
    coverProgress,
    coverError,
    isUploadingCover,
    uploadLogo,
    uploadCover,
    reset,
  };
}
