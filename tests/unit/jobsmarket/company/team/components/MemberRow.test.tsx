/**
 * COMP-R02: MemberRow Component Tests
 *
 * Tests for individual member row:
 * - Renders member info
 * - Role badge display
 * - Action menu behavior
 * - Self-action prevention
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import { MemberRow } from "@/app/jobsmarket/companies/[id]/dashboard/team/_components/MemberRow";

// Mock data
const mockMember = {
  uid: "user-member-456",
  email: "member@test.com",
  displayName: "Member User",
  role: "recruiter" as const,
  joinedAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
  avatarUrl: "https://example.com/avatar.jpg",
};

const mockAdminMember = {
  uid: "user-admin-123",
  email: "admin@test.com",
  displayName: "Admin User",
  role: "admin" as const,
  joinedAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
};

describe("MemberRow Component - COMP-R02", () => {
  const mockOnChangeRole = vi.fn();
  const mockOnRemove = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Member Info Display", () => {
    it("should render member display name", () => {
      render(
        <table>
          <tbody>
            <MemberRow
              member={mockMember}
              isAdmin={true}
              isSelf={false}
              onChangeRole={mockOnChangeRole}
              onRemove={mockOnRemove}
            />
          </tbody>
        </table>
      );

      expect(screen.queryByText("Member User")).toBeInTheDocument();
    });

    it("should render member email", () => {
      render(
        <table>
          <tbody>
            <MemberRow
              member={mockMember}
              isAdmin={true}
              isSelf={false}
              onChangeRole={mockOnChangeRole}
              onRemove={mockOnRemove}
            />
          </tbody>
        </table>
      );

      expect(screen.queryByText("member@test.com")).toBeInTheDocument();
    });

    it("should render member avatar when available", () => {
      render(
        <table>
          <tbody>
            <MemberRow
              member={mockMember}
              isAdmin={true}
              isSelf={false}
              onChangeRole={mockOnChangeRole}
              onRemove={mockOnRemove}
            />
          </tbody>
        </table>
      );

      // In tests, AvatarImage doesn't load so we check for either img or fallback
      // The Avatar component structure is present when avatarUrl is provided
      const row = screen.getByTestId(`member-row-${mockMember.uid}`);
      expect(row).toBeInTheDocument();
      // Avatar container should be rendered
      const avatarContainer = row.querySelector('[class*="rounded-full"]');
      expect(avatarContainer).toBeInTheDocument();
    });

    it("should render fallback avatar when no image", () => {
      const memberWithoutAvatar = { ...mockMember, avatarUrl: undefined };
      render(
        <table>
          <tbody>
            <MemberRow
              member={memberWithoutAvatar}
              isAdmin={true}
              isSelf={false}
              onChangeRole={mockOnChangeRole}
              onRemove={mockOnRemove}
            />
          </tbody>
        </table>
      );

      // Should show initials fallback
      expect(screen.queryByTestId("avatar-fallback")).toBeInTheDocument();
    });
  });

  describe("Role Badge", () => {
    it("should render role badge with Thai label", () => {
      render(
        <table>
          <tbody>
            <MemberRow
              member={mockMember}
              isAdmin={true}
              isSelf={false}
              onChangeRole={mockOnChangeRole}
              onRemove={mockOnRemove}
            />
          </tbody>
        </table>
      );

      expect(screen.queryByText(/ผู้สรรหาบุคลากร/)).toBeInTheDocument();
    });

    it("should render admin badge for admin role", () => {
      render(
        <table>
          <tbody>
            <MemberRow
              member={mockAdminMember}
              isAdmin={true}
              isSelf={true}
              onChangeRole={mockOnChangeRole}
              onRemove={mockOnRemove}
            />
          </tbody>
        </table>
      );

      expect(screen.queryByText(/ผู้ดูแลระบบ/)).toBeInTheDocument();
    });
  });

  describe("Action Menu", () => {
    it("should render action menu for admin viewing other members", () => {
      render(
        <table>
          <tbody>
            <MemberRow
              member={mockMember}
              isAdmin={true}
              isSelf={false}
              onChangeRole={mockOnChangeRole}
              onRemove={mockOnRemove}
            />
          </tbody>
        </table>
      );

      expect(screen.queryByTestId("member-action-menu")).toBeInTheDocument();
    });

    it("should show change role option in menu", async () => {
      const user = userEvent.setup();
      render(
        <table>
          <tbody>
            <MemberRow
              member={mockMember}
              isAdmin={true}
              isSelf={false}
              onChangeRole={mockOnChangeRole}
              onRemove={mockOnRemove}
            />
          </tbody>
        </table>
      );

      const menuButton = screen.getByTestId("member-action-menu");
      await user.click(menuButton);

      expect(screen.queryByText(/เปลี่ยนบทบาท/)).toBeInTheDocument();
    });

    it("should show remove option in menu", async () => {
      const user = userEvent.setup();
      render(
        <table>
          <tbody>
            <MemberRow
              member={mockMember}
              isAdmin={true}
              isSelf={false}
              onChangeRole={mockOnChangeRole}
              onRemove={mockOnRemove}
            />
          </tbody>
        </table>
      );

      const menuButton = screen.getByTestId("member-action-menu");
      await user.click(menuButton);

      expect(screen.queryByText(/ลบออก/)).toBeInTheDocument();
    });

    it("should call onChangeRole with userId when clicking change role", async () => {
      const user = userEvent.setup();
      render(
        <table>
          <tbody>
            <MemberRow
              member={mockMember}
              isAdmin={true}
              isSelf={false}
              onChangeRole={mockOnChangeRole}
              onRemove={mockOnRemove}
            />
          </tbody>
        </table>
      );

      const menuButton = screen.getByTestId("member-action-menu");
      await user.click(menuButton);

      const changeRoleOption = screen.getByText(/เปลี่ยนบทบาท/);
      await user.click(changeRoleOption);

      // Component calls onChangeRole with userId, not member object
      expect(mockOnChangeRole).toHaveBeenCalledWith(mockMember.uid);
    });

    it("should call onRemove with userId when clicking remove", async () => {
      const user = userEvent.setup();
      render(
        <table>
          <tbody>
            <MemberRow
              member={mockMember}
              isAdmin={true}
              isSelf={false}
              onChangeRole={mockOnChangeRole}
              onRemove={mockOnRemove}
            />
          </tbody>
        </table>
      );

      const menuButton = screen.getByTestId("member-action-menu");
      await user.click(menuButton);

      const removeOption = screen.getByText(/ลบออก/);
      await user.click(removeOption);

      // Component calls onRemove with userId, not member object
      expect(mockOnRemove).toHaveBeenCalledWith(mockMember.uid);
    });
  });

  describe("Self-Action Prevention", () => {
    it("should not show action menu when viewing self", () => {
      render(
        <table>
          <tbody>
            <MemberRow
              member={mockAdminMember}
              isAdmin={true}
              isSelf={true}
              onChangeRole={mockOnChangeRole}
              onRemove={mockOnRemove}
            />
          </tbody>
        </table>
      );

      expect(screen.queryByTestId("member-action-menu")).not.toBeInTheDocument();
    });
  });

  describe("Non-Admin View", () => {
    it("should not show action menu for non-admin", () => {
      render(
        <table>
          <tbody>
            <MemberRow
              member={mockMember}
              isAdmin={false}
              isSelf={false}
              onChangeRole={mockOnChangeRole}
              onRemove={mockOnRemove}
            />
          </tbody>
        </table>
      );

      expect(screen.queryByTestId("member-action-menu")).not.toBeInTheDocument();
    });
  });
});
