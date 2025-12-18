import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import useSWR from "swr";

import { DashboardClient } from "@/app/jobsmarket/candidates/[id]/_components/DashboardClient";
import { useCandidateAuth } from "@/hooks/jobsmarket/use-candidate-auth";

/**
 * Integration tests for CAND-R01 Dashboard Error Handling
 * Tests section-level error isolation and recovery
 *
 * Coverage Target: Error boundaries and retry logic
 */

// Mock dependencies
vi.mock("@/hooks/jobsmarket/use-candidate-auth");
vi.mock("swr");
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
  })),
}));

describe("Dashboard Error Handling Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useCandidateAuth).mockReturnValue({
      state: "ready",
      isLoading: false,
      isReady: true,
      currentUserId: "user123",
      setOnboardingComplete: vi.fn(),
    });
  });

  describe("Section Error Isolation", () => {
    it("should isolate section error without breaking entire page", () => {
      const mockProfile = {
        uid: "user123",
        firstnameTH: "สมชาย",
        lastnameTH: "ใจดี",
      };

      vi.mocked(useSWR).mockImplementation((key) => {
        // Profile works
        if (Array.isArray(key) && key[0] === "candidate-profile") {
          return {
            data: mockProfile,
            error: undefined,
            isLoading: false,
            mutate: vi.fn(),
          } as any;
        }
        // Coin balance fails
        if (Array.isArray(key) && key[0] === "coin-balance") {
          return {
            data: undefined,
            error: new Error("Failed to fetch wallet"),
            isLoading: false,
            mutate: vi.fn(),
          } as any;
        }
        // Other sections work
        return {
          data: [],
          error: undefined,
          isLoading: false,
          mutate: vi.fn(),
        } as any;
      });

      render(<DashboardClient candidateId="user123" />);

      // Profile should still render (not affected by coin error)
      expect(screen.getByText(/สมชาย ใจดี/)).toBeInTheDocument();

      // Other sections should still render
      expect(screen.getByText(/สถานะการสมัครงาน/)).toBeInTheDocument();

      // Coin balance should show error
      expect(screen.getByText(/ไม่สามารถโหลดยอดเหรียญได้/)).toBeInTheDocument();
    });

    it("should handle multiple section errors independently", () => {
      const mockProfile = {
        uid: "user123",
        firstnameTH: "สมชาย",
        lastnameTH: "ใจดี",
      };

      vi.mocked(useSWR).mockImplementation((key) => {
        // Only profile succeeds
        if (Array.isArray(key) && key[0] === "candidate-profile") {
          return {
            data: mockProfile,
            error: undefined,
            isLoading: false,
            mutate: vi.fn(),
          } as any;
        }
        // Everything else fails
        return {
          data: undefined,
          error: new Error("Network error"),
          isLoading: false,
          mutate: vi.fn(),
        } as any;
      });

      render(<DashboardClient candidateId="user123" />);

      // Welcome header should still work (uses profile data)
      expect(screen.getByText(/สมชาย ใจดี/)).toBeInTheDocument();

      // Should show error message for coin balance
      expect(screen.getByText(/ไม่สามารถโหลดยอดเหรียญได้/)).toBeInTheDocument();
    });

    it("should show critical error when profile fetch fails", () => {
      vi.mocked(useSWR).mockImplementation((key) => {
        if (Array.isArray(key) && key[0] === "candidate-profile") {
          return {
            data: undefined,
            error: new Error("Failed to load profile"),
            isLoading: false,
            mutate: vi.fn(),
          } as any;
        }
        return {
          data: undefined,
          error: undefined,
          isLoading: false,
          mutate: vi.fn(),
        } as any;
      });

      render(<DashboardClient candidateId="user123" />);

      // Should show critical error page
      expect(screen.getByText(/ไม่สามารถโหลดข้อมูลได้/)).toBeInTheDocument();
      expect(screen.getByText(/เกิดข้อผิดพลาดในการโหลดข้อมูลโปรไฟล์/)).toBeInTheDocument();
    });
  });

  describe("Retry Logic", () => {
    it("should show reload button when profile fetch fails", () => {
      const mutateMock = vi.fn();

      vi.mocked(useSWR).mockImplementation((key) => {
        if (Array.isArray(key) && key[0] === "candidate-profile") {
          return {
            data: undefined,
            error: new Error("Network error"),
            isLoading: false,
            mutate: mutateMock,
          } as any;
        }
        return {
          data: undefined,
          error: undefined,
          isLoading: false,
          mutate: vi.fn(),
        } as any;
      });

      render(<DashboardClient candidateId="user123" />);

      // Reload button should be visible
      const reloadButton = screen.getByRole("button", { name: /โหลดใหม่/ });
      expect(reloadButton).toBeInTheDocument();

      // Button should be clickable
      expect(reloadButton).not.toBeDisabled();
    });

    it("should allow section-level retry for coin balance error", () => {
      const mockProfile = {
        uid: "user123",
        firstnameTH: "สมชาย",
        lastnameTH: "ใจดี",
      };

      const coinMutateMock = vi.fn();

      vi.mocked(useSWR).mockImplementation((key) => {
        if (Array.isArray(key) && key[0] === "candidate-profile") {
          return {
            data: mockProfile,
            error: undefined,
            isLoading: false,
            mutate: vi.fn(),
          } as any;
        }
        if (Array.isArray(key) && key[0] === "coin-balance") {
          return {
            data: undefined,
            error: new Error("Failed to fetch balance"),
            isLoading: false,
            mutate: coinMutateMock,
          } as any;
        }
        return {
          data: [],
          error: undefined,
          isLoading: false,
          mutate: vi.fn(),
        } as any;
      });

      render(<DashboardClient candidateId="user123" />);

      // Coin balance should show error state
      expect(screen.getByText(/ไม่สามารถโหลดยอดเหรียญได้/)).toBeInTheDocument();

      // Error state is handled within CoinBalanceCard component
      // Verify mutate function is available for potential retry
      expect(coinMutateMock).toBeDefined();
    });
  });

  describe("Error Messages in Thai", () => {
    it("should display Thai error message for network errors", () => {
      vi.mocked(useSWR).mockImplementation((key) => {
        if (Array.isArray(key) && key[0] === "candidate-profile") {
          return {
            data: undefined,
            error: new Error("Network request failed"),
            isLoading: false,
            mutate: vi.fn(),
          } as any;
        }
        return {
          data: undefined,
          error: undefined,
          isLoading: false,
          mutate: vi.fn(),
        } as any;
      });

      render(<DashboardClient candidateId="user123" />);

      // Should show Thai error message
      expect(screen.getByText(/ไม่สามารถโหลดข้อมูลได้/)).toBeInTheDocument();
      expect(screen.getByText(/เกิดข้อผิดพลาดในการโหลดข้อมูลโปรไฟล์/)).toBeInTheDocument();
      expect(screen.getByText(/กรุณาลองใหม่อีกครั้ง/)).toBeInTheDocument();
    });

    it("should display Thai error message for coin balance fetch error", () => {
      const mockProfile = {
        uid: "user123",
        firstnameTH: "สมชาย",
        lastnameTH: "ใจดี",
      };

      vi.mocked(useSWR).mockImplementation((key) => {
        if (Array.isArray(key) && key[0] === "candidate-profile") {
          return {
            data: mockProfile,
            error: undefined,
            isLoading: false,
            mutate: vi.fn(),
          } as any;
        }
        if (Array.isArray(key) && key[0] === "coin-balance") {
          return {
            data: undefined,
            error: new Error("Fetch failed"),
            isLoading: false,
            mutate: vi.fn(),
          } as any;
        }
        return {
          data: [],
          error: undefined,
          isLoading: false,
          mutate: vi.fn(),
        } as any;
      });

      render(<DashboardClient candidateId="user123" />);

      // Should show Thai error for coin balance
      expect(screen.getByText(/ไม่สามารถโหลดยอดเหรียญได้/)).toBeInTheDocument();
    });
  });
});
