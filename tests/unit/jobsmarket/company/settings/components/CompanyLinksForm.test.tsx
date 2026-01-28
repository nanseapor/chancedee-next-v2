/**
 * COMP-R03: CompanyLinksForm Component Tests
 *
 * RED Phase: All tests should FAIL until implementation
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// This import will fail until implementation exists
import { CompanyLinksForm } from "@/app/jobsmarket/companies/[id]/dashboard/settings/_components/profile/CompanyLinksForm";

describe("COMP-R03: CompanyLinksForm Component", () => {
  const mockInitialData = {
    website: "https://example.com",
    facebook: "https://facebook.com/example",
    linkedin: "https://linkedin.com/company/example",
  };

  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================
  // Form Fields Tests (~2 tests)
  // ============================================
  describe("Form Fields", () => {
    it("should render all link fields", () => {
      render(
        <CompanyLinksForm
          initialData={mockInitialData}
          onSubmit={mockOnSubmit}
          disabled={false}
        />
      );

      expect(screen.getByLabelText(/เว็บไซต์/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Facebook/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/LinkedIn/i)).toBeInTheDocument();
    });

    it("should populate fields with initial data", () => {
      render(
        <CompanyLinksForm
          initialData={mockInitialData}
          onSubmit={mockOnSubmit}
          disabled={false}
        />
      );

      expect(screen.getByDisplayValue("https://example.com")).toBeInTheDocument();
      expect(screen.getByDisplayValue("https://facebook.com/example")).toBeInTheDocument();
    });
  });

  // ============================================
  // Validation Tests (~2 tests)
  // ============================================
  describe("Validation", () => {
    it("should validate URL format for website", async () => {
      const user = userEvent.setup();

      render(
        <CompanyLinksForm
          initialData={mockInitialData}
          onSubmit={mockOnSubmit}
          disabled={false}
        />
      );

      const websiteInput = screen.getByLabelText(/เว็บไซต์/i);
      await user.clear(websiteInput);
      await user.type(websiteInput, "not-a-valid-url");

      const submitButton = screen.getByRole("button", { name: /บันทึก/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/รูปแบบ URL ไม่ถูกต้อง/i)).toBeInTheDocument();
      });
    });

    it("should allow empty URLs to clear links", async () => {
      const user = userEvent.setup();

      render(
        <CompanyLinksForm
          initialData={mockInitialData}
          onSubmit={mockOnSubmit}
          disabled={false}
        />
      );

      const websiteInput = screen.getByLabelText(/เว็บไซต์/i);
      await user.clear(websiteInput);

      const submitButton = screen.getByRole("button", { name: /บันทึก/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            website: "",
          })
        );
      });
    });
  });

  // ============================================
  // Submit Tests (~2 tests)
  // ============================================
  describe("Submit", () => {
    it("should call onSubmit with form data", async () => {
      const user = userEvent.setup();

      render(
        <CompanyLinksForm
          initialData={mockInitialData}
          onSubmit={mockOnSubmit}
          disabled={false}
        />
      );

      const submitButton = screen.getByRole("button", { name: /บันทึก/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(mockInitialData);
      });
    });

    it("should disable form when disabled prop is true", () => {
      render(
        <CompanyLinksForm
          initialData={mockInitialData}
          onSubmit={mockOnSubmit}
          disabled={true}
        />
      );

      expect(screen.getByLabelText(/เว็บไซต์/i)).toBeDisabled();
      expect(screen.getByRole("button", { name: /บันทึก/i })).toBeDisabled();
    });
  });
});
