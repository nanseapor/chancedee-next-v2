/**
 * @fileoverview Unit tests for FilterTabs component
 * @specification NOTIF-R01 §4.1
 *
 * TDD RED Phase: These tests should FAIL because the component doesn't exist yet.
 *
 * Requirements tested:
 * - NOTIF-R01.ui.filterTabs: Filter tab rendering and interaction
 * - NOTIF-R00.filters: Filter categories (all, applications, messages, appointments, system)
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
// This import will fail - component doesn't exist yet (TDD RED phase)
import { FilterTabs } from "@/components/jobsmarket/notifications/FilterTabs";
import type { NotificationFilterCategory } from "@/types/notification.types";

describe("FilterTabs", () => {
  const defaultProps = {
    activeFilter: "all" as NotificationFilterCategory,
    onFilterChange: vi.fn(),
    counts: {
      applications: 2,
      appointments: 3,
      system: 1,
    },
    disabled: false,
  };

  describe("Rendering", () => {
    /**
     * Requirement: NOTIF-R00.filters
     * "Should render all 5 filter tabs"
     */
    it("should render all 5 filter tabs", () => {
      render(<FilterTabs {...defaultProps} />);

      expect(screen.getByRole("tab", { name: /ทั้งหมด/i })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /สมัครงาน/i })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /ข้อความ/i })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /นัดหมาย/i })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /ระบบ/i })).toBeInTheDocument();
    });

    /**
     * Requirement: NOTIF-R01.ui.filterTabs.active
     * "Should highlight active filter"
     */
    it("should highlight active filter", () => {
      render(<FilterTabs {...defaultProps} activeFilter="appointments" />);

      const appointmentsTab = screen.getByRole("tab", { name: /นัดหมาย/i });
      expect(appointmentsTab).toHaveAttribute("aria-selected", "true");
      expect(appointmentsTab).toHaveClass("bg-secondary-100");
    });

    /**
     * Requirement: NOTIF-R01.ui.filterTabs.badge
     * "Should show count badges when counts provided"
     */
    it("should show count badges on tabs with unread", () => {
      render(<FilterTabs {...defaultProps} />);

      // Applications has 2 unread
      const applicationsBadge = screen.getByTestId("filter-badge-applications");
      expect(applicationsBadge).toHaveTextContent("2");

      // Appointments has 3 unread
      const appointmentsBadge = screen.getByTestId("filter-badge-appointments");
      expect(appointmentsBadge).toHaveTextContent("3");

      // System has 1 unread
      const systemBadge = screen.getByTestId("filter-badge-system");
      expect(systemBadge).toHaveTextContent("1");
    });

    /**
     * Requirement: NOTIF-R01.ui.filterTabs.badge
     * "Should not show badge when count is 0"
     */
    it("should not show badge when count is 0", () => {
      render(
        <FilterTabs
          {...defaultProps}
          counts={{
            applications: 0,
            appointments: 1,
            system: 0,
          }}
        />
      );

      expect(screen.queryByTestId("filter-badge-applications")).not.toBeInTheDocument();
      expect(screen.getByTestId("filter-badge-appointments")).toBeInTheDocument();
      expect(screen.queryByTestId("filter-badge-system")).not.toBeInTheDocument();
    });

    /**
     * Requirement: NOTIF-R01.ui.filterTabs.badge
     * "Should show 99+ for counts over 99"
     */
    it("should show 99+ for counts over 99", () => {
      render(
        <FilterTabs
          {...defaultProps}
          counts={{
            applications: 150,
            appointments: 99,
            system: 100,
          }}
        />
      );

      const applicationsBadge = screen.getByTestId("filter-badge-applications");
      expect(applicationsBadge).toHaveTextContent("99+");

      const appointmentsBadge = screen.getByTestId("filter-badge-appointments");
      expect(appointmentsBadge).toHaveTextContent("99");

      const systemBadge = screen.getByTestId("filter-badge-system");
      expect(systemBadge).toHaveTextContent("99+");
    });

    /**
     * Requirement: NOTIF-R01.ui.filterTabs.scroll
     * "Tabs should be horizontally scrollable on mobile"
     */
    it("should have horizontal scroll container", () => {
      render(<FilterTabs {...defaultProps} />);

      const tablist = screen.getByRole("tablist");
      expect(tablist).toHaveClass("overflow-x-auto");
    });
  });

  describe("Interaction", () => {
    /**
     * Requirement: NOTIF-R01.ui.filterTabs.click
     * "Should call onFilterChange when tab clicked"
     */
    it("should call onFilterChange when tab clicked", () => {
      const onFilterChange = vi.fn();
      render(<FilterTabs {...defaultProps} onFilterChange={onFilterChange} />);

      fireEvent.click(screen.getByRole("tab", { name: /นัดหมาย/i }));

      expect(onFilterChange).toHaveBeenCalledWith("appointments");
    });

    /**
     * Requirement: NOTIF-R01.ui.filterTabs.click
     * "Should call onFilterChange with correct filter value"
     */
    it("should call onFilterChange with correct filter value for each tab", () => {
      const onFilterChange = vi.fn();
      render(<FilterTabs {...defaultProps} onFilterChange={onFilterChange} />);

      fireEvent.click(screen.getByRole("tab", { name: /ทั้งหมด/i }));
      expect(onFilterChange).toHaveBeenCalledWith("all");

      fireEvent.click(screen.getByRole("tab", { name: /สมัครงาน/i }));
      expect(onFilterChange).toHaveBeenCalledWith("applications");

      fireEvent.click(screen.getByRole("tab", { name: /ข้อความ/i }));
      expect(onFilterChange).toHaveBeenCalledWith("messages");

      fireEvent.click(screen.getByRole("tab", { name: /นัดหมาย/i }));
      expect(onFilterChange).toHaveBeenCalledWith("appointments");

      fireEvent.click(screen.getByRole("tab", { name: /ระบบ/i }));
      expect(onFilterChange).toHaveBeenCalledWith("system");
    });

    /**
     * Requirement: NOTIF-R01.ui.filterTabs.disabled
     * "Should not call onFilterChange when disabled"
     */
    it("should not call onFilterChange when disabled", () => {
      const onFilterChange = vi.fn();
      render(<FilterTabs {...defaultProps} onFilterChange={onFilterChange} disabled={true} />);

      fireEvent.click(screen.getByRole("tab", { name: /นัดหมาย/i }));

      expect(onFilterChange).not.toHaveBeenCalled();
    });
  });

  describe("Accessibility", () => {
    /**
     * Requirement: NOTIF-R01.a11y
     * "Should have proper ARIA roles"
     */
    it("should have proper ARIA roles", () => {
      render(<FilterTabs {...defaultProps} />);

      expect(screen.getByRole("tablist")).toBeInTheDocument();
      expect(screen.getAllByRole("tab")).toHaveLength(5);
    });

    /**
     * Requirement: NOTIF-R01.a11y
     * "Should support keyboard navigation"
     */
    it("should support keyboard navigation", () => {
      const onFilterChange = vi.fn();
      render(<FilterTabs {...defaultProps} onFilterChange={onFilterChange} />);

      const allTab = screen.getByRole("tab", { name: /ทั้งหมด/i });
      allTab.focus();

      // Arrow right should move to next tab
      fireEvent.keyDown(allTab, { key: "ArrowRight" });
      expect(screen.getByRole("tab", { name: /สมัครงาน/i })).toHaveFocus();

      // Enter should select
      fireEvent.keyDown(document.activeElement!, { key: "Enter" });
      expect(onFilterChange).toHaveBeenCalledWith("applications");
    });

    /**
     * Requirement: NOTIF-R01.a11y
     * "Active tab should have aria-selected=true"
     */
    it("should have aria-selected on active tab only", () => {
      render(<FilterTabs {...defaultProps} activeFilter="messages" />);

      const messagesTab = screen.getByRole("tab", { name: /ข้อความ/i });
      expect(messagesTab).toHaveAttribute("aria-selected", "true");

      const otherTabs = screen.getAllByRole("tab").filter((tab) => tab !== messagesTab);
      otherTabs.forEach((tab) => {
        expect(tab).toHaveAttribute("aria-selected", "false");
      });
    });
  });
});
