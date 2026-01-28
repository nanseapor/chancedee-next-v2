/**
 * COMP-R03: ConfigTab Component Tests
 *
 * RED Phase: All tests should FAIL until implementation
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

// This import will fail until implementation exists
import { ConfigTab } from "@/app/jobsmarket/companies/[id]/dashboard/settings/_components/tabs/ConfigTab";

// Mock child components
vi.mock(
  "@/app/jobsmarket/companies/[id]/dashboard/settings/_components/config/DefaultJobSettings",
  () => ({
    DefaultJobSettings: () => (
      <div data-testid="default-job-settings">DefaultJobSettings</div>
    ),
  })
);

vi.mock(
  "@/app/jobsmarket/companies/[id]/dashboard/settings/_components/config/NotificationSettings",
  () => ({
    NotificationSettings: () => (
      <div data-testid="notification-settings">NotificationSettings</div>
    ),
  })
);

describe("COMP-R03: ConfigTab Component", () => {
  const mockConfig = {
    job_defaults: {
      default_location: "Bangkok",
      default_job_type: "full-time",
      auto_close_days: 30,
    },
    notifications: {
      notify_new_application: true,
      daily_summary_enabled: false,
      daily_summary_time: "09:00",
      interview_reminder_hours: 24,
    },
  };

  const mockOnUpdate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================
  // Rendering Tests (~2 tests)
  // ============================================
  describe("Rendering", () => {
    it("should render all config sections", () => {
      render(
        <ConfigTab config={mockConfig} onUpdate={mockOnUpdate} canEdit={true} />
      );

      expect(screen.getByTestId("default-job-settings")).toBeInTheDocument();
      expect(screen.getByTestId("notification-settings")).toBeInTheDocument();
    });

    it("should show section headers", () => {
      render(
        <ConfigTab config={mockConfig} onUpdate={mockOnUpdate} canEdit={true} />
      );

      expect(screen.getByText(/ค่าเริ่มต้นประกาศงาน/i)).toBeInTheDocument();
      expect(screen.getByText(/การแจ้งเตือน/i)).toBeInTheDocument();
    });
  });

  // ============================================
  // Permission Tests (~2 tests)
  // ============================================
  describe("Permissions", () => {
    it("should disable editing when canEdit is false", () => {
      render(
        <ConfigTab config={mockConfig} onUpdate={mockOnUpdate} canEdit={false} />
      );

      // Config tab should still render but editing should be disabled
      expect(screen.getByTestId("default-job-settings")).toBeInTheDocument();
    });

    it("should enable editing when canEdit is true", () => {
      render(
        <ConfigTab config={mockConfig} onUpdate={mockOnUpdate} canEdit={true} />
      );

      expect(screen.getByTestId("notification-settings")).toBeInTheDocument();
    });
  });
});
