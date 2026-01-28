/**
 * COMP-R03: LogoUploader Component Tests
 *
 * RED Phase: All tests should FAIL until implementation
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// This import will fail until implementation exists
import { LogoUploader } from "@/app/jobsmarket/companies/[id]/dashboard/settings/_components/profile/LogoUploader";

describe("COMP-R03: LogoUploader Component", () => {
  const mockOnUpload = vi.fn();
  const mockOnRemove = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================
  // Rendering Tests (~2 tests)
  // ============================================
  describe("Rendering", () => {
    it("should render upload area when no logo exists", () => {
      render(
        <LogoUploader
          currentLogo={undefined}
          onUpload={mockOnUpload}
          onRemove={mockOnRemove}
          disabled={false}
        />
      );

      expect(screen.getByText(/อัพโหลดโลโก้/i)).toBeInTheDocument();
      expect(screen.getByText(/JPG, PNG/i)).toBeInTheDocument();
    });

    it("should show current logo preview when exists", () => {
      render(
        <LogoUploader
          currentLogo="https://example.com/logo.png"
          onUpload={mockOnUpload}
          onRemove={mockOnRemove}
          disabled={false}
        />
      );

      const img = screen.getByRole("img", { name: /logo/i });
      expect(img).toHaveAttribute("src", expect.stringContaining("logo.png"));
    });
  });

  // ============================================
  // Upload Tests (~2 tests)
  // ============================================
  describe("Upload", () => {
    it("should call onUpload when file is selected", async () => {
      const user = userEvent.setup();
      const file = new File(["test"], "logo.png", { type: "image/png" });

      render(
        <LogoUploader
          currentLogo={undefined}
          onUpload={mockOnUpload}
          onRemove={mockOnRemove}
          disabled={false}
        />
      );

      const input = screen.getByLabelText(/อัพโหลดโลโก้/i);
      await user.upload(input, file);

      expect(mockOnUpload).toHaveBeenCalledWith(file);
    });

    it("should show upload progress", async () => {
      render(
        <LogoUploader
          currentLogo={undefined}
          onUpload={mockOnUpload}
          onRemove={mockOnRemove}
          disabled={false}
          uploadProgress={50}
          isUploading={true}
        />
      );

      expect(screen.getByText(/50%/)).toBeInTheDocument();
    });
  });

  // ============================================
  // Remove Tests (~2 tests)
  // ============================================
  describe("Remove", () => {
    it("should show remove button when logo exists", () => {
      render(
        <LogoUploader
          currentLogo="https://example.com/logo.png"
          onUpload={mockOnUpload}
          onRemove={mockOnRemove}
          disabled={false}
        />
      );

      expect(screen.getByRole("button", { name: /ลบ/i })).toBeInTheDocument();
    });

    it("should call onRemove when remove button clicked", async () => {
      const user = userEvent.setup();

      render(
        <LogoUploader
          currentLogo="https://example.com/logo.png"
          onUpload={mockOnUpload}
          onRemove={mockOnRemove}
          disabled={false}
        />
      );

      await user.click(screen.getByRole("button", { name: /ลบ/i }));

      expect(mockOnRemove).toHaveBeenCalled();
    });
  });
});
