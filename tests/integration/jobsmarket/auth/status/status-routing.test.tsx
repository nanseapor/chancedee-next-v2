import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { useRouter, useSearchParams } from "next/navigation";
import { StatusClient } from "@/app/jobsmarket/auth/status/_components/StatusClient";
import { useFirebaseAuth } from "@/hooks/use-auth";
import type { userDataProps } from "@/types/auth.types";

// Mock dependencies
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
  useSearchParams: vi.fn(),
}));

vi.mock("@/hooks/use-auth", () => ({
  useFirebaseAuth: vi.fn(),
}));

vi.mock("@/lib/database/actions/user-data-props", () => ({
  webUserDataPropsGetById: vi.fn(),
}));

vi.mock("swr", () => ({
  default: vi.fn(),
}));

describe("StatusClient - Routing Integration", () => {
  const mockRouter = {
    push: vi.fn(),
  };

  const mockSearchParams = {
    get: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue(mockRouter);
    vi.mocked(useSearchParams).mockReturnValue(mockSearchParams);
  });

  describe("Authentication redirects", () => {
    it("should redirect to login when no Firebase user", async () => {
      vi.mocked(useFirebaseAuth).mockReturnValue({
        user: null,
        loading: false,
      });

      mockSearchParams.get.mockReturnValue(null);

      const { default: useSWR } = await import("swr");
      vi.mocked(useSWR).mockReturnValue({
        data: null,
        isLoading: false,
      });

      render(<StatusClient />);

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith("/jobsmarket/auth/login");
      });
    });

    it("should redirect to dashboard when user has no status", async () => {
      vi.mocked(useFirebaseAuth).mockReturnValue({
        user: { uid: "test-uid" },
        loading: false,
      });

      mockSearchParams.get.mockReturnValue(null);

      const userData: Partial<userDataProps> = {
        uid: "test-uid",
        info: {
          uid: "test-uid",
          roles: ["candidate"], // Active user, no pending status
        },
        isActive: true,
      };

      const { default: useSWR } = await import("swr");
      vi.mocked(useSWR).mockReturnValue({
        data: userData,
        isLoading: false,
      });

      render(<StatusClient />);

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith("/jobsmarket/dashboard");
      });
    });
  });

  describe("Status type routing", () => {
    it("should show DeletedStatusView for deleted user", async () => {
      vi.mocked(useFirebaseAuth).mockReturnValue({
        user: { uid: "test-uid" },
        loading: false,
      });

      mockSearchParams.get.mockReturnValue(null);

      const userData: Partial<userDataProps> = {
        uid: "test-uid",
        info: {
          uid: "test-uid",
          roles: ["deleted"],
        },
        isActive: false,
        status: "deleted",
      };

      const { default: useSWR } = await import("swr");
      vi.mocked(useSWR).mockReturnValue({
        data: userData,
        isLoading: false,
      });

      render(<StatusClient />);

      await waitFor(() => {
        expect(screen.getByText("บัญชีถูกลบแล้ว")).toBeInTheDocument();
        expect(screen.getByText("Account Deleted")).toBeInTheDocument();
      });
    });

    it("should show RejectedView when ?type=rejected", async () => {
      vi.mocked(useFirebaseAuth).mockReturnValue({
        user: { uid: "test-uid" },
        loading: false,
      });

      mockSearchParams.get.mockReturnValue("rejected");

      const { default: useSWR } = await import("swr");
      vi.mocked(useSWR).mockReturnValue({
        data: null, // No user data needed for rejected
        isLoading: false,
      });

      render(<StatusClient />);

      await waitFor(() => {
        expect(screen.getByText("คำขอถูกปฏิเสธ")).toBeInTheDocument();
        expect(screen.getByText("Application Rejected")).toBeInTheDocument();
      });
    });

    it("should show StaffPendingView for staff-pending user", async () => {
      vi.mocked(useFirebaseAuth).mockReturnValue({
        user: { uid: "test-uid" },
        loading: false,
      });

      mockSearchParams.get.mockReturnValue(null);

      const userData: Partial<userDataProps> = {
        uid: "test-uid",
        info: {
          uid: "test-uid",
          roles: ["pending", "candidate"],
        },
        transfer: {
          uid: "test-uid",
          targetCompany: "company-123",
          requestTimestamp: Date.now(),
          transferApproved: false,
        },
        isActive: true,
      };

      const { default: useSWR } = await import("swr");
      vi.mocked(useSWR).mockReturnValue({
        data: userData,
        isLoading: false,
      });

      render(<StatusClient />);

      await waitFor(() => {
        expect(screen.getByText("รอการอนุมัติ")).toBeInTheDocument();
        expect(screen.getByText("Waiting for Approval")).toBeInTheDocument();
      });
    });

    it("should show CompanyPendingView for company-pending user", async () => {
      vi.mocked(useFirebaseAuth).mockReturnValue({
        user: { uid: "test-uid" },
        loading: false,
      });

      mockSearchParams.get.mockReturnValue(null);

      const userData: Partial<userDataProps> = {
        uid: "test-uid",
        info: {
          uid: "test-uid",
          roles: ["pending", "admin"],
        },
        transfer: {
          uid: "test-uid",
          targetCompany: "company-456",
          requestTimestamp: Date.now(),
          transferApproved: false,
        },
        isActive: true,
      };

      const { default: useSWR } = await import("swr");
      vi.mocked(useSWR).mockReturnValue({
        data: userData,
        isLoading: false,
      });

      render(<StatusClient />);

      await waitFor(() => {
        expect(screen.getByText("กำลังตรวจสอบข้อมูล")).toBeInTheDocument();
        expect(screen.getByText("Under Review")).toBeInTheDocument();
      });
    });
  });

  describe("Query parameter validation", () => {
    it("should use detected type when ?type param doesn't match", async () => {
      vi.mocked(useFirebaseAuth).mockReturnValue({
        user: { uid: "test-uid" },
        loading: false,
      });

      // Query says "staff-pending" but user is actually deleted
      mockSearchParams.get.mockReturnValue("staff-pending");

      const userData: Partial<userDataProps> = {
        uid: "test-uid",
        info: {
          uid: "test-uid",
          roles: ["deleted"],
        },
        isActive: false,
        status: "deleted",
      };

      const { default: useSWR } = await import("swr");
      vi.mocked(useSWR).mockReturnValue({
        data: userData,
        isLoading: false,
      });

      render(<StatusClient />);

      // Should show deleted view (detected type) not staff-pending (query type)
      await waitFor(() => {
        expect(screen.getByText("บัญชีถูกลบแล้ว")).toBeInTheDocument();
        expect(screen.queryByText("รอการอนุมัติ")).not.toBeInTheDocument();
      });
    });
  });

  describe("Loading states", () => {
    it("should show loading spinner while auth is loading", async () => {
      vi.mocked(useFirebaseAuth).mockReturnValue({
        user: null,
        loading: true,
      });

      mockSearchParams.get.mockReturnValue(null);

      const { default: useSWR } = await import("swr");
      vi.mocked(useSWR).mockReturnValue({
        data: null,
        isLoading: false,
      });

      render(<StatusClient />);

      expect(screen.getByText("กำลังโหลด...")).toBeInTheDocument();
    });

    it("should show loading spinner while user data is loading", async () => {
      vi.mocked(useFirebaseAuth).mockReturnValue({
        user: { uid: "test-uid" },
        loading: false,
      });

      mockSearchParams.get.mockReturnValue(null);

      const { default: useSWR } = await import("swr");
      vi.mocked(useSWR).mockReturnValue({
        data: null,
        isLoading: true,
      });

      render(<StatusClient />);

      expect(screen.getByText("กำลังโหลด...")).toBeInTheDocument();
    });
  });
});
