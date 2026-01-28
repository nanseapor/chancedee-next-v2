/**
 * @fileoverview Tests for RewardCard component
 * @specification WALLET-R01 Wallet Page
 * @section §3.2.3 Ways to Earn
 *
 * Requirements tested:
 * - WALLET-R01.reward.display: Display reward details
 * - WALLET-R01.reward.status: Show claimed/available badge
 * - WALLET-R01.reward.amount: Display coin amount
 * - WALLET-R01.reward.icon: Display appropriate icon
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// Import the component to test (will fail until implemented)
// import { RewardCard } from "@/app/jobsmarket/candidates/[id]/wallet/_components/RewardCard";

describe("RewardCard", () => {
  const mockClaimedReward = {
    id: "first_interview",
    titleTh: "สัมภาษณ์ครั้งแรก",
    titleEn: "First Interview",
    amount: 100,
    claimed: true,
  };

  const mockUnclaimedReward = {
    id: "first_application",
    titleTh: "สมัครงานครั้งแรก",
    titleEn: "First Application",
    amount: 100,
    claimed: false,
  };

  const mockReferralReward = {
    id: "referral",
    titleTh: "แนะนำเพื่อน",
    titleEn: "Referral Bonus",
    descriptionTh: "รับ 100 เหรียญต่อคน",
    amount: 100,
    claimed: false,
    available: true,
  };

  describe("Rendering", () => {
    /**
     * Requirement: WALLET-R01.reward.display
     * "Render reward card"
     */
    it("should render reward card", async () => {
      const { RewardCard } = await import(
        "@/app/jobsmarket/candidates/[id]/wallet/_components/RewardCard"
      );

      render(<RewardCard reward={mockClaimedReward} />);

      expect(
        screen.getByTestId(`reward-card-${mockClaimedReward.id}`)
      ).toBeInTheDocument();
    });

    /**
     * Requirement: WALLET-R01.reward.display
     * "Display Thai title"
     */
    it("should display Thai title", async () => {
      const { RewardCard } = await import(
        "@/app/jobsmarket/candidates/[id]/wallet/_components/RewardCard"
      );

      render(<RewardCard reward={mockClaimedReward} />);

      expect(screen.getByText("สัมภาษณ์ครั้งแรก")).toBeInTheDocument();
    });

    /**
     * Requirement: WALLET-R01.reward.display
     * "Display English subtitle"
     */
    it("should display English subtitle", async () => {
      const { RewardCard } = await import(
        "@/app/jobsmarket/candidates/[id]/wallet/_components/RewardCard"
      );

      render(<RewardCard reward={mockClaimedReward} />);

      expect(screen.getByText("First Interview")).toBeInTheDocument();
    });
  });

  describe("Amount Display", () => {
    /**
     * Requirement: WALLET-R01.reward.amount
     * "Display coin amount"
     */
    it("should display coin amount", async () => {
      const { RewardCard } = await import(
        "@/app/jobsmarket/candidates/[id]/wallet/_components/RewardCard"
      );

      render(<RewardCard reward={mockClaimedReward} />);

      expect(screen.getByTestId("reward-amount")).toHaveTextContent("100");
    });

    /**
     * Requirement: WALLET-R01.reward.amount
     * "Display + prefix for amount"
     */
    it("should show + prefix for amount", async () => {
      const { RewardCard } = await import(
        "@/app/jobsmarket/candidates/[id]/wallet/_components/RewardCard"
      );

      render(<RewardCard reward={mockUnclaimedReward} />);

      expect(screen.getByTestId("reward-amount")).toHaveTextContent("+100");
    });
  });

  describe("Claimed Status", () => {
    /**
     * Requirement: WALLET-R01.reward.status
     * "Show claimed badge for claimed rewards"
     */
    it("should show claimed badge when claimed", async () => {
      const { RewardCard } = await import(
        "@/app/jobsmarket/candidates/[id]/wallet/_components/RewardCard"
      );

      render(<RewardCard reward={mockClaimedReward} />);

      expect(screen.getByTestId("reward-status-badge")).toHaveTextContent(
        /รับแล้ว|Claimed/i
      );
    });

    /**
     * Requirement: WALLET-R01.reward.status
     * "Show available indicator for unclaimed rewards"
     */
    it("should show available indicator when not claimed", async () => {
      const { RewardCard } = await import(
        "@/app/jobsmarket/candidates/[id]/wallet/_components/RewardCard"
      );

      render(<RewardCard reward={mockUnclaimedReward} />);

      expect(screen.getByTestId("reward-status-badge")).toHaveTextContent(
        /รอรับ|Available/i
      );
    });

    /**
     * Requirement: WALLET-R01.reward.status
     * "Claimed rewards should have muted style"
     */
    it("should have muted style when claimed", async () => {
      const { RewardCard } = await import(
        "@/app/jobsmarket/candidates/[id]/wallet/_components/RewardCard"
      );

      render(<RewardCard reward={mockClaimedReward} />);

      const card = screen.getByTestId(`reward-card-${mockClaimedReward.id}`);
      expect(card).toHaveClass(/opacity|muted|gray/i);
    });

    /**
     * Requirement: WALLET-R01.reward.status
     * "Unclaimed rewards should have highlighted style"
     */
    it("should have highlighted style when not claimed", async () => {
      const { RewardCard } = await import(
        "@/app/jobsmarket/candidates/[id]/wallet/_components/RewardCard"
      );

      render(<RewardCard reward={mockUnclaimedReward} />);

      const card = screen.getByTestId(`reward-card-${mockUnclaimedReward.id}`);
      expect(card).not.toHaveClass(/opacity|muted/i);
    });
  });

  describe("Referral Reward Special Case", () => {
    /**
     * Requirement: WALLET-R01.reward.referral
     * "Referral reward should show 'per person' text"
     */
    it("should show per person text for referral", async () => {
      const { RewardCard } = await import(
        "@/app/jobsmarket/candidates/[id]/wallet/_components/RewardCard"
      );

      render(<RewardCard reward={mockReferralReward} />);

      expect(screen.getByText(/ต่อคน|per person/i)).toBeInTheDocument();
    });

    /**
     * Requirement: WALLET-R01.reward.referral
     * "Referral reward should always be available"
     */
    it("should show referral as available", async () => {
      const { RewardCard } = await import(
        "@/app/jobsmarket/candidates/[id]/wallet/_components/RewardCard"
      );

      render(<RewardCard reward={mockReferralReward} />);

      expect(screen.getByTestId("reward-status-badge")).toHaveTextContent(
        /รับได้|Available/i
      );
    });
  });

  describe("Icon Display", () => {
    /**
     * Requirement: WALLET-R01.reward.icon
     * "Display icon for each reward type"
     */
    it("should display icon", async () => {
      const { RewardCard } = await import(
        "@/app/jobsmarket/candidates/[id]/wallet/_components/RewardCard"
      );

      render(<RewardCard reward={mockClaimedReward} />);

      expect(screen.getByTestId("reward-icon")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    /**
     * Requirement: WALLET-R01.a11y
     * "Card should be accessible"
     */
    it("should have proper ARIA attributes", async () => {
      const { RewardCard } = await import(
        "@/app/jobsmarket/candidates/[id]/wallet/_components/RewardCard"
      );

      render(<RewardCard reward={mockClaimedReward} />);

      const card = screen.getByTestId(`reward-card-${mockClaimedReward.id}`);
      expect(card).toHaveAttribute("aria-label");
    });
  });
});
