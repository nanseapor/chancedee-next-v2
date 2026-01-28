"use client";

import useSWR from "swr";
import {
  updateCompanyProfile,
  updateCompanyLinks,
  updateCompanyConfig,
  getCompanySettings,
  CompanyProfileUpdate,
  CompanyLinks,
  CompanyConfig,
  ActionResult,
} from "@/lib/database/actions/company-settings";

// ============================================
// Types
// ============================================

interface CompanySettingsData {
  uid: string;
  company_name?: string;
  company_name_en?: string;
  industry?: string;
  company_size?: "S" | "M" | "L";
  founded_year?: number;
  description?: string;
  website?: string;
  facebook?: string;
  linkedin?: string;
  profile?: CompanyProfileUpdate;
  links?: CompanyLinks;
  config?: CompanyConfig;
}

interface UseCompanySettingsReturn {
  company: CompanySettingsData | null;
  isLoading: boolean;
  error: Error | null;
  updateProfile: (data: CompanyProfileUpdate) => Promise<ActionResult>;
  updateLinks: (data: CompanyLinks) => Promise<ActionResult>;
  updateConfig: (data: CompanyConfig) => Promise<ActionResult>;
  refetch: () => void;
}

// ============================================
// Fetcher
// ============================================

async function fetchCompanySettings(
  companyId: string
): Promise<CompanySettingsData | null> {
  if (!companyId) return null;

  const result = await getCompanySettings(companyId);
  if (!result.success || !result.data) {
    throw new Error(result.error || "Failed to fetch company settings");
  }

  return {
    uid: companyId,
    company_name: result.data.profile.company_name,
    company_name_en: result.data.profile.company_name_en,
    industry: result.data.profile.industry,
    company_size: result.data.profile.company_size,
    founded_year: result.data.profile.founded_year,
    description: result.data.profile.description,
    website: result.data.links.website,
    facebook: result.data.links.facebook,
    linkedin: result.data.links.linkedin,
    profile: result.data.profile,
    links: result.data.links,
    config: result.data.config,
  };
}

// ============================================
// Hook
// ============================================

export function useCompanySettings(
  companyId: string | null
): UseCompanySettingsReturn {
  const swrKey = companyId ? `company-settings-${companyId}` : null;

  const { data, error, isLoading, mutate } = useSWR<CompanySettingsData | null>(
    swrKey,
    () => (companyId ? fetchCompanySettings(companyId) : null),
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  );

  const updateProfile = async (
    profileData: CompanyProfileUpdate
  ): Promise<ActionResult> => {
    if (!companyId) {
      return { success: false, error: "No company ID provided" };
    }

    try {
      const result = await updateCompanyProfile(companyId, profileData);

      if (result.success) {
        // Invalidate cache to refetch updated data
        await mutate();
      }

      return result;
    } catch (error) {
      console.error("updateProfile error:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to update company profile",
      };
    }
  };

  const updateLinksAction = async (
    linksData: CompanyLinks
  ): Promise<ActionResult> => {
    if (!companyId) {
      return { success: false, error: "No company ID provided" };
    }

    try {
      const result = await updateCompanyLinks(companyId, linksData);

      if (result.success) {
        await mutate();
      }

      return result;
    } catch (error) {
      console.error("updateLinks error:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to update company links",
      };
    }
  };

  const updateConfigAction = async (
    configData: CompanyConfig
  ): Promise<ActionResult> => {
    if (!companyId) {
      return { success: false, error: "No company ID provided" };
    }

    try {
      const result = await updateCompanyConfig(companyId, configData);

      if (result.success) {
        await mutate();
      }

      return result;
    } catch (error) {
      console.error("updateConfig error:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to update company config",
      };
    }
  };

  return {
    company: data ?? null,
    isLoading,
    error: error ?? null,
    updateProfile,
    updateLinks: updateLinksAction,
    updateConfig: updateConfigAction,
    refetch: () => mutate(),
  };
}
