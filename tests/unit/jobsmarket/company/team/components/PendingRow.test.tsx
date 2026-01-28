/**
 * COMP-R02: PendingRow Component Tests
 *
 * Tests for individual pending application row:
 * - Renders applicant info
 * - Accept/reject buttons
 * - Expired indicator
 * - Time since request
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { PendingRow } from "@/app/jobsmarket/companies/[id]/dashboard/team/_components/PendingRow";

// Mock data
const mockPendingUser = {
  uid: "user-pending-789",
  email: "pending@test.com",
  displayName: "Pending User",
  requestTimestamp: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
  isExpired: false,
  avatarUrl: "https://example.com/avatar.jpg",
};

const mockExpiredPendingUser = {
  ...mockPendingUser,
  uid: "user-expired-000",
  requestTimestamp: Date.now() - 8 * 24 * 60 * 60 * 1000, // 8 days ago
  isExpired: true,
};

describe("PendingRow Component - COMP-R02", () => {
  const mockOnAccept = vi.fn();
  const mockOnReject = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Applicant Info Display", () => {
    it("should render applicant name", () => {
      render(
        <PendingRow
          pending={mockPendingUser}
          isAdmin={true}
          onAccept={mockOnAccept}
          onReject={mockOnReject}
        />
      );

      expect(screen.queryByText("Pending User")).toBeInTheDocument();
    });

    it("should render applicant email", () => {
      render(
        <PendingRow
          pending={mockPendingUser}
          isAdmin={true}
          onAccept={mockOnAccept}
          onReject={mockOnReject}
        />
      );

      expect(screen.queryByText("pending@test.com")).toBeInTheDocument();
    });

    it("should render applicant avatar when available", () => {
      render(
        <PendingRow
          pending={mockPendingUser}
          isAdmin={true}
          onAccept={mockOnAccept}
          onReject={mockOnReject}
        />
      );

      // In tests, AvatarImage doesn't load so we check for avatar container
      const row = screen.getByTestId(`pending-row-${mockPendingUser.uid}`);
      expect(row).toBeInTheDocument();
      // Avatar container should be rendered (either Avatar component or fallback div)
      const avatarContainer = row.querySelector('[class*="rounded-full"]');
      expect(avatarContainer).toBeInTheDocument();
    });

    it("should render fallback avatar when no image", () => {
      const pendingWithoutAvatar = { ...mockPendingUser, avatarUrl: undefined };
      render(
        <PendingRow
          pending={pendingWithoutAvatar}
          isAdmin={true}
          onAccept={mockOnAccept}
          onReject={mockOnReject}
        />
      );

      expect(screen.queryByTestId("avatar-fallback")).toBeInTheDocument();
    });
  });

  describe("Time Since Request", () => {
    it("should show relative time for request", () => {
      render(
        <PendingRow
          pending={mockPendingUser}
          isAdmin={true}
          onAccept={mockOnAccept}
          onReject={mockOnReject}
        />
      );

      // Should show something like "2 วันที่แล้ว"
      expect(screen.queryByText(/วัน.*แล้ว/)).toBeInTheDocument();
    });

    it("should format recent requests correctly", () => {
      const recentPending = {
        ...mockPendingUser,
        requestTimestamp: Date.now() - 60 * 60 * 1000, // 1 hour ago
      };
      render(
        <PendingRow
          pending={recentPending}
          isAdmin={true}
          onAccept={mockOnAccept}
          onReject={mockOnReject}
        />
      );

      expect(screen.queryByText(/ชั่วโมง.*แล้ว/)).toBeInTheDocument();
    });
  });

  describe("Expired Indicator", () => {
    it("should show expired badge when application is expired", () => {
      render(
        <PendingRow
          pending={mockExpiredPendingUser}
          isAdmin={true}
          onAccept={mockOnAccept}
          onReject={mockOnReject}
        />
      );

      expect(screen.queryByText(/หมดอายุ/)).toBeInTheDocument();
    });

    it("should not show expired badge for non-expired applications", () => {
      render(
        <PendingRow
          pending={mockPendingUser}
          isAdmin={true}
          onAccept={mockOnAccept}
          onReject={mockOnReject}
        />
      );

      expect(screen.queryByText(/หมดอายุ/)).not.toBeInTheDocument();
    });

    it("should still allow actions on expired applications", () => {
      render(
        <PendingRow
          pending={mockExpiredPendingUser}
          isAdmin={true}
          onAccept={mockOnAccept}
          onReject={mockOnReject}
        />
      );

      // Actions should still be enabled
      expect(screen.queryByRole("button", { name: /ตอบรับ/ })).not.toBeDisabled();
      expect(screen.queryByRole("button", { name: /ปฏิเสธ/ })).not.toBeDisabled();
    });
  });

  describe("Action Buttons", () => {
    it("should render accept button for admin", () => {
      render(
        <PendingRow
          pending={mockPendingUser}
          isAdmin={true}
          onAccept={mockOnAccept}
          onReject={mockOnReject}
        />
      );

      expect(screen.queryByRole("button", { name: /ตอบรับ/ })).toBeInTheDocument();
    });

    it("should render reject button for admin", () => {
      render(
        <PendingRow
          pending={mockPendingUser}
          isAdmin={true}
          onAccept={mockOnAccept}
          onReject={mockOnReject}
        />
      );

      expect(screen.queryByRole("button", { name: /ปฏิเสธ/ })).toBeInTheDocument();
    });

    it("should call onAccept when clicking accept", () => {
      render(
        <PendingRow
          pending={mockPendingUser}
          isAdmin={true}
          onAccept={mockOnAccept}
          onReject={mockOnReject}
        />
      );

      const acceptButton = screen.getByRole("button", { name: /ตอบรับ/ });
      fireEvent.click(acceptButton);

      expect(mockOnAccept).toHaveBeenCalledWith(mockPendingUser.uid);
    });

    it("should call onReject when clicking reject", () => {
      render(
        <PendingRow
          pending={mockPendingUser}
          isAdmin={true}
          onAccept={mockOnAccept}
          onReject={mockOnReject}
        />
      );

      const rejectButton = screen.getByRole("button", { name: /ปฏิเสธ/ });
      fireEvent.click(rejectButton);

      expect(mockOnReject).toHaveBeenCalledWith(mockPendingUser.uid);
    });

    it("should not render action buttons for non-admin", () => {
      render(
        <PendingRow
          pending={mockPendingUser}
          isAdmin={false}
          onAccept={mockOnAccept}
          onReject={mockOnReject}
        />
      );

      expect(screen.queryByRole("button", { name: /ตอบรับ/ })).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /ปฏิเสธ/ })).not.toBeInTheDocument();
    });
  });

  describe("Loading State", () => {
    it("should show loading indicator when accepting", () => {
      render(
        <PendingRow
          pending={mockPendingUser}
          isAdmin={true}
          onAccept={mockOnAccept}
          onReject={mockOnReject}
          isAccepting={true}
        />
      );

      const acceptButton = screen.getByRole("button", { name: /กำลังตอบรับ/ });
      expect(acceptButton).toBeDisabled();
      expect(screen.queryByTestId("accept-loading")).toBeInTheDocument();
    });

    it("should show loading indicator when rejecting", () => {
      render(
        <PendingRow
          pending={mockPendingUser}
          isAdmin={true}
          onAccept={mockOnAccept}
          onReject={mockOnReject}
          isRejecting={true}
        />
      );

      const rejectButton = screen.getByRole("button", { name: /กำลังปฏิเสธ/ });
      expect(rejectButton).toBeDisabled();
      expect(screen.queryByTestId("reject-loading")).toBeInTheDocument();
    });
  });
});
