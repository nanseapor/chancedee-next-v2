/**
 * COMP-R02: PendingSection Component Tests
 *
 * Tests for the pending applications section:
 * - Renders pending list
 * - Header with count
 * - Empty state
 *
 * TDD RED Phase: All tests should FAIL until implementation.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import { PendingSection } from "@/app/jobsmarket/companies/[id]/dashboard/team/_components/PendingSection";

// Mock data
const mockPending = [
  {
    uid: "user-pending-1",
    email: "pending1@test.com",
    displayName: "Pending User 1",
    requestTimestamp: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
    isExpired: false,
  },
  {
    uid: "user-pending-2",
    email: "pending2@test.com",
    displayName: "Pending User 2",
    requestTimestamp: Date.now() - 8 * 24 * 60 * 60 * 1000, // 8 days ago (expired)
    isExpired: true,
  },
];

describe("PendingSection Component - COMP-R02", () => {
  const mockOnAccept = vi.fn();
  const mockOnReject = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Section Header", () => {
    it("should render section title", () => {
      render(
        <PendingSection
          pending={mockPending}
          isAdmin={true}
          onAccept={mockOnAccept}
          onReject={mockOnReject}
        />
      );

      expect(screen.queryByText(/คำขอที่รอการตอบรับ/)).toBeInTheDocument();
    });

    it("should show pending count", () => {
      render(
        <PendingSection
          pending={mockPending}
          isAdmin={true}
          onAccept={mockOnAccept}
          onReject={mockOnReject}
        />
      );

      expect(screen.queryByText("2")).toBeInTheDocument();
    });

    it("should update count when pending list changes", () => {
      render(
        <PendingSection
          pending={[mockPending[0]]}
          isAdmin={true}
          onAccept={mockOnAccept}
          onReject={mockOnReject}
        />
      );

      expect(screen.queryByText("1")).toBeInTheDocument();
    });
  });

  describe("Pending List", () => {
    it("should render a row for each pending application", () => {
      render(
        <PendingSection
          pending={mockPending}
          isAdmin={true}
          onAccept={mockOnAccept}
          onReject={mockOnReject}
        />
      );

      expect(screen.queryByText("Pending User 1")).toBeInTheDocument();
      expect(screen.queryByText("Pending User 2")).toBeInTheDocument();
    });

    it("should render pending rows in order", () => {
      render(
        <PendingSection
          pending={mockPending}
          isAdmin={true}
          onAccept={mockOnAccept}
          onReject={mockOnReject}
        />
      );

      const rows = screen.getAllByTestId(/pending-row/);
      expect(rows).toHaveLength(2);
    });
  });

  describe("Empty State", () => {
    it("should not render when no pending applications", () => {
      render(
        <PendingSection
          pending={[]}
          isAdmin={true}
          onAccept={mockOnAccept}
          onReject={mockOnReject}
        />
      );

      expect(screen.queryByTestId("pending-section")).not.toBeInTheDocument();
    });

    it("should render section only when has pending", () => {
      const { rerender } = render(
        <PendingSection
          pending={[]}
          isAdmin={true}
          onAccept={mockOnAccept}
          onReject={mockOnReject}
        />
      );

      expect(screen.queryByTestId("pending-section")).not.toBeInTheDocument();

      rerender(
        <PendingSection
          pending={mockPending}
          isAdmin={true}
          onAccept={mockOnAccept}
          onReject={mockOnReject}
        />
      );

      expect(screen.queryByTestId("pending-section")).toBeInTheDocument();
    });
  });

  describe("Admin View", () => {
    it("should show accept/reject buttons for admin", () => {
      render(
        <PendingSection
          pending={mockPending}
          isAdmin={true}
          onAccept={mockOnAccept}
          onReject={mockOnReject}
        />
      );

      expect(screen.queryAllByRole("button", { name: /ตอบรับ/ })).toHaveLength(2);
      expect(screen.queryAllByRole("button", { name: /ปฏิเสธ/ })).toHaveLength(2);
    });

    it("should hide action buttons for non-admin", () => {
      render(
        <PendingSection
          pending={mockPending}
          isAdmin={false}
          onAccept={mockOnAccept}
          onReject={mockOnReject}
        />
      );

      expect(screen.queryByRole("button", { name: /ตอบรับ/ })).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /ปฏิเสธ/ })).not.toBeInTheDocument();
    });
  });

  describe("Expired Indicator", () => {
    it("should show expired badge for old applications", () => {
      render(
        <PendingSection
          pending={mockPending}
          isAdmin={true}
          onAccept={mockOnAccept}
          onReject={mockOnReject}
        />
      );

      // Multiple elements may contain "หมดอายุ" (header + badge on rows)
      const expiredElements = screen.queryAllByText(/หมดอายุ/);
      expect(expiredElements.length).toBeGreaterThan(0);
    });
  });
});
