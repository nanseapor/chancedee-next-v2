/**
 * COMP-R02: TeamClient Component Tests
 *
 * Tests for the main team page client component:
 * - Integration with hooks
 * - Loading state rendering
 * - Error state rendering
 * - Permission-based rendering
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  })),
  usePathname: vi.fn(() => "/jobsmarket/companies/comp-test-123/dashboard/team"),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}));

// Mock hooks
const mockUseCompanyTeam = vi.fn();
const mockUseTeamActions = vi.fn();

vi.mock("@/hooks/jobsmarket/company/use-company-team", () => ({
  useCompanyTeam: () => mockUseCompanyTeam(),
}));

vi.mock("@/hooks/jobsmarket/company/use-team-actions", () => ({
  useTeamActions: () => mockUseTeamActions(),
}));

import { TeamClient } from "@/app/jobsmarket/companies/[id]/dashboard/team/_components/TeamClient";

// Mock data
const mockCompanyId = "comp-test-123";

const mockStaff = [
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

describe("TeamClient Component - COMP-R02", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementations
    mockUseTeamActions.mockReturnValue({
      acceptEmployee: vi.fn(),
      rejectEmployee: vi.fn(),
      changeRole: vi.fn(),
      removeEmployee: vi.fn(),
    });
  });

  describe("Loading State", () => {
    it("should render loading skeleton while data is loading", () => {
      mockUseCompanyTeam.mockReturnValue({
        staff: [],
        pending: [],
        isAdmin: false,
        isLoading: true,
        error: null,
        mutate: vi.fn(),
      });

      render(<TeamClient companyId={mockCompanyId} />);

      // Should show loading indicator - component uses data-testid="loading-skeleton"
      expect(screen.queryByTestId("loading-skeleton")).toBeInTheDocument();
    });

    it("should not render team content while loading", () => {
      mockUseCompanyTeam.mockReturnValue({
        staff: [],
        pending: [],
        isAdmin: false,
        isLoading: true,
        error: null,
        mutate: vi.fn(),
      });

      render(<TeamClient companyId={mockCompanyId} />);

      expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
    });
  });

  describe("Error State", () => {
    it("should render error message when fetch fails", () => {
      mockUseCompanyTeam.mockReturnValue({
        staff: [],
        pending: [],
        isAdmin: false,
        isLoading: false,
        error: new Error("Failed to load team data"),
        mutate: vi.fn(),
      });

      render(<TeamClient companyId={mockCompanyId} />);

      // Should show error message
      expect(screen.queryByText(/เกิดข้อผิดพลาด/)).toBeInTheDocument();
    });

    it("should provide retry button on error", () => {
      mockUseCompanyTeam.mockReturnValue({
        staff: [],
        pending: [],
        isAdmin: false,
        isLoading: false,
        error: new Error("Failed to load team data"),
        mutate: vi.fn(),
      });

      render(<TeamClient companyId={mockCompanyId} />);

      // Component shows "ลองใหม่อีกครั้ง" button
      expect(screen.queryByRole("button", { name: /ลองใหม่/ })).toBeInTheDocument();
    });
  });

  describe("Success State", () => {
    it("should render team tabs when data is loaded", () => {
      mockUseCompanyTeam.mockReturnValue({
        staff: mockStaff,
        pending: mockPending,
        isAdmin: true,
        isLoading: false,
        error: null,
        mutate: vi.fn(),
      });

      render(<TeamClient companyId={mockCompanyId} />);

      expect(screen.queryByRole("tablist")).toBeInTheDocument();
    });

    it("should pass staff data to child components", () => {
      mockUseCompanyTeam.mockReturnValue({
        staff: mockStaff,
        pending: [],
        isAdmin: true,
        isLoading: false,
        error: null,
        mutate: vi.fn(),
      });

      render(<TeamClient companyId={mockCompanyId} />);

      // Should render staff
      expect(screen.queryByText("Admin User")).toBeInTheDocument();
    });

    it("should pass pending data to child components", () => {
      mockUseCompanyTeam.mockReturnValue({
        staff: mockStaff,
        pending: mockPending,
        isAdmin: true,
        isLoading: false,
        error: null,
        mutate: vi.fn(),
      });

      render(<TeamClient companyId={mockCompanyId} />);

      // Should render pending section
      expect(screen.queryByText("Pending User")).toBeInTheDocument();
    });
  });

  describe("Admin vs Non-Admin View", () => {
    it("should show invite tab for admin users", () => {
      mockUseCompanyTeam.mockReturnValue({
        staff: mockStaff,
        pending: [],
        isAdmin: true,
        isLoading: false,
        error: null,
        mutate: vi.fn(),
      });

      render(<TeamClient companyId={mockCompanyId} />);

      expect(screen.queryByRole("tab", { name: /เชิญสมาชิก/ })).toBeInTheDocument();
    });

    it("should hide invite tab for non-admin users", () => {
      mockUseCompanyTeam.mockReturnValue({
        staff: mockStaff,
        pending: [],
        isAdmin: false,
        isLoading: false,
        error: null,
        mutate: vi.fn(),
      });

      render(<TeamClient companyId={mockCompanyId} currentUserId="user-member-456" />);

      // Non-admin should not see invite tab
      expect(screen.queryByRole("tab", { name: /เชิญสมาชิก/ })).not.toBeInTheDocument();
    });

    it("should hide action menu for non-admin users", () => {
      mockUseCompanyTeam.mockReturnValue({
        staff: mockStaff,
        pending: [],
        isAdmin: false,
        isLoading: false,
        error: null,
        mutate: vi.fn(),
      });

      render(<TeamClient companyId={mockCompanyId} currentUserId="user-member-456" />);

      // Action menu should be hidden for non-admin
      expect(screen.queryByTestId("member-action-menu")).not.toBeInTheDocument();
    });
  });

  describe("Page Header", () => {
    it("should render page title", () => {
      mockUseCompanyTeam.mockReturnValue({
        staff: mockStaff,
        pending: [],
        isAdmin: true,
        isLoading: false,
        error: null,
        mutate: vi.fn(),
      });

      render(<TeamClient companyId={mockCompanyId} />);

      expect(screen.queryByText("ทีมงาน")).toBeInTheDocument();
    });

    it("should render page description", () => {
      mockUseCompanyTeam.mockReturnValue({
        staff: mockStaff,
        pending: [],
        isAdmin: true,
        isLoading: false,
        error: null,
        mutate: vi.fn(),
      });

      render(<TeamClient companyId={mockCompanyId} />);

      expect(screen.queryByText("จัดการสมาชิกและบทบาทในบริษัท")).toBeInTheDocument();
    });
  });
});
