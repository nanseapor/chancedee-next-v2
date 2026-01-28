/**
 * COMP-R03: SettingsClient Component Tests
 *
 * RED Phase: All tests should FAIL until implementation
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// This import will fail until implementation exists
import { SettingsClient } from "@/app/jobsmarket/companies/[id]/dashboard/settings/_components/SettingsClient";

// Mock hooks
vi.mock("@/hooks/jobsmarket/company/use-company-settings", () => ({
  useCompanySettings: vi.fn(() => ({
    company: null,
    isLoading: true,
    error: null,
    updateProfile: vi.fn(),
    updateConfig: vi.fn(),
  })),
}));

vi.mock("@/hooks/jobsmarket/company/use-company-permission", () => ({
  useCompanyPermission: vi.fn(() => ({
    canManageSettings: true,
    can: vi.fn(() => true),
  })),
}));

vi.mock("@/hooks/use-auth", () => ({
  useFirebaseAuth: vi.fn(() => ({
    user: { uid: "test-user-id" },
    loading: false,
  })),
}));

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
  })),
  useSearchParams: vi.fn(() => ({
    get: vi.fn(() => null),
    toString: vi.fn(() => ""),
  })),
  useParams: vi.fn(() => ({
    id: "test-company-id",
  })),
}));

vi.mock("@/hooks/use-toast-notification", () => ({
  useToast: vi.fn(() => ({
    addToast: vi.fn(),
    removeToast: vi.fn(),
  })),
}));

vi.mock("@/hooks/jobsmarket/company/use-company-auth", () => ({
  useCompanyAuth: vi.fn(() => ({
    role: "owner",
    isLoading: false,
    isReady: true,
  })),
}));

vi.mock("@/hooks/jobsmarket/company/use-company-image-upload", () => ({
  useCompanyImageUpload: vi.fn(() => ({
    uploadLogo: vi.fn(),
    uploadCover: vi.fn(),
    logoProgress: 0,
    coverProgress: 0,
    logoError: null,
    coverError: null,
    reset: vi.fn(),
  })),
}));

describe("COMP-R03: SettingsClient Component", () => {
  const mockCompanyId = "test-company-id";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================
  // Loading State Tests (~2 tests)
  // ============================================
  describe("Loading State", () => {
    it("should show loading state while fetching data", () => {
      render(<SettingsClient companyId={mockCompanyId} />);

      expect(screen.getByText(/กำลังโหลด/i)).toBeInTheDocument();
    });

    it("should show skeleton loader for tabs", () => {
      render(<SettingsClient companyId={mockCompanyId} />);

      // Should show some loading indicator
      expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
    });
  });

  // ============================================
  // Tab Routing Tests (~2 tests)
  // ============================================
  describe("Tab Routing", () => {
    it("should default to Profile tab when no URL param", async () => {
      vi.mocked(
        await import("@/hooks/jobsmarket/company/use-company-settings")
      ).useCompanySettings.mockReturnValue({
        company: { uid: mockCompanyId, company_name: "Test Company" },
        isLoading: false,
        error: null,
        updateProfile: vi.fn(),
        updateConfig: vi.fn(),
      });

      render(<SettingsClient companyId={mockCompanyId} />);

      await waitFor(() => {
        expect(screen.getByRole("tab", { name: /โปรไฟล์/i })).toHaveAttribute(
          "aria-selected",
          "true"
        );
      });
    });

    it("should sync tab with URL query param", async () => {
      vi.mocked(await import("next/navigation")).useSearchParams.mockReturnValue({
        get: vi.fn(() => "config"),
      });

      vi.mocked(
        await import("@/hooks/jobsmarket/company/use-company-settings")
      ).useCompanySettings.mockReturnValue({
        company: { uid: mockCompanyId, company_name: "Test Company" },
        isLoading: false,
        error: null,
        updateProfile: vi.fn(),
        updateConfig: vi.fn(),
      });

      render(<SettingsClient companyId={mockCompanyId} />);

      await waitFor(() => {
        expect(screen.getByRole("tab", { name: /การตั้งค่า/i })).toHaveAttribute(
          "aria-selected",
          "true"
        );
      });
    });
  });

  // ============================================
  // Error State Tests (~2 tests)
  // ============================================
  describe("Error State", () => {
    it("should show error message when fetch fails", async () => {
      vi.mocked(
        await import("@/hooks/jobsmarket/company/use-company-settings")
      ).useCompanySettings.mockReturnValue({
        company: null,
        isLoading: false,
        error: new Error("Failed to fetch"),
        updateProfile: vi.fn(),
        updateConfig: vi.fn(),
      });

      render(<SettingsClient companyId={mockCompanyId} />);

      await waitFor(() => {
        expect(screen.getByText(/เกิดข้อผิดพลาด/i)).toBeInTheDocument();
      });
    });

    it("should show retry button on error", async () => {
      vi.mocked(
        await import("@/hooks/jobsmarket/company/use-company-settings")
      ).useCompanySettings.mockReturnValue({
        company: null,
        isLoading: false,
        error: new Error("Failed to fetch"),
        updateProfile: vi.fn(),
        updateConfig: vi.fn(),
      });

      render(<SettingsClient companyId={mockCompanyId} />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /ลองใหม่/i })).toBeInTheDocument();
      });
    });
  });
});
