/**
 * COMP-R02: MemberTable Component Tests
 *
 * Tests for the staff member table:
 * - Renders member rows
 * - Column headers
 * - Empty state
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import { MemberTable } from "@/app/jobsmarket/companies/[id]/dashboard/team/_components/MemberTable";

// Mock data - use `members` prop name to match actual component
const mockMembers = [
  {
    uid: "user-admin-123",
    email: "admin@test.com",
    displayName: "Admin User",
    role: "admin" as const,
    joinedAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
    avatarUrl: "https://example.com/avatar1.jpg",
  },
  {
    uid: "user-member-456",
    email: "member@test.com",
    displayName: "Member User",
    role: "recruiter" as const,
    joinedAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
  },
];

describe("MemberTable Component - COMP-R02", () => {
  const mockOnChangeRole = vi.fn();
  const mockOnRemove = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Table Headers", () => {
    it("should render column headers", () => {
      render(
        <MemberTable
          members={mockMembers}
          isAdmin={true}
          currentUserId="user-admin-123"
          onChangeRole={mockOnChangeRole}
          onRemove={mockOnRemove}
        />
      );

      // Check for Thai headers - component uses "สมาชิก", "บทบาท", "เข้าร่วมเมื่อ"
      expect(screen.queryByText("สมาชิก")).toBeInTheDocument();
      expect(screen.queryByText("บทบาท")).toBeInTheDocument();
      expect(screen.queryByText("เข้าร่วมเมื่อ")).toBeInTheDocument();
    });

    it("should render manage column for admin", () => {
      render(
        <MemberTable
          members={mockMembers}
          isAdmin={true}
          currentUserId="user-admin-123"
          onChangeRole={mockOnChangeRole}
          onRemove={mockOnRemove}
        />
      );

      // Admin sees "จัดการ" column
      expect(screen.queryByText("จัดการ")).toBeInTheDocument();
    });
  });

  describe("Member Rows", () => {
    it("should render a row for each member", () => {
      render(
        <MemberTable
          members={mockMembers}
          isAdmin={true}
          currentUserId="user-admin-123"
          onChangeRole={mockOnChangeRole}
          onRemove={mockOnRemove}
        />
      );

      expect(screen.queryByText("Admin User")).toBeInTheDocument();
      expect(screen.queryByText("Member User")).toBeInTheDocument();
    });

    it("should render email for each member", () => {
      render(
        <MemberTable
          members={mockMembers}
          isAdmin={true}
          currentUserId="user-admin-123"
          onChangeRole={mockOnChangeRole}
          onRemove={mockOnRemove}
        />
      );

      expect(screen.queryByText("admin@test.com")).toBeInTheDocument();
      expect(screen.queryByText("member@test.com")).toBeInTheDocument();
    });

    it("should render role badges", () => {
      render(
        <MemberTable
          members={mockMembers}
          isAdmin={true}
          currentUserId="user-admin-123"
          onChangeRole={mockOnChangeRole}
          onRemove={mockOnRemove}
        />
      );

      // Should show Thai role labels
      expect(screen.queryByText(/ผู้ดูแลระบบ/)).toBeInTheDocument();
      expect(screen.queryByText(/ผู้สรรหาบุคลากร/)).toBeInTheDocument();
    });
  });

  describe("Empty State", () => {
    it("should show empty state when no members", () => {
      render(
        <MemberTable
          members={[]}
          isAdmin={true}
          currentUserId="user-admin-123"
          onChangeRole={mockOnChangeRole}
          onRemove={mockOnRemove}
        />
      );

      expect(screen.queryByText(/ยังไม่มีสมาชิกในทีม/)).toBeInTheDocument();
    });

    it("should show invite message in empty state", () => {
      render(
        <MemberTable
          members={[]}
          isAdmin={true}
          currentUserId="user-admin-123"
          onChangeRole={mockOnChangeRole}
          onRemove={mockOnRemove}
        />
      );

      expect(screen.queryByText(/เชิญสมาชิกเพื่อเริ่มสร้างทีมของคุณ/)).toBeInTheDocument();
    });
  });

  describe("Admin Actions", () => {
    it("should render action menu for admin viewing other members", () => {
      render(
        <MemberTable
          members={mockMembers}
          isAdmin={true}
          currentUserId="user-admin-123"
          onChangeRole={mockOnChangeRole}
          onRemove={mockOnRemove}
        />
      );

      // Should have action menu for member-456 (not for admin-123 since that's self)
      expect(screen.queryAllByTestId("member-action-menu")).toHaveLength(1);
    });

    it("should not render action menu for self", () => {
      render(
        <MemberTable
          members={mockMembers}
          isAdmin={true}
          currentUserId="user-admin-123"
          onChangeRole={mockOnChangeRole}
          onRemove={mockOnRemove}
        />
      );

      // Admin cannot act on themselves - no action menu on admin row
      const adminRow = screen.getByTestId("member-row-user-admin-123");
      expect(adminRow.querySelector('[data-testid="member-action-menu"]')).not.toBeInTheDocument();
    });

    it("should not render action menus for non-admin users", () => {
      render(
        <MemberTable
          members={mockMembers}
          isAdmin={false}
          currentUserId="user-member-456"
          onChangeRole={mockOnChangeRole}
          onRemove={mockOnRemove}
        />
      );

      expect(screen.queryByTestId("member-action-menu")).not.toBeInTheDocument();
    });
  });
});
