/**
 * COMP-R02: TeamTabs Component Tests
 *
 * Tests for tab navigation:
 * - Tab switching
 * - Admin-only invite tab visibility
 * - Active tab state
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import { TeamTabs } from "@/app/jobsmarket/companies/[id]/dashboard/team/_components/TeamTabs";

// Mock data for required props
const mockMembers = [
  {
    uid: "user-admin-123",
    email: "admin@test.com",
    displayName: "Admin User",
    role: "admin" as const,
    joinedAt: Date.now(),
  },
];

const mockPending = [
  {
    uid: "user-pending-789",
    email: "pending@test.com",
    displayName: "Pending User",
    requestTimestamp: Date.now(),
    isExpired: false,
  },
];

describe("TeamTabs Component - COMP-R02", () => {
  const mockOnTabChange = vi.fn();
  const mockOnAcceptEmployee = vi.fn().mockResolvedValue(undefined);
  const mockOnRejectEmployee = vi.fn().mockResolvedValue(undefined);
  const mockOnChangeRole = vi.fn().mockResolvedValue(undefined);
  const mockOnRemoveEmployee = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderTeamTabs = (props: {
    activeTab?: string;
    isAdmin?: boolean;
  }) => {
    return render(
      <TeamTabs
        activeTab={props.activeTab ?? "members"}
        isAdmin={props.isAdmin ?? true}
        onTabChange={mockOnTabChange}
        members={mockMembers}
        pending={mockPending}
        currentUserId="user-admin-123"
        onAcceptEmployee={mockOnAcceptEmployee}
        onRejectEmployee={mockOnRejectEmployee}
        onChangeRole={mockOnChangeRole}
        onRemoveEmployee={mockOnRemoveEmployee}
      />
    );
  };

  describe("Rendering", () => {
    it("should render members tab", () => {
      renderTeamTabs({ isAdmin: true });

      // Use getAllByRole and check for existence since "สมาชิก" may appear in tab and badge
      const tabs = screen.getAllByRole("tab");
      const membersTab = tabs.find((tab) => tab.textContent?.includes("สมาชิก"));
      expect(membersTab).toBeInTheDocument();
    });

    it("should render invite tab for admin", () => {
      renderTeamTabs({ isAdmin: true });

      expect(screen.queryByRole("tab", { name: /เชิญสมาชิก/ })).toBeInTheDocument();
    });

    it("should not render invite tab for non-admin", () => {
      renderTeamTabs({ isAdmin: false });

      expect(screen.queryByRole("tab", { name: /เชิญสมาชิก/ })).not.toBeInTheDocument();
    });
  });

  describe("Tab Selection", () => {
    it("should show members tab as active by default", () => {
      renderTeamTabs({ activeTab: "members" });

      const tabs = screen.getAllByRole("tab");
      const membersTab = tabs.find((tab) => tab.textContent?.includes("สมาชิก"));
      expect(membersTab).toHaveAttribute("data-state", "active");
    });

    it("should show invite tab as active when selected", () => {
      renderTeamTabs({ activeTab: "invite", isAdmin: true });

      const inviteTab = screen.getByRole("tab", { name: /เชิญสมาชิก/ });
      expect(inviteTab).toHaveAttribute("data-state", "active");
    });
  });

  describe("Tab Switching", () => {
    it("should call onTabChange when clicking members tab", async () => {
      const user = userEvent.setup();
      renderTeamTabs({ activeTab: "invite", isAdmin: true });

      const tabs = screen.getAllByRole("tab");
      const membersTab = tabs.find((tab) => tab.textContent?.includes("สมาชิก") && !tab.textContent?.includes("เชิญ"));
      await user.click(membersTab!);

      expect(mockOnTabChange).toHaveBeenCalledWith("members");
    });

    it("should call onTabChange when clicking invite tab", async () => {
      const user = userEvent.setup();
      renderTeamTabs({ activeTab: "members", isAdmin: true });

      const tabs = screen.getAllByRole("tab");
      const inviteTab = tabs.find((tab) => tab.textContent?.includes("เชิญสมาชิก"));
      await user.click(inviteTab!);

      expect(mockOnTabChange).toHaveBeenCalledWith("invite");
    });
  });

  describe("Accessibility", () => {
    it("should have proper tablist role", () => {
      renderTeamTabs({ isAdmin: true });

      expect(screen.getByRole("tablist")).toBeInTheDocument();
    });

    it("should be keyboard navigable", () => {
      renderTeamTabs({ isAdmin: true });

      const tabs = screen.getAllByRole("tab");
      const membersTab = tabs.find((tab) => tab.textContent?.includes("สมาชิก") && !tab.textContent?.includes("เชิญ"));
      membersTab?.focus();

      expect(document.activeElement).toBe(membersTab);
    });
  });
});
