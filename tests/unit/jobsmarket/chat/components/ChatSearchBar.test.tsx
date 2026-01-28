/**
 * Unit Tests for ChatSearchBar Component
 * Per CHAT-R01 RIS §3.3 Search Functionality
 *
 * RED Phase: These tests should FAIL because the component doesn't exist yet.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// This import will fail in RED phase - component doesn't exist yet
import { ChatSearchBar } from "@/components/jobsmarket/chat/ChatSearchBar";

describe("ChatSearchBar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render search input", () => {
      render(<ChatSearchBar onSearch={vi.fn()} />);

      const input = screen.getByRole("searchbox");
      expect(input).toBeInTheDocument();
    });

    it('should have placeholder "ค้นหาการสนทนา..."', () => {
      render(<ChatSearchBar onSearch={vi.fn()} />);

      const input = screen.getByPlaceholderText("ค้นหาการสนทนา...");
      expect(input).toBeInTheDocument();
    });

    it("should render search icon", () => {
      render(<ChatSearchBar onSearch={vi.fn()} />);

      expect(screen.getByTestId("search-icon")).toBeInTheDocument();
    });
  });

  describe("Search Functionality", () => {
    it("should call onSearch when typing", async () => {
      const user = userEvent.setup();
      const onSearch = vi.fn();

      render(<ChatSearchBar onSearch={onSearch} />);

      const input = screen.getByRole("searchbox");
      await user.type(input, "บริษัท");

      // Should debounce, so wait a bit
      await waitFor(() => {
        expect(onSearch).toHaveBeenCalledWith("บริษัท");
      });
    });

    it("should debounce search calls", async () => {
      const user = userEvent.setup();
      const onSearch = vi.fn();

      render(<ChatSearchBar onSearch={onSearch} debounceMs={300} />);

      const input = screen.getByRole("searchbox");

      // Type quickly
      await user.type(input, "test");

      // Should not have called immediately for each character
      expect(onSearch).not.toHaveBeenCalledTimes(4);

      // Wait for debounce
      await waitFor(
        () => {
          expect(onSearch).toHaveBeenCalledWith("test");
        },
        { timeout: 500 }
      );
    });

    it("should call onSearch immediately when debounceMs is 0", async () => {
      const user = userEvent.setup();
      const onSearch = vi.fn();

      render(<ChatSearchBar onSearch={onSearch} debounceMs={0} />);

      const input = screen.getByRole("searchbox");
      await user.type(input, "a");

      expect(onSearch).toHaveBeenCalledWith("a");
    });
  });

  describe("Clear Button", () => {
    it("should show clear button when query is not empty", async () => {
      const user = userEvent.setup();
      render(<ChatSearchBar onSearch={vi.fn()} />);

      const input = screen.getByRole("searchbox");
      await user.type(input, "test");

      expect(screen.getByTestId("clear-button")).toBeInTheDocument();
    });

    it("should hide clear button when query is empty", () => {
      render(<ChatSearchBar onSearch={vi.fn()} />);

      expect(screen.queryByTestId("clear-button")).not.toBeInTheDocument();
    });

    it("should clear query when clear button clicked", async () => {
      const user = userEvent.setup();
      const onSearch = vi.fn();

      render(<ChatSearchBar onSearch={onSearch} />);

      const input = screen.getByRole("searchbox");
      await user.type(input, "test");

      const clearButton = screen.getByTestId("clear-button");
      await user.click(clearButton);

      expect(input).toHaveValue("");
      await waitFor(() => {
        expect(onSearch).toHaveBeenCalledWith("");
      });
    });

    it("should focus input after clearing", async () => {
      const user = userEvent.setup();
      render(<ChatSearchBar onSearch={vi.fn()} />);

      const input = screen.getByRole("searchbox");
      await user.type(input, "test");

      const clearButton = screen.getByTestId("clear-button");
      await user.click(clearButton);

      expect(input).toHaveFocus();
    });
  });

  describe("Controlled Mode", () => {
    it("should support controlled value", () => {
      render(<ChatSearchBar onSearch={vi.fn()} value="controlled" />);

      const input = screen.getByRole("searchbox");
      expect(input).toHaveValue("controlled");
    });

    it("should call onChange when in controlled mode", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(<ChatSearchBar onSearch={vi.fn()} value="" onChange={onChange} />);

      const input = screen.getByRole("searchbox");
      await user.type(input, "a");

      expect(onChange).toHaveBeenCalled();
    });
  });

  describe("Accessibility", () => {
    it("should have aria-label", () => {
      render(<ChatSearchBar onSearch={vi.fn()} />);

      const input = screen.getByRole("searchbox");
      expect(input).toHaveAttribute("aria-label", "ค้นหาการสนทนา");
    });

    it("should have correct role", () => {
      render(<ChatSearchBar onSearch={vi.fn()} />);

      expect(screen.getByRole("search")).toBeInTheDocument();
    });

    it("should support keyboard navigation", async () => {
      const user = userEvent.setup();
      const onSearch = vi.fn();

      render(<ChatSearchBar onSearch={onSearch} />);

      const input = screen.getByRole("searchbox");
      await user.type(input, "test");
      await user.keyboard("{Escape}");

      // Escape should clear the search
      expect(input).toHaveValue("");
    });
  });

  describe("Loading State", () => {
    it("should show loading indicator when isLoading is true", () => {
      render(<ChatSearchBar onSearch={vi.fn()} isLoading={true} />);

      expect(screen.getByTestId("search-loading")).toBeInTheDocument();
    });

    it("should hide loading indicator when isLoading is false", () => {
      render(<ChatSearchBar onSearch={vi.fn()} isLoading={false} />);

      expect(screen.queryByTestId("search-loading")).not.toBeInTheDocument();
    });
  });

  describe("Styling", () => {
    it("should apply custom className", () => {
      render(<ChatSearchBar onSearch={vi.fn()} className="custom-class" />);

      const container = screen.getByRole("search");
      expect(container).toHaveClass("custom-class");
    });
  });
});
