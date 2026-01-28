/**
 * COMP-R02: MembersTab Component Tests
 *
 * Tests for the members tab content:
 * - Renders member table
 * - Renders pending section
 * - Empty states
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import { MembersTab } from "@/app/jobsmarket/companies/[id]/dashboard/team/_components/MembersTab";

// Mock data
const mockMembers = [
  {
    uid: "user-admin-123",
    email: "admin@test.com",
    displayName: "Admin User",
    role: "admin" as const,
    joinedAt: Date.now(),
  },
  {
    uid: "user-member-456",
    email: "member@test.com",
    displayName: "Member User",
    role: "recruiter" as const,
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

describe("MembersTab Component - COMP-R02", () => {
  const mockOnAcceptEmployee = vi.fn().mockResolvedValue(undefined);
  const mockOnRejectEmployee = vi.fn().mockResolvedValue(undefined);
  const mockOnChangeRole = vi.fn().mockResolvedValue(undefined);
  const mockOnRemoveEmployee = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering Staff Table", () => {
    it("should render member table with members", () => {
      render(
        <MembersTab
          members={mockMembers}
          pending={[]}
          isAdmin={true}
          currentUserId="user-admin-123"
          onAcceptEmployee={mockOnAcceptEmployee}
          onRejectEmployee={mockOnRejectEmployee}
          onChangeRole={mockOnChangeRole}
          onRemoveEmployee={mockOnRemoveEmployee}
        />
      );

      expect(screen.queryByTestId("member-table")).toBeInTheDocument();
    });

    it("should render all members", () => {
      render(
        <MembersTab
          members={mockMembers}
          pending={[]}
          isAdmin={true}
          currentUserId="user-admin-123"
          onAcceptEmployee={mockOnAcceptEmployee}
          onRejectEmployee={mockOnRejectEmployee}
          onChangeRole={mockOnChangeRole}
          onRemoveEmployee={mockOnRemoveEmployee}
        />
      );

      expect(screen.queryByText("Admin User")).toBeInTheDocument();
      expect(screen.queryByText("Member User")).toBeInTheDocument();
    });

    it("should show empty state when no members", () => {
      render(
        <MembersTab
          members={[]}
          pending={[]}
          isAdmin={true}
          currentUserId="user-admin-123"
          onAcceptEmployee={mockOnAcceptEmployee}
          onRejectEmployee={mockOnRejectEmployee}
          onChangeRole={mockOnChangeRole}
          onRemoveEmployee={mockOnRemoveEmployee}
        />
      );

      expect(screen.queryByText(/ยังไม่มีสมาชิก/)).toBeInTheDocument();
    });
  });

  describe("Rendering Pending Section", () => {
    it("should render pending section when there are pending applications", () => {
      render(
        <MembersTab
          members={mockMembers}
          pending={mockPending}
          isAdmin={true}
          currentUserId="user-admin-123"
          onAcceptEmployee={mockOnAcceptEmployee}
          onRejectEmployee={mockOnRejectEmployee}
          onChangeRole={mockOnChangeRole}
          onRemoveEmployee={mockOnRemoveEmployee}
        />
      );

      expect(screen.queryByTestId("pending-section")).toBeInTheDocument();
    });

    it("should show pending count in header", () => {
      render(
        <MembersTab
          members={mockMembers}
          pending={mockPending}
          isAdmin={true}
          currentUserId="user-admin-123"
          onAcceptEmployee={mockOnAcceptEmployee}
          onRejectEmployee={mockOnRejectEmployee}
          onChangeRole={mockOnChangeRole}
          onRemoveEmployee={mockOnRemoveEmployee}
        />
      );

      // Header shows "คำขอที่รอการตอบรับ" with count badge showing "1"
      expect(screen.queryByText(/คำขอที่รอการตอบรับ/)).toBeInTheDocument();
      expect(screen.queryByText("1")).toBeInTheDocument();
    });

    it("should not render pending section when no pending applications", () => {
      render(
        <MembersTab
          members={mockMembers}
          pending={[]}
          isAdmin={true}
          currentUserId="user-admin-123"
          onAcceptEmployee={mockOnAcceptEmployee}
          onRejectEmployee={mockOnRejectEmployee}
          onChangeRole={mockOnChangeRole}
          onRemoveEmployee={mockOnRemoveEmployee}
        />
      );

      expect(screen.queryByTestId("pending-section")).not.toBeInTheDocument();
    });
  });

  describe("Admin View", () => {
    it("should show action menu for admin", () => {
      render(
        <MembersTab
          members={mockMembers}
          pending={mockPending}
          isAdmin={true}
          currentUserId="user-admin-123"
          onAcceptEmployee={mockOnAcceptEmployee}
          onRejectEmployee={mockOnRejectEmployee}
          onChangeRole={mockOnChangeRole}
          onRemoveEmployee={mockOnRemoveEmployee}
        />
      );

      // Action menu should be visible for members (not self)
      expect(screen.queryByTestId("member-action-menu")).toBeInTheDocument();
    });

    it("should hide action menu for non-admin", () => {
      render(
        <MembersTab
          members={mockMembers}
          pending={[]}
          isAdmin={false}
          currentUserId="user-member-456"
          onAcceptEmployee={mockOnAcceptEmployee}
          onRejectEmployee={mockOnRejectEmployee}
          onChangeRole={mockOnChangeRole}
          onRemoveEmployee={mockOnRemoveEmployee}
        />
      );

      expect(screen.queryByTestId("member-action-menu")).not.toBeInTheDocument();
    });
  });
});
