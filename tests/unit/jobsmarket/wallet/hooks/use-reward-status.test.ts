/**
 * @fileoverview Tests for useRewardStatus hook
 * @specification WALLET-R01 Wallet Page
 * @section §3.2.3 Ways to Earn
 *
 * Requirements tested:
 * - WALLET-R01.rewards.status: Check claimed status for each reward type
 * - WALLET-R01.rewards.first_interview: Track first interview reward
 * - WALLET-R01.rewards.signup: Track signup reward
 * - WALLET-R01.rewards.loading: Handle loading state
 * - WALLET-R01.rewards.error: Handle error state
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

// Mock dependencies
vi.mock("@/lib/database/actions/candidate-information", () => ({
  webCandidateInformationGetById: vi.fn(),
}));

// Import the hook to test (will fail until implemented)
// import { useRewardStatus } from "@/hooks/jobsmarket/wallet/use-reward-status";

describe("useRewardStatus", () => {
  const mockCandidateId = "candidate-123";

  const mockCandidateInfo = {
    uid: "candidate-123",
    firstnameTH: "Test",
    lastnameTH: "User",
    isFirstInterviewerRewarded: true,
    isFirstApplicantionRewarded: false,
    isOnboarded: true,
    email: "test@example.com",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Initialization", () => {
    /**
     * Requirement: WALLET-R01.rewards.loading
     * "Show loading state while fetching"
     */
    it("should start in loading state", async () => {
      const { useRewardStatus } = await import(
        "@/hooks/jobsmarket/wallet/use-reward-status"
      );

      const { result } = renderHook(() => useRewardStatus(mockCandidateId));

      expect(result.current.isLoading).toBe(true);
    });

    /**
     * Requirement: WALLET-R01.rewards.status
     * "Fetch reward status on mount"
     */
    it("should fetch candidate info on mount", async () => {
      const { webCandidateInformationGetById } = await import(
        "@/lib/database/actions/candidate-information"
      );
      vi.mocked(webCandidateInformationGetById).mockResolvedValue(
        mockCandidateInfo
      );

      const { useRewardStatus } = await import(
        "@/hooks/jobsmarket/wallet/use-reward-status"
      );

      renderHook(() => useRewardStatus(mockCandidateId));

      await waitFor(() => {
        expect(webCandidateInformationGetById).toHaveBeenCalledWith(
          mockCandidateId
        );
      });
    });

    /**
     * Requirement: WALLET-R01.rewards.status
     * "Do not fetch if candidateId is null"
     */
    it("should not fetch if candidateId is null", async () => {
      const { webCandidateInformationGetById } = await import(
        "@/lib/database/actions/candidate-information"
      );

      const { useRewardStatus } = await import(
        "@/hooks/jobsmarket/wallet/use-reward-status"
      );

      renderHook(() => useRewardStatus(null));

      expect(webCandidateInformationGetById).not.toHaveBeenCalled();
    });
  });

  describe("First Interview Reward Status", () => {
    /**
     * Requirement: WALLET-R01.rewards.first_interview
     * "Return claimed=true if first interview reward received"
     */
    it("should return claimed=true for first interview if rewarded", async () => {
      const { webCandidateInformationGetById } = await import(
        "@/lib/database/actions/candidate-information"
      );
      vi.mocked(webCandidateInformationGetById).mockResolvedValue({
        ...mockCandidateInfo,
        isFirstInterviewerRewarded: true,
      });

      const { useRewardStatus } = await import(
        "@/hooks/jobsmarket/wallet/use-reward-status"
      );

      const { result } = renderHook(() => useRewardStatus(mockCandidateId));

      await waitFor(() => {
        expect(result.current.firstInterviewReward.claimed).toBe(true);
      });
    });

    /**
     * Requirement: WALLET-R01.rewards.first_interview
     * "Return claimed=false if first interview reward not received"
     */
    it("should return claimed=false for first interview if not rewarded", async () => {
      const { webCandidateInformationGetById } = await import(
        "@/lib/database/actions/candidate-information"
      );
      vi.mocked(webCandidateInformationGetById).mockResolvedValue({
        ...mockCandidateInfo,
        isFirstInterviewerRewarded: false,
      });

      const { useRewardStatus } = await import(
        "@/hooks/jobsmarket/wallet/use-reward-status"
      );

      const { result } = renderHook(() => useRewardStatus(mockCandidateId));

      await waitFor(() => {
        expect(result.current.firstInterviewReward.claimed).toBe(false);
      });
    });

    /**
     * Requirement: WALLET-R01.rewards.first_interview
     * "Return correct amount for first interview reward"
     */
    it("should return amount=100 for first interview reward", async () => {
      const { webCandidateInformationGetById } = await import(
        "@/lib/database/actions/candidate-information"
      );
      vi.mocked(webCandidateInformationGetById).mockResolvedValue(
        mockCandidateInfo
      );

      const { useRewardStatus } = await import(
        "@/hooks/jobsmarket/wallet/use-reward-status"
      );

      const { result } = renderHook(() => useRewardStatus(mockCandidateId));

      await waitFor(() => {
        expect(result.current.firstInterviewReward.amount).toBe(100);
      });
    });
  });

  describe("First Application Reward Status", () => {
    /**
     * Requirement: WALLET-R01.rewards.first_application
     * "Return claimed=true if first application reward received"
     */
    it("should return claimed=true for first application if rewarded", async () => {
      const { webCandidateInformationGetById } = await import(
        "@/lib/database/actions/candidate-information"
      );
      vi.mocked(webCandidateInformationGetById).mockResolvedValue({
        ...mockCandidateInfo,
        isFirstApplicantionRewarded: true,
      });

      const { useRewardStatus } = await import(
        "@/hooks/jobsmarket/wallet/use-reward-status"
      );

      const { result } = renderHook(() => useRewardStatus(mockCandidateId));

      await waitFor(() => {
        expect(result.current.firstApplicationReward.claimed).toBe(true);
      });
    });

    /**
     * Requirement: WALLET-R01.rewards.first_application
     * "Return claimed=false if first application reward not received"
     */
    it("should return claimed=false for first application if not rewarded", async () => {
      const { webCandidateInformationGetById } = await import(
        "@/lib/database/actions/candidate-information"
      );
      vi.mocked(webCandidateInformationGetById).mockResolvedValue({
        ...mockCandidateInfo,
        isFirstApplicantionRewarded: false,
      });

      const { useRewardStatus } = await import(
        "@/hooks/jobsmarket/wallet/use-reward-status"
      );

      const { result } = renderHook(() => useRewardStatus(mockCandidateId));

      await waitFor(() => {
        expect(result.current.firstApplicationReward.claimed).toBe(false);
      });
    });

    /**
     * Requirement: WALLET-R01.rewards.first_application
     * "Return correct amount for first application reward"
     */
    it("should return amount=100 for first application reward", async () => {
      const { webCandidateInformationGetById } = await import(
        "@/lib/database/actions/candidate-information"
      );
      vi.mocked(webCandidateInformationGetById).mockResolvedValue(
        mockCandidateInfo
      );

      const { useRewardStatus } = await import(
        "@/hooks/jobsmarket/wallet/use-reward-status"
      );

      const { result } = renderHook(() => useRewardStatus(mockCandidateId));

      await waitFor(() => {
        expect(result.current.firstApplicationReward.amount).toBe(100);
      });
    });
  });

  describe("Signup Reward Status", () => {
    /**
     * Requirement: WALLET-R01.rewards.signup
     * "Return claimed=true for onboarded users (assumed signup reward)"
     */
    it("should return claimed=true for signup if onboarded", async () => {
      const { webCandidateInformationGetById } = await import(
        "@/lib/database/actions/candidate-information"
      );
      vi.mocked(webCandidateInformationGetById).mockResolvedValue({
        ...mockCandidateInfo,
        isOnboarded: true,
      });

      const { useRewardStatus } = await import(
        "@/hooks/jobsmarket/wallet/use-reward-status"
      );

      const { result } = renderHook(() => useRewardStatus(mockCandidateId));

      await waitFor(() => {
        expect(result.current.signupReward.claimed).toBe(true);
      });
    });

    /**
     * Requirement: WALLET-R01.rewards.signup
     * "Return correct amount for signup reward"
     */
    it("should return amount=100 for signup reward", async () => {
      const { webCandidateInformationGetById } = await import(
        "@/lib/database/actions/candidate-information"
      );
      vi.mocked(webCandidateInformationGetById).mockResolvedValue(
        mockCandidateInfo
      );

      const { useRewardStatus } = await import(
        "@/hooks/jobsmarket/wallet/use-reward-status"
      );

      const { result } = renderHook(() => useRewardStatus(mockCandidateId));

      await waitFor(() => {
        expect(result.current.signupReward.amount).toBe(100);
      });
    });
  });

  describe("Referral Reward Status", () => {
    /**
     * Requirement: WALLET-R01.rewards.referral
     * "Return available status for referral reward"
     */
    it("should return referral reward as always available", async () => {
      const { webCandidateInformationGetById } = await import(
        "@/lib/database/actions/candidate-information"
      );
      vi.mocked(webCandidateInformationGetById).mockResolvedValue(
        mockCandidateInfo
      );

      const { useRewardStatus } = await import(
        "@/hooks/jobsmarket/wallet/use-reward-status"
      );

      const { result } = renderHook(() => useRewardStatus(mockCandidateId));

      await waitFor(() => {
        expect(result.current.referralReward.available).toBe(true);
        expect(result.current.referralReward.amount).toBe(100);
      });
    });
  });

  describe("All Rewards Summary", () => {
    /**
     * Requirement: WALLET-R01.rewards.status
     * "Return all rewards in a single object"
     */
    it("should return all rewards in rewards array", async () => {
      const { webCandidateInformationGetById } = await import(
        "@/lib/database/actions/candidate-information"
      );
      vi.mocked(webCandidateInformationGetById).mockResolvedValue(
        mockCandidateInfo
      );

      const { useRewardStatus } = await import(
        "@/hooks/jobsmarket/wallet/use-reward-status"
      );

      const { result } = renderHook(() => useRewardStatus(mockCandidateId));

      await waitFor(() => {
        expect(result.current.allRewards).toBeDefined();
        expect(Array.isArray(result.current.allRewards)).toBe(true);
        expect(result.current.allRewards.length).toBeGreaterThanOrEqual(4);
      });
    });

    /**
     * Requirement: WALLET-R01.rewards.status
     * "Each reward has required fields"
     */
    it("should have required fields for each reward", async () => {
      const { webCandidateInformationGetById } = await import(
        "@/lib/database/actions/candidate-information"
      );
      vi.mocked(webCandidateInformationGetById).mockResolvedValue(
        mockCandidateInfo
      );

      const { useRewardStatus } = await import(
        "@/hooks/jobsmarket/wallet/use-reward-status"
      );

      const { result } = renderHook(() => useRewardStatus(mockCandidateId));

      await waitFor(() => {
        result.current.allRewards.forEach((reward) => {
          expect(reward).toHaveProperty("id");
          expect(reward).toHaveProperty("titleTh");
          expect(reward).toHaveProperty("titleEn");
          expect(reward).toHaveProperty("amount");
          expect(reward).toHaveProperty("claimed");
        });
      });
    });
  });

  describe("Loading State", () => {
    /**
     * Requirement: WALLET-R01.rewards.loading
     * "isLoading becomes false after fetch"
     */
    it("should set isLoading to false after successful fetch", async () => {
      const { webCandidateInformationGetById } = await import(
        "@/lib/database/actions/candidate-information"
      );
      vi.mocked(webCandidateInformationGetById).mockResolvedValue(
        mockCandidateInfo
      );

      const { useRewardStatus } = await import(
        "@/hooks/jobsmarket/wallet/use-reward-status"
      );

      const { result } = renderHook(() => useRewardStatus(mockCandidateId));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe("Error Handling", () => {
    /**
     * Requirement: WALLET-R01.rewards.error
     * "Handle fetch error"
     */
    it("should set error on fetch failure", async () => {
      const { webCandidateInformationGetById } = await import(
        "@/lib/database/actions/candidate-information"
      );
      vi.mocked(webCandidateInformationGetById).mockRejectedValue(
        new Error("Network error")
      );

      const { useRewardStatus } = await import(
        "@/hooks/jobsmarket/wallet/use-reward-status"
      );

      const { result } = renderHook(() => useRewardStatus(mockCandidateId));

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });
    });

    /**
     * Requirement: WALLET-R01.rewards.error
     * "Return default unclaimed status on error"
     */
    it("should return unclaimed rewards on error", async () => {
      const { webCandidateInformationGetById } = await import(
        "@/lib/database/actions/candidate-information"
      );
      vi.mocked(webCandidateInformationGetById).mockRejectedValue(
        new Error("Network error")
      );

      const { useRewardStatus } = await import(
        "@/hooks/jobsmarket/wallet/use-reward-status"
      );

      const { result } = renderHook(() => useRewardStatus(mockCandidateId));

      await waitFor(() => {
        expect(result.current.firstInterviewReward.claimed).toBe(false);
        expect(result.current.firstApplicationReward.claimed).toBe(false);
      });
    });
  });
});
