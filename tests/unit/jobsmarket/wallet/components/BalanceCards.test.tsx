/**
 * @fileoverview Tests for BalanceCards component
 * @specification WALLET-R01 Wallet Page
 * @section §3.2.1 Balance Display
 *
 * Requirements tested:
 * - WALLET-R01.balance.display: Display coin and star balances
 * - WALLET-R01.balance.format: Format numbers with commas
 * - WALLET-R01.balance.loading: Show loading skeleton
 * - WALLET-R01.balance.icons: Display correct currency icons
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// Import the component to test (will fail until implemented)
// import { BalanceCards } from "@/app/jobsmarket/candidates/[id]/wallet/_components/BalanceCards";

describe("BalanceCards", () => {
  const defaultProps = {
    coinBalance: 250,
    starBalance: 50,
    isLoading: false,
    error: null,
  };

  describe("Rendering", () => {
    /**
     * Requirement: WALLET-R01.balance.display
     * "Display coin balance card"
     */
    it("should render coin balance card", async () => {
      const { BalanceCards } = await import(
        "@/app/jobsmarket/candidates/[id]/wallet/_components/BalanceCards"
      );

      render(<BalanceCards {...defaultProps} />);

      expect(screen.getByTestId("coin-balance-card")).toBeInTheDocument();
    });

    /**
     * Requirement: WALLET-R01.balance.display
     * "Display star balance card"
     */
    it("should render star balance card", async () => {
      const { BalanceCards } = await import(
        "@/app/jobsmarket/candidates/[id]/wallet/_components/BalanceCards"
      );

      render(<BalanceCards {...defaultProps} />);

      expect(screen.getByTestId("star-balance-card")).toBeInTheDocument();
    });

    /**
     * Requirement: WALLET-R01.balance.display
     * "Display coin balance value"
     */
    it("should display coin balance value", async () => {
      const { BalanceCards } = await import(
        "@/app/jobsmarket/candidates/[id]/wallet/_components/BalanceCards"
      );

      render(<BalanceCards {...defaultProps} coinBalance={1500} />);

      expect(screen.getByTestId("coin-balance-value")).toHaveTextContent(
        "1,500"
      );
    });

    /**
     * Requirement: WALLET-R01.balance.display
     * "Display star balance value"
     */
    it("should display star balance value", async () => {
      const { BalanceCards } = await import(
        "@/app/jobsmarket/candidates/[id]/wallet/_components/BalanceCards"
      );

      render(<BalanceCards {...defaultProps} starBalance={75} />);

      expect(screen.getByTestId("star-balance-value")).toHaveTextContent("75");
    });
  });

  describe("Formatting", () => {
    /**
     * Requirement: WALLET-R01.balance.format
     * "Format large numbers with commas"
     */
    it("should format coin balance with commas", async () => {
      const { BalanceCards } = await import(
        "@/app/jobsmarket/candidates/[id]/wallet/_components/BalanceCards"
      );

      render(<BalanceCards {...defaultProps} coinBalance={1000000} />);

      expect(screen.getByTestId("coin-balance-value")).toHaveTextContent(
        "1,000,000"
      );
    });

    /**
     * Requirement: WALLET-R01.balance.format
     * "Format star balance with commas"
     */
    it("should format star balance with commas", async () => {
      const { BalanceCards } = await import(
        "@/app/jobsmarket/candidates/[id]/wallet/_components/BalanceCards"
      );

      render(<BalanceCards {...defaultProps} starBalance={10000} />);

      expect(screen.getByTestId("star-balance-value")).toHaveTextContent(
        "10,000"
      );
    });

    /**
     * Requirement: WALLET-R01.balance.format
     * "Display 0 for zero balance"
     */
    it("should display 0 for zero coin balance", async () => {
      const { BalanceCards } = await import(
        "@/app/jobsmarket/candidates/[id]/wallet/_components/BalanceCards"
      );

      render(<BalanceCards {...defaultProps} coinBalance={0} />);

      expect(screen.getByTestId("coin-balance-value")).toHaveTextContent("0");
    });
  });

  describe("Loading State", () => {
    /**
     * Requirement: WALLET-R01.balance.loading
     * "Show skeleton when loading"
     */
    it("should show skeleton when loading", async () => {
      const { BalanceCards } = await import(
        "@/app/jobsmarket/candidates/[id]/wallet/_components/BalanceCards"
      );

      render(<BalanceCards {...defaultProps} isLoading={true} />);

      expect(screen.getByTestId("coin-balance-skeleton")).toBeInTheDocument();
      expect(screen.getByTestId("star-balance-skeleton")).toBeInTheDocument();
    });

    /**
     * Requirement: WALLET-R01.balance.loading
     * "Hide skeleton when loaded"
     */
    it("should hide skeleton when loaded", async () => {
      const { BalanceCards } = await import(
        "@/app/jobsmarket/candidates/[id]/wallet/_components/BalanceCards"
      );

      render(<BalanceCards {...defaultProps} isLoading={false} />);

      expect(
        screen.queryByTestId("coin-balance-skeleton")
      ).not.toBeInTheDocument();
    });
  });

  describe("Currency Labels", () => {
    /**
     * Requirement: WALLET-R01.balance.icons
     * "Display coin label in Thai"
     */
    it("should display coin label", async () => {
      const { BalanceCards } = await import(
        "@/app/jobsmarket/candidates/[id]/wallet/_components/BalanceCards"
      );

      render(<BalanceCards {...defaultProps} />);

      expect(screen.getByText(/เหรียญ|Coins/i)).toBeInTheDocument();
    });

    /**
     * Requirement: WALLET-R01.balance.icons
     * "Display star label in Thai"
     */
    it("should display star label", async () => {
      const { BalanceCards } = await import(
        "@/app/jobsmarket/candidates/[id]/wallet/_components/BalanceCards"
      );

      render(<BalanceCards {...defaultProps} />);

      expect(screen.getByText(/ดาว|Stars/i)).toBeInTheDocument();
    });
  });

  describe("Error State", () => {
    /**
     * Requirement: WALLET-R01.balance.error
     * "Show error message when error occurs"
     */
    it("should show error state when error occurs", async () => {
      const { BalanceCards } = await import(
        "@/app/jobsmarket/candidates/[id]/wallet/_components/BalanceCards"
      );

      render(
        <BalanceCards {...defaultProps} error={new Error("Failed to load")} />
      );

      expect(
        screen.getByText(/ไม่สามารถโหลดยอดคงเหลือได้|Error/i)
      ).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    /**
     * Requirement: WALLET-R01.a11y
     * "Cards should have proper ARIA labels"
     */
    it("should have accessible labels for coin balance", async () => {
      const { BalanceCards } = await import(
        "@/app/jobsmarket/candidates/[id]/wallet/_components/BalanceCards"
      );

      render(<BalanceCards {...defaultProps} coinBalance={250} />);

      const coinCard = screen.getByTestId("coin-balance-card");
      expect(coinCard).toHaveAttribute("aria-label");
    });

    /**
     * Requirement: WALLET-R01.a11y
     * "Cards should have proper ARIA labels"
     */
    it("should have accessible labels for star balance", async () => {
      const { BalanceCards } = await import(
        "@/app/jobsmarket/candidates/[id]/wallet/_components/BalanceCards"
      );

      render(<BalanceCards {...defaultProps} starBalance={50} />);

      const starCard = screen.getByTestId("star-balance-card");
      expect(starCard).toHaveAttribute("aria-label");
    });
  });
});
