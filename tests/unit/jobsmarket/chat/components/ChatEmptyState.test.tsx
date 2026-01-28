/**
 * Unit Tests for ChatEmptyState Component
 * Per CHAT-R01 RIS §3.4 Empty States
 *
 * RED Phase: These tests should FAIL because the component doesn't exist yet.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

// This import will fail in RED phase - component doesn't exist yet
import { ChatEmptyState } from "@/components/jobsmarket/chat/ChatEmptyState";

describe("ChatEmptyState", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('type: candidate', () => {
    it('should render "ยังไม่มีการสนทนา" heading', () => {
      render(<ChatEmptyState type="candidate" />);

      expect(screen.getByText("ยังไม่มีการสนทนา")).toBeInTheDocument();
    });

    it('should render "สมัครงานเพื่อเริ่มแชท" description', () => {
      render(<ChatEmptyState type="candidate" />);

      expect(screen.getByText("สมัครงานเพื่อเริ่มแชท")).toBeInTheDocument();
    });

    it("should render illustration", () => {
      render(<ChatEmptyState type="candidate" />);

      expect(screen.getByTestId("empty-illustration")).toBeInTheDocument();
    });

    it("should render browse jobs button", () => {
      render(<ChatEmptyState type="candidate" />);

      const button = screen.getByRole("link", { name: /ค้นหางาน/ });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute("href", "/jobsmarket/jobs");
    });
  });

  describe('type: company', () => {
    it('should render "ยังไม่มีการสนทนา" heading', () => {
      render(<ChatEmptyState type="company" />);

      expect(screen.getByText("ยังไม่มีการสนทนา")).toBeInTheDocument();
    });

    it('should render "รอผู้สมัครติดต่อ" description', () => {
      render(<ChatEmptyState type="company" />);

      expect(screen.getByText("รอผู้สมัครติดต่อ")).toBeInTheDocument();
    });

    it("should render company-specific illustration", () => {
      render(<ChatEmptyState type="company" />);

      expect(screen.getByTestId("empty-illustration")).toBeInTheDocument();
    });

    it("should render view applications button", () => {
      render(<ChatEmptyState type="company" />);

      const button = screen.getByRole("link", { name: /ดูใบสมัคร/ });
      expect(button).toBeInTheDocument();
    });
  });

  describe('type: no_selected', () => {
    it('should render "เลือกการสนทนาเพื่อเริ่มแชท" message', () => {
      render(<ChatEmptyState type="no_selected" />);

      expect(screen.getByText("เลือกการสนทนาเพื่อเริ่มแชท")).toBeInTheDocument();
    });

    it("should not render action buttons", () => {
      render(<ChatEmptyState type="no_selected" />);

      expect(screen.queryByRole("link")).not.toBeInTheDocument();
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("should render select illustration", () => {
      render(<ChatEmptyState type="no_selected" />);

      expect(screen.getByTestId("empty-illustration")).toBeInTheDocument();
    });
  });

  describe('type: no_results', () => {
    it("should render search query in message", () => {
      render(<ChatEmptyState type="no_results" searchQuery="บริษัท ABC" />);

      expect(
        screen.getByText(/ไม่พบการสนทนาที่ตรงกับ/)
      ).toBeInTheDocument();
      expect(screen.getByText(/"บริษัท ABC"/)).toBeInTheDocument();
    });

    it("should render clear search button", () => {
      const onClearSearch = vi.fn();
      render(
        <ChatEmptyState
          type="no_results"
          searchQuery="test"
          onClearSearch={onClearSearch}
        />
      );

      const button = screen.getByRole("button", { name: /ล้างการค้นหา/ });
      expect(button).toBeInTheDocument();
    });

    it("should call onClearSearch when clear button clicked", () => {
      const onClearSearch = vi.fn();
      render(
        <ChatEmptyState
          type="no_results"
          searchQuery="test"
          onClearSearch={onClearSearch}
        />
      );

      const button = screen.getByRole("button", { name: /ล้างการค้นหา/ });
      fireEvent.click(button);

      expect(onClearSearch).toHaveBeenCalled();
    });

    it("should render no-results illustration", () => {
      render(<ChatEmptyState type="no_results" searchQuery="test" />);

      expect(screen.getByTestId("empty-illustration")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have appropriate heading level", () => {
      render(<ChatEmptyState type="candidate" />);

      expect(screen.getByRole("heading", { level: 3 })).toBeInTheDocument();
    });

    it("should have aria-live for dynamic content", () => {
      render(<ChatEmptyState type="no_results" searchQuery="test" />);

      const container = screen.getByTestId("chat-empty-state");
      expect(container).toHaveAttribute("aria-live", "polite");
    });
  });

  describe("Styling", () => {
    it("should apply custom className", () => {
      render(<ChatEmptyState type="candidate" className="custom-class" />);

      const container = screen.getByTestId("chat-empty-state");
      expect(container).toHaveClass("custom-class");
    });

    it("should be centered", () => {
      render(<ChatEmptyState type="candidate" />);

      const container = screen.getByTestId("chat-empty-state");
      expect(container).toHaveClass("flex");
      expect(container).toHaveClass("items-center");
      expect(container).toHaveClass("justify-center");
    });
  });
});
