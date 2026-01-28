/**
 * COMP-R03: CompanyInfoForm Component Tests
 *
 * RED Phase: All tests should FAIL until implementation
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// This import will fail until implementation exists
import { CompanyInfoForm } from "@/app/jobsmarket/companies/[id]/dashboard/settings/_components/profile/CompanyInfoForm";

describe("COMP-R03: CompanyInfoForm Component", () => {
  const mockCompany = {
    uid: "test-company-id",
    company_name: "Test Company",
    company_name_en: "Test Company EN",
    industry: "Technology",
    company_size: "M" as const,
    founded_year: 2020,
    description: "Test description",
  };

  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================
  // Form Fields Tests (~4 tests)
  // ============================================
  describe("Form Fields", () => {
    it("should render all required fields", () => {
      render(
        <CompanyInfoForm
          initialData={mockCompany}
          onSubmit={mockOnSubmit}
          disabled={false}
        />
      );

      // Check that the form renders with all expected fields
      // Use getAllByText for company name since Thai and English labels both contain "ชื่อบริษัท"
      expect(screen.getAllByText(/ชื่อบริษัท/).length).toBeGreaterThanOrEqual(2);
      expect(screen.getByText(/อุตสาหกรรม/i)).toBeInTheDocument();
      expect(screen.getByText(/ขนาดบริษัท/i)).toBeInTheDocument();
      expect(screen.getByText(/ปีที่ก่อตั้ง/i)).toBeInTheDocument();
      expect(screen.getByText(/รายละเอียดบริษัท/i)).toBeInTheDocument();
    });

    it("should populate fields with initial data", () => {
      render(
        <CompanyInfoForm
          initialData={mockCompany}
          onSubmit={mockOnSubmit}
          disabled={false}
        />
      );

      expect(screen.getByDisplayValue("Test Company")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Test Company EN")).toBeInTheDocument();
      expect(screen.getByDisplayValue("2020")).toBeInTheDocument();
    });

    it("should show company size options", () => {
      render(
        <CompanyInfoForm
          initialData={mockCompany}
          onSubmit={mockOnSubmit}
          disabled={false}
        />
      );

      // Company size should have S, M, L options
      const sizeSelect = screen.getByLabelText(/ขนาดบริษัท/i);
      expect(sizeSelect).toBeInTheDocument();
    });

    it("should render textarea for description (not rich text)", () => {
      render(
        <CompanyInfoForm
          initialData={mockCompany}
          onSubmit={mockOnSubmit}
          disabled={false}
        />
      );

      const descriptionField = screen.getByLabelText(/รายละเอียดบริษัท/i);
      expect(descriptionField.tagName).toBe("TEXTAREA");
    });
  });

  // ============================================
  // Validation Tests (~4 tests)
  // ============================================
  describe("Validation", () => {
    it("should show error for empty company name", async () => {
      const user = userEvent.setup();

      render(
        <CompanyInfoForm
          initialData={{ ...mockCompany, company_name: "" }}
          onSubmit={mockOnSubmit}
          disabled={false}
        />
      );

      const submitButton = screen.getByRole("button", { name: /บันทึก/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/กรุณาระบุชื่อบริษัท/i)).toBeInTheDocument();
      });
    });

    it("should validate founded_year is within range", async () => {
      const user = userEvent.setup();

      render(
        <CompanyInfoForm
          initialData={mockCompany}
          onSubmit={mockOnSubmit}
          disabled={false}
        />
      );

      const yearInput = screen.getByRole("spinbutton", { name: /ปีที่ก่อตั้ง/i });
      await user.clear(yearInput);
      await user.type(yearInput, "1700");

      const submitButton = screen.getByRole("button", { name: /บันทึก/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/ปีไม่ถูกต้อง/i)).toBeInTheDocument();
      });
    });

    it("should validate description max length", async () => {
      // Skip typing 5001 characters (too slow)
      // Instead, test by setting the initial value with a long description
      render(
        <CompanyInfoForm
          initialData={{ ...mockCompany, description: "a".repeat(5001) }}
          onSubmit={mockOnSubmit}
          disabled={false}
        />
      );

      const submitButton = screen.getByRole("button", { name: /บันทึก/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/คำอธิบายยาวเกินไป/i)).toBeInTheDocument();
      });
    });

    it("should allow submission with valid data", async () => {
      const user = userEvent.setup();

      render(
        <CompanyInfoForm
          initialData={mockCompany}
          onSubmit={mockOnSubmit}
          disabled={false}
        />
      );

      const submitButton = screen.getByRole("button", { name: /บันทึก/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
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
        <CompanyInfoForm
          initialData={mockCompany}
          onSubmit={mockOnSubmit}
          disabled={false}
        />
      );

      // Use getByDisplayValue to find the company name input
      const nameInput = screen.getByDisplayValue("Test Company");
      await user.clear(nameInput);
      await user.type(nameInput, "Updated Company Name");

      const submitButton = screen.getByRole("button", { name: /บันทึก/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            company_name: "Updated Company Name",
          })
        );
      });
    });

    it("should disable submit button when form is submitting", async () => {
      render(
        <CompanyInfoForm
          initialData={mockCompany}
          onSubmit={mockOnSubmit}
          disabled={false}
          isSubmitting={true}
        />
      );

      const submitButton = screen.getByRole("button", { name: /บันทึก/i });
      expect(submitButton).toBeDisabled();
    });
  });
});
