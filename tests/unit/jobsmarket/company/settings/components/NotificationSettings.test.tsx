/**
 * COMP-R03: NotificationSettings Component Tests
 *
 * RED Phase: All tests should FAIL until implementation
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// This import will fail until implementation exists
import { NotificationSettings } from "@/app/jobsmarket/companies/[id]/dashboard/settings/_components/config/NotificationSettings";

describe("COMP-R03: NotificationSettings Component", () => {
  const mockInitialData = {
    notify_new_application: true,
    daily_summary_enabled: false,
    daily_summary_time: "09:00",
    interview_reminder_hours: 24,
  };

  const mockOnToggle = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================
  // Rendering Tests (~2 tests)
  // ============================================
  describe("Rendering", () => {
    it("should render all notification toggles", () => {
      render(
        <NotificationSettings
          settings={mockInitialData}
          onToggle={mockOnToggle}
          disabled={false}
        />
      );

      expect(screen.getByText(/แจ้งเตือนใบสมัครใหม่/i)).toBeInTheDocument();
      expect(screen.getByText(/สรุปรายวัน/i)).toBeInTheDocument();
      expect(screen.getByText(/เตือนก่อนสัมภาษณ์/i)).toBeInTheDocument();
    });

    it("should show toggle states from initial data", () => {
      render(
        <NotificationSettings
          settings={mockInitialData}
          onToggle={mockOnToggle}
          disabled={false}
        />
      );

      const newAppToggle = screen.getByRole("switch", {
        name: /แจ้งเตือนใบสมัครใหม่/i,
      });
      expect(newAppToggle).toBeChecked();

      const dailySummaryToggle = screen.getByRole("switch", {
        name: /สรุปรายวัน/i,
      });
      expect(dailySummaryToggle).not.toBeChecked();
    });
  });

  // ============================================
  // Toggle Tests (~2 tests)
  // ============================================
  describe("Toggles", () => {
    it("should call onToggle when notification toggle changes", async () => {
      const user = userEvent.setup();

      render(
        <NotificationSettings
          settings={mockInitialData}
          onToggle={mockOnToggle}
          disabled={false}
        />
      );

      const newAppToggle = screen.getByRole("switch", {
        name: /แจ้งเตือนใบสมัครใหม่/i,
      });
      await user.click(newAppToggle);

      expect(mockOnToggle).toHaveBeenCalledWith("notify_new_application", false);
    });

    it("should show time picker when daily summary is enabled", async () => {
      const user = userEvent.setup();

      render(
        <NotificationSettings
          settings={{ ...mockInitialData, daily_summary_enabled: true }}
          onToggle={mockOnToggle}
          disabled={false}
        />
      );

      expect(screen.getByLabelText(/เวลาส่งสรุป/i)).toBeInTheDocument();
    });
  });

  // ============================================
  // Loading State Tests (~2 tests)
  // ============================================
  describe("Loading States", () => {
    it("should show loading indicator for specific toggle", () => {
      render(
        <NotificationSettings
          settings={mockInitialData}
          onToggle={mockOnToggle}
          disabled={false}
          loadingToggles={{ notify_new_application: true }}
        />
      );

      // Should show loading state for the toggle being updated
      expect(
        screen.getByTestId("toggle-loading-notify_new_application")
      ).toBeInTheDocument();
    });

    it("should disable toggle while loading", () => {
      render(
        <NotificationSettings
          settings={mockInitialData}
          onToggle={mockOnToggle}
          disabled={false}
          loadingToggles={{ notify_new_application: true }}
        />
      );

      const newAppToggle = screen.getByRole("switch", {
        name: /แจ้งเตือนใบสมัครใหม่/i,
      });
      expect(newAppToggle).toBeDisabled();
    });
  });
});
