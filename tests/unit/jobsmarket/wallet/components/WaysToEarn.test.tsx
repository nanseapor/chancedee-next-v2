/**
 * @fileoverview Tests for WaysToEarn component
 * @specification WALLET-R01 Wallet Page
 * @section §3.2.3 Ways to Earn
 *
 * Requirements tested:
 * - WALLET-R01.earn.display: Display all reward opportunities
 * - WALLET-R01.earn.status: Show claimed/available status
 * - WALLET-R01.earn.amounts: Display correct coin amounts
 * - WALLET-R01.earn.loading: Handle loading state
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// Import the component to test (will fail until implemented)
// import { WaysToEarn } from "@/app/jobsmarket/candidates/[id]/wallet/_components/WaysToEarn";

describe("WaysToEarn", () => {
  const mockRewards = [
    {
      id: "signup",
      titleTh: "สมัครสมาชิก",
      titleEn: "Sign Up Bonus",
      amount: 100,
      claimed: true,
    },
    {
      id: "first_interview",
      titleTh: "สัมภาษณ์ครั้งแรก",
      titleEn: "First Interview",
      amount: 100,
      claimed: true,
    },
    {
      id: "first_application",
      titleTh: "สมัครงานครั้งแรก",
      titleEn: "First Application",
      amount: 100,
      claimed: false,
    },
    {
      id: "referral",
      titleTh: "แนะนำเพื่อน",
      titleEn: "Referral Bonus",
      amount: 100,
      claimed: false,
      available: true,
    },
  ];

  const defaultProps = {
    rewards: mockRewards,
    isLoading: false,
  };

  describe("Rendering", () => {
    /**
     * Requirement: WALLET-R01.earn.display
     * "Display ways to earn section"
     */
    it("should render ways to earn section", async () => {
      const { WaysToEarn } = await import(
        "@/app/jobsmarket/candidates/[id]/wallet/_components/WaysToEarn"
      );

      render(<WaysToEarn {...defaultProps} />);

      expect(screen.getByTestId("ways-to-earn")).toBeInTheDocument();
    });

    /**
     * Requirement: WALLET-R01.earn.display
     * "Display section header"
     */
    it("should show section header", async () => {
      const { WaysToEarn } = await import(
        "@/app/jobsmarket/candidates/[id]/wallet/_components/WaysToEarn"
      );

      render(<WaysToEarn {...defaultProps} />);

      expect(
        screen.getByText(/วิธีหาเหรียญ|Ways to Earn/i)
      ).toBeInTheDocument();
    });

    /**
     * Requirement: WALLET-R01.earn.display
     * "Display all reward items"
     */
    it("should display all reward items", async () => {
      const { WaysToEarn } = await import(
        "@/app/jobsmarket/candidates/[id]/wallet/_components/WaysToEarn"
      );

      render(<WaysToEarn {...defaultProps} />);

      expect(screen.getByTestId("reward-card-signup")).toBeInTheDocument();
      expect(
        screen.getByTestId("reward-card-first_interview")
      ).toBeInTheDocument();
      expect(
        screen.getByTestId("reward-card-first_application")
      ).toBeInTheDocument();
      expect(screen.getByTestId("reward-card-referral")).toBeInTheDocument();
    });
  });

  describe("Reward Amounts", () => {
    /**
     * Requirement: WALLET-R01.earn.amounts
     * "Display correct amounts per BLS-10"
     */
    it("should display 100 coins for signup", async () => {
      const { WaysToEarn } = await import(
        "@/app/jobsmarket/candidates/[id]/wallet/_components/WaysToEarn"
      );

      render(<WaysToEarn {...defaultProps} />);

      const signupCard = screen.getByTestId("reward-card-signup");
      expect(signupCard).toHaveTextContent("100");
    });

    /**
     * Requirement: WALLET-R01.earn.amounts
     * "Display correct amounts per BLS-10"
     */
    it("should display 100 coins for first interview", async () => {
      const { WaysToEarn } = await import(
        "@/app/jobsmarket/candidates/[id]/wallet/_components/WaysToEarn"
      );

      render(<WaysToEarn {...defaultProps} />);

      const interviewCard = screen.getByTestId("reward-card-first_interview");
      expect(interviewCard).toHaveTextContent("100");
    });

    /**
     * Requirement: WALLET-R01.earn.amounts
     * "Display correct amounts per BLS-10"
     */
    it("should display 100 coins for first application", async () => {
      const { WaysToEarn } = await import(
        "@/app/jobsmarket/candidates/[id]/wallet/_components/WaysToEarn"
      );

      render(<WaysToEarn {...defaultProps} />);

      const applicationCard = screen.getByTestId(
        "reward-card-first_application"
      );
      expect(applicationCard).toHaveTextContent("100");
    });

    /**
     * Requirement: WALLET-R01.earn.amounts
     * "Display correct amounts per BLS-10"
     */
    it("should display 100 coins for referral", async () => {
      const { WaysToEarn } = await import(
        "@/app/jobsmarket/candidates/[id]/wallet/_components/WaysToEarn"
      );

      render(<WaysToEarn {...defaultProps} />);

      const referralCard = screen.getByTestId("reward-card-referral");
      expect(referralCard).toHaveTextContent("100");
    });
  });

  describe("Loading State", () => {
    /**
     * Requirement: WALLET-R01.earn.loading
     * "Show skeleton when loading"
     */
    it("should show skeleton when loading", async () => {
      const { WaysToEarn } = await import(
        "@/app/jobsmarket/candidates/[id]/wallet/_components/WaysToEarn"
      );

      render(<WaysToEarn rewards={[]} isLoading={true} />);

      expect(screen.getByTestId("ways-to-earn-skeleton")).toBeInTheDocument();
    });
  });

  describe("Thai Labels", () => {
    /**
     * Requirement: WALLET-R01.earn.display
     * "Display Thai labels for rewards"
     */
    it("should display Thai labels", async () => {
      const { WaysToEarn } = await import(
        "@/app/jobsmarket/candidates/[id]/wallet/_components/WaysToEarn"
      );

      render(<WaysToEarn {...defaultProps} />);

      expect(screen.getByText("สมัครสมาชิก")).toBeInTheDocument();
      expect(screen.getByText("สัมภาษณ์ครั้งแรก")).toBeInTheDocument();
      expect(screen.getByText("สมัครงานครั้งแรก")).toBeInTheDocument();
      expect(screen.getByText("แนะนำเพื่อน")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    /**
     * Requirement: WALLET-R01.a11y
     * "Section should have proper heading"
     */
    it("should have proper heading level", async () => {
      const { WaysToEarn } = await import(
        "@/app/jobsmarket/candidates/[id]/wallet/_components/WaysToEarn"
      );

      render(<WaysToEarn {...defaultProps} />);

      expect(screen.getByRole("heading")).toBeInTheDocument();
    });
  });
});
