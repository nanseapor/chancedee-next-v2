/**
 * COMP-R03: SettingsTabs Component Tests
 *
 * RED Phase: All tests should FAIL until implementation
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// This import will fail until implementation exists
import { SettingsTabs } from "@/app/jobsmarket/companies/[id]/dashboard/settings/_components/SettingsTabs";

describe("COMP-R03: SettingsTabs Component", () => {
  const mockOnTabChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================
  // Rendering Tests (~2 tests)
  // ============================================
  describe("Rendering", () => {
    it("should render Profile and Config tabs", () => {
      render(
        <SettingsTabs
          activeTab="profile"
          onTabChange={mockOnTabChange}
          canEdit={true}
        />
      );

      expect(screen.getByRole("tab", { name: /โปรไฟล์บริษัท/i })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /การตั้งค่า/i })).toBeInTheDocument();
    });

    it("should show both Thai and English labels", () => {
      render(
        <SettingsTabs
          activeTab="profile"
          onTabChange={mockOnTabChange}
          canEdit={true}
        />
      );

      expect(screen.getByText("โปรไฟล์บริษัท")).toBeInTheDocument();
      expect(screen.getByText("Profile")).toBeInTheDocument();
      expect(screen.getByText("การตั้งค่า")).toBeInTheDocument();
      expect(screen.getByText("Configuration")).toBeInTheDocument();
    });
  });

  // ============================================
  // Tab Switching Tests (~2 tests)
  // ============================================
  describe("Tab Switching", () => {
    it("should call onTabChange when clicking Config tab", async () => {
      const user = userEvent.setup();

      render(
        <SettingsTabs
          activeTab="profile"
          onTabChange={mockOnTabChange}
          canEdit={true}
        />
      );

      await user.click(screen.getByRole("tab", { name: /การตั้งค่า/i }));

      expect(mockOnTabChange).toHaveBeenCalledWith("config");
    });

    it("should highlight active tab", () => {
      render(
        <SettingsTabs
          activeTab="config"
          onTabChange={mockOnTabChange}
          canEdit={true}
        />
      );

      expect(screen.getByRole("tab", { name: /การตั้งค่า/i })).toHaveAttribute(
        "aria-selected",
        "true"
      );
      expect(screen.getByRole("tab", { name: /โปรไฟล์บริษัท/i })).toHaveAttribute(
        "aria-selected",
        "false"
      );
    });
  });
});
